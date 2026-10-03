import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function Painel() {
  const [produtos, setProdutos] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    buscarProdutos()
  }, [])

  const buscarProdutos = async () => {
    try {
      const resposta = await api.get('/produtos')
      setProdutos(resposta.data)
    } catch (err) {
      console.error('Erro ao buscar produtos:', err)
      navigate('/')
    }
  }

  const formatarData = (data) => {
    if (!data) {
      return '-'
    }

    const somenteData = data.split('T')[0]
    const [ano, mes, dia] = somenteData.split('-')

    return `${dia}/${mes}/${ano}`
  }

  const formatarPreco = (preco) => {
    if (preco === null || preco === undefined) {
      return 'R$ 0,00'
    }

    return Number(preco).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <LayoutSistema
      titulo="Painel do Produtor"
      subtitulo="Gerencie seus produtos e acompanhe suas solicitações."
      paginaAtiva="painel"
    >
      <section className="dashboard-content">

        <div className="page-header">
          <div>
            <h2>Meus Produtos</h2>

            <p>
              Visualize os produtos cadastrados e suas disponibilidades.
            </p>
          </div>

          <button
            className="btn-principal"
            type="button"
            onClick={() => navigate('/cadastro')}
          >
            <span className="btn-icone">+</span>
            Cadastrar produto
          </button>
        </div>

        {/* Produtos */}
        <div className="table-card">

          {produtos.length === 0 ? (
            <div className="estado-vazio">
              <div className="estado-vazio-icone">
                +
              </div>

              <h3>Nenhum produto cadastrado</h3>

              <p>
                Você ainda não possui produtos cadastrados.
              </p>

              <button
                className="btn-secundario"
                type="button"
                onClick={() => navigate('/cadastro')}
              >
                Cadastrar primeiro produto
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Disponibilidade</th>
                    <th>Preço</th>
                  </tr>
                </thead>

                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id}>
                      <td>
                        <strong className="produto-nome">
                          {produto.nome_produto}
                        </strong>
                      </td>

                      <td>
                        {produto.quantidade}
                      </td>

                      <td>
                        {formatarData(produto.data_disponibilidade)}
                      </td>

                      <td className="produto-preco">
                        {formatarPreco(produto.preco)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </section>
    </LayoutSistema>
  )
}

export default Painel