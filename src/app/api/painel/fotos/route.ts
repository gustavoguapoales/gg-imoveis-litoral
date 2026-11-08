// Envio de fotos pelo painel para o R2, com trava de espaço para nunca passar do plano gratuito.
import { ambiente } from "@/lib/banco";
import { verificarAcesso } from "@/lib/acesso";

const LIMITE_BYTES = 8 * 1024 ** 3; // 8 GB (o gratuito é 10 GB)
const MAX_FOTO = 5 * 1024 ** 2; // 5 MB por foto (o painel já reduz para ~300 KB)
const TIPOS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(req: Request) {
  if (!(await verificarAcesso(req.headers))) return Response.json({ erro: "Acesso não autorizado." }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const arquivo = form?.get("foto");
  const ref = String(form?.get("ref") ?? "");
  if (!(arquivo instanceof File) || !/^GG-\d{4,6}$/.test(ref)) return Response.json({ erro: "Envie uma foto válida." }, { status: 400 });
  const ext = TIPOS[arquivo.type];
  if (!ext) return Response.json({ erro: "Formato não aceito. Use JPG, PNG ou WEBP." }, { status: 400 });
  if (arquivo.size > MAX_FOTO) return Response.json({ erro: "Foto muito grande (máximo 5 MB)." }, { status: 400 });

  const { DB, FOTOS } = await ambiente();
  const uso = await DB.prepare("SELECT COALESCE(SUM(bytes), 0) AS total FROM fotos").first<{ total: number }>();
  if ((uso?.total ?? 0) + arquivo.size > LIMITE_BYTES)
    return Response.json({ erro: "Limite de 8 GB de fotos atingido. Apague fotos antigas antes de enviar novas." }, { status: 507 });

  const chave = `imoveis/${ref}/${crypto.randomUUID()}.${ext}`;
  await FOTOS.put(chave, arquivo.stream(), { httpMetadata: { contentType: arquivo.type, cacheControl: "public, max-age=31536000, immutable" } });
  await DB.prepare("INSERT INTO fotos (chave, ref, bytes) VALUES (?, ?, ?)").bind(chave, ref, arquivo.size).run();
  return Response.json({ url: `/midia/${chave}`, bytes: arquivo.size });
}

// Apaga uma foto (libera espaço no R2).
export async function DELETE(req: Request) {
  if (!(await verificarAcesso(req.headers))) return Response.json({ erro: "Acesso não autorizado." }, { status: 401 });
  const chave = new URL(req.url).searchParams.get("chave") ?? "";
  if (!/^imoveis\/GG-\d{4,6}\/[\w-]+\.(jpg|png|webp)$/.test(chave)) return Response.json({ erro: "Foto inválida." }, { status: 400 });
  const { DB, FOTOS } = await ambiente();
  await FOTOS.delete(chave);
  await DB.prepare("DELETE FROM fotos WHERE chave = ?").bind(chave).run();
  await (caches as unknown as { default: Cache }).default.delete(new URL(`/midia/${chave}`, req.url).toString());
  return Response.json({ ok: true });
}
