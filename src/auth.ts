import { DOMParser } from "./deps.ts";
import { getComSunFacesVIEW } from "./util.ts";

export async function getAuthData() {
  const response = await fetch(
    "https://class.admin.tus.ac.jp/up/faces/login/Com00505A.jsp",
  );
  const cookie = response.headers.get("set-cookie");
  const jSessionId = cookie?.split?.(";")?.[0];
  if (!jSessionId) throw Error("Could not get JSESSIONID");

  const dom = new DOMParser().parseFromString(
    await response.text(),
    "text/html",
  );
  const comSunFacesVIEW = getComSunFacesVIEW(dom);
  return { jSessionId, comSunFacesVIEW };
}
