import { ServerRequest } from "../src/deps_pinned.ts";
import { login } from "../src/login.ts";
import { checkAuth, onlyPOST } from "../src/gateway.ts";
import { respond } from "../src/util.ts";

export default async (req: ServerRequest) => {
  if (!onlyPOST(req)) return;
  const auth = await checkAuth(req);
  if (!auth) return;

  try {
    const json = await login(auth);
    respond({ status: 200, body: json, request: req });
  } catch (e) {
    respond({ status: 400, body: { error: e.message }, request: req });
  }
};
