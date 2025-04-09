import {
  Form,
  useActionData,
  useNavigate,
  redirect,
  useNavigation,
} from "react-router";
import * as schema from "~/database/schema";
import type { InferInsertModel } from "drizzle-orm";
import type { Route } from "./+types/library.new";
import { nanoid } from "nanoid";
import JSZip from "jszip";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { DOMParser, XMLSerializer } from "xmldom";
import { Navigation } from "~/components/Navigation";

// Function to convert EPUB to text content
async function convertEpubToText(fileBuffer: ArrayBuffer): Promise<{
  text: string;
  metadata: {
    title: string;
    creator: string;
    coverPath?: string;
  };
}> {
  // Load the EPUB file with JSZip
  const zip = new JSZip();
  const contents = await zip.loadAsync(fileBuffer);

  // First, find and parse the container.xml file to locate the OPF file
  const containerXml = await contents
    .file("META-INF/container.xml")
    ?.async("string");
  if (!containerXml) {
    throw new Error("Invalid EPUB: container.xml not found");
  }

  // Parse the container XML to find the OPF file path
  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, "application/xml");
  const rootfilePath = containerDoc
    .getElementsByTagName("rootfile")[0]
    ?.getAttribute("full-path");

  if (!rootfilePath) {
    throw new Error("Invalid EPUB: rootfile path not found");
  }

  // Get the directory of the OPF file
  const opfDir = rootfilePath.split("/").slice(0, -1).join("/");
  const opfDirWithTrailingSlash = opfDir ? `${opfDir}/` : "";

  // Read and parse the OPF file
  const opfContent = await contents.file(rootfilePath)?.async("string");
  if (!opfContent) {
    throw new Error(`Invalid EPUB: OPF file not found at ${rootfilePath}`);
  }

  const opfDoc = parser.parseFromString(opfContent, "application/xml");

  // Extract metadata
  const title =
    opfDoc.getElementsByTagName("dc:title")[0]?.textContent || "Untitled";
  const creator =
    opfDoc.getElementsByTagName("dc:creator")[0]?.textContent ||
    "Unknown Author";

  // Get the spine items (reading order)
  const spine = opfDoc.getElementsByTagName("spine")[0];
  const itemrefs = spine.getElementsByTagName("itemref");

  // Get the manifest items (all content files)
  const manifest = opfDoc.getElementsByTagName("manifest")[0];
  const items = manifest.getElementsByTagName("item");

  // Create a map of id to href from the manifest
  const idToHref: Record<string, string> = {};
  const idToMediaType: Record<string, string> = {};

  // Try to find cover image
  let coverPath: string | undefined;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    const mediaType = item.getAttribute("media-type");
    const properties = item.getAttribute("properties");

    // Check if this item is a cover image
    if (
      id?.includes("cover") ||
      href?.includes("cover") ||
      properties === "cover-image"
    ) {
      if (mediaType?.startsWith("image/")) {
        coverPath = `${opfDirWithTrailingSlash}${href}`;
      }
    }

    if (id && href) {
      idToHref[id] = href;
      if (mediaType) {
        idToMediaType[id] = mediaType;
      }
    }
  }

  const nhm = new NodeHtmlMarkdown(
    {
      bulletMarker: "-",
      codeBlockStyle: "fenced",
      ignore: ["img"],
    },
    {
      a: ({ node }) => ({ content: node.textContent! }),
    }
  );

  // Start building the markdown content
  let markdownContent = `${title}\n\n`;
  markdownContent += `By: ${creator}\n\n`;
  markdownContent += `---\n\n`;

  // Process each spine item in reading order
  for (let i = 0; i < itemrefs.length; i++) {
    const itemref = itemrefs[i];
    const idref = itemref.getAttribute("idref");

    if (idref && idToHref[idref]) {
      const href = idToHref[idref];
      const mediaType = idToMediaType[idref] || "";

      // Only process HTML/XHTML content
      if (
        mediaType.includes("html") ||
        href.endsWith(".html") ||
        href.endsWith(".xhtml")
      ) {
        const filePath = `${opfDirWithTrailingSlash}${href}`;
        const contentFile = await contents.file(filePath)?.async("string");

        if (contentFile) {
          try {
            // Parse the HTML content
            const contentDoc = parser.parseFromString(contentFile, "text/html");

            // Extract the body content
            const body = contentDoc.getElementsByTagName("body")[0];

            if (body) {
              // Convert HTML to string
              const serializer = new XMLSerializer();
              const bodyHtml = serializer.serializeToString(body);

              // Convert HTML to Markdown
              const markdown = nhm.translate(bodyHtml);

              // Add to the markdown content
              markdownContent += `${markdown}\n\n`;
            }
          } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
          }
        }
      }
    }
  }

  return {
    text: markdownContent,
    metadata: {
      title,
      creator,
      coverPath,
    },
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const ebookFile = formData.get("ebookFile") as File | null;
  const { R2 } = context.cloudflare.env;

  if (!ebookFile) {
    return { error: "EPUB file is required" };
  }

  if (!ebookFile.name.toLowerCase().endsWith(".epub")) {
    return { error: "Please upload an EPUB file" };
  }

  try {
    // Generate a unique ID for the ebook
    const ebookId = nanoid();
    const now = new Date().toISOString();

    // Read the file as ArrayBuffer
    const fileBuffer = await ebookFile.arrayBuffer();

    // Extract metadata and convert to text
    const { text, metadata } = await convertEpubToText(fileBuffer);

    // Create R2 storage keys
    const epubKey = `${ebookId}.epub`;
    const textKey = `${ebookId}.txt`;
    const coverKey = `${ebookId}.cover`;

    // Upload the EPUB file to R2
    await R2.put(epubKey, fileBuffer);

    // Upload the extracted text to R2
    await R2.put(textKey, text);

    // Upload the cover image if found
    if (metadata.coverPath) {
      const coverFileData = await new JSZip()
        .loadAsync(fileBuffer)
        .then((zip) => zip.file(metadata.coverPath!)?.async("arraybuffer"));

      if (coverFileData) {
        await R2.put(coverKey, coverFileData);
      }
    }

    // Create database record
    const newEbook: InferInsertModel<typeof schema.ebooks> = {
      id: ebookId,
      title: metadata.title.trim(),
      authors: metadata.creator.trim(),
      createdAt: now,
      updatedAt: now,
      location: "0",
      currentText: "",
    };

    // Save the ebook in the database
    await context.db.insert(schema.ebooks).values(newEbook).returning();

    return redirect(`/library/${ebookId}/read`);
  } catch (error) {
    console.error("Error processing EPUB:", error);
    return { error: "Failed to process EPUB file. Please try again." };
  }
}

export function meta() {
  return [
    { title: "Add New E-Book" },
    { name: "description", content: "Add a new e-book to your library" },
  ];
}

export default function AddEbook() {
  const actionData = useActionData<{ error?: string }>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-md">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
              Add New E-Book
            </h1>
          </header>

          <Form
            method="post"
            className="w-full space-y-6"
            encType="multipart/form-data"
          >
            <div className="space-y-2">
              <label
                htmlFor="ebookFile"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Upload EPUB File
              </label>
              <input
                type="file"
                id="ebookFile"
                name="ebookFile"
                accept=".epub"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload an EPUB file. Title and author information will be
                extracted automatically.
              </p>
            </div>

            {actionData?.error && (
              <div className="text-red-500 text-sm mt-2">{actionData.error}</div>
            )}

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Processing..." : "Upload E-Book"}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
