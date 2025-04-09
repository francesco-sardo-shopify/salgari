import { ReactReader } from "react-reader";
import { useState } from "react";
import type { Route } from "./+types/library.$id.read";
import { ebooks } from "~/database/schema";
import { eq } from "drizzle-orm";
import { Navigation } from "~/components/Navigation";
import { useFetcher } from "react-router";

export function meta({ data }: Route.MetaArgs) {
  const { book } = data;
  const { title } = book;
  return [
    { title: `${title} - E-Book Library` },
    { name: "description", content: `Read ${title}` },
  ];
}

export async function loader({ params, context }: Route.LoaderArgs) {
  const { id } = params;
  const { db } = context;
  const book = await db.query.ebooks.findFirst({ where: eq(ebooks.id, id) });
  if (!book) {
    return new Response("Not Found", { status: 404 });
  }
  return { book };
}

export async function action({ params, context, request }: Route.ActionArgs) {
  const { id } = params;
  const { db } = context;
  let formData = await request.formData();
  let progress = formData.get("progress");

  if (!progress) {
    return new Response("Bad Request", { status: 400 });
  }

  await db
    .update(ebooks)
    .set({
      progress: progress!.toString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(ebooks.id, id));

  return new Response("OK", { status: 200 });
}

export default function ReaderPage({ loaderData }: Route.ComponentProps) {
  const { book } = loaderData;
  const { id, title, progress } = book;
  const [location, setLocation] = useState<string | number>(progress || 0);
  const fetcher = useFetcher();

  const handleLocationChanged = async (newLocation: string | number) => {
    setLocation(newLocation);
    fetcher.submit(
      { progress: newLocation.toString() },
      { action: `/library/${id}/read`, method: "post" }
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      <div className="flex-1 w-full">
        <ReactReader
          url={`/library/${id}.epub`}
          title={title}
          location={location}
          locationChanged={handleLocationChanged}
        />
      </div>
    </div>
  );
}
