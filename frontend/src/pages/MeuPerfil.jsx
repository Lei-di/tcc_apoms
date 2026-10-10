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
      subtitulo="Mantenha seus dados atualizados!!"
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
              border: '1px solid #f0d8a8',
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

          {!modoEdicao && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '22px'
              }}
            >
              <button
                className="btn-principal"
                type="button"
                onClick={iniciarEdicao}
              >
                Editar
              </button>
            </div>
          )}

          <form
            className="cadastro-produto-form"
            onSubmit={salvarPerfil}
          >

            <div className="campo">
              <label>CPF</label>

              {modoEdicao ? (
                <input
                  type="text"
                  value={formatarCpf(form.cpf)}
                  readOnly
                  style={{
                    backgroundColor: '#f3f5f4',
                    cursor: 'not-allowed'
                  }}
                />
              ) : (
                <div style={campoInformacao}>
                  {formatarCpf(form.cpf)}
                </div>
              )}
            </div>

            <div className="campo">
              <label>Nome completo</label>

              {modoEdicao ? (
                <input
                  type="text"
                  placeholder="Informe seu nome completo"
                  value={form.nome}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nome: e.target.value
                    })
                  }
                  required
                />
              ) : (
                <div style={campoInformacao}>
                  {form.nome || 'Não informado'}
                </div>
              )}
            </div>

            <div className="campo">
              <label>Telefone</label>

              {modoEdicao ? (
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
              ) : (
                <div style={campoInformacao}>
                  {formatarTelefone(form.telefone)}
                </div>
              )}
            </div>

            <div className="campo">
              <label>E-mail</label>

              {modoEdicao ? (
                <input
                  type="email"
                  placeholder="Ex: produtor@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value
                    })
                  }
                  required
                />
              ) : (
                <div style={campoInformacao}>
                  {form.email || 'Não informado'}
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
                      cidade: e.target.value
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
                      <option value={form.cidade}>
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
              ) : (
                <div style={campoInformacao}>
                  {form.cidade || 'Não informado'}
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
                  value={form.endereco}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      endereco: e.target.value
                    })
                  }
                  required
                />
              ) : (
                <div style={campoInformacao}>
                  {form.endereco || 'Não informado'}
                </div>
              )}
            </div>

            {modoEdicao && (
              <div className="acoes-form campo-grande">

                {cadastroCompleto && (
                  <button
                    className="btn-voltar"
                    type="button"
                    onClick={cancelarEdicao}
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

              </div>
            )}

          </form>

        </div>

        {!modoEdicao && (
          <div
            style={{
              maxWidth: '900px',
              marginTop: '18px',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <button
              className="btn-voltar"
              type="button"
              onClick={() =>
                navigate('/painel')
              }
            >
              Voltar ao painel
            </button>
          </div>
        )}

      </section>
    </LayoutSistema>
  )
}

const campoInformacao = {
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  padding: '10px 12px',
  background: '#f7f9f8',
  color: '#4e5752',
  border: '1px solid #e1e6e3',
  borderRadius: '6px',
  fontSize: '14px'
}

export default MeuPerfil