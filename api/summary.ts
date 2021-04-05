import {ServerRequest} from "https://deno.land/std/http/server.ts";
import {multiParser, Form, FormFile} from 'https://deno.land/x/multiparser@v2.1.0/mod.ts'
import {login, Auth} from './login.ts';

export default async (req: ServerRequest) => {
    if (req.method !== 'POST') {
        req.respond({status: 405});
        return;
    }
    const formData =  await multiParser(req);
    if (!formData) {
        req.respond({status: 400, body: 'No form data'})
        return;
    }
    if (!formData.fields.userId) {
        req.respond({status: 400, body: 'User ID is not set.'})
        return;
    }
    if (!formData.fields.password) {
        req.respond({status: 400, body: 'Password is not set.'})
        return;
    }
    const auth = {userId: formData.fields.userId, password: formData.fields.password} as Auth;

    try {
        const json = await login(auth);
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        req.respond({status: 200, body: JSON.stringify(json), headers});
    } catch (e) {
        req.respond({status: 400, body: e.message});
    }
};
