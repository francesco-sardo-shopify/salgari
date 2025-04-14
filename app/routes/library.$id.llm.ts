import { streamText } from "ai";
import type { Message } from "ai";
import type { Route } from "./+types/library.$id.llm";
import { eq } from "drizzle-orm";
import { ebooks } from "~/database/schema";

export async function action({ request, params, context }: Route.ActionArgs) {
  const { messages } = await request.json<{ messages: Message[] }>();
  const { id } = params;
  const { google, db } = context;
  const { R2 } = context.cloudflare.env;

  const plainText = await R2.get(`${id}.txt`);
  const content = await plainText!.text();
  const ebook = await db.query.ebooks.findFirst({
    where: eq(ebooks.id, id),    
  });
  const { currentText, location } = ebook!;
  
  let systemPrompt = `
    You are a helpful assistant.
    You are given a book and a question.
    You need to answer the question based on the book.
    This is the text the user is currently reading:
    <currentText>
    ${currentText}
    </currentText>

    This is the user CFI reading position in the book:
    <position>
    ${location}
    </position>

    This is the rest of the book:
    <book>
    ${content}
    </book>

    If the user says 'Explain this page' you should reply by explaining the current passage, its significance, and how it fits into the overall narrative.
    If the user says 'Summary so far' you should reply by summarizing the book up to their current reading position.
    If the user says 'Rest of the chapter' you should reply by summarizing the remainder of the current chapter.
    If the user says 'Chapter Q&A' you should reply by asking them questions about the current chapter.
  `;

  const result = streamText({
    model: google("gemini-2.0-flash"),
    messages,
    system: systemPrompt,
  });

  return result.toDataStreamResponse();
}
