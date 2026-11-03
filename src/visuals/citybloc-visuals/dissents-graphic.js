/* eslint-disable */
// Adapted from eshabansiya/dailycal-citybloc graphics/dissents.html.
import DATA from './dissents-data.json';
import PHOTOS from './photos.json';

export const html = "<style>\n:host{\n  --bloc-a:#1d6fa5;\n  --bloc-b:#e3792b;\n  --neither:#8c8c8c;\n  --primary:#23517a;\n  --secondary:#4ba3cc;\n  --text:#1d1d1d;\n  --text-light:#707070;\n  --background:#ffffff;\n  --gridline:#e6e6e6;\n  --vote-aye:#4ba3cc;\n  --vote-no:#1d1d1d;\n  --vote-abstain:#f0b429;\n  --font:Roboto,\"Helvetica Neue\",Helvetica,Arial,sans-serif;\n}\n:host{--paper:var(--background);--panel:var(--background);--ink:var(--text);--ink-2:color-mix(in srgb,var(--text) 82%,var(--background));--muted:var(--text-light);\n--line:var(--gridline);--hair:color-mix(in srgb,var(--gridline) 60%,var(--background));--soft:color-mix(in srgb,var(--gridline) 70%,var(--background));\n--a:var(--bloc-a);--a-soft:color-mix(in srgb,var(--bloc-a) 14%,var(--background));--a-ink:color-mix(in srgb,var(--bloc-a) 80%,#000);\n--b:var(--bloc-b);--b-soft:color-mix(in srgb,var(--bloc-b) 16%,var(--background));--b-ink:color-mix(in srgb,var(--bloc-b) 70%,#000);\n--u:var(--neither);--u-soft:color-mix(in srgb,var(--neither) 14%,var(--background));--u-ink:color-mix(in srgb,var(--neither) 60%,#000);\n--split:var(--primary);--contest:var(--secondary);--heat:var(--primary);--heat-on:#fff;--sans:var(--font);--serif:var(--font)}\n*{box-sizing:border-box}\n:host{display:block;margin:0;background:var(--background);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.45}\nbutton,input,select{font:inherit;color:inherit}button{cursor:pointer}\n.fig{max-width:820px;margin:0 auto;padding:12px 10px 10px}\n.fig h1{margin:0;font:700 26px/1.2 var(--font);letter-spacing:-.01em}\n.fig .sub{margin:6px 0 16px;color:var(--text);font-size:15px;line-height:1.4}\n.fig .note{margin:14px 0 0;color:var(--text-light);font-size:12px}\n.footer{margin-top:14px;color:var(--text-light);font-size:12px}\n.footer a{color:var(--primary);text-decoration:none}.footer a:hover{text-decoration:underline}\n.dw-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0 0 12px;font-size:14px}\n.dw-legend{color:var(--text)}.dw-legend i{display:inline-block;width:18px;height:18px;margin-right:6px;vertical-align:-4px}\n.face{flex:none;display:inline-block;border-radius:50%;vertical-align:middle;background:var(--soft);box-shadow:0 0 0 2px var(--u)}.face.A{box-shadow:0 0 0 2px var(--a)}.face.B{box-shadow:0 0 0 2px var(--b)}\n.name.has-face:before{display:none}.name.has-face .face{margin:-3px 7px -3px 2px}\n.name{white-space:nowrap}.name:before{content:\"\";display:inline-block;width:9px;height:9px;margin-right:6px;background:var(--u);vertical-align:0}.name.A:before{background:var(--a)}.name.B:before{background:var(--b)}\n.ballot{display:inline-grid;place-items:center;min-width:28px;height:22px;padding:0 3px;font-size:10px;font-weight:700}\n.vY{background:var(--vote-aye);color:#fff}.vN{background:var(--vote-no);color:#fff}.vB{background:var(--vote-abstain);color:var(--text)}.vX{color:var(--muted)}\n.chip{padding:2px 7px;font-size:12.5px;font-weight:700;background:var(--u-soft);color:var(--u-ink)}\n.chip.A{background:var(--a-soft);color:var(--a-ink)}.chip.B{background:var(--b-soft);color:var(--b-ink)}\n.gA{background:var(--a)}.gB{background:var(--b)}.gU{background:var(--u)}\n@media(max-width:600px){.fig h1{font-size:21px}.fig .sub{font-size:14px}}\n\n.rows{display:grid}\n.row{display:grid;grid-template-columns:136px 34px minmax(0,1fr);gap:10px;align-items:center;padding:5px 0}\n.row .nmb{font-size:15px}\n.row .tot{font-size:15px;font-weight:700;font-variant-numeric:tabular-nums}\n.sq{display:flex;flex-wrap:wrap;gap:2px}\n.sq i{display:block;width:20px;height:20px;background:var(--secondary);cursor:default}\n.sq i.alone{background:var(--primary)}\n.sq i.ab{background-image:repeating-linear-gradient(135deg,transparent 0 3px,rgba(255,255,255,.45) 3px 5px)}\n.sq i:hover,.sq i.on{box-shadow:inset 0 0 0 2px var(--text)}\n.sq .gap{width:8px}\n.sw-ab{display:inline-block;width:18px;height:18px;margin-right:6px;vertical-align:-4px;background:var(--secondary) repeating-linear-gradient(135deg,transparent 0 3px,rgba(255,255,255,.45) 3px 5px)}\n.detail{margin:12px 0 0;height:84px;overflow:hidden;padding:10px 12px;background:var(--soft);font-size:14px;line-height:1.4}\n.detail .dt,.detail .dm{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}\n.detail .dt{font-weight:700}.detail .dm,.detail .m{color:var(--text-light);font-size:13px}.detail .dm b{color:var(--text)}\n@media(max-width:600px){.row{grid-template-columns:112px 26px minmax(0,1fr);gap:6px}.row .nmb,.row .tot{font-size:13px}.sq i{width:12px;height:18px}}\n</style><figure class=\"fig\">\n  <h1 id=\"title\"></h1>\n  <p class=\"sub\">Each square is one No or Abstain vote. Dark squares are solo dissents Hover a square to see the motion.</p>\n  <div class=\"dw-legend\" id=\"legend\"></div>\n  <div class=\"rows\" id=\"rows\"></div>\n  <p class=\"detail\" id=\"detail\"><span class=\"m\">Hover a square to see the motion.</span></p>\n  <p class=\"note\">Contested motions only. Absent and recused members are not counted.</p>\n  <div class=\"footer\">Chart: Esha Bansiya / The Daily Californian \u00b7 Source: Berkeley City Council minutes, <span data-range></span></div>\n</figure>";

