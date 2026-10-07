import {
  useEffect,
  useState
} from 'react'

import {
  useNavigate
} from 'react-router-dom'

import api from './services/api'

function LayoutSistema({
  children,
  titulo,
  subtitulo,
  paginaAtiva,
  tipoUsuario
}) {
  const navigate = useNavigate()

  const [notificacoes, setNotificacoes] =
    useState([])

  const [
    mostrarNotificacoes,
    setMostrarNotificacoes
  ] = useState(false)

  const nome =
    localStorage.getItem('nome')

  const tipo =
    tipoUsuario ||
    localStorage.getItem('tipo') ||
    'produtor'

  const ehAdmin =
    tipo === 'admin'

  const cadastroCompleto =
    localStorage.getItem(
      'cadastroCompleto'
    ) === 'true'

  useEffect(() => {
    buscarNotificacoes()

    const intervalo = setInterval(
      buscarNotificacoes,
      30000
    )

    return () => {
      clearInterval(intervalo)
    }
  }, [])

  const buscarNotificacoes = async () => {
    try {
      const resposta =
        await api.get('/notificacoes')

      setNotificacoes(
        resposta.data
      )
    } catch (err) {
      console.error(
        'Erro ao buscar notificações:',
        err
      )
    }
  }

  const naoLidas =
    notificacoes.filter(
      (notificacao) =>
        !notificacao.lida
    ).length

  const formatarDataNotificacao = (
    data
  ) => {
    if (!data) {
      return ''
    }

    return new Date(data)
      .toLocaleString(
        'pt-BR',
        {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }
      )
  }

  const abrirNotificacao =
    async (notificacao) => {
      try {
        if (!notificacao.lida) {
          await api.patch(
            `/notificacoes/${notificacao.id}/lida`
          )

          setNotificacoes(
            notificacoes.map(
              (item) =>
                item.id ===
                notificacao.id
                  ? {
                      ...item,
                      lida: true
                    }
                  : item
            )
          )
        }

        setMostrarNotificacoes(false)

        if (notificacao.link) {
          navigate(
            notificacao.link
          )
        }
      } catch (err) {
        console.error(
          'Erro ao abrir notificação:',
          err
        )
      }
    }

  const marcarTodasComoLidas =
    async () => {
      try {
        await api.patch(
          '/notificacoes/ler-todas'
        )

        setNotificacoes(
          notificacoes.map(
            (notificacao) => ({
              ...notificacao,
              lida: true
            })
          )
        )
      } catch (err) {
        console.error(
          'Erro ao marcar notificações:',
          err
        )
      }
    }

  const irParaCadastroProduto = () => {
    if (!cadastroCompleto) {
      navigate('/perfil')
      return
    }

    navigate('/cadastro')
  }

  const sair = () => {
    localStorage.removeItem(
      'token'
    )

    localStorage.removeItem(
      'nome'
    )

    localStorage.removeItem(
      'tipo'
    )

    localStorage.removeItem(
      'cadastroCompleto'
    )

    navigate('/')
  }

  return (
    <div className="app-layout">

      <style>
        {`
          .topbar-acoes {
            display: flex;
            align-items: center;
            gap: 18px;
          }

          .notificacoes-wrapper {
            position: relative;
          }

          .notificacao-botao {
            width: 42px;
            height: 42px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            background: transparent;
            color: #56625b;
            border: 1px solid #e1e6e3;
            border-radius: 50%;
          }

          .notificacao-botao:hover {
            background: #f4f7f5;
            color: #1b5e20;
          }

          .notificacao-badge {
            min-width: 18px;
            height: 18px;
            position: absolute;
            top: -5px;
            right: -4px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 5px;
            background: #c62828;
            color: white;
            border: 2px solid white;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
          }

          .notificacoes-caixa {
            width: 360px;
            max-height: 460px;
            position: absolute;
            top: 52px;
            right: 0;
            z-index: 1000;
            overflow: hidden;
            background: white;
            border: 1px solid #e1e6e3;
            border-radius: 10px;
            box-shadow:
              0 10px 30px
              rgba(0, 0, 0, 0.12);
          }

          .notificacoes-cabecalho {
            display: flex;
            align-items: center;
            justify-content:
              space-between;
            gap: 15px;
            padding: 15px 17px;
            border-bottom:
              1px solid #edf0ee;
          }

          .notificacoes-cabecalho strong {
            color: #26332b;
            font-size: 14px;
          }

          .notificacoes-marcar {
            padding: 0;
            background: transparent;
            color: #23764e;
            border: none;
            font-size: 11px;
            font-weight: 600;
          }

          .notificacoes-marcar:hover {
            background: transparent;
            color: #174f1b;
          }

          .notificacoes-lista {
            max-height: 390px;
            overflow-y: auto;
          }

          .notificacao-item {
            width: 100%;
            display: block;
            padding: 14px 17px;
            background: white;
            color: inherit;
            border: none;
            border-bottom:
              1px solid #edf0ee;
            border-radius: 0;
            text-align: left;
          }

          .notificacao-item:hover {
            background: #f7faf8;
          }

          .notificacao-item.nao-lida {
            background: #edf6f1;
          }

          .notificacao-item.nao-lida:hover {
            background: #e3f0e9;
          }

          .notificacao-item strong {
            display: block;
            margin-bottom: 4px;
            color: #26332b;
            font-size: 13px;
          }

          .notificacao-item p {
            margin: 0;
            color: #68736d;
            font-size: 12px;
            line-height: 1.45;
          }

          .notificacao-data {
            display: block;
            margin-top: 7px;
            color: #9aa19d;
            font-size: 10px;
          }

          .notificacoes-vazio {
            padding: 30px 20px;
            color: #8a938e;
            font-size: 12px;
            text-align: center;
          }

          @media (max-width: 700px) {
            .topbar-acoes {
              gap: 8px;
            }

            .notificacoes-caixa {
              width: 300px;
              right: -60px;
            }
          }
        `}
      </style>

      {/* Menu lateral */}
      <aside className="sidebar">

        <div className="sidebar-logo">

          <div className="logo-texto">
            <strong>APOMS</strong>
            <span>
              Sistema de Gestão
            </span>
          </div>

        </div>

        <nav className="sidebar-menu">

          {ehAdmin ? (
            <>
              <button
                className={`sidebar-item ${
                  paginaAtiva ===
                  'admin-solicitacoes'
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

                <span>
                  Solicitações
                </span>
              </button>

              <button
                className={`sidebar-item ${
                  paginaAtiva ===
                  'admin-produtos'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  navigate(
                    '/admin/produtos'
                  )
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

                <span>
                  Produtos
                </span>
              </button>

              <button
                className={`sidebar-item ${
                  paginaAtiva ===
                  'admin-produtores'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  navigate(
                    '/admin/produtores'
                  )
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
                      cx="9"
                      cy="8"
                      r="3"
                    />

                    <circle
                      cx="17"
                      cy="9"
                      r="2.5"
                    />

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
                  paginaAtiva ===
                  'admin-relatorios'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  navigate(
                    '/admin/relatorios'
                  )
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

                <span>
                  Relatórios
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                className={`sidebar-item ${
                  paginaAtiva ===
                  'painel'
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

                <span>
                  Painel
                </span>
              </button>

              <button
                className={`sidebar-item ${
                  paginaAtiva ===
                  'cadastro'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={
                  irParaCadastroProduto
                }
              >
                <span className="sidebar-icon">
                  +
                </span>

                <span>
                  Cadastrar oferta
                </span>
              </button>

              <button
                className={`sidebar-item ${
                  paginaAtiva ===
                  'solicitacoes'
                    ? 'ativo'
                    : ''
                }`}
                type="button"
                onClick={() =>
                  navigate(
                    '/solicitacoes'
                  )
                }
              >
                <span className="sidebar-icon">
                  ≡
                </span>

                <span>
                  Minhas solicitações
                </span>
              </button>

              <button
                className={`sidebar-item ${
                  paginaAtiva ===
                  'perfil'
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

                <span>
                  Meu perfil
                </span>
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

          <div className="topbar-acoes">

            <div className="notificacoes-wrapper">

              <button
                className="notificacao-botao"
                type="button"
                title="Notificações"
                onClick={() => {
                  setMostrarNotificacoes(
                    !mostrarNotificacoes
                  )

                  if (
                    !mostrarNotificacoes
                  ) {
                    buscarNotificacoes()
                  }
                }}
              >
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
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>

                {naoLidas > 0 && (
                  <span className="notificacao-badge">
                    {naoLidas > 9
                      ? '9+'
                      : naoLidas}
                  </span>
                )}

              </button>

              {mostrarNotificacoes && (
                <div className="notificacoes-caixa">

                  <div className="notificacoes-cabecalho">

                    <strong>
                      Notificações
                    </strong>

                    {naoLidas > 0 && (
                      <button
                        className="notificacoes-marcar"
                        type="button"
                        onClick={
                          marcarTodasComoLidas
                        }
                      >
                        Marcar todas como lidas
                      </button>
                    )}

                  </div>

                  <div className="notificacoes-lista">

                    {notificacoes.length === 0 ? (
                      <div className="notificacoes-vazio">
                        Nenhuma notificação.
                      </div>
                    ) : (
                      notificacoes.map(
                        (notificacao) => (
                          <button
                            key={
                              notificacao.id
                            }
                            className={`notificacao-item ${
                              !notificacao.lida
                                ? 'nao-lida'
                                : ''
                            }`}
                            type="button"
                            onClick={() =>
                              abrirNotificacao(
                                notificacao
                              )
                            }
                          >
                            <strong>
                              {
                                notificacao.titulo
                              }
                            </strong>

                            <p>
                              {
                                notificacao.mensagem
                              }
                            </p>

                            <span className="notificacao-data">
                              {formatarDataNotificacao(
                                notificacao.data_criacao
                              )}
                            </span>

                          </button>
                        )
                      )
                    )}

                  </div>

                </div>
              )}

            </div>

            <div className="usuario">

              <div className="usuario-avatar">
                {nome
                  ? nome
                      .charAt(0)
                      .toUpperCase()
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

          </div>

        </header>

        {children}

      </main>

    </div>
  )
}

export default LayoutSistema