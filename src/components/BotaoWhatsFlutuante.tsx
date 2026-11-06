import { linkWhatsApp } from "@/lib/site";
import { IconeWhatsApp } from "./Icones";

export function BotaoWhatsFlutuante() {
  return (
    <a
      href={linkWhatsApp()}
      target="_blank"
      rel="noopener"
      aria-label="Conversar pelo WhatsApp"
      className="fixed z-30 grid h-14 w-14 place-items-center rounded-full bg-whats text-white shadow-[0_10px_30px_-8px_rgba(14,43,51,0.55)] transition hover:scale-105"
      style={{ right: "max(20px, env(safe-area-inset-right))", bottom: "max(20px, env(safe-area-inset-bottom))" }}
    >
      <IconeWhatsApp width={28} height={28} />
    </a>
  );
}
