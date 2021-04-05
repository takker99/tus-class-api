import {HTMLDocument} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

export const range = (n: number) => [...Array(n).keys()];

export function createURLSearchParams(data: {key: string; value: string;}[] | Record<string, string>) {
    const params = new URLSearchParams();
    if (Array.isArray(data)) {
        data.forEach(({key, value}) => params.append(key, value));
        return params;
    }
    Object.keys(data).forEach(key => params.append(key, data[key]));
    return params;
}

export function getComSunFacesVIEW(dom: HTMLDocument | null) {
    const input = dom?.getElementById('com.sun.faces.VIEW');
    const comSunFacesVIEW = input?.getAttribute('value');
    if (!comSunFacesVIEW) throw Error('Could not get com.sun.faces.VIEW');
    return comSunFacesVIEW;
}

export function getTable(dom: HTMLDocument | null, id: string) {
    const table = dom?.getElementById(id);
    if (!table) throw Error(`Could not find table#${id}`);
    return table;
}

export function BlobToURI(blob: Blob) {
  const fileReader = new FileReader();
  const promise = new Promise((resolve: (value?: string) => void) =>
    fileReader.onload = () => resolve(fileReader.result as string)
  );
  fileReader.readAsDataURL(blob);
  return promise;
}
