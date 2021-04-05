import {createURLSearchParams} from './utilities.ts';

type Cookie = {
    jSessionId: string;
}
export async function postToCLASS(pathname: string, formData: {key: string; value: string}[] | Record<string, string>, cookie: Cookie) {
    const params = createURLSearchParams(formData).toString();

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': `${params.length}`,
            Cookie: cookie.jSessionId,
        },
        body: params,
    };
    const url = `https://class.admin.tus.ac.jp${pathname}`;
    //console.log({url, ...options});

    return await fetch(url, options);
}

export async function getFromCLASS(pathname: string, {jSessionId}: Cookie) {
    const options = {
        headers: {
            Cookie: jSessionId,
        },
    };
    const url = `https://class.admin.tus.ac.jp${pathname}`;

    return await fetch(url, options);
}
