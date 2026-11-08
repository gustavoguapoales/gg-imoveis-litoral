// Gera material de divulgação de um imóvel publicado: post (4:5), story (9:16), reel (vídeo 9:16) e legenda.
// Usa os dados e fotos do próprio site (banco D1 + fotos públicas) e a identidade visual da GG Imóveis Litoral.
//
// Uso: node scripts/divulgacao/gerar.mjs GG-0157 [pasta-de-saida]
// Requer: wrangler com acesso à conta (CLOUDFLARE_API_TOKEN), ffmpeg e Playwright.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const SITE = "https://ggimoveislitoral.com";
const WHATS = "(13) 99777-1730";
const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

const ref = process.argv[2];
if (!/^GG-\d{4,6}$/.test(ref ?? "")) throw new Error("Informe a referência, ex.: GG-0157");
const saida = path.resolve(process.argv[3] ?? path.join(RAIZ, "previa", "divulgacao", ref));
mkdirSync(saida, { recursive: true });

// 1) Dados públicos do imóvel (nunca os privados)
const json = execFileSync("npx", ["wrangler", "d1", "execute", "gg-imoveis", "--remote", "--json", "--command",
  `SELECT publico, status FROM imoveis WHERE ref = '${ref}'`], { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
const linha = JSON.parse(json)[0].results[0];
if (!linha) throw new Error(`Imóvel ${ref} não encontrado`);
if (!["Disponível", "Reservado"].includes(linha.status)) throw new Error(`${ref} não está publicado no site (status: ${linha.status})`);
const im = JSON.parse(linha.publico);

// 2) Fotos (do site) em data URI, para usar no layout e no vídeo
const fotos = [];
for (const [k, src] of im.imagens.slice(0, 5).entries()) {
  const r = await fetch(new URL(src, SITE));
  if (!r.ok) continue;
  const arq = path.join(saida, `foto-${k + 1}.jpg`);
  writeFileSync(arq, Buffer.from(await r.arrayBuffer()));
  fotos.push(arq);
}
if (!fotos.length) throw new Error("O imóvel não tem fotos acessíveis no site");
const dataUri = (arq, tipo = "image/jpeg") => `data:${tipo};base64,${readFileSync(arq).toString("base64")}`;
const logo = dataUri(path.join(RAIZ, "public/marca/logo-clara.png"), "image/png");

// 3) Textos
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const preco = im.finalidade === "aluguel" ? `${brl(im.preco)}/mês` : brl(im.preco);
const selo = im.finalidade === "aluguel" ? "PARA ALUGAR" : "À VENDA";
const praia = im.distanciaPraia <= 50 ? "Frente mar" : `${im.distanciaPraia} m da praia`;
const specs = [
  `${im.area} m²`,
  im.tipo !== "Sala comercial" && im.dormitorios ? `${im.dormitorios} dorm.` : "",
  im.tipo !== "Sala comercial" && im.suites ? `${im.suites} suíte${im.suites > 1 ? "s" : ""}` : "",
  im.vagas ? `${im.vagas} vaga${im.vagas > 1 ? "s" : ""}` : "",
].filter(Boolean);
const link = `${SITE.replace("https://", "")}/imoveis/${im.slug}`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600;700&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=IBM+Plex+Mono:wght@500&display=swap');
*{box-sizing:border-box;margin:0}
:root{--tinta:#04222b;--latao:#ffc400;--papel:#f8fafb;--mar:#0d4c8f}
body{width:var(--w);height:var(--h);font-family:'Albert Sans',Arial,sans-serif;color:#fff;overflow:hidden;background:transparent}
.disp{font-family:'Bodoni Moda',Didot,serif;font-weight:400;line-height:1.05;letter-spacing:-.01em}
.mono{font-family:'IBM Plex Mono',monospace;letter-spacing:.14em;text-transform:uppercase}
.selo{display:inline-block;background:var(--latao);color:var(--tinta);font-weight:700;letter-spacing:.08em;border-radius:999px}
.chip{display:inline-block;border:2px solid rgba(255,255,255,.35);border-radius:999px}
`;

function layoutCartaz(w, h) {
  const fotoH = Math.round(h * (h > w * 1.5 ? 0.6 : 0.62));
  const s = w / 1080;
  return `<style>${css} body{--w:${w}px;--h:${h}px;background:var(--tinta)}</style>
  <div style="position:relative;height:${fotoH}px;background:url(${dataUri(fotos[0])}) center/cover">
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,34,43,.55) 0%,rgba(4,34,43,0) 30%,rgba(4,34,43,0) 70%,rgba(4,34,43,1) 100%)"></div>
    <img src="${logo}" style="position:absolute;top:${44 * s}px;left:${56 * s}px;height:${96 * s}px">
    <span class="selo" style="position:absolute;top:${66 * s}px;right:${56 * s}px;font-size:${26 * s}px;padding:${12 * s}px ${28 * s}px">${selo}</span>
  </div>
  <div style="padding:0 ${64 * s}px;margin-top:${-70 * s}px;position:relative">
    <p class="mono" style="font-size:${24 * s}px;color:#ffd24d">${im.bairro} · ${im.cidade} · ${praia}</p>
    <h1 class="disp" style="font-size:${(h > w * 1.5 ? 88 : 76) * s}px;margin-top:${18 * s}px">${im.titulo}</h1>
    <div style="display:flex;flex-wrap:wrap;gap:${14 * s}px;margin-top:${34 * s}px">${specs.map((t) => `<span class="chip" style="font-size:${28 * s}px;padding:${10 * s}px ${24 * s}px">${t}</span>`).join("")}</div>
    <p style="font-size:${(h > w * 1.5 ? 84 : 72) * s}px;font-weight:700;margin-top:${h > w * 1.5 ? 60 * s : 34 * s}px">${preco}</p>
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0;padding:${30 * s}px ${64 * s}px;background:rgba(255,255,255,.06);display:flex;justify-content:space-between;align-items:center;font-size:${28 * s}px">
    <span>WhatsApp <b>${WHATS}</b></span><span class="mono" style="font-size:${22 * s}px;opacity:.8">Ref ${im.ref}</span>
  </div>`;
}

// Camadas transparentes do reel
const camadaIntro = `<style>${css} body{--w:1080px;--h:1920px}</style>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,34,43,.75) 0%,rgba(4,34,43,0) 28%,rgba(4,34,43,0) 55%,rgba(4,34,43,.9) 100%)"></div>
  <img src="${logo}" style="position:absolute;top:90px;left:70px;height:120px">
  <div style="position:absolute;left:70px;right:70px;bottom:260px">
    <span class="selo" style="font-size:30px;padding:14px 32px">${selo}</span>
    <h1 class="disp" style="font-size:104px;margin-top:34px">${im.titulo}</h1>
    <p class="mono" style="font-size:30px;margin-top:28px;color:#ffd24d">${im.bairro} · ${im.cidade}</p>
  </div>`;
const camadaInfo = `<style>${css} body{--w:1080px;--h:1920px}</style>
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,34,43,0) 45%,rgba(4,34,43,.92) 100%)"></div>
  <div style="position:absolute;left:70px;right:70px;bottom:260px">
    <div style="display:flex;flex-wrap:wrap;gap:16px">${[...specs, praia].map((t) => `<span class="chip" style="font-size:36px;padding:14px 30px;background:rgba(4,34,43,.4)">${t}</span>`).join("")}</div>
    <p style="font-size:110px;font-weight:700;margin-top:44px">${preco}</p>
  </div>`;
const camadaFinal = `<style>${css} body{--w:1080px;--h:1920px;background:var(--tinta)}</style>
  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:90px">
    <img src="${logo}" style="height:200px">
    <p class="disp" style="font-size:86px;margin-top:80px">Agende sua visita</p>
    <p style="font-size:44px;margin-top:40px;opacity:.85">WhatsApp</p>
    <p style="font-size:72px;font-weight:700;margin-top:8px">${WHATS}</p>
    <p class="mono" style="font-size:30px;margin-top:70px;color:#ffd24d">ggimoveislitoral.com</p>
    <p class="mono" style="font-size:24px;margin-top:22px;opacity:.6">Ref ${im.ref}</p>
  </div>`;

const nav = await chromium.launch();
async function render(html, w, h, arq, transparente = false) {
  const p = await nav.newPage({ viewport: { width: w, height: h } });
  await p.setContent(html, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: arq, omitBackground: transparente, type: arq.endsWith(".png") ? "png" : "jpeg", quality: arq.endsWith(".png") ? undefined : 90 });
  await p.close();
}
await render(layoutCartaz(1080, 1350), 1080, 1350, path.join(saida, "post-1080x1350.jpg"));
await render(layoutCartaz(1080, 1920), 1080, 1920, path.join(saida, "story-1080x1920.jpg"));
await render(camadaIntro, 1080, 1920, path.join(saida, "_intro.png"), true);
await render(camadaInfo, 1080, 1920, path.join(saida, "_info.png"), true);
await render(camadaFinal, 1080, 1920, path.join(saida, "_final.png"));
await nav.close();

// 4) Reel: fotos com movimento lento + textos + cartão final (~16 s)
const cenas = fotos.slice(0, 4);
const dur = 3.6, fade = 0.6;
const args = [];
let fc = "";
cenas.forEach((f, i) => {
  args.push("-loop", "1", "-t", String(dur), "-i", f);
  const z = i % 2 ? "if(eq(on,1),1.16,max(zoom-0.0012,1.0))" : "min(zoom+0.0012,1.16)";
  fc += `[${i}:v]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,zoompan=z='${z}':d=${Math.round(dur * 30)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30,setsar=1,format=yuv420p[c${i}];`;
});
const n = cenas.length;
args.push("-loop", "1", "-t", "3.4", "-i", path.join(saida, "_final.png"));
fc += `[${n}:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[fim];`;
let ant = "c0", off = dur - fade;
for (let i = 1; i < n; i++) { fc += `[${ant}][c${i}]xfade=transition=fade:duration=${fade}:offset=${off.toFixed(2)}[x${i}];`; ant = `x${i}`; off += dur - fade; }
fc += `[${ant}][fim]xfade=transition=fade:duration=${fade}:offset=${off.toFixed(2)}[base];`;
args.push("-i", path.join(saida, "_intro.png"), "-i", path.join(saida, "_info.png"));
const fimFotos = off;
fc += `[base][${n + 1}:v]overlay=0:0:enable='between(t,0.3,${(dur * 1.6).toFixed(2)})'[b1];[b1][${n + 2}:v]overlay=0:0:enable='between(t,${(dur * 1.75).toFixed(2)},${(fimFotos - 0.1).toFixed(2)})',fade=t=in:st=0:d=0.4[v]`;
execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args, "-filter_complex", fc, "-map", "[v]", "-t", (off + 3.4).toFixed(2), "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", path.join(saida, "reel-1080x1920.mp4")]);

// 5) Legenda pronta para Instagram/TikTok
const tag = (t) => `#${t.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "")}`;
const legenda = [
  `🏡 ${im.titulo}`,
  `📍 ${im.bairro}, ${im.cidade} · ${praia}`,
  `📐 ${specs.join(" · ")}`,
  `💰 ${preco}`,
  "",
  im.resumo || (im.descricao?.[0] ?? ""),
  "",
  `📲 Agende sua visita pelo WhatsApp ${WHATS}`,
  `🔗 Detalhes e mais fotos: ${link}`,
  "",
  [tag(im.cidade), tag(`imoveis${im.cidade}`), tag(im.bairro), "#litoralpaulista", "#imoveisnolitoral", "#corretordeimoveis", "#ggimoveislitoral", im.finalidade === "aluguel" ? "#aluguel" : "#imovelavenda"].join(" "),
].join("\n");
writeFileSync(path.join(saida, "legenda.txt"), legenda);
console.log(`Material de ${ref} gerado em ${saida}`);
