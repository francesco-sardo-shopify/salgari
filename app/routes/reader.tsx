import { ReactReader } from "react-reader";
import { useState } from "react";
import type { Route } from "./+types/reader";
import { ebooks } from "~/database/schema";
import { eq } from "drizzle-orm";
import { Link } from "react-router";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { id } = params;
  const { db } = context;
  const book = await db.query.ebooks.findFirst({ where: eq(ebooks.id, id) });
  if (!book) {
    return new Response("Book not found", { status: 404 });
  }
  return { book };
}

export default function ReaderPage({
  params,
  loaderData,
}: Route.ComponentProps) {
  const { id } = params;
  const { book } = loaderData;
  const epubUrl = `/asset/${id}.epub`;
  const [location, setLocation] = useState<string | number>(0);

  return (
    <div className="container mx-auto p-4">
      <nav className="p-4 bg-gray-100">
        <div className="container mx-auto flex gap-4">
          <Link to="/" className="hover:underline">
            Back
          </Link>
        </div>
      </nav>
      <div className="w-full h-screen">
        <ReactReader
          url={epubUrl}
          title={book.title}
          location={location}
          locationChanged={setLocation}
        />
      </div>
    </div>
  );
}