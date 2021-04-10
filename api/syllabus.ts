import {DOMParser} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import {loginAsGuest} from './login.ts';
import {ServerRequest} from "https://deno.land/std/http/server.ts";
import {getFromCLASS} from './fetch.ts';

export default async (req: ServerRequest) => {
    const base = `${req.headers.get("x-forwarded-proto")}://${req.headers.get(
        "x-forwarded-host"
    )}`;
    const url = new URL(req.url, base);
    try {
        // URL parametersを取得する
        let params = {year: 9999, courseId: ''};
        for (const key of ['courseId', 'year']) {
            const param = url.searchParams.get(key) ?? undefined;
            if (key === 'year') {
                params.year = param ? parseInt(param) : (new Date()).getFullYear();
                continue;
            }
            if (!param) throw Error('URL parameter "courseId" is required');
            params.courseId = param;
        }

        // 検索を開始する
        const json = await getSyllabus(params.year, params.courseId);
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        req.respond({status: 200, body: JSON.stringify(json), headers});
    } catch (e) {
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        req.respond({status: 400, body: JSON.stringify({error: e.message}), headers});
    }
};

export async function getSyllabus(year: number, courseId: string) {
    const {jSessionId} = await loginAsGuest();

    const res = await getFromCLASS(`/up/faces/up/km/pKms0804A.jsp?sanshoTblFlg=1&nendo=${year}&jugyoCd=${courseId}`, {jSessionId});
    const html = await res.text();
    const dom = new DOMParser().parseFromString(html, 'text/html');
    const items = [...dom?.querySelectorAll('.gyoTable.listTable tr') ?? []];
    const data = items.map(tr => [...tr.children].map(element => element.innerHTML));
    return data.flatMap((array: string[]): ({label: string, value?: string} | string[])[] => {
        if (array.length === 0) return [];
        if (array.length === 1) return [{label: array[0]}];
        if (array.length === 2) return [{label: array[0], value: array[1]}];
        if (array.length === 4) return [{label: array[0], value: array[1]}, {label: array[2], value: array[3]}];
        return [array];
    });
}
