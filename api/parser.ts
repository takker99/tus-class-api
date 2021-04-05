import {DOMParser, Element} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import {postToCLASS, getFromCLASS} from './fetch.ts';
import {getComSunFacesVIEW, BlobToURI} from './utilities.ts';

export function parseSummary(rowHeight: Element) {
    const titleDOM = rowHeight.getElementsByClassName('title')[0];
    const title = titleDOM.children[0].textContent.trim();
    if (!title) return undefined;
    const unread = rowHeight.children[0].children[0].tagName === 'IMG';
    const important = rowHeight.children[1].children[0].tagName === 'IMG';
    const [year, month, date] = titleDOM.getElementsByClassName('insDate')[0].textContent.trim()
        .slice(1, -1)
        .split('/')
        .map(n => parseInt(n));
    const updated = new Date(year, month - 1, date);
    const id = titleDOM.getElementsByTagName('a')[0].id;

    return {unread, important, title, updated, id};
}


export async function parseAnnounce(id: string, auth: {jSessionId: string}) {
    const pathname = `/up/faces/up/po/pPoa0202A.jsp?fieldId=${id}`
    const res = await getFromCLASS(pathname, auth);
    const dom = new DOMParser().parseFromString(await res.text(), 'text/html');
    if (!dom) throw Error(`Could not parse HTML text from "${pathname}".`);

    const title = dom.getElementById('form1:htmlTitle')?.textContent.trim();
    const sender = dom.getElementById('form1:htmlFrom')?.textContent.trim();
    // なぜか<br>が消えてしまうので、innerHTMLを使っている
    const lines = dom.getElementById('form1:htmlMain')?.innerHTML.trim().split(/\n|<br>/);
    const filenames = [...(dom.getElementById('form1:htmlFileTable')
        ?.getElementsByTagName?.('tr') ?? [])]
        .flatMap((_, index) => {
            // textContentだと途中で省略されてしまうので、titleから取得する
            const label = dom.getElementById(`form1:htmlFileTable:${index}:labelFileName`);
            const name = label?.getAttribute('title');
            return name ? [{name, id: index, }] : [];
        });

    // file dataを取得する
    const comSunFacesVIEW = getComSunFacesVIEW(dom);
    const files = [];
    let totalSize = 0;
    for (const {name, id} of filenames) {
        const res = await download(id, comSunFacesVIEW, auth);
        const blob = await res.blob();
        files.push(totalSize + blob.size > 5 * 1024 * 1024 ?
            {name, size: blob.size} :
            {name, dataURI: await BlobToURI(blob), size: blob.size});
        totalSize += blob.size;
    }
    await getFromCLASS('/up/faces/ajax/up/co/RemoveSessionAjax?target=null&windowName=Poa00201A&pcClass=com.jast.gakuen.up.po.PPoa0202A', auth); // 既読にする

    return {title, sender, lines, files};
}

async function download(id: number, comSunFacesVIEW: string, auth: {jSessionId: string}) {
    return postToCLASS('/up/faces/up/po/pPoa0202A.jsp', [
        {key: `form1:htmlFileTable:${id}:downLoadButton.x`, value: '0'},
        {key: `form1:htmlFileTable:${id}:downLoadButton.y`, value: '0'},
        {key: 'com.sun.faces.VIEW', value: comSunFacesVIEW},
        {key: 'form1', value: 'form1'},
    ], auth);
}
