import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { setCommonHeaders } from "@/app/headers";
// import { type db, setupDb } from "@/db";
import { env, waitUntil } from "cloudflare:workers";
import { getSandbox, proxyToSandbox } from "@cloudflare/sandbox";
import { writeAiCodeInSandbox } from "./app/utils/sandbox";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { PROMPT } from "../constant";

export { Sandbox } from "@cloudflare/sandbox";

export type AppContext = {
  sandbox: ReturnType<typeof getSandbox>;
};

const app = defineApp([
  setCommonHeaders(),

  async ({ ctx, request, headers }) => {
    // await setupDb(env);
    ctx.sandbox = getSandbox(env.Sandbox, "demo");
  },
  render(Document, [route("/", Home)]),
  prefix("/api", [
    route(
      "/chat",
      async ({ request, ctx }: { request: Request; ctx: AppContext }) => {
        const body = await request.json();
        if (!ctx.sandbox) {
          console.error("Sandbox is not initialized");
        }
        const { text } = await generateText({
          model: openai("gpt-4.1-mini-2025-04-14"),
          system: PROMPT,
          prompt: body.message,
        });

        //         const text = `<file path="src/App.tsx">
        // export default function App() {
        //   return (
        //     <div>
        //       Hello World
        //     </div>
        //   );
        // }
        // </file>`;
        console.log("AI Response:", text);
        const hostname = new URL(request.url).host;

        waitUntil(writeAiCodeInSandbox(ctx.sandbox, text, hostname));

        return new Response("Chat API");
      }
    ),
    // route("/preview", Preview)
  ]),
]);

export default {
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
    // PRIORITY: Route requests to exposed container ports via their preview URLs
    // This must happen BEFORE any other routing to bypass Wrangler's asset serving
    const proxyResponse = await proxyToSandbox(request, env);
    if (proxyResponse) return proxyResponse;

    return app.fetch(request, env, ctx);
  },
};
