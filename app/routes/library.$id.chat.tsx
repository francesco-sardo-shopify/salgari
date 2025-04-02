import { useChat } from "@ai-sdk/react";
import type { Route } from "./+types/library.$id.chat";
import { Navigation } from "~/components/Navigation";

export default function Page({ params }: Route.ComponentProps) {
  const { messages, input, handleSubmit, handleInputChange, status } = useChat({
    api: `/llm/${params.id}`,
  });

  return (
    <div className="container mx-auto p-4">
      <Navigation bookId={params.id} />
      
      <div className="mt-6">
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

        <form onSubmit={handleSubmit} className="mt-6">
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
