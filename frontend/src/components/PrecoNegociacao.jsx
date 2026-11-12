import { calcularValores } from '../utils/valoresOferta'

export default function PrecoNegociacao({ quantidade, preco, rotuloPorUnidade = false }) {
  const valores = calcularValores(quantidade, preco)
  const moeda = valor => valor === null ? 'Não informado' : valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  return (
    <span className="preco-negociacao">
      <span>{rotuloPorUnidade
        ? <>Valor por unidade: {moeda(valores.preco)}</>
        : <>{moeda(valores.preco)} / {valores.unidade}</>}</span>
      <span><span className="preco-negociacao-rotulo">Valor total: </span>{moeda(valores.total)}</span>
    </span>
  )
}
