import { useChat } from "@ai-sdk/react";
import type { Route } from "./+types/library.$id.chat";
import { Navigation } from "~/components/Navigation";
import { ebooks } from "~/database/schema";
import { eq } from "drizzle-orm";

export function meta({ data }: Route.MetaArgs) {
  const { book } = data;
  const { title } = book;
  return [
    { title: `${title} - E-Book Library` },
    { name: "description", content: `Chat with ${title}` },
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

export default function Page({ params }: Route.ComponentProps) {
  const { messages, input, handleSubmit, handleInputChange, status } = useChat({
    api: `/library/${params.id}/llm`,
  });

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4 p-3 border rounded">
            <strong>{`${message.role}: `}</strong>
            {message.parts.map((part, index) => {
              switch (part.type) {
                case "text":
                  return <span key={index}>{part.text}</span>;

                // other cases can handle images, tool calls, etc
              }
            })}
          </div>
        ))}
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit}>
          <input
            value={input}
            placeholder="Send a message..."
            onChange={handleInputChange}
            disabled={status !== "ready"}
            className="w-full p-3 border rounded"
          />
        </form>
      </div>
    </div>
  );
}
