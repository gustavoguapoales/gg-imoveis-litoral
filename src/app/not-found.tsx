import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="container-site py-40 text-center">
      <p className="rotulo text-latao-escuro">Erro 404</p>
      <h1 className="mt-3 font-display text-5xl">Esta página não foi encontrada.</h1>
      <p className="mt-4 text-cinza">O imóvel pode já ter sido vendido.</p>
      <Link href="/imoveis/" className="mt-8 inline-block rounded-full bg-tinta px-7 py-3.5 font-medium text-white">Ver imóveis disponíveis</Link>
    </div>
  );
}
