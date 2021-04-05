import {Element} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

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
