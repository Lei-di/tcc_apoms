import {
  useEffect,
  useMemo,
  useState
} from 'react'

import {
  useNavigate
} from 'react-router-dom'

import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function IconeCaminhao() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h11v10H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M14 18H9" />
      <path d="M3 18h2" />
    </svg>
  )
}

function DashboardAdmin() {
  const [solicitacoes, setSolicitacoes] =
    useState([])

  const [
    solicitacoesProdutos,
    setSolicitacoesProdutos
  ] = useState([])

  const [
    dataSelecionada,
    setDataSelecionada
  ] = useState(null)

  const hoje = new Date()

  const [mesAtual, setMesAtual] =
    useState(
      hoje.getMonth()
    )

  const [anoAtual, setAnoAtual] =
    useState(
      hoje.getFullYear()
    )

  const navigate = useNavigate()

  useEffect(() => {
    buscarDados()
  }, [])

  useEffect(() => {
    if (dataSelecionada) {
      document.body.style.overflow =
        'hidden'
    } else {
      document.body.style.overflow =
        ''
    }

    return () => {
      document.body.style.overflow =
        ''
    }
  }, [dataSelecionada])

  const buscarDados = async () => {
    try {
      const [
        respostaSolicitacoes,
        respostaProdutos
      ] = await Promise.all([
        api.get(
          '/solicitacoes/todas'
        ),

        api.get(
          '/produtos/solicitacoes'
        )
      ])

      setSolicitacoes(
        respostaSolicitacoes.data
      )

      setSolicitacoesProdutos(
        respostaProdutos.data
      )
    } catch (err) {
      console.error(
        'Erro ao carregar painel do administrador:',
        err
      )
    }
  }

  const ofertasPendentes =
    solicitacoes.filter(
      (solicitacao) =>
        solicitacao.status ===
        'pendente'
    )

  const inclusoesPendentes =
    solicitacoesProdutos.filter(
      (solicitacao) =>
        solicitacao.status ===
        'pendente'
    )

  const contraofertas =
    solicitacoes.filter(
      (solicitacao) =>
        solicitacao.status ===
        'contraoferta'
    )

  const retiradas =
    solicitacoes.filter(
      (solicitacao) =>
        (
          solicitacao.status ===
            'aprovado' ||
          solicitacao.status ===
            'contraoferta_aceita'
        ) &&
        solicitacao.data_disponibilidade
    )

  const irParaSolicitacoes = () => {
    navigate('/admin')
  }

  const handleTecladoCard = (
    e
  ) => {
    if (
      e.key === 'Enter' ||
      e.key === ' '
    ) {
      e.preventDefault()

      irParaSolicitacoes()
    }
  }

  const extrairData = (
    data
  ) => {
    if (!data) {
      return null
    }

    const somenteData =
      data.split('T')[0]

    const [ano, mes, dia] =
      somenteData
        .split('-')
        .map(Number)

    return {
      ano,
      mes,
      dia
    }
  }

  const chaveData = (
    ano,
    mes,
    dia
  ) => {
    const mesFormatado =
      String(mes).padStart(
        2,
        '0'
      )

    const diaFormatado =
      String(dia).padStart(
        2,
        '0'
      )

    return `${ano}-${mesFormatado}-${diaFormatado}`
  }

  const retiradasPorData =
    useMemo(() => {
      const agrupadas = {}

      retiradas.forEach(
        (solicitacao) => {
          const data =
            extrairData(
              solicitacao.data_disponibilidade
            )

          if (!data) {
            return
          }

          const chave =
            chaveData(
              data.ano,
              data.mes,
              data.dia
            )

          if (!agrupadas[chave]) {
            agrupadas[chave] = []
          }

          agrupadas[chave].push(
            solicitacao
          )
        }
      )

      return agrupadas
    }, [solicitacoes])

  const diasCalendario =
    useMemo(() => {
      const primeiroDia =
        new Date(
          anoAtual,
          mesAtual,
          1
        ).getDay()

      const totalDias =
        new Date(
          anoAtual,
          mesAtual + 1,
          0
        ).getDate()

      const dias = []

      for (
        let i = 0;
        i < primeiroDia;
        i++
      ) {
        dias.push(null)
      }

      for (
        let dia = 1;
        dia <= totalDias;
        dia++
      ) {
        dias.push(dia)
      }

      while (
        dias.length % 7 !== 0
      ) {
        dias.push(null)
      }

      return dias
    }, [
      mesAtual,
      anoAtual
    ])

  const mesAnterior = () => {
    if (mesAtual === 0) {
      setMesAtual(11)

      setAnoAtual(
        anoAtual - 1
      )
    } else {
      setMesAtual(
        mesAtual - 1
      )
    }
  }

  const proximoMes = () => {
    if (mesAtual === 11) {
      setMesAtual(0)

      setAnoAtual(
        anoAtual + 1
      )
    } else {
      setMesAtual(
        mesAtual + 1
      )
    }
  }

  const abrirRetiradas = (
    dia
  ) => {
    const chave =
      chaveData(
        anoAtual,
        mesAtual + 1,
        dia
      )

    const retiradasDoDia =
      retiradasPorData[chave] ||
      []

    if (
      retiradasDoDia.length === 0
    ) {
      return
    }

    setDataSelecionada({
      chave,
      retiradas:
        retiradasDoDia
    })
  }

  const fecharRetiradas = () => {
    setDataSelecionada(null)
  }

  const formatarData = (
    data
  ) => {
    if (!data) {
      return '-'
    }

    const somenteData =
      data.split('T')[0]

    const [ano, mes, dia] =
      somenteData.split('-')

    return `${dia}/${mes}/${ano}`
  }

  const formatarPreco = (
    preco
  ) => {
    if (
      preco === null ||
      preco === undefined
    ) {
      return '-'
    }

    return Number(
      preco
    ).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    )
  }

  const quantidadeFinal = (
    solicitacao
  ) => {
    if (
      solicitacao.status ===
      'contraoferta_aceita'
    ) {
      return (
        solicitacao.quantidade_contraoferta ||
        solicitacao.quantidade
      )
    }

    return solicitacao.quantidade
  }

  const precoFinal = (
    solicitacao
  ) => {
    if (
      solicitacao.status ===
      'contraoferta_aceita'
    ) {
      return (
        solicitacao.preco_contraoferta ??
        solicitacao.preco
      )
    }

    return solicitacao.preco
  }

  const nomeMes =
    new Intl.DateTimeFormat(
      'pt-BR',
      {
        month: 'long',
        year: 'numeric'
      }
    ).format(
      new Date(
        anoAtual,
        mesAtual,
        1
      )
    )

  return (
    <LayoutSistema
      titulo="Painel do Administrador"
      subtitulo="Acompanhe solicitações e retiradas programadas."
      paginaAtiva="admin-painel"
      tipoUsuario="admin"
    >
      <style>
        {`
          .admin-dashboard-content {
            padding-top: 20px;
            padding-bottom: 20px;
          }

          .admin-painel-layout {
            display: grid;
            grid-template-columns:
              minmax(0, 2.2fr)
              minmax(240px, 0.8fr);
            gap: 24px;
            align-items: start;
          }

          .admin-painel-resumos {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .admin-resumo-card {
            cursor: pointer;

            transition:
              background-color 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              transform 0.2s ease;
          }

          .admin-resumo-card:hover {
            background-color: #e7f1e8 !important;
            border-color: #9fc5a4 !important;

            box-shadow:
              0 4px 12px
              rgba(27, 94, 32, 0.10);

            transform:
              translateY(-2px);
          }

          .admin-resumo-card:focus-visible {
            outline:
              2px solid #1b5e20;

            outline-offset: 2px;
          }

          .admin-calendario-dia-retirada {
            cursor: pointer;

            transition:
              background-color 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              transform 0.15s ease;
          }

          .admin-calendario-dia-retirada:hover {
            background-color:
              #c4dfc7 !important;

            border-color:
              #4e8d56 !important;

            box-shadow:
              0 3px 8px
              rgba(27, 94, 32, 0.12);

            transform:
              translateY(-1px);
          }

          .admin-calendario-navegacao:hover {
            background-color:
              rgba(
                255,
                255,
                255,
                0.22
              ) !important;

            color:
              white !important;
          }

          @media (max-width: 1000px) {
            .admin-painel-layout {
              grid-template-columns:
                1fr;
            }

            .admin-painel-resumos {
              display: grid;

              grid-template-columns:
                repeat(
                  3,
                  minmax(0, 1fr)
                );
            }
          }

          @media (max-width: 800px) {
            .admin-painel-resumos {
              grid-template-columns:
                1fr;
            }

            .admin-calendario-cabecalho {
              flex-direction:
                column;

              align-items:
                flex-start !important;
            }
          }
        `}
      </style>

      <section
        className="dashboard-content admin-dashboard-content"
      >

        <div className="admin-painel-layout">

          {/* Calendário */}
          <div
            className="table-card"
            style={calendarioCard}
          >

            <div
              className="admin-calendario-cabecalho"
              style={calendarioCabecalho}
            >

              <div>

                <h2 style={calendarioTitulo}>
                  Calendário de retiradas
                </h2>

                <p style={calendarioDescricao}>
                  Consulte as retiradas programadas das ofertas aprovadas.
                </p>

              </div>

              <div style={navegacaoMes}>

                <button
                  type="button"
                  className="admin-calendario-navegacao"
                  style={botaoNavegacao}
                  onClick={
                    mesAnterior
                  }
                  aria-label="Mês anterior"
                >
                  ‹
                </button>

                <strong style={nomeMesStyle}>
                  {nomeMes}
                </strong>

                <button
                  type="button"
                  className="admin-calendario-navegacao"
                  style={botaoNavegacao}
                  onClick={
                    proximoMes
                  }
                  aria-label="Próximo mês"
                >
                  ›
                </button>

              </div>

            </div>

            <div style={calendarioCorpo}>

              <div style={calendarioGrid}>

                {[
                  'Dom',
                  'Seg',
                  'Ter',
                  'Qua',
                  'Qui',
                  'Sex',
                  'Sáb'
                ].map(
                  (diaSemana) => (
                    <div
                      key={diaSemana}
                      style={
                        diaSemanaStyle
                      }
                    >
                      {diaSemana}
                    </div>
                  )
                )}

                {diasCalendario.map(
                  (
                    dia,
                    indice
                  ) => {
                    if (!dia) {
                      return (
                        <div
                          key={`vazio-${indice}`}
                          style={diaVazio}
                        />
                      )
                    }

                    const chave =
                      chaveData(
                        anoAtual,
                        mesAtual + 1,
                        dia
                      )

                    const retiradasDoDia =
                      retiradasPorData[
                        chave
                      ] || []

                    const possuiRetirada =
                      retiradasDoDia.length >
                      0

                    const ehHoje =
                      dia ===
                        hoje.getDate() &&
                      mesAtual ===
                        hoje.getMonth() &&
                      anoAtual ===
                        hoje.getFullYear()

                    return (
                      <button
                        key={chave}
                        type="button"
                        className={
                          possuiRetirada
                            ? 'admin-calendario-dia-retirada'
                            : ''
                        }
                        style={{
                          ...diaCalendario,

                          ...(ehHoje
                            ? diaHoje
                            : {}),

                          ...(possuiRetirada
                            ? diaComRetirada
                            : {})
                        }}
                        onClick={() =>
                          abrirRetiradas(
                            dia
                          )
                        }
                        disabled={
                          !possuiRetirada
                        }
                      >

                        <div style={cabecalhoDia}>

                          <span style={numeroDia}>
                            {dia}
                          </span>

                          {possuiRetirada && (
                            <span style={iconeRetirada}>
                              <IconeCaminhao />
                            </span>
                          )}

                        </div>

                      </button>
                    )
                  }
                )}

              </div>

            </div>

          </div>

          {/* Resumo */}
          <div className="admin-painel-resumos">

            <div
              className="table-card admin-resumo-card"
              style={cardResumo}
              onClick={
                irParaSolicitacoes
              }
              onKeyDown={
                handleTecladoCard
              }
              role="button"
              tabIndex="0"
            >

              <span style={tituloCard}>
                Ofertas pendentes
              </span>

              <strong style={numeroCard}>
                {
                  ofertasPendentes.length
                }
              </strong>

              <span style={descricaoCard}>
                Ofertas aguardando sua avaliação
              </span>

            </div>

            <div
              className="table-card admin-resumo-card"
              style={cardResumo}
              onClick={
                irParaSolicitacoes
              }
              onKeyDown={
                handleTecladoCard
              }
              role="button"
              tabIndex="0"
            >

              <span style={tituloCard}>
                Inclusões de produto
              </span>

              <strong style={numeroCard}>
                {
                  inclusoesPendentes.length
                }
              </strong>

              <span style={descricaoCard}>
                Produtos aguardando análise
              </span>

            </div>

            <div
              className="table-card admin-resumo-card"
              style={cardResumo}
              onClick={
                irParaSolicitacoes
              }
              onKeyDown={
                handleTecladoCard
              }
              role="button"
              tabIndex="0"
            >

              <span style={tituloCard}>
                Contraofertas
              </span>

              <strong style={numeroCard}>
                {
                  contraofertas.length
                }
              </strong>

              <span style={descricaoCard}>
                Aguardando resposta dos produtores
              </span>

            </div>

          </div>

        </div>

        {/* Modal das retiradas */}
        {dataSelecionada && (
          <div
            style={modalOverlay}
            onClick={
              fecharRetiradas
            }
          >

            <div
              style={modalConteudo}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div style={modalCabecalho}>

                <div>

                  <h3 style={modalTitulo}>
                    Programação do dia -{' '}
                    {formatarData(
                      dataSelecionada.chave
                    )}
                  </h3>

                </div>

                <button
                  type="button"
                  style={
                    botaoFecharModal
                  }
                  onClick={
                    fecharRetiradas
                  }
                  aria-label="Fechar"
                >
                  ×
                </button>

              </div>

              <div style={listaRetiradas}>

                {dataSelecionada.retiradas.map(
                  (solicitacao) => (
                    <div
                      key={
                        solicitacao.id
                      }
                      style={retiradaItem}
                    >

                      <strong style={produtoRetirada}>
                        {
                          solicitacao.nome_produto
                        }
                      </strong>

                      <div style={produtorRetirada}>

                        <span style={rotuloDetalhe}>
                          Produtor
                        </span>

                        <strong style={valorDetalhe}>
                          {
                            solicitacao.nome_produtor ||
                            'Não informado'
                          }
                        </strong>

                      </div>

                      <div style={detalhesRetirada}>

                        <div>

                          <span style={rotuloDetalhe}>
                            Quantidade
                          </span>

                          <strong style={valorDetalhe}>
                            {quantidadeFinal(
                              solicitacao
                            )}
                          </strong>

                        </div>

                        <div>

                          <span style={rotuloDetalhe}>
                            Preço
                          </span>

                          <strong style={valorDetalhe}>
                            {formatarPreco(
                              precoFinal(
                                solicitacao
                              )
                            )}
                          </strong>

                        </div>

                      </div>

                      {solicitacao.observacao_produtor && (
                        <div style={observacaoRetirada}>

                          <span style={rotuloDetalhe}>
                            Observação
                          </span>

                          <p>
                            {
                              solicitacao.observacao_produtor
                            }
                          </p>

                        </div>
                      )}

                    </div>
                  )
                )}

              </div>

              <div style={acoesModal}>

                <button
                  className="btn-principal"
                  type="button"
                  onClick={
                    fecharRetiradas
                  }
                >
                  Fechar
                </button>

              </div>

            </div>

          </div>
        )}

      </section>

    </LayoutSistema>
  )
}

