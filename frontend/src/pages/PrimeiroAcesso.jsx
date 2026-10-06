import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'

function PrimeiroAcesso() {
  const location = useLocation()
  const navigate = useNavigate()

  const [cpf, setCpf] = useState(location.state?.cpf || '')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [ativado, setAtivado] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setErro('')
    setMensagem('')

    if (cpf.length !== 11) {
      setErro('Informe um CPF válido com 11 números.')
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    try {
      await api.post('/auth/primeiro-acesso', {
        cpf,
        senha
      })

      setMensagem('Conta ativada com sucesso!')
      setAtivado(true)
    } catch (err) {
      setErro(
        err.response?.data?.mensagem ||
        'Erro ao ativar conta.'
      )
    }
  }

  return (
    <>
      <style>
        {`
          .primeiro-page {
            width: 100%;
            min-height: 100vh;
            display: flex;
            background: #f5f7f6;
          }

          .primeiro-brand {
            width: 42%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 70px;
            background: #1b5e20;
            color: white;
          }

          .primeiro-brand-nome {
            margin-bottom: 35px;
          }

          .primeiro-brand-nome strong {
            display: block;
            font-size: 32px;
            letter-spacing: 0.6px;
          }

          .primeiro-brand-nome span {
            display: block;
            margin-top: 5px;
            color: rgba(255, 255, 255, 0.72);
            font-size: 14px;
          }

          .primeiro-brand h1 {
            max-width: 470px;
            margin: 0 0 16px;
            color: white;
            font-size: 34px;
            line-height: 1.2;
          }

          .primeiro-brand p {
            max-width: 460px;
            color: rgba(255, 255, 255, 0.72);
            font-size: 15px;
            line-height: 1.7;
          }

          .primeiro-area {
            width: 58%;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }

          .primeiro-box {
            width: 100%;
            max-width: 440px;
          }

          .primeiro-header {
            margin-bottom: 28px;
          }

          .primeiro-header h2 {
            margin: 0;
            color: #26332b;
            font-size: 27px;
            font-weight: 700;
          }

          .primeiro-header p {
            margin-top: 8px;
            color: #7b8580;
            font-size: 14px;
            line-height: 1.5;
          }

          .primeiro-form {
            width: 100%;
            padding: 30px;
            background: white;
            border: 1px solid #e4e9e6;
            border-radius: 10px;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
          }

          .primeiro-campo {
            display: flex;
            flex-direction: column;
            margin-bottom: 19px;
          }

          .primeiro-campo label {
            margin-bottom: 7px;
            color: #4e5752;
            font-size: 13px;
            font-weight: 600;
          }

          .primeiro-campo input {
            width: 100%;
            min-height: 46px;
            padding: 11px 13px;
            background: white;
            color: #333;
            border: 1px solid #d7ddd9;
            border-radius: 6px;
            font-size: 14px;
          }

          .primeiro-campo input:focus {
            outline: none;
            border-color: #1b5e20;
            box-shadow: 0 0 0 3px rgba(27, 94, 32, 0.08);
          }

          .primeiro-erro {
            margin-bottom: 18px;
            padding: 10px 12px;
            background: #fceeee;
            color: #c62828;
            border-radius: 6px;
            font-size: 13px;
            line-height: 1.5;
          }

          .primeiro-sucesso {
            padding: 18px;
            background: #edf7f0;
            color: #23713e;
            border-radius: 7px;
            font-size: 14px;
            text-align: center;
          }

          .primeiro-btn {
            width: 100%;
            min-height: 46px;
            background: #1b5e20;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }

          .primeiro-btn:hover {
            background: #174f1b;
          }

          .primeiro-voltar {
            width: 100%;
            min-height: 44px;
            margin-top: 12px;
            background: white;
            color: #4e5752;
            border: 1px solid #d7ddd9;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }

          .primeiro-voltar:hover {
            background: #f5f7f6;
            color: #26332b;
          }

          .primeiro-ajuda {
            margin-top: 18px;
            color: #8b938f;
            font-size: 12px;
            line-height: 1.5;
            text-align: center;
          }

          @media (max-width: 800px) {
            .primeiro-page {
              flex-direction: column;
            }

            .primeiro-brand {
              width: 100%;
              min-height: auto;
              padding: 35px 24px;
            }

            .primeiro-brand-nome {
              margin-bottom: 20px;
            }

            .primeiro-brand h1 {
              font-size: 25px;
            }

            .primeiro-brand p {
              font-size: 13px;
            }

            .primeiro-area {
              width: 100%;
              min-height: auto;
              padding: 35px 20px;
            }

            .primeiro-form {
              padding: 24px;
            }
          }
        `}
      </style>

      <div className="primeiro-page">

        <section className="primeiro-brand">

          <div className="primeiro-brand-nome">
            <strong>APOMS</strong>
            <span>Sistema de Gestão</span>
          </div>

          <h1>
            Primeiro acesso
          </h1>

          <p>
            Crie sua senha para ativar sua conta e acessar
            o sistema de gestão da APOMS.
          </p>

        </section>

        <main className="primeiro-area">

          <div className="primeiro-box">

            <div className="primeiro-header">
              <h2>Ativar minha conta</h2>

              <p>
                Informe o CPF previamente cadastrado pela APOMS
                e defina sua senha de acesso.
              </p>
            </div>

            {!ativado ? (
              <form
                className="primeiro-form"
                onSubmit={handleSubmit}
              >

                <div className="primeiro-campo">
                  <label>CPF</label>

                  <input
                    type="text"
                    placeholder="Digite seu CPF"
                    value={cpf}
                    maxLength="11"
                    onChange={(e) =>
                      setCpf(e.target.value.replace(/\D/g, ''))
                    }
                    required
                  />
                </div>

                <div className="primeiro-campo">
                  <label>Nova senha</label>

                  <input
                    type="password"
                    placeholder="Mínimo de 6 caracteres"
                    value={senha}
                    onChange={(e) =>
                      setSenha(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="primeiro-campo">
                  <label>Confirmar senha</label>

                  <input
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={confirmarSenha}
                    onChange={(e) =>
                      setConfirmarSenha(e.target.value)
                    }
                    required
                  />
                </div>

                {erro && (
                  <p className="primeiro-erro">
                    {erro}
                  </p>
                )}

                <button
                  className="primeiro-btn"
                  type="submit"
                >
                  Ativar conta
                </button>

                <button
                  className="primeiro-voltar"
                  type="button"
                  onClick={() => navigate('/')}
                >
                  Voltar ao login
                </button>

              </form>
            ) : (
              <div className="primeiro-form">

                <div className="primeiro-sucesso">
                  {mensagem}
                </div>

                <button
                  className="primeiro-btn"
                  type="button"
                  style={{ marginTop: '20px' }}
                  onClick={() => navigate('/')}
                >
                  Fazer login
                </button>

              </div>
            )}

          </div>

        </main>

      </div>
    </>
  )
}

export default PrimeiroAcesso