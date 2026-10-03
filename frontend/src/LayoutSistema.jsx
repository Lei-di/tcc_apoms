import { useNavigate } from 'react-router-dom'

function LayoutSistema({
  children,
  titulo,
  subtitulo,
  paginaAtiva
}) {
  const navigate = useNavigate()
  const nome = localStorage.getItem('nome')

  const sair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nome')
    navigate('/')
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
            className={`sidebar-item ${paginaAtiva === 'painel' ? 'ativo' : ''}`}
            type="button"
            onClick={() => navigate('/painel')}
          >
            <span className="sidebar-icon">▦</span>
            <span>Painel</span>
          </button>

          <button
            className={`sidebar-item ${paginaAtiva === 'cadastro' ? 'ativo' : ''}`}
            type="button"
            onClick={() => navigate('/cadastro')}
          >
            <span className="sidebar-icon">+</span>
            <span>Cadastrar produto</span>
          </button>

          <button
            className={`sidebar-item ${paginaAtiva === 'solicitacoes' ? 'ativo' : ''}`}
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
            <h1>{titulo}</h1>
            <p>{subtitulo}</p>
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

        {children}

      </main>
    </div>
  )
}

export default LayoutSistema