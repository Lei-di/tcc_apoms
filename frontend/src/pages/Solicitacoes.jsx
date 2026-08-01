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
    nome_produto: '', quantidade: '', unidade: '', data_validade: '', preco: ''
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
      data_validade: form.data_validade,
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
      setForm({ nome_produto: '', quantidade: '', unidade: '', data_validade: '', preco: '' })
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
      data_validade: s.data_validade.split('T')[0],
      preco: s.preco
    })
    setEditando(s.id)
    setMostrarFormulario(true)
  }

  const excluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação?')) return
    try {
      await api.delete(`/solicitacoes/${id}`)
      buscarSolicitacoes()
    } catch (err) {
      alert('Erro ao excluir. A solicitação pode já ter sido avaliada.')
    }
  }

  const statusCor = (status) => {
    if (status === 'aprovado') return { color: '#2e7d32', fontWeight: 'bold' }
    if (status === 'rejeitado') return { color: '#c62828', fontWeight: 'bold' }
    return { color: '#e65100', fontWeight: 'bold' }
  }

  return (
    <div className="painel-container">
      <div className="painel-header">
        <h2>Minhas Solicitações</h2>
        <button onClick={() => navigate('/painel')}>Voltar ao painel</button>
      </div>

      <button onClick={() => { setMostrarFormulario(!mostrarFormulario); setEditando(null); setForm({ nome_produto: '', quantidade: '', unidade: '', data_validade: '', preco: '' }) }}>
        {mostrarFormulario ? 'Cancelar' : 'Nova solicitação'}
      </button>

      {mensagem && <p className={mensagem.includes('sucesso') ? 'sucesso' : 'erro'}>{mensagem}</p>}

      {mostrarFormulario && (
        <form onSubmit={handleSubmit} className="form-inline">
          <select value={form.nome_produto} onChange={(e) => setForm({ ...form, nome_produto: e.target.value })} required>
            <option value="">Selecione o produto</option>
            {listaProdutos.map((p) => (
              <option key={p.id} value={p.nome}>{p.nome}</option>
            ))}
          </select>
          <input type="number" placeholder="Quantidade" value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} min="1" required />
          <select value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })} required>
            <option value="">Selecione a unidade</option>
            <option value="kg">kg</option>
            <option value="unidade">unidade</option>
            <option value="maço">maço</option>
            <option value="caixa">caixa</option>
            <option value="litro">litro</option>
            <option value="dúzia">dúzia</option>
          </select>
          <div>
            <label>Validade</label>
            <input type="date" value={form.data_validade} onChange={(e) => setForm({ ...form, data_validade: e.target.value })} required />
          </div>
          <input type="number" placeholder="Preço (ex: 3.50)" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} step="0.01" min="0" required />
          <button type="submit">{editando ? 'Atualizar' : 'Enviar solicitação'}</button>
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
              <th>Validade</th>
              <th>Preço</th>
              <th>Status</th>
              <th>Observação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {solicitacoes.map((s) => (
              <tr key={s.id}>
                <td>{s.nome_produto}</td>
                <td>{s.quantidade}</td>
                <td>{new Date(s.data_validade).toLocaleDateString('pt-BR')}</td>
                <td>R$ {parseFloat(s.preco).toFixed(2)}</td>
                <td style={statusCor(s.status)}>{s.status}</td>
                <td>{s.observacao || '-'}</td>
                <td>
                  {s.status === 'pendente' && (
                    <>
                      <button onClick={() => iniciarEdicao(s)} style={{ marginRight: '6px' }}>Editar</button>
                      <button onClick={() => excluir(s.id)} className="btn-excluir">Excluir</button>
                    </>
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