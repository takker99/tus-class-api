import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { loginAsGuest } from "../src/login.ts";
import { ServerRequest } from "../src/deps_pinned.ts";
import { goSyllabusList, postToCLASS } from "../src/fetch.ts";
import { getComSunFacesVIEW } from "../src/util.ts";

const TERMS = [1, 2, 11, 12, 13, 14] as const;
const COURSE_TYPES = [
  "EA",
  "EB",
  "EC",
  "ED",
  "EE",
  "EF",
  "EG",
  "EH",
  "EI",
  "EJ",
  "EK",
  "EM",
  "EO",
  "EQ",
  "ER",
  "ES",
  "ET",
  "EU",
  "EV",
  "GA",
  "GB",
  "GC",
  "GD",
  "GE",
  "GF",
  "GG",
  "GH",
  "GI",
  "GJ",
  "GK",
  "GM",
  "GO",
  "GQ",
  "GR",
  "GS",
  "GT",
  "GU",
  "GV",
  "JA",
  "JB",
  "JC",
  "JD",
  "JE",
  "JF",
  "JG",
  "JH",
  "JI",
  "JJ",
  "JK",
  "JM",
  "JO",
  "JQ",
  "JR",
  "JS",
  "JT",
  "JU",
  "JV",
  "KA",
  "KB",
  "KC",
  "KD",
  "KE",
  "KF",
  "KG",
  "KH",
  "KI",
  "KJ",
  "KK",
  "KM",
  "KO",
  "KQ",
  "KR",
  "KS",
  "KT",
  "KU",
  "KV",
  "SA",
  "SB",
  "SC",
  "SD",
  "SE",
  "SF",
  "SG",
  "SH",
  "SI",
  "SJ",
  "SK",
  "SM",
  "SO",
  "SQ",
  "SR",
  "SS",
  "ST",
  "SU",
  "SV",
  "ZA",
  "ZB",
  "ZC",
  "ZD",
  "ZE",
  "ZF",
  "ZG",
  "ZH",
  "ZI",
  "ZJ",
  "ZK",
  "ZM",
  "ZO",
  "ZQ",
  "ZR",
  "ZS",
  "ZT",
  "ZU",
  "ZV",
] as const;
const DEPARTMENTS = [
  "1",
  "11",
  "110",
  "111",
  "112",
  "113",
  "114",
  "115",
  "116",
  "12",
  "120",
  "121",
  "122",
  "123",
  "13",
  "13A",
  "13B",
  "14",
  "140",
  "141",
  "142",
  "143",
  "144",
  "145",
  "146",
  "14A",
  "15",
  "150",
  "151",
  "152",
  "153",
  "16",
  "160",
  "161",
  "162",
  "163",
  "164",
  "165",
  "166",
  "167",
  "168",
  "169",
  "16A",
  "17",
  "170",
  "171",
  "172",
  "173",
  "18",
  "181",
  "182",
  "183",
  "2",
  "22",
  "221",
  "222",
  "223",
  "3",
  "31",
  "311",
  "3111",
  "3112",
  "312",
  "3121",
  "3122",
  "313",
  "3131",
  "3132",
  "314",
  "3141",
  "3142",
  "315",
  "3151",
  "3152",
  "317",
  "3171",
  "3172",
  "33",
  "331",
  "33B",
  "33B1",
  "33B2",
  "33C2",
  "34",
  "341",
  "3411",
  "3412",
  "342",
  "3421",
  "3422",
  "343",
  "3431",
  "3432",
  "344",
  "3441",
  "3442",
  "345",
  "3451",
  "3452",
  "346",
  "3461",
  "3462",
  "36",
  "361",
  "3611",
  "3612",
  "362",
  "3621",
  "3622",
  "363",
  "3631",
  "3632",
  "364",
  "3641",
  "3642",
  "365",
  "3651",
  "3652",
  "366",
  "3661",
  "3662",
  "367",
  "3671",
  "3672",
  "368",
  "3681",
  "3682",
  "369",
  "3691",
  "3692",
  "36A",
  "36A1",
  "36A2",
  "36B",
  "36B1",
  "36B2",
  "37",
  "371",
  "3711",
  "3712",
  "372",
  "3721",
  "3722",
  "373",
  "3731",
  "3732",
  "37A",
  "38",
  "381",
  "3811",
  "3812",
  "382",
  "3821",
  "3A",
  "3A1",
  "3A11",
  "3A12",
  "3B",
  "3B1",
  "3B11",
  "3B12",
  "3C",
  "3C1",
  "3C11",
  "3C12",
  "3K",
  "3K1",
  "3K11",
  "3K12",
  "3M",
  "3M1",
  "3M11",
  "3M2",
  "3M21",
  "3M3",
  "3M31",
  "3M4",
  "3M42",
  "4",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
  "49",
  "4A",
  "4B",
  "4C",
  "4D",
  "4E",
  "4F",
  "4G",
  "4H",
  "4I",
  "4K",
  "4M",
  "5",
  "51",
  "52",
  "53",
  "54",
  "55",
  "56",
  "57",
  "58",
  "59",
  "5A",
  "5B",
  "5C",
  "5D",
  "5E",
  "5F",
  "5G",
  "5H",
  "5I",
  "5K",
  "6",
  "61",
  "610",
  "611",
  "612",
  "613",
  "614",
  "615",
  "616",
  "617",
  "618",
  "619",
  "61A",
  "63",
  "631",
  "6311",
  "6312",
  "6313",
  "6314",
  "6315",
  "6316",
  "6317",
  "635",
  "6351",
  "6352",
  "6353",
  "6354",
  "6355",
  "6356",
  "6357",
  "6358",
  "6359",
  "635A",
  "635B",
  "635C",
  "635D",
  "638",
  "6381",
  "67",
  "671",
  "672",
  "673",
  "674",
  "675",
  "676",
  "677",
  "678",
  "68",
  "681",
  "682",
  "683",
  "684",
] as const;
const GRADES = [1, 2, 3, 4, 5, 6] as const;
const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

