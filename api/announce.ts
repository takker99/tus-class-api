import { ServerRequest } from "../src/deps_pinned.ts";
import { Auth, login } from "../src/login.ts";
import { checkAuth, onlyPOST } from "../src/gateway.ts";
import { parseAnnounce } from "../src/parser.ts";
import { goDetailedInfoPage } from "../src/fetch.ts";
import { getRequestURL, respond } from "../src/util.ts";

export default async (req: ServerRequest) => {
  if (!onlyPOST(req)) return;
  const auth = await checkAuth(req);
  if (!auth) return;

  try {
    const url = getRequestURL(req);
    const param = url.searchParams.get("category");
    const categoryId = param ? parseInt(param) : undefined;
    if (categoryId === undefined) throw new Error("Category ID is not set.");
    const announceId = url.searchParams.get("announce");
    if (!announceId) throw new Error("Announce ID is not set.");

    const json = await getAnnounce(categoryId, announceId, auth);
    respond({ status: 200, body: json, request: req });
  } catch (e) {
    respond({ status: 400, body: { error: e.message }, request: req });
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
