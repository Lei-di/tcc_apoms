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
    setErro('')

    try {
      const resposta = await api.post('/auth/login', {
        cpf,
        senha
      })

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
        navigate('/primeiro-acesso', {
          state: { cpf }
        })
      } else {
        setErro('CPF ou senha inválidos.')
      }
    }
  }

  return (
    <>
      <style>
        {`
          .login-page {
            width: 100%;
            min-height: 100vh;
            display: flex;
            background: #f5f7f6;
          }

          .login-brand {
            width: 42%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 70px;
            background: #1b5e20;
            color: white;
          }

          .login-brand-nome {
            margin-bottom: 35px;
          }

          .login-brand-nome strong {
            display: block;
            font-size: 32px;
            letter-spacing: 0.6px;
          }

          .login-brand-nome span {
            display: block;
            margin-top: 5px;
            color: rgba(255, 255, 255, 0.72);
            font-size: 14px;
          }

          .login-brand h1 {
            max-width: 470px;
            margin: 0 0 16px;
            color: white;
            font-size: 34px;
            line-height: 1.2;
          }

          .login-brand p {
            max-width: 460px;
            color: rgba(255, 255, 255, 0.72);
            font-size: 15px;
            line-height: 1.7;
          }

          .login-area {
            width: 58%;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }

          .login-box {
            width: 100%;
            max-width: 420px;
          }

          .login-box-header {
            margin-bottom: 28px;
          }

          .login-box-header h2 {
            margin: 0;
            color: #26332b;
            font-size: 27px;
            font-weight: 700;
          }

          .login-box-header p {
            margin-top: 8px;
            color: #7b8580;
            font-size: 14px;
          }

          .login-form {
            width: 100%;
            padding: 30px;
            background: white;
            border: 1px solid #e4e9e6;
            border-radius: 10px;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
          }

          .login-campo {
            display: flex;
            flex-direction: column;
            margin-bottom: 19px;
          }

          .login-campo label {
            margin-bottom: 7px;
            color: #4e5752;
            font-size: 13px;
            font-weight: 600;
          }

          .login-campo input {
            width: 100%;
            min-height: 46px;
            padding: 11px 13px;
            background: white;
            color: #333;
            border: 1px solid #d7ddd9;
            border-radius: 6px;
            font-size: 14px;
          }

          .login-campo input:focus {
            outline: none;
            border-color: #1b5e20;
            box-shadow: 0 0 0 3px rgba(27, 94, 32, 0.08);
          }

          .login-erro {
            margin: -5px 0 18px;
            padding: 10px 12px;
            background: #fceeee;
            color: #c62828;
            border-radius: 6px;
            font-size: 13px;
          }

          .login-btn {
            width: 100%;
            min-height: 46px;
            margin-top: 3px;
            background: #1b5e20;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }

          .login-btn:hover {
            background: #174f1b;
          }

          .login-rodape {
            margin-top: 20px;
            color: #8b938f;
            font-size: 12px;
            line-height: 1.5;
            text-align: center;
          }

          @media (max-width: 800px) {
            .login-page {
              flex-direction: column;
            }

            .login-brand {
              width: 100%;
              min-height: auto;
              padding: 35px 24px;
            }

            .login-brand-nome {
              margin-bottom: 20px;
            }

            .login-brand h1 {
              font-size: 25px;
            }

            .login-brand p {
              font-size: 13px;
            }

            .login-area {
              width: 100%;
              min-height: auto;
              padding: 35px 20px;
            }

            .login-form {
              padding: 24px;
            }
          }
        `}
      </style>

      <div className="login-page">

        <section className="login-brand">

          <div className="login-brand-nome">
            <strong>APOMS</strong>
            <span>Sistema de Gestão</span>
          </div>

          <h1>
            Gestão de produtos da agricultura orgânica
          </h1>

          <p>
            Acesse a plataforma para gerenciar informações,
            acompanhar solicitações e utilizar os recursos
            disponíveis no sistema.
          </p>

        </section>

        <main className="login-area">

          <div className="login-box">

            <div className="login-box-header">
              <h2>Acesso ao sistema</h2>

              <p>
                Informe suas credenciais para continuar.
              </p>
            </div>

            <form
              className="login-form"
              onSubmit={handleLogin}
            >

              <div className="login-campo">
                <label>CPF</label>

                <input
                  type="text"
                  placeholder="Digite seu CPF"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  required
                />
              </div>

              <div className="login-campo">
                <label>Senha</label>

                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>

              {erro && (
                <p className="login-erro">
                  {erro}
                </p>
              )}

              <button
                className="login-btn"
                type="submit"
              >
                Entrar
              </button>

            </form>

            <p className="login-rodape">
              Acesso destinado a produtores cadastrados
              e administradores da APOMS.
            </p>

          </div>

        </main>

      </div>
    </>
  )
}

export default Login