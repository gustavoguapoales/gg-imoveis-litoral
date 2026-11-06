// Gera previa/site-previa.html: uma cópia do site em um único arquivo HTML,
// com navegação por âncoras (#), para visualização como página privada no claude.ai.
// Uso: npm run build && npx serve out -l 4173  (em outro terminal)  &&  node scripts/gerar-previa.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { imoveis, cidades } from "../src/data/imoveis.ts";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE = process.env.BASE ?? "http://localhost:4173";
const RAIZ = new URL("../", import.meta.url);

const rotas = [
  { rota: "inicio", url: "/" },
  { rota: "imoveis", url: "/imoveis/" },
  { rota: "contato", url: "/contato/" },
  { rota: "anunciar", url: "/anunciar/" },
  { rota: "avaliacao", url: "/avaliacao/" },
  { rota: "drone", url: "/drone/" },
  ...imoveis.map((i) => ({ rota: i.slug, url: `/imoveis/${i.slug}/` })),
];

function reescrever(html, rota) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/src="\/fotos\/([\w-]+)\.jpg"/g, 'data-img="$1"')
    .replace(/src="\/marca\/([\w-]+)\.png"/g, 'data-img="marca-$1"')
    .replace(/src="\/videos\/([\w-]+)\.mp4"/g, 'data-video="$1"')
    .replace(/poster="\/videos\/([\w-]+)\.jpg"/g, 'data-poster="$1"')
    .replace(/href="\/imoveis\/\?cidade=([\w-]+)"/g, 'href="#imoveis-$1"')
    .replace(/href="\/imoveis\/([\w-]+)\/"/g, 'href="#$1"')
    .replace(/href="\/imoveis\/"/g, 'href="#imoveis"')
    .replace(/href="\/(contato|anunciar|avaliacao|drone)\/"/g, 'href="#$1"')
    .replace(/href="\/#([\w-]+)"/g, 'href="#$1"')
    .replace(/href="\/"/g, 'href="#inicio"')
    .replace(/href="#interesse"/g, 'data-rolar="interesse" role="button" tabindex="0" style="cursor:pointer"')
    .replace(/id="interesse"/g, 'data-ancora="interesse"')
    .replace(/(id|for)="ct-/g, `$1="ct-${rota}-`)
    .replace(/(id|for)="(anunciar|avaliacao|drone)-/g, `$1="$2-${rota}-`);
}

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 } });
const secoes = [];
let cabecalho = "", rodape = "", flutuante = "", chatbot = "";
for (const { rota, url } of rotas) {
  await pagina.goto(BASE + url, { waitUntil: "networkidle" });
  if (rota === "contato") {
    cabecalho = await pagina.locator("header").evaluate((e) => e.outerHTML);
    rodape = await pagina.locator("footer").evaluate((e) => e.outerHTML);
    flutuante = await pagina.locator('a[aria-label="Conversar pelo WhatsApp"]').evaluate((e) => e.outerHTML);
    chatbot = await pagina.locator("[data-chatbot]").evaluate((e) => e.outerHTML);
  }
  const main = await pagina.locator("main").evaluate((e) => e.innerHTML);
  secoes.push(`<section data-rota="${rota}"${rota === "inicio" ? "" : " hidden"}>${reescrever(main, rota)}</section>`);
}
await navegador.close();

const pastaCss = new URL("out/_next/static/chunks/", RAIZ);
const css = readdirSync(pastaCss).filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(new URL(f, pastaCss), "utf8")).join("\n")
  .replace(/@font-face\{[^}]*\}/g, "");

