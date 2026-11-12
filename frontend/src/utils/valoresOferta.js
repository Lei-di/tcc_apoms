export function calcularValores(quantidade, preco) {
  const partes = String(quantidade ?? '').trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/)
  const numero = partes ? Number(partes[1].replace(',', '.')) : NaN
  const valor = preco === null || preco === undefined || String(preco).trim() === ''
    ? NaN : Number(String(preco).replace(',', '.'))
  return {
    unidade: partes?.[2] || 'unidade',
    preco: Number.isFinite(valor) && valor > 0 ? valor : null,
    total: Number.isFinite(numero) && numero > 0 && Number.isFinite(valor) && valor > 0
      ? Math.round(numero * valor * 100) / 100 : null,
  }
}

