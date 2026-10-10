import { useState, useEffect } from 'react'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function PainelAdmin() {
  const [solicitacoes, setSolicitacoes] = useState([])
  const [
    solicitacoesProdutos,
    setSolicitacoesProdutos
  ] = useState([])

  const [mensagem, setMensagem] = useState('')

  const [avaliando, setAvaliando] = useState(null)
  const [statusAvaliacao, setStatusAvaliacao] = useState('')
  const [retorno, setRetorno] = useState('')

  const [
    quantidadeContraoferta,
    setQuantidadeContraoferta
  ] = useState('')

  const [
    precoContraoferta,
    setPrecoContraoferta
  ] = useState('')

  const [
    avaliandoProduto,
    setAvaliandoProduto
  ] = useState(null)

  const [
    statusProduto,
    setStatusProduto
  ] = useState('')

  const [
    nomeProdutoAprovado,
    setNomeProdutoAprovado
  ] = useState('')

  const [
    retornoProduto,
    setRetornoProduto
  ] = useState('')

  useEffect(() => {
    buscarSolicitacoes()
    buscarSolicitacoesProdutos()
  }, [])

  useEffect(() => {
    if (avaliandoProduto) {
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
  }, [avaliandoProduto])

  const buscarSolicitacoes = async () => {
    try {
      const resposta =
        await api.get(
          '/solicitacoes/todas'
        )

      setSolicitacoes(
        resposta.data
      )
    } catch (err) {
      console.error(
        'Erro ao buscar solicitações:',
        err
      )
    }
  }

  const buscarSolicitacoesProdutos =
    async () => {
      try {
        const resposta =
          await api.get(
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

  const iniciarAvaliacao = (
    solicitacao,
    status
  ) => {
    setAvaliando(solicitacao)
    setStatusAvaliacao(status)
    setRetorno('')
    setMensagem('')

    if (
      status ===
      'contraoferta'
    ) {
      setQuantidadeContraoferta(
        solicitacao.quantidade
      )

      setPrecoContraoferta(
        solicitacao.preco
      )
    } else {
      setQuantidadeContraoferta('')
      setPrecoContraoferta('')
    }
  }

  const cancelarAvaliacao = () => {
    setAvaliando(null)
    setStatusAvaliacao('')
    setRetorno('')
    setQuantidadeContraoferta('')
    setPrecoContraoferta('')
  }

  const confirmarAvaliacao = async () => {
    if (!retorno.trim()) {
      setMensagem(
        'Informe um comentário para a avaliação.'
      )

      return
    }

    if (
      statusAvaliacao ===
      'contraoferta'
    ) {
      const quantidadeMudou =
        quantidadeContraoferta.trim() !==
        avaliando.quantidade

      const precoMudou =
        Number(
          precoContraoferta
        ) !==
        Number(
          avaliando.preco
        )

      if (
        !quantidadeMudou &&
        !precoMudou
      ) {
        setMensagem(
          'Altere o preço ou a quantidade para enviar a contraoferta.'
        )

        return
      }
    }

    try {
      await api.patch(
        `/solicitacoes/${avaliando.id}/avaliar`,
        {
          status:
            statusAvaliacao,

          observacao:
            retorno.trim(),

          quantidade_contraoferta:
            statusAvaliacao ===
            'contraoferta'
              ? quantidadeContraoferta.trim()
              : null,

          preco_contraoferta:
            statusAvaliacao ===
            'contraoferta'
              ? parseFloat(
                  precoContraoferta
                )
              : null
        }
      )

      if (
        statusAvaliacao ===
        'aprovado'
      ) {
        setMensagem(
          'Oferta aprovada com sucesso!'
        )
      }

      if (
        statusAvaliacao ===
        'rejeitado'
      ) {
        setMensagem(
          'Oferta rejeitada com sucesso!'
        )
      }

      if (
        statusAvaliacao ===
        'contraoferta'
      ) {
        setMensagem(
          'Contraoferta enviada ao produtor!'
        )
      }

      cancelarAvaliacao()
      buscarSolicitacoes()
    } catch (err) {
      console.error(
        'Erro ao avaliar solicitação:',
        err
      )

      setMensagem(
        `Erro: ${
          err.response?.data?.mensagem ||
          'Erro ao avaliar solicitação.'
        }`
      )
    }
  }

  const iniciarAvaliacaoProduto = (
    solicitacao,
    status
  ) => {
    setAvaliandoProduto(
      solicitacao
    )

    setStatusProduto(
      status
    )

    setNomeProdutoAprovado(
      solicitacao.nome_produto
    )

    setRetornoProduto('')
    setMensagem('')
  }

  const cancelarAvaliacaoProduto = () => {
    setAvaliandoProduto(null)
    setStatusProduto('')
    setNomeProdutoAprovado('')
    setRetornoProduto('')
  }

  const confirmarAvaliacaoProduto =
    async () => {
      if (
        statusProduto === 'aprovado' &&
        !nomeProdutoAprovado.trim()
      ) {
        setMensagem(
          'Informe o nome do produto.'
        )

        return
      }

      if (
        statusProduto === 'rejeitado' &&
        !retornoProduto.trim()
      ) {
        setMensagem(
          'Informe o motivo da rejeição.'
        )

        return
      }

      try {
        await api.patch(
          `/produtos/solicitacoes/${avaliandoProduto.id}/avaliar`,
          {
            status:
              statusProduto,

            nome_produto_aprovado:
              statusProduto ===
              'aprovado'
                ? nomeProdutoAprovado.trim()
                : null,

            retorno_admin:
              retornoProduto.trim()
          }
        )

        if (
          statusProduto ===
          'aprovado'
        ) {
          setMensagem(
            'Solicitação aprovada e produto incluído no catálogo!'
          )
        } else {
          setMensagem(
            'Solicitação de produto rejeitada.'
          )
        }

        cancelarAvaliacaoProduto()
        buscarSolicitacoesProdutos()
      } catch (err) {
        console.error(
          'Erro ao avaliar solicitação de produto:',
          err
        )

        setMensagem(
          `Erro: ${
            err.response?.data?.mensagem ||
            'Erro ao avaliar solicitação de produto.'
          }`
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

    if (
      status ===
      'contraoferta'
    ) {
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

  const tituloAvaliacao = () => {
    if (
      statusAvaliacao ===
      'aprovado'
    ) {
      return 'Aprovar oferta'
    }

    if (
      statusAvaliacao ===
      'contraoferta'
    ) {
      return 'Enviar contraoferta'
    }

    return 'Rejeitar oferta'
  }

  return (
    <LayoutSistema
      titulo="Solicitações"
      subtitulo="Analise as ofertas e solicitações enviadas pelos produtores."
      paginaAtiva="admin-solicitacoes"
      tipoUsuario="admin"
    >
      <section className="dashboard-content">

        {mensagem && (
          <p
            className={`mensagem-pagina ${
              mensagem.includes('Erro') ||
              mensagem.includes('Informe') ||
              mensagem.includes('Altere')
                ? 'erro'
                : 'sucesso'
            }`}
          >
            {mensagem}
          </p>
        )}

        {/* Avaliação de inclusão de produto */}
        {avaliandoProduto && (
          <div
            style={modalOverlay}
            onClick={
              cancelarAvaliacaoProduto
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
                    {statusProduto ===
                    'aprovado'
                      ? 'Aprovar inclusão de produto'
                      : 'Rejeitar inclusão de produto'}
                  </h3>

                  <p style={modalDescricao}>
                    Solicitação enviada por{' '}
                    <strong>
                      {
                        avaliandoProduto.nome_produtor
                      }
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  style={botaoFecharModal}
                  onClick={
                    cancelarAvaliacaoProduto
                  }
                >
                  ×
                </button>

              </div>

              <div className="campo">

                <label>
                  Produto solicitado
                </label>

                <div style={campoInformacao}>
                  {
                    avaliandoProduto.nome_produto
                  }
                </div>

              </div>

              {avaliandoProduto.observacao_produtor && (
                <div
                  className="campo"
                  style={{
                    marginTop: '18px'
                  }}
                >
                  <label>
                    Observação do produtor
                  </label>

                  <div style={campoInformacao}>
                    {
                      avaliandoProduto.observacao_produtor
                    }
                  </div>
                </div>
              )}

              {statusProduto ===
                'aprovado' && (
                <div
                  className="campo"
                  style={{
                    marginTop: '18px'
                  }}
                >
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
                  marginTop: '18px'
                }}
              >
                <label>
                  {statusProduto ===
                  'rejeitado'
                    ? 'Motivo da rejeição'
                    : 'Retorno ao produtor'}
                </label>

                <textarea
                  value={
                    retornoProduto
                  }
                  onChange={(e) =>
                    setRetornoProduto(
                      e.target.value
                    )
                  }
                  placeholder={
                    statusProduto ===
                    'rejeitado'
                      ? 'Informe o motivo da rejeição.'
                      : 'Opcional. Informe uma observação sobre a aprovação.'
                  }
                  rows="4"
                  style={textareaStyle}
                />
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
                    cancelarAvaliacaoProduto
                  }
                >
                  Cancelar
                </button>

                <button
                  className={
                    statusProduto ===
                    'rejeitado'
                      ? 'btn-excluir'
                      : 'btn-principal'
                  }
                  type="button"
                  onClick={
                    confirmarAvaliacaoProduto
                  }
                >
                  {statusProduto ===
                  'aprovado'
                    ? 'Aprovar e incluir'
                    : 'Confirmar rejeição'}
                </button>

              </div>

            </div>

          </div>
        )}

        {/* Solicitações de inclusão */}
        <div style={tituloSecao}>

          <h2>
            Solicitações de inclusão de produtos
          </h2>

          <p>
            Avalie pedidos de produtos que ainda não fazem parte do catálogo.
          </p>

        </div>

        <div
          className="table-card"
          style={{
            marginBottom: '34px'
          }}
        >

          {solicitacoesProdutos.length ===
          0 ? (
            <div style={estadoVazioMenor}>
              Nenhuma solicitação de inclusão de produto.
            </div>
          ) : (
            <div className="table-responsive">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>Produtor</th>
                    <th>Produto solicitado</th>
                    <th>Observação</th>
                    <th>Status</th>
                    <th>Produto no catálogo</th>
                    <th>Retorno</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {solicitacoesProdutos.map(
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
                          {
                            solicitacao.nome_produto
                          }
                        </td>

                        <td>
                          {
                            solicitacao.observacao_produtor ||
                            '-'
                          }
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
                          {
                            solicitacao.nome_produto_aprovado ||
                            '-'
                          }
                        </td>

                        <td>
                          {
                            solicitacao.retorno_admin ||
                            '-'
                          }
                        </td>

                        <td>
                          {formatarData(
                            solicitacao.data_solicitacao
                          )}
                        </td>

                        <td>
                          {solicitacao.status ===
                          'pendente' ? (
                            <div className="acoes-tabela">

                              <button
                                className="btn-editar"
                                type="button"
                                onClick={() =>
                                  iniciarAvaliacaoProduto(
                                    solicitacao,
                                    'aprovado'
                                  )
                                }
                              >
                                Aprovar
                              </button>

                              <button
                                className="btn-excluir"
                                type="button"
                                onClick={() =>
                                  iniciarAvaliacaoProduto(
                                    solicitacao,
                                    'rejeitado'
                                  )
                                }
                              >
                                Rejeitar
                              </button>

                            </div>
                          ) : (
                            <span className="sem-acao">
                              -
                            </span>
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

        {/* Solicitações de ofertas */}
        <div style={tituloSecao}>

          <h2>
            Solicitações de ofertas
          </h2>

          <p>
            Analise as ofertas enviadas pelos produtores.
          </p>

        </div>

        {avaliando && (
          <div
            className="edicao-card"
            style={{
              maxWidth: '100%'
            }}
          >

            <div className="edicao-titulo">

              <h3>
                {tituloAvaliacao()}
              </h3>

              <p>
                {avaliando.nome_produtor}
                {' — '}
                {avaliando.nome_produto}
              </p>

            </div>

            {statusAvaliacao ===
              'contraoferta' && (
              <div
                className="cadastro-produto-form"
                style={{
                  marginBottom: '22px'
                }}
              >

                <div className="campo">
                  <label>
                    Quantidade atual
                  </label>

                  <div style={campoInformacao}>
                    {
                      avaliando.quantidade
                    }
                  </div>
                </div>

                <div className="campo">
                  <label>
                    Quantidade proposta
                  </label>

                  <input
                    type="text"
                    value={
                      quantidadeContraoferta
                    }
                    onChange={(e) =>
                      setQuantidadeContraoferta(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div className="campo">
                  <label>
                    Preço atual
                  </label>

                  <div style={campoInformacao}>
                    {formatarPreco(
                      avaliando.preco
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
                    required
                  />
                </div>

              </div>
            )}

            <div className="campo campo-grande">
              <label>
                Comentário da avaliação
              </label>

              <textarea
                value={retorno}
                onChange={(e) =>
                  setRetorno(
                    e.target.value
                  )
                }
                placeholder={
                  statusAvaliacao ===
                  'contraoferta'
                    ? 'Explique o motivo da contraoferta.'
                    : 'Informe um comentário sobre a avaliação.'
                }
                rows="4"
                style={textareaStyle}
              />
            </div>

            <div
              className="acoes-form"
              style={{
                marginTop: '20px'
              }}
            >

              <button
                className="btn-voltar"
                type="button"
                onClick={
                  cancelarAvaliacao
                }
              >
                Cancelar
              </button>

              <button
                className={
                  statusAvaliacao ===
                  'rejeitado'
                    ? 'btn-excluir'
                    : 'btn-principal'
                }
                type="button"
                onClick={
                  confirmarAvaliacao
                }
              >
                {statusAvaliacao ===
                'aprovado'
                  ? 'Confirmar aprovação'
                  : statusAvaliacao ===
                    'contraoferta'
                    ? 'Enviar contraoferta'
                    : 'Confirmar rejeição'}
              </button>

            </div>

          </div>
        )}

        <div className="table-card">

          {solicitacoes.length === 0 ? (
            <div className="estado-vazio">

              <h3>
                Nenhuma solicitação encontrada
              </h3>

              <p>
                Ainda não existem ofertas enviadas para avaliação.
              </p>

            </div>
          ) : (
            <div className="table-responsive">

              <table className="dashboard-table solicitacoes-table">

                <thead>
                  <tr>
                    <th>Produtor</th>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Disponibilidade</th>
                    <th>Preço</th>
                    <th>Observação</th>
                    <th>Status</th>
                    <th>Retorno APOMS</th>
                    <th>Data de envio</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {solicitacoes.map(
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
                          {
                            solicitacao.observacao_produtor ||
                            '-'
                          }
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
                          <div>
                            {
                              solicitacao.observacao ||
                              '-'
                            }
                          </div>

                          {solicitacao.quantidade_contraoferta && (
                            <small
                              style={{
                                display:
                                  'block',
                                marginTop:
                                  '6px'
                              }}
                            >
                              Quantidade proposta:{' '}
                              {
                                solicitacao.quantidade_contraoferta
                              }
                            </small>
                          )}

                          {solicitacao.preco_contraoferta && (
                            <small
                              style={{
                                display:
                                  'block',
                                marginTop:
                                  '3px'
                              }}
                            >
                              Preço proposto:{' '}
                              {formatarPreco(
                                solicitacao.preco_contraoferta
                              )}
                            </small>
                          )}
                        </td>

                        <td>
                          {formatarData(
                            solicitacao.data_solicitacao
                          )}
                        </td>

                        <td>
                          {solicitacao.status ===
                          'pendente' ? (
                            <div className="acoes-tabela">

                              <button
                                className="btn-editar"
                                type="button"
                                onClick={() =>
                                  iniciarAvaliacao(
                                    solicitacao,
                                    'aprovado'
                                  )
                                }
                              >
                                Aprovar
                              </button>

                              <button
                                className="btn-voltar"
                                type="button"
                                onClick={() =>
                                  iniciarAvaliacao(
                                    solicitacao,
                                    'contraoferta'
                                  )
                                }
                              >
                                Contraoferta
                              </button>

                              <button
                                className="btn-excluir"
                                type="button"
                                onClick={() =>
                                  iniciarAvaliacao(
                                    solicitacao,
                                    'rejeitado'
                                  )
                                }
                              >
                                Rejeitar
                              </button>

                            </div>
                          ) : (
                            <span className="sem-acao">
                              -
                            </span>
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

      </section>
    </LayoutSistema>
  )
}

const tituloSecao = {
  marginBottom: '14px'
}

const estadoVazioMenor = {
  minHeight: '130px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '25px',
  color: '#8a938e',
  fontSize: '13px'
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
  maxWidth: '650px',
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
  fontSize: '20px'
}

const modalDescricao = {
  marginTop: '6px',
  color: '#7b8580',
  fontSize: '13px'
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

export default PainelAdmin