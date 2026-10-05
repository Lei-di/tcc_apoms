import { useState, useEffect } from 'react'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function PainelAdmin() {
  const [solicitacoes, setSolicitacoes] = useState([])
  const [mensagem, setMensagem] = useState('')

  const [avaliando, setAvaliando] = useState(null)
  const [statusAvaliacao, setStatusAvaliacao] = useState('')
  const [retorno, setRetorno] = useState('')

  useEffect(() => {
    buscarSolicitacoes()
  }, [])

  const buscarSolicitacoes = async () => {
    try {
      const resposta = await api.get('/solicitacoes/todas')
      setSolicitacoes(resposta.data)
    } catch (err) {
      console.error('Erro ao buscar solicitações:', err)
    }
  }

  const iniciarAvaliacao = (solicitacao, status) => {
    setAvaliando(solicitacao)
    setStatusAvaliacao(status)
    setRetorno('')
    setMensagem('')
  }

  const cancelarAvaliacao = () => {
    setAvaliando(null)
    setStatusAvaliacao('')
    setRetorno('')
  }

  const confirmarAvaliacao = async () => {
    if (
      statusAvaliacao === 'rejeitado' &&
      retorno.trim() === ''
    ) {
      setMensagem('Informe o motivo da rejeição.')
      return
    }

    try {
      await api.patch(
        `/solicitacoes/${avaliando.id}/avaliar`,
        {
          status: statusAvaliacao,
          observacao: retorno.trim() || null
        }
      )

      if (statusAvaliacao === 'aprovado') {
        setMensagem('Solicitação aprovada com sucesso!')
      } else {
        setMensagem('Solicitação rejeitada com sucesso!')
      }

      cancelarAvaliacao()
      buscarSolicitacoes()
    } catch (err) {
      console.error('Erro ao avaliar solicitação:', err)
      setMensagem('Erro ao avaliar solicitação.')
    }
  }

  const formatarData = (data) => {
    if (!data) {
      return '-'
    }

    const somenteData = data.split('T')[0]
    const [ano, mes, dia] = somenteData.split('-')

    return `${dia}/${mes}/${ano}`
  }

  const formatarPreco = (preco) => {
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
              mensagem.includes('Informe')
                ? 'erro'
                : 'sucesso'
            }`}
          >
            {mensagem}
          </p>
        )}

        {avaliando && (
          <div className="edicao-card">

            <div className="edicao-titulo">
              <h3>
                {statusAvaliacao === 'aprovado'
                  ? 'Aprovar solicitação'
                  : 'Rejeitar solicitação'}
              </h3>

              <p>
                {avaliando.nome_produtor} - {avaliando.nome_produto}
              </p>
            </div>

            <div className="campo campo-grande">
              <label>Retorno</label>

              <textarea
                value={retorno}
                onChange={(e) => setRetorno(e.target.value)}
                placeholder={
                  statusAvaliacao === 'rejeitado'
                    ? 'Informe o motivo da rejeição.'
                    : 'Adicione uma informação para o produtor, se necessário.'
                }
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d7ddd9',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  backgroundColor: 'transparent',
                  color: 'inherit'
                }}
              />
            </div>

            <div
              className="acoes-form"
              style={{ marginTop: '20px' }}
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
                  statusAvaliacao === 'aprovado'
                    ? 'btn-principal'
                    : 'btn-excluir'
                }
                type="button"
                onClick={confirmarAvaliacao}
              >
                {statusAvaliacao === 'aprovado'
                  ? 'Confirmar aprovação'
                  : 'Confirmar rejeição'}
              </button>
            </div>

          </div>
        )}

        <div className="table-card">

          {solicitacoes.length === 0 ? (
            <div className="estado-vazio">

              <h3>Nenhuma solicitação encontrada</h3>

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
                    <th>Data de envio</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {solicitacoes.map((solicitacao) => (
                    <tr key={solicitacao.id}>

                      <td>
                        <strong className="produto-nome">
                          {solicitacao.nome_produtor}
                        </strong>
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
                        {formatarPreco(solicitacao.preco)}
                      </td>

                      <td>
                        {solicitacao.observacao_produtor || '-'}
                      </td>

                      <td>
                        <span
                          className={`status-badge status-${solicitacao.status}`}
                        >
                          {formatarStatus(solicitacao.status)}
                        </span>
                      </td>

                      <td>
                        {formatarData(
                          solicitacao.data_solicitacao
                        )}
                      </td>

                      <td>
                        {solicitacao.status === 'pendente' ? (
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
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>

      </section>
    </LayoutSistema>
  )
}

export default PainelAdmin