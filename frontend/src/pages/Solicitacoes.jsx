import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([])
  const [listaProdutos, setListaProdutos] = useState([])
  const [mensagem, setMensagem] = useState('')
  const [editando, setEditando] = useState(null)

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
      const resposta = await api.get('/solicitacoes/minhas')
      setSolicitacoes(resposta.data)
    } catch (err) {
      console.error('Erro ao buscar solicitações:', err)
      navigate('/')
    }
  }

  const buscarListaProdutos = async () => {
    try {
      const resposta = await api.get('/produtos/disponiveis')
      setListaProdutos(resposta.data)
    } catch (err) {
      console.error('Erro ao buscar lista de produtos:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const dados = {
      nome_produto: form.nome_produto,
      quantidade: `${form.quantidade} ${form.unidade}`,
      data_disponibilidade: form.data_disponibilidade,
      preco: parseFloat(form.preco),
      observacao_produtor: form.observacao_produtor
    }

    try {
      await api.put(`/solicitacoes/${editando}`, dados)

      setMensagem('Solicitação atualizada com sucesso!')

      cancelarEdicao()
      buscarSolicitacoes()
    } catch (err) {
      console.error('Erro ao atualizar solicitação:', err)
      setMensagem('Erro ao atualizar solicitação.')
    }
  }

  const iniciarEdicao = (solicitacao) => {
    const partes = solicitacao.quantidade.split(' ')

    setForm({
      nome_produto: solicitacao.nome_produto,
      quantidade: partes[0],
      unidade: partes.slice(1).join(' '),
      data_disponibilidade: solicitacao.data_disponibilidade
        ? solicitacao.data_disponibilidade.split('T')[0]
        : '',
      preco: solicitacao.preco,
      observacao_produtor: solicitacao.observacao_produtor || ''
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

  const excluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação?')) {
      return
    }

    try {
      await api.delete(`/solicitacoes/${id}`)

      setMensagem('Solicitação excluída com sucesso!')
      buscarSolicitacoes()
    } catch (err) {
      alert('Erro ao excluir. A solicitação pode já ter sido avaliada.')
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
      titulo="Minhas Solicitações"
      subtitulo="Acompanhe as ofertas enviadas para avaliação."
      paginaAtiva="solicitacoes"
    >
      <section className="dashboard-content">

        <div className="page-header">
          <div>
            <h2>Solicitações enviadas</h2>

            <p>
              Consulte o status das ofertas enviadas para a APOMS.
            </p>
          </div>

          <button
            className="btn-principal"
            type="button"
            onClick={() => navigate('/cadastro')}
          >
            <span className="btn-icone">+</span>
            Nova oferta
          </button>
        </div>

        {mensagem && (
          <p
            className={`mensagem-pagina ${
              mensagem.includes('sucesso') ? 'sucesso' : 'erro'
            }`}
          >
            {mensagem}
          </p>
        )}

        {editando && (
          <div className="edicao-card">

            <div className="edicao-titulo">
              <h3>Editar solicitação</h3>

              <p>
                Altere os dados necessários e envie novamente para avaliação.
              </p>
            </div>

            <form
              className="cadastro-produto-form"
              onSubmit={handleSubmit}
            >

              <div className="campo campo-grande">
                <label>Produto</label>

                <select
                  value={form.nome_produto}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nome_produto: e.target.value
                    })
                  }
                  required
                >
                  <option value="">Selecione o produto</option>

                  {listaProdutos.map((produto) => (
                    <option
                      key={produto.id}
                      value={produto.nome}
                    >
                      {produto.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label>Quantidade</label>

                <input
                  type="number"
                  value={form.quantidade}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantidade: e.target.value
                    })
                  }
                  min="1"
                  required
                />
              </div>

              <div className="campo">
                <label>Unidade de medida</label>

                <select
                  value={form.unidade}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unidade: e.target.value
                    })
                  }
                  required
                >
                  <option value="">Selecione a unidade</option>
                  <option value="kg">kg</option>
                  <option value="unidade">unidade</option>
                  <option value="maço">maço</option>
                  <option value="caixa">caixa</option>
                  <option value="litro">litro</option>
                  <option value="dúzia">dúzia</option>
                </select>
              </div>

              <div className="campo">
                <label>Disponibilidade</label>

                <input
                  type="date"
                  value={form.data_disponibilidade}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      data_disponibilidade: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="campo">
                <label>Preço (R$)</label>

                <input
                  type="number"
                  value={form.preco}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preco: e.target.value
                    })
                  }
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div className="campo campo-grande">
                <label>Observação</label>

                <textarea
                  placeholder="Adicione alguma informação importante sobre a oferta."
                  value={form.observacao_produtor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      observacao_produtor: e.target.value
                    })
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

              <div className="estado-vazio-icone">
                +
              </div>

              <h3>Nenhuma solicitação encontrada</h3>

              <p>
                Você ainda não enviou nenhuma oferta para avaliação.
              </p>

              <button
                className="btn-secundario"
                type="button"
                onClick={() => navigate('/cadastro')}
              >
                Cadastrar produto
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
                    <th>Data de envio</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {solicitacoes.map((solicitacao) => (
                    <tr key={solicitacao.id}>

                      <td>
                        <strong className="produto-nome">
                          {solicitacao.nome_produto}
                        </strong>
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
                        <span
                          className={`status-badge status-${solicitacao.status}`}
                        >
                          {formatarStatus(solicitacao.status)}
                        </span>
                      </td>

                      <td>
                        {solicitacao.observacao_produtor || '-'}
                      </td>

                      <td>
                        {solicitacao.observacao || '-'}
                      </td>

                      <td>
                        {formatarData(
                          solicitacao.data_solicitacao
                        )}
                      </td>

                      <td>
                        <div className="acoes-tabela">

                          {(solicitacao.status === 'pendente' ||
                            solicitacao.status === 'rejeitado') && (
                            <button
                              className="btn-editar"
                              type="button"
                              onClick={() =>
                                iniciarEdicao(solicitacao)
                              }
                            >
                              Editar
                            </button>
                          )}

                          {solicitacao.status === 'pendente' && (
                            <button
                              className="btn-excluir"
                              type="button"
                              onClick={() =>
                                excluir(solicitacao.id)
                              }
                            >
                              Excluir
                            </button>
                          )}

                          {solicitacao.status === 'aprovado' && (
                            <span className="sem-acao">
                              -
                            </span>
                          )}

                        </div>
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

export default Solicitacoes