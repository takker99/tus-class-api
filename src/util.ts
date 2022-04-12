import { HTMLDocument } from "./deps.ts";
import { ServerRequest } from "./deps_pinned.ts";

export const range = (n: number) => [...Array(n).keys()];

export function createURLSearchParams(
  data: { key: string; value: string }[] | Record<string, string>,
) {
  const params = new URLSearchParams();
  if (Array.isArray(data)) {
    data.forEach(({ key, value }) => params.append(key, value));
    return params;
  }
  Object.keys(data).forEach((key) => params.append(key, data[key]));
  return params;
}

export function getComSunFacesVIEW(dom: HTMLDocument | null) {
  const input = dom?.getElementById("com.sun.faces.VIEW");
  const comSunFacesVIEW = input?.getAttribute("value");
  if (!comSunFacesVIEW) throw Error("Could not get com.sun.faces.VIEW");
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
export const getRequestURL = (request: ServerRequest): URL => {
  const base = `${request.headers.get("x-forwarded-proto")}://${
    request.headers.get(
      "x-forwarded-host",
    )
  }`;
  return new URL(request.url, base);
};

export type JSON = null | undefined | number | string | boolean | JSON[] | {
  [key: string]: JSON;
};
export interface ResponseArgs<T extends JSON> {
  status: number;
  body: T;
  request: ServerRequest;
}
export const respond = <T extends JSON>(
  args: ResponseArgs<T>,
) => {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  const origin = args.request.headers.get("Origin");
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  args.request.respond({
    status: args.status,
    body: JSON.stringify(args.body),
    headers,
  });
};
