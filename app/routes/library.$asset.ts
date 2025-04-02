import type { Route } from "./+types/library.$asset";

export async function loader({ params, context }: Route.LoaderArgs) {
  const {asset} = params;  
  if (!asset) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    // Get file from R2
    const {R2} = context.cloudflare.env;
    const file = await R2.get(asset);

    if (!file) {
      return new Response("File not found", { status: 404 });
    }

    // Determine content type based on file extension
    let contentType = "application/octet-stream";
    if (asset.endsWith(".epub")) contentType = "application/epub+zip";
    if (asset.endsWith(".txt")) contentType = "text/plain";
    if (asset.endsWith(".cover")) contentType = "image/jpeg";

    // Return file with proper headers
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", file.size.toString());
    headers.set("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

    return new Response(file.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving asset:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 