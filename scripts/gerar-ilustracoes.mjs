// Gera ilustrações SVG provisórias (substituir por fotos reais dos imóveis).
// Uso: node scripts/gerar-ilustracoes.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = new URL("../public/ilustracoes/", import.meta.url);
mkdirSync(OUT, { recursive: true });

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const PALETAS = {
  entardecer: { skyTop: "#21485a", skyMid: "#c98a6b", skyLow: "#f0c59a", sun: "#ffe2b3", hill: "#3b5b63", bld: ["#2c4750", "#36545c", "#3f5f66", "#4a6a70"], win: "#ffd9a0", winOp: 0.55, garden: "#24453f", sand: "#d8b993", seaTop: "#5f8a8c", seaLow: "#163c48", glint: "#ffe2b3" },
  dia: { skyTop: "#5f9fbf", skyMid: "#a9d0de", skyLow: "#e4f0ef", sun: "#fffbea", hill: "#6f948f", bld: ["#c9d2d0", "#dfe4e1", "#b7c3c2", "#eef1ee"], win: "#6e8d97", winOp: 0.35, garden: "#4f7a5d", sand: "#e8d7b9", seaTop: "#4f97a8", seaLow: "#1d5f72", glint: "#ffffff" },
  amanhecer: { skyTop: "#7c8fb0", skyMid: "#e3b4ae", skyLow: "#f6dcc7", sun: "#fff1df", hill: "#8b8fa3", bld: ["#a79fae", "#b7adb7", "#958ea0", "#c4bac0"], win: "#fff1df", winOp: 0.4, garden: "#5d6f63", sand: "#e9cdb3", seaTop: "#9aa9bd", seaLow: "#4b6683", glint: "#fff6ea" },
  noite: { skyTop: "#0c1b2a", skyMid: "#1c3446", skyLow: "#35546a", sun: "#f3efe0", hill: "#14273a", bld: ["#14283a", "#1a3145", "#203a4f", "#112233"], win: "#ffd58a", winOp: 0.8, garden: "#0f2324", sand: "#5e5a53", seaTop: "#1d3a4f", seaLow: "#08141f", glint: "#f3efe0" },
};

const W = 1600, H = 1000;
const wrap = (body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs>${defs}</defs>${body}</svg>`;

function skyDefs(p, id = "sky") {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.skyTop}"/><stop offset=".62" stop-color="${p.skyMid}"/><stop offset="1" stop-color="${p.skyLow}"/></linearGradient>
  <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.seaTop}"/><stop offset="1" stop-color="${p.seaLow}"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="${p.sun}" stop-opacity=".9"/><stop offset=".25" stop-color="${p.sun}" stop-opacity=".35"/><stop offset="1" stop-color="${p.sun}" stop-opacity="0"/></radialGradient>`;
}

function skyline(r, p, baseY, minH, maxH, x0 = -20, x1 = W + 20) {
  let s = "", x = x0;
  while (x < x1) {
    const w = 46 + r() * 74, h = minH + Math.pow(r(), 1.3) * (maxH - minH);
    const c = p.bld[Math.floor(r() * p.bld.length)];
    s += `<rect x="${x.toFixed(1)}" y="${(baseY - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${c}"/>`;
    const cols = Math.max(2, Math.floor(w / 14)), rows = Math.floor(h / 16);
    for (let j = 1; j < rows; j++) for (let i = 0; i < cols; i++)
      if (r() < 0.42) s += `<rect x="${(x + 5 + i * ((w - 8) / cols)).toFixed(1)}" y="${(baseY - h + j * 16).toFixed(1)}" width="5" height="6" fill="${p.win}" opacity="${(p.winOp * (0.4 + r() * 0.6)).toFixed(2)}"/>`;
    x += w + 4 + r() * 14;
  }
  return s;
}

