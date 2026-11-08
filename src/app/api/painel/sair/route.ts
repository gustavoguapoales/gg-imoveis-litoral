// Sair do painel: apaga o cookie de sessão.
import { cookieSair } from "@/lib/acesso";

export async function GET() {
  return new Response(null, { status: 303, headers: { Location: "/", "Set-Cookie": cookieSair() } });
}