type Query = {
  year: number;
  term?: typeof TERMS[number];
  type?: typeof COURSE_TYPES[number];
  department?: typeof DEPARTMENTS[number];
  grade?: typeof GRADES[number];
  day?: typeof DAYS[number];
  hour?: typeof DAYS[number];
  keyword: string;
  keyword_course: string;
  keyword_instructor: string;
  concentration?: boolean;
  skip?: number;
};

const KEYS: (keyof Query)[] = [
  "year",
  "concentration",
  "keyword",
  "keyword_instructor",
  "keyword_course",
  "hour",
  "day",
  "grade",
  "term",
  "type",
  "department",
  "skip",
];

export default async (req: ServerRequest) => {
  const base = `${req.headers.get("x-forwarded-proto")}://${
    req.headers.get(
      "x-forwarded-host",
    )
  }`;
  const url = new URL(req.url, base);

  // URL parametersを取得する
  const query: Partial<Query> = {};
  try {
    KEYS.forEach((key) => {
      const param = url.searchParams.get(key) ?? undefined;
      switch (key) {
        case "year":
          query.year = param ? parseInt(param) : (new Date()).getFullYear();
          return;
        case "term": {
          const term = param ? parseInt(param) : param;
          if (![...TERMS, undefined].includes(term as Query["term"])) {
            throw Error(`URL parameter "${key}" must be included in ${TERMS}`);
          }
          query.term = term as Query["term"];
          return;
        }
        case "type":
          if (![...COURSE_TYPES, undefined].includes(param as Query["type"])) {
            throw Error(
              `URL parameter "${key}" must be included in ${COURSE_TYPES}`,
            );
          }
          query.type = param as Query["type"];
          return;
        case "department":
          if (
            ![...DEPARTMENTS, undefined].includes(param as Query["department"])
          ) {
            throw Error(
              `URL parameter "${key}" must be included in ${DEPARTMENTS}`,
            );
          }
          query.department = param as Query["department"];
          return;
        case "grade": {
          const grade = param ? parseInt(param) : param;
          if (![...GRADES, undefined].includes(grade as Query["grade"])) {
            throw Error(`URL parameter "${key}" must be included in ${GRADES}`);
          }
          query.grade = grade as Query["grade"];
          return;
        }
        case "day": {
          const day = param ? parseInt(param) : param;
          if (![...DAYS, undefined].includes(day as Query["day"])) {
            throw Error(`URL parameter "${key}" must be included in ${DAYS}`);
          }
          query.day = day as Query["day"];
          return;
        }
        case "hour": {
          const hour = param ? parseInt(param) : param;
          if (![...DAYS, undefined].includes(hour as Query["hour"])) {
            throw Error(`URL parameter "${key}" must be included in ${DAYS}`);
          }
          query.hour = hour as Query["hour"];
          return;
        }
        case "keyword":
          query.keyword = param ?? "";
          return;
        case "keyword_course":
          query.keyword_course = param ?? "";
          return;
        case "keyword_instructor":
          query.keyword_instructor = param ?? "";
          return;
        case "concentration":
          query.concentration = param === "true" ? true : undefined;
          return;
        case "skip": {
          const skip = param ? parseInt(param) : undefined;
          query.skip = skip;
          return;
        }
      }
    });

    // 検索を開始する
    const json = await search(query as Query);
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    req.respond({
      status: json.ok ? 400 : 200,
      body: JSON.stringify(json),
      headers,
    });
  } catch (e) {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    req.respond({
      status: 400,
      body: JSON.stringify({ error: e.message }),
      headers,
    });
  }
};

const DAYSLIST: Record<string, number> = {
  "月": 0,
  "火": 1,
  "水": 2,
  "木": 3,
  "金": 4,
  "土": 5,
  "日": 6,
};

