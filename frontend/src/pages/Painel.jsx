import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function Painel() {
  const [solicitacoes, setSolicitacoes] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState(null)

  const hoje = new Date()

  const [mesAtual, setMesAtual] = useState(
    hoje.getMonth()
  )

  const [anoAtual, setAnoAtual] = useState(
    hoje.getFullYear()
  )

  const navigate = useNavigate()

  useEffect(() => {
    buscarSolicitacoes()
  }, [])

  useEffect(() => {
    if (dataSelecionada) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [dataSelecionada])

  const buscarSolicitacoes = async () => {
    try {
      const resposta =
        await api.get('/solicitacoes/minhas')

      setSolicitacoes(resposta.data)
    } catch (err) {
      console.error(
        'Erro ao buscar solicitações:',
        err
      )

      navigate('/')
    }
  }

  const pendentes = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.status === 'pendente'
  )

  const contraofertas = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.status === 'contraoferta'
  )

  const retiradas = solicitacoes.filter(
    (solicitacao) =>
      (
        solicitacao.status === 'aprovado' ||
        solicitacao.status === 'contraoferta_aceita'
      ) &&
      solicitacao.data_disponibilidade
  )

  const irParaSolicitacoes = () => {
    navigate('/solicitacoes')
  }

  const handleTeclado = (e) => {
    if (
      e.key === 'Enter' ||
      e.key === ' '
    ) {
      irParaSolicitacoes()
    }
  }

  const extrairData = (data) => {
    if (!data) {
      return null
    }

    const somenteData =
      data.split('T')[0]

    const [ano, mes, dia] =
      somenteData.split('-').map(Number)

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
      String(mes).padStart(2, '0')

    const diaFormatado =
      String(dia).padStart(2, '0')

    return `${ano}-${mesFormatado}-${diaFormatado}`
  }

  const retiradasPorData = useMemo(() => {
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

  const diasCalendario = useMemo(() => {
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
      retiradasPorData[chave] || []

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
        solicitacao.preco_contraoferta ||
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
      titulo="Painel do Produtor"
      subtitulo="Acompanhe suas ofertas e retiradas."
      paginaAtiva="painel"
    >
      <style>
        {`
          .painel-resumo-card {
            cursor: pointer;
            transition:
              background-color 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              transform 0.2s ease;
          }

          .painel-resumo-card:hover {
            background-color: #f0f7f3;
            border-color: #bdd8c6;
            box-shadow: 0 5px 15px rgba(27, 94, 32, 0.08);
            transform: translateY(-2px);
          }

          .painel-resumo-card:focus-visible {
            outline: 2px solid #23764e;
            outline-offset: 2px;
          }

          .calendario-dia-com-retirada {
            cursor: pointer;
            transition:
              background-color 0.2s ease,
              border-color 0.2s ease,
              transform 0.15s ease;
          }

          .calendario-dia-com-retirada:hover {
            background-color: #edf7f0 !important;
            border-color: #a9cfb6 !important;
            transform: translateY(-1px);
          }

          .calendario-navegacao:hover {
            background-color: #edf6f1 !important;
            color: #1b5e20 !important;
          }
        `}
      </style>

      <section className="dashboard-content">

        {/* Resumo */}
        <div style={gradeResumo}>

          <div
            className="table-card painel-resumo-card"
            style={cardResumo}
            onClick={
              irParaSolicitacoes
            }
            onKeyDown={
              handleTeclado
            }
            role="button"
            tabIndex="0"
          >
            <span style={tituloCard}>
              Ofertas pendentes
            </span>

            <strong style={numeroCard}>
              {pendentes.length}
            </strong>

            <span style={descricaoCard}>
              Aguardando avaliação da APOMS
            </span>
          </div>

          <div
            className="table-card painel-resumo-card"
            style={cardResumo}
            onClick={
              irParaSolicitacoes
            }
            onKeyDown={
              handleTeclado
            }
            role="button"
            tabIndex="0"
          >
            <span style={tituloCard}>
              Contraofertas
            </span>

            <strong style={numeroCard}>
              {contraofertas.length}
            </strong>

            <span style={descricaoCard}>
              Propostas aguardando sua decisão
            </span>
          </div>

        </div>

        {/* Calendário */}
        <div
          className="table-card"
          style={calendarioCard}
        >

          <div style={calendarioCabecalho}>

            <div>
              <h2 style={calendarioTitulo}>
                Calendário de retiradas
              </h2>

              <p style={calendarioDescricao}>
                Consulte as datas programadas das suas ofertas aprovadas.
              </p>
            </div>

            <div style={navegacaoMes}>

              <button
                type="button"
                className="calendario-navegacao"
                style={botaoNavegacao}
                onClick={mesAnterior}
                aria-label="Mês anterior"
              >
                ‹
              </button>

              <strong style={nomeMesStyle}>
                {nomeMes}
              </strong>

              <button
                type="button"
                className="calendario-navegacao"
                style={botaoNavegacao}
                onClick={proximoMes}
                aria-label="Próximo mês"
              >
                ›
              </button>

            </div>

          </div>

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
                  style={diaSemanaStyle}
                >
                  {diaSemana}
                </div>
              )
            )}

            {diasCalendario.map(
              (dia, indice) => {
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
                  retiradasPorData[chave] ||
                  []

                const possuiRetirada =
                  retiradasDoDia.length > 0

                const ehHoje =
                  dia === hoje.getDate() &&
                  mesAtual === hoje.getMonth() &&
                  anoAtual === hoje.getFullYear()

                return (
                  <button
                    key={chave}
                    type="button"
                    className={
                      possuiRetirada
                        ? 'calendario-dia-com-retirada'
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

                    <span style={numeroDia}>
                      {dia}
                    </span>

                    {possuiRetirada && (
                      <div style={marcadorRetirada}>

                        <span style={pontoRetirada} />

                        <span>
                          {retiradasDoDia.length === 1
                            ? '1 produto'
                            : `${retiradasDoDia.length} produtos`}
                        </span>

                      </div>
                    )}

                  </button>
                )
              }
            )}

          </div>

        </div>

        {/* Modal */}
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
                  style={botaoFecharModal}
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

const gradeResumo = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(2, minmax(0, 1fr))',
  gap: '18px',
  marginBottom: '28px'
}

const cardResumo = {
  padding: '22px'
}

const tituloCard = {
  display: 'block',
  marginBottom: '10px',
  color: '#7b8580',
  fontSize: '14px'
}

const numeroCard = {
  display: 'block',
  color: '#26332b',
  fontSize: '30px'
}

const descricaoCard = {
  display: 'block',
  marginTop: '7px',
  color: '#8a938e',
  fontSize: '13px'
}

const calendarioCard = {
  padding: '26px'
}

const calendarioCabecalho = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '25px',
  marginBottom: '24px'
}

