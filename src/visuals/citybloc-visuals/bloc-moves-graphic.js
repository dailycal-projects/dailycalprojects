/* eslint-disable */
// Adapted from eshabansiya/dailycal-citybloc graphics/bloc-moves.html.
import DATA from './bloc-moves-data.json';
import PHOTOS from './photos.json';

export const html = "<style>\n:host{\n  --bloc-a:#1d6fa5;\n  --bloc-b:#e3792b;\n  --neither:#8c8c8c;\n  --primary:#23517a;\n  --secondary:#4ba3cc;\n  --text:#1d1d1d;\n  --text-light:#707070;\n  --background:#ffffff;\n  --gridline:#e6e6e6;\n  --vote-aye:#4ba3cc;\n  --vote-no:#1d1d1d;\n  --vote-abstain:#f0b429;\n  --font:Roboto,\"Helvetica Neue\",Helvetica,Arial,sans-serif;\n}\n:host{--paper:var(--background);--panel:var(--background);--ink:var(--text);--ink-2:color-mix(in srgb,var(--text) 82%,var(--background));--muted:var(--text-light);\n--line:var(--gridline);--hair:color-mix(in srgb,var(--gridline) 60%,var(--background));--soft:color-mix(in srgb,var(--gridline) 70%,var(--background));\n--a:var(--bloc-a);--a-soft:color-mix(in srgb,var(--bloc-a) 14%,var(--background));--a-ink:color-mix(in srgb,var(--bloc-a) 80%,#000);\n--b:var(--bloc-b);--b-soft:color-mix(in srgb,var(--bloc-b) 16%,var(--background));--b-ink:color-mix(in srgb,var(--bloc-b) 70%,#000);\n--u:var(--neither);--u-soft:color-mix(in srgb,var(--neither) 14%,var(--background));--u-ink:color-mix(in srgb,var(--neither) 60%,#000);\n--split:var(--primary);--contest:var(--secondary);--heat:var(--primary);--heat-on:#fff;--sans:var(--font);--serif:var(--font)}\n*{box-sizing:border-box}\n:host{display:block;margin:0;background:var(--background);color:var(--text);font-family:var(--font);font-size:14px;line-height:1.45}\nbutton,input,select{font:inherit;color:inherit}button{cursor:pointer}\n.fig{max-width:820px;margin:0 auto;padding:12px 10px 10px}\n.fig h1{margin:0;font:700 26px/1.2 var(--font);letter-spacing:-.01em}\n.fig .sub{margin:6px 0 16px;color:var(--text);font-size:15px;line-height:1.4}\n.fig .note{margin:14px 0 0;color:var(--text-light);font-size:12px}\n.footer{margin-top:14px;color:var(--text-light);font-size:12px}\n.footer a{color:var(--primary);text-decoration:none}.footer a:hover{text-decoration:underline}\n.dw-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0 0 12px;font-size:14px}\n.dw-legend{color:var(--text)}.dw-legend i{display:inline-block;width:18px;height:18px;margin-right:6px;vertical-align:-4px}\n.face{flex:none;display:inline-block;border-radius:50%;vertical-align:middle;background:var(--soft);box-shadow:0 0 0 2px var(--u)}.face.A{box-shadow:0 0 0 2px var(--a)}.face.B{box-shadow:0 0 0 2px var(--b)}\n.name.has-face:before{display:none}.name.has-face .face{margin:-3px 7px -3px 2px}\n.name{white-space:nowrap}.name:before{content:\"\";display:inline-block;width:9px;height:9px;margin-right:6px;background:var(--u);vertical-align:0}.name.A:before{background:var(--a)}.name.B:before{background:var(--b)}\n.ballot{display:inline-grid;place-items:center;min-width:28px;height:22px;padding:0 3px;font-size:10px;font-weight:700}\n.vY{background:var(--vote-aye);color:#fff}.vN{background:var(--vote-no);color:#fff}.vB{background:var(--vote-abstain);color:var(--text)}.vX{color:var(--muted)}\n.chip{padding:2px 7px;font-size:12.5px;font-weight:700;background:var(--u-soft);color:var(--u-ink)}\n.chip.A{background:var(--a-soft);color:var(--a-ink)}.chip.B{background:var(--b-soft);color:var(--b-ink)}\n.gA{background:var(--a)}.gB{background:var(--b)}.gU{background:var(--u)}\n@media(max-width:600px){.fig h1{font-size:21px}.fig .sub{font-size:14px}}\n\n.controls{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 14px}\n.seg{display:inline-flex;flex-wrap:wrap;border:1px solid var(--gridline)}\n.seg button{border:0;border-right:1px solid var(--gridline);background:var(--background);padding:7px 12px;font-size:13px;font-weight:500;color:var(--text)}\n.seg button:last-child{border-right:0}\n.seg button small{color:var(--text-light);font-weight:400;margin-left:4px}\n.seg button[aria-pressed=\"true\"]{background:var(--text);color:var(--background)}.seg button[aria-pressed=\"true\"] small{color:inherit;opacity:.75}\n.stage{position:relative;margin-bottom:4px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}\n.zone{position:relative;padding:34px 0 10px;min-height:120px}\n.zone.A{background:var(--a-soft)}.zone.U{background:var(--u-soft)}.zone.B{background:var(--b-soft)}\n.zone h2{position:absolute;top:8px;left:10px;right:10px;margin:0;font-size:13px;font-weight:700;display:flex;justify-content:space-between;gap:6px}\n.zone.A h2{color:var(--a-ink)}.zone.B h2{color:var(--b-ink)}.zone.U h2{color:var(--u-ink)}\n.zone h2 span{font-weight:400;color:var(--text-light);font-size:12px}\n.pill{position:absolute;left:0;top:0;width:calc((100% - 16px) / 3 - 24px);height:30px;display:flex;align-items:center;gap:7px;padding:0 10px;background:var(--background);\n  font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;transition:transform .8s cubic-bezier(.6,.05,.25,1),box-shadow .3s,opacity .3s;box-shadow:0 1px 2px #0002}\n.pill .face{margin-left:-4px}\n.pill.na{opacity:.35}\n@media(max-width:600px){.pill{font-size:11.5px;padding:0 6px;gap:5px;width:calc((100% - 16px) / 3 - 8px)}}\n</style><figure class=\"fig\">\n  <h1>Overall blocs hold the most for Policing & Advocacy</h1>\n  <p class=\"sub\">Pick a topic to see who council members voted with on that topic's contested votes.</p>\n  <div class=\"dw-legend\" id=\"legend\"></div>\n  <div class=\"controls\"><div class=\"seg\" id=\"seg\" role=\"group\" aria-label=\"Topic\"></div></div>\n  <div class=\"stage\" id=\"stage\">\n    <div class=\"zone A\"><h2>Bloc A's group<span id=\"held-A\"></span></h2></div>\n    <div class=\"zone U\"><h2>On their own</h2></div>\n    <div class=\"zone B\"><h2>Bloc B's group<span id=\"held-B\"></span></h2></div>\n  </div>\n  <p class=\"note\">Groups come from clustering members on one topic's contested votes at a time. Because of small sample sizes, movement is uncertain.</p>\n  <div class=\"footer\">Chart: Esha Bansiya / The Daily Californian \u00b7 Source: Berkeley City Council minutes, <span data-range></span></div>\n</figure>";

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

