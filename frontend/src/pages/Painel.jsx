import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Painel() {
  const [produtos, setProdutos] = useState([])
  const navigate = useNavigate()
  const nome = localStorage.getItem('nome')

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

  const sair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nome')
    navigate('/')
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
    <div className="app-layout">

      {/* Menu lateral */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-apoms">
            A
          </div>

          <div className="logo-texto">
            <strong>APOMS</strong>
            <span>Sistema de Gestão</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button
            className="sidebar-item ativo"
            type="button"
          >
            <span className="sidebar-icon">▦</span>
            <span>Painel</span>
          </button>

          <button
            className="sidebar-item"
            type="button"
            onClick={() => navigate('/cadastro')}
          >
            <span className="sidebar-icon">+</span>
            <span>Cadastrar produto</span>
          </button>

          <button
            className="sidebar-item"
            type="button"
            onClick={() => navigate('/solicitacoes')}
          >
            <span className="sidebar-icon">≡</span>
            <span>Minhas solicitações</span>
          </button>
        </nav>

        <div className="sidebar-rodape">
          <button
            className="sidebar-item sidebar-sair"
            type="button"
            onClick={sair}
          >
            <span className="sidebar-icon">↪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Área principal */}
      <main className="main-content">

        {/* Cabeçalho */}
        <header className="topbar">
          <div className="topbar-titulo">
            <h1>Painel do Produtor</h1>
            <p>
              Gerencie seus produtos e acompanhe suas solicitações.
            </p>
          </div>

          <div className="usuario">
            <div className="usuario-avatar">
              {nome ? nome.charAt(0).toUpperCase() : 'P'}
            </div>

            <div className="usuario-dados">
              <span>Produtor</span>
              <strong>{nome || 'Usuário'}</strong>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
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
      </main>
    </div>
  )
}

export default Painel