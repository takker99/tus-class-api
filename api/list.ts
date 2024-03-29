import { DOMParser, Element } from "../src/deps.ts";
import { Auth, login } from "../src/login.ts";
import { parseSummary } from "../src/parser.ts";
import { goDetailedInfoPage, goNext, hasNextPage } from "../src/fetch.ts";
import {
  getComSunFacesVIEW,
  getRequestURL,
  getTable,
  respond,
} from "../src/util.ts";
import { ServerRequest } from "../src/deps_pinned.ts";
import { checkAuth, onlyPOST } from "../src/gateway.ts";

export default async (req: ServerRequest) => {
  if (!onlyPOST(req)) return;
  const auth = await checkAuth(req);
  if (!auth) return;

  try {
    const url = getRequestURL(req);
    const param = url.searchParams.get("category");
    const categoryId = param ? parseInt(param) : undefined;
    if (categoryId === undefined) throw new Error("Category ID is not set.");

    const json = await getAnnounceList(categoryId, auth);
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    respond({
      status: 200,
      body: json.map(({ updated, ...rest }) => ({
        updated: updated.getTime() / 1000,
        ...rest,
      })),
      request: req,
    });
  } catch (e) {
    respond({ status: 400, body: { error: e.message }, request: req });
  }
};

export async function getAnnounceList(
  categoryId: number,
  { userId, password }: Auth,
) {
  const { html, announceSummary, comSunFacesVIEW, jSessionId } = await login({
    userId,
    password,
  });
  const hasHiddenAnnounces = announceSummary.find(({ id }) => id === categoryId)
    ?.hasHiddenAnnounces;

  if (!hasHiddenAnnounces) {
    const dom = new DOMParser().parseFromString(html, "text/html");
    const tableId =
      `form1:Poa00201A:htmlParentTable:${categoryId}:htmlDetailTbl`;
    return getAnnounceListFromTable(getTable(dom, tableId));
  }

  // 複数ページあるお知らせリストを全て取得する
  let res = await goDetailedInfoPage(categoryId, {
    comSunFacesVIEW,
    jSessionId,
  });
  let _html = await res.text();
  let dom = new DOMParser().parseFromString(_html, "text/html");
  const results = [];
  while (true) {
    results.push(
      ...getAnnounceListFromTable(
        getTable(dom, "form1:Poa00201A:htmlParentTable:0:htmlDetailTbl2"),
      ),
    );

    // 次ページがなければおしまい
    if (!hasNextPage(dom)) break;
    res = await goNext({
      comSunFacesVIEW: getComSunFacesVIEW(dom),
      jSessionId,
    });
    _html = await res.text();
    dom = new DOMParser().parseFromString(_html, "text/html");
  }
  return results;
}

function getAnnounceListFromTable(table: Element) {
  return [...table.getElementsByClassName("rowHeight")]
    .flatMap((tr) => {
      const data = parseSummary(tr);
      return data ? [data] : [];
    });
}
