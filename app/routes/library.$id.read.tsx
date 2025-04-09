import { ReactReader } from "react-reader";
import { useState, useRef } from "react";
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
  let location = formData.get("location") as string;
  let currentText = formData.get("currentText") as string;

  if (!location || !currentText) {
    return new Response("Bad Request", { status: 400 });
  }

  await db
    .update(ebooks)
    .set({ location, currentText, updatedAt: new Date().toISOString() })
    .where(eq(ebooks.id, id));

  return new Response("OK", { status: 200 });
}

export default function ReaderPage({ loaderData }: Route.ComponentProps) {
  const { book } = loaderData;
  const { id, title, location: savedLocation } = book;
  const [location, setLocation] = useState<string | number>(savedLocation || 0);
  const fetcher = useFetcher();
  const renditionRef = useRef<any>(null);

  const extractCurrentText = () => {
    const rendition = renditionRef.current;    
    if (!rendition) return "";  

    const chunks: string[] = [];    
    rendition.views().forEach((view: any) => {
      const { manager } = rendition;
      const { mapping } = manager;
      const { layout } = mapping;
      const { divisor, gap, columnWidth } = layout;
      
      const container = manager.container.getBoundingClientRect();
      const position = view.position();
      const offset = container.left;
      const viewStart = offset - position.left;
      
      Array.from({ length: divisor }, (_, i) => {
        const start = viewStart + (columnWidth + gap) * i;
        const end = start + columnWidth + gap;
        const startRange = mapping.findStart(view.document.body, start, end);
        const endRange = mapping.findEnd(view.document.body, start, end);
        const range = document.createRange();
        range.setStart(startRange.startContainer, startRange.startOffset);
        range.setEnd(endRange.endContainer, endRange.endOffset);
        chunks.push(range.toString());
      });
    });

    return chunks.join() as string;
  };

  const handleLocationChanged = async (newLocation: string | number) => {
    setLocation(newLocation);
    const newCurrentText = extractCurrentText();    
    
    fetcher.submit(
      { 
        location: newLocation.toString(), 
        currentText: newCurrentText
      },
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
          getRendition={(rendition) => { renditionRef.current = rendition }}
        />
      </div>
    </div>
  );
}