const cardResumo = {
  minHeight: '123px',
  padding: '20px 22px',
  background: '#eef5ef',
  borderColor: '#c9ddcb',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
}

const tituloCard = {
  display: 'block',
  marginBottom: '7px',
  color: '#25682b',
  fontSize: '14px',
  fontWeight: '600'
}

const numeroCard = {
  display: 'block',
  color: '#26332b',
  fontSize: '30px',
  lineHeight: '1.1'
}

const descricaoCard = {
  display: 'block',
  marginTop: '7px',
  color: '#637766',
  fontSize: '12px',
  lineHeight: '1.4'
}

const calendarioCard = {
  width: '100%',
  margin: 0,
  padding: 0,
  overflow: 'hidden'
}

const calendarioCabecalho = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '18px',
  padding: '11px 18px',
  background: '#1b5e20',
  borderBottom:
    '1px solid #154d19'
}

const calendarioTitulo = {
  margin: 0,
  color: 'white',
  fontSize: '18px'
}

const calendarioDescricao = {
  marginTop: '3px',
  color:
    'rgba(255, 255, 255, 0.82)',
  fontSize: '12px'
}

const navegacaoMes = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
}

const nomeMesStyle = {
  minWidth: '145px',
  color: 'white',
  fontSize: '14px',
  textAlign: 'center',
  textTransform: 'capitalize'
}

