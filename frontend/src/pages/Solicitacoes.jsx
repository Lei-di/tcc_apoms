import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([])
  const [listaProdutos, setListaProdutos] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [editando, setEditando] = useState(null)

  const [form, setForm] = useState({
    nome_produto: '',
    quantidade: '',
    unidade: '',
    data_disponibilidade: '',
    preco: ''
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
      navigate('/')
    }
  }

  const buscarListaProdutos = async () => {
    try {
      const resposta = await api.get('/produtos/disponiveis')
      setListaProdutos(resposta.data)
    } catch (err) {
      console.error('Erro ao buscar lista de produtos', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const dados = {
      nome_produto: form.nome_produto,
      quantidade: `${form.quantidade} ${form.unidade}`,
      data_disponibilidade: form.data_disponibilidade,
      preco: parseFloat(form.preco)
    }

    try {
      if (editando) {
        await api.put(`/solicitacoes/${editando}`, dados)
        setMensagem('Solicitação atualizada com sucesso!')
      } else {
        await api.post('/solicitacoes', dados)
        setMensagem('Solicitação enviada com sucesso!')
      }

      setForm({
        nome_produto: '',
        quantidade: '',
        unidade: '',
        data_disponibilidade: '',
        preco: ''
      })

      setMostrarFormulario(false)
      setEditando(null)

      buscarSolicitacoes()
    } catch (err) {
      setMensagem('Erro ao salvar solicitação.')
    }
  }

  const iniciarEdicao = (s) => {
    const partes = s.quantidade.split(' ')

    setForm({
      nome_produto: s.nome_produto,
      quantidade: partes[0],
      unidade: partes.slice(1).join(' '),
      data_disponibilidade: s.data_disponibilidade.split('T')[0],
      preco: s.preco
    })

    setEditando(s.id)
    setMostrarFormulario(true)
  }

  const excluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação?')) {
      return
    }

    try {
      await api.delete(`/solicitacoes/${id}`)
      buscarSolicitacoes()
    } catch (err) {
      alert('Erro ao excluir. A solicitação pode já ter sido avaliada.')
    }
  }

  const statusCor = (status) => {
    if (status === 'aprovado') {
      return {
        color: '#2e7d32',
        fontWeight: 'bold'
      }
    }

    if (status === 'rejeitado') {
      return {
        color: '#c62828',
        fontWeight: 'bold'
      }
    }

    return {
      color: '#e65100',
      fontWeight: 'bold'
    }
  }

  return (
    <div className="painel-container">

      <div className="painel-header">
        <h2>Minhas Solicitações</h2>

        <button onClick={() => navigate('/painel')}>
          Voltar ao painel
        </button>
      </div>

      <button
        onClick={() => {
          setMostrarFormulario(!mostrarFormulario)
          setEditando(null)

          setForm({
            nome_produto: '',
            quantidade: '',
            unidade: '',
            data_disponibilidade: '',
            preco: ''
          })
        }}
      >
        {mostrarFormulario ? 'Cancelar' : 'Nova solicitação'}
      </button>

      {mensagem && (
        <p className={mensagem.includes('sucesso') ? 'sucesso' : 'erro'}>
          {mensagem}
        </p>
      )}

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="form-inline">

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
            <option value="">
              Selecione o produto
            </option>

            {listaProdutos.map((p) => (
              <option key={p.id} value={p.nome}>
                {p.nome}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Quantidade"
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
            <option value="">
              Selecione a unidade
            </option>

            <option value="kg">kg</option>
            <option value="unidade">unidade</option>
            <option value="maço">maço</option>
            <option value="caixa">caixa</option>
            <option value="litro">litro</option>
            <option value="dúzia">dúzia</option>
          </select>

          <div>
            <label>
              Data de disponibilidade
            </label>

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

          <input
            type="number"
            placeholder="Preço (ex: 3.50)"
            value={form.preco}
            onChange={(e) =>
              setForm({
                ...form,
                preco: e.target.value
              })
            }
            step="0.01"
            min="0"
            required
          />

          <button type="submit">
            {editando
              ? 'Atualizar'
              : 'Enviar solicitação'}
          </button>

        </form>
      )}

      {solicitacoes.length === 0 ? (
        <p>Nenhuma solicitação encontrada.</p>
      ) : (
        <table>

          <thead>
            <tr>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Disponibilidade</th>
              <th>Preço</th>
              <th>Status</th>
              <th>Observação</th>
              <th>Data de envio</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>

          <tbody>
            {solicitacoes.map((s) => (
              <tr key={s.id}>

                <td>
                  {s.nome_produto}
                </td>

                <td>
                  {s.quantidade}
                </td>

                <td>
                  {s.data_disponibilidade
                    ? new Date(
                        s.data_disponibilidade
                      ).toLocaleDateString('pt-BR')
                    : '-'}
                </td>

                <td>
                  R$ {parseFloat(s.preco).toFixed(2)}
                </td>

                <td style={statusCor(s.status)}>
                  {s.status}
                </td>

                <td>
                  {s.observacao || '-'}
                </td>

                <td>
                  {s.data_solicitacao
                    ? new Date(
                        s.data_solicitacao
                      ).toLocaleDateString('pt-BR')
                    : '-'}
                </td>

                <td style={{ textAlign: 'center' }}>
                  {s.status === 'pendente' ? (
                    <>
                      <button
                        onClick={() => iniciarEdicao(s)}
                        style={{ marginRight: '6px' }}
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => excluir(s.id)}
                        className="btn-excluir"
                      >
                        Excluir
                      </button>
                    </>
                  ) : (
                    <span>-</span>
                  )}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  )
}

export default Solicitacoes