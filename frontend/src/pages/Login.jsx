import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Login() {
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const resposta = await api.post('/auth/login', { cpf, senha })
      localStorage.setItem('token', resposta.data.token)
      localStorage.setItem('nome', resposta.data.nome)
      localStorage.setItem('tipo', resposta.data.tipo)
      if (resposta.data.tipo === 'admin') {
        navigate('/admin')
      } else {
        navigate('/painel')
      }
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/primeiro-acesso', { state: { cpf } })
      } else {
        setErro('CPF ou senha inválidos.')
      }
    }
  }

  return (
    <div className="login-container">
      <h2>APOMS - Área do Produtor</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="CPF (somente números)"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        {erro && <p className="erro">{erro}</p>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}

export default Login