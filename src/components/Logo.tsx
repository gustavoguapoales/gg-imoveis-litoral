/* eslint-disable @next/next/no-img-element */
// Logo original da GG Imóveis Litoral. A versão clara (texto branco) é usada sobre fotos escuras.
export function Logo({ claro = false, className = "h-12 md:h-14" }: { claro?: boolean; className?: string }) {
  return (
    <span className="flex items-center">
      <img src="/marca/logo.png" alt="GG Imóveis Litoral" width={980} height={410} className={`logo-escuro w-auto ${className} ${claro ? "hidden" : ""}`} />
      <img src="/marca/logo-clara.png" alt="GG Imóveis Litoral" width={980} height={410} className={`logo-claro w-auto ${className} ${claro ? "" : "hidden"}`} />
    </span>
  );
}