export async function search(query: Query) {
  const { comSunFacesVIEW, jSessionId } = await loginAsGuest();

  const params: { [key: string]: string } = {
    "form1:htmlShikibetsuKbn": "",
    "form1:htmlKanriNo": "",
    "com.sun.faces.VIEW": "",
    "form1": "form1",
    "form1:search.x": "0",
    "form1:search.y": "0",
  };
  // 検索画面に移動する
  {
    const res = await postToCLASS("/up/faces/up/co/Com02401A.jsp", {
      "form1:_idcl": "form1:htmlFlatMenuTable:1:htmlMenuLink",
      "menuNo": "101",
      "funcRowId": "0",
      "com.sun.faces.VIEW": comSunFacesVIEW,
      "form1": "form1",
    }, { jSessionId });
    const html = await res.text();
    const dom = new DOMParser().parseFromString(html, "text/html");
    Object.keys(params).forEach((key) =>
      params[key] = dom?.getElementById(key)?.getAttribute("value") ?? ""
    );
  }

  // 検索する
  let res = await postToCLASS("/up/faces/up/km/Kms00801A.jsp", {
    "form1:htmlNendo": `${query.year}`,
    "form1:htmlGakkiNo": `${query.term ?? ""}`,
    "form1:htmlKamokJugyo": query.type ?? "|all target|",
    "form1:htmlKamokName": query.keyword_course,
    "form1:htmlKyoinSimei": query.keyword_instructor,
    "form1:htmlKeyword": query.keyword,
    "form1:htmlGakka": query.department ?? "|all target|",
    "form1:htmlGakunen": `${query.grade ?? ""}`,
    "form1:htmlYobi": `${
      query.day !== undefined ? query.day + 1 : "|all target|"
    }`,
    "form1:htmlJigen": `${
      query.hour !== undefined ? query.hour + 1 : "|all target|"
    }`,
    ...(query.concentration ? { "form1:htmlSyutyu": "on" } : {}),
    ...params,
  }, { jSessionId });

  // 所定のページに飛ぶ
  if (query.skip) {
    const dom = new DOMParser().parseFromString(await res.text(), "text/html");
    res = await goSyllabusList(query.skip, {
      comSunFacesVIEW: getComSunFacesVIEW(dom),
      jSessionId,
    });
  }

  // 結果を取得する
  const dom = new DOMParser().parseFromString(await res.text(), "text/html");
  const error = dom?.getElementById("htmlErrorMessage")?.textContent;
  if (error) return { ok: false, error };

  const count = parseInt(
    dom?.getElementById("form1:htmlKekkatable:htmlGokeiKensu")?.textContent ??
      "",
  );
  const pageCount = parseInt(
    dom?.getElementById("form1:htmlKekkatable:deluxe1__pagerText")?.textContent
      .match(/\d+\/(\d+)/)?.[1] ?? "",
  );
  const items = [...dom?.getElementsByClassName("rowClass1") ?? []];
  const courses = items
    .flatMap((_, index) => {
      // pagenationしている分だけずらす
      index = index + (query.skip ?? 0) * items.length;
      const department =
        dom?.getElementById(`form1:htmlKekkatable:${index}:htmlCurGakkaRyakCol`)
          ?.getAttribute("title") ?? "";
      const _term = dom?.getElementById(
        `form1:htmlKekkatable:${index}:htmlGakkiNoCol`,
      )?.textContent?.match(/(\d+)(.*)$/)?.slice(1);
      const year = _term?.[0] ? parseInt(_term[0]) : NaN;
      const term = _term?.[1] ?? "";
      const instructors =
        dom?.getElementById(`form1:htmlKekkatable:${index}:htmlKyoinSimeiCol`)
          ?.getAttribute("title")?.split(",") ?? [];
      const type =
        dom?.getElementById(`form1:htmlKekkatable:${index}:htmlJyugyoKbnCol`)
          ?.textContent ?? "";
      const content = dom?.getElementById(
        `form1:htmlKekkatable:${index}:htmlKamokuNameCol`,
      )?.getAttribute("title")?.match(/^(.+?)　(.*)$/)?.slice(1);
      const id = content?.[0] ?? "";
      const title = content?.[1] ?? "";
      const hourTexts =
        dom?.getElementById(`form1:htmlKekkatable:${index}:htmlKaikoYobiCol`)
          ?.textContent?.trim()?.split(/\s/) ?? [];
      const hours = hourTexts.flatMap((text) => {
        const splitted = text.split("");
        if (splitted.length !== 2) return [];
        const [day, hour] = splitted;

        return {
          hour: parseInt(hour),
          day: DAYSLIST[day] ?? "",
        };
      });

      return title
        ? [{ department, year, term, hours, instructors, type, id, title }]
        : [];
    });

  return {
    count,
    pageCount,
    courses,
    ...(query.skip ? { skip: query.skip } : {}),
  };
}
