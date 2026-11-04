/* eslint-disable */
// Adapted from eshabansiya/dailycal-citybloc graphics/agreement.html.
import DATA from './agreement-data.json';
import PHOTOS from './photos.json';

export const html = "<style>\n:host{\n  --bloc-a:#1d6fa5;\n  --bloc-b:#e3792b;\n  --neither:#8c8c8c;\n  --primary:#23517a;\n  --secondary:#4ba3cc;\n  --text:#1d1d1d;\n  --text-light:#707070;\n  --background:#ffffff;\n  --gridline:#e6e6e6;\n  --vote-aye:#4ba3cc;\n  --vote-no:#1d1d1d;\n  --vote-abstain:#f0b429;\n  --font:Roboto,\"Helvetica Neue\",Helvetica,Arial,sans-serif;\n}\n:host{--paper:var(--background);--panel:var(--background);--ink:var(--text);--ink-2:color-mix(in srgb,var(--text) 82%,var(--background));--muted:var(--text-light);\n--line:var(--gridline);--hair:color-mix(in srgb,var(--gridline) 60%,var(--background));--soft:color-mix(in srgb,var(--gridline) 70%,var(--background));\n--a:var(--bloc-a);--a-soft:color-mix(in srgb,var(--bloc-a) 14%,var(--background));--a-ink:color-mix(in srgb,var(--bloc-a) 80%,#000);\n--b:var(--bloc-b);--b-soft:color-mix(in srgb,var(--bloc-b) 16%,var(--background));--b-ink:color-mix(in srgb,var(--bloc-b) 70%,#000);\n--u:var(--neither);--u-soft:color-mix(in srgb,var(--neither) 14%,var(--background));--u-ink:color-mix(in srgb,var(--neither) 60%,#000);\n--split:var(--primary);--contest:var(--secondary);--heat:var(--primary);--heat-on:#fff;--sans:var(--font);--serif:var(--font)}\n*{box-sizing:border-box}\n:host{display:block;margin:0;background:var(--background);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.45}\nbutton,input,select{font:inherit;color:inherit}button{cursor:pointer}\n.fig{max-width:820px;margin:0 auto;padding:12px 10px 10px}\n.fig h1{margin:0;font:700 26px/1.2 var(--font);letter-spacing:-.01em}\n.fig .sub{margin:6px 0 16px;color:var(--text);font-size:15px;line-height:1.4}\n.fig .note{margin:14px 0 0;color:var(--text-light);font-size:12px}\n.footer{margin-top:14px;color:var(--text-light);font-size:12px}\n.footer a{color:var(--primary);text-decoration:none}.footer a:hover{text-decoration:underline}\n.dw-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0 0 12px;font-size:14px}\n.dw-legend{color:var(--text)}.dw-legend i{display:inline-block;width:18px;height:18px;margin-right:6px;vertical-align:-4px}\n.face{flex:none;display:inline-block;border-radius:50%;vertical-align:middle;background:var(--soft);box-shadow:0 0 0 2px var(--u)}.face.A{box-shadow:0 0 0 2px var(--a)}.face.B{box-shadow:0 0 0 2px var(--b)}\n.name.has-face:before{display:none}.name.has-face .face{margin:-3px 7px -3px 2px}\n.name{white-space:nowrap}.name:before{content:\"\";display:inline-block;width:9px;height:9px;margin-right:6px;background:var(--u);vertical-align:0}.name.A:before{background:var(--a)}.name.B:before{background:var(--b)}\n.ballot{display:inline-grid;place-items:center;min-width:28px;height:22px;padding:0 3px;font-size:10px;font-weight:700}\n.vY{background:var(--vote-aye);color:#fff}.vN{background:var(--vote-no);color:#fff}.vB{background:var(--vote-abstain);color:var(--text)}.vX{color:var(--muted)}\n.chip{padding:2px 7px;font-size:12.5px;font-weight:700;background:var(--u-soft);color:var(--u-ink)}\n.chip.A{background:var(--a-soft);color:var(--a-ink)}.chip.B{background:var(--b-soft);color:var(--b-ink)}\n.gA{background:var(--a)}.gB{background:var(--b)}.gU{background:var(--u)}\n@media(max-width:600px){.fig h1{font-size:21px}.fig .sub{font-size:14px}}\n\n.layout{display:grid;grid-template-columns:minmax(0,520px) minmax(0,1fr);gap:24px;align-items:stretch}\n.tri{border-collapse:separate;border-spacing:3px;width:100%;table-layout:fixed}\n.tri td{height:60px;text-align:center;font-size:12.5px;font-weight:700;font-variant-numeric:tabular-nums;cursor:pointer;position:relative}\n.tri td.blank{cursor:default}\n.tri td.cell:hover,.tri td.cell.on{outline:2.5px solid var(--text);outline-offset:-1px;z-index:1}\n.tri td.cell small{display:block;font-size:9.5px;font-weight:400;opacity:.8}\n.tri td.nm{font-size:10.5px;font-weight:700;text-align:center;padding:0 2px;line-height:1.1;overflow:hidden;background:var(--u);color:#fff}\n.tri td.nm.A{background:var(--a)}.tri td.nm.B{background:var(--b)}\n.tri td.nm .nmi{display:flex;flex-direction:column;align-items:center;gap:5px}.tri td.nm .nmi span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n.tri td.nm .face{box-shadow:0 0 0 1.5px #fff}\n.tri td.nm:hover,.tri td.nm.on{outline:2.5px solid var(--text);outline-offset:-1px;z-index:1}\n.scale{margin-top:10px}\n.panel{height:0;min-height:100%;overflow:auto;border-top:3px solid var(--text);padding:10px 2px 0 0}\n.panel h2{margin:0;font-size:17px;font-weight:700;line-height:1.3}\n.panel .big{font-size:40px;font-weight:700;line-height:1;margin:10px 0 2px;letter-spacing:-.02em}\n.panel .lead{font-size:14px;margin:0 0 12px}\n.cmp{display:grid;grid-template-columns:96px minmax(0,1fr) 54px;gap:8px;align-items:center;font-size:12.5px;margin:4px 0}\n.cmp .tr{height:12px;background:var(--soft)}.cmp .tr span{display:block;height:100%;background:var(--primary)}\n.cmp b{font-variant-numeric:tabular-nums;text-align:right}\n.panel h3{margin:16px 0 4px;font-size:13px;font-weight:700}\n.split{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;align-items:center;padding:6px 0;border-top:1px solid var(--hair);font-size:12.5px;line-height:1.3}\n.split .d{color:var(--text-light);font-size:11.5px}\n.split .bb{display:flex;gap:3px}.split .bb span.ballot{min-width:52px}\n.rank{display:grid;grid-template-columns:112px minmax(0,1fr) 44px;gap:8px;align-items:center;font-size:13px;padding:7px 0;margin:2px 0;cursor:pointer}\n.rank:hover{background:var(--soft)}\n.rank .tr{height:14px;background:var(--soft)}.rank .tr span{display:block;height:100%}\n.rank b{text-align:right;font-variant-numeric:tabular-nums}\n.hint{color:var(--text-light);font-size:12.5px}\n@media(max-width:760px){.layout{grid-template-columns:1fr}.panel{height:auto;min-height:0;max-height:460px}}\n</style><figure class=\"fig\">\n  <h1>On average, Bloc A agrees on contested motions 77% of times, Bloc B for 79%</h1>\n  <p class=\"sub\">Each square shows how often two members cast the same vote on the contested motions they both voted on. Click a square to see the votes where that pair split, or click a name to rank who that member votes with.</p>\n  <div class=\"dw-legend\" id=\"legend\"></div>\n  <div class=\"layout\">\n    <div><table class=\"tri\" id=\"tri\"></table></div>\n    <aside class=\"panel\" id=\"panel\" aria-live=\"polite\"></aside>\n  </div>\n  <p class=\"note\" id=\"note\"></p>\n  <div class=\"footer\">Chart: Esha Bansiya / The Daily Californian \u00b7 Source: Berkeley City Council minutes, <span data-range></span></div>\n</figure>";

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
  a.href = createDownload(csv); a.download = `${name}.csv`;
};
root.querySelectorAll("[data-range]").forEach(el => el.textContent = `${D.info.date_range[0]} to ${D.info.date_range[1]}`);
const legend = items => { $("#legend").innerHTML = items.map(([style, label]) => `<span>${style ? `<i style="${style}"></i>` : ""}${label}</span>`).join(""); };
const VOTE_LEGEND = [["background:var(--vote-aye)", "Aye"], ["background:var(--vote-no)", "No"], ["background:var(--vote-abstain)", "Abstain"], [null, `<b style="color:var(--text-light);margin-right:6px">abs</b>Absent`], [null, `<b style="color:var(--text-light);margin-right:6px">rec</b>Recused`], [null, `<b style="color:var(--text-light);margin-right:6px">–</b>No vote recorded`]];
const motions = () => D.motions.map((r, i) => { const c = (D.context || {})[i]; return {i, title: c ? cleanItem(c[1]) : cleanItem(r[0]), date: c ? c[0] : "", codes: r[2], topic: r[3], level: r[4], passed: !!r[5], a: r[7], b: r[8]}; });

