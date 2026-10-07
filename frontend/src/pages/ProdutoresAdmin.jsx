import { useEffect, useState } from 'react'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function ProdutoresAdmin() {
  const [produtores, setProdutores] = useState([])
  const [produtorSelecionado, setProdutorSelecionado] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const [novoProdutor, setNovoProdutor] = useState({
    cpf: '',
    nome: ''
  })

  useEffect(() => {
    buscarProdutores()
  }, [])

  const buscarProdutores = async () => {
    try {
      const resposta = await api.get('/admin/produtores')
      setProdutores(resposta.data)
    } catch (err) {
      console.error('Erro ao buscar produtores:', err)
    }
  }

  const validarCpf = (cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, '')

    if (cpfLimpo.length !== 11) {
      return false
    }

    if (/^(\d)\1{10}$/.test(cpfLimpo)) {
      return false
    }

    let soma = 0

    for (let i = 0; i < 9; i++) {
      soma += Number(cpfLimpo[i]) * (10 - i)
    }

    let primeiroDigito = (soma * 10) % 11

    if (primeiroDigito === 10) {
      primeiroDigito = 0
    }

    if (primeiroDigito !== Number(cpfLimpo[9])) {
      return false
    }

    soma = 0

    for (let i = 0; i < 10; i++) {
      soma += Number(cpfLimpo[i]) * (11 - i)
    }

    let segundoDigito = (soma * 10) % 11

    if (segundoDigito === 10) {
      segundoDigito = 0
    }

    return segundoDigito === Number(cpfLimpo[10])
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    setMensagem('')

    const cpf = novoProdutor.cpf.trim()
    const nome = novoProdutor.nome.trim()

    if (!validarCpf(cpf)) {
      setMensagem('CPF inválido.')
      return
    }

    if (!nome) {
      setMensagem(
        'Informe o nome completo do produtor.'
      )
      return
    }

    try {
      await api.post('/admin/produtores', {
        cpf,
        nome
      })

      setMensagem(
        'Produtor cadastrado com sucesso!'
      )

      setNovoProdutor({
        cpf: '',
        nome: ''
      })

      setMostrarFormulario(false)
      buscarProdutores()
    } catch (err) {
      if (err.response?.status === 400) {
        setMensagem(
          err.response?.data?.mensagem ||
          'Dados inválidos.'
        )
      } else if (err.response?.status === 409) {
        setMensagem('CPF já cadastrado.')
      } else {
        setMensagem(
          'Erro ao cadastrar produtor.'
        )
      }
    }
  }

  const selecionarProdutor = (produtor) => {
    setProdutorSelecionado(produtor)
    setMensagem('')
  }

  const fecharDetalhes = () => {
    setProdutorSelecionado(null)
  }

  const toggleAtivo = async () => {
    if (!produtorSelecionado) {
      return
    }

    try {
      const resposta = await api.patch(
        `/admin/produtores/${produtorSelecionado.cpf}/toggle`
      )

      const novoStatus = resposta.data.ativo

      setProdutorSelecionado({
        ...produtorSelecionado,
        ativo: novoStatus
      })

      setMensagem(
        novoStatus
          ? 'Acesso do produtor ativado com sucesso!'
          : 'Acesso do produtor desativado com sucesso!'
      )

      buscarProdutores()
    } catch (err) {
      setMensagem(
        'Erro ao atualizar status do produtor.'
      )
    }
  }

  const formatarCpf = (cpf) => {
    if (!cpf || cpf.length !== 11) {
      return cpf || '-'
    }

    return cpf.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    )
  }

  const formatarData = (data) => {
    if (!data) {
      return 'Não informado'
    }

    const somenteData = data.split('T')[0]
    const [ano, mes, dia] = somenteData.split('-')

    return `${dia}/${mes}/${ano}`
  }

  return (
    <LayoutSistema
      titulo="Produtores cadastrados"
      subtitulo="Gerencie os produtores cadastrados no sistema."
      paginaAtiva="admin-produtores"
      tipoUsuario="admin"
    >
      <section className="dashboard-content">

        <div className="page-header">

          <button
            className="btn-principal"
            type="button"
            onClick={() => {
              setMostrarFormulario(!mostrarFormulario)
              setProdutorSelecionado(null)
              setMensagem('')
            }}
          >
            <span className="btn-icone">
              {mostrarFormulario ? '×' : '+'}
            </span>

            {mostrarFormulario
              ? 'Cancelar'
              : 'Cadastrar produtor'}
          </button>

        </div>

        {mensagem && (
          <p
            className={`mensagem-pagina ${
              mensagem.includes('sucesso')
                ? 'sucesso'
                : 'erro'
            }`}
          >
            {mensagem}
          </p>
        )}

        {mostrarFormulario && (
          <div
            className="cadastro-card"
            style={{
              maxWidth: '100%',
              marginBottom: '25px'
            }}
          >

            <div
              className="edicao-titulo"
              style={{ marginBottom: '22px' }}
            >
              <h3>Pré-cadastrar produtor</h3>

              <p>
                Informe o CPF e o nome do produtor para liberar
                posteriormente o primeiro acesso ao sistema.
              </p>
            </div>

            <form
              className="cadastro-produto-form"
              onSubmit={handleCadastro}
            >

              <div className="campo">
                <label>CPF</label>

                <input
                  type="text"
                  placeholder="Somente números"
                  value={novoProdutor.cpf}
                  maxLength="11"
                  onChange={(e) =>
                    setNovoProdutor({
                      ...novoProdutor,
                      cpf:
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
                <label>Nome completo</label>

                <input
                  type="text"
                  placeholder="Nome do produtor"
                  value={novoProdutor.nome}
                  onChange={(e) =>
                    setNovoProdutor({
                      ...novoProdutor,
                      nome: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="acoes-form campo-grande">

                <button
                  className="btn-voltar"
                  type="button"
                  onClick={() =>
                    setMostrarFormulario(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  className="btn-principal"
                  type="submit"
                >
                  Cadastrar produtor
                </button>

              </div>

            </form>

          </div>
        )}

        {produtorSelecionado && (
          <div
            className="edicao-card"
            style={{
              maxWidth: '100%'
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '20px',
                marginBottom: '25px'
              }}
            >

              <div
                className="edicao-titulo"
                style={{ margin: 0 }}
              >
                <h3>Dados do produtor</h3>

                <p>
                  Consulte as informações cadastradas do produtor.
                </p>
              </div>

              <button
                className="btn-voltar"
                type="button"
                onClick={fecharDetalhes}
              >
                Fechar
              </button>

            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',
                gap: '22px'
              }}
            >

              <div className="campo">
                <label>CPF</label>

                <div style={campoInformacao}>
                  {formatarCpf(
                    produtorSelecionado.cpf
                  )}
                </div>
              </div>

              <div className="campo">
                <label>Nome completo</label>

                <div style={campoInformacao}>
                  {produtorSelecionado.nome ||
                    'Não informado'}
                </div>
              </div>

              <div className="campo">
                <label>Telefone</label>

                <div style={campoInformacao}>
                  {produtorSelecionado.telefone ||
                    'Não informado'}
                </div>
              </div>

              <div className="campo">
                <label>E-mail</label>

                <div style={campoInformacao}>
                  {produtorSelecionado.email ||
                    'Não informado'}
                </div>
              </div>

              <div className="campo">
                <label>
                  Cidade / Núcleo produtivo
                </label>

                <div style={campoInformacao}>
                  {produtorSelecionado.cidade ||
                    'Não informado'}
                </div>
              </div>

              <div
                className="campo"
                style={{
                  gridColumn: '1 / -1'
                }}
              >
                <label>Endereço de retirada</label>

                <div style={campoInformacao}>
                  {produtorSelecionado.endereco ||
                    'Não informado'}
                </div>
              </div>

              <div className="campo">
                <label>Status</label>

                <div
                  style={{
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <span
                    className={`status-badge ${
                      produtorSelecionado.ativo
                        ? 'status-aprovado'
                        : 'status-rejeitado'
                    }`}
                  >
                    {produtorSelecionado.ativo
                      ? 'Ativo'
                      : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="campo">
                <label>Ativo desde</label>

                <div style={campoInformacao}>
                  {produtorSelecionado.ativo
                    ? formatarData(
                        produtorSelecionado.data_ativacao
                      )
                    : 'Conta inativa'}
                </div>
              </div>

            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '25px'
              }}
            >
              <button
                type="button"
                className={
                  produtorSelecionado.ativo
                    ? 'btn-excluir'
                    : 'btn-editar'
                }
                onClick={toggleAtivo}
              >
                {produtorSelecionado.ativo
                  ? 'Desativar acesso'
                  : 'Ativar acesso'}
              </button>
            </div>

          </div>
        )}

        <div className="table-card">

          {produtores.length === 0 ? (
            <div className="estado-vazio">

              <h3>
                Nenhum produtor cadastrado
              </h3>

              <p>
                Ainda não existem produtores cadastrados.
              </p>

            </div>
          ) : (
            <div className="table-responsive">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>CPF</th>
                    <th>Nome completo</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {produtores.map((produtor) => (
                    <tr
                      key={produtor.cpf}
                      onClick={() =>
                        selecionarProdutor(produtor)
                      }
                      style={{
                        cursor: 'pointer',
                        backgroundColor:
                          produtorSelecionado?.cpf ===
                          produtor.cpf
                            ? '#f3f8f5'
                            : undefined
                      }}
                      title="Clique para visualizar os dados do produtor"
                    >

                      <td>
                        {formatarCpf(produtor.cpf)}
                      </td>

                      <td>
                        <strong className="produto-nome">
                          {produtor.nome || '-'}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            produtor.ativo
                              ? 'status-aprovado'
                              : 'status-rejeitado'
                          }`}
                        >
                          {produtor.ativo
                            ? 'Ativo'
                            : 'Inativo'}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          )}

        </div>

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

export default ProdutoresAdmin