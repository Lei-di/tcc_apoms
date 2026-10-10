import { useState, useEffect } from 'react'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function PainelAdmin() {
  const [solicitacoes, setSolicitacoes] = useState([])
  const [mensagem, setMensagem] = useState('')

  const [avaliando, setAvaliando] = useState(null)
  const [statusAvaliacao, setStatusAvaliacao] = useState('')
  const [retorno, setRetorno] = useState('')

  const [quantidadeContraoferta, setQuantidadeContraoferta] =
    useState('')

  const [precoContraoferta, setPrecoContraoferta] =
    useState('')

  useEffect(() => {
    buscarSolicitacoes()
  }, [])

  const buscarSolicitacoes = async () => {
    try {
      const resposta =
        await api.get('/solicitacoes/todas')

      setSolicitacoes(resposta.data)
    } catch (err) {
      console.error(
        'Erro ao buscar solicitações:',
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

    if (status === 'contraoferta') {
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

    if (statusAvaliacao === 'contraoferta') {
      const quantidadeMudou =
        quantidadeContraoferta.trim() !==
        avaliando.quantidade

      const precoMudou =
        Number(precoContraoferta) !==
        Number(avaliando.preco)

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
          status: statusAvaliacao,
          observacao: retorno.trim(),

          quantidade_contraoferta:
            statusAvaliacao === 'contraoferta'
              ? quantidadeContraoferta.trim()
              : null,

          preco_contraoferta:
            statusAvaliacao === 'contraoferta'
              ? parseFloat(precoContraoferta)
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

      cancelarAvaliacao()
      buscarSolicitacoes()
    } catch (err) {
      console.error(
        'Erro ao avaliar solicitação:',
        err
      )

      setMensagem(
        err.response?.data?.mensagem ||
        'Erro ao avaliar solicitação.'
      )
    }
  }

  const formatarData = (data) => {
    if (!data) {
      return '-'
    }

    const somenteData = data.split('T')[0]

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

    if (
      status === 'contraoferta_aceita'
    ) {
      return 'Contraoferta aceita'
    }

    if (
      status === 'contraoferta_recusada'
    ) {
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

  const tituloAvaliacao = () => {
    if (statusAvaliacao === 'aprovado') {
      return 'Aprovar oferta'
    }

    if (
      statusAvaliacao === 'contraoferta'
    ) {
      return 'Enviar contraoferta'
    }

    return 'Rejeitar oferta'
  }

  return (
    <LayoutSistema
      titulo="Solicitações de Produto"
      subtitulo="Analise as ofertas enviadas pelos produtores."
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
                    {avaliando.quantidade}
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
                style={{
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
                }}
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
                onClick={cancelarAvaliacao}
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
                onClick={confirmarAvaliacao}
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

const campoInformacao = {
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  background: '#f7f9f8',
  color: '#4e5752',
  border: '1px solid #e1e6e3',
  borderRadius: '6px',
  fontSize: '14px'
}

export default PainelAdmin