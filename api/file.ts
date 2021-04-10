import {ServerRequest} from "https://deno.land/std/http/server.ts";
import {contentType} from "https://deno.land/x/media_types@v2.7.1/mod.ts";
import {onlyPOST, checkAuth} from './gateway.ts';
import {getFile as fetchFile} from './parser.ts';
import {goDetailedInfoPage} from './fetch.ts';
import {login, Auth} from './login.ts';

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
    param = url.searchParams.get('file');
    const fileId = param ? parseInt(param) : undefined;
    if (fileId === undefined) {
        req.respond({status: 400, body: 'File ID is not set.'});
        return;
    }

    try {
        const {content, filename} = await getFile(categoryId, announceId, fileId, auth);
        const buffer = new Uint8Array(await content.arrayBuffer());
        const headers = new Headers();
        headers.set('Content-Type', filename ? contentType(filename) ?? content.type : content.type);
        req.respond({status: 200, body: buffer, headers});
    } catch (e) {
        req.respond({status: 400, body: e.message});
    }
};

async function getFile(categoryId: number, announceId: string, fileId: number, auth: Auth) {
    const {announceSummary, comSunFacesVIEW, jSessionId} = await login(auth);
    const hasHiddenAnnounces = announceSummary.find(({id}) => id === categoryId)?.hasHiddenAnnounces;
    if (hasHiddenAnnounces) {
        // 詳細ページに移動する
        await goDetailedInfoPage(categoryId, {comSunFacesVIEW, jSessionId});
    }
    return await fetchFile(announceId, fileId, {jSessionId});
}
