import { useEffect, useState } from 'react'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function RelatoriosAdmin() {
  const filtrosVazios = {
    dataInicio: '',
    dataFim: '',
    produto: '',
    produtor: '',
    nucleo: '',
    status: ''
  }

  const [solicitacoes, setSolicitacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [filtros, setFiltros] = useState(filtrosVazios)
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosVazios)
  const [pesquisaRealizada, setPesquisaRealizada] = useState(false)

  useEffect(() => {
    buscarSolicitacoes()
  }, [])

  const buscarSolicitacoes = async () => {
    try {
      const resposta = await api.get('/solicitacoes/todas')
      setSolicitacoes(resposta.data)
    } catch (err) {
      console.error('Erro ao buscar dados do relatório:', err)
      setErro('Erro ao carregar os dados do relatório.')
    } finally {
      setCarregando(false)
    }
  }

  const produtos = [
    ...new Set(
      solicitacoes
        .map((solicitacao) => solicitacao.nome_produto)
        .filter(Boolean)
    )
  ].sort()

  const produtores = [
    ...new Set(
      solicitacoes
        .map((solicitacao) => solicitacao.nome_produtor)
        .filter(Boolean)
    )
  ].sort()

  const nucleos = [
    ...new Set(
      solicitacoes
        .map((solicitacao) => solicitacao.nucleo_produtivo)
        .filter(Boolean)
    )
  ].sort()

  const solicitacoesFiltradas = solicitacoes.filter((solicitacao) => {
    const dataEnvio = solicitacao.data_solicitacao
      ? solicitacao.data_solicitacao.split('T')[0]
      : ''

    if (
      filtrosAplicados.dataInicio &&
      dataEnvio < filtrosAplicados.dataInicio
    ) {
      return false
    }

    if (
      filtrosAplicados.dataFim &&
      dataEnvio > filtrosAplicados.dataFim
    ) {
      return false
    }

    if (
      filtrosAplicados.produto &&
      solicitacao.nome_produto !== filtrosAplicados.produto
    ) {
      return false
    }

    if (
      filtrosAplicados.produtor &&
      solicitacao.nome_produtor !== filtrosAplicados.produtor
    ) {
      return false
    }

    if (
      filtrosAplicados.nucleo &&
      solicitacao.nucleo_produtivo !== filtrosAplicados.nucleo
    ) {
      return false
    }

    if (
      filtrosAplicados.status &&
      solicitacao.status !== filtrosAplicados.status
    ) {
      return false
    }

    return true
  })

  const temFiltroPreenchido = Object.values(
    filtros
  ).some((valor) => valor !== '')

  const filtrosForamAlterados =
    JSON.stringify(filtros) !==
    JSON.stringify(filtrosAplicados)

  const mostrarResultados =
    pesquisaRealizada &&
    !filtrosForamAlterados

  const pesquisar = () => {
    if (!temFiltroPreenchido) {
      return
    }

    setFiltrosAplicados({
      ...filtros
    })

    setPesquisaRealizada(true)
  }

  const limparFiltros = () => {
    setFiltros({
      ...filtrosVazios
    })

    setFiltrosAplicados({
      ...filtrosVazios
    })

    setPesquisaRealizada(false)
  }

  const podeExportar =
    mostrarResultados &&
    solicitacoesFiltradas.length > 0

  const totalSolicitacoes = solicitacoesFiltradas.length

  const totalPendentes = solicitacoesFiltradas.filter(
    (solicitacao) => solicitacao.status === 'pendente'
  ).length

  const totalAprovadas = solicitacoesFiltradas.filter(
    (solicitacao) => solicitacao.status === 'aprovado'
  ).length

  const totalRejeitadas = solicitacoesFiltradas.filter(
    (solicitacao) => solicitacao.status === 'rejeitado'
  ).length

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
      return '-'
    }

    return Number(preco).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatarStatus = (status) => {
    if (status === 'aprovado') {
      return 'Aprovada'
    }

    if (status === 'rejeitado') {
      return 'Rejeitada'
    }

    return 'Pendente'
  }

  const prepararCampoCSV = (valor) => {
    if (
      valor === null ||
      valor === undefined ||
      valor === ''
    ) {
      return ''
    }

    const texto = String(valor).replace(/"/g, '""')

    return `"${texto}"`
  }

  const exportarCSV = () => {
    if (!podeExportar) {
      return
    }

    const cabecalho = [
      'Produtor',
      'Núcleo produtivo',
      'Produto',
      'Quantidade',
      'Disponibilidade',
      'Preço',
      'Status',
      'Data de envio',
      'Observação',
      'Retorno'
    ]

    const linhas = solicitacoesFiltradas.map((solicitacao) => [
      solicitacao.nome_produtor,
      solicitacao.nucleo_produtivo || '',
      solicitacao.nome_produto,
      solicitacao.quantidade,
      formatarData(solicitacao.data_disponibilidade),
      formatarPreco(solicitacao.preco),
      formatarStatus(solicitacao.status),
      formatarData(solicitacao.data_solicitacao),
      solicitacao.observacao_produtor || '',
      solicitacao.observacao || ''
    ])

    const conteudo = [
      cabecalho.map(prepararCampoCSV).join(';'),
      ...linhas.map((linha) =>
        linha.map(prepararCampoCSV).join(';')
      )
    ].join('\n')

    const arquivo = new Blob(
      ['\uFEFF' + conteudo],
      {
        type: 'text/csv;charset=utf-8;'
      }
    )

    const url = URL.createObjectURL(arquivo)
    const link = document.createElement('a')

    const hoje = new Date()
      .toISOString()
      .split('T')[0]

    link.href = url
    link.download = `relatorio-apoms-${hoje}.csv`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  const cardResumo = {
    background: 'white',
    border: '1px solid #e4e9e6',
    borderRadius: '10px',
    padding: '20px',
    minHeight: '110px'
  }

  const valorResumo = {
    display: 'block',
    marginTop: '10px',
    color: '#26332b',
    fontSize: '27px',
    fontWeight: '700'
  }

  const tituloResumo = {
    color: '#7c8681',
    fontSize: '13px',
    fontWeight: '600'
  }

  return (
    <LayoutSistema
      titulo="Relatório de solicitações"
      subtitulo="Consulte e analise as informações registradas no sistema."
      paginaAtiva="admin-relatorios"
      tipoUsuario="admin"
    >
      <section className="dashboard-content">

        {erro && (
          <p className="mensagem-pagina erro">
            {erro}
          </p>
        )}

        <div
          className="cadastro-card"
          style={{
            maxWidth: '100%',
            marginBottom: '25px'
          }}
        >

          <div
            className="edicao-titulo"
            style={{ marginBottom: '20px' }}
          >
            <h3>Filtros</h3>

            <p>
              Selecione os dados que deseja visualizar no relatório.
            </p>
          </div>

          <div className="cadastro-produto-form">

            <div className="campo">
              <label>Data inicial</label>

              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    dataInicio: e.target.value
                  })
                }
              />
            </div>

            <div className="campo">
              <label>Data final</label>

              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    dataFim: e.target.value
                  })
                }
              />
            </div>

            <div className="campo">
              <label>Produto</label>

              <select
                value={filtros.produto}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    produto: e.target.value
                  })
                }
              >
                <option value="">
                  Todos os produtos
                </option>

                {produtos.map((produto) => (
                  <option
                    key={produto}
                    value={produto}
                  >
                    {produto}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Produtor</label>

              <select
                value={filtros.produtor}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    produtor: e.target.value
                  })
                }
              >
                <option value="">
                  Todos os produtores
                </option>

                {produtores.map((produtor) => (
                  <option
                    key={produtor}
                    value={produtor}
                  >
                    {produtor}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Núcleo produtivo</label>

              <select
                value={filtros.nucleo}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    nucleo: e.target.value
                  })
                }
              >
                <option value="">
                  Todos os núcleos
                </option>

                {nucleos.map((nucleo) => (
                  <option
                    key={nucleo}
                    value={nucleo}
                  >
                    {nucleo}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Status</label>

              <select
                value={filtros.status}
                onChange={(e) =>
                  setFiltros({
                    ...filtros,
                    status: e.target.value
                  })
                }
              >
                <option value="">
                  Todos os status
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
              </select>
            </div>

            <div className="acoes-form campo-grande">

              <button
                className="btn-voltar"
                type="button"
                onClick={limparFiltros}
              >
                Limpar filtros
              </button>

              <button
                className="btn-principal"
                type="button"
                onClick={pesquisar}
                disabled={!temFiltroPreenchido}
                style={{
                  opacity: temFiltroPreenchido ? 1 : 0.45,
                  cursor: temFiltroPreenchido
                    ? 'pointer'
                    : 'not-allowed'
                }}
              >
                Pesquisar
              </button>

              <button
                className="btn-principal"
                type="button"
                onClick={exportarCSV}
                disabled={!podeExportar}
                style={{
                  opacity: podeExportar ? 1 : 0.45,
                  cursor: podeExportar
                    ? 'pointer'
                    : 'not-allowed'
                }}
              >
                Exportar CSV
              </button>

            </div>

          </div>

        </div>

        {mostrarResultados && (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '25px'
              }}
            >

              <div style={cardResumo}>
                <span style={tituloResumo}>
                  Total de solicitações
                </span>

                <strong style={valorResumo}>
                  {totalSolicitacoes}
                </strong>
              </div>

              <div style={cardResumo}>
                <span style={tituloResumo}>
                  Pendentes
                </span>

                <strong style={valorResumo}>
                  {totalPendentes}
                </strong>
              </div>

              <div style={cardResumo}>
                <span style={tituloResumo}>
                  Aprovadas
                </span>

                <strong style={valorResumo}>
                  {totalAprovadas}
                </strong>
              </div>

              <div style={cardResumo}>
                <span style={tituloResumo}>
                  Rejeitadas
                </span>

                <strong style={valorResumo}>
                  {totalRejeitadas}
                </strong>
              </div>

            </div>

            <div className="page-header">
              <div>
                <h2>Resultados</h2>

                <p>
                  {solicitacoesFiltradas.length}{' '}
                  {solicitacoesFiltradas.length === 1
                    ? 'registro encontrado'
                    : 'registros encontrados'}
                </p>
              </div>
            </div>

            <div className="table-card">

              {carregando ? (
                <div className="estado-vazio">

                  <h3>Carregando relatório...</h3>

                </div>
              ) : solicitacoesFiltradas.length === 0 ? (
                <div className="estado-vazio">

                  <h3>Nenhum registro encontrado</h3>

                  <p>
                    Não existem solicitações correspondentes
                    aos filtros selecionados.
                  </p>

                </div>
              ) : (
                <div className="table-responsive">

                  <table className="dashboard-table solicitacoes-table">

                    <thead>
                      <tr>
                        <th>Produtor</th>
                        <th>Núcleo</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Disponibilidade</th>
                        <th>Preço</th>
                        <th>Status</th>
                        <th>Data de envio</th>
                        <th>Observação</th>
                        <th>Retorno</th>
                      </tr>
                    </thead>

                    <tbody>
                      {solicitacoesFiltradas.map(
                        (solicitacao) => (
                          <tr key={solicitacao.id}>

                            <td>
                              <strong className="produto-nome">
                                {solicitacao.nome_produtor}
                              </strong>
                            </td>

                            <td>
                              {solicitacao.nucleo_produtivo || '-'}
                            </td>

                            <td>
                              {solicitacao.nome_produto}
                            </td>

                            <td>
                              {solicitacao.quantidade}
                            </td>

                            <td>
                              {formatarData(
                                solicitacao.data_disponibilidade
                              )}
                            </td>

                            <td className="produto-preco">
                              {formatarPreco(
                                solicitacao.preco
                              )}
                            </td>

                            <td>
                              <span
                                className={`status-badge status-${solicitacao.status}`}
                              >
                                {formatarStatus(
                                  solicitacao.status
                                )}
                              </span>
                            </td>

                            <td>
                              {formatarData(
                                solicitacao.data_solicitacao
                              )}
                            </td>

                            <td>
                              {solicitacao.observacao_produtor || '-'}
                            </td>

                            <td>
                              {solicitacao.observacao || '-'}
                            </td>

                          </tr>
                        )
                      )}
                    </tbody>

                  </table>

                </div>
              )}

            </div>
          </>
        )}

      </section>
    </LayoutSistema>
  )
}

export default RelatoriosAdmin