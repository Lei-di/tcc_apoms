import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

function PrimeiroAcesso() {
  const location = useLocation()
  const [cpf, setCpf] = useState(location.state?.cpf || '')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [ativado, setAtivado] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    try {
      await api.post('/auth/primeiro-acesso', { cpf, senha })
      setMensagem('Conta ativada com sucesso!')
      setAtivado(true)
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao ativar conta.')
    }
  }

  return (
    <div className="login-container">
      <h2>APOMS - Primeiro Acesso</h2>
      <p style={{ marginBottom: '1rem', color: '#555', textAlign: 'center' }}>
        Defina sua senha para ativar sua conta.
      </p>
      {!ativado ? (
        <form onSubmit={handleSubmit}>
            <input
            type="text"
            placeholder="CPF (somente números)"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="Nova senha (mínimo 6 caracteres)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            />
            {erro && <p className="erro">{erro}</p>}
            {mensagem && <p className="sucesso">{mensagem}</p>}
            <button type="submit">Ativar conta</button>
            <button type="button" onClick={() => navigate('/')}>Voltar ao login</button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p className="sucesso" style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>{mensagem}</p>
          <button onClick={() => navigate('/')}>Fazer login</button>
        </div>
      )}
    </div>
  )
}

export default PrimeiroAcesso