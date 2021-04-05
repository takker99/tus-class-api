import {ServerRequest} from "https://deno.land/std/http/server.ts";
import {login} from './login.ts';
import {onlyPOST, checkAuth} from './gateway.ts';

export default async (req: ServerRequest) => {
    if (!onlyPOST(req)) return;
    console.log(req);
    const auth =  await checkAuth(req);
    if (!auth) return;

    try {
        const json = await login(auth);
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        req.respond({status: 200, body: JSON.stringify(json), headers});
    } catch (e) {
        req.respond({status: 400, body: e.message});
    }
};
