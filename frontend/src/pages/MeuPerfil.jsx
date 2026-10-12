import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function MeuPerfil() {
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [cadastroCompleto, setCadastroCompleto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)

  const [form, setForm] = useState({
    cpf: '',
    nome: '',
    telefone: '',
    email: '',
    cidade: '',
    endereco: ''
  })

  const [dadosOriginais, setDadosOriginais] = useState({
    cpf: '',
    nome: '',
    telefone: '',
    email: '',
    cidade: '',
    endereco: ''
  })

  const nucleosProdutivos = [
    'Caarapó',
    'Dourados',
    'Glória de Dourados',
    'Itaquiraí',
    'Ivinhema',
    'Mundo Novo',
    'Nioaque',
    'Ponta Porã',
    'Rio Brilhante',
    'Terenos'
  ]

  useEffect(() => {
    buscarPerfil()
  }, [])

  const buscarPerfil = async () => {
    try {
      const resposta = await api.get('/produtores/me')

      const dados = {
        cpf: resposta.data.cpf || '',
        nome: resposta.data.nome || '',
        telefone: resposta.data.telefone || '',
        email: resposta.data.email || '',
        cidade: resposta.data.cidade || '',
        endereco: resposta.data.endereco || ''
      }

      setForm(dados)
      setDadosOriginais(dados)

      const completo = resposta.data.cadastro_completo

      setCadastroCompleto(completo)

      localStorage.setItem(
        'cadastroCompleto',
        String(completo)
      )

      if (!completo) {
        setModoEdicao(true)
      }
    } catch (err) {
      console.error(
        'Erro ao buscar perfil:',
        err
      )

      setErro(
        'Não foi possível carregar seus dados.'
      )
    } finally {
      setCarregando(false)
    }
  }

  const iniciarEdicao = () => {
    setDadosOriginais({
      ...form
    })

    setMensagem('')
    setErro('')
    setModoEdicao(true)
  }

  const cancelarEdicao = () => {
    setForm({
      ...dadosOriginais
    })

    setMensagem('')
    setErro('')
    setModoEdicao(false)
  }

  const salvarPerfil = async (e) => {
    e.preventDefault()

    setMensagem('')
    setErro('')

    try {
      const resposta = await api.put(
        '/produtores/me',
        {
          nome: form.nome,
          telefone: form.telefone,
          email: form.email,
          cidade: form.cidade,
          endereco: form.endereco
        }
      )

      const dadosAtualizados = {
        cpf: resposta.data.cpf || '',
        nome: resposta.data.nome || '',
        telefone: resposta.data.telefone || '',
        email: resposta.data.email || '',
        cidade: resposta.data.cidade || '',
        endereco: resposta.data.endereco || ''
      }

      setForm(dadosAtualizados)
      setDadosOriginais(dadosAtualizados)

      setCadastroCompleto(true)
      setModoEdicao(false)

      localStorage.setItem(
        'cadastroCompleto',
        'true'
      )

      localStorage.setItem(
        'nome',
        resposta.data.nome
      )

      setMensagem(
        'Dados atualizados com sucesso!'
      )
    } catch (err) {
      setErro(
        err.response?.data?.mensagem ||
        'Erro ao atualizar seus dados.'
      )
    }
  }

  const formatarCpf = (cpf) => {
    if (!cpf || cpf.length !== 11) {
      return cpf
    }

    return cpf.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    )
  }

  const formatarTelefone = (telefone) => {
    if (!telefone) {
      return 'Não informado'
    }

    if (telefone.length === 11) {
      return telefone.replace(
        /(\d{2})(\d{5})(\d{4})/,
        '($1) $2-$3'
      )
    }

    if (telefone.length === 10) {
      return telefone.replace(
        /(\d{2})(\d{4})(\d{4})/,
        '($1) $2-$3'
      )
    }

    return telefone
  }

  if (carregando) {
    return (
      <LayoutSistema
        titulo="Meu perfil"
        subtitulo="Consulte e mantenha seus dados atualizados."
        paginaAtiva="perfil"
      >
        <section className="dashboard-content">

          <div className="estado-vazio">
            <h3>
              Carregando seus dados...
            </h3>
          </div>

        </section>
      </LayoutSistema>
    )
  }

  return (
    <LayoutSistema
      titulo="Meu perfil"
      subtitulo="Mantenha seus dados atualizados."
      paginaAtiva="perfil"
    >
      <style>
        {`
          .perfil-page {
            padding-top: 18px;
            padding-bottom: 18px;
          }

          .perfil-page .cadastro-card {
            width: 100%;
            max-width: 900px;
            padding: 20px 22px;

            background: #f0f5f0;

            border: 1px solid #8fb995;
            border-radius: 10px;

            box-shadow:
              0 2px 7px rgba(27, 94, 32, 0.05);
          }

          .perfil-page .cadastro-produto-form {
            gap: 14px 18px;
          }

          .perfil-page .campo label {
            margin-bottom: 5px;
            color: #304b34;
            font-size: 13px;
            font-weight: 600;
          }

          .perfil-page .campo input,
          .perfil-page .campo select {
            min-height: 40px;
            padding-top: 8px;
            padding-bottom: 8px;

            background: #ffffff;
            border-color: #91ad95;
          }

          .perfil-page .campo input:focus,
          .perfil-page .campo select:focus {
            outline: none;
            border-color: #1b5e20;

            box-shadow:
              0 0 0 2px rgba(27, 94, 32, 0.08);
          }

          .perfil-page .campo input[readonly] {
            background: #eef2ef;
            color: #687169;
            border-color: #afbeb1;
          }

          .perfil-informacao {
            min-height: 40px;
            display: flex;
            align-items: center;
            padding: 8px 12px;

            background: #ffffff;
            color: #3f4e42;

            border: 1px solid #91ad95;
            border-radius: 6px;

            font-size: 14px;
          }

          .perfil-acoes {
            margin-top: 0;
            padding-top: 12px;

            border-top:
              1px solid rgba(27, 94, 32, 0.18);
          }

          .perfil-page .btn-principal {
            background: #1b5e20;
          }

          .perfil-page .btn-principal:hover {
            background: #174f1b;
          }

          .perfil-page .btn-cancelar-perfil {
            min-width: 100px;

            background: #ffffff;
            color: #4b594d;

            border:
              1px solid #91aa95;

            font-size: 13px;
            font-weight: 600;
          }

          .perfil-page .btn-cancelar-perfil:hover {
            background: #f5f8f5;
            color: #304533;
            border-color: #778f7b;
          }

          .perfil-page .btn-editar-perfil {
            min-width: 100px;
          }

          @media (max-height: 750px) and (min-width: 701px) {
            .perfil-page {
              padding-top: 12px;
              padding-bottom: 12px;
            }

            .perfil-page .cadastro-card {
              padding: 16px 20px;
            }

            .perfil-page .cadastro-produto-form {
              gap: 10px 16px;
            }

            .perfil-page .campo input,
            .perfil-page .campo select,
            .perfil-informacao {
              min-height: 38px;
            }
          }

          @media (max-width: 700px) {
            .perfil-page {
              padding-top: 18px;
              padding-bottom: 35px;
            }
          }
        `}
      </style>

      <section className="dashboard-content cadastro-produto-content perfil-page">

        {!cadastroCompleto && (
          <div style={avisoCadastro}>
            <strong>
              Complete seu cadastro para continuar.
            </strong>

            <div
              style={{
                marginTop: '4px'
              }}
            >
              Antes de enviar sua primeira oferta,
              informe seus dados de contato e retirada.
            </div>
          </div>
        )}

        {mensagem && (
          <p className="mensagem-pagina sucesso">
            {mensagem}
          </p>
        )}

        {erro && (
          <p className="mensagem-pagina erro">
            {erro}
          </p>
        )}

        <div className="cadastro-card">

          <form
            className="cadastro-produto-form"
            onSubmit={salvarPerfil}
          >

            <div className="campo">

              <label>
                CPF
              </label>

              {modoEdicao ? (
                <input
                  type="text"
                  value={
                    formatarCpf(
                      form.cpf
                    )
                  }
                  readOnly
                />
              ) : (
                <div className="perfil-informacao">
                  {formatarCpf(
                    form.cpf
                  )}
                </div>
              )}

            </div>

            <div className="campo">

              <label>
                Nome completo
              </label>

              {modoEdicao ? (
                <input
                  type="text"
                  placeholder="Informe seu nome completo"
                  value={form.nome}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nome:
                        e.target.value
                    })
                  }
                  required
                />
              ) : (
                <div className="perfil-informacao">
                  {form.nome ||
                    'Não informado'}
                </div>
              )}

            </div>

            <div className="campo">

              <label>
                Telefone
              </label>

              {modoEdicao ? (
                <input
                  type="text"
                  placeholder="Ex: 67999999999"
                  value={
                    form.telefone
                  }
                  maxLength="11"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      telefone:
                        e.target.value.replace(
                          /\D/g,
                          ''
                        )
                    })
                  }
                  required
                />
              ) : (
                <div className="perfil-informacao">
                  {formatarTelefone(
                    form.telefone
                  )}
                </div>
              )}

            </div>

            <div className="campo">

              <label>
                E-mail
              </label>

              {modoEdicao ? (
                <input
                  type="email"
                  placeholder="Ex: produtor@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email:
                        e.target.value
                    })
                  }
                  required
                />
              ) : (
                <div className="perfil-informacao">
                  {form.email ||
                    'Não informado'}
                </div>
              )}

            </div>

            <div className="campo campo-grande">

              <label>
                Núcleo produtivo
              </label>

              {modoEdicao ? (
                <select
                  value={form.cidade}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cidade:
                        e.target.value
                    })
                  }
                  required
                >
                  <option value="">
                    Selecione seu núcleo produtivo
                  </option>

                  {form.cidade &&
                    !nucleosProdutivos.includes(
                      form.cidade
                    ) && (
                      <option
                        value={
                          form.cidade
                        }
                      >
                        {
                          form.cidade
                        }
                      </option>
                    )}

                  {nucleosProdutivos.map(
                    (nucleo) => (
                      <option
                        key={nucleo}
                        value={nucleo}
                      >
                        {nucleo}
                      </option>
                    )
                  )}

                </select>
              ) : (
                <div className="perfil-informacao">
                  {form.cidade ||
                    'Não informado'}
                </div>
              )}

            </div>

            <div className="campo campo-grande">

              <label>
                Endereço de retirada
              </label>

              {modoEdicao ? (
                <input
                  type="text"
                  placeholder="Informe o endereço para retirada dos produtos"
                  value={
                    form.endereco
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endereco:
                        e.target.value
                    })
                  }
                  required
                />
              ) : (
                <div className="perfil-informacao">
                  {form.endereco ||
                    'Não informado'}
                </div>
              )}

            </div>

            <div className="acoes-form campo-grande perfil-acoes">

              {modoEdicao ? (
                <>
                  {cadastroCompleto && (
                    <button
                      className="btn-cancelar-perfil"
                      type="button"
                      onClick={
                        cancelarEdicao
                      }
                    >
                      Cancelar
                    </button>
                  )}

                  <button
                    className="btn-principal"
                    type="submit"
                  >
                    {cadastroCompleto
                      ? 'Salvar alterações'
                      : 'Salvar dados'}
                  </button>
                </>
              ) : (
                <button
                  className="btn-principal btn-editar-perfil"
                  type="button"
                  onClick={
                    iniciarEdicao
                  }
                >
                  Editar
                </button>
              )}

            </div>

          </form>

        </div>

      </section>

    </LayoutSistema>
  )
}

const avisoCadastro = {
  width: '100%',
  maxWidth: '900px',
  marginBottom: '18px',
  padding: '13px 16px',
  background: '#fff4df',
  color: '#8a5a00',
  border:
    '1px solid #f0d8a8',
  borderRadius: '8px',
  fontSize: '13px',
  lineHeight: '1.5'
}

export default MeuPerfil