const M = D.motions.map((r, i) => { const c = (D.context || {})[i]; return {i, title: c ? cleanItem(c[1]) : cleanItem(r[0]), date: c ? c[0] : "", codes: r[2], topic: r[3], level: r[4]}; });
const contested = M.filter(m => m.level > 0);
const ix = n => ORDER.indexOf(n);
const vals = []; ORDER.forEach((a, i) => ORDER.forEach((b, j) => { if (j < i) vals.push(D.agreement_contested[i][j]); }));
const lo = Math.min(...vals), hi = Math.max(...vals);
const color = v => { const p = Math.round(6 + (v - lo) / (hi - lo) * 94); return [`color-mix(in srgb, var(--primary) ${p}%, var(--background))`, p > 55 ? "#fff" : "var(--text)"]; };
legend([[null, `Voted alike: ${pct(lo)}<i style="width:140px;height:14px;margin:0 8px;background:linear-gradient(90deg,color-mix(in srgb,var(--primary) 6%,var(--background)),var(--primary))"></i>${pct(hi)}`],
        ["background:var(--a)", "Bloc A"], ["background:var(--b)", "Bloc B"], ["background:var(--u)", "Neither bloc"]]);

$("#tri").innerHTML = ORDER.map((a, i) => `<tr>${ORDER.map((b, j) => {
  if (j > i) return `<td class="blank"></td>`;
  if (j === i) return `<td class="nm ${blocOf(a)}" data-m="${esc(a)}" title="Rank who ${esc(a)} votes with"><div class="nmi"><img class="face" src="${PHOTOS[a]}" alt="" width="26" height="26"><span>${esc(a)}</span></div></td>`;
  const v = D.agreement_contested[i][j], [bg, fg] = color(v);
  return `<td class="cell" data-a="${esc(a)}" data-b="${esc(b)}" style="background:${bg};color:${fg}">${pct(v)}<small>${D.shared_contested[i][j]} votes</small></td>`;
}).join("")}</tr>`).join("");

