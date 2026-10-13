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

  const [tipoRelatorio, setTipoRelatorio] = useState('solicitacoes')

  const [solicitacoes, setSolicitacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [filtros, setFiltros] = useState({
    ...filtrosVazios
  })

  const [filtrosAplicados, setFiltrosAplicados] = useState({
    ...filtrosVazios
  })

  const [pesquisaRealizada, setPesquisaRealizada] = useState(false)

  useEffect(() => {
    buscarSolicitacoes()
  }, [])

  const buscarSolicitacoes = async () => {
    try {
      const resposta = await api.get('/solicitacoes/todas')

      setSolicitacoes(resposta.data)
    } catch (err) {
      console.error(
        'Erro ao buscar dados do relatório:',
        err
      )

      setErro(
        'Erro ao carregar os dados do relatório.'
      )
    } finally {
      setCarregando(false)
    }
  }

  const trocarRelatorio = (tipo) => {
    setTipoRelatorio(tipo)

    setFiltros({
      ...filtrosVazios
    })

    setFiltrosAplicados({
      ...filtrosVazios
    })

    setPesquisaRealizada(false)
  }

  const produtos = [
    ...new Set(
      solicitacoes
        .map(
          (solicitacao) =>
            solicitacao.nome_produto
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

  const produtores = [
    ...new Set(
      solicitacoes
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

  const nucleos = [
    ...new Set(
      solicitacoes
        .map(
          (solicitacao) =>
            solicitacao.nucleo_produtivo
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

    return 'Pendente'
  }

  const classeStatus = (status) => {
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

  const separarQuantidade = (quantidade) => {
    const texto = String(
      quantidade || ''
    ).trim()

    const resultado = texto.match(
      /^([0-9]+(?:[.,][0-9]+)?)\s*(.*)$/
    )

    if (!resultado) {
      return {
        valor: 0,
        unidade: ''
      }
    }

    const valor = Number(
      resultado[1].replace(
        ',',
        '.'
      )
    )

    return {
      valor:
        Number.isNaN(valor)
          ? 0
          : valor,

      unidade:
        resultado[2].trim()
    }
  }

  const quantidadeFinal = (
    solicitacao
  ) => {
    if (
      solicitacao.status ===
        'contraoferta_aceita' &&
      solicitacao.quantidade_contraoferta
    ) {
      return solicitacao.quantidade_contraoferta
    }

    return solicitacao.quantidade
  }

  const precoFinal = (
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
      return Number(
        solicitacao.preco_contraoferta
      )
    }

    return Number(
      solicitacao.preco || 0
    )
  }

  const solicitacoesFiltradas =
    solicitacoes.filter(
      (solicitacao) => {
        const dataEnvio =
          solicitacao.data_solicitacao
            ? solicitacao.data_solicitacao.split(
                'T'
              )[0]
            : ''

        if (
          filtrosAplicados.dataInicio &&
          dataEnvio <
            filtrosAplicados.dataInicio
        ) {
          return false
        }

        if (
          filtrosAplicados.dataFim &&
          dataEnvio >
            filtrosAplicados.dataFim
        ) {
          return false
        }

        if (
          filtrosAplicados.produto &&
          solicitacao.nome_produto !==
            filtrosAplicados.produto
        ) {
          return false
        }

        if (
          filtrosAplicados.produtor &&
          solicitacao.nome_produtor !==
            filtrosAplicados.produtor
        ) {
          return false
        }

        if (
          filtrosAplicados.nucleo &&
          solicitacao.nucleo_produtivo !==
            filtrosAplicados.nucleo
        ) {
          return false
        }

        if (
          filtrosAplicados.status &&
          solicitacao.status !==
            filtrosAplicados.status
        ) {
          return false
        }

        return true
      }
    )

  const totalSolicitacoes =
    solicitacoesFiltradas.length

  const totalPendentes =
    solicitacoesFiltradas.filter(
      (solicitacao) =>
        solicitacao.status ===
        'pendente'
    ).length

  const totalAprovadas =
    solicitacoesFiltradas.filter(
      (solicitacao) =>
        solicitacao.status ===
          'aprovado' ||
        solicitacao.status ===
          'contraoferta_aceita'
    ).length

  const totalRejeitadas =
    solicitacoesFiltradas.filter(
      (solicitacao) =>
        solicitacao.status ===
          'rejeitado' ||
        solicitacao.status ===
          'contraoferta_recusada'
    ).length

  const ofertasFinanceiras =
    solicitacoes
      .filter(
        (solicitacao) =>
          solicitacao.status ===
            'aprovado' ||
          solicitacao.status ===
            'contraoferta_aceita'
      )
      .map(
        (solicitacao) => {
          const quantidade =
            separarQuantidade(
              quantidadeFinal(
                solicitacao
              )
            )

          const preco =
            precoFinal(
              solicitacao
            )

          return {
            ...solicitacao,

            quantidade_final:
              quantidadeFinal(
                solicitacao
              ),

            quantidade_numero:
              quantidade.valor,

            unidade:
              quantidade.unidade,

            preco_final:
              preco,

            valor_total:
              quantidade.valor *
              preco
          }
        }
      )

  const financeiroFiltrado =
    ofertasFinanceiras.filter(
      (solicitacao) => {
        const dataDisponibilidade =
          solicitacao.data_disponibilidade
            ? solicitacao.data_disponibilidade.split(
                'T'
              )[0]
            : ''

        if (
          filtrosAplicados.dataInicio &&
          dataDisponibilidade <
            filtrosAplicados.dataInicio
        ) {
          return false
        }

        if (
          filtrosAplicados.dataFim &&
          dataDisponibilidade >
            filtrosAplicados.dataFim
        ) {
          return false
        }

        if (
          filtrosAplicados.produto &&
          solicitacao.nome_produto !==
            filtrosAplicados.produto
        ) {
          return false
        }

        if (
          filtrosAplicados.produtor &&
          solicitacao.nome_produtor !==
            filtrosAplicados.produtor
        ) {
          return false
        }

        if (
          filtrosAplicados.nucleo &&
          solicitacao.nucleo_produtivo !==
            filtrosAplicados.nucleo
        ) {
          return false
        }

        return true
      }
    )

  const valorTotalFinanceiro =
    financeiroFiltrado.reduce(
      (total, solicitacao) =>
        total +
        solicitacao.valor_total,
      0
    )

  const totalOfertasFinanceiras =
    financeiroFiltrado.length

  const produtoresEnvolvidos =
    new Set(
      financeiroFiltrado
        .map(
          (solicitacao) =>
            solicitacao.cpf_produtor ||
            solicitacao.nome_produtor
        )
        .filter(Boolean)
    ).size

  const valorMedioOferta =
    totalOfertasFinanceiras > 0
      ? valorTotalFinanceiro /
        totalOfertasFinanceiras
      : 0

  const agruparFinanceiro = (
    chave
  ) => {
    const agrupado = {}

    financeiroFiltrado.forEach(
      (solicitacao) => {
        const nome =
          solicitacao[chave] ||
          'Não informado'

        if (!agrupado[nome]) {
          agrupado[nome] = {
            nome,
            quantidade_ofertas: 0,
            valor_total: 0
          }
        }

        agrupado[nome].quantidade_ofertas += 1

        agrupado[nome].valor_total +=
          solicitacao.valor_total
      }
    )

    return Object.values(
      agrupado
    ).sort(
      (a, b) =>
        b.valor_total -
        a.valor_total
    )
  }

  const resumoProdutores =
    agruparFinanceiro(
      'nome_produtor'
    )

  const resumoNucleos =
    agruparFinanceiro(
      'nucleo_produtivo'
    )

  const temFiltroPreenchido =
    tipoRelatorio ===
    'solicitacoes'
      ? Object.values(
          filtros
        ).some(
          (valor) =>
            valor !== ''
        )
      : [
          filtros.dataInicio,
          filtros.dataFim,
          filtros.produto,
          filtros.produtor,
          filtros.nucleo
        ].some(
          (valor) =>
            valor !== ''
        )

  const filtrosForamAlterados =
    JSON.stringify(
      filtros
    ) !==
    JSON.stringify(
      filtrosAplicados
    )

  const mostrarResultados =
    pesquisaRealizada &&
    !filtrosForamAlterados

  const pesquisar = () => {
    if (
      !temFiltroPreenchido
    ) {
      return
    }

    setFiltrosAplicados({
      ...filtros
    })

    setPesquisaRealizada(
      true
    )
  }

  const limparFiltros = () => {
    setFiltros({
      ...filtrosVazios
    })

    setFiltrosAplicados({
      ...filtrosVazios
    })

    setPesquisaRealizada(
      false
    )
  }

  const registrosAtuais =
    tipoRelatorio ===
    'financeiro'
      ? financeiroFiltrado
      : solicitacoesFiltradas

  const podeExportar =
    mostrarResultados &&
    registrosAtuais.length > 0

  const prepararCampoCSV = (
    valor
  ) => {
    if (
      valor === null ||
      valor === undefined ||
      valor === ''
    ) {
      return ''
    }

    const texto =
      String(
        valor
      ).replace(
        /"/g,
        '""'
      )

    return `"${texto}"`
  }

  const baixarCSV = (
    cabecalho,
    linhas,
    nomeArquivo
  ) => {
    const conteudo = [
      cabecalho
        .map(
          prepararCampoCSV
        )
        .join(';'),

      ...linhas.map(
        (linha) =>
          linha
            .map(
              prepararCampoCSV
            )
            .join(';')
      )
    ].join('\n')

    const arquivo =
      new Blob(
        [
          '\uFEFF' +
          conteudo
        ],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      )

    const url =
      URL.createObjectURL(
        arquivo
      )

    const link =
      document.createElement(
        'a'
      )

    const hoje =
      new Date()
        .toISOString()
        .split('T')[0]

    link.href = url

    link.download =
      `${nomeArquivo}-${hoje}.csv`

    document.body.appendChild(
      link
    )

    link.click()

    document.body.removeChild(
      link
    )

    URL.revokeObjectURL(
      url
    )
  }

  const exportarSolicitacoesCSV =
    () => {
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

      const linhas =
        solicitacoesFiltradas.map(
          (solicitacao) => [
            solicitacao.nome_produtor,
            solicitacao.nucleo_produtivo ||
              '',
            solicitacao.nome_produto,
            solicitacao.quantidade,
            formatarData(
              solicitacao.data_disponibilidade
            ),
            formatarPreco(
              solicitacao.preco
            ),
            formatarStatus(
              solicitacao.status
            ),
            formatarData(
              solicitacao.data_solicitacao
            ),
            solicitacao.observacao_produtor ||
              '',
            solicitacao.observacao ||
              ''
          ]
        )

      baixarCSV(
        cabecalho,
        linhas,
        'relatorio-solicitacoes-apoms'
      )
    }

  const exportarFinanceiroCSV =
    () => {
      if (!podeExportar) {
        return
      }

      const cabecalho = [
        'Produtor',
        'Núcleo produtivo',
        'Produto',
        'Quantidade',
        'Unidade',
        'Preço unitário',
        'Valor total',
        'Disponibilidade'
      ]

      const linhas =
        financeiroFiltrado.map(
          (solicitacao) => [
            solicitacao.nome_produtor,
            solicitacao.nucleo_produtivo ||
              '',
            solicitacao.nome_produto,
            solicitacao.quantidade_numero,
            solicitacao.unidade,
            formatarPreco(
              solicitacao.preco_final
            ),
            formatarPreco(
              solicitacao.valor_total
            ),
            formatarData(
              solicitacao.data_disponibilidade
            )
          ]
        )

      baixarCSV(
        cabecalho,
        linhas,
        'relatorio-financeiro-apoms'
      )
    }

  const exportarCSV = () => {
    if (
      tipoRelatorio ===
      'financeiro'
    ) {
      exportarFinanceiroCSV()

      return
    }

    exportarSolicitacoesCSV()
  }

  const cardResumo = {
    background:
      '#eef5ef',

    border:
      '1px solid #c9ddcb',

    borderRadius:
      '10px',

    padding:
      '20px',

    minHeight:
      '110px'
  }

  const valorResumo = {
    display:
      'block',

    marginTop:
      '10px',

    color:
      '#26332b',

    fontSize:
      '27px',

    fontWeight:
      '700'
  }

  const tituloResumo = {
    color:
      '#55705a',

    fontSize:
      '13px',

    fontWeight:
      '600'
  }

  return (
    <LayoutSistema
      titulo="Relatórios"
      subtitulo="Consulte e analise as informações registradas no sistema."
      paginaAtiva="admin-relatorios"
      tipoUsuario="admin"
    >
      <style>
        {`
          .relatorios-abas {
            display: flex;

            gap: 12px;

            margin-bottom: 22px;

            padding-bottom: 14px;

            border-bottom:
              1px solid #dde5df;
          }

          .relatorios-aba {
            min-width: 140px;

            padding: 12px 20px;

            background: #1b5e20;

            color: #ffffff;

            border:
              1px solid #1b5e20;

            border-radius: 10px;

            font-size: 14px;
            font-weight: 700;

            cursor: pointer;

            transition:
              all 0.2s ease;
          }

          .relatorios-aba:hover {
            background: #174d1a;
            border-color: #174d1a;
          }

          .relatorios-aba.ativa {
            background: #174d1a;
            border-color: #174d1a;

            box-shadow:
              0 0 0 2px
              rgba(27, 94, 32, 0.12);
          }

          .relatorios-aba.inativa {
            opacity: 0.92;
          }

          /* Formulário de filtros */

          .relatorios-filtros-card {
            width: 100%;

            max-width: 100% !important;

            margin-bottom: 25px;

            padding: 20px 22px !important;

            background:
              #f0f5f0 !important;

            border:
              1px solid #8fb995 !important;

            border-radius:
              10px !important;

            box-shadow:
              0 2px 7px
              rgba(27, 94, 32, 0.05) !important;
          }

          .relatorios-filtros-card
          .edicao-titulo {
            margin-bottom: 20px;
          }

          .relatorios-filtros-card
          .edicao-titulo h3 {
            color: #26332b;

            font-size: 18px;
            font-weight: 700;
          }

          .relatorios-filtros-card
          .edicao-titulo p {
            margin-top: 5px;

            color: #657268;

            font-size: 12px;
          }

          .relatorios-filtros-card
          .cadastro-produto-form {
            gap: 14px 22px;
          }

          .relatorios-filtros-card
          .campo label {
            margin-bottom: 5px;

            color: #304b34;

            font-size: 13px;
            font-weight: 600;
          }

          .relatorios-filtros-card
          .campo input,
          .relatorios-filtros-card
          .campo select {
            min-height: 42px;

            padding: 8px 12px;

            background: #ffffff;

            color: #39443d;

            border:
              1px solid #91ad95;

            border-radius: 6px;

            font-size: 14px;
          }

          .relatorios-filtros-card
          .campo input:focus,
          .relatorios-filtros-card
          .campo select:focus {
            outline: none;

            border-color: #1b5e20;

            box-shadow:
              0 0 0 2px
              rgba(27, 94, 32, 0.08);
          }

          .relatorios-filtros-card
          .acoes-form {
            margin-top: 4px;

            padding-top: 13px;

            border-top:
              1px solid
              rgba(27, 94, 32, 0.18);
          }

          .relatorios-filtros-card
          .btn-principal {
            min-width: 160px;
          }

          .relatorios-filtros-card
          .btn-voltar {
            min-width: 120px;

            background: #ffffff;

            color: #4b594d;

            border:
              1px solid #91aa95;
          }

          .relatorios-filtros-card
          .btn-voltar:hover {
            background: #f5f8f5;

            border-color: #778f7b;
          }

          /* Financeiro */

          .financeiro-resumos {
            display: grid;

            grid-template-columns:
              repeat(
                auto-fit,
                minmax(300px, 1fr)
              );

            gap: 18px;

            margin-top: 25px;
          }

          .financeiro-resumo-card {
            overflow: hidden;

            background: #ffffff;

            border:
              1px solid #e4e9e6;

            border-radius: 10px;
          }

          .financeiro-resumo-card h3 {
            margin: 0;

            padding: 15px 18px;

            background: #f8fbf8;

            color: #2f4033;

            border-bottom:
              1px solid #e3e9e4;

            font-size: 15px;
          }

          .financeiro-resumo-linha {
            display: grid;

            grid-template-columns:
              minmax(0, 1fr)
              auto;

            gap: 15px;

            align-items: center;

            padding: 12px 18px;

            border-bottom:
              1px solid #edf0ee;
          }

          .financeiro-resumo-linha:last-child {
            border-bottom: none;
          }

          .financeiro-resumo-nome {
            min-width: 0;

            overflow: hidden;

            color: #465249;

            font-size: 13px;

            text-overflow: ellipsis;

            white-space: nowrap;
          }

          .financeiro-resumo-valor {
            color: #1b5e20;

            font-size: 13px;
            font-weight: 700;

            white-space: nowrap;
          }

          .financeiro-resumo-sub {
            display: block;

            margin-top: 3px;

            color: #8a938e;

            font-size: 10px;
          }

          .financeiro-aviso {
            display: flex;

            align-items: center;

            gap: 12px;

            margin-bottom: 20px;

            padding: 14px 18px;

            background: #f8fbf8;

            color: #35543a;

            border:
              1px solid #d8e7da;

            border-radius: 10px;

            font-size: 15px;
            font-weight: 600;

            line-height: 1.5;
          }

          .financeiro-aviso-icone {
            font-size: 20px;

            line-height: 1;
          }

          @media (max-width: 700px) {
            .relatorios-abas {
              width: 100%;

              flex-wrap: wrap;
            }

            .relatorios-aba {
              flex: 1;

              min-width: 0;
            }

            .financeiro-aviso {
              align-items:
                flex-start;
            }

            .relatorios-filtros-card {
              padding:
                18px 16px !important;
            }

            .relatorios-filtros-card
            .acoes-form {
              flex-direction:
                column-reverse;
            }

            .relatorios-filtros-card
            .acoes-form button {
              width: 100%;
            }
          }
        `}
      </style>

      <section className="dashboard-content">

        {erro && (
          <p className="mensagem-pagina erro">
            {erro}
          </p>
        )}

        <div className="relatorios-abas">

          <button
            type="button"
            className={`relatorios-aba ${
              tipoRelatorio ===
              'solicitacoes'
                ? 'ativa'
                : 'inativa'
            }`}
            onClick={() =>
              trocarRelatorio(
                'solicitacoes'
              )
            }
          >
            Solicitações
          </button>

          <button
            type="button"
            className={`relatorios-aba ${
              tipoRelatorio ===
              'financeiro'
                ? 'ativa'
                : 'inativa'
            }`}
            onClick={() =>
              trocarRelatorio(
                'financeiro'
              )
            }
          >
            Financeiro
          </button>

        </div>

        {tipoRelatorio ===
          'financeiro' && (
          <div className="financeiro-aviso">

            <span className="financeiro-aviso-icone">
              ⚠️
            </span>

            <span>
              O relatório financeiro considera somente ofertas aprovadas e contraofertas aceitas.
            </span>

          </div>
        )}

        <div className="cadastro-card relatorios-filtros-card">

          <div className="edicao-titulo">

            <h3>
              Filtros
            </h3>

            <p>
              {tipoRelatorio ===
              'financeiro'
                ? 'Selecione os dados das aquisições que deseja analisar.'
                : 'Selecione os dados que deseja visualizar no relatório.'}
            </p>

          </div>

          <div className="cadastro-produto-form">

            <div className="campo">

              <label>
                Data inicial
              </label>

              <input
                type="date"
                value={
                  filtros.dataInicio
                }
                onChange={(e) =>
                  setFiltros({
                    ...filtros,

                    dataInicio:
                      e.target.value
                  })
                }
              />

            </div>

            <div className="campo">

              <label>
                Data final
              </label>

              <input
                type="date"
                value={
                  filtros.dataFim
                }
                onChange={(e) =>
                  setFiltros({
                    ...filtros,

                    dataFim:
                      e.target.value
                  })
                }
              />

            </div>

            <div className="campo">

              <label>
                Produto
              </label>

              <select
                value={
                  filtros.produto
                }
                onChange={(e) =>
                  setFiltros({
                    ...filtros,

                    produto:
                      e.target.value
                  })
                }
              >

                <option value="">
                  Todos os produtos
                </option>

                {produtos.map(
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

            <div className="campo">

              <label>
                Produtor
              </label>

              <select
                value={
                  filtros.produtor
                }
                onChange={(e) =>
                  setFiltros({
                    ...filtros,

                    produtor:
                      e.target.value
                  })
                }
              >

                <option value="">
                  Todos os produtores
                </option>

                {produtores.map(
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

            <div className="campo">

              <label>
                Núcleo produtivo
              </label>

              <select
                value={
                  filtros.nucleo
                }
                onChange={(e) =>
                  setFiltros({
                    ...filtros,

                    nucleo:
                      e.target.value
                  })
                }
              >

                <option value="">
                  Todos os núcleos
                </option>

                {nucleos.map(
                  (nucleo) => (
                    <option
                      key={nucleo}
                      value={nucleo}
                    >
                      {nucleo}
                    </option>
                  )
                )}

              </select>

            </div>

            {tipoRelatorio ===
              'solicitacoes' && (
              <div className="campo">

                <label>
                  Status
                </label>

                <select
                  value={
                    filtros.status
                  }
                  onChange={(e) =>
                    setFiltros({
                      ...filtros,

                      status:
                        e.target.value
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

                  <option value="contraoferta">
                    Contraoferta enviada
                  </option>

                  <option value="contraoferta_aceita">
                    Contraoferta aceita
                  </option>

                  <option value="contraoferta_recusada">
                    Contraoferta recusada
                  </option>

                </select>

              </div>
            )}

            <div className="acoes-form campo-grande">

              <button
                className="btn-voltar"
                type="button"
                onClick={
                  limparFiltros
                }
              >
                Limpar filtros
              </button>

              <button
                className="btn-principal"
                type="button"
                onClick={
                  pesquisar
                }
                disabled={
                  !temFiltroPreenchido
                }
                style={{
                  opacity:
                    temFiltroPreenchido
                      ? 1
                      : 0.45,

                  cursor:
                    temFiltroPreenchido
                      ? 'pointer'
                      : 'not-allowed'
                }}
              >
                Pesquisar
              </button>

              <button
                className="btn-principal"
                type="button"
                onClick={
                  exportarCSV
                }
                disabled={
                  !podeExportar
                }
                style={{
                  opacity:
                    podeExportar
                      ? 1
                      : 0.45,

                  cursor:
                    podeExportar
                      ? 'pointer'
                      : 'not-allowed'
                }}
              >
                Exportar CSV
              </button>

            </div>

          </div>

        </div>

        {mostrarResultados &&
          tipoRelatorio ===
            'solicitacoes' && (
          <>

            <div
              style={{
                display:
                  'grid',

                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',

                gap:
                  '16px',

                marginBottom:
                  '25px'
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

                <h2>
                  Resultados
                </h2>

                <p>
                  {
                    solicitacoesFiltradas.length
                  }{' '}
                  {solicitacoesFiltradas.length ===
                  1
                    ? 'registro encontrado'
                    : 'registros encontrados'}
                </p>

              </div>

            </div>

            <div className="table-card">

              {carregando ? (
                <div className="estado-vazio">

                  <h3>
                    Carregando relatório...
                  </h3>

                </div>
              ) : solicitacoesFiltradas.length ===
                0 ? (
                <div className="estado-vazio">

                  <h3>
                    Nenhum registro encontrado
                  </h3>

                  <p>
                    Não existem solicitações correspondentes aos filtros selecionados.
                  </p>

                </div>
              ) : (
                <div className="table-responsive">

                  <table className="dashboard-table solicitacoes-table">

                    <thead>

                      <tr>

                        <th>
                          Produtor
                        </th>

                        <th>
                          Núcleo
                        </th>

                        <th>
                          Produto
                        </th>

                        <th>
                          Quantidade
                        </th>

                        <th>
                          Disponibilidade
                        </th>

                        <th>
                          Preço
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Data de envio
                        </th>

                        <th>
                          Observação
                        </th>

                        <th>
                          Retorno
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {solicitacoesFiltradas.map(
                        (solicitacao) => (
                          <tr
                            key={
                              solicitacao.id
                            }
                          >

                            <td>

                              <strong className="produto-nome">
                                {
                                  solicitacao.nome_produtor
                                }
                              </strong>

                            </td>

                            <td>
                              {solicitacao.nucleo_produtivo ||
                                '-'}
                            </td>

                            <td>
                              {
                                solicitacao.nome_produto
                              }
                            </td>

                            <td>
                              {
                                solicitacao.quantidade
                              }
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
                                className={`status-badge ${classeStatus(
                                  solicitacao.status
                                )}`}
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
                              {solicitacao.observacao_produtor ||
                                '-'}
                            </td>

                            <td>
                              {solicitacao.observacao ||
                                '-'}
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

        {mostrarResultados &&
          tipoRelatorio ===
            'financeiro' && (
          <>

            <div
              style={{
                display:
                  'grid',

                gridTemplateColumns:
                  'repeat(auto-fit, minmax(190px, 1fr))',

                gap:
                  '16px',

                marginBottom:
                  '25px'
              }}
            >

              <div style={cardResumo}>

                <span style={tituloResumo}>
                  Valor total aprovado
                </span>

                <strong style={valorResumo}>
                  {formatarPreco(
                    valorTotalFinanceiro
                  )}
                </strong>

              </div>

              <div style={cardResumo}>

                <span style={tituloResumo}>
                  Ofertas aprovadas
                </span>

                <strong style={valorResumo}>
                  {
                    totalOfertasFinanceiras
                  }
                </strong>

              </div>

              <div style={cardResumo}>

                <span style={tituloResumo}>
                  Produtores envolvidos
                </span>

                <strong style={valorResumo}>
                  {
                    produtoresEnvolvidos
                  }
                </strong>

              </div>

              <div style={cardResumo}>

                <span style={tituloResumo}>
                  Valor médio por oferta
                </span>

                <strong style={valorResumo}>
                  {formatarPreco(
                    valorMedioOferta
                  )}
                </strong>

              </div>

            </div>

            <div className="page-header">

              <div>

                <h2>
                  Aquisições aprovadas
                </h2>

                <p>
                  {
                    financeiroFiltrado.length
                  }{' '}
                  {financeiroFiltrado.length ===
                  1
                    ? 'oferta encontrada'
                    : 'ofertas encontradas'}
                </p>

              </div>

            </div>

            <div className="table-card">

              {carregando ? (
                <div className="estado-vazio">

                  <h3>
                    Carregando relatório...
                  </h3>

                </div>
              ) : financeiroFiltrado.length ===
                0 ? (
                <div className="estado-vazio">

                  <h3>
                    Nenhuma aquisição encontrada
                  </h3>

                  <p>
                    Não existem ofertas aprovadas correspondentes aos filtros selecionados.
                  </p>

                </div>
              ) : (
                <div className="table-responsive">

                  <table className="dashboard-table">

                    <thead>

                      <tr>

                        <th>
                          Produtor
                        </th>

                        <th>
                          Núcleo
                        </th>

                        <th>
                          Produto
                        </th>

                        <th>
                          Quantidade
                        </th>

                        <th>
                          Preço unitário
                        </th>

                        <th>
                          Valor total
                        </th>

                        <th>
                          Disponibilidade
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {financeiroFiltrado.map(
                        (solicitacao) => (
                          <tr
                            key={
                              solicitacao.id
                            }
                          >

                            <td>

                              <strong className="produto-nome">
                                {
                                  solicitacao.nome_produtor
                                }
                              </strong>

                            </td>

                            <td>
                              {solicitacao.nucleo_produtivo ||
                                '-'}
                            </td>

                            <td>
                              {
                                solicitacao.nome_produto
                              }
                            </td>

                            <td>
                              {
                                solicitacao.quantidade_final
                              }
                            </td>

                            <td className="produto-preco">
                              {formatarPreco(
                                solicitacao.preco_final
                              )}
                            </td>

                            <td className="produto-preco">

                              <strong>
                                {formatarPreco(
                                  solicitacao.valor_total
                                )}
                              </strong>

                            </td>

                            <td>
                              {formatarData(
                                solicitacao.data_disponibilidade
                              )}
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </div>

            {financeiroFiltrado.length >
              0 && (
              <div className="financeiro-resumos">

                <div className="financeiro-resumo-card">

                  <h3>
                    Total por produtor
                  </h3>

                  {resumoProdutores.map(
                    (item) => (
                      <div
                        className="financeiro-resumo-linha"
                        key={
                          item.nome
                        }
                      >

                        <div className="financeiro-resumo-nome">

                          {
                            item.nome
                          }

                          <span className="financeiro-resumo-sub">
                            {
                              item.quantidade_ofertas
                            }{' '}
                            {item.quantidade_ofertas ===
                            1
                              ? 'oferta'
                              : 'ofertas'}
                          </span>

                        </div>

                        <strong className="financeiro-resumo-valor">
                          {formatarPreco(
                            item.valor_total
                          )}
                        </strong>

                      </div>
                    )
                  )}

                </div>

                <div className="financeiro-resumo-card">

                  <h3>
                    Total por núcleo
                  </h3>

                  {resumoNucleos.map(
                    (item) => (
                      <div
                        className="financeiro-resumo-linha"
                        key={
                          item.nome
                        }
                      >

                        <div className="financeiro-resumo-nome">

                          {
                            item.nome
                          }

                          <span className="financeiro-resumo-sub">
                            {
                              item.quantidade_ofertas
                            }{' '}
                            {item.quantidade_ofertas ===
                            1
                              ? 'oferta'
                              : 'ofertas'}
                          </span>

                        </div>

                        <strong className="financeiro-resumo-valor">
                          {formatarPreco(
                            item.valor_total
                          )}
                        </strong>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          </>
        )}

      </section>

    </LayoutSistema>
  )
}

export default RelatoriosAdmin