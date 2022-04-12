import { ServerRequest } from "./deps_pinned.ts";
import { Auth } from "./login.ts";

export function onlyPOST(req: ServerRequest) {
  if (req.method === "POST") return true;
  req.respond({ status: 405 });
  return false;
}

export async function checkAuth(req: ServerRequest) {
  const buf: Uint8Array = await Deno.readAll(req.body);
  const text = new TextDecoder().decode(buf);
  const search = `?${decodeURIComponent(text)}`;
  const params = new URLSearchParams(search);

  return {
    userId: params.get("userId"),
    password: params.get("password"),
  } as Auth;
}
