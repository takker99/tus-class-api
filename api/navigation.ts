import {HTMLDocument} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import {postToCLASS} from './fetch.ts';

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
