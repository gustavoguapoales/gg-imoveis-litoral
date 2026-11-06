import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Albert_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Cabecalho } from "@/components/Cabecalho";
import { Rodape } from "@/components/Rodape";
import { BotaoWhatsFlutuante } from "@/components/BotaoWhatsFlutuante";
import { Chatbot } from "@/components/Chatbot";
import { montarDadosChat } from "@/lib/chatbot-dados";
import { SITE } from "@/lib/site";
import { SomenteSite } from "@/components/SomenteSite";

const bodoni = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"], style: ["normal", "italic"], display: "swap" });
const albert = Albert_Sans({ variable: "--font-albert", subsets: ["latin"], display: "swap" });
const plex = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.nome} | Imóveis para comprar e alugar no litoral paulista`, template: `%s | ${SITE.nome}` },
  description: SITE.descricao,
  openGraph: { type: "website", locale: "pt_BR", siteName: SITE.nome },
  alternates: { canonical: "/" },
  robots: SITE.indexar ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#04222b" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: SITE.nome,
  url: SITE.url,
  telephone: `+${SITE.whatsapp}`,
  areaServed: ["Santos", "São Vicente", "Praia Grande", "Guarujá", "Mongaguá", "Itanhaém"].map((c) => ({ "@type": "City", name: c })),
  address: { "@type": "PostalAddress", addressRegion: "SP", addressCountry: "BR" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${bodoni.variable} ${albert.variable} ${plex.variable}`}>
      <body className="min-h-screen flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SomenteSite><Cabecalho /></SomenteSite>
        <main className="flex-1">{children}</main>
        <SomenteSite>
          <Rodape />
          <BotaoWhatsFlutuante />
          <Chatbot dados={montarDadosChat()} />
        </SomenteSite>
      </body>
    </html>
  );
}
