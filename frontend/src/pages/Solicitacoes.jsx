import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([])
  const [listaProdutos, setListaProdutos] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [editando, setEditando] = useState(null)

  const [
    contraofertaSelecionada,
    setContraofertaSelecionada
  ] = useState(null)

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
    buscarListaProdutos()
  }, [])

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

  const buscarListaProdutos = async () => {
    try {
      const resposta =
        await api.get('/produtos/disponiveis')

      setListaProdutos(resposta.data)
    } catch (err) {
      console.error(
        'Erro ao buscar lista de produtos:',
        err
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const dados = {
      nome_produto: form.nome_produto,

      quantidade:
        `${form.quantidade} ${form.unidade}`,

      data_disponibilidade:
        form.data_disponibilidade,

      preco:
        parseFloat(form.preco),

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

  const iniciarEdicao = (solicitacao) => {
    const partes =
      solicitacao.quantidade.split(' ')

    setContraofertaSelecionada(null)

    setForm({
      nome_produto:
        solicitacao.nome_produto,

      quantidade:
        partes[0],

      unidade:
        partes.slice(1).join(' '),

      data_disponibilidade:
        solicitacao.data_disponibilidade
          ? solicitacao.data_disponibilidade.split('T')[0]
          : '',

      preco:
        solicitacao.preco,

      observacao_produtor:
        solicitacao.observacao_produtor ||
        ''
    })

    setMensagem('')
    setEditando(solicitacao.id)
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

    setContraofertaSelecionada(
      solicitacao
    )
  }

  const fecharContraoferta = () => {
    setContraofertaSelecionada(null)
  }

  const responderContraoferta = async (
    resposta
  ) => {
    if (!contraofertaSelecionada) {
      return
    }

    if (resposta === 'recusar') {
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

      if (resposta === 'aceitar') {
        setMensagem(
          'Contraoferta aceita com sucesso!'
        )
      } else {
        setMensagem(
          'Contraoferta recusada. A oferta foi encerrada.'
        )
      }

      setContraofertaSelecionada(null)

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
      return 'Contraoferta recebida'
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

  return (
    <LayoutSistema
      titulo="Minhas Solicitações"
      subtitulo="Acompanhe as ofertas enviadas para avaliação."
      paginaAtiva="solicitacoes"
    >
      <section className="dashboard-content">

        <div
          className="page-header"
          style={{
            justifyContent: 'flex-end'
          }}
        >

          <button
            className="btn-principal"
            type="button"
            onClick={() =>
              navigate('/cadastro')
            }
          >
            <span className="btn-icone">
              +
            </span>

            Nova oferta
          </button>

        </div>

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

        {contraofertaSelecionada && (
          <div
            className="edicao-card"
            style={{
              maxWidth: '100%'
            }}
          >

            <div className="edicao-titulo">

              <h3>
                Contraoferta recebida
              </h3>

              <p>
                Analise a proposta enviada pela APOMS antes de responder.
              </p>

            </div>

            <div
              className="cadastro-produto-form"
              style={{
                marginBottom: '22px'
              }}
            >

              <div className="campo">
                <label>Produto</label>

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

            <div className="acoes-form">

              <button
                className="btn-voltar"
                type="button"
                onClick={fecharContraoferta}
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
        )}

        {editando && (
          <div className="edicao-card">

            <div className="edicao-titulo">

              <h3>
                Editar solicitação
              </h3>

              <p>
                Altere os dados enquanto a oferta ainda estiver pendente.
              </p>

            </div>

            <form
              className="cadastro-produto-form"
              onSubmit={handleSubmit}
            >

              <div className="campo campo-grande">
                <label>Produto</label>

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
                        key={produto.id}
                        value={
                          produto.nome
                        }
                      >
                        {produto.nome}
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
                  value={form.quantidade}
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
                  value={form.unidade}
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
                  value={form.preco}
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
                  style={{
                    width: '100%',
                    padding: '12px',
                    border:
                      '1px solid #d7ddd9',
                    borderRadius:
                      '6px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    backgroundColor:
                      'transparent',
                    color: 'inherit'
                  }}
                />
              </div>

              <div className="acoes-form campo-grande">

                <button
                  className="btn-voltar"
                  type="button"
                  onClick={cancelarEdicao}
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
        )}

        <div className="table-card">

          {solicitacoes.length === 0 ? (
            <div className="estado-vazio">

              <h3>
                Nenhuma solicitação encontrada
              </h3>

              <p>
                Você ainda não enviou nenhuma oferta para avaliação.
              </p>

              <button
                className="btn-secundario"
                type="button"
                onClick={() =>
                  navigate('/cadastro')
                }
              >
                Cadastrar oferta
              </button>

            </div>
          ) : (
            <div className="table-responsive">

              <table className="dashboard-table solicitacoes-table">

                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                    <th>Disponibilidade</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th>Observação</th>
                    <th>Retorno</th>
                    <th>Contraoferta</th>
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
                              solicitacao.nome_produto
                            }
                          </strong>
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
                          {
                            solicitacao.observacao_produtor ||
                            '-'
                          }
                        </td>

                        <td>
                          {
                            solicitacao.observacao ||
                            '-'
                          }
                        </td>

                        <td>
                          {solicitacao.quantidade_contraoferta ||
                          solicitacao.preco_contraoferta ? (
                            <div>
                              <div>
                                Qtd.:{' '}
                                {
                                  solicitacao.quantidade_contraoferta
                                }
                              </div>

                              <div>
                                Preço:{' '}
                                {formatarPreco(
                                  solicitacao.preco_contraoferta
                                )}
                              </div>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>

                        <td>
                          {formatarData(
                            solicitacao.data_solicitacao
                          )}
                        </td>

                        <td>
                          <div className="acoes-tabela">

                            {solicitacao.status ===
                              'pendente' && (
                              <>
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
                              </>
                            )}

                            {solicitacao.status ===
                              'contraoferta' && (
                              <button
                                className="btn-editar"
                                type="button"
                                onClick={() =>
                                  abrirContraoferta(
                                    solicitacao
                                  )
                                }
                              >
                                Ver contraoferta
                              </button>
                            )}

                            {![
                              'pendente',
                              'contraoferta'
                            ].includes(
                              solicitacao.status
                            ) && (
                              <span className="sem-acao">
                                -
                              </span>
                            )}

                          </div>
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

const campoDestaque = {
  ...campoInformacao,
  background: '#fff8e8',
  color: '#8a5a00',
  border: '1px solid #eed8a6',
  fontWeight: '600'
}

export default Solicitacoes