import {DOMParser} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import {loginAsGuest} from './login.ts';
import {ServerRequest} from "https://deno.land/std/http/server.ts";
import {getFromCLASS} from './fetch.ts';

export default async (req: ServerRequest) => {
    const base = `${req.headers.get("x-forwarded-proto")}://${req.headers.get(
        "x-forwarded-host"
    )}`;
    const url = new URL(req.url, base);
    try {
        // URL parametersを取得する
        let params = {year: 9999, courseId: '', format: false};
        for (const key of ['courseId', 'year', 'format']) {
            const param = url.searchParams.get(key) ?? undefined;
            if (key === 'year') {
                params.year = param ? parseInt(param) : (new Date()).getFullYear();
                continue;
            }
            if (key === 'format') {
                params.format = param === 'true' ? true : false;
                continue;
            }
            if (!param) throw Error('URL parameter "courseId" is required');
            params.courseId = param;
        }

        // 検索を開始する
        const json = await getSyllabus(params.year, params.courseId, params.format);
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        req.respond({status: 200, body: JSON.stringify(json), headers});
    } catch (e) {
        const headers = new Headers();
        headers.set('Content-Type', 'application/json');
        req.respond({status: 400, body: JSON.stringify({error: e.message}), headers});
    }
};

export async function getSyllabus(year: number, courseId: string, formatting: boolean) {
    const {jSessionId} = await loginAsGuest();

    const res = await getFromCLASS(`/up/faces/up/km/pKms0804A.jsp?sanshoTblFlg=1&nendo=${year}&jugyoCd=${courseId}`, {jSessionId});
    const html = await res.text();
    const dom = new DOMParser().parseFromString(html, 'text/html');
    const items = [...dom?.querySelectorAll('.gyoTable.listTable tr') ?? []];
    const rawData = items.map(tr => [...tr.children].map(element => {
        const html = element.innerHTML;
        element.innerHTML = html.replace(/<br\/?\s*>/g, '\n');
        return element.textContent.trim();
    }));

    const table = rawData.flatMap((array: string[]): {label: string, value?: string}[] => {
        if (array.length === 0) return [];
        if (array.length === 1) return array[0] !== '' ? [{label: array[0]}] : [];
        if (array.length === 2) return [{label: array[0], value: array[1]}];
        if (array.length === 4) return [{label: array[0], value: array[1]}, {label: array[2], value: array[3]}];
        // それ以外のデータは削る
        return [];
    });

    if (!formatting) return table;

    // 更に使いやすいようにデータを加工する
    const title = table.find(({label}) => label.includes('科目名称'))?.value;
    const englishTitle = table.find(({label}) => label.includes('科目名称（英語）'))?.value;
    const instructors = table.find(({label}) => label.includes('教員名'))?.value?.split(',') ?? [];
    const semester = table.find(({label}) => label.includes('開講年度学期'))?.value;
    const hours = table.find(({label}) => label.includes('曜日時限'))?.value?.split(',') ?? [];
    const department = table.find(({label}) => label.includes('開講学科'))?.value;
    const onlyForeignLanguages = table.find(({label}) => label.includes('外国語のみの科目'))?.value === '〇' ? true : false;
    const credits = table.find(({label}) => label.includes('単位'))?.value;
    const format = table.find(({label}) => label.includes('授業の主な実施形態'))?.value;
    const descriptions = table.find(({label}) => label.includes('概要'))?.value?.split(/\n/) ?? [];
    const objectives = table.find(({label}) => label.includes('目的'))?.value?.split(/\n/) ?? [];
    const outcomes = table.find(({label}) => label.includes('到達目標'))?.value?.split(/\n/) ?? [];
    const prerequisites = table.find(({label}) => label.includes('履修上の注意'))?.value?.split(/\n/) ?? [];
    const hasEssay = table.find(({label}) => label.includes('課題に対する作文'))?.value === '〇' ? true : false;
    const hasQuiz = table.find(({label}) => label.includes('小テストの実施'))?.value === '〇' ? true : false;
    const hasDebate = table.find(({label}) => label.includes('ディベート・ディスカッション'))?.value === '〇' ? true : false;
    const hasGroupWork = table.find(({label}) => label.includes('グループワーク'))?.value === '〇' ? true : false;
    const hasPresentation = table.find(({label}) => label.includes('プレゼンテーション'))?.value === '〇' ? true : false;
    const hasFlippedClassroom = table.find(({label}) => label.includes('反転授業'))?.value === '〇' ? true : false;
    const otherProperties = table.find(({label}) => label.includes('その他（自由記述）'))?.value;
    const preparationAndReview = table.find(({label}) => label.includes('準備学習・復習'))?.value?.split(/\n/) ?? [];
    const evaluation = table.find(({label}) => label.includes('成績評価方法'))?.value?.split(/\n/) ?? [];
    const textbooks = table.find(({label}) => label.includes('教科書'))?.value?.split(/\n/) ?? [];
    const references = table.find(({label}) => label.includes('参考書'))?.value?.split(/\n/) ?? [];
    const plan = table.find(({label}) => label.includes('授業計画'))?.value?.split(/\n/) ?? [];
    const training = table.find(({label}) => label.includes('教職課程'))?.value?.split(/\n/) ?? [];
    const praticalExperiences = table.find(({label}) => label.includes('実務経験'))?.value?.split(/\n/) ?? [];
    const softwares = table.find(({label}) => label.includes('教育用ソフトウェア'))?.value?.split(/\n/) ?? [];
    const remarks = table.find(({label}) => label.includes('備考'))?.value?.split(/\n/) ?? [];
    const id = table.pop()?.label;

    return {
        title,
        englishTitle,
        instructors,
        semester,
        hours,
        department,
        onlyForeignLanguages,
        credits,
        format,
        descriptions,
        objectives,
        outcomes,
        prerequisites,
        hasEssay,
        hasQuiz,
        hasDebate,
        hasGroupWork,
        hasPresentation,
        hasFlippedClassroom,
        otherProperties,
        preparationAndReview,
        evaluation,
        textbooks,
        references,
        plan,
        training,
        praticalExperiences,
        softwares,
        remarks,
        id,
    };
}
