/* eslint-disable */
// Adapted from eshabansiya/dailycal-citybloc graphics/split-sides.html.
import DATA from './dissents-data.json';
import PHOTOS from './photos.json';

export const html = "<style>\n:host{\n  --bloc-a:#1d6fa5;\n  --bloc-b:#e3792b;\n  --neither:#8c8c8c;\n  --primary:#23517a;\n  --secondary:#4ba3cc;\n  --text:#1d1d1d;\n  --text-light:#707070;\n  --background:#ffffff;\n  --gridline:#e6e6e6;\n  --vote-aye:#4ba3cc;\n  --vote-no:#1d1d1d;\n  --vote-abstain:#f0b429;\n  --font:Roboto,\"Helvetica Neue\",Helvetica,Arial,sans-serif;\n}\n:host{--paper:var(--background);--panel:var(--background);--ink:var(--text);--ink-2:color-mix(in srgb,var(--text) 82%,var(--background));--muted:var(--text-light);\n--line:var(--gridline);--hair:color-mix(in srgb,var(--gridline) 60%,var(--background));--soft:color-mix(in srgb,var(--gridline) 70%,var(--background));\n--a:var(--bloc-a);--a-soft:color-mix(in srgb,var(--bloc-a) 14%,var(--background));--a-ink:color-mix(in srgb,var(--bloc-a) 80%,#000);\n--b:var(--bloc-b);--b-soft:color-mix(in srgb,var(--bloc-b) 16%,var(--background));--b-ink:color-mix(in srgb,var(--bloc-b) 70%,#000);\n--u:var(--neither);--u-soft:color-mix(in srgb,var(--neither) 14%,var(--background));--u-ink:color-mix(in srgb,var(--neither) 60%,#000);\n--split:var(--primary);--contest:var(--secondary);--heat:var(--primary);--heat-on:#fff;--sans:var(--font);--serif:var(--font)}\n*{box-sizing:border-box}\n:host{display:block;margin:0;background:var(--background);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.45}\nbutton,input,select{font:inherit;color:inherit}button{cursor:pointer}\n.fig{max-width:820px;margin:0 auto;padding:12px 10px 10px}\n.fig h1{margin:0;font:700 26px/1.2 var(--font);letter-spacing:-.01em}\n.fig .sub{margin:6px 0 16px;color:var(--text);font-size:15px;line-height:1.4}\n.fig .note{margin:14px 0 0;color:var(--text-light);font-size:12px}\n.footer{margin-top:14px;color:var(--text-light);font-size:12px}\n.footer a{color:var(--primary);text-decoration:none}.footer a:hover{text-decoration:underline}\n.dw-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0 0 12px;font-size:14px}\n.dw-legend{color:var(--text)}.dw-legend i{display:inline-block;width:18px;height:18px;margin-right:6px;vertical-align:-4px}\n.face{flex:none;display:inline-block;border-radius:50%;vertical-align:middle;background:var(--soft);box-shadow:0 0 0 2px var(--u)}.face.A{box-shadow:0 0 0 2px var(--a)}.face.B{box-shadow:0 0 0 2px var(--b)}\n.name.has-face:before{display:none}.name.has-face .face{margin:-3px 7px -3px 2px}\n.name{white-space:nowrap}.name:before{content:\"\";display:inline-block;width:9px;height:9px;margin-right:6px;background:var(--u);vertical-align:0}.name.A:before{background:var(--a)}.name.B:before{background:var(--b)}\n.ballot{display:inline-grid;place-items:center;min-width:28px;height:22px;padding:0 3px;font-size:10px;font-weight:700}\n.vY{background:var(--vote-aye);color:#fff}.vN{background:var(--vote-no);color:#fff}.vB{background:var(--vote-abstain);color:var(--text)}.vX{color:var(--muted)}\n.chip{padding:2px 7px;font-size:12.5px;font-weight:700;background:var(--u-soft);color:var(--u-ink)}\n.chip.A{background:var(--a-soft);color:var(--a-ink)}.chip.B{background:var(--b-soft);color:var(--b-ink)}\n.gA{background:var(--a)}.gB{background:var(--b)}.gU{background:var(--u)}\n@media(max-width:600px){.fig h1{font-size:21px}.fig .sub{font-size:14px}}\n\n.scroll{overflow-x:auto}\n.ss{border-collapse:separate;border-spacing:3px;width:100%;min-width:700px;table-layout:fixed}\n.ss th{font-weight:700;font-size:12px}\n.ss th.rn{width:122px;text-align:left;font-size:13.5px;padding-right:6px}\n.ss thead th.vh{vertical-align:bottom;text-align:center;padding:0 0 4px;font-size:10px;line-height:1.15;color:var(--text);cursor:default}\n.ss thead th.vh b{display:block;font-size:12px}\n.ss thead th.vh small{display:block;color:var(--text-light);font-weight:400;font-size:10.5px}\n.ss tr.lab th{text-align:left;font-size:12px;color:var(--text-light);padding:10px 0 0}\n.ss td.c{height:30px;text-align:center;font-size:11px;font-weight:700;color:#fff}\n.ss td.c.A{background:var(--a)}.ss td.c.B{background:var(--b)}\n.ss td.c.X{background:var(--background);color:var(--text-light);box-shadow:inset 0 0 0 1px var(--gridline)}\n.ss td.c.brk{box-shadow:inset 0 0 0 2px var(--text),inset 0 0 0 4px var(--background)}\n.ss tr.won th{text-align:left;font-size:12.5px;padding-top:12px}\n.ss tr.won td.c{height:22px;font-size:10px}\n.ss tr.won td{padding-top:12px}\n.wrap{position:relative;min-width:700px}\n#colbox{position:absolute;border:1.5px solid var(--text);pointer-events:none;display:none}\n.detail{margin:12px 0 0;height:84px;overflow:hidden;font-size:14px;line-height:1.4;padding:10px 12px;background:var(--soft)}\n@media(max-width:600px){.detail{height:104px}}\n.detail b{font-weight:700}.detail .m{color:var(--text-light)}\n.sw-brk{display:inline-block;width:18px;height:18px;margin-right:6px;vertical-align:-4px;background:var(--b);box-shadow:inset 0 0 0 2px var(--text),inset 0 0 0 4px var(--background)}\n</style><figure class=\"fig\">\n  <h1>Council member's votes on the 10 contested motions</h1>\n  <p class=\"sub\">Each column is one of the <span id=\"n\"></span> motions where most of bloc A and most of bloc B voted opposite ways, in date order. Hover a column to see the motion.</p>\n  <div class=\"dw-legend\" id=\"legend\"></div>\n  <div class=\"scroll\"><div class=\"wrap\"><table class=\"ss\" id=\"ss\"></table><div id=\"colbox\" aria-hidden=\"true\"></div></div></div>\n  <p class=\"detail\" id=\"detail\"><span class=\"m\">Hover or tap a column to see the motion.</span></p>\n  <p class=\"note\">An abstention counts as opposing the motion. </p>\n  <div class=\"footer\">Chart: Esha Bansiya / The Daily Californian \u00b7 Source: Berkeley City Council minutes, <span data-range></span></div>\n</figure>";

