import { ReactReader } from "react-reader";
import { useState } from "react";
import type { Route } from "./+types/library.$id.read";
import { ebooks } from "~/database/schema";
import { eq } from "drizzle-orm";
import { Navigation } from "~/components/Navigation";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { id } = params;
  const { db } = context;
  const book = await db.query.ebooks.findFirst({ where: eq(ebooks.id, id) });
  if (!book) {
    return new Response("Book not found", { status: 404 });
  }
  return { book };
}

export default function ReaderPage({loaderData}: Route.ComponentProps) {
  const { book } = loaderData;
  const {id, title} = book;
  const url = `/library/${book.id}.epub`;
  const [location, setLocation] = useState<string | number>(0);

  return (
    <div className="container mx-auto p-4">
      <Navigation bookId={id} />
      <div className="w-full h-screen">
        <ReactReader
          url={url}
          title={title}
          location={location}
          locationChanged={setLocation}
        />
      </div>
    </div>
  );
}
