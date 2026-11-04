/* eslint-disable */
// Adapted from eshabansiya/dailycal-citybloc graphics/bloc-unity.html.
import DATA from './dissents-data.json';
import PHOTOS from './photos.json';

export const html = "<style>\n:host{\n  --bloc-a:#1d6fa5;\n  --bloc-b:#e3792b;\n  --neither:#8c8c8c;\n  --primary:#23517a;\n  --secondary:#4ba3cc;\n  --text:#1d1d1d;\n  --text-light:#707070;\n  --background:#ffffff;\n  --gridline:#e6e6e6;\n  --vote-aye:#4ba3cc;\n  --vote-no:#1d1d1d;\n  --vote-abstain:#f0b429;\n  --font:Roboto,\"Helvetica Neue\",Helvetica,Arial,sans-serif;\n}\n:host{--paper:var(--background);--panel:var(--background);--ink:var(--text);--ink-2:color-mix(in srgb,var(--text) 82%,var(--background));--muted:var(--text-light);\n--line:var(--gridline);--hair:color-mix(in srgb,var(--gridline) 60%,var(--background));--soft:color-mix(in srgb,var(--gridline) 70%,var(--background));\n--a:var(--bloc-a);--a-soft:color-mix(in srgb,var(--bloc-a) 14%,var(--background));--a-ink:color-mix(in srgb,var(--bloc-a) 80%,#000);\n--b:var(--bloc-b);--b-soft:color-mix(in srgb,var(--bloc-b) 16%,var(--background));--b-ink:color-mix(in srgb,var(--bloc-b) 70%,#000);\n--u:var(--neither);--u-soft:color-mix(in srgb,var(--neither) 14%,var(--background));--u-ink:color-mix(in srgb,var(--neither) 60%,#000);\n--split:var(--primary);--contest:var(--secondary);--heat:var(--primary);--heat-on:#fff;--sans:var(--font);--serif:var(--font)}\n*{box-sizing:border-box}\n:host{display:block;margin:0;background:var(--background);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.45}\nbutton,input,select{font:inherit;color:inherit}button{cursor:pointer}\n.fig{max-width:820px;margin:0 auto;padding:12px 10px 10px}\n.fig h1{margin:0;font:700 26px/1.2 var(--font);letter-spacing:-.01em}\n.fig .sub{margin:6px 0 16px;color:var(--text);font-size:15px;line-height:1.4}\n.fig .note{margin:14px 0 0;color:var(--text-light);font-size:12px}\n.footer{margin-top:14px;color:var(--text-light);font-size:12px}\n.footer a{color:var(--primary);text-decoration:none}.footer a:hover{text-decoration:underline}\n.dw-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0 0 12px;font-size:14px}\n.dw-legend{color:var(--text)}.dw-legend i{display:inline-block;width:18px;height:18px;margin-right:6px;vertical-align:-4px}\n.face{flex:none;display:inline-block;border-radius:50%;vertical-align:middle;background:var(--soft);box-shadow:0 0 0 2px var(--u)}.face.A{box-shadow:0 0 0 2px var(--a)}.face.B{box-shadow:0 0 0 2px var(--b)}\n.name.has-face:before{display:none}.name.has-face .face{margin:-3px 7px -3px 2px}\n.name{white-space:nowrap}.name:before{content:\"\";display:inline-block;width:9px;height:9px;margin-right:6px;background:var(--u);vertical-align:0}.name.A:before{background:var(--a)}.name.B:before{background:var(--b)}\n.ballot{display:inline-grid;place-items:center;min-width:28px;height:22px;padding:0 3px;font-size:10px;font-weight:700}\n.vY{background:var(--vote-aye);color:#fff}.vN{background:var(--vote-no);color:#fff}.vB{background:var(--vote-abstain);color:var(--text)}.vX{color:var(--muted)}\n.chip{padding:2px 7px;font-size:12.5px;font-weight:700;background:var(--u-soft);color:var(--u-ink)}\n.chip.A{background:var(--a-soft);color:var(--a-ink)}.chip.B{background:var(--b-soft);color:var(--b-ink)}\n.gA{background:var(--a)}.gB{background:var(--b)}.gU{background:var(--u)}\n@media(max-width:600px){.fig h1{font-size:21px}.fig .sub{font-size:14px}}\n\n.rows{display:grid;gap:18px}\n.row{display:grid;grid-template-columns:150px minmax(0,1fr);gap:12px;align-items:start}\n.row .lab{font-size:15px;font-weight:700;line-height:1.25}\n.row .lab .faces{display:flex;gap:6px;margin:8px 0 2px 2px}\n.row .lab .who{display:block;font-weight:400;font-size:12.5px;color:var(--text-light);margin-top:2px}\n.row .big{display:block;font-size:24px;font-weight:700;margin-top:6px;font-variant-numeric:tabular-nums}\n.row .big small{font-size:13px;font-weight:400;color:var(--text-light)}\n.sq{display:grid;grid-template-columns:repeat(27,minmax(0,1fr));gap:2px}\n.sq i{display:block;height:24px;background:var(--soft);cursor:default}\n.sq i.A{background:var(--a)}.sq i.B{background:var(--b)}\n.sq i:hover,.sq i.on{box-shadow:inset 0 0 0 2px var(--text)}\n.bench{margin:6px 0 0;font-size:12.5px;color:var(--text-light)}\n.detail{margin:14px 0 0;min-height:92px;padding:10px 12px;background:var(--soft);font-size:14px;line-height:1.4}\n.detail .dt{font-weight:700;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}\n.detail .dm,.detail .m{color:var(--text-light);font-size:13px}\n.detail .bs{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;margin-top:6px;font-size:12.5px}\n@media(max-width:600px){.row{grid-template-columns:1fr;gap:6px}.row .big{display:inline;margin:0 0 0 8px;font-size:18px}.sq{grid-template-columns:repeat(18,minmax(0,1fr))}.sq i{height:20px}}\n</style><figure class=\"fig\">\n  <h1 id=\"title\"></h1>\n  <p class=\"sub\">Each square is one contested motion. Hover a square to see how they voted.</p>\n  <div class=\"dw-legend\" id=\"legend\"></div>\n  <div class=\"rows\" id=\"rows\"></div>\n  <div class=\"detail\" id=\"detail\"><span class=\"m\">Hover a square to see the motion.</span></div>\n  <p class=\"note\">Contested motions only: at least one council member voted differently. Absent and recused members are left out; a motion counts if at least two bloc members voted.</p>\n  <div class=\"footer\">Chart: Esha Bansiya / The Daily Californian \u00b7 Source: Berkeley City Council minutes, <span data-range></span></div>\n</figure>";

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

