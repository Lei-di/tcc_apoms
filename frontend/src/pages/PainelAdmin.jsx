import { useEffect, useState } from 'react'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function PainelAdmin() {
  const [solicitacoes, setSolicitacoes] = useState([])
  const [solicitacoesProdutos, setSolicitacoesProdutos] = useState([])

  const [mensagem, setMensagem] = useState('')
  const [erroModal, setErroModal] = useState('')

  const [solicitacaoDetalhe, setSolicitacaoDetalhe] = useState(null)

  const [statusAvaliacao, setStatusAvaliacao] = useState('')
  const [retorno, setRetorno] = useState('')

  const [
    quantidadeContraoferta,
    setQuantidadeContraoferta
  ] = useState('')

  const [
    unidadeContraoferta,
    setUnidadeContraoferta
  ] = useState('')

  const [
    precoContraoferta,
    setPrecoContraoferta
  ] = useState('')

  const [statusProduto, setStatusProduto] = useState('')

  const [
    nomeProdutoAprovado,
    setNomeProdutoAprovado
  ] = useState('')

  const [
    retornoProduto,
    setRetornoProduto
  ] = useState('')

  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroProduto, setFiltroProduto] = useState('')
  const [filtroProdutor, setFiltroProdutor] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroPeriodo, setFiltroPeriodo] = useState('')

  const [
    filtrosAplicados,
    setFiltrosAplicados
  ] = useState({
    tipo: '',
    produto: '',
    produtor: '',
    status: '',
    periodo: ''
  })

  useEffect(() => {
    buscarSolicitacoes()
    buscarSolicitacoesProdutos()
  }, [])

  useEffect(() => {
    if (!solicitacaoDetalhe) {
      return
    }

    const overflowAnterior =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow =
        overflowAnterior
    }
  }, [solicitacaoDetalhe])

  const buscarSolicitacoes = async () => {
    try {
      const resposta = await api.get(
        '/solicitacoes/todas'
      )

      setSolicitacoes(resposta.data)
    } catch (err) {
      console.error(
        'Erro ao buscar solicitações:',
        err
      )
    }
  }

  const buscarSolicitacoesProdutos = async () => {
    try {
      const resposta = await api.get(
        '/produtos/solicitacoes'
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

  const separarQuantidade = (quantidade) => {
    const texto = String(
      quantidade || ''
    ).trim()

    const resultado = texto.match(
      /^([0-9]+(?:[.,][0-9]+)?)\s*(.*)$/
    )

    if (!resultado) {
      return {
        valor: '',
        unidade: ''
      }
    }

    return {
      valor: resultado[1].replace(',', '.'),
      unidade: resultado[2].trim()
    }
  }

  const limparAvaliacaoOferta = () => {
    setStatusAvaliacao('')
    setRetorno('')
    setQuantidadeContraoferta('')
    setUnidadeContraoferta('')
    setPrecoContraoferta('')
    setErroModal('')
  }

  const limparAvaliacaoProduto = () => {
    setStatusProduto('')
    setNomeProdutoAprovado('')
    setRetornoProduto('')
    setErroModal('')
  }

  const abrirDetalhe = (solicitacao) => {
    limparAvaliacaoOferta()
    limparAvaliacaoProduto()

    setMensagem('')
    setSolicitacaoDetalhe(solicitacao)
  }

  const fecharDetalhe = () => {
    limparAvaliacaoOferta()
    limparAvaliacaoProduto()

    setSolicitacaoDetalhe(null)
  }

  const iniciarAvaliacao = (status) => {
    if (!solicitacaoDetalhe) {
      return
    }

    setErroModal('')
    setStatusAvaliacao(status)
    setRetorno('')

    if (status === 'contraoferta') {
      const quantidade =
        separarQuantidade(
          solicitacaoDetalhe.quantidade
        )

      setQuantidadeContraoferta(
        quantidade.valor
      )

      setUnidadeContraoferta(
        quantidade.unidade
      )

      setPrecoContraoferta(
        solicitacaoDetalhe.preco ?? ''
      )
    } else {
      setQuantidadeContraoferta('')
      setUnidadeContraoferta('')
      setPrecoContraoferta('')
    }
  }

  const cancelarAvaliacao = () => {
    limparAvaliacaoOferta()
  }

  const confirmarAvaliacao = async () => {
    if (!solicitacaoDetalhe) {
      return
    }

    setErroModal('')

    if (
      statusAvaliacao === 'rejeitado' &&
      !retorno.trim()
    ) {
      setErroModal(
        'Informe o motivo da rejeição.'
      )

      return
    }

    if (statusAvaliacao === 'contraoferta') {
      if (
        quantidadeContraoferta === '' ||
        Number(quantidadeContraoferta) <= 0
      ) {
        setErroModal(
          'Informe uma quantidade válida.'
        )

        return
      }

      if (
        precoContraoferta === '' ||
        Number(precoContraoferta) <= 0
      ) {
        setErroModal(
          'Informe um preço válido.'
        )

        return
      }

      const quantidadeOriginal =
        separarQuantidade(
          solicitacaoDetalhe.quantidade
        )

      const quantidadeMudou =
        Number(quantidadeContraoferta) !==
        Number(quantidadeOriginal.valor)

      const precoMudou =
        Number(precoContraoferta) !==
        Number(solicitacaoDetalhe.preco)

      if (
        !quantidadeMudou &&
        !precoMudou
      ) {
        setErroModal(
          'Altere o preço ou a quantidade para enviar a contraoferta.'
        )

        return
      }
    }

    try {
      await api.patch(
        `/solicitacoes/${solicitacaoDetalhe.id}/avaliar`,
        {
          status: statusAvaliacao,

          observacao:
            retorno.trim() || null,

          quantidade_contraoferta:
            statusAvaliacao === 'contraoferta'
              ? Number(quantidadeContraoferta)
              : null,

          preco_contraoferta:
            statusAvaliacao === 'contraoferta'
              ? Number(precoContraoferta)
              : null
        }
      )

      if (statusAvaliacao === 'aprovado') {
        setMensagem(
          'Oferta aprovada com sucesso!'
        )
      }

      if (statusAvaliacao === 'rejeitado') {
        setMensagem(
          'Oferta rejeitada com sucesso!'
        )
      }

      if (statusAvaliacao === 'contraoferta') {
        setMensagem(
          'Contraoferta enviada ao produtor!'
        )
      }

      setSolicitacaoDetalhe(null)
      limparAvaliacaoOferta()

      await buscarSolicitacoes()
    } catch (err) {
      console.error(
        'Erro ao avaliar solicitação:',
        err
      )

      setErroModal(
        err.response?.data?.mensagem ||
        'Erro ao avaliar solicitação.'
      )
    }
  }

  const iniciarAvaliacaoProduto = (status) => {
    if (!solicitacaoDetalhe) {
      return
    }

    setErroModal('')
    setStatusProduto(status)

    setNomeProdutoAprovado(
      solicitacaoDetalhe.nome_produto || ''
    )

    setRetornoProduto('')
  }

  const cancelarAvaliacaoProduto = () => {
    limparAvaliacaoProduto()
  }

  const confirmarAvaliacaoProduto = async () => {
    if (!solicitacaoDetalhe) {
      return
    }

    setErroModal('')

    if (
      statusProduto === 'aprovado' &&
      !nomeProdutoAprovado.trim()
    ) {
      setErroModal(
        'Informe o nome do produto.'
      )

      return
    }

    if (
      statusProduto === 'rejeitado' &&
      !retornoProduto.trim()
    ) {
      setErroModal(
        'Informe o motivo da rejeição.'
      )

      return
    }

    try {
      await api.patch(
        `/produtos/solicitacoes/${solicitacaoDetalhe.id}/avaliar`,
        {
          status: statusProduto,

          nome_produto_aprovado:
            statusProduto === 'aprovado'
              ? nomeProdutoAprovado.trim()
              : null,

          retorno_admin:
            retornoProduto.trim() || null
        }
      )

      if (statusProduto === 'aprovado') {
        setMensagem(
          'Solicitação aprovada e produto incluído no catálogo!'
        )
      } else {
        setMensagem(
          'Solicitação de produto rejeitada.'
        )
      }

      setSolicitacaoDetalhe(null)
      limparAvaliacaoProduto()

      await buscarSolicitacoesProdutos()
    } catch (err) {
      console.error(
        'Erro ao avaliar solicitação de produto:',
        err
      )

      setErroModal(
        err.response?.data?.mensagem ||
        'Erro ao avaliar solicitação de produto.'
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

    return Number(preco).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    )
  }

  const formatarStatus = (status) => {
    if (status === 'aprovado') {
      return 'Aprovada'
    }

    if (status === 'rejeitado') {
      return 'Rejeitada'
    }

    if (status === 'contraoferta') {
      return 'Contraoferta enviada'
    }

    if (status === 'contraoferta_aceita') {
      return 'Contraoferta aceita'
    }

    if (status === 'contraoferta_recusada') {
      return 'Contraoferta recusada'
    }

    return 'Pendente'
  }

  const classeStatus = (status) => {
    if (
      status === 'aprovado' ||
      status === 'contraoferta_aceita'
    ) {
      return 'status-aprovado'
    }

    if (
      status === 'rejeitado' ||
      status === 'contraoferta_recusada'
    ) {
      return 'status-rejeitado'
    }

    return 'status-pendente'
  }

  const formatarTipo = (tipo) => {
    if (tipo === 'inclusao') {
      return 'Inclusão de produto'
    }

    return 'Oferta'
  }

  const nomeProdutoExibicao = (solicitacao) => {
    if (
      solicitacao.tipo_solicitacao === 'inclusao' &&
      solicitacao.status === 'aprovado' &&
      solicitacao.nome_produto_aprovado
    ) {
      return solicitacao.nome_produto_aprovado
    }

    return solicitacao.nome_produto
  }

  const quantidadeExibicao = (solicitacao) => {
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

  const precoExibicao = (solicitacao) => {
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

  const prioridadeStatus = (status) => {
    if (status === 'pendente') {
      return 0
    }

    if (status === 'contraoferta') {
      return 1
    }

    return 2
  }

  const dataTimestamp = (data) => {
    if (!data) {
      return 0
    }

    const valor =
      new Date(data).getTime()

    if (Number.isNaN(valor)) {
      return 0
    }

    return valor
  }

  const solicitacoesUnificadas = [
    ...solicitacoes.map(
      (solicitacao) => ({
        ...solicitacao,
        tipo_solicitacao: 'oferta',
        chave_lista:
          `oferta-${solicitacao.id}`
      })
    ),

    ...solicitacoesProdutos.map(
      (solicitacao) => ({
        ...solicitacao,
        tipo_solicitacao: 'inclusao',
        chave_lista:
          `inclusao-${solicitacao.id}`
      })
    )
  ].sort(
    (a, b) => {
      const prioridadeA =
        prioridadeStatus(a.status)

      const prioridadeB =
        prioridadeStatus(b.status)

      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB
      }

      return (
        dataTimestamp(
          b.data_solicitacao
        ) -
        dataTimestamp(
          a.data_solicitacao
        )
      )
    }
  )

  const solicitacoesPorTipoSelecionado =
    filtroTipo
      ? solicitacoesUnificadas.filter(
          (solicitacao) =>
            solicitacao.tipo_solicitacao ===
            filtroTipo
        )
      : solicitacoesUnificadas

  const produtosFiltro = [
    ...new Set(
      solicitacoesPorTipoSelecionado
        .map(
          (solicitacao) =>
            nomeProdutoExibicao(solicitacao)
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

  const produtoresFiltro = [
    ...new Set(
      solicitacoesUnificadas
        .map(
          (solicitacao) =>
            solicitacao.nome_produtor
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

    if (periodo === 'esta_semana') {
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
        dataSolicitacao >= inicioSemana &&
        dataSolicitacao <= hoje
      )
    }

    if (periodo === 'este_mes') {
      const inicioMes =
        new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          1
        )

      return (
        dataSolicitacao >= inicioMes &&
        dataSolicitacao <= hoje
      )
    }

    if (periodo === 'mes_passado') {
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
        dataSolicitacao >= inicioMesPassado &&
        dataSolicitacao < inicioMesAtual
      )
    }

    if (periodo === 'ultimos_3_meses') {
      const inicio = new Date(hoje)

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
        dataSolicitacao >= inicio &&
        dataSolicitacao <= hoje
      )
    }

    if (periodo === 'ultimos_6_meses') {
      const inicio = new Date(hoje)

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
        dataSolicitacao >= inicio &&
        dataSolicitacao <= hoje
      )
    }

    return true
  }

  const solicitacoesFiltradas =
    solicitacoesUnificadas.filter(
      (solicitacao) => {
        const correspondeTipo =
          filtrosAplicados.tipo === '' ||
          solicitacao.tipo_solicitacao ===
          filtrosAplicados.tipo

        const correspondeProduto =
          filtrosAplicados.produto === '' ||
          nomeProdutoExibicao(solicitacao) ===
          filtrosAplicados.produto

        const correspondeProdutor =
          filtrosAplicados.produtor === '' ||
          solicitacao.nome_produtor ===
          filtrosAplicados.produtor

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
          correspondeProdutor &&
          correspondeStatus &&
          correspondePeriodo
        )
      }
    )

  const alterarFiltroTipo = (tipo) => {
    setFiltroTipo(tipo)
    setFiltroProduto('')

    if (
      tipo === 'inclusao' &&
      [
        'contraoferta',
        'contraoferta_aceita',
        'contraoferta_recusada'
      ].includes(filtroStatus)
    ) {
      setFiltroStatus('')
    }
  }

  const pesquisar = () => {
    setFiltrosAplicados({
      tipo: filtroTipo,
      produto: filtroProduto,
      produtor: filtroProdutor,
      status: filtroStatus,
      periodo: filtroPeriodo
    })
  }

  const limparFiltros = () => {
    setFiltroTipo('')
    setFiltroProduto('')
    setFiltroProdutor('')
    setFiltroStatus('')
    setFiltroPeriodo('')

    setFiltrosAplicados({
      tipo: '',
      produto: '',
      produtor: '',
      status: '',
      periodo: ''
    })
  }

  const possuiFiltros =
    filtroTipo ||
    filtroProduto ||
    filtroProdutor ||
    filtroStatus ||
    filtroPeriodo ||
    filtrosAplicados.tipo ||
    filtrosAplicados.produto ||
    filtrosAplicados.produtor ||
    filtrosAplicados.status ||
    filtrosAplicados.periodo

  const tituloAvaliacao = () => {
    if (statusAvaliacao === 'aprovado') {
      return 'Aprovar oferta'
    }

    if (statusAvaliacao === 'rejeitado') {
      return 'Rejeitar oferta'
    }

    if (statusAvaliacao === 'contraoferta') {
      return 'Enviar contraoferta'
    }

    return ''
  }

  const textoBotaoConfirmacao = () => {
    if (statusAvaliacao === 'aprovado') {
      return 'Confirmar aprovação'
    }

    if (statusAvaliacao === 'rejeitado') {
      return 'Confirmar rejeição'
    }

    return 'Enviar contraoferta'
  }

  const handleTecladoItem = (
    e,
    solicitacao
  ) => {
    if (
      e.key === 'Enter' ||
      e.key === ' '
    ) {
      e.preventDefault()

      abrirDetalhe(solicitacao)
    }
  }

  return (
    <LayoutSistema
      titulo="Solicitações"
      subtitulo="Analise as solicitações enviadas pelos produtores."
      paginaAtiva="admin-solicitacoes"
      tipoUsuario="admin"
    >
      <style>
        {`
          .admin-solicitacoes-page {
            width: 100%;
            height: calc(100vh - 90px);
            min-height: 0;

            display: flex;
            flex-direction: column;

            padding: 26px 36px;

            overflow: hidden;
          }

          .admin-solicitacoes-page > .mensagem-pagina {
            flex-shrink: 0;
            margin-bottom: 15px;
          }

          .admin-solicitacoes-card {
            width: 100%;
            flex: 1;
            min-height: 0;

            display: grid;
            grid-template-rows:
              auto
              auto
              minmax(0, 1fr);

            overflow: hidden;
          }

          .admin-solicitacoes-scroll {
            width: 100%;
            min-height: 0;

            overflow-y: auto;
            overflow-x: hidden;

            overscroll-behavior: contain;
            scrollbar-gutter: stable;
          }

          .admin-solicitacoes-scroll::-webkit-scrollbar {
            width: 10px;
          }

          .admin-solicitacoes-scroll::-webkit-scrollbar-track {
            background: #f0f3f1;
          }

          .admin-solicitacoes-scroll::-webkit-scrollbar-thumb {
            background: #b5c0b8;

            border:
              2px solid #f0f3f1;

            border-radius: 10px;
          }

          .admin-solicitacoes-scroll::-webkit-scrollbar-thumb:hover {
            background: #96a49a;
          }

          .admin-solicitacoes-vazio {
            min-height: 0;
            height: 100%;
          }

          .admin-filtros {
            display: grid;

            grid-template-columns:
              repeat(5, minmax(0, 1fr));

            gap: 13px;

            align-items: end;
          }

          .admin-botoes-filtro {
            display: flex;

            align-items: center;
            justify-content: flex-end;

            gap: 10px;

            margin-top: 14px;
          }

          .admin-lista-item {
            display: grid;

            grid-template-columns:
              minmax(210px, 1.25fr)
              minmax(170px, 1fr)
              minmax(150px, 0.8fr)
              minmax(160px, 0.9fr)
              minmax(115px, auto);

            gap: 20px;
            align-items: center;

            min-height: 88px;

            padding: 14px 20px;

            background: #ffffff;

            border-bottom:
              1px solid #e6ebe7;

            cursor: pointer;

            transition:
              background-color 0.2s ease;
          }

          .admin-lista-item:hover {
            background: #f8fbf8;
          }

          .admin-lista-item:last-child {
            border-bottom: none;
          }

          .admin-lista-item:focus-visible {
            outline:
              2px solid #1b5e20;

            outline-offset: -2px;
          }

          .admin-lista-item-pendente {
            background: #fffefb;
          }

          .admin-lista-item-pendente:hover {
            background: #fffaf0;
          }

          .admin-lista-status {
            display: flex;

            align-items: center;
            justify-content: center;
          }

          .admin-lista-informacao {
            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            text-align: center;
          }

          .admin-lista-acao {
            display: flex;

            align-items: center;
            justify-content: flex-end;
          }

          .acoes-avaliacao-esquerda {
            display: flex;

            align-items: center;
            flex-wrap: wrap;

            gap: 10px;
          }

          .acoes-avaliacao-direita {
            display: flex;

            align-items: center;
            justify-content: flex-end;

            margin-left: auto;
          }

          .btn-acao-avaliacao {
            width: 94px;
            min-width: 94px;

            height: 40px;
            min-height: 40px;

            display: inline-flex;

            align-items: center;
            justify-content: center;

            padding: 0 8px;

            border-radius: 6px;

            font-size: 12px;
            font-weight: 600;

            cursor: pointer;
          }

          .btn-aprovar-admin {
            background: #1b5e20;
            color: #ffffff;

            border:
              1px solid #1b5e20;
          }

          .btn-aprovar-admin:hover {
            background: #174f1b;
            border-color: #174f1b;
          }

          .btn-rejeitar-admin {
            background: #d32f2f;
            color: #ffffff;

            border:
              1px solid #d32f2f;
          }

          .btn-rejeitar-admin:hover {
            background: #b92727;
            border-color: #b92727;
          }

          .btn-contraoferta-admin {
            background: #f2c14e;
            color: #4d3900;

            border:
              1px solid #d8a93b;
          }

          .btn-contraoferta-admin:hover {
            background: #e7b63f;
            border-color: #ca982b;
          }

          .avaliacao-inline {
            margin-top: 18px;
            padding: 18px;

            background: #f8faf8;

            border:
              1px solid #dfe7e0;

            border-radius: 8px;
          }

          .avaliacao-inline h4 {
            margin: 0 0 15px;

            color: #304334;

            font-size: 15px;
          }

          .avaliacao-inline-campos {
            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 14px;
          }

          .avaliacao-inline-acoes {
            display: flex;

            align-items: center;
            justify-content: flex-end;

            gap: 10px;

            margin-top: 16px;
          }

          .avaliacao-inline .campo label {
            color: #4e5f51;

            font-size: 12px;
            font-weight: 600;
          }

          .avaliacao-inline .campo input,
          .avaliacao-inline .campo textarea {
            background: #ffffff;
          }

          .quantidade-contraoferta {
            display: flex;

            align-items: stretch;

            width: 100%;
          }

          .quantidade-contraoferta input {
            flex: 1;

            min-width: 0;

            border-top-right-radius:
              0 !important;

            border-bottom-right-radius:
              0 !important;
          }

          .quantidade-unidade {
            min-width: 90px;

            display: flex;

            align-items: center;
            justify-content: center;

            padding: 0 14px;

            background: #edf2ee;
            color: #4a5a4d;

            border:
              1px solid #d7ddd9;

            border-left: none;

            border-radius:
              0 6px 6px 0;

            font-size: 13px;
            font-weight: 600;

            white-space: nowrap;
          }

          @media (max-width: 1150px) {
            .admin-filtros {
              grid-template-columns:
                repeat(3, minmax(0, 1fr));
            }

            .admin-lista-item {
              grid-template-columns:
                minmax(190px, 1.1fr)
                minmax(150px, 0.9fr)
                minmax(135px, 0.7fr)
                minmax(135px, 0.7fr)
                auto;

              gap: 13px;
            }
          }

          @media (max-width: 850px) {
            .admin-filtros {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
            }

            .admin-lista-item {
              grid-template-columns:
                1fr 1fr;

              gap: 14px;
            }

            .admin-lista-status {
              justify-content:
                flex-start;
            }

            .admin-lista-informacao {
              align-items:
                flex-start;

              text-align: left;
            }

            .admin-lista-acao {
              justify-content:
                flex-start;
            }

            .acoes-detalhe-modal {
              flex-direction: column;

              align-items:
                stretch !important;
            }

            .acoes-avaliacao-direita {
              margin-left: 0;

              justify-content:
                flex-start;
            }

            .avaliacao-inline-campos {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 700px) {
            .admin-solicitacoes-page {
              height: auto;
              min-height: calc(100vh - 90px);

              padding: 22px 16px 35px;

              overflow: visible;
            }

            .admin-solicitacoes-card {
              display: block;
            }

            .admin-solicitacoes-scroll {
              max-height: 500px;

              overflow-y: auto;
            }
          }

          @media (max-width: 600px) {
            .admin-filtros {
              grid-template-columns: 1fr;
            }

            .admin-botoes-filtro {
              flex-direction:
                column-reverse;
            }

            .admin-botoes-filtro button {
              width: 100%;
            }

            .admin-lista-item {
              grid-template-columns: 1fr;
            }

            .acoes-avaliacao-esquerda {
              flex-direction: column;
            }

            .btn-acao-avaliacao {
              width: 100%;
            }

            .acoes-avaliacao-direita button {
              width: 100%;
            }

            .avaliacao-inline-acoes {
              flex-direction:
                column-reverse;
            }

            .avaliacao-inline-acoes button {
              width: 100%;
            }
          }
        `}
      </style>

      <section className="admin-solicitacoes-page">

        {mensagem && (
          <p className="mensagem-pagina sucesso">
            {mensagem}
          </p>
        )}

        {solicitacaoDetalhe && (
          <div
            style={modalOverlay}
            onClick={fecharDetalhe}
          >

            <div
              style={modalConteudoDetalhe}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div style={modalCabecalho}>

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

                  <p style={modalDescricao}>
                    Solicitação enviada por{' '}
                    <strong>
                      {
                        solicitacaoDetalhe.nome_produtor
                      }
                    </strong>
                  </p>

                </div>

                <span
                  className={`status-badge ${classeStatus(
                    solicitacaoDetalhe.status
                  )}`}
                >
                  {formatarStatus(
                    solicitacaoDetalhe.status
                  )}
                </span>

              </div>

              {solicitacaoDetalhe.tipo_solicitacao ===
              'oferta' ? (
                <>

                  <div style={gradeDetalhes}>

                    <div style={blocoDetalhe}>

                      <span style={rotuloDetalhe}>
                        Produtor
                      </span>

                      <strong style={valorDetalhe}>
                        {
                          solicitacaoDetalhe.nome_produtor
                        }
                      </strong>

                    </div>

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
                        {quantidadeExibicao(
                          solicitacaoDetalhe
                        )}
                      </strong>

                    </div>

                    <div style={blocoDetalhe}>

                      <span style={rotuloDetalhe}>
                        Preço
                      </span>

                      <strong style={valorDetalhe}>
                        {formatarPreco(
                          precoExibicao(
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

                    <div style={blocoDetalheGrande}>

                      <span style={rotuloDetalhe}>
                        Observação do produtor
                      </span>

                      <p style={textoDetalhe}>
                        {
                          solicitacaoDetalhe.observacao_produtor ||
                          'Nenhuma observação informada.'
                        }
                      </p>

                    </div>

                    {(solicitacaoDetalhe.quantidade_contraoferta ||
                      solicitacaoDetalhe.preco_contraoferta) && (
                      <div style={contraofertaDetalhe}>

                        <h4 style={tituloContraofertaDetalhe}>
                          Contraoferta
                        </h4>

                        <div style={gradeContraoferta}>

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
                              Preço proposto
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

                  {solicitacaoDetalhe.status === 'pendente' &&
                    statusAvaliacao && (
                      <div className="avaliacao-inline">

                        <h4>
                          {tituloAvaliacao()}
                        </h4>

                        {statusAvaliacao === 'contraoferta' && (
                          <div className="avaliacao-inline-campos">

                            <div className="campo">

                              <label>
                                Quantidade proposta
                              </label>

                              <div className="quantidade-contraoferta">

                                <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={
                                    quantidadeContraoferta
                                  }
                                  onChange={(e) =>
                                    setQuantidadeContraoferta(
                                      e.target.value
                                    )
                                  }
                                />

                                {unidadeContraoferta && (
                                  <span className="quantidade-unidade">
                                    {
                                      unidadeContraoferta
                                    }
                                  </span>
                                )}

                              </div>

                            </div>

                            <div className="campo">

                              <label>
                                Preço proposto (R$)
                              </label>

                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={
                                  precoContraoferta
                                }
                                onChange={(e) =>
                                  setPrecoContraoferta(
                                    e.target.value
                                  )
                                }
                              />

                            </div>

                          </div>
                        )}

                        <div
                          className="campo"
                          style={{
                            marginTop:
                              statusAvaliacao === 'contraoferta'
                                ? '16px'
                                : '0'
                          }}
                        >

                          <label>
                            Retorno
                            {statusAvaliacao === 'rejeitado'
                              ? ' (obrigatório)'
                              : ' (opcional)'}
                          </label>

                          <textarea
                            value={retorno}
                            onChange={(e) =>
                              setRetorno(
                                e.target.value
                              )
                            }
                            placeholder={
                              statusAvaliacao === 'rejeitado'
                                ? 'Informe o motivo da rejeição.'
                                : 'Informe uma observação.'
                            }
                            rows="3"
                            style={textareaStyle}
                          />

                        </div>

                        {erroModal && (
                          <p style={mensagemErroModal}>
                            {erroModal}
                          </p>
                        )}

                        <div className="avaliacao-inline-acoes">

                          <button
                            className="btn-voltar"
                            type="button"
                            onClick={
                              cancelarAvaliacao
                            }
                          >
                            Cancelar avaliação
                          </button>

                          <button
                            className={
                              statusAvaliacao === 'rejeitado'
                                ? 'btn-rejeitar-admin'
                                : statusAvaliacao === 'contraoferta'
                                  ? 'btn-contraoferta-admin'
                                  : 'btn-aprovar-admin'
                            }
                            style={botaoConfirmarAvaliacao}
                            type="button"
                            onClick={
                              confirmarAvaliacao
                            }
                          >
                            {textoBotaoConfirmacao()}
                          </button>

                        </div>

                      </div>
                    )}

                  <div
                    className="acoes-detalhe-modal"
                    style={acoesDetalhe}
                  >

                    <div className="acoes-avaliacao-esquerda">

                      {solicitacaoDetalhe.status === 'pendente' && (
                        <>

                          <button
                            className="btn-acao-avaliacao btn-aprovar-admin"
                            type="button"
                            onClick={() =>
                              iniciarAvaliacao(
                                'aprovado'
                              )
                            }
                          >
                            Aprovar
                          </button>

                          <button
                            className="btn-acao-avaliacao btn-rejeitar-admin"
                            type="button"
                            onClick={() =>
                              iniciarAvaliacao(
                                'rejeitado'
                              )
                            }
                          >
                            Rejeitar
                          </button>

                          <button
                            className="btn-acao-avaliacao btn-contraoferta-admin"
                            type="button"
                            onClick={() =>
                              iniciarAvaliacao(
                                'contraoferta'
                              )
                            }
                          >
                            Contraoferta
                          </button>

                        </>
                      )}

                    </div>

                    <div className="acoes-avaliacao-direita">

                      <button
                        className="btn-voltar"
                        type="button"
                        onClick={fecharDetalhe}
                      >
                        Fechar
                      </button>

                    </div>

                  </div>

                </>
              ) : (
                <>

                  <div style={gradeDetalhes}>

                    <div style={blocoDetalhe}>

                      <span style={rotuloDetalhe}>
                        Produtor
                      </span>

                      <strong style={valorDetalhe}>
                        {
                          solicitacaoDetalhe.nome_produtor
                        }
                      </strong>

                    </div>

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

                    <div style={blocoDetalheGrande}>

                      <span style={rotuloDetalhe}>
                        Observação do produtor
                      </span>

                      <p style={textoDetalhe}>
                        {
                          solicitacaoDetalhe.observacao_produtor ||
                          'Nenhuma observação informada.'
                        }
                      </p>

                    </div>

                  </div>

                  {solicitacaoDetalhe.status === 'pendente' &&
                    statusProduto && (
                      <div className="avaliacao-inline">

                        <h4>
                          {statusProduto === 'aprovado'
                            ? 'Aprovar inclusão de produto'
                            : 'Rejeitar inclusão de produto'}
                        </h4>

                        {statusProduto === 'aprovado' && (
                          <div className="campo">

                            <label>
                              Nome no catálogo
                            </label>

                            <input
                              type="text"
                              value={
                                nomeProdutoAprovado
                              }
                              onChange={(e) =>
                                setNomeProdutoAprovado(
                                  e.target.value
                                )
                              }
                            />

                          </div>
                        )}

                        <div
                          className="campo"
                          style={{
                            marginTop:
                              statusProduto === 'aprovado'
                                ? '16px'
                                : '0'
                          }}
                        >

                          <label>
                            Retorno da APOMS
                            {statusProduto === 'rejeitado'
                              ? ' *'
                              : ' (opcional)'}
                          </label>

                          <textarea
                            value={retornoProduto}
                            onChange={(e) =>
                              setRetornoProduto(
                                e.target.value
                              )
                            }
                            placeholder={
                              statusProduto === 'rejeitado'
                                ? 'Informe o motivo da rejeição.'
                                : 'Opcional. Informe uma observação sobre a aprovação.'
                            }
                            rows="3"
                            style={textareaStyle}
                          />

                        </div>

                        {erroModal && (
                          <p style={mensagemErroModal}>
                            {erroModal}
                          </p>
                        )}

                        <div className="avaliacao-inline-acoes">

                          <button
                            className="btn-voltar"
                            type="button"
                            onClick={
                              cancelarAvaliacaoProduto
                            }
                          >
                            Cancelar avaliação
                          </button>

                          <button
                            className={
                              statusProduto === 'rejeitado'
                                ? 'btn-rejeitar-admin'
                                : 'btn-aprovar-admin'
                            }
                            style={botaoConfirmarAvaliacao}
                            type="button"
                            onClick={
                              confirmarAvaliacaoProduto
                            }
                          >
                            {statusProduto === 'aprovado'
                              ? 'Aprovar e incluir'
                              : 'Confirmar rejeição'}
                          </button>

                        </div>

                      </div>
                    )}

                  <div
                    className="acoes-detalhe-modal"
                    style={acoesDetalhe}
                  >

                    <div className="acoes-avaliacao-esquerda">

                      {solicitacaoDetalhe.status === 'pendente' && (
                        <>

                          <button
                            className="btn-acao-avaliacao btn-aprovar-admin"
                            type="button"
                            onClick={() =>
                              iniciarAvaliacaoProduto(
                                'aprovado'
                              )
                            }
                          >
                            Aprovar
                          </button>

                          <button
                            className="btn-acao-avaliacao btn-rejeitar-admin"
                            type="button"
                            onClick={() =>
                              iniciarAvaliacaoProduto(
                                'rejeitado'
                              )
                            }
                          >
                            Rejeitar
                          </button>

                        </>
                      )}

                    </div>

                    <div className="acoes-avaliacao-direita">

                      <button
                        className="btn-voltar"
                        type="button"
                        onClick={fecharDetalhe}
                      >
                        Fechar
                      </button>

                    </div>

                  </div>

                </>
              )}

            </div>

          </div>
        )}

        <div className="table-card admin-solicitacoes-card">

          <div style={cabecalhoLista}>

            <h2 style={tituloLista}>
              Histórico de solicitações
            </h2>

          </div>

          <div style={areaFiltros}>

            <div className="admin-filtros">

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
                  Produtor
                </label>

                <select
                  value={filtroProdutor}
                  onChange={(e) =>
                    setFiltroProdutor(
                      e.target.value
                    )
                  }
                  style={campoFiltro}
                >

                  <option value="">
                    Todos
                  </option>

                  {produtoresFiltro.map(
                    (produtor) => (
                      <option
                        key={produtor}
                        value={produtor}
                      >
                        {produtor}
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

                  <option value="pendente">
                    Pendente
                  </option>

                  <option value="aprovado">
                    Aprovada
                  </option>

                  <option value="rejeitado">
                    Rejeitada
                  </option>

                  {filtroTipo !== 'inclusao' && (
                    <>
                      <option value="contraoferta">
                        Contraoferta enviada
                      </option>

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

            <div className="admin-botoes-filtro">

              {possuiFiltros && (
                <button
                  type="button"
                  style={botaoLimpar}
                  onClick={limparFiltros}
                >
                  Limpar filtros
                </button>
              )}

              <button
                type="button"
                style={botaoPesquisar}
                onClick={pesquisar}
              >
                Pesquisar
              </button>

            </div>

          </div>

          {solicitacoesUnificadas.length === 0 ? (
            <div
              className="admin-solicitacoes-vazio"
              style={estadoVazio}
            >

              <h3>
                Nenhuma solicitação encontrada
              </h3>

              <p>
                Ainda não existem solicitações enviadas pelos produtores.
              </p>

            </div>
          ) : solicitacoesFiltradas.length === 0 ? (
            <div
              className="admin-solicitacoes-vazio"
              style={estadoVazio}
            >

              <h3>
                Nenhuma solicitação encontrada
              </h3>

              <p>
                Nenhuma solicitação corresponde aos filtros selecionados.
              </p>

            </div>
          ) : (
            <div className="admin-solicitacoes-scroll">

              {solicitacoesFiltradas.map(
                (solicitacao) => (
                  <div
                    key={
                      solicitacao.chave_lista
                    }
                    className={`admin-lista-item ${
                      solicitacao.status === 'pendente'
                        ? 'admin-lista-item-pendente'
                        : ''
                    }`}
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

                    <div className="admin-lista-informacao">

                      <span style={rotuloLista}>
                        Produtor
                      </span>

                      <strong style={valorLista}>
                        {
                          solicitacao.nome_produtor
                        }
                      </strong>

                    </div>

                    <div className="admin-lista-status">

                      <span
                        className={`status-badge ${classeStatus(
                          solicitacao.status
                        )}`}
                      >
                        {formatarStatus(
                          solicitacao.status
                        )}
                      </span>

                    </div>

                    <div className="admin-lista-informacao">

                      {solicitacao.tipo_solicitacao ===
                      'oferta' ? (
                        <>

                          <span style={rotuloLista}>
                            Quantidade
                          </span>

                          <strong style={valorLista}>
                            {quantidadeExibicao(
                              solicitacao
                            )}
                          </strong>

                        </>
                      ) : (
                        <>

                          <span style={rotuloLista}>
                            Data
                          </span>

                          <strong style={valorLista}>
                            {formatarData(
                              solicitacao.data_solicitacao
                            )}
                          </strong>

                        </>
                      )}

                    </div>

                    <div className="admin-lista-acao">

                      <span
                        style={
                          solicitacao.status ===
                          'pendente'
                            ? acaoAvaliar
                            : acaoDetalhes
                        }
                      >
                        {solicitacao.status ===
                        'pendente'
                          ? 'Avaliar'
                          : 'Ver detalhes'}

                        <span style={setaDetalhe}>
                          ›
                        </span>

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

const cabecalhoLista = {
  padding: '18px 20px',

  background: '#f8fbf8',

  borderBottom:
    '1px solid #e2e9e3'
}

const tituloLista = {
  margin: 0,

  color: '#26332b',

  fontSize: '18px'
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

const rotuloLista = {
  display: 'block',

  marginBottom: '4px',

  color: '#8a938e',

  fontSize: '10px',

  fontWeight: '600',

  textTransform:
    'uppercase',

  letterSpacing:
    '0.3px'
}

const valorLista = {
  color: '#465249',

  fontSize: '13px',

  fontWeight: '600'
}

const acaoAvaliar = {
  display: 'flex',

  alignItems: 'center',

  gap: '6px',

  color: '#1b5e20',

  fontSize: '12px',

  fontWeight: '700',

  whiteSpace: 'nowrap'
}

const acaoDetalhes = {
  display: 'flex',

  alignItems: 'center',

  gap: '6px',

  color: '#5b6e5e',

  fontSize: '12px',

  fontWeight: '600',

  whiteSpace: 'nowrap'
}

const setaDetalhe = {
  fontSize: '22px',
  lineHeight: 1
}

const estadoVazio = {
  minHeight: '180px',

  display: 'flex',

  flexDirection: 'column',

  alignItems: 'center',

  justifyContent: 'center',

  gap: '7px',

  padding: '30px',

  color: '#8a938e',

  textAlign: 'center'
}

const textareaStyle = {
  width: '100%',

  padding: '12px',

  border:
    '1px solid #d7ddd9',

  borderRadius: '6px',

  fontSize: '14px',

  resize: 'vertical',

  backgroundColor:
    '#ffffff',

  color: '#39443d'
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

const modalConteudoDetalhe = {
  width: '100%',

  maxWidth: '760px',

  maxHeight: '90vh',

  overflowY: 'auto',

  padding: '28px',

  background: '#ffffff',

  border:
    '1px solid #e1e6e3',

  borderRadius: '10px',

  boxShadow:
    '0 18px 50px rgba(0, 0, 0, 0.20)'
}

const modalCabecalho = {
  display: 'flex',

  alignItems:
    'flex-start',

  justifyContent:
    'space-between',

  gap: '20px',

  marginBottom: '24px'
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

const gradeContraoferta = {
  display: 'grid',

  gridTemplateColumns:
    'repeat(2, minmax(0, 1fr))',

  gap: '15px'
}

const acoesDetalhe = {
  display: 'flex',

  alignItems: 'center',

  justifyContent:
    'space-between',

  gap: '15px',

  marginTop: '22px',

  paddingTop: '18px',

  borderTop:
    '1px solid #e6ebe7'
}

const botaoConfirmarAvaliacao = {
  minHeight: '40px',

  padding: '9px 16px',

  borderRadius: '6px',

  fontSize: '13px',

  fontWeight: '600',

  cursor: 'pointer'
}

const mensagemErroModal = {
  margin: '14px 0 0',

  padding: '10px 12px',

  background: '#fceeee',

  color: '#b3261e',

  borderRadius: '6px',

  fontSize: '12px'
}

export default PainelAdmin