const mark = sel => { root.querySelectorAll("#tri .on").forEach(el => el.classList.remove("on")); if (sel) root.querySelectorAll(sel).forEach(el => el.classList.add("on")); };
const nm = nameTag;
const pair = (a, b) => {
  const i = ix(a), j = ix(b), v = D.agreement_contested[i][j], n = D.shared_contested[i][j], same = Math.round(v * n);
  const all = D.agreement_all[i][j], nAll = D.shared_all[i][j];
  const splits = contested.filter(m => "YNB".includes(m.codes[i]) && "YNB".includes(m.codes[j]) && m.codes[i] !== m.codes[j]).sort((x, y) => (y.date || "").localeCompare(x.date || ""));
  const together = contested.filter(m => "NB".includes(m.codes[i]) && "NB".includes(m.codes[j])).length;
  mark(`#tri td.cell[data-a="${CSS.escape(i > j ? a : b)}"][data-b="${CSS.escape(i > j ? b : a)}"]`);
  $("#panel").innerHTML = `<h2>${nm(a)} &amp; ${nm(b)}</h2>
    <div class="big">${pct(v)}</div>
    <p class="lead">voted the same way on <b>${same} of ${n}</b> contested votes they both cast${together ? `, and dissented together <b>${together}</b> time${together === 1 ? "" : "s"}` : ""}.</p>
    <div class="cmp"><span>Contested votes</span><div class="tr"><span style="width:${v * 100}%"></span></div><b>${pct(v)}</b></div>
    <div class="cmp"><span>All ${fmt(nAll)} votes</span><div class="tr"><span style="width:${all * 100}%"></span></div><b>${pct(all, 1)}</b></div>
    <h3>The ${splits.length} vote${splits.length === 1 ? "" : "s"} where they split</h3>
    ${splits.map(m => `<div class="split"><div>${esc(m.title.length > 110 ? m.title.slice(0, 110) + "…" : m.title)}<div class="d">${[m.date, m.topic].filter(Boolean).map(esc).join(" · ")}</div></div><div class="bb">${ballot(m.codes[i], a).replace(/>[^<]*</, `>${esc(a.slice(0, 6))}: ${({Y: "Aye", N: "No", B: "Ab"})[m.codes[i]]}<`)}${ballot(m.codes[j], b).replace(/>[^<]*</, `>${esc(b.slice(0, 6))}: ${({Y: "Aye", N: "No", B: "Ab"})[m.codes[j]]}<`)}</div></div>`).join("")}`;
  $("#panel").scrollTop = 0;
};
const member = a => {
  const i = ix(a);
  const others = ORDER.filter(b => b !== a).map(b => [b, D.agreement_contested[i][ix(b)], D.shared_contested[i][ix(b)]]).sort((x, y) => y[1] - x[1]);
  mark(`#tri td.nm[data-m="${CSS.escape(a)}"]`);
  $("#panel").innerHTML = `<h2>Who ${nm(a)} votes with</h2><p class="lead" style="margin-top:6px">Share of contested votes where ${esc(a)} and each colleague voted the same way. Click a name to see where they split.</p>
    ${others.map(([b, v, n]) => `<div class="rank" data-a="${esc(a)}" data-b="${esc(b)}"><span>${nm(b)}</span><div class="tr"><span style="width:${v * 100}%;background:var(--${blocOf(b).toLowerCase()})"></span></div><b>${pct(v)}</b></div>`).join("")}
    <p class="hint" style="margin-top:12px">Closest: <b>${esc(others[0][0])}</b> (${pct(others[0][1])}). Least alike: <b>${esc(others.at(-1)[0])}</b> (${pct(others.at(-1)[1])}).</p>`;
  $("#panel").scrollTop = 0;
};
$("#tri").addEventListener("click", e => { const c = e.target.closest("td.cell"); if (c) return pair(c.dataset.a, c.dataset.b); const m = e.target.closest("td.nm"); if (m) member(m.dataset.m); });
$("#panel").addEventListener("click", e => { const r = e.target.closest(".rank"); if (r) pair(r.dataset.a, r.dataset.b); });
{ let mn = 1, pr = []; ORDER.forEach((a, i) => ORDER.forEach((b, j) => { if (j < i && D.agreement_all[i][j] < mn) { mn = D.agreement_all[i][j]; pr = [a, b]; } }));
  $("#note").textContent = `Contested: at least one member voted No or Abstain (${D.info.n_contested} motions).` ; }
let best = [0, 1, 0]; ORDER.forEach((a, i) => ORDER.forEach((b, j) => { if (j < i && D.agreement_contested[i][j] > best[2]) best = [i, j, D.agreement_contested[i][j]]; }));
pair(ORDER[best[0]], ORDER[best[1]]);
getData("council-agreement", [["member A", "member B", "contested votes both cast", "voted the same (contested)", "agreement (contested)", "agreement (all votes)"],
  ...ORDER.flatMap((a, i) => ORDER.slice(0, i).map((b, j) => [a, b, D.shared_contested[i][j], Math.round(D.agreement_contested[i][j] * D.shared_contested[i][j]), D.agreement_contested[i][j], D.agreement_all[i][j]]))]);
}
