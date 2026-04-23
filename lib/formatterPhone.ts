export function formatarTelefone(telefone: string): string {
  if (!telefone) return "";

  // remove tudo que não for número
  const numero = telefone.replace(/\D/g, "");

  // celular com 11 dígitos (ex: 11999999999)
  if (numero.length === 11) {
    return `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
  }

  // fixo com 10 dígitos (ex: 1133334444)
  if (numero.length === 10) {
    return `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
  }

  // fallback (caso venha diferente)
  return telefone;
}