export function mount(root, createDownload, signal) {
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

const splits = motions().filter(m => m.level === 2).sort((x, y) => x.date.localeCompare(y.date) || x.i - y.i);
$("#n").textContent = splits.length;
legend([["background:var(--a)", "Took bloc A's side"], ["background:var(--b)", "Took bloc B's side"],
        ["background:var(--background);box-shadow:inset 0 0 0 1px var(--gridline)", "Didn't vote"],
        [null, `<i class="sw-brk"></i>Broke from their own bloc`], [null, `<b style="margin-right:6px">Aye / No / Ab</b>How they voted (Ab = abstained)`]]);
const posA = m => m.a >= 0.5 ? "Y" : "N";
const sideOf = (m, n) => { const c = m.codes[ORDER.indexOf(n)]; if (!"YNB".includes(c)) return null; return ((c === "Y") === (posA(m) === "Y")) ? "A" : "B"; };
const wonBy = m => (posA(m) === "Y") === m.passed ? "A" : "B";
const SHORT = {"Policing & surveillance": "Policing", "Budget, taxes & fees": "Budget", "Procedural & agenda": "Proce\u00addural", "Advocacy & resolutions": "Advo\u00adcacy",
               "Land use & zoning": "Land use", "Streets & transport": "Streets", "Homelessness": "Homeless", "Community grants & culture": "Community"};
const mon = d => d ? new Date(d + "T12:00").toLocaleDateString("en-US", {month: "short", year: "2-digit"}).replace(" ", " ’") : "";
const cols = `<colgroup><col style="width:122px">${splits.map(() => `<col class="vcol">`).join("")}</colgroup>`;
const head = `<thead><tr><th class="rn"></th>${splits.map((m, k) => `<th class="vh" data-k="${k}"><b>${k + 1}</b>${esc(SHORT[m.topic] || m.topic)}<small>${mon(m.date)}</small></th>`).join("")}</tr></thead>`;
const row = n => {
  const sides = splits.map(m => sideOf(m, n)), own = blocOf(n);
  const cells = splits.map((m, k) => { const s = sides[k], c = m.codes[ORDER.indexOf(n)];
    if (!s) return `<td class="c X" data-k="${k}" data-n="${esc(n)}">${c === "a" ? "abs" : c === "r" ? "rec" : "–"}</td>`;
    const brk = own !== "U" && s !== own;
    return `<td class="c ${s}${brk ? " brk" : ""}" data-k="${k}" data-n="${esc(n)}">${{Y: "Aye", N: "No", B: "Ab"}[c]}</td>`; }).join("");
  return `<tr><th class="rn">${nameTag(n)}</th>${cells}</tr>`;
};
const won = `<tr class="won"><th>Side that won</th>${splits.map((m, k) => { const w = wonBy(m); return `<td class="c ${w}" data-k="${k}">${w}</td>`; }).join("")}</tr>`;
$("#ss").innerHTML = cols + head + `<tbody>` + [["Bloc A", A], ["Bloc B", B], ["Neither bloc", U]].map(([l, g]) => `<tr class="lab"><th colspan="${splits.length + 1}">${l}</th></tr>${g.map(row).join("")}`).join("") + won + `</tbody>`;
const box = $("#colbox"), wrap = $(".wrap");
let hk = -1;
const showCol = k => {
  if (k === hk) return; hk = k;
  if (k < 0) { box.style.display = "none"; return; }
  const top = $(`#ss th.vh[data-k="${k}"]`).getBoundingClientRect(), bot = $(`#ss tr.won td[data-k="${k}"]`).getBoundingClientRect(), w = wrap.getBoundingClientRect();
  Object.assign(box.style, {display: "block", left: `${top.left - w.left - 2}px`, top: `${top.top - w.top - 2}px`, width: `${top.width + 4}px`, height: `${bot.bottom - top.top + 4}px`});
  const m = splits[k], won = wonBy(m), ay = [...m.codes].filter(c => c === "Y").length, ag = [...m.codes].filter(c => c === "N" || c === "B").length;
  $("#detail").innerHTML = `<b>${k + 1}. ${esc(m.title)}</b><br><span class="m">${m.date} · ${esc(m.topic)} · ${m.passed ? "Passed" : "Failed"} ${ay}–${ag} · bloc ${won}'s side won</span>`;
};
$("#ss").addEventListener("mouseover", e => { const t = e.target.closest("[data-k]"); if (t) showCol(+t.dataset.k); });
$("#ss").addEventListener("click", e => { const t = e.target.closest("[data-k]"); if (t) showCol(+t.dataset.k); });
addEventListener("resize", () => { const k = hk; hk = -1; showCol(k); }, { signal });
getData("split-sides", [["member", "usual bloc", ...splits.map((m, k) => `${k + 1}. ${m.date} ${m.title}`)],
  ...ORDER.map(n => [n, blocOf(n) === "U" ? "neither" : blocOf(n), ...splits.map(m => sideOf(m, n) ? `bloc ${sideOf(m, n)} side` : FULL[m.codes[ORDER.indexOf(n)]])]),
  ["Side that won", "", ...splits.map(m => `bloc ${wonBy(m)}`)]]);
}
