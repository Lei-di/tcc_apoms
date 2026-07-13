import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function CadastroProduto() {
  const [nomeProduto, setNomeProduto] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('')
  const [dataValidade, setDataValidade] = useState('')
  const [preco, setPreco] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [listaProdutos, setListaProdutos] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const buscarListaProdutos = async () => {
      try {
        const resposta = await api.get('/produtos/disponiveis')
        setListaProdutos(resposta.data)
      } catch (err) {
        console.error('Erro ao buscar lista de produtos', err)
      }
    }
    buscarListaProdutos()
  }, [])

  const handleCadastro = async (e) => {
    e.preventDefault()
    try {
      await api.post('/produtos', {
        nome_produto: nomeProduto,
        quantidade: `${quantidade} ${unidade}`,
        data_validade: dataValidade,
        preco: parseFloat(preco)
      })
      setMensagem('Produto cadastrado com sucesso!')
      setNomeProduto('')
      setQuantidade('')
      setUnidade('')
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
        <select
          value={nomeProduto}
          onChange={(e) => setNomeProduto(e.target.value)}
          required
        >
          <option value="">Selecione o produto</option>
          {listaProdutos.map((p) => (
            <option key={p.id} value={p.nome}>{p.nome}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          min="1"
          required
        />

        <select
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          required
        >
          <option value="">Unidade de medida</option>
          <option value="kg">kg</option>
          <option value="unidade">unidade</option>
          <option value="maço">maço</option>
          <option value="caixa">caixa</option>
          <option value="litro">litro</option>
          <option value="dúzia">dúzia</option>
        </select>

        <div>
          <label>Validade</label>
          <input
            type="date"
            value={dataValidade}
            onChange={(e) => setDataValidade(e.target.value)}
            required
          />
        </div>

        <input
          type="number"
          placeholder="Preço (ex: 3.50)"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          step="0.01"
          min="0"
          required
        />

        {mensagem && <p className={mensagem.includes('sucesso') ? 'sucesso' : 'erro'}>{mensagem}</p>}
        <button type="submit">Cadastrar</button>
        <button type="button" onClick={() => navigate('/painel')}>Voltar ao painel</button>
      </form>
    </div>
  )
}

export default CadastroProduto