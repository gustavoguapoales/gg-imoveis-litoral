"use client";

// Campo de valor livre com máscara de reais: o cliente digita 500000 e vê "R$ 500.000".
export const formatarValorDigitado = (digitos: string) =>
  digitos ? "R$ " + Number(digitos).toLocaleString("pt-BR") : "";

export function CampoValor({ id, valor, aoMudar, placeholder, className, rotuloAcessivel }: {
  id: string;
  valor: string; // apenas dígitos
  aoMudar: (digitos: string) => void;
  placeholder: string;
  className: string;
  rotuloAcessivel?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      data-valor=""
      aria-label={rotuloAcessivel}
      placeholder={placeholder}
      className={className}
      value={formatarValorDigitado(valor)}
      onChange={(e) => aoMudar(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 11))}
    />
  );
}