const botaoNavegacao = {
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,

  background:
    'rgba(255, 255, 255, 0.12)',

  color: 'white',

  border:
    '1px solid rgba(255, 255, 255, 0.35)',

  borderRadius: '6px',
  fontSize: '19px',
  lineHeight: 1
}

const calendarioCorpo = {
  padding: '9px 14px 12px',
  background: '#ffffff'
}

const calendarioGrid = {
  display: 'grid',

  gridTemplateColumns:
    'repeat(7, minmax(0, 1fr))',

  gridAutoRows: '51px',
  gap: '5px'
}

const diaSemanaStyle = {
  height: '25px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#626b65',
  fontSize: '12px',
  fontWeight: '600'
}

const diaVazio = {
  width: '100%',
  height: '51px'
}

const diaCalendario = {
  width: '100%',
  height: '51px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  padding: '7px 9px',
  background: '#f4f6f5',
  color: '#36413a',
  border:
    '1px solid #dce2de',
  borderRadius: '7px',
  textAlign: 'left'
}

const cabecalhoDia = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%'
}

const diaHoje = {
  border:
    '1px solid #78977d'
}

const diaComRetirada = {
  background: '#d7ead9',
  border:
    '1px solid #6fa879',
  cursor: 'pointer'
}

const numeroDia = {
  fontSize: '17px',
  fontWeight: '700',
  lineHeight: 1,
  color: '#36413a'
}

