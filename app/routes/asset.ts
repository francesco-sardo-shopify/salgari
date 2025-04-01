import type { Route } from "./+types/asset";

export async function loader({ params, context }: Route.LoaderArgs) {
  const id = params.id;
  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    // Get file from R2
    const r2 = context.cloudflare.env.R2;
    const file = await r2.get(id);

    if (!file) {
      return new Response("File not found", { status: 404 });
    }

    // Determine content type based on file extension
    let contentType = "application/octet-stream";
    if (id.endsWith(".epub")) contentType = "application/epub+zip";
    if (id.endsWith(".txt")) contentType = "text/plain";
    if (id.endsWith(".cover")) contentType = "image/jpeg";

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