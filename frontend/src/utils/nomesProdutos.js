export const normalizarNomeProduto = (nome) =>
  (nome || '').normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('pt-BR')

export function listarNomesProdutosUnicos(nomes) {
  const produtos = new Map()
  for (const nome of nomes) {
    const chave = normalizarNomeProduto(nome)
    if (chave && !produtos.has(chave)) {
      produtos.set(chave, nome.trim().replace(/\s+/g, ' '))
    }
  }
  return [...produtos.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
