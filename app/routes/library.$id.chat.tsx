import { useChat } from "@ai-sdk/react";
import type { Route } from "./+types/library.$id.chat";
import { Navigation } from "~/components/Navigation";
import { ebooks } from "~/database/schema";
import { eq } from "drizzle-orm";
import { useRef } from "react";

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
  const formRef = useRef<HTMLFormElement>(null);
  const { messages, input, handleSubmit, handleInputChange, status, setInput } = useChat({
    api: `/library/${params.id}/llm`,
  });

  const suggestedPrompts = [
    { emoji: "✨", text: "Explain this page" },
    { emoji: "📝", text: "Summary so far" },
    { emoji: "⏩", text: "Rest of the chapter" },
    { emoji: "❓", text: "Chapter Q&A" }
  ];

  const handlePromptClick = (promptText: string) => {
    setInput(promptText);
    // Use requestAnimationFrame instead of setTimeout for better reliability
    requestAnimationFrame(() => {
      formRef.current?.requestSubmit();
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Navigation />
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length > 0 ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.role === "user" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-100"
                  }`}
                >
                  {message.parts.map((part, index) => {
                    switch (part.type) {
                      case "text":
                        return <span key={index}>{part.text}</span>;
                      // other cases can handle images, tool calls, etc
                    }
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-3xl font-bold mb-8 text-center">What can I help with?</h1>
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="p-4 border rounded-full hover:bg-gray-50 text-left flex items-center cursor-pointer"
                  onClick={() => handlePromptClick(prompt.text)}
                >
                  <span className="mr-2">{prompt.emoji}</span> {prompt.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-white">
        <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            placeholder="Message..."
            onChange={handleInputChange}
            disabled={status !== "ready"}
            className="flex-1 p-3 border rounded-full"
          />
          <button 
            type="submit" 
            disabled={status !== "ready" || !input.trim()}
            className="p-3 bg-slate-700 text-white rounded-full disabled:bg-slate-400 cursor-pointer"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