const iconeRetirada = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#1b5e20',
  flexShrink: 0
}

const modalOverlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 3000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '25px',

  background:
    'rgba(20, 28, 23, 0.55)'
}

const modalConteudo = {
  width: '100%',
  maxWidth: '720px',
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: '28px',
  background: 'white',

  border:
    '1px solid #e1e6e3',

  borderRadius: '10px',

  boxShadow:
    '0 18px 50px rgba(0, 0, 0, 0.20)'
}

const modalCabecalho = {
  display: 'flex',
  alignItems: 'flex-start',

  justifyContent:
    'space-between',

  gap: '20px',
  marginBottom: '24px'
}

const modalTitulo = {
  margin: 0,
  color: '#26332b',
  fontSize: '21px'
}

const botaoFecharModal = {
  width: '36px',
  height: '36px',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  flexShrink: 0,
  padding: 0,
  background: 'transparent',
  color: '#657069',

  border:
    '1px solid #d7ddd9',

  borderRadius: '6px',
  fontSize: '22px',
  lineHeight: 1
}

const listaRetiradas = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px'
}

const retiradaItem = {
  padding: '18px',
  background: '#f8fbf8',

  border:
    '1px solid #dfe8df',

  borderRadius: '9px'
}

const produtoRetirada = {
  display: 'block',
  marginBottom: '14px',
  color: '#26332b',
  fontSize: '17px'
}

const produtorRetirada = {
  marginBottom: '16px',
  paddingBottom: '14px',

  borderBottom:
    '1px solid #e2e9e2'
}

const detalhesRetirada = {
  display: 'grid',

  gridTemplateColumns:
    'repeat(2, minmax(0, 1fr))',

  gap: '16px'
}

const rotuloDetalhe = {
  display: 'block',
  marginBottom: '5px',
  color: '#6e7d70',
  fontSize: '12px'
}

const valorDetalhe = {
  color: '#334536',
  fontSize: '14px'
}

const observacaoRetirada = {
  marginTop: '16px',
  paddingTop: '14px',

  borderTop:
    '1px solid #e2e9e2',

  color: '#405343',
  fontSize: '14px',
  lineHeight: '1.5'
}

const acoesModal = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '22px'
}

export default DashboardAdmin