// Fotos em versão leve (previa/fotos-leves/, se existir) para a prévia não ficar pesada.
const imagens = {};
const pastaLeve = new URL("previa/fotos-leves/", RAIZ);
let leves = [];
try { leves = readdirSync(pastaLeve); } catch {}
for (const f of readdirSync(new URL("public/fotos/", RAIZ))) {
  const arq = leves.includes(f) ? new URL(f, pastaLeve) : new URL(`public/fotos/${f}`, RAIZ);
  imagens[f.replace(".jpg", "")] = "data:image/jpeg;base64," + readFileSync(arq).toString("base64");
}
for (const f of readdirSync(new URL("public/marca/", RAIZ))) {
  imagens["marca-" + f.replace(".png", "")] = "data:image/png;base64," + readFileSync(new URL(`public/marca/${f}`, RAIZ)).toString("base64");
}
// Vídeos: usa a versão leve (previa/videos-leves/) se existir.
const videos = {};
for (const f of readdirSync(new URL("public/videos/", RAIZ))) {
  const nome = f.replace(/\.(mp4|jpg)$/, "");
  let arq = new URL(`public/videos/${f}`, RAIZ);
  try { readFileSync(new URL(`previa/videos-leves/${f}`, RAIZ)); arq = new URL(`previa/videos-leves/${f}`, RAIZ); } catch {}
  if (f.endsWith(".mp4")) videos[nome] = "data:video/mp4;base64," + readFileSync(arq).toString("base64");
  else imagens["video-" + nome] = "data:image/jpeg;base64," + readFileSync(arq).toString("base64");
}
const dados = Object.fromEntries(imoveis.map((i) => [i.slug, { ref: i.ref, titulo: i.titulo, imagens: i.imagens.map((s) => s.match(/([\w-]+)\.jpg/)[1]) }]));
const nomesCidades = Object.fromEntries(cidades.map((c) => [c.slug, c.nome]));

const script = readFileSync(new URL("scripts/previa-runtime.js", RAIZ), "utf8");
const { build } = await import("esbuild");
const motor = await build({
  stdin: { contents: 'import { responder } from "./src/lib/chatbot.ts"; window.ChatGG = { responder };', resolveDir: new URL(".", RAIZ).pathname, loader: "ts" },
  bundle: true, format: "iife", minify: true, write: false, logLevel: "warning",
});
const motorChat = motor.outputFiles[0].text;

const html = `<title>GG Imóveis Litoral</title>
<meta name="description" content="Prévia do site GG Imóveis Litoral">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{--font-bodoni:"Bodoni Moda",Didot,"Times New Roman",serif;--font-albert:"Albert Sans","Helvetica Neue",Arial,sans-serif;--font-plex-mono:"IBM Plex Mono",ui-monospace,monospace;color-scheme:light}
${css}
body{background:#f8f9f7;color:#0e2b33;font-size:16px;margin:0}
header.previa-transp{background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}
header.previa-transp .text-tinta{color:#fff!important}
header.previa-transp .logo-escuro{display:none!important}
header.previa-transp .logo-claro{display:block!important}
.previa-aviso{position:fixed;left:max(16px,env(safe-area-inset-left));bottom:max(16px,env(safe-area-inset-bottom));z-index:35;background:#0e2b33;color:#fff;font:500 12px var(--font-albert);padding:8px 14px;border-radius:999px;opacity:.9;pointer-events:none;white-space:nowrap}
.previa-caixa{position:fixed;inset:0;z-index:60;background:rgba(7,20,25,.96);display:flex;flex-direction:column}
.previa-caixa img{max-width:100%;max-height:100%;object-fit:contain}
.previa-ok{border-radius:4px;background:#e6f4ec;border:1px solid #b9dfc8;padding:14px 16px;font-size:14px}
</style>
${reescrever(cabecalho, "cab")}
<main class="flex-1">${secoes.join("\n")}</main>
${reescrever(rodape, "rod")}
${flutuante}
${reescrever(chatbot, "chat")}
<div class="previa-aviso">Prévia · imóveis e imagens ilustrativos</div>
<script>${motorChat}</script>
<script>
const IMG=${JSON.stringify(imagens)};
const VIDEOS=${JSON.stringify(videos)};
const DADOS=${JSON.stringify(dados)};
const CIDADES=${JSON.stringify(nomesCidades)};
${script}
</script>`;

mkdirSync(new URL("previa/", RAIZ), { recursive: true });
writeFileSync(new URL("previa/site-previa.html", RAIZ), html);
console.log(`previa/site-previa.html gerado (${(html.length / 1024).toFixed(0)} KB, ${secoes.length} páginas)`);
