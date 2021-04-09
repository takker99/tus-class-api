import {ServerRequest} from "https://deno.land/std/http/server.ts";
import {onlyPOST, checkAuth} from './gateway.ts';
import {getAnnounce} from './announce.ts';

export default async (req: ServerRequest) => {
    if (!onlyPOST(req)) return;
    const auth = await checkAuth(req);
    if (!auth) return;

    const base = `${req.headers.get("x-forwarded-proto")}://${req.headers.get(
        "x-forwarded-host"
    )}`;
    const url = new URL(req.url, base);
    let param = url.searchParams.get('category');
    const categoryId = param ? parseInt(param) : undefined;
    if (categoryId === undefined) {
        req.respond({status: 400, body: 'Category ID is not set.'});
        return;
    }
    const announceId = url.searchParams.get('announce')
    if (!announceId) {
        req.respond({status: 400, body: 'Announce ID is not set.'});
        return;
    }

    try {
        const downloadFiles = await getAnnounce(categoryId, announceId, true, auth) as Blob;
        const buffer = new Uint8Array(await downloadFiles.arrayBuffer());
        const headers = new Headers();
        headers.set('Content-Type',downloadFiles.type);
        req.respond({status: 200, body: buffer, headers});
    } catch (e) {
        req.respond({status: 400, body: e.message});
    }
};
