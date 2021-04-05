import {ServerRequest} from "https://deno.land/std/http/server.ts";
import {multiParser} from 'https://deno.land/x/multiparser@v2.1.0/mod.ts'
import {Auth} from './login.ts';

export function onlyPOST(req: ServerRequest) {
    if (req.method === 'POST') return true;
    req.respond({status: 405});
    return false;
}

export async function checkAuth(req: ServerRequest) {
    const formData =  await multiParser(req);
    console.log(formData);

    if (!formData) {
        req.respond({status: 400, body: 'No form data'})
        return undefined;
    }
    if (!formData.fields.userId) {
        req.respond({status: 400, body: 'User ID is not set.'})
        return undefined;
    }
    if (!formData.fields.password) {
        req.respond({status: 400, body: 'Password is not set.'})
        return undefined;
    }
    return {userId: formData.fields.userId, password: formData.fields.password} as Auth;
}
