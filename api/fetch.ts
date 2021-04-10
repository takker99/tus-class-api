import {createURLSearchParams} from './utilities.ts';
import {HTMLDocument} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

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

type Auth = {
    comSunFacesVIEW: string;
    jSessionId: string;
};
export async function goDetailedInfoPage(id: number, {comSunFacesVIEW, jSessionId}: Auth) {
    return await postToCLASS('/up/faces/up/po/Poa00601A.jsp', [
        {
            key: `form1:Poa00201A:htmlParentTable:${id}:htmlDisplayOfAll:0:allInfoLinkCommand`,
            value: '',
        },
        {key: 'com.sun.faces.VIEW', value: comSunFacesVIEW, },
        {key: 'form1', value: 'form1', },
    ], {jSessionId});
}

const nextButtonId = 'form1:Poa00201A:htmlParentTable:htmlDetailTbl2:deluxe1__pagerNext';

export function hasNextPage(dom: HTMLDocument | null) {
    const nextButton = dom?.getElementById(nextButtonId);
    return (nextButton?.getAttribute('disabled') ?? 'true') === 'false';
}
export async function goNext({comSunFacesVIEW, jSessionId}: Auth) {
    return await postToCLASS('/up/faces/up/po/Poa00601A.jsp', [
        {key: `${nextButtonId}.x`, value: '0', },
        {key: `${nextButtonId}.y`, value: '0', },
        {key: 'com.sun.faces.VIEW', value: comSunFacesVIEW, },
        {key: 'form1', value: 'form1', },
    ], {jSessionId});
}

export async function backToTop({comSunFacesVIEW, jSessionId}: Auth) {
    await postToCLASS('/up/faces/up/po/pPoa0202A.jsp', {
        'form1:Poa00201A:htmlParentTable:0:htmlHeaderTbl:0:retrurn.x': '0',
        'form1:Poa00201A:htmlParentTable:0:htmlHeaderTbl:0:retrurn.y': '0',
        'com.sun.faces.VIEW': comSunFacesVIEW,
        'form1': 'form1',
    }, {jSessionId});
}
export async function goSyllabusList(page: number, {comSunFacesVIEW, jSessionId}: Auth) {
    return await postToCLASS('/up/faces/up/km/Kms00802A.jsp', {
        'form1:htmlKekkatable:web1__pagerWeb': `${page}`,
        'com.sun.faces.VIEW': comSunFacesVIEW,
        'form1': 'form1',
    }, {jSessionId});
}
