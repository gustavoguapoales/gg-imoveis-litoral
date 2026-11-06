// API do painel: listar, salvar e excluir imóveis (dados públicos + privados). Exige login válido.
import { listarTodos, remover, salvar, ambiente } from "@/lib/banco";
import { verificarAcesso } from "@/lib/acesso";
import { validarRegistro } from "@/lib/validar";

const negado = () => Response.json({ erro: "Acesso não autorizado." }, { status: 401 });
const semCache = { "Cache-Control": "no-store" };

export async function GET(req: Request) {
  if (!(await verificarAcesso(req.headers))) return negado();
  const { DB } = await ambiente();
  const uso = await DB.prepare("SELECT COALESCE(SUM(bytes), 0) AS total FROM fotos").first<{ total: number }>();
  return Response.json({ registros: await listarTodos(), bytesFotos: uso?.total ?? 0 }, { headers: semCache });
}

export async function PUT(req: Request) {
  if (!(await verificarAcesso(req.headers))) return negado();
  const r = validarRegistro(await req.json().catch(() => null));
  if (typeof r === "string") return Response.json({ erro: r }, { status: 400 });
  return Response.json({ registro: await salvar(r) }, { headers: semCache });
}

export async function DELETE(req: Request) {
  if (!(await verificarAcesso(req.headers))) return negado();
  const ref = new URL(req.url).searchParams.get("ref") ?? "";
  if (!/^GG-\d{4,6}$/.test(ref)) return Response.json({ erro: "Referência inválida." }, { status: 400 });
  await remover(ref);
  return Response.json({ ok: true }, { headers: semCache });
}