const calendarioTitulo = {
  margin: 0,
  color: '#26332b',
  fontSize: '21px'
}

const calendarioDescricao = {
  marginTop: '7px',
  color: '#7b8580',
  fontSize: '14px'
}

const navegacaoMes = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px'
}

const nomeMesStyle = {
  minWidth: '175px',
  color: '#354139',
  fontSize: '16px',
  textAlign: 'center',
  textTransform: 'capitalize'
}

const botaoNavegacao = {
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  background: 'white',
  color: '#4e5752',
  border:
    '1px solid #d7ddd9',
  borderRadius: '7px',
  fontSize: '22px',
  lineHeight: 1
}

const calendarioGrid = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(7, minmax(0, 1fr))',
  gap: '7px'
}

const diaSemanaStyle = {
  padding: '9px 5px',
  color: '#69736d',
  fontSize: '13px',
  fontWeight: '600',
  textAlign: 'center'
}

const diaVazio = {
  minHeight: '82px'
}

const diaCalendario = {
  minHeight: '82px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: '10px',
  background: '#fafcfb',
  color: '#4e5752',
  border:
    '1px solid #edf0ee',
  borderRadius: '8px',
  textAlign: 'left'
}

const diaHoje = {
  border:
    '1px solid #94bfa2'
}

const diaComRetirada = {
  background: '#f7fbf8',
  border:
    '1px solid #cfe3d7',
  cursor: 'pointer'
}

const numeroDia = {
  fontSize: '14px',
  fontWeight: '600'
}

const marcadorRetirada = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: '#23764e',
  fontSize: '12px',
  fontWeight: '600'
}

const pontoRetirada = {
  width: '7px',
  height: '7px',
  flexShrink: 0,
  background: '#2e7d32',
  borderRadius: '50%'
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

const modalDescricao = {
  marginTop: '7px',
  color: '#7b8580',
  fontSize: '14px'
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
  background: '#f9fbfa',
  border:
    '1px solid #e4e9e6',
  borderRadius: '9px'
}

const produtoRetirada = {
  display: 'block',
  marginBottom: '16px',
  color: '#26332b',
  fontSize: '17px'
}

const detalhesRetirada = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(3, minmax(0, 1fr))',
  gap: '16px'
}

const rotuloDetalhe = {
  display: 'block',
  marginBottom: '5px',
  color: '#7b8580',
  fontSize: '12px'
}

const valorDetalhe = {
  color: '#3f4943',
  fontSize: '14px'
}

const observacaoRetirada = {
  marginTop: '16px',
  paddingTop: '14px',
  borderTop:
    '1px solid #e8ece9',
  color: '#4e5752',
  fontSize: '14px',
  lineHeight: '1.5'
}

const acoesModal = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '22px'
}

export default Painel