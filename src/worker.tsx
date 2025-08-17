import { defineApp, ErrorResponse } from "rwsdk/worker";
import { route, render, prefix } from "rwsdk/router";
import { Document } from "@/app/Document";
import { Home } from "@/app/pages/Home";
import { setCommonHeaders } from "@/app/headers";
// import { type db, setupDb } from "@/db";
import { env } from "cloudflare:workers";

export type AppContext = {};

export default defineApp([
  setCommonHeaders(),
  async ({ ctx, request, headers }) => {
    // await setupDb(env);
  },
  render(Document, [route("/", Home)]),
]);
