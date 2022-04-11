import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { getAuthData } from "./auth.ts";
import { postToCLASS } from "./fetch.ts";
import { getComSunFacesVIEW, getTable, range } from "./util.ts";

export type Auth = {
  userId: string;
  password: string;
};

export async function login({ userId, password }: Auth) {
  let { comSunFacesVIEW, jSessionId } = await getAuthData();
  const res = await postToCLASS("/up/faces/login/Com00505A.jsp", {
    "form1:htmlUserId": userId,
    "form1:htmlPassword": password,
    "form1:login.x": "0",
    "form1.login.y": "0",
    "form1": "form1",
    "com.sun.faces.VIEW": comSunFacesVIEW,
  }, { jSessionId });
  // console.log(res);
  const html = await res.text();
  const dom = new DOMParser().parseFromString(html, "text/html");
  if (!dom) {
    throw Error(
      'Could not parse HTML text from "/up/faces/login/Com00505A.jsp".',
    );
  }
  comSunFacesVIEW = getComSunFacesVIEW(dom);

  // お知らせの概要を取得する
  const announceSummary = [];
  {
    const baseId = "form1:Poa00201A:htmlParentTable";
    const announceTable = getTable(dom, baseId);
    for (const index of range(announceTable.children[0].children.length)) {
      announceSummary.push({
        title: dom.getElementById(
          `${baseId}:${index}:htmlHeaderTbl:0:htmlHeaderCol`,
        )?.textContent?.trim(),
        count: parseInt(
          dom.getElementById(
            `${baseId}:${index}:htmlDisplayOfAll:0:htmlCountCol21702`,
          )?.textContent?.replace(/全(\d+)件/, "$1") ?? "",
        ),
        hasHiddenAnnounces:
          dom.getElementById(
            `${baseId}:${index}:htmlDisplayOfAll:0:htmlCountCol21702`,
          )?.nextElementSibling !== null,
        id: index,
      });
    }
  }

  return { html, comSunFacesVIEW, jSessionId, announceSummary };
}

export async function loginAsGuest() {
  let { comSunFacesVIEW, jSessionId } = await getAuthData();
  const res = await postToCLASS("/up/faces/login/Com00505A.jsp", {
    "form1:guest.x": "0",
    "form1.guest.y": "0",
    "form1": "form1",
    "com.sun.faces.VIEW": comSunFacesVIEW,
  }, { jSessionId });

  const html = await res.text();
  const dom = new DOMParser().parseFromString(html, "text/html");
  if (!dom) {
    throw Error(
      'Could not parse HTML text from "/up/faces/login/Com00505A.jsp".',
    );
  }
  comSunFacesVIEW = getComSunFacesVIEW(dom);

  return { html, comSunFacesVIEW, jSessionId };
}
