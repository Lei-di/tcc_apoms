import { calcularValores } from '../utils/valoresOferta'

const moeda = valor => valor === null ? 'Não informado' : valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ResumoValores({ quantidade, preco }) {
  const valores = calcularValores(quantidade, preco)
  return (
    <dl className="resumo-negociacao">
      <div><dt>Quantidade</dt><dd>{quantidade || 'Não informada'}</dd></div>
      <div><dt>Preço por {valores.unidade}</dt><dd>{moeda(valores.preco)} / {valores.unidade}</dd></div>
      <div><dt>Valor total</dt><dd>{moeda(valores.total)}</dd></div>
    </dl>
  )
}
