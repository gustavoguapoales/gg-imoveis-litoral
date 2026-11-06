// Comportamento da prévia em arquivo único (navegação por #, filtros, galeria, formulário).
(function () {
  const WHATS = "5513997771730";
  const linkWhats = (t) => "https://wa.me/" + WHATS + "?text=" + encodeURIComponent(t);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  $$("[data-img]").forEach((img) => (img.src = IMG[img.dataset.img]));
  $$("video[data-video]").forEach((v) => { v.poster = IMG["video-" + v.dataset.poster] || ""; v.src = VIDEOS[v.dataset.video]; });

  // Campo de valor livre com máscara de reais.
  const digitos = (el) => el.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 11);
  const formatar = (d) => (d ? "R$ " + Number(d).toLocaleString("pt-BR") : "");
  $$("input[data-valor]").forEach((el) => el.addEventListener("input", () => { el.value = formatar(digitos(el)); }));
  const exemplo = (fin) => (fin === "aluguel" ? "Ex.: R$ 3.000" : "Ex.: R$ 500.000");
  const trocarFaixas = (input, finalidade) => {
    input.value = "";
    input.placeholder = input.id === "filtro-preco" ? `Valor máximo (${exemplo(finalidade).replace("Ex.: ", "ex. ")})` : exemplo(finalidade);
  };

  // Botão "Marcar serviço" do drone: atualiza a mensagem do WhatsApp com tipo, cidade e bairro.
  const linkDrone = (c) => linkWhats(["Olá, Gustavo! Vim pelo site da GG Imóveis Litoral e tenho interesse no serviço de filmagem com drone. Gostaria de saber os valores e a disponibilidade de agenda.", c.tipo ? `Tipo de imóvel: ${c.tipo}` : "", c.cidade ? `Cidade: ${c.cidade}` : "", c.bairro ? `Bairro: ${c.bairro}` : ""].filter(Boolean).join("\n"));
  $$("[data-drone]").forEach((box) => {
    const atualizar = () => {
      const c = {};
      $$("[data-campo]", box).forEach((el) => (c[el.dataset.campo] = el.value.trim()));
      $("[data-drone-link]", box).href = linkDrone(c);
    };
    box.addEventListener("input", atualizar);
    box.addEventListener("change", atualizar);
  });
  // Grupo Comprar/Alugar: reaproveita as classes dos botões ativo e inativo renderizados pelo site.
  function grupoFinalidade(grupo) {
    const botoes = $$("button[data-finalidade]", grupo);
    const cAtivo = botoes.find((b) => b.getAttribute("aria-checked") === "true").className;
    const cInativo = botoes.find((b) => b.getAttribute("aria-checked") !== "true").className;
    return {
      botoes,
      valor: () => botoes.find((b) => b.getAttribute("aria-checked") === "true").dataset.finalidade,
      marcar(v) { botoes.forEach((b) => { const on = b.dataset.finalidade === v; b.setAttribute("aria-checked", String(on)); b.className = on ? cAtivo : cInativo; }); },
    };
  }

  const cab = $("header");
  const secoes = $$("[data-rota]");
  let atual = "inicio";
  let menu = null;

  function ajustarCabecalho() {
    cab.classList.toggle("previa-transp", atual === "inicio" && window.scrollY < 40 && !menu);
  }

  function fecharMenu() {
    if (menu) { menu.remove(); menu = null; }
    ajustarCabecalho();
  }

  function irPara() {
    let h = decodeURIComponent(location.hash.slice(1)) || "inicio";
    let ancora = null, cidade = null;
    if (["regioes", "atuacao", "vender"].includes(h)) { ancora = h; h = "inicio"; }
    if (h.startsWith("imoveis-")) { cidade = h.slice(8); h = "imoveis"; }
    if (!secoes.some((s) => s.dataset.rota === h)) h = "inicio";
    atual = h;
    secoes.forEach((s) => (s.hidden = s.dataset.rota !== h));
    if (cidade !== null) aplicarFiltros({ cidade });
    fecharMenu();
    if (ancora) document.getElementById(ancora).scrollIntoView();
    else window.scrollTo(0, 0);
    ajustarCabecalho();
  }
  window.addEventListener("hashchange", irPara);
  window.addEventListener("scroll", ajustarCabecalho, { passive: true });

  // Menu do celular
  const botaoMenu = $("header button[aria-label]");
  if (botaoMenu) {
    botaoMenu.addEventListener("click", () => {
      if (menu) return fecharMenu();
      const links = $$('nav[aria-label="Principal"] a', cab)
        .map((a) => `<li><a href="${a.getAttribute("href")}" class="block border-b border-linha py-4 font-display text-2xl">${a.textContent}</a></li>`).join("");
      menu = document.createElement("nav");
      menu.className = "border-t border-linha bg-papel lg:hidden";
      menu.innerHTML = `<ul class="container-site flex flex-col py-4">${links}<li class="pt-5"><a href="${linkWhats("Olá! Vim pelo site da GG Imóveis Litoral e gostaria de atendimento.")}" target="_blank" rel="noopener" class="flex items-center justify-center gap-2 rounded-full bg-whats py-3.5 font-medium text-white">Falar no WhatsApp</a></li></ul>`;
      menu.addEventListener("click", (e) => { if (e.target.closest("a")) fecharMenu(); });
      cab.appendChild(menu);
      ajustarCabecalho();
    });
  }

  // Filtros do catálogo
  const secImoveis = $('[data-rota="imoveis"]');
  const sel = (rotulo) => $(`select[aria-label="${rotulo}"]`, secImoveis);
  const fin = grupoFinalidade($('[role="radiogroup"]', secImoveis));
  const campos = { cidade: sel("Cidade"), tipo: sel("Tipo de imóvel"), dorm: sel("Dormitórios"), preco: $("#filtro-preco", secImoveis), ordem: sel("Ordenar por"), vista: $('input[type="checkbox"]', secImoveis) };
  const cards = $$("article[data-cidade]", secImoveis);
  const grade = cards[0].parentElement;
  const contador = $("p[aria-live]", secImoveis);
  const vazio = document.createElement("div");
  vazio.className = "rounded-sm border border-dashed border-linha px-6 py-16 text-center";
  vazio.innerHTML = '<p class="font-display text-2xl">Nenhum imóvel com esses filtros agora.</p><p class="mx-auto mt-3 max-w-md text-cinza">Me conte o que você procura pelo WhatsApp. Muitos imóveis chegam antes de serem anunciados.</p>';
  vazio.hidden = true;
  grade.after(vazio);
  const limpar = document.createElement("button");
  limpar.type = "button";
  limpar.className = "text-sm text-mar underline underline-offset-4";
  limpar.textContent = "Limpar filtros";
  contador.after(limpar);

  function aplicarFiltros(novos) {
    if (novos) {
      fin.marcar(novos.finalidade || "");
      trocarFaixas(campos.preco, novos.finalidade);
      for (const k in campos) {
        if (k === "vista") campos.vista.checked = !!novos.vista;
        else if (k === "preco") campos.preco.value = formatar(novos.preco || "");
        else campos[k].value = novos[k] || "";
      }
    }
    const precoMax = +digitos(campos.preco) || 0;
    const finalidade = fin.valor() || (precoMax ? "venda" : "");
    const f = { finalidade, cidade: CIDADES[campos.cidade.value], tipo: campos.tipo.value, dorm: +campos.dorm.value || 0, preco: precoMax || Infinity, vista: campos.vista.checked, ordem: campos.ordem.value };
    const visiveis = cards.filter((c) => {
      const d = c.dataset;
      const ok = (!f.finalidade || d.finalidade === f.finalidade) && (!f.cidade || d.cidade === f.cidade) && (!f.tipo || d.tipo === f.tipo) && +d.dorm >= f.dorm && +d.preco <= f.preco && (!f.vista || d.vista === "1");
      c.hidden = !ok;
      return ok;
    });
    const ordenados = [...cards];
    if (f.ordem === "menor") ordenados.sort((a, b) => a.dataset.preco - b.dataset.preco);
    if (f.ordem === "maior") ordenados.sort((a, b) => b.dataset.preco - a.dataset.preco);
    if (f.ordem === "praia") ordenados.sort((a, b) => a.dataset.praia - b.dataset.praia);
    ordenados.forEach((c) => grade.appendChild(c));
    const n = visiveis.length;
    contador.innerHTML = `<strong class="font-semibold text-tinta">${n}</strong> ${n === 1 ? "imóvel encontrado" : "imóveis encontrados"}`;
    grade.hidden = n === 0;
    vazio.hidden = n !== 0;
    limpar.hidden = !(fin.valor() || f.cidade || f.tipo || f.dorm || f.preco !== Infinity || f.vista);
  }
  Object.values(campos).forEach((c) => c.addEventListener("change", () => aplicarFiltros()));
  campos.preco.addEventListener("input", () => aplicarFiltros());
  fin.botoes.forEach((b) => b.addEventListener("click", () => {
    fin.marcar(b.dataset.finalidade);
    trocarFaixas(campos.preco, b.dataset.finalidade);
    aplicarFiltros();
  }));
  limpar.addEventListener("click", () => aplicarFiltros({}));
  aplicarFiltros();

  // Busca da página inicial
  const busca = $('form[role="search"]');
  if (busca) {
    const finBusca = grupoFinalidade($('[role="radiogroup"]', busca));
    const rotuloPreco = $('label[for="busca-preco"] span', busca);
    finBusca.botoes.forEach((b) => b.addEventListener("click", () => {
      const v = b.dataset.finalidade;
      finBusca.marcar(v);
      $('[data-painel="imoveis"]', busca).hidden = v === "drone";
      $('[data-painel="drone"]', busca).hidden = v !== "drone";
      if (v !== "drone") { trocarFaixas($("#busca-preco"), v); rotuloPreco.textContent = v === "aluguel" ? "Aluguel máximo" : "Valor máximo"; }
    }));
    busca.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = (id) => $("#" + id).value;
      if (finBusca.valor() === "drone") return;
      const filtros = { finalidade: finBusca.valor(), cidade: v("busca-cidade"), tipo: v("busca-tipo"), dorm: v("busca-dorm"), preco: digitos($("#busca-preco")) };
      if (location.hash === "#imoveis") irPara(); else location.hash = "imoveis";
      aplicarFiltros(filtros);
    });
  }

  // Galeria
  let caixa = null;
  function abrirGaleria(slug, inicio) {
    const fotos = DADOS[slug].imagens;
    let k = inicio;
    caixa = document.createElement("div");
    caixa.className = "previa-caixa";
    caixa.setAttribute("role", "dialog");
    caixa.setAttribute("aria-label", "Galeria de fotos");
    caixa.innerHTML = `<div class="flex items-center justify-between px-5 py-4 text-white"><span class="rotulo" data-n></span><button type="button" data-fechar class="grid h-11 w-11 place-items-center text-3xl" aria-label="Fechar galeria">×</button></div>
      <div class="relative flex flex-1 items-center justify-center px-4 pb-8" style="min-height:0"><img alt=""><button type="button" data-ir="-1" class="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl text-white" aria-label="Foto anterior">‹</button><button type="button" data-ir="1" class="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl text-white" aria-label="Próxima foto">›</button></div>`;
    const mostrar = () => { $("img", caixa).src = IMG[fotos[k]]; $("[data-n]", caixa).textContent = `${k + 1} / ${fotos.length}`; };
    caixa.addEventListener("click", (e) => {
      const ir = e.target.closest("[data-ir]");
      if (ir) { k = (k + +ir.dataset.ir + fotos.length) % fotos.length; mostrar(); }
      if (e.target.closest("[data-fechar]")) fecharGaleria();
    });
    document.body.appendChild(caixa);
    document.body.style.overflow = "hidden";
    mostrar();
  }
  function fecharGaleria() { if (caixa) { caixa.remove(); caixa = null; document.body.style.overflow = ""; } }
  document.addEventListener("keydown", (e) => {
    if (!caixa) return;
    if (e.key === "Escape") fecharGaleria();
    if (e.key === "ArrowRight") $('[data-ir="1"]', caixa).click();
    if (e.key === "ArrowLeft") $('[data-ir="-1"]', caixa).click();
  });

  secoes.forEach((sec) => {
    const slug = sec.dataset.rota;
    if (!DADOS[slug]) return;
    const fotos = DADOS[slug].imagens;
    const principal = $('button[aria-label="Ampliar foto"]', sec);
    let atualFoto = 0;
    principal.addEventListener("click", () => abrirGaleria(slug, atualFoto));
    $$('button[aria-label^="Ver foto"]', sec).forEach((b) => b.addEventListener("click", () => abrirGaleria(slug, +b.getAttribute("aria-label").match(/\d+/)[0] - 1)));
    $$('button[aria-label^="Foto "]', sec).forEach((b, k) => b.addEventListener("click", () => {
      atualFoto = k;
      $("img", principal).src = IMG[fotos[k]];
      $("span", principal).textContent = `${k + 1} / ${fotos.length} · Imagem ilustrativa`;
      $$('button[aria-label^="Foto "]', sec).forEach((o, j) => { o.classList.toggle("ring-2", j === k); o.classList.toggle("ring-latao", j === k); o.classList.toggle("opacity-70", j !== k); });
    }));
    const rolar = $("[data-rolar]", sec);
    if (rolar) {
      const ir = () => $('[data-ancora="interesse"]', sec).scrollIntoView({ behavior: "smooth" });
      rolar.addEventListener("click", ir);
      rolar.addEventListener("keydown", (e) => { if (e.key === "Enter") ir(); });
    }
  });

  // Formulários de interesse
  $$("form[data-cabecalho]").forEach((form) => {
    const aviso = document.createElement("div");
    aviso.className = "sm:col-span-2";
    form.querySelector("button[type=submit]").parentElement.before(aviso);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const campos = $$("[data-rotulo]", form);
      const faltando = campos.filter((c) => c.required && !c.value.trim());
      if (faltando.length) {
        aviso.innerHTML = `<p class="text-sm text-red-700" role="alert">Preencha: ${faltando.map((c) => c.dataset.rotulo.toLowerCase()).join(", ")}.</p>`;
        return;
      }
      const linhas = [form.dataset.cabecalho, ...campos.filter((c) => c.value.trim()).map((c) => `${c.dataset.rotulo}: ${c.value.trim()}`)];
      aviso.innerHTML = `<div class="previa-ok">Mensagem pronta. <a class="font-semibold text-whats underline" target="_blank" rel="noopener" href="${linkWhats(linhas.join("\n"))}">Toque aqui para abrir no WhatsApp</a> e enviar.</div>`;
    });
  });

  $$("form:not([role]):not([data-cabecalho]):not([data-form-chat])").forEach((form) => {
    const sec = form.closest("[data-rota]");
    const ref = DADOS[sec.dataset.rota]?.ref;
    const aviso = document.createElement("div");
    aviso.className = "sm:col-span-2";
    form.querySelector("button[type=submit]").parentElement.before(aviso);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const nome = String(d.get("nome") || "").trim();
      const tel = String(d.get("telefone") || "").trim();
      if (!nome || tel.replace(/\D/g, "").length < 10) {
        aviso.innerHTML = '<p class="text-sm text-red-700" role="alert">Informe seu nome e um telefone com DDD.</p>';
        return;
      }
      const linhas = [`Olá! Meu nome é ${nome}.`, `Interesse: ${d.get("interesse")}`, d.get("cidade") ? `Cidade: ${d.get("cidade")}` : "", ref ? `Imóvel: Ref ${ref}` : "", d.get("mensagem") ? `Mensagem: ${d.get("mensagem")}` : "", `Telefone: ${tel}`, d.get("email") ? `E-mail: ${d.get("email")}` : ""].filter(Boolean);
      aviso.innerHTML = `<div class="previa-ok">Mensagem pronta. <a class="font-semibold text-whats underline" target="_blank" rel="noopener" href="${linkWhats(linhas.join("\n"))}">Toque aqui para abrir no WhatsApp</a> e enviar.</div>`;
    });
  });

  // Assistente virtual (mesma lógica de src/lib/chatbot.ts).
  const caixaChat = $("[data-chatbot]");
  if (caixaChat) {
    const dadosChat = JSON.parse(caixaChat.dataset.chat);
    const painel = $("[data-painel-chat]", caixaChat);
    const lista = $("[data-mensagens]", caixaChat);
    const entrada = $("#chat-texto", caixaChat);
    // Motor do assistente: o mesmo código de src/lib/chatbot.ts, empacotado pelo gerador.
    let ctxChat = { filtros: {} };
    const responderChat = (txt) => {
      const r = window.ChatGG.responder(dadosChat, txt, ctxChat);
      ctxChat = r.contexto;
      return r.resposta;
    };
    const esc = (t) => t.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
    function balaoBot(r) {
      const cards = (r.imoveis || []).map((i) => `<a data-ir="/imoveis/${esc(i.slug)}/" role="button" tabindex="0" data-link-chat class="flex cursor-pointer gap-3 rounded-xl border border-linha bg-papel p-2 hover:border-mar"><img src="${IMG[i.imagem.match(/([\w-]+)\.jpg$/)[1]] || ""}" alt="" class="h-16 w-20 shrink-0 rounded-lg object-cover"><span class="min-w-0 py-0.5"><span class="block truncate text-sm font-medium text-tinta">${esc(i.titulo)}</span><span class="block truncate text-xs text-cinza">${esc(i.bairro)} · ${esc(i.cidade)}</span><span class="block text-sm font-semibold tabular-nums text-tinta">${esc(i.precoTexto)}</span></span></a>`).join("");
      const blocoCards = cards ? `<div class="flex flex-col gap-2">${cards}</div>` : "";
      const links = (r.links || []).map((l) => l.externo
        ? `<a href="${esc(l.href)}" target="_blank" rel="noopener" data-link-chat class="w-fit rounded-full bg-whats px-4 py-2 text-sm font-medium text-white hover:brightness-110">${esc(l.rotulo)}</a>`
        : `<a data-ir="${esc(l.href)}" role="button" tabindex="0" data-link-chat class="w-fit cursor-pointer rounded-full border border-mar px-4 py-2 text-sm font-medium text-mar hover:bg-mar hover:text-white">${esc(l.rotulo)} →</a>`).join("");
      const sug = r.sugestoes ? `<div class="flex flex-wrap gap-1.5 pt-1">${r.sugestoes.map((s) => `<button type="button" data-sugestao class="rounded-full border border-linha bg-papel px-3 py-1.5 text-xs text-tinta hover:border-mar hover:text-mar">${esc(s)}</button>`).join("")}</div>` : "";
      return `<div data-balao="bot" class="mr-4 flex min-w-0 flex-col gap-2.5 self-stretch"><p class="w-fit rounded-2xl rounded-bl-sm bg-nevoa px-4 py-2.5 text-sm leading-relaxed text-tinta">${esc(r.texto)}</p>${blocoCards}${links}${sug}</div>`;
    }
    function enviarChat(txt) {
      const t = txt.trim();
      if (!t) return;
      lista.insertAdjacentHTML("beforeend", `<p data-balao="voce" class="ml-10 self-end rounded-2xl rounded-br-sm bg-tinta px-4 py-2.5 text-sm text-white">${esc(t)}</p>` + balaoBot(responderChat(t)));
      entrada.value = "";
      lista.scrollTop = lista.scrollHeight;
    }
    // Links internos do chat: caminho do site vira rota da prévia, com filtros quando houver.
    function irDoChat(href) {
      const u = new URL(href, "https://x.invalid");
      const partes = u.pathname.split("/").filter(Boolean);
      if (!partes.length) { location.hash = u.hash ? u.hash.slice(1) : "inicio"; return; }
      if (partes[0] === "imoveis" && partes[1]) { location.hash = partes[1]; return; }
      if (partes[0] === "imoveis") {
        if (location.hash === "#imoveis") irPara(); else location.hash = "imoveis";
        const g = (k) => u.searchParams.get(k) || "";
        setTimeout(() => aplicarFiltros({ finalidade: g("finalidade"), cidade: g("cidade"), tipo: g("tipo"), dorm: g("dorm"), preco: g("preco"), vista: g("vista") }), 0);
        return;
      }
      location.hash = partes[0];
    }
    const alternar = (abrir) => {
      painel.hidden = !abrir;
      $("[data-abrir-chat]", caixaChat).setAttribute("aria-expanded", String(abrir));
      if (abrir) { lista.scrollTop = lista.scrollHeight; entrada.focus(); }
    };
    $("[data-abrir-chat]", caixaChat).addEventListener("click", () => alternar(painel.hidden));
    $("[data-fechar-chat]", caixaChat).addEventListener("click", () => alternar(false));
    $("[data-form-chat]", caixaChat).addEventListener("submit", (e) => { e.preventDefault(); enviarChat(entrada.value); });
    lista.addEventListener("click", (e) => {
      const s = e.target.closest("[data-sugestao]");
      if (s) return enviarChat(s.textContent);
      const ir = e.target.closest("[data-ir]");
      if (ir) { irDoChat(ir.dataset.ir); if (window.innerWidth < 640) alternar(false); }
    });
  }

  irPara();
})();
