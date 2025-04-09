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

  const result = streamText({
    model: google("gemini-2.0-flash"),
    messages,
    system: `
      You are a helpful assistant.
      You are given a book and a question.
      You need to answer the question based on the book.
      This is the text the user is currently reading:
      <currentText>
      ${ebook!.currentText}
      </currentText>

      This is the rest of the book:
      <book>
      ${content}
      </book>
      `,
  });

  return result.toDataStreamResponse();
}
