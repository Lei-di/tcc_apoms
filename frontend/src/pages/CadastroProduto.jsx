import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function CadastroProduto() {
  const [nomeProduto, setNomeProduto] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [dataValidade, setDataValidade] = useState('')
  const [preco, setPreco] = useState('')
  const [mensagem, setMensagem] = useState('')
  const navigate = useNavigate()

  const handleCadastro = async (e) => {
    e.preventDefault()
    try {
      await api.post('/produtos', {
        nome_produto: nomeProduto,
        quantidade,
        data_validade: dataValidade,
        preco: parseFloat(preco)
      })
      setMensagem('Produto cadastrado com sucesso!')
      setNomeProduto('')
      setQuantidade('')
      setDataValidade('')
      setPreco('')
    } catch (err) {
      setMensagem('Erro ao cadastrar produto. Tente novamente.')
    }
  }

  return (
    <div className="cadastro-container">
      <h2>Cadastrar Produto</h2>
      <form onSubmit={handleCadastro}>
        <input
          type="text"
          placeholder="Nome do produto"
          value={nomeProduto}
          onChange={(e) => setNomeProduto(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Quantidade (ex: 50 unidades)"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          required
        />
        <input
          type="date"
          value={dataValidade}
          onChange={(e) => setDataValidade(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Preço (ex: 3.50)"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          step="0.01"
          min="0"
          required
        />
        {mensagem && <p>{mensagem}</p>}
        <button type="submit">Cadastrar</button>
        <button type="button" onClick={() => navigate('/painel')}>Voltar ao painel</button>
      </form>
    </div>
  )
}

export default CadastroProduto