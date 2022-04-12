import { ServerRequest } from "../src/deps_pinned.ts";
import { contentType } from "../src/deps.ts";
import { checkAuth, onlyPOST } from "../src/gateway.ts";
import { getFile as fetchFile } from "../src/parser.ts";
import { goDetailedInfoPage } from "../src/fetch.ts";
import { Auth, login } from "../src/login.ts";
import { getRequestURL, respond } from "../src/util.ts";

export default async (req: ServerRequest) => {
  if (!onlyPOST(req)) return;
  const auth = await checkAuth(req);
  if (!auth) return;
  try {
    const url = getRequestURL(req);
    let param = url.searchParams.get("category");
    const categoryId = param ? parseInt(param) : undefined;
    if (categoryId === undefined) throw Error("Category ID is not set.");
    const announceId = url.searchParams.get("announce");
    if (!announceId) throw Error("Announce ID is not set.");
    param = url.searchParams.get("file");
    const fileId = param ? parseInt(param) : undefined;
    if (fileId === undefined) throw Error("File ID is not set.");

    const { content, filename } = await getFile(
      categoryId,
      announceId,
      fileId,
      auth,
    );
    const buffer = new Uint8Array(await content.arrayBuffer());
    const headers = new Headers();
    headers.set(
      "Content-Type",
      filename ? contentType(filename) ?? content.type : content.type,
    );
    req.respond({ status: 200, body: buffer, headers });
  } catch (e) {
    respond({ status: 400, body: { error: e.message }, request: req });
  }
};

async function getFile(
  categoryId: number,
  announceId: string,
  fileId: number,
  auth: Auth,
) {
  const { announceSummary, comSunFacesVIEW, jSessionId } = await login(auth);
  const hasHiddenAnnounces = announceSummary.find(({ id }) => id === categoryId)
    ?.hasHiddenAnnounces;
  if (hasHiddenAnnounces) {
    // 詳細ページに移動する
    await goDetailedInfoPage(categoryId, { comSunFacesVIEW, jSessionId });
  }
  return await fetchFile(announceId, fileId, { jSessionId });
}
