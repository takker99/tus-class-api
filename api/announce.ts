import { ServerRequest } from "https://deno.land/std/http/server.ts";
import { Auth, login } from "../src/login.ts";
import { checkAuth, onlyPOST } from "../src/gateway.ts";
import { parseAnnounce } from "../src/parser.ts";
import { goDetailedInfoPage } from "../src/fetch.ts";

export default async (req: ServerRequest) => {
  if (!onlyPOST(req)) return;
  const auth = await checkAuth(req);
  if (!auth) return;

  const base = `${req.headers.get("x-forwarded-proto")}://${
    req.headers.get(
      "x-forwarded-host",
    )
  }`;
  const url = new URL(req.url, base);
  let param = url.searchParams.get("category");
  const categoryId = param ? parseInt(param) : undefined;
  if (categoryId === undefined) {
    req.respond({ status: 400, body: "Category ID is not set." });
    return;
  }
  const announceId = url.searchParams.get("announce");
  if (!announceId) {
    req.respond({ status: 400, body: "Announce ID is not set." });
    return;
  }

  try {
    const json = await getAnnounce(categoryId, announceId, auth);
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    req.respond({ status: 200, body: JSON.stringify(json), headers });
  } catch (e) {
    req.respond({ status: 400, body: e.message });
  }
};

export async function getAnnounce(
  categoryId: number,
  announceId: string,
  auth: Auth,
) {
  const { announceSummary, comSunFacesVIEW, jSessionId } = await login(auth);
  const hasHiddenAnnounces = announceSummary.find(({ id }) => id === categoryId)
    ?.hasHiddenAnnounces;
  if (hasHiddenAnnounces) {
    // 詳細ページに移動する
    await goDetailedInfoPage(categoryId, { comSunFacesVIEW, jSessionId });
  }
  return await parseAnnounce(announceId, { jSessionId });
}
