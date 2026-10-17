import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([])
  const [solicitacoesProdutos, setSolicitacoesProdutos] = useState([])
  const [listaProdutos, setListaProdutos] = useState([])

  const [mensagem, setMensagem] = useState('')
  const [editando, setEditando] = useState(null)

  const [
    contraofertaSelecionada,
    setContraofertaSelecionada
  ] = useState(null)

  const [
    solicitacaoDetalhe,
    setSolicitacaoDetalhe
  ] = useState(null)

  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroProduto, setFiltroProduto] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('')

  const [
    filtrosAplicados,
    setFiltrosAplicados
  ] = useState({
    tipo: '',
    produto: '',
    status: '',
    periodo: ''
  })

  const [form, setForm] = useState({
    nome_produto: '',
    quantidade: '',
    unidade: '',
    data_disponibilidade: '',
    preco: '',
    observacao_produtor: ''
  })

  const navigate = useNavigate()

  useEffect(() => {
    buscarSolicitacoes()
    buscarSolicitacoesProdutos()
    buscarListaProdutos()
  }, [])

  useEffect(() => {
    if (
      editando ||
      contraofertaSelecionada ||
      solicitacaoDetalhe
    ) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [
    editando,
    contraofertaSelecionada,
    solicitacaoDetalhe
  ])

  const buscarSolicitacoes = async () => {
    try {
      const resposta = await api.get(
        '/solicitacoes/minhas'
      )

      setSolicitacoes(resposta.data)
    } catch (err) {
      console.error(
        'Erro ao buscar solicitações:',
        err
      )

      navigate('/')
    }
  }

  const buscarSolicitacoesProdutos = async () => {
    try {
      const resposta = await api.get(
        '/produtos/solicitacoes/minhas'
      )

      setSolicitacoesProdutos(
        resposta.data
      )
    } catch (err) {
      console.error(
        'Erro ao buscar solicitações de produtos:',
        err
      )
    }
  }

  const buscarListaProdutos = async () => {
    try {
      const resposta = await api.get(
        '/produtos/disponiveis'
      )

      setListaProdutos(resposta.data)
    } catch (err) {
      console.error(
        'Erro ao buscar lista de produtos:',
        err
      )
    }
  }

  const pendentesOfertas = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.status === 'pendente'
  )

  const pendentesInclusao = solicitacoesProdutos
    .filter(
      (solicitacao) =>
        solicitacao.status === 'pendente'
    )
    .map(
      (solicitacao) => ({
        ...solicitacao,
        tipo_solicitacao: 'inclusao'
      })
    )

  const pendentes = [
    ...pendentesOfertas.map(
      (solicitacao) => ({
        ...solicitacao,
        tipo_solicitacao: 'oferta'
      })
    ),
    ...pendentesInclusao
  ]

  const contraofertas = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.status === 'contraoferta'
  )

  const historicoOfertas = solicitacoes
    .filter(
      (solicitacao) =>
        [
          'aprovado',
          'rejeitado',
          'contraoferta_aceita',
          'contraoferta_recusada'
        ].includes(
          solicitacao.status
        )
    )
    .map(
      (solicitacao) => ({
        ...solicitacao,
        tipo_solicitacao: 'oferta',
        chave_lista:
          `oferta-${solicitacao.id}`
      })
    )

  const historicoInclusoes =
    solicitacoesProdutos
      .filter(
        (solicitacao) =>
          [
            'aprovado',
            'rejeitado'
          ].includes(
            solicitacao.status
          )
      )
      .map(
        (solicitacao) => ({
          ...solicitacao,
          tipo_solicitacao: 'inclusao',
          chave_lista:
            `inclusao-${solicitacao.id}`
        })
      )

  const historico = [
    ...historicoOfertas,
    ...historicoInclusoes
  ].sort(
    (a, b) => {
      const dataA = new Date(
        a.data_solicitacao || 0
      ).getTime()

      const dataB = new Date(
        b.data_solicitacao || 0
      ).getTime()

      return dataB - dataA
    }
  )

  const nomeProdutoExibicao = (
    solicitacao
  ) => {
    if (
      solicitacao.tipo_solicitacao ===
      'inclusao'
    ) {
      return (
        solicitacao.nome_produto_aprovado ||
        solicitacao.nome_produto
      )
    }

    return solicitacao.nome_produto
  }

  const quantidadeOfertaExibicao = (
    solicitacao
  ) => {
    if (
      solicitacao.status ===
        'contraoferta_aceita' &&
      solicitacao.quantidade_contraoferta
    ) {
      return (
        solicitacao.quantidade_contraoferta
      )
    }

    return solicitacao.quantidade
  }

  const precoOfertaExibicao = (
    solicitacao
  ) => {
    if (
      solicitacao.status ===
        'contraoferta_aceita' &&
      solicitacao.preco_contraoferta !==
        null &&
      solicitacao.preco_contraoferta !==
        undefined
    ) {
      return (
        solicitacao.preco_contraoferta
      )
    }

    return solicitacao.preco
  }

  const historicoPorTipoSelecionado =
    filtroTipo
      ? historico.filter(
          (solicitacao) =>
            solicitacao.tipo_solicitacao ===
            filtroTipo
        )
      : historico

  const produtosFiltro = [
    ...new Set(
      historicoPorTipoSelecionado
        .map(
          (solicitacao) =>
            nomeProdutoExibicao(
              solicitacao
            )
        )
        .filter(Boolean)
    )
  ].sort(
    (a, b) =>
      a.localeCompare(
        b,
        'pt-BR'
      )
  )

  const handleSubmit = async (e) => {
    e.preventDefault()

    const dados = {
      nome_produto:
        form.nome_produto,

      quantidade:
        `${form.quantidade} ${form.unidade}`,

      data_disponibilidade:
        form.data_disponibilidade,

      preco:
        parseFloat(
          form.preco
        ),

      observacao_produtor:
        form.observacao_produtor
    }

    try {
      await api.put(
        `/solicitacoes/${editando}`,
        dados
      )

      setMensagem(
        'Oferta atualizada com sucesso!'
      )

      cancelarEdicao()
      buscarSolicitacoes()
    } catch (err) {
      console.error(
        'Erro ao atualizar oferta:',
        err
      )

      setMensagem(
        'Erro ao atualizar oferta.'
      )
    }
  }

  const iniciarEdicao = (
    solicitacao
  ) => {
    const partes =
      solicitacao.quantidade.split(
        ' '
      )

    setContraofertaSelecionada(
      null
    )

    setSolicitacaoDetalhe(
      null
    )

    setForm({
      nome_produto:
        solicitacao.nome_produto,

      quantidade:
        partes[0],

      unidade:
        partes.slice(1).join(' '),

      data_disponibilidade:
        solicitacao.data_disponibilidade
          ? solicitacao.data_disponibilidade.split(
              'T'
            )[0]
          : '',

      preco:
        solicitacao.preco,

      observacao_produtor:
        solicitacao.observacao_produtor ||
        ''
    })

    setMensagem('')

    setEditando(
      solicitacao.id
    )
  }

  const cancelarEdicao = () => {
    setEditando(null)

    setForm({
      nome_produto: '',
      quantidade: '',
      unidade: '',
      data_disponibilidade: '',
      preco: '',
      observacao_produtor: ''
    })
  }

  const abrirContraoferta = (
    solicitacao
  ) => {
    setEditando(null)
    setMensagem('')
    setSolicitacaoDetalhe(null)

    setContraofertaSelecionada(
      solicitacao
    )
  }

  const fecharContraoferta = () => {
    setContraofertaSelecionada(
      null
    )
  }

  const abrirDetalhe = (
    solicitacao
  ) => {
    setSolicitacaoDetalhe(
      solicitacao
    )
  }

  const fecharDetalhe = () => {
    setSolicitacaoDetalhe(
      null
    )
  }

  const responderContraoferta =
    async (resposta) => {
      if (
        !contraofertaSelecionada
      ) {
        return
      }

      if (
        resposta === 'recusar'
      ) {
        const confirmar =
          window.confirm(
            'Ao recusar a contraoferta, esta oferta será encerrada. Deseja continuar?'
          )

        if (!confirmar) {
          return
        }
      }

      try {
        await api.patch(
          `/solicitacoes/${contraofertaSelecionada.id}/contraoferta/responder`,
          {
            resposta
          }
        )

        if (
          resposta === 'aceitar'
        ) {
          setMensagem(
            'Contraoferta aceita com sucesso!'
          )
        } else {
          setMensagem(
            'Contraoferta recusada. A oferta foi encerrada.'
          )
        }

        setContraofertaSelecionada(
          null
        )

        buscarSolicitacoes()
      } catch (err) {
        console.error(
          'Erro ao responder contraoferta:',
          err
        )

        setMensagem(
          err.response?.data?.mensagem ||
          'Erro ao responder contraoferta.'
        )
      }
    }

  const excluir = async (id) => {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir esta solicitação?'
      )
    ) {
      return
    }

    try {
      await api.delete(
        `/solicitacoes/${id}`
      )

      setMensagem(
        'Solicitação excluída com sucesso!'
      )

      setSolicitacaoDetalhe(
        null
      )

      buscarSolicitacoes()
    } catch (err) {
      alert(
        'Erro ao excluir. A solicitação pode já ter sido avaliada.'
      )
    }
  }

  const formatarData = (data) => {
    if (!data) {
      return '-'
    }

    const somenteData =
      data.split('T')[0]

    const [ano, mes, dia] =
      somenteData.split('-')

    return `${dia}/${mes}/${ano}`
  }

  const criarDataLocal = (data) => {
    if (!data) {
      return null
    }

    const somenteData =
      data.split('T')[0]

    const [ano, mes, dia] =
      somenteData
        .split('-')
        .map(Number)

    return new Date(
      ano,
      mes - 1,
      dia
    )
  }

  const formatarPreco = (preco) => {
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

  const formatarStatusOferta = (
    status
  ) => {
    if (
      status === 'pendente'
    ) {
      return 'Pendente'
    }

    if (
      status === 'aprovado'
    ) {
      return 'Aprovada'
    }

    if (
      status === 'rejeitado'
    ) {
      return 'Rejeitada'
    }

    if (
      status === 'contraoferta'
    ) {
      return 'Contraoferta recebida'
    }

    if (
      status ===
      'contraoferta_aceita'
    ) {
      return 'Contraoferta aceita'
    }

    if (
      status ===
      'contraoferta_recusada'
    ) {
      return 'Contraoferta recusada'
    }

    return status
  }

  const formatarStatusProduto = (
    status
  ) => {
    if (
      status === 'aprovado'
    ) {
      return 'Aprovada'
    }

    if (
      status === 'rejeitado'
    ) {
      return 'Rejeitada'
    }

    return 'Pendente'
  }

  const formatarStatusSolicitacao = (
    solicitacao
  ) => {
    if (
      solicitacao.tipo_solicitacao ===
      'inclusao'
    ) {
      return formatarStatusProduto(
        solicitacao.status
      )
    }

    return formatarStatusOferta(
      solicitacao.status
    )
  }

  const classeStatus = (
    status
  ) => {
    if (
      status === 'aprovado' ||
      status ===
        'contraoferta_aceita'
    ) {
      return 'status-aprovado'
    }

    if (
      status === 'rejeitado' ||
      status ===
        'contraoferta_recusada'
    ) {
      return 'status-rejeitado'
    }

    return 'status-pendente'
  }

  const formatarTipo = (
    tipo
  ) => {
    if (
      tipo === 'inclusao'
    ) {
      return 'Inclusão de produto'
    }

    return 'Oferta'
  }

  const estaNoPeriodo = (
    data,
    periodo
  ) => {
    if (!periodo) {
      return true
    }

    const dataSolicitacao =
      criarDataLocal(data)

    if (!dataSolicitacao) {
      return false
    }

    const hoje = new Date()

    hoje.setHours(
      23,
      59,
      59,
      999
    )

    if (
      periodo ===
      'esta_semana'
    ) {
      const inicioSemana =
        new Date(hoje)

      const diaSemana =
        inicioSemana.getDay()

      const diferenca =
        diaSemana === 0
          ? 6
          : diaSemana - 1

      inicioSemana.setDate(
        inicioSemana.getDate() -
          diferenca
      )

      inicioSemana.setHours(
        0,
        0,
        0,
        0
      )

      return (
        dataSolicitacao >=
          inicioSemana &&
        dataSolicitacao <= hoje
      )
    }

    if (
      periodo ===
      'este_mes'
    ) {
      const inicioMes =
        new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          1
        )

      return (
        dataSolicitacao >=
          inicioMes &&
        dataSolicitacao <= hoje
      )
    }

    if (
      periodo ===
      'mes_passado'
    ) {
      const inicioMesAtual =
        new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          1
        )

      const inicioMesPassado =
        new Date(
          hoje.getFullYear(),
          hoje.getMonth() - 1,
          1
        )

      return (
        dataSolicitacao >=
          inicioMesPassado &&
        dataSolicitacao <
          inicioMesAtual
      )
    }

    if (
      periodo ===
      'ultimos_3_meses'
    ) {
      const inicio =
        new Date(hoje)

      inicio.setMonth(
        inicio.getMonth() - 3
      )

      inicio.setHours(
        0,
        0,
        0,
        0
      )

      return (
        dataSolicitacao >=
          inicio &&
        dataSolicitacao <= hoje
      )
    }

    if (
      periodo ===
      'ultimos_6_meses'
    ) {
      const inicio =
        new Date(hoje)

      inicio.setMonth(
        inicio.getMonth() - 6
      )

      inicio.setHours(
        0,
        0,
        0,
        0
      )

      return (
        dataSolicitacao >=
          inicio &&
        dataSolicitacao <= hoje
      )
    }

    return true
  }

  const historicoFiltrado =
    historico.filter(
      (solicitacao) => {
        const correspondeTipo =
          filtrosAplicados.tipo === '' ||
          solicitacao.tipo_solicitacao ===
            filtrosAplicados.tipo

        const correspondeProduto =
          filtrosAplicados.produto === '' ||
          nomeProdutoExibicao(
            solicitacao
          ) ===
            filtrosAplicados.produto

        const correspondeStatus =
          filtrosAplicados.status === '' ||
          solicitacao.status ===
            filtrosAplicados.status

        const correspondePeriodo =
          estaNoPeriodo(
            solicitacao.data_solicitacao,
            filtrosAplicados.periodo
          )

        return (
          correspondeTipo &&
          correspondeProduto &&
          correspondeStatus &&
          correspondePeriodo
        )
      }
    )

  const alterarFiltroTipo = (
    tipo
  ) => {
    setFiltroTipo(tipo)
    setFiltroProduto('')
    setFiltroStatus('')
  }

  const pesquisar = () => {
    setFiltrosAplicados({
      tipo: filtroTipo,
      produto: filtroProduto,
      status: filtroStatus,
      periodo: filtroPeriodo
    })
  }

  const limparFiltros = () => {
    setFiltroTipo('')
    setFiltroProduto('')
    setFiltroStatus('')
    setFiltroPeriodo('')

    setFiltrosAplicados({
      tipo: '',
      produto: '',
      status: '',
      periodo: ''
    })
  }

  const possuiFiltros =
    filtroTipo ||
    filtroProduto ||
    filtroStatus ||
    filtroPeriodo ||
    filtrosAplicados.tipo ||
    filtrosAplicados.produto ||
    filtrosAplicados.status ||
    filtrosAplicados.periodo

  const handleTecladoItem = (
    e,
    solicitacao
  ) => {
    if (
      e.key === 'Enter' ||
      e.key === ' '
    ) {
      e.preventDefault()

      abrirDetalhe(
        solicitacao
      )
    }
  }

  return (
    <LayoutSistema
      titulo="Minhas Solicitações"
      subtitulo="Acompanhe suas ofertas e o histórico das avaliações."
      paginaAtiva="solicitacoes"
    >
      <style>
        {`
          .solicitacoes-grade-andamento {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 22px;
            margin-bottom: 32px;
          }

          .historico-filtros {
            display: grid;
            grid-template-columns:
              repeat(4, minmax(0, 1fr));
            gap: 13px;
            align-items: end;
          }

          .historico-botoes-filtro {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 10px;
            margin-top: 14px;
          }

          .historico-item {
            display: grid;
            grid-template-columns:
              minmax(220px, 1.35fr)
              minmax(145px, 0.75fr)
              minmax(115px, 0.65fr)
              minmax(105px, 0.65fr)
              minmax(145px, 0.8fr)
              minmax(100px, auto);
            align-items: center;
            gap: 18px;
            min-height: 82px;
            padding: 14px 20px;
            background: #ffffff;
            border-bottom: 1px solid #e6ebe7;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }

          .historico-item:hover {
            background: #f8fbf8;
          }

          .historico-item:last-child {
            border-bottom: none;
          }

          .historico-item:focus-visible {
            outline: 2px solid #1b5e20;
            outline-offset: -2px;
          }

          .historico-status {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 0;
          }

          .historico-inclusao-data {
            grid-column: 3;
          }

          @media (max-width: 1150px) {
            .historico-item {
              grid-template-columns:
                minmax(200px, 1.2fr)
                minmax(135px, 0.7fr)
                minmax(105px, 0.6fr)
                minmax(100px, 0.6fr)
                minmax(135px, 0.75fr)
                auto;
              gap: 13px;
            }
          }

          @media (max-width: 950px) {
            .historico-filtros {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }

            .historico-item {
              grid-template-columns:
                minmax(190px, 1fr)
                minmax(135px, 0.7fr)
                minmax(115px, 0.6fr)
                auto;
            }

            .historico-valor {
              grid-column: 3;
            }

            .historico-disponibilidade {
              grid-column: 3;
            }

            .historico-inclusao-data {
              grid-column: 3;
            }
          }

          @media (max-width: 800px) {
            .solicitacoes-grade-andamento {
              grid-template-columns: 1fr;
            }

            .historico-item {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .historico-status {
              justify-content: flex-start;
            }

            .historico-valor,
            .historico-disponibilidade,
            .historico-inclusao-data {
              grid-column: auto;
            }

            .historico-informacao {
              align-items: flex-start !important;
              text-align: left !important;
            }

            .historico-ver-detalhes {
              justify-content: flex-start !important;
            }
          }

          @media (max-width: 650px) {
            .historico-filtros {
              grid-template-columns: 1fr;
            }

            .historico-botoes-filtro {
              flex-direction: column-reverse;
            }

            .historico-botoes-filtro button {
              width: 100%;
            }
          }
        `}
      </style>

      <section className="dashboard-content">

        {mensagem && (
          <p
            className={`mensagem-pagina ${
              mensagem.includes('Erro')
                ? 'erro'
                : 'sucesso'
            }`}
          >
            {mensagem}
          </p>
        )}

        {/* Detalhes */}
        {solicitacaoDetalhe && (
          <div
            style={modalOverlay}
            onClick={
              fecharDetalhe
            }
          >
            <div
              style={modalConteudoDetalhe}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div style={cabecalhoDetalhe}>

                <div>
                  <span style={tipoDetalhe}>
                    {formatarTipo(
                      solicitacaoDetalhe.tipo_solicitacao
                    )}
                  </span>

                  <h3 style={modalTituloDetalhe}>
                    {nomeProdutoExibicao(
                      solicitacaoDetalhe
                    )}
                  </h3>
                </div>

                <span
                  className={`status-badge ${classeStatus(
                    solicitacaoDetalhe.status
                  )}`}
                >
                  {formatarStatusSolicitacao(
                    solicitacaoDetalhe
                  )}
                </span>

              </div>

              {solicitacaoDetalhe.tipo_solicitacao ===
              'oferta' ? (
                <div style={gradeDetalhes}>

                  <div style={blocoDetalhe}>
                    <span style={rotuloDetalhe}>
                      Produto
                    </span>

                    <strong style={valorDetalhe}>
                      {
                        solicitacaoDetalhe.nome_produto
                      }
                    </strong>
                  </div>

                  <div style={blocoDetalhe}>
                    <span style={rotuloDetalhe}>
                      Quantidade
                    </span>

                    <strong style={valorDetalhe}>
                      {quantidadeOfertaExibicao(
                        solicitacaoDetalhe
                      )}
                    </strong>
                  </div>

                  <div style={blocoDetalhe}>
                    <span style={rotuloDetalhe}>
                      Valor
                    </span>

                    <strong style={valorDetalhe}>
                      {formatarPreco(
                        precoOfertaExibicao(
                          solicitacaoDetalhe
                        )
                      )}
                    </strong>
                  </div>

                  <div style={blocoDetalhe}>
                    <span style={rotuloDetalhe}>
                      Disponibilidade
                    </span>

                    <strong style={valorDetalhe}>
                      {formatarData(
                        solicitacaoDetalhe.data_disponibilidade
                      )}
                    </strong>
                  </div>

                  <div style={blocoDetalhe}>
                    <span style={rotuloDetalhe}>
                      Data da solicitação
                    </span>

                    <strong style={valorDetalhe}>
                      {formatarData(
                        solicitacaoDetalhe.data_solicitacao
                      )}
                    </strong>
                  </div>

                  <div style={blocoDetalhe}>
                    <span style={rotuloDetalhe}>
                      Status
                    </span>

                    <strong style={valorDetalhe}>
                      {formatarStatusOferta(
                        solicitacaoDetalhe.status
                      )}
                    </strong>
                  </div>

                  <div style={blocoDetalheGrande}>
                    <span style={rotuloDetalhe}>
                      Observação
                    </span>

                    <p style={textoDetalhe}>
                      {
                        solicitacaoDetalhe.observacao_produtor ||
                        'Nenhuma observação informada.'
                      }
                    </p>
                  </div>

                  <div style={blocoDetalheGrande}>
                    <span style={rotuloDetalhe}>
                      Retorno da APOMS
                    </span>

                    <p style={textoDetalhe}>
                      {
                        solicitacaoDetalhe.observacao ||
                        'Nenhum retorno informado.'
                      }
                    </p>
                  </div>

                  {(solicitacaoDetalhe.quantidade_contraoferta ||
                    solicitacaoDetalhe.preco_contraoferta) && (
                    <div style={contraofertaDetalhe}>

                      <h4 style={tituloContraofertaDetalhe}>
                        Contraoferta da APOMS
                      </h4>

                      <div style={gradeContraofertaDetalhe}>

                        <div>
                          <span style={rotuloDetalhe}>
                            Quantidade proposta
                          </span>

                          <strong style={valorDetalhe}>
                            {
                              solicitacaoDetalhe.quantidade_contraoferta ||
                              '-'
                            }
                          </strong>
                        </div>

                        <div>
                          <span style={rotuloDetalhe}>
                            Valor proposto
                          </span>

                          <strong style={valorDetalhe}>
                            {formatarPreco(
                              solicitacaoDetalhe.preco_contraoferta
                            )}
                          </strong>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              ) : (
                <div style={gradeDetalhes}>

                  <div style={blocoDetalhe}>
                    <span style={rotuloDetalhe}>
                      Produto
                    </span>

                    <strong style={valorDetalhe}>
                      {nomeProdutoExibicao(
                        solicitacaoDetalhe
                      )}
                    </strong>
                  </div>

                  <div style={blocoDetalhe}>
                    <span style={rotuloDetalhe}>
                      Data da solicitação
                    </span>

                    <strong style={valorDetalhe}>
                      {formatarData(
                        solicitacaoDetalhe.data_solicitacao
                      )}
                    </strong>
                  </div>

                  <div style={blocoDetalhe}>
                    <span style={rotuloDetalhe}>
                      Data da avaliação
                    </span>

                    <strong style={valorDetalhe}>
                      {formatarData(
                        solicitacaoDetalhe.data_avaliacao
                      )}
                    </strong>
                  </div>

                  <div style={blocoDetalhe}>
                    <span style={rotuloDetalhe}>
                      Status
                    </span>

                    <strong style={valorDetalhe}>
                      {formatarStatusProduto(
                        solicitacaoDetalhe.status
                      )}
                    </strong>
                  </div>

                  <div style={blocoDetalheGrande}>
                    <span style={rotuloDetalhe}>
                      Observação
                    </span>

                    <p style={textoDetalhe}>
                      {
                        solicitacaoDetalhe.observacao_produtor ||
                        'Nenhuma observação informada.'
                      }
                    </p>
                  </div>

                  <div style={blocoDetalheGrande}>
                    <span style={rotuloDetalhe}>
                      Retorno da APOMS
                    </span>

                    <p style={textoDetalhe}>
                      {
                        solicitacaoDetalhe.retorno_admin ||
                        'Nenhum retorno informado.'
                      }
                    </p>
                  </div>

                </div>
              )}

              <div style={acoesDetalhe}>

                <button
                  className="btn-principal"
                  type="button"
                  onClick={
                    fecharDetalhe
                  }
                >
                  Fechar
                </button>

              </div>

            </div>
          </div>
        )}

        {/* Contraoferta */}
        {contraofertaSelecionada && (
          <div
            style={modalOverlay}
            onClick={
              fecharContraoferta
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
                    Contraoferta recebida
                  </h3>

                  <p style={modalDescricao}>
                    Analise a proposta enviada pela APOMS antes de responder.
                  </p>
                </div>

                <button
                  type="button"
                  style={botaoFecharModal}
                  onClick={
                    fecharContraoferta
                  }
                >
                  ×
                </button>

              </div>

              <div className="cadastro-produto-form">

                <div className="campo">
                  <label>
                    Produto
                  </label>

                  <div style={campoInformacao}>
                    {
                      contraofertaSelecionada.nome_produto
                    }
                  </div>
                </div>

                <div className="campo">
                  <label>
                    Quantidade original
                  </label>

                  <div style={campoInformacao}>
                    {
                      contraofertaSelecionada.quantidade
                    }
                  </div>
                </div>

                <div className="campo">
                  <label>
                    Quantidade proposta
                  </label>

                  <div style={campoDestaque}>
                    {
                      contraofertaSelecionada.quantidade_contraoferta
                    }
                  </div>
                </div>

                <div className="campo">
                  <label>
                    Preço original
                  </label>

                  <div style={campoInformacao}>
                    {formatarPreco(
                      contraofertaSelecionada.preco
                    )}
                  </div>
                </div>

                <div className="campo">
                  <label>
                    Preço proposto
                  </label>

                  <div style={campoDestaque}>
                    {formatarPreco(
                      contraofertaSelecionada.preco_contraoferta
                    )}
                  </div>
                </div>

                <div className="campo campo-grande">
                  <label>
                    Comentário da APOMS
                  </label>

                  <div style={campoInformacao}>
                    {
                      contraofertaSelecionada.observacao
                    }
                  </div>
                </div>

              </div>

              <div
                className="acoes-form"
                style={{
                  marginTop: '22px'
                }}
              >

                <button
                  className="btn-voltar"
                  type="button"
                  onClick={
                    fecharContraoferta
                  }
                >
                  Fechar
                </button>

                <button
                  className="btn-excluir"
                  type="button"
                  onClick={() =>
                    responderContraoferta(
                      'recusar'
                    )
                  }
                >
                  Recusar contraoferta
                </button>

                <button
                  className="btn-principal"
                  type="button"
                  onClick={() =>
                    responderContraoferta(
                      'aceitar'
                    )
                  }
                >
                  Aceitar contraoferta
                </button>

              </div>

            </div>

          </div>
        )}

        {/* Editar oferta */}
        {editando && (
          <div
            style={modalOverlay}
            onClick={
              cancelarEdicao
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
                    Editar oferta
                  </h3>

                  <p style={modalDescricao}>
                    Altere os dados enquanto a oferta ainda estiver pendente.
                  </p>
                </div>

                <button
                  type="button"
                  style={botaoFecharModal}
                  onClick={
                    cancelarEdicao
                  }
                >
                  ×
                </button>

              </div>

              <form
                className="cadastro-produto-form"
                onSubmit={
                  handleSubmit
                }
              >

                <div className="campo campo-grande">
                  <label>
                    Produto
                  </label>

                  <select
                    value={
                      form.nome_produto
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nome_produto:
                          e.target.value
                      })
                    }
                    required
                  >
                    <option value="">
                      Selecione o produto
                    </option>

                    {listaProdutos.map(
                      (produto) => (
                        <option
                          key={
                            produto.id
                          }
                          value={
                            produto.nome
                          }
                        >
                          {
                            produto.nome
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="campo">
                  <label>
                    Quantidade
                  </label>

                  <input
                    type="number"
                    value={
                      form.quantidade
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantidade:
                          e.target.value
                      })
                    }
                    min="1"
                    required
                  />
                </div>

                <div className="campo">
                  <label>
                    Unidade de medida
                  </label>

                  <select
                    value={
                      form.unidade
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        unidade:
                          e.target.value
                      })
                    }
                    required
                  >
                    <option value="">
                      Selecione a unidade
                    </option>

                    <option value="kg">
                      kg
                    </option>

                    <option value="unidade">
                      unidade
                    </option>

                    <option value="maço">
                      maço
                    </option>

                    <option value="caixa">
                      caixa
                    </option>

                    <option value="bandeja">
                      bandeja
                    </option>

                    <option value="litro">
                      litro
                    </option>

                    <option value="dúzia">
                      dúzia
                    </option>
                  </select>
                </div>

                <div className="campo">
                  <label>
                    Disponibilidade
                  </label>

                  <input
                    type="date"
                    value={
                      form.data_disponibilidade
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        data_disponibilidade:
                          e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="campo">
                  <label>
                    Preço (R$)
                  </label>

                  <input
                    type="number"
                    value={
                      form.preco
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        preco:
                          e.target.value
                      })
                    }
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>

                <div className="campo campo-grande">
                  <label>
                    Observação
                  </label>

                  <textarea
                    value={
                      form.observacao_produtor
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        observacao_produtor:
                          e.target.value
                      })
                    }
                    rows="4"
                    style={textareaStyle}
                  />
                </div>

                <div className="acoes-form campo-grande">

                  <button
                    className="btn-voltar"
                    type="button"
                    onClick={
                      cancelarEdicao
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    className="btn-principal"
                    type="submit"
                  >
                    Salvar alterações
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* Pendentes e contraofertas */}
        <div className="solicitacoes-grade-andamento">

          <div
            className="table-card"
            style={cardAndamento}
          >

            <div style={cabecalhoColuna}>

              <h2 style={tituloColuna}>
                Pendentes
              </h2>

              <p style={descricaoColuna}>
                Aguardando avaliação da APOMS.
              </p>

            </div>

            {pendentes.length === 0 ? (
              <div style={estadoColuna}>
                Nenhuma solicitação pendente.
              </div>
            ) : (
              pendentes.map(
                (solicitacao) => (
                  <div
                    key={`${solicitacao.tipo_solicitacao}-${solicitacao.id}`}
                    style={itemColuna}
                  >

                    <span style={tipoPendente}>
                      {formatarTipo(
                        solicitacao.tipo_solicitacao
                      )}
                    </span>

                    <strong style={nomeOferta}>
                      {nomeProdutoExibicao(
                        solicitacao
                      )}
                    </strong>

                    {solicitacao.tipo_solicitacao ===
                    'oferta' ? (
                      <>
                        <span style={detalheOferta}>
                          {
                            solicitacao.quantidade
                          }
                          {' • '}
                          {formatarPreco(
                            solicitacao.preco
                          )}
                        </span>

                        <div
                          className="acoes-tabela"
                          style={{
                            marginTop: '14px'
                          }}
                        >

                          <button
                            className="btn-editar"
                            type="button"
                            onClick={() =>
                              iniciarEdicao(
                                solicitacao
                              )
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn-excluir"
                            type="button"
                            onClick={() =>
                              excluir(
                                solicitacao.id
                              )
                            }
                          >
                            Excluir
                          </button>

                        </div>
                      </>
                    ) : (
                      <span style={detalheOferta}>
                        Aguardando avaliação da APOMS.
                      </span>
                    )}

                  </div>
                )
              )
            )}

          </div>

          <div
            className="table-card"
            style={cardAndamento}
          >

            <div style={cabecalhoColuna}>

              <h2 style={tituloColuna}>
                Contraofertas
              </h2>

              <p style={descricaoColuna}>
                Aguardando sua avaliação.
              </p>

            </div>

            {contraofertas.length ===
            0 ? (
              <div style={estadoColuna}>
                Nenhuma contraoferta aguardando resposta.
              </div>
            ) : (
              contraofertas.map(
                (solicitacao) => (
                  <div
                    key={
                      solicitacao.id
                    }
                    style={itemColuna}
                  >

                    <strong style={nomeOferta}>
                      {
                        solicitacao.nome_produto
                      }
                    </strong>

                    <span style={detalheOferta}>
                      Proposta:{' '}
                      {
                        solicitacao.quantidade_contraoferta
                      }
                      {' • '}
                      {formatarPreco(
                        solicitacao.preco_contraoferta
                      )}
                    </span>

                    <button
                      className="btn-secundario"
                      type="button"
                      style={{
                        marginTop: '14px'
                      }}
                      onClick={() =>
                        abrirContraoferta(
                          solicitacao
                        )
                      }
                    >
                      Avaliar contraoferta
                    </button>

                  </div>
                )
              )
            )}

          </div>

        </div>

        {/* Histórico */}
        <div className="table-card">

          <div style={cabecalhoHistorico}>

            <h2 style={tituloHistorico}>
              Histórico de solicitações
            </h2>

            <p style={descricaoHistorico}>
              Consulte as solicitações que já foram finalizadas.
            </p>

          </div>

          <div style={areaFiltros}>

            <div className="historico-filtros">

              <div>
                <label style={labelFiltro}>
                  Tipo
                </label>

                <select
                  value={filtroTipo}
                  onChange={(e) =>
                    alterarFiltroTipo(
                      e.target.value
                    )
                  }
                  style={campoFiltro}
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="oferta">
                    Oferta
                  </option>

                  <option value="inclusao">
                    Inclusão de produto
                  </option>
                </select>
              </div>

              <div>
                <label style={labelFiltro}>
                  Produto
                </label>

                <select
                  value={filtroProduto}
                  onChange={(e) =>
                    setFiltroProduto(
                      e.target.value
                    )
                  }
                  style={campoFiltro}
                >
                  <option value="">
                    Todos
                  </option>

                  {produtosFiltro.map(
                    (produto) => (
                      <option
                        key={produto}
                        value={produto}
                      >
                        {produto}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label style={labelFiltro}>
                  Status
                </label>

                <select
                  value={filtroStatus}
                  onChange={(e) =>
                    setFiltroStatus(
                      e.target.value
                    )
                  }
                  style={campoFiltro}
                >
                  <option value="">
                    Todos
                  </option>

                  <option value="aprovado">
                    Aprovada
                  </option>

                  <option value="rejeitado">
                    Rejeitada
                  </option>

                  {filtroTipo !==
                    'inclusao' && (
                    <>
                      <option value="contraoferta_aceita">
                        Contraoferta aceita
                      </option>

                      <option value="contraoferta_recusada">
                        Contraoferta recusada
                      </option>
                    </>
                  )}

                </select>
              </div>

              <div>
                <label style={labelFiltro}>
                  Período
                </label>

                <select
                  value={filtroPeriodo}
                  onChange={(e) =>
                    setFiltroPeriodo(
                      e.target.value
                    )
                  }
                  style={campoFiltro}
                >
                  <option value="">
                    Todo o período
                  </option>

                  <option value="esta_semana">
                    Esta semana
                  </option>

                  <option value="este_mes">
                    Este mês
                  </option>

                  <option value="mes_passado">
                    Mês passado
                  </option>

                  <option value="ultimos_3_meses">
                    Últimos 3 meses
                  </option>

                  <option value="ultimos_6_meses">
                    Últimos 6 meses
                  </option>
                </select>
              </div>

            </div>

            <div className="historico-botoes-filtro">

              {possuiFiltros && (
                <button
                  type="button"
                  style={botaoLimpar}
                  onClick={
                    limparFiltros
                  }
                >
                  Limpar filtros
                </button>
              )}

              <button
                type="button"
                style={botaoPesquisar}
                onClick={
                  pesquisar
                }
              >
                Pesquisar
              </button>

            </div>

          </div>

          {historico.length === 0 ? (
            <div style={estadoLista}>
              Nenhuma solicitação finalizada até o momento.
            </div>
          ) : historicoFiltrado.length ===
            0 ? (
            <div style={estadoLista}>
              Nenhuma solicitação encontrada com os filtros selecionados.
            </div>
          ) : (
            <div>

              {historicoFiltrado.map(
                (solicitacao) => (
                  <div
                    key={
                      solicitacao.chave_lista
                    }
                    className="historico-item"
                    role="button"
                    tabIndex="0"
                    onClick={() =>
                      abrirDetalhe(
                        solicitacao
                      )
                    }
                    onKeyDown={(e) =>
                      handleTecladoItem(
                        e,
                        solicitacao
                      )
                    }
                  >

                    <div style={identificacaoLista}>

                      <div style={tipoLista}>

                        <span
                          style={
                            solicitacao.tipo_solicitacao ===
                            'inclusao'
                              ? badgeInclusao
                              : badgeOferta
                          }
                        >
                          {formatarTipo(
                            solicitacao.tipo_solicitacao
                          )}
                        </span>

                      </div>

                      <strong style={produtoLista}>
                        {nomeProdutoExibicao(
                          solicitacao
                        )}
                      </strong>

                    </div>

                    <div className="historico-status">

                      <span
                        className={`status-badge ${classeStatus(
                          solicitacao.status
                        )}`}
                      >
                        {formatarStatusSolicitacao(
                          solicitacao
                        )}
                      </span>

                    </div>

                    {solicitacao.tipo_solicitacao ===
                    'oferta' ? (
                      <>
                        <div
                          className="historico-informacao"
                          style={informacaoLista}
                        >

                          <span style={rotuloLista}>
                            Quantidade
                          </span>

                          <strong style={valorLista}>
                            {quantidadeOfertaExibicao(
                              solicitacao
                            )}
                          </strong>

                        </div>

                        <div
                          className="historico-informacao historico-valor"
                          style={informacaoLista}
                        >

                          <span style={rotuloLista}>
                            Valor
                          </span>

                          <strong style={valorLista}>
                            {formatarPreco(
                              precoOfertaExibicao(
                                solicitacao
                              )
                            )}
                          </strong>

                        </div>

                        <div
                          className="historico-informacao historico-disponibilidade"
                          style={informacaoLista}
                        >

                          <span style={rotuloLista}>
                            Disponibilidade
                          </span>

                          <strong style={valorLista}>
                            {formatarData(
                              solicitacao.data_disponibilidade
                            )}
                          </strong>

                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="historico-informacao historico-inclusao-data"
                          style={informacaoLista}
                        >

                          <span style={rotuloLista}>
                            Data da avaliação
                          </span>

                          <strong style={valorLista}>
                            {formatarData(
                              solicitacao.data_avaliacao
                            )}
                          </strong>

                        </div>

                        <div />

                        <div />
                      </>
                    )}

                    <div
                      className="historico-ver-detalhes"
                      style={verDetalhesLista}
                    >

                      <span>
                        Ver detalhes
                      </span>

                      <span style={setaDetalhe}>
                        ›
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </section>
    </LayoutSistema>
  )
}

const cardAndamento = {
  background: '#eef5ef',
  borderColor: '#c9ddcb'
}

const cabecalhoColuna = {
  minHeight: '82px',
  padding: '18px 20px',
  borderBottom:
    '1px solid #d8e5d9'
}

const tituloColuna = {
  margin: 0,
  color: '#25682b',
  fontSize: '17px'
}

const descricaoColuna = {
  marginTop: '5px',
  color: '#637766',
  fontSize: '12px'
}

const itemColuna = {
  padding: '18px 20px',
  borderBottom:
    '1px solid #dce7dd'
}

const tipoPendente = {
  display: 'inline-block',
  marginBottom: '7px',
  color: '#647168',
  fontSize: '11px',
  fontWeight: '600'
}

const nomeOferta = {
  display: 'block',
  marginBottom: '7px',
  color: '#26332b',
  fontSize: '14px'
}

const detalheOferta = {
  display: 'block',
  marginTop: '3px',
  color: '#637766',
  fontSize: '12px',
  lineHeight: '1.45'
}

const estadoColuna = {
  minHeight: '130px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '25px',
  color: '#718075',
  fontSize: '13px',
  textAlign: 'center'
}

const cabecalhoHistorico = {
  padding: '18px 20px',
  background: '#f8fbf8',
  borderBottom:
    '1px solid #e2e9e3'
}

const tituloHistorico = {
  margin: 0,
  color: '#26332b',
  fontSize: '18px'
}

const descricaoHistorico = {
  marginTop: '5px',
  color: '#7b8580',
  fontSize: '12px'
}

const areaFiltros = {
  padding: '16px 20px',
  background: '#ffffff',
  borderBottom:
    '1px solid #e6ebe7'
}

const labelFiltro = {
  display: 'block',
  marginBottom: '6px',
  color: '#5e6961',
  fontSize: '12px',
  fontWeight: '600'
}

const campoFiltro = {
  width: '100%',
  minHeight: '40px',
  padding: '8px 11px',
  background: '#ffffff',
  color: '#39443d',
  border:
    '1px solid #d5ded6',
  borderRadius: '7px',
  fontSize: '13px'
}

const botaoPesquisar = {
  minWidth: '105px',
  minHeight: '40px',
  padding: '8px 16px',
  background: '#1b5e20',
  color: '#ffffff',
  border: 'none',
  borderRadius: '7px',
  fontSize: '12px',
  fontWeight: '600',
  cursor: 'pointer'
}

const botaoLimpar = {
  minHeight: '40px',
  padding: '8px 13px',
  background: '#ffffff',
  color: '#4f6252',
  border:
    '1px solid #cbd6cc',
  borderRadius: '7px',
  fontSize: '12px',
  fontWeight: '600',
  whiteSpace: 'nowrap',
  cursor: 'pointer'
}

const identificacaoLista = {
  minWidth: 0
}

const tipoLista = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '7px'
}

const badgeOferta = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '25px',
  padding: '4px 9px',
  background: '#edf5ef',
  color: '#296b31',
  border:
    '1px solid #c9ddcb',
  borderRadius: '20px',
  fontSize: '11px',
  fontWeight: '600'
}

const badgeInclusao = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '25px',
  padding: '4px 9px',
  background: '#f1f3f2',
  color: '#59645d',
  border:
    '1px solid #d8ded9',
  borderRadius: '20px',
  fontSize: '11px',
  fontWeight: '600'
}

const produtoLista = {
  display: 'block',
  color: '#26332b',
  fontSize: '15px'
}

const informacaoLista = {
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center'
}

const rotuloLista = {
  display: 'block',
  marginBottom: '4px',
  color: '#8a938e',
  fontSize: '10px',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.3px'
}

const valorLista = {
  color: '#465249',
  fontSize: '13px',
  fontWeight: '600'
}

const verDetalhesLista = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  color: '#466c4b',
  fontSize: '12px',
  fontWeight: '600',
  whiteSpace: 'nowrap'
}

const setaDetalhe = {
  fontSize: '22px',
  lineHeight: 1
}

const estadoLista = {
  minHeight: '150px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '30px',
  color: '#8a938e',
  fontSize: '13px',
  textAlign: 'center'
}

const campoInformacao = {
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  background: '#f7f9f8',
  color: '#4e5752',
  border:
    '1px solid #e1e6e3',
  borderRadius: '6px',
  fontSize: '14px'
}

const campoDestaque = {
  ...campoInformacao,
  background: '#fff8e8',
  color: '#8a5a00',
  border:
    '1px solid #eed8a6',
  fontWeight: '600'
}

const textareaStyle = {
  width: '100%',
  padding: '12px',
  border:
    '1px solid #d7ddd9',
  borderRadius: '6px',
  fontSize: '1rem',
  resize: 'vertical',
  backgroundColor:
    'transparent',
  color: 'inherit'
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
  maxWidth: '850px',
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

const modalConteudoDetalhe = {
  ...modalConteudo,
  maxWidth: '760px'
}

const modalCabecalho = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent:
    'space-between',
  gap: '20px',
  marginBottom: '24px'
}

const cabecalhoDetalhe = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent:
    'space-between',
  gap: '20px',
  marginBottom: '22px'
}

const modalTitulo = {
  margin: 0,
  color: '#26332b',
  fontSize: '20px'
}

const modalTituloDetalhe = {
  margin: '6px 0 0',
  color: '#26332b',
  fontSize: '21px'
}

const modalDescricao = {
  marginTop: '6px',
  color: '#7b8580',
  fontSize: '13px'
}

const tipoDetalhe = {
  color: '#617168',
  fontSize: '12px',
  fontWeight: '600'
}

const gradeDetalhes = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(2, minmax(0, 1fr))',
  gap: '13px'
}

const blocoDetalhe = {
  padding: '13px 14px',
  background: '#f8faf8',
  border:
    '1px solid #e3e9e4',
  borderRadius: '8px'
}

const blocoDetalheGrande = {
  ...blocoDetalhe,
  gridColumn: '1 / -1'
}

const rotuloDetalhe = {
  display: 'block',
  marginBottom: '5px',
  color: '#7a867d',
  fontSize: '11px',
  fontWeight: '600'
}

const valorDetalhe = {
  color: '#36433a',
  fontSize: '14px'
}

const textoDetalhe = {
  margin: 0,
  color: '#4d5b51',
  fontSize: '13px',
  lineHeight: '1.5'
}

const contraofertaDetalhe = {
  gridColumn: '1 / -1',
  padding: '15px',
  background: '#faf9f4',
  border:
    '1px solid #e8e2ce',
  borderRadius: '8px'
}

const tituloContraofertaDetalhe = {
  margin: '0 0 13px',
  color: '#4c514d',
  fontSize: '14px'
}

const gradeContraofertaDetalhe = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(2, minmax(0, 1fr))',
  gap: '15px'
}

const acoesDetalhe = {
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '22px',
  paddingTop: '18px',
  borderTop:
    '1px solid #e6ebe7'
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
  fontSize: '22px'
}

export default Solicitacoes