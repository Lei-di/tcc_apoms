import { useNavigate } from 'react-router-dom'

function LayoutSistema({
  children,
  titulo,
  subtitulo,
  paginaAtiva,
  tipoUsuario
}) {
  const navigate = useNavigate()

  const nome = localStorage.getItem('nome')
  const tipo =
    tipoUsuario ||
    localStorage.getItem('tipo') ||
    'produtor'

  const ehAdmin = tipo === 'admin'

  const cadastroCompleto =
    localStorage.getItem(
      'cadastroCompleto'
    ) === 'true'

  const irParaCadastroProduto = () => {
    if (!cadastroCompleto) {
      navigate('/perfil')
      return
    }

    navigate('/cadastro')
  }

  const sair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nome')
    localStorage.removeItem('tipo')
    localStorage.removeItem('cadastroCompleto')

    navigate('/')
  }

  return (
    <div className="app-layout">

      {/* Menu lateral */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-texto">
            <strong>APOMS</strong>
            <span>Sistema de Gestão</span>
          </div>
        </div>

        <nav className="sidebar-menu">

          {ehAdmin ? (
            <>
              <button
                className={`sidebar-item ${
                  paginaAtiva === 'admin-solicitacoes'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  navigate('/admin')
                }
              >
                <span className="sidebar-icon">
                  ≡
                </span>

                <span>Solicitações</span>
              </button>

              <button
                className={`sidebar-item ${
                  paginaAtiva === 'admin-produtos'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  navigate('/admin/produtos')
                }
              >
                <span className="sidebar-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 10h14l-1.4 9H6.4L5 10Z" />
                    <path d="M8 10l2-5" />
                    <path d="M16 10l-2-5" />
                    <path d="M8 14h8" />
                    <path d="M9 17h6" />
                  </svg>
                </span>

                <span>Produtos</span>
              </button>

              <button
                className={`sidebar-item ${
                  paginaAtiva === 'admin-produtores'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  navigate('/admin/produtores')
                }
              >
                <span className="sidebar-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="9" cy="8" r="3" />
                    <circle cx="17" cy="9" r="2.5" />
                    <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
                    <path d="M14 15c.8-.7 1.9-1 3-1 2.3 0 4 1.5 4 3.5" />
                  </svg>
                </span>

                <span>
                  Produtores cadastrados
                </span>
              </button>

              <button
                className={`sidebar-item ${
                  paginaAtiva === 'admin-relatorios'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  navigate('/admin/relatorios')
                }
              >
                <span className="sidebar-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19V10" />
                    <path d="M10 19V5" />
                    <path d="M16 19v-7" />
                    <path d="M22 19V8" />
                    <path d="M2 19h22" />
                  </svg>
                </span>

                <span>Relatórios</span>
              </button>
            </>
          ) : (
            <>
              <button
                className={`sidebar-item ${
                  paginaAtiva === 'painel'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  navigate('/painel')
                }
              >
                <span className="sidebar-icon">
                  ▦
                </span>

                <span>Painel</span>
              </button>

              <button
                className={`sidebar-item ${
                  paginaAtiva === 'cadastro'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={irParaCadastroProduto}
              >
                <span className="sidebar-icon">
                  +
                </span>

                <span>Cadastrar produto</span>
              </button>

              <button
                className={`sidebar-item ${
                  paginaAtiva === 'solicitacoes'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  navigate('/solicitacoes')
                }
              >
                <span className="sidebar-icon">
                  ≡
                </span>

                <span>Minhas solicitações</span>
              </button>

              <button
                className={`sidebar-item ${
                  paginaAtiva === 'perfil'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  navigate('/perfil')
                }
              >
                <span className="sidebar-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="12"
                      cy="8"
                      r="3.5"
                    />

                    <path d="M5 20c0-3.7 3-6 7-6s7 2.3 7 6" />
                  </svg>
                </span>

                <span>Meu perfil</span>
              </button>
            </>
          )}

        </nav>

        <div className="sidebar-rodape">

          <button
            className="sidebar-item sidebar-sair"
            type="button"
            onClick={sair}
          >
            <span className="sidebar-icon">
              ↪
            </span>

            <span>Sair</span>
          </button>

        </div>

      </aside>

      {/* Área principal */}
      <main className="main-content">

        <header className="topbar">

          <div className="topbar-titulo">
            <h1>{titulo}</h1>
            <p>{subtitulo}</p>
          </div>

          <div className="usuario">

            <div className="usuario-avatar">
              {nome
                ? nome.charAt(0).toUpperCase()
                : ehAdmin
                  ? 'A'
                  : 'P'}
            </div>

            <div className="usuario-dados">
              <span>
                {ehAdmin
                  ? 'Administrador'
                  : 'Produtor'}
              </span>

              <strong>
                {nome || 'Usuário'}
              </strong>
            </div>

          </div>

        </header>

        {children}

      </main>

    </div>
  )
}

export default LayoutSistema