// Gera previa/painel-previa.html: o painel do corretor em um único arquivo, para visualização no claude.ai.
// Uso: npm run build && node scripts/gerar-painel-previa.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { build } from "esbuild";

const RAIZ = new URL("../", import.meta.url);
// React vem da CDN (UMD 18.3.1, globais React e ReactDOM); o pacote só leva o código do painel.
const reactGlobal = {
  name: "react-global",
  setup(b) {
    b.onResolve({ filter: /^react(-dom\/client|\/jsx-runtime)?$/ }, (a) => ({ path: a.path, namespace: "global" }));
    b.onLoad({ filter: /.*/, namespace: "global" }, (a) => ({
      loader: "js",
      contents: a.path === "react-dom/client"
        ? "module.exports = window.ReactDOM;"
        : a.path === "react/jsx-runtime"
          ? "const R = window.React; const j = (t, p, k) => R.createElement(t, k === undefined ? p : { ...p, key: k }); module.exports = { jsx: j, jsxs: j, Fragment: R.Fragment };"
          : "module.exports = window.React;",
    }));
  },
};

const res = await build({
  entryPoints: [new URL("scripts/painel-entry.tsx", RAIZ).pathname],
  bundle: true, format: "iife", minify: true, write: false, jsx: "automatic", plugins: [reactGlobal],
  define: { "process.env.NODE_ENV": '"production"' },
  tsconfig: new URL("tsconfig.json", RAIZ).pathname,
  logLevel: "warning",
});
const js = res.outputFiles[0].text;

const pastaCss = new URL("out/_next/static/chunks/", RAIZ);
const css = readdirSync(pastaCss).filter((f) => f.endsWith(".css")).map((f) => readFileSync(new URL(f, pastaCss), "utf8")).join("\n").replace(/@font-face\{[^}]*\}/g, "");

const imagens = {};
const leves = new URL("previa/fotos-leves/", RAIZ);
for (const f of readdirSync(leves)) imagens[f.replace(".jpg", "")] = "data:image/jpeg;base64," + readFileSync(new URL(f, leves)).toString("base64");
for (const f of readdirSync(new URL("public/marca/", RAIZ))) imagens["marca-" + f.replace(".png", "")] = "data:image/png;base64," + readFileSync(new URL(`public/marca/${f}`, RAIZ)).toString("base64");

const html = `<title>Painel GG Imóveis</title>
<meta name="description" content="Protótipo do painel do corretor da GG Imóveis Litoral">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{--font-bodoni:"Bodoni Moda",Didot,"Times New Roman",serif;--font-albert:"Albert Sans","Helvetica Neue",Arial,sans-serif;--font-plex-mono:"IBM Plex Mono",ui-monospace,monospace;color-scheme:light}
${css}
body{background:#eaf0f4;color:#04222b;font-size:16px;margin:0}
</style>
<div id="painel"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>window.__IMG=${JSON.stringify(imagens)};</script>
<script>${js.replace(/<\/script/gi, "<\\/script")}</script>`;

mkdirSync(new URL("previa/", RAIZ), { recursive: true });
writeFileSync(new URL("previa/painel-previa.html", RAIZ), html);
console.log(`previa/painel-previa.html gerado (${(html.length / 1024).toFixed(0)} KB)`);
