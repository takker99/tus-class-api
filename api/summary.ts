import { ServerRequest } from "../src/deps_pinned.ts";
import { login } from "../src/login.ts";
import { checkAuth, onlyPOST } from "../src/gateway.ts";

export default async (req: ServerRequest) => {
  if (!onlyPOST(req)) return;
  const auth = await checkAuth(req);
  if (!auth) return;

  try {
    const json = await login(auth);
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    req.respond({ status: 200, body: JSON.stringify(json), headers });
  } catch (e) {
    req.respond({ status: 400, body: e.message });
  }
};