function orla(nome, p, seed) {
  const r = rng(seed), horizon = 640;
  const sunX = 300 + r() * 1000, sunY = 300 + r() * 160;
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  b += `<circle cx="${sunX}" cy="${sunY}" r="340" fill="url(#glow)"/><circle cx="${sunX}" cy="${sunY}" r="46" fill="${p.sun}"/>`;
  b += `<path d="M-10 ${horizon - 120} C 220 ${horizon - 300}, 420 ${horizon - 330}, 640 ${horizon - 150} S 1000 ${horizon - 170}, 1180 ${horizon - 230} S 1500 ${horizon - 160}, 1620 ${horizon - 110} V ${horizon} H -10Z" fill="${p.hill}" opacity=".75"/>`;
  b += skyline(r, p, horizon, 120, 380);
  b += `<rect y="${horizon}" width="${W}" height="44" fill="${p.garden}"/>`;
  for (let x = -10; x < W; x += 26 + r() * 30) b += `<circle cx="${x.toFixed(0)}" cy="${horizon + 6}" r="${(10 + r() * 16).toFixed(0)}" fill="${p.garden}"/>`;
  b += `<rect y="${horizon + 44}" width="${W}" height="66" fill="${p.sand}"/>`;
  b += `<rect y="${horizon + 110}" width="${W}" height="${H - horizon - 110}" fill="url(#sea)"/>`;
  for (let i = 0; i < 46; i++) {
    const y = horizon + 116 + Math.pow(r(), 1.6) * 250, w = 30 + r() * 220;
    const x = sunX - w / 2 + (r() - 0.5) * (120 + (y - horizon) * 1.4);
    b += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="2" fill="${p.glint}" opacity="${(0.15 + r() * 0.45).toFixed(2)}"/>`;
  }
  b += `<path d="M0 ${horizon + 110} Q 400 ${horizon + 124} 800 ${horizon + 112} T 1600 ${horizon + 114}" stroke="#ffffff" stroke-opacity=".55" stroke-width="3" fill="none"/>`;
  writeFileSync(new URL(`${nome}.svg`, OUT), wrap(b, skyDefs(p)));
}

function interior(nome, p, seed, wall = "#ece6dc", floor = "#b99c7c") {
  const r = rng(seed);
  let b = `<rect width="${W}" height="${H}" fill="${wall}"/>`;
  // janela panorâmica
  const wx = 560, wy = 120, ww = 980, wh = 560;
  b += `<svg x="${wx}" y="${wy}" width="${ww}" height="${wh}" viewBox="0 0 ${ww} ${wh}" preserveAspectRatio="none"><rect width="${ww}" height="${wh}" fill="url(#sky)"/><circle cx="${300 + r() * 400}" cy="190" r="200" fill="url(#glow)"/><rect y="330" width="${ww}" height="${wh - 330}" fill="url(#sea)"/>`;
  for (let i = 0; i < 24; i++) b += `<rect x="${(r() * ww).toFixed(0)}" y="${(340 + r() * 200).toFixed(0)}" width="${(20 + r() * 120).toFixed(0)}" height="2" fill="${p.glint}" opacity="${(0.2 + r() * 0.4).toFixed(2)}"/>`;
  b += `</svg>`;
  b += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="none" stroke="#2b2b2b" stroke-width="10"/>`;
  for (const f of [0.33, 0.66]) b += `<rect x="${wx + ww * f - 4}" y="${wy}" width="8" height="${wh}" fill="#2b2b2b"/>`;
  b += `<rect y="680" width="${W}" height="320" fill="${floor}"/>`;
  for (let x = -200; x < W + 200; x += 120) b += `<line x1="${x}" y1="680" x2="${(x - 800) * 1.6 + 800}" y2="1000" stroke="#000" stroke-opacity=".06" stroke-width="2"/>`;
  b += `<ellipse cx="760" cy="880" rx="520" ry="80" fill="#e9e1d4" opacity=".85"/>`;
  // sofá
  b += `<rect x="260" y="640" width="720" height="190" rx="26" fill="#56676a"/><rect x="290" y="580" width="660" height="120" rx="28" fill="#647679"/><rect x="230" y="620" width="80" height="210" rx="24" fill="#4c5c5f"/><rect x="930" y="620" width="80" height="210" rx="24" fill="#4c5c5f"/>`;
  b += `<rect x="360" y="600" width="140" height="100" rx="18" fill="#c7a77c"/><rect x="740" y="604" width="130" height="96" rx="18" fill="#e3d8c6"/>`;
  // mesa de centro
  b += `<rect x="1080" y="790" width="300" height="22" rx="8" fill="#3a2f26"/><rect x="1110" y="812" width="12" height="70" fill="#3a2f26"/><rect x="1338" y="812" width="12" height="70" fill="#3a2f26"/><rect x="1150" y="756" width="70" height="34" rx="6" fill="#d9cbb4"/>`;
  // planta e luminária
  b += `<rect x="90" y="760" width="110" height="130" rx="10" fill="#8c7a66"/>`;
  for (let i = 0; i < 9; i++) b += `<ellipse cx="${145 + (r() - 0.5) * 120}" cy="${560 + r() * 190}" rx="26" ry="70" transform="rotate(${(r() - 0.5) * 70} 145 760)" fill="#3e6b4f" opacity=".9"/>`;
  b += `<line x1="420" y1="0" x2="420" y2="250" stroke="#2b2b2b" stroke-width="3"/><path d="M360 250 h120 l-26 60 h-68z" fill="#2b2b2b"/>`;
  writeFileSync(new URL(`${nome}.svg`, OUT), wrap(b, skyDefs(p)));
}

function fachada(nome, p, seed) {
  const r = rng(seed);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="1320" cy="220" r="300" fill="url(#glow)"/>`;
  const towers = [[180, 520, 60], [700, 520, 0]];
  for (const [x, w, top] of towers) {
    b += `<rect x="${x}" y="${top}" width="${w}" height="${H}" fill="${p.bld[1]}"/>`;
    for (let y = top + 30; y < H; y += 74) {
      b += `<rect x="${x - 18}" y="${y}" width="${w + 36}" height="12" fill="#f4f2ee"/>`;
      b += `<rect x="${x}" y="${y + 12}" width="${w}" height="54" fill="${p.seaLow}" opacity=".55"/>`;
      for (let i = 1; i < 5; i++) b += `<rect x="${x + (w / 5) * i}" y="${y + 12}" width="3" height="54" fill="#f4f2ee" opacity=".8"/>`;
      if (r() < 0.5) b += `<rect x="${x + 20 + r() * (w - 120)}" y="${y + 16}" width="90" height="46" fill="${p.win}" opacity="${(p.winOp * 0.7).toFixed(2)}"/>`;
      b += `<rect x="${x - 18}" y="${y + 40}" width="${w + 36}" height="3" fill="#f4f2ee" opacity=".9"/>`;
    }
  }
  // coqueiro
  b += `<path d="M1390 1000 C 1380 800, 1350 640, 1300 520" stroke="#3b3a2f" stroke-width="18" fill="none"/>`;
  for (let i = 0; i < 9; i++) {
    const a = -160 + i * 40 + (r() - 0.5) * 12;
    b += `<path d="M1300 520 q ${Math.cos(a * Math.PI / 180) * 120} ${Math.sin(a * Math.PI / 180) * 120 - 40} ${Math.cos(a * Math.PI / 180) * 260} ${Math.sin(a * Math.PI / 180) * 160 + 40}" stroke="#2f4a35" stroke-width="16" stroke-linecap="round" fill="none"/>`;
  }
  writeFileSync(new URL(`${nome}.svg`, OUT), wrap(b, skyDefs(p)));
}

function piscina(nome, p, seed) {
  const r = rng(seed), horizon = 470;
  let b = `<rect width="${W}" height="${horizon}" fill="url(#sky)"/><circle cx="${400 + r() * 800}" cy="300" r="300" fill="url(#glow)"/>`;
  b += `<rect y="${horizon}" width="${W}" height="200" fill="url(#sea)"/>`;
  b += `<rect y="600" width="${W}" height="20" fill="#f1ede6"/><rect y="560" width="${W}" height="44" fill="#ffffff" opacity=".18"/>`;
  b += `<linearGradient id="agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc7cf"/><stop offset="1" stop-color="#2a8fa0"/></linearGradient>`;
  b += `<rect y="620" width="${W}" height="380" fill="#d9cdbb"/>`;
  b += `<path d="M120 650 H1480 L1600 1000 H0Z" fill="url(#agua)"/>`;
  for (let i = 0; i < 40; i++) { const y = 660 + r() * 320, x = r() * W; b += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q 30 -8 60 0 t 60 0" stroke="#fff" stroke-opacity="${(0.2 + r() * 0.35).toFixed(2)}" stroke-width="3" fill="none"/>`; }
  for (const x of [180, 420]) b += `<path d="M${x} 640 l 160 -10 l 40 -60" stroke="#f4f2ee" stroke-width="16" stroke-linecap="round" fill="none"/>`;
  writeFileSync(new URL(`${nome}.svg`, OUT), wrap(b, skyDefs(p)));
}

