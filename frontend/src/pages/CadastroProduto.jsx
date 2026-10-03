import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function CadastroProduto() {
  const [nomeProduto, setNomeProduto] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('')
  const [dataDisponibilidade, setDataDisponibilidade] = useState('')
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
        data_disponibilidade: dataDisponibilidade,
        preco: parseFloat(preco)
      })

      setMensagem('Produto cadastrado com sucesso!')
      setNomeProduto('')
      setQuantidade('')
      setUnidade('')
      setDataDisponibilidade('')
      setPreco('')
    } catch (err) {
      console.error('Erro ao cadastrar produto:', err)
      setMensagem('Erro ao cadastrar produto. Tente novamente.')
    }
  }

  return (
    <LayoutSistema
      titulo="Cadastrar Produto"
      subtitulo="Informe os dados do produto que deseja disponibilizar."
      paginaAtiva="cadastro"
    >
      <section className="dashboard-content cadastro-produto-content">

        <div className="page-header">
          <div>
            <h2>Nova oferta</h2>
            <p>
              Preencha os dados abaixo para cadastrar um produto.
            </p>
          </div>
        </div>

        <div className="cadastro-card">
          <form
            className="cadastro-produto-form"
            onSubmit={handleCadastro}
          >
            <div className="campo campo-grande">
              <label>Produto</label>

              <select
                value={nomeProduto}
                onChange={(e) => setNomeProduto(e.target.value)}
                required
              >
                <option value="">Selecione o produto</option>

                {listaProdutos.map((produto) => (
                  <option
                    key={produto.id}
                    value={produto.nome}
                  >
                    {produto.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Quantidade</label>

              <input
                type="number"
                placeholder="Ex: 20"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="campo">
              <label>Unidade de medida</label>

              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                required
              >
                <option value="">Selecione a unidade</option>
                <option value="kg">kg</option>
                <option value="unidade">unidade</option>
                <option value="maço">maço</option>
                <option value="caixa">caixa</option>
                <option value="litro">litro</option>
                <option value="dúzia">dúzia</option>
              </select>
            </div>

            <div className="campo">
              <label>Disponibilidade</label>

              <input
                type="date"
                value={dataDisponibilidade}
                onChange={(e) => setDataDisponibilidade(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label>Preço (R$)</label>

              <input
                type="number"
                placeholder="Ex: 3.50"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                step="0.01"
                min="0"
                required
              />
            </div>

            {mensagem && (
              <p
                className={`mensagem-form ${
                  mensagem.includes('sucesso') ? 'sucesso' : 'erro'
                }`}
              >
                {mensagem}
              </p>
            )}

            <div className="acoes-form campo-grande">
              <button
                className="btn-voltar"
                type="button"
                onClick={() => navigate('/painel')}
              >
                Voltar
              </button>

              <button
                className="btn-principal"
                type="submit"
              >
                Cadastrar produto
              </button>
            </div>
          </form>
        </div>

      </section>
    </LayoutSistema>
  )
}

export default CadastroProduto