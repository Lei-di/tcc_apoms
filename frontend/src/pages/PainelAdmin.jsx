import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function PainelAdmin() {
  const [produtores, setProdutores] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [novoProdutor, setNovoProdutor] = useState({
    cpf: '', nome: '', telefone: '', email: '', cidade: '', endereco: ''
  })
  const navigate = useNavigate()
  const nome = localStorage.getItem('nome')

  useEffect(() => {
    buscarProdutores()
  }, [])

  const buscarProdutores = async () => {
    try {
      const resposta = await api.get('/admin/produtores')
      setProdutores(resposta.data)
    } catch (err) {
      navigate('/')
    }
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/produtores', novoProdutor)
      setMensagem('Produtor cadastrado com sucesso!')
      setNovoProdutor({ cpf: '', nome: '', telefone: '', email: '', cidade: '', endereco: '' })
      setMostrarFormulario(false)
      buscarProdutores()
    } catch (err) {
      if (err.response?.status === 409) {
        setMensagem('CPF já cadastrado.')
      } else {
        setMensagem('Erro ao cadastrar produtor.')
      }
    }
  }

  const toggleAtivo = async (cpf) => {
    try {
      await api.patch(`/admin/produtores/${cpf}/toggle`)
      buscarProdutores()
    } catch (err) {
      alert('Erro ao atualizar status do produtor.')
    }
  }

  const sair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nome')
    localStorage.removeItem('tipo')
    navigate('/')
  }

  return (
    <div className="painel-container">
      <div className="painel-header">
        <h2>Olá, {nome}!</h2>
        <button onClick={sair}>Sair</button>
      </div>

      <h3>Gerenciar Produtores</h3>
      <button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
        {mostrarFormulario ? 'Cancelar' : 'Cadastrar novo produtor'}
      </button>

      {mensagem && <p className={mensagem.includes('sucesso') ? 'sucesso' : 'erro'}>{mensagem}</p>}

      {mostrarFormulario && (
        <form onSubmit={handleCadastro} className="form-inline">
          <input type="text" placeholder="CPF (somente números)" value={novoProdutor.cpf} onChange={(e) => setNovoProdutor({ ...novoProdutor, cpf: e.target.value })} required />
          <input type="text" placeholder="Nome completo" value={novoProdutor.nome} onChange={(e) => setNovoProdutor({ ...novoProdutor, nome: e.target.value })} required />
          <input type="text" placeholder="Telefone" value={novoProdutor.telefone} onChange={(e) => setNovoProdutor({ ...novoProdutor, telefone: e.target.value })} />
          <input type="email" placeholder="E-mail" value={novoProdutor.email} onChange={(e) => setNovoProdutor({ ...novoProdutor, email: e.target.value })} />
          <input type="text" placeholder="Cidade" value={novoProdutor.cidade} onChange={(e) => setNovoProdutor({ ...novoProdutor, cidade: e.target.value })} />
          <input type="text" placeholder="Endereço" value={novoProdutor.endereco} onChange={(e) => setNovoProdutor({ ...novoProdutor, endereco: e.target.value })} />
          <button type="submit">Salvar</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>CPF</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Cidade</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtores.map((p) => (
            <tr key={p.cpf}>
              <td>{p.cpf}</td>
              <td>{p.nome}</td>
              <td>{p.telefone}</td>
              <td>{p.cidade}</td>
              <td>{p.ativo ? 'Ativo' : 'Inativo'}</td>
              <td>
                <button
                  onClick={() => toggleAtivo(p.cpf)}
                  className={p.ativo ? 'btn-excluir' : 'btn-ativar'}
                >
                  {p.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PainelAdmin