export function mount(root, createDownload) {
const D = DATA, ORDER = D.order, $ = s => root.querySelector(s);
const A = D.info.blocs.A, B = D.info.blocs.B, U = D.info.swing;
const blocOf = n => A.includes(n) ? "A" : B.includes(n) ? "B" : "U";
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pct = (v, d = 0) => v == null ? "–" : `${(v * 100).toFixed(d)}%`;
const fmt = n => n.toLocaleString("en-US");
const list = ns => ns.length < 3 ? ns.join(" and ") : `${ns.slice(0, -1).join(", ")} and ${ns.at(-1)}`;
const face = (n, s = 22) => PHOTOS[n] ? `<img class="face ${blocOf(n)}" src="${PHOTOS[n]}" alt="" width="${s}" height="${s}">` : "";
const nameTag = n => `<span class="name has-face ${blocOf(n)}">${face(n)}${esc(n)}</span>`;
const WORD = {Y: ["Aye", "vY"], N: ["No", "vN"], B: ["Ab", "vB"], a: ["abs", "vX"], r: ["rec", "vX"], ".": ["–", "vX"]};
const FULL = {Y: "Aye", N: "No", B: "Abstain", a: "Absent", r: "Recused", ".": "No vote recorded"};
const ballot = (c, who) => `<span class="ballot ${WORD[c][1]}" title="${esc(who)}: ${FULL[c]}">${WORD[c][0]}</span>`;
const cleanItem = t => String(t || "").replace(/\s*\((Reviewed by|Item contains|ltem contains|Continued from|Item Contains|ltem Contains)[^)]*\)?/gi, "").replace(/^Procedural:\s*/i, "").trim();
const getData = (name, rows) => {
  const cell = v => { const t = String(v ?? ""); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const csv = rows.map(r => r.map(cell).join(",")).join("\n");
  const a = $("#get-data");
  if (!a) return;
  if (!a) return;
  a.href = createDownload(csv); a.download = `${name}.csv`;
};
root.querySelectorAll("[data-range]").forEach(el => el.textContent = `${D.info.date_range[0]} to ${D.info.date_range[1]}`);
const legend = items => { $("#legend").innerHTML = items.map(([style, label]) => `<span>${style ? `<i style="${style}"></i>` : ""}${label}</span>`).join(""); };
const VOTE_LEGEND = [["background:var(--vote-aye)", "Aye"], ["background:var(--vote-no)", "No"], ["background:var(--vote-abstain)", "Abstain"], [null, `<b style="color:var(--text-light);margin-right:6px">abs</b>Absent`], [null, `<b style="color:var(--text-light);margin-right:6px">rec</b>Recused`], [null, `<b style="color:var(--text-light);margin-right:6px">–</b>No vote recorded`]];
const motions = () => D.motions.map((r, i) => { const c = (D.context || {})[i]; return {i, title: c ? cleanItem(c[1]) : cleanItem(r[0]), date: c ? c[0] : "", codes: r[2], topic: r[3], level: r[4], passed: !!r[5], a: r[7], b: r[8]}; });

const M = motions();
const contested = M.filter(m => m.level > 0);
M.forEach(m => m.dis = ORDER.filter((n, k) => "NB".includes(m.codes[k])));
if ($("#unan")) $("#unan").textContent = fmt(M.length - contested.length);
if ($("#total")) $("#total").textContent = fmt(M.length);
legend([["background:var(--primary)", "Alone"], ["background:var(--secondary)", "With others"], [null, `<i class="sw-ab"></i>Abstained rather than voted No`]]);
const byDate = (x, y) => (x.date || "").localeCompare(y.date || "") || x.i - y.i;
const people = ORDER.map(n => { const k = ORDER.indexOf(n), mine = contested.filter(m => "NB".includes(m.codes[k]));
  return {n, k, alone: mine.filter(m => m.dis.length === 1).sort(byDate), withOthers: mine.filter(m => m.dis.length > 1).sort(byDate)}; })
  .sort((a, b) => (b.alone.length + b.withOthers.length) - (a.alone.length + a.withOthers.length) || b.alone.length - a.alone.length);
const top = people[0];
$("#title").textContent = `${top.n} has voted differently from the rest on ${top.alone.length} motions`;
const vote = (m, k) => m.codes[k] === "B" ? "Abstained" : "Voted No";
const tally = m => { const y = [...m.codes].filter(c => c === "Y").length; return `${m.passed ? "Passed" : "Failed"} ${y}–${m.dis.length}`; };
const squares = p => [...p.alone.map(m => [m, true]), ...p.withOthers.map(m => [m, false])].map(([m, a], j) =>
  `${j === p.alone.length && p.alone.length ? `<span class="gap"></span>` : ""}<i class="${a ? "alone" : ""}${m.codes[p.k] === "B" ? " ab" : ""}" data-n="${esc(p.n)}" data-i="${m.i}"></i>`).join("");
$("#rows").innerHTML = people.map(p => `<div class="row" data-row="${esc(p.n)}">${nameTag(p.n).replace('class="name', 'class="nmb name')}<span class="tot">${p.alone.length + p.withOthers.length}</span><div class="sq">${squares(p)}</div></div>`).join("");
let on = null;
const pick = t => {
  if (t === on) return;
  if (on) on.classList.remove("on"); on = t; t.classList.add("on");
  const p = people.find(x => x.n === t.dataset.n), m = M[+t.dataset.i];
  $("#detail").innerHTML = `<div class="dt">${esc(m.title)}</div><div class="dm">${[m.date, m.topic].filter(Boolean).map(esc).join(" · ")} · <b>${esc(p.n)}</b> ${vote(m, p.k).toLowerCase()}${m.dis.length > 1 ? `, with ${esc(list(m.dis.filter(x => x !== p.n)))}` : ", the only one"} · ${tally(m)}</div>`;
};
$("#rows").addEventListener("mouseover", e => { const t = e.target.closest(".sq i"); if (t) pick(t); });
$("#rows").addEventListener("click", e => { const t = e.target.closest(".sq i"); if (t) pick(t); });
$("#rows").addEventListener("mouseleave", () => { if (on) on.classList.remove("on"); on = null; });
getData("dissents", [["member", "motion", "date", "topic", "vote", "alone or with others", "others who dissented", "result"],
  ...people.flatMap(p => [...p.alone, ...p.withOthers].map(m => [p.n, m.title, m.date, m.topic, vote(m, p.k), m.dis.length === 1 ? "alone" : "with others", m.dis.filter(x => x !== p.n).join("; "), tally(m)]))]);
}
