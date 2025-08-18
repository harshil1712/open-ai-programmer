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
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { PROMPT } from "../constant";

export { Sandbox } from "@cloudflare/sandbox";

// Simple in-memory storage for preview URL
let currentPreviewUrl: string | null = null;

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
        const { messages }: { messages: UIMessage[] } = await request.json();
        if (!ctx.sandbox) {
          console.error("Sandbox is not initialized");
        }

        const result = streamText({
          model: openai("gpt-4.1-mini-2025-04-14"),
          system: PROMPT,
          messages: convertToModelMessages(messages),
          onFinish: async ({ text }) => {
            const hostname = new URL(request.url).host;
            try {
              // Make sandbox creation synchronous for immediate preview URL
              const previewUrl = await writeAiCodeInSandbox(ctx.sandbox, text, hostname);
              currentPreviewUrl = previewUrl;
              console.log("[PREVIEW] URL ready:", previewUrl);
            } catch (error) {
              console.error("[PREVIEW] Sandbox creation failed:", error);
            }
          },
        });

        return result.toUIMessageStreamResponse();
      }
    ),
    route("/preview-status", async () => {
      return new Response(
        JSON.stringify({
          previewUrl: currentPreviewUrl,
          status: currentPreviewUrl ? "ready" : "pending",
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }),
    route("/preview-stream", async () => {
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      
      // Send current URL immediately if available
      if (currentPreviewUrl) {
        await writer.write(new TextEncoder().encode(`data: ${JSON.stringify({ previewUrl: currentPreviewUrl })}\n\n`));
        await writer.close();
      } else {
        // Keep connection open and wait for URL
        const checkInterval = setInterval(async () => {
          if (currentPreviewUrl) {
            await writer.write(new TextEncoder().encode(`data: ${JSON.stringify({ previewUrl: currentPreviewUrl })}\n\n`));
            await writer.close();
            clearInterval(checkInterval);
          }
        }, 500);
        
        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          writer.close();
        }, 30000);
      }
      
      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }),
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