function casa(nome, p, seed) {
  const r = rng(seed);
  let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="1250" cy="240" r="320" fill="url(#glow)"/>`;
  b += `<path d="M-10 520 C 300 380, 520 400, 760 470 S 1300 380, 1620 470 V 700 H -10Z" fill="${p.hill}"/>`;
  for (let i = 0; i < 40; i++) b += `<circle cx="${(r() * W).toFixed(0)}" cy="${(470 + r() * 120).toFixed(0)}" r="${(20 + r() * 40).toFixed(0)}" fill="${p.garden}" opacity=".9"/>`;
  b += `<rect y="700" width="${W}" height="300" fill="#6d8a5f"/>`;
  b += `<rect x="260" y="560" width="1080" height="24" fill="#f4f2ee"/><rect x="300" y="584" width="1000" height="150" fill="${p.seaLow}" opacity=".7"/>`;
  for (let x = 300; x <= 1300; x += 125) b += `<rect x="${x}" y="584" width="4" height="150" fill="#f4f2ee"/>`;
  b += `<rect x="420" y="430" width="680" height="22" fill="#f4f2ee"/><rect x="450" y="452" width="620" height="108" fill="#e9e4dc"/><rect x="520" y="470" width="300" height="80" fill="${p.seaLow}" opacity=".65"/>`;
  b += `<rect x="200" y="734" width="1200" height="20" fill="#e6ddcf"/><rect x="380" y="770" width="840" height="120" fill="#58b6c2"/>`;
  for (let i = 0; i < 14; i++) b += `<rect x="${(400 + r() * 760).toFixed(0)}" y="${(780 + r() * 100).toFixed(0)}" width="${(30 + r() * 70).toFixed(0)}" height="3" fill="#fff" opacity=".5"/>`;
  writeFileSync(new URL(`${nome}.svg`, OUT), wrap(b, skyDefs(p)));
}

const P = PALETAS;
orla("hero-orla", P.entardecer, 7);
orla("orla-dia", P.dia, 11);
orla("orla-amanhecer", P.amanhecer, 23);
orla("orla-noite", P.noite, 5);
orla("santos", P.entardecer, 31);
orla("sao-vicente", P.amanhecer, 41);
orla("praia-grande", P.dia, 53);
orla("guaruja", P.noite, 61);
interior("sala-entardecer", P.entardecer, 3);
interior("sala-dia", P.dia, 9, "#eef0ec", "#c3ad91");
interior("sala-amanhecer", P.amanhecer, 15, "#efe8e4", "#a98f75");
interior("sala-noite", P.noite, 19, "#d9d4cc", "#7d6955");
fachada("fachada-dia", P.dia, 2);
fachada("fachada-entardecer", P.entardecer, 4);
fachada("fachada-amanhecer", P.amanhecer, 6);
piscina("piscina-dia", P.dia, 8);
piscina("piscina-entardecer", P.entardecer, 12);
casa("casa-dia", P.dia, 14);
casa("casa-entardecer", P.entardecer, 16);
console.log("Ilustrações geradas.");
