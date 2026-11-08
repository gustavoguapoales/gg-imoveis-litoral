// Registro de clientes que demonstram interesse pelo site (aberto ao público, com limite contra abuso).
// Os dados do imóvel vêm do banco (pela referência), nunca do navegador.
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NO_SITE } from "@/data/privado-demo";

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export async function POST(req: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const d = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!d) return Response.json({ erro: "Dados inválidos." }, { status: 400 });
  if (texto(d.site, 50)) return Response.json({ ok: true }); // campo-armadilha preenchido = robô

  const nome = texto(d.nome, 80);
  const telefone = texto(d.telefone, 30);
  if (nome.length < 2 || telefone.replace(/\D/g, "").length < 10) return Response.json({ erro: "Informe nome e telefone com DDD." }, { status: 400 });

  const ip = req.headers.get("cf-connecting-ip") ?? "local";
  const recentes = await env.DB.prepare("SELECT count(*) AS n FROM clientes WHERE ip = ? AND em > datetime('now', '-1 hour')").bind(ip).first<{ n: number }>();
  if ((recentes?.n ?? 0) >= 10) return Response.json({ ok: true }); // excesso: ignora em silêncio

  const ref = /^GG-\d{4,6}$/.test(texto(d.ref, 12)) ? texto(d.ref, 12) : "";
  let imovel = "", bairro = texto(d.bairro, 80), cidade = texto(d.cidade, 60), valor = "", finalidade = "";
  if (ref) {
    const l = await env.DB.prepare(`SELECT publico FROM imoveis WHERE ref = ? AND status IN (${NO_SITE.map(() => "?").join(",")})`)
      .bind(ref, ...NO_SITE).first<{ publico: string }>();
    if (l) {
      const p = JSON.parse(l.publico) as { titulo: string; bairro: string; cidade: string; preco: number; finalidade: string };
      imovel = p.titulo; bairro = p.bairro; cidade = p.cidade;
      finalidade = p.finalidade === "aluguel" ? "Alugar" : "Comprar";
      valor = p.finalidade === "aluguel" ? `${brl(p.preco)}/mês` : brl(p.preco);
    }
  }
  const interesse = texto(d.interesse, 80) || (ref ? "Interesse em imóvel" : "Contato pelo site");
  const mensagem = texto(d.mensagem, 1500);
  const email = texto(d.email, 120);
  const pagina = texto(d.pagina, 200);

  await env.DB.prepare(
    "INSERT INTO clientes (nome, telefone, email, interesse, ref, imovel, bairro, cidade, valor, finalidade, mensagem, pagina, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(nome, telefone, email, interesse, ref, imovel, bairro, cidade, valor, finalidade || texto(d.finalidade, 20), mensagem, pagina, ip).run();

  // Aviso na hora por e-mail (não bloqueia a resposta se falhar).
  try {
    await env.EMAIL.send({
      from: { name: "Site GG Imóveis", email: "painel@ggimoveislitoral.com" },
      to: env.PAINEL_EMAIL,
      subject: `Novo cliente: ${nome}${ref ? ` – ${ref}` : ""} – ${interesse}`,
      text: [
        `Nome: ${nome}`, `Telefone: ${telefone}`, email && `E-mail: ${email}`, `Interesse: ${interesse}`,
        ref && `Imóvel: ${ref} – ${imovel}`, (bairro || cidade) && `Local: ${[bairro, cidade].filter(Boolean).join(", ")}`,
        valor && `Valor: ${valor}`, mensagem && `\nMensagem:\n${mensagem}`,
        "", "O cliente também foi encaminhado para o seu WhatsApp. A planilha \"Clientes GG Imóveis\" é atualizada automaticamente.",
      ].filter(Boolean).join("\n"),
    });
  } catch (e) {
    console.error("Falha ao enviar aviso de cliente", e);
  }
  return Response.json({ ok: true });
}