legend([["background:var(--a);border-radius:50%", "Usually votes with bloc A"], ["background:var(--b);border-radius:50%", "Usually votes with bloc B"], ["background:var(--u);border-radius:50%", "Usually in neither bloc"]]);
const groupBloc = g => { const a = g.filter(n => blocOf(n) === "A").length, b = g.filter(n => blocOf(n) === "B").length; return a > b ? "A" : b > a ? "B" : "U"; };
const STEPS = [{name: "Overall", full: "All contested votes", n: D.info.n_contested, of: Object.fromEntries(ORDER.map(n => [n, blocOf(n)])), held: {}}];
D.topic_blocs.forEach(([topic, n, , groups]) => {
  const of = {}, held = {};
  groups.forEach(([g, s]) => { const gb = g.length > 1 ? groupBloc(g) : "U"; g.forEach(m => of[m] = gb); if (g.length > 1 && gb !== "U") held[gb] = s; });
  STEPS.push({name: topic.replace(" & surveillance", "").replace(" & zoning", "").replace(" & resolutions", ""), full: topic, n, of, held});
});
const ZONES = ["A", "U", "B"];

$("#seg").innerHTML = STEPS.map((s, k) => `<button type="button" data-k="${k}" aria-pressed="${k === 0}">${esc(s.name)}<small>${s.n}</small></button>`).join("");
const stage = $("#stage");
stage.insertAdjacentHTML("beforeend", ORDER.map(n => `<div class="pill ${blocOf(n)}" data-n="${esc(n)}">${face(n, 22)}<span>${esc(n)}</span></div>`).join(""));
const pills = Object.fromEntries([...stage.querySelectorAll(".pill")].map(p => [p.dataset.n, p]));
const maxIn = Math.max(...STEPS.flatMap(s => ZONES.map(z => ORDER.filter(n => (s.of[n] || "U") === z).length)));
const SLOT = 36, TOP = 34;
stage.querySelectorAll(".zone").forEach(z => z.style.minHeight = `${TOP + maxIn * SLOT + 8}px`);
let cur = 0;
const show = k => {
  cur = k; const s = STEPS[k];
  $("#seg").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.k === k)));
  const zw = stage.querySelector(".zone").getBoundingClientRect().width, gap = 8;
  ZONES.forEach((z, zi) => {
    ORDER.filter(n => (s.of[n] || "U") === z).forEach((n, r) => {
      const p = pills[n];
      p.style.transform = `translate(${zi * (zw + gap) + 12}px, ${TOP + r * SLOT}px)`;
      p.classList.toggle("na", !s.of[n]);
    });
  });
  $("#held-A").textContent = s.held.A != null ? `held ${pct(s.held.A)}` : ""; $("#held-B").textContent = s.held.B != null ? `held ${pct(s.held.B)}` : "";
};
$("#seg").addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(+b.dataset.k); });
addEventListener("resize", () => show(cur), { signal });
const start = STEPS.findIndex(s => location.hash && s.name.toLowerCase().replace(/\s+/g, "-") === decodeURIComponent(location.hash.slice(1)).toLowerCase());
stage.querySelectorAll(".pill").forEach(p => p.style.transition = "none");
show(start > 0 ? start : 0);
requestAnimationFrame(() => requestAnimationFrame(() => stage.querySelectorAll(".pill").forEach(p => p.style.transition = "")));

getData("bloc-moves", [["member", "usual bloc", ...STEPS.map(s => s.full)],
  ...ORDER.map(n => [n, blocOf(n) === "U" ? "neither" : blocOf(n), ...STEPS.map(s => s.of[n] ? (s.of[n] === "U" ? "on their own" : `bloc ${s.of[n]} group`) : "too few votes")])]);
}
