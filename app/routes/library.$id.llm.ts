import { streamText } from "ai";
import type { Message } from "ai";
import type { Route } from "./+types/library.$id.llm";

export async function action({ request, params, context }: Route.ActionArgs) {  
    const { messages } = await request.json<{ messages: Message[] }>();
    const {id} = params;
    const {google} = context;    
    const {R2} = context.cloudflare.env;

    const book = await R2.get(`${id}.txt`);
    const content = await book!.text();

    const result = streamText({
      model: google("gemini-2.0-flash"),      
      messages,
      system: `
      You are a helpful assistant.
      You are given a book and a question.
      You need to answer the question based on the book.
      Book: ${content}
      `,
    });

    return result.toDataStreamResponse();
  }
  