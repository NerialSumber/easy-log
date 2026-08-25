export function formatarTelefone(valor: string) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  if (numeros.length <= 2) return numeros.length ? `(${numeros}` : '';
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

export function telefoneValido(valor: string) {
  const quantidade = valor.replace(/\D/g, '').length;
  return quantidade === 10 || quantidade === 11;
}

export function emailValido(valor: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

export function validarContato(telefone: string, email: string) {
  if (!telefone && !email) return 'Informe pelo menos um telefone ou e-mail.';
  if (telefone && !telefoneValido(telefone)) return 'Informe um telefone válido com DDD.';
  if (email && !emailValido(email)) return 'Informe um e-mail válido.';
  return null;
}