const M = motions();
const contested = M.filter(m => m.level > 0);
const byDate = (x, y) => (x.date || "").localeCompare(y.date || "") || x.i - y.i;
const castBy = (m, g) => g.map(n => m.codes[ORDER.indexOf(n)]).filter(c => "YNB".includes(c));
const unity = g => { const pool = contested.filter(m => castBy(m, g).length >= 2);
  const together = pool.filter(m => new Set(castBy(m, g)).size === 1); return {pool, together}; };
const combos = (arr, k) => k === 0 ? [[]] : arr.flatMap((x, i) => combos(arr.slice(i + 1), k - 1).map(c => [x, ...c]));
const median = v => { const s = [...v].sort((a, b) => a - b), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
const rate = g => { const u = unity(g); return u.together.length / u.pool.length; };
const blocs = [["A", A], ["B", B]].map(([k, g]) => {
  const u = unity(g), all = combos(ORDER, g.length).map(rate), mine = rate(g);
  return {k, g, ...u, rate: mine, typical: median(all), rank: all.filter(v => v > mine + 1e-9).length + 1, tied: all.filter(v => Math.abs(v - mine) < 1e-9).length > 1, groups: all.length};
});
const [bA, bB] = blocs;
$("#title").textContent = `Bloc A voted as one on ${bA.together.length} of ${bA.pool.length} contested motions, bloc B on ${bB.together.length}`;
legend([["background:var(--a)", "Bloc A all voted the same"], ["background:var(--b)", "Bloc B all voted the same"], ["background:var(--soft)", "Bloc members split"]]);
const ord = n => ["", "first", "second", "third", "fourth", "fifth", "sixth"][n] || `${n}th`;
$("#rows").innerHTML = blocs.map(b => { const apart = b.pool.filter(m => !b.together.includes(m));
  return `<div class="row"><div class="lab"><span class="name ${b.k}">Bloc ${b.k}</span><span class="faces">${b.g.map(x => face(x, 30)).join("")}</span><span class="who">${esc(list(b.g))}</span><span class="big">${pct(b.rate)} <small>${b.together.length} of ${b.pool.length}</small></span></div>
  <div><div class="sq">${[...b.together.sort(byDate).map(m => `<i class="${b.k}" data-b="${b.k}" data-i="${m.i}"></i>`),
    ...apart.sort(byDate).map(m => `<i data-b="${b.k}" data-i="${m.i}"></i>`)].join("")}</div></div></div>`; }).join("");
let on = null;
const pick = t => {
  if (t === on) return;
  if (on) on.classList.remove("on"); on = t; t.classList.add("on");
  const b = blocs.find(x => x.k === t.dataset.b), m = M[+t.dataset.i];
  const y = [...m.codes].filter(c => c === "Y").length, n = [...m.codes].filter(c => "NB".includes(c)).length;
  $("#detail").innerHTML = `<div class="dt">${esc(m.title)}</div><div class="dm">${[m.date, m.topic].filter(Boolean).map(esc).join(" · ")} · ${m.passed ? "Passed" : "Failed"} ${y}–${n} · bloc ${b.k} ${b.together.includes(m) ? "voted as one" : "split"}</div>
    <div class="bs">${b.g.map(x => `<span>${face(x, 20)} ${esc(x)} ${ballot(m.codes[ORDER.indexOf(x)], x)}</span>`).join("")}</div>`;
};
$("#rows").addEventListener("mouseover", e => { const t = e.target.closest(".sq i"); if (t) pick(t); });
$("#rows").addEventListener("click", e => { const t = e.target.closest(".sq i"); if (t) pick(t); });
$("#rows").addEventListener("mouseleave", () => { if (on) on.classList.remove("on"); on = null; });
getData("bloc-unity", [["bloc", "motion", "date", "topic", "bloc voted as one", ...ORDER],
  ...blocs.flatMap(b => b.pool.sort(byDate).map(m => [b.k, m.title, m.date, m.topic, b.together.includes(m) ? "yes" : "no", ...[...m.codes].map(c => FULL[c])]))]);
}
