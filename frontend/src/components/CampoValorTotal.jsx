import { useId } from 'react'
import { calcularValores } from '../utils/valoresOferta'

export default function CampoValorTotal({ quantidade, preco }) {
  const id = useId()
  const { total } = calcularValores(quantidade, preco)
  return (
    <div className="campo">
      <label htmlFor={id}>Valor total</label>
      <input id={id} type="text" readOnly
        value={total === null ? '' : total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        placeholder="Preencha quantidade e preço" />
    </div>
  )
}
