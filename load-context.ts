import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./database/schema";
import type { ExecutionContext, R2Bucket } from "@cloudflare/workers-types";
import type { AppLoadContext } from "react-router";
import { createGoogleGenerativeAI, type GoogleGenerativeAIProvider } from "@ai-sdk/google";

declare global {
  interface CloudflareEnvironment extends Env {}
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      ctx: Omit<ExecutionContext, "props">;
    };
    db: DrizzleD1Database<typeof schema>;
    google: GoogleGenerativeAIProvider;
  }
}

type GetLoadContextArgs = {
  request: Request;
  context: Pick<AppLoadContext, "cloudflare">;
};

export function getLoadContext({ context }: GetLoadContextArgs) {
  const db = drizzle(context.cloudflare.env.D1, { schema });
  const google = createGoogleGenerativeAI({apiKey: context.cloudflare.env.GOOGLE_GENERATIVE_AI_API_KEY});

  return {
    cloudflare: context.cloudflare,
    db,
    google,
  };
}
