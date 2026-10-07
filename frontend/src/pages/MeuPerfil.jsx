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

  const [form, setForm] = useState({
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
      const resposta =
        await api.get('/produtores/me')

      setForm({
        cpf: resposta.data.cpf || '',
        nome: resposta.data.nome || '',
        telefone:
          resposta.data.telefone || '',
        email:
          resposta.data.email || '',
        cidade:
          resposta.data.cidade || '',
        endereco:
          resposta.data.endereco || ''
      })

      const completo =
        resposta.data.cadastro_completo

      setCadastroCompleto(completo)

      localStorage.setItem(
        'cadastroCompleto',
        String(completo)
      )
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

  const salvarPerfil = async (e) => {
    e.preventDefault()

    setMensagem('')
    setErro('')

    try {
      const resposta =
        await api.put(
          '/produtores/me',
          {
            nome: form.nome,
            telefone: form.telefone,
            email: form.email,
            cidade: form.cidade,
            endereco: form.endereco
          }
        )

      setForm({
        cpf: resposta.data.cpf || '',
        nome: resposta.data.nome || '',
        telefone:
          resposta.data.telefone || '',
        email:
          resposta.data.email || '',
        cidade:
          resposta.data.cidade || '',
        endereco:
          resposta.data.endereco || ''
      })

      setCadastroCompleto(true)

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
      subtitulo="Consulte e mantenha seus dados atualizados."
      paginaAtiva="perfil"
    >
      <section className="dashboard-content cadastro-produto-content">

        {!cadastroCompleto && (
          <div
            style={{
              marginBottom: '24px',
              padding: '15px 17px',
              background: '#fff4df',
              color: '#8a5a00',
              border:
                '1px solid #f0d8a8',
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: '1.5'
            }}
          >
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

        <div
          className="cadastro-card"
          style={{
            maxWidth: '900px'
          }}
        >

          <form
            className="cadastro-produto-form"
            onSubmit={salvarPerfil}
          >

            <div className="campo">
              <label>CPF</label>

              <input
                type="text"
                value={formatarCpf(
                  form.cpf
                )}
                readOnly
                style={{
                  backgroundColor:
                    '#f3f5f4',
                  cursor:
                    'not-allowed'
                }}
              />
            </div>

            <div className="campo">
              <label>Nome completo</label>

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
            </div>

            <div className="campo">
              <label>Telefone</label>

              <input
                type="text"
                placeholder="Ex: 67999999999"
                value={form.telefone}
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
            </div>

            <div className="campo">
              <label>E-mail</label>

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
            </div>

            <div className="campo campo-grande">
              <label>
                Cidade / Núcleo produtivo
              </label>

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
                      value={form.cidade}
                    >
                      {form.cidade}
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
            </div>

            <div className="campo campo-grande">
              <label>
                Endereço de retirada
              </label>

              <input
                type="text"
                placeholder="Informe o endereço para retirada dos produtos"
                value={form.endereco}
                onChange={(e) =>
                  setForm({
                    ...form,
                    endereco:
                      e.target.value
                  })
                }
                required
              />
            </div>

            <div className="acoes-form campo-grande">

              {cadastroCompleto && (
                <button
                  className="btn-voltar"
                  type="button"
                  onClick={() =>
                    navigate('/painel')
                  }
                >
                  Voltar ao painel
                </button>
              )}

              <button
                className="btn-principal"
                type="submit"
              >
                Salvar dados
              </button>

            </div>

          </form>

        </div>

        {cadastroCompleto &&
          mensagem && (
            <div
              style={{
                maxWidth: '900px',
                marginTop: '18px'
              }}
            >

              <button
                className="btn-secundario"
                type="button"
                onClick={() =>
                  navigate('/cadastro')
                }
              >
                Cadastrar uma oferta
              </button>

            </div>
          )}

      </section>
    </LayoutSistema>
  )
}

export default MeuPerfil