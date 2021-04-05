import {DOMParser, Element} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import {login, Auth} from './login.ts';
import {parseSummary} from './parser.ts';
import {goDetailedInfoPage, hasNextPage, goNext} from './navigation.ts';
import {getTable, getComSunFacesVIEW} from './utilities.ts';
import {ServerRequest} from "https://deno.land/std/http/server.ts";
import {onlyPOST, checkAuth} from './gateway.ts';

export default async (req: ServerRequest) => {
    if (!onlyPOST(req)) return;
    const auth =  await checkAuth(req);
    if (!auth) return;

    const base = `${req.headers.get("x-forwarded-proto")}://${req.headers.get(
        "x-forwarded-host"
    )}`;
    const url = new URL(req.url, base);
    const param = url.searchParams.get('category');
    const categoryId = param ? parseInt(param) : undefined;
    if (categoryId === undefined) {
        req.respond({ status: 400, body: 'Category ID is not set.' });
        return;
    }

    try {
        const json = await getAnnounceList(categoryId, auth);
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        req.respond({status: 200, body: JSON.stringify(json), headers});
    } catch (e) {
        req.respond({status: 400, body: e.message});
    }
};

export async function getAnnounceList(categoryId: number, {userId, password}: Auth) {
    const {html, announceSummary, comSunFacesVIEW, jSessionId} = await login({userId, password});
    const hasHiddenAnnounces = announceSummary.find(({id}) => id === categoryId)?.hasHiddenAnnounces;

    if (!hasHiddenAnnounces) {
        const dom = new DOMParser().parseFromString(html, 'text/html');
        const tableId = `form1:Poa00201A:htmlParentTable:${categoryId}:htmlDetailTbl`;
        return getAnnounceListFromTable(getTable(dom, tableId));
    }

    // 複数ページあるお知らせリストを全て取得する
    let res = await goDetailedInfoPage(categoryId, {comSunFacesVIEW, jSessionId});
    let _html = await res.text();
    let dom = new DOMParser().parseFromString(_html, 'text/html');
    const results = [];
    while (true) {
        results.push(...getAnnounceListFromTable(getTable(dom, 'form1:Poa00201A:htmlParentTable:0:htmlDetailTbl2')));

        // 次ページがなければおしまい
        if (!hasNextPage(dom)) break;
        res = await goNext({comSunFacesVIEW: getComSunFacesVIEW(dom), jSessionId});
        _html = await res.text();
        dom = new DOMParser().parseFromString(_html, 'text/html');
    }
    return results;
}

function getAnnounceListFromTable(table: Element) {
    return [...table.getElementsByClassName('rowHeight')]
        .flatMap(tr => {
            const data = parseSummary(tr);
            return data ? [data] : [];
        });
}
