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

  useEffect(() => {
    const overflowAnterior =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    return () => {
      document.body.style.overflow =
        overflowAnterior
    }
  }, [])

  const buscarProdutores = async () => {
    try {
      const resposta = await api.get(
        '/admin/produtores'
      )

      setProdutores(
        resposta.data
      )
    } catch (err) {
      console.error(
        'Erro ao buscar produtores:',
        err
      )
    }
  }

  const validarCpf = (cpf) => {
    const cpfLimpo =
      cpf.replace(/\D/g, '')

    if (
      cpfLimpo.length !== 11
    ) {
      return false
    }

    if (
      /^(\d)\1{10}$/.test(
        cpfLimpo
      )
    ) {
      return false
    }

    let soma = 0

    for (
      let i = 0;
      i < 9;
      i++
    ) {
      soma +=
        Number(cpfLimpo[i]) *
        (10 - i)
    }

    let primeiroDigito =
      (soma * 10) % 11

    if (
      primeiroDigito === 10
    ) {
      primeiroDigito = 0
    }

    if (
      primeiroDigito !==
      Number(cpfLimpo[9])
    ) {
      return false
    }

    soma = 0

    for (
      let i = 0;
      i < 10;
      i++
    ) {
      soma +=
        Number(cpfLimpo[i]) *
        (11 - i)
    }

    let segundoDigito =
      (soma * 10) % 11

    if (
      segundoDigito === 10
    ) {
      segundoDigito = 0
    }

    return (
      segundoDigito ===
      Number(cpfLimpo[10])
    )
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    setMensagem('')

    const cpf =
      novoProdutor.cpf.trim()

    const nome =
      novoProdutor.nome.trim()

    if (!validarCpf(cpf)) {
      setMensagem(
        'CPF inválido.'
      )

      return
    }

    if (!nome) {
      setMensagem(
        'Informe o nome completo do produtor.'
      )

      return
    }

    try {
      await api.post(
        '/admin/produtores',
        {
          cpf,
          nome
        }
      )

      setMensagem(
        'Produtor cadastrado com sucesso!'
      )

      setNovoProdutor({
        cpf: '',
        nome: ''
      })

      setMostrarFormulario(
        false
      )

      buscarProdutores()
    } catch (err) {
      if (
        err.response?.status === 400
      ) {
        setMensagem(
          err.response?.data?.mensagem ||
          'Dados inválidos.'
        )
      } else if (
        err.response?.status === 409
      ) {
        setMensagem(
          'CPF já cadastrado.'
        )
      } else {
        setMensagem(
          'Erro ao cadastrar produtor.'
        )
      }
    }
  }

  const selecionarProdutor = (
    produtor
  ) => {
    setProdutorSelecionado(
      produtor
    )

    setMensagem('')
  }

  const fecharDetalhes = () => {
    setProdutorSelecionado(
      null
    )
  }

  const toggleAtivo = async () => {
    if (!produtorSelecionado) {
      return
    }

    try {
      const resposta =
        await api.patch(
          `/admin/produtores/${produtorSelecionado.cpf}/toggle`
        )

      const novoStatus =
        resposta.data.ativo

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
    if (
      !cpf ||
      cpf.length !== 11
    ) {
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

    const somenteData =
      data.split('T')[0]

    const [
      ano,
      mes,
      dia
    ] =
      somenteData.split('-')

    return `${dia}/${mes}/${ano}`
  }

  return (
    <LayoutSistema
      titulo="Produtores cadastrados"
      subtitulo="Gerencie os produtores cadastrados no sistema."
      paginaAtiva="admin-produtores"
      tipoUsuario="admin"
    >
      <style>
        {`
          .produtores-admin-page {
            width: 100%;
            height: calc(100vh - 90px);

            min-height: 0;

            display: flex;
            flex-direction: column;

            padding: 26px 36px 28px;

            overflow: hidden;
          }

          .produtores-admin-page
          .page-header,
          .produtores-admin-page
          .mensagem-pagina,
          .produtores-admin-formulario,
          .produtores-admin-detalhes {
            flex-shrink: 0;
          }

          .produtores-admin-formulario,
          .produtores-admin-detalhes {
            width: 100%;

            max-width:
              900px !important;
          }

          /* Formulário */

          .produtores-admin-formulario {
            margin-bottom: 20px;

            padding:
              20px 22px !important;

            background:
              #f0f5f0 !important;

            border:
              1px solid #8fb995 !important;

            border-radius:
              10px !important;

            box-shadow:
              0 2px 7px
              rgba(27, 94, 32, 0.05) !important;
          }

          .produtores-admin-formulario
          .cadastro-produto-form {
            gap: 14px 18px;
          }

          .produtores-admin-formulario
          .campo label {
            margin-bottom: 5px;

            color: #304b34;

            font-size: 13px;
            font-weight: 600;
          }

          .produtores-admin-formulario
          .campo input {
            min-height: 40px;

            padding:
              8px 12px;

            background: #ffffff;

            border:
              1px solid #91ad95;
          }

          .produtores-admin-formulario
          .acoes-form {
            margin-top: 0;

            padding-top: 12px;

            border-top:
              1px solid
              rgba(27, 94, 32, 0.18);
          }

          .btn-cancelar-admin {
            min-width: 100px;

            min-height: 40px;

            padding: 8px 15px;

            background: #ffffff;

            color: #4b594d;

            border:
              1px solid #91aa95;

            border-radius: 6px;

            font-size: 13px;
            font-weight: 600;

            cursor: pointer;
          }

          /* Painel de detalhes */

          .produtores-admin-detalhes {
            margin-bottom: 20px;

            padding:
              20px 22px !important;

            background:
              #f0f5f0 !important;

            border:
              1px solid #8fb995 !important;

            border-radius:
              10px !important;

            box-shadow:
              0 2px 7px
              rgba(27, 94, 32, 0.05) !important;
          }

          /* Painel da lista */

          .produtores-admin-lista {
            flex: 1;

            min-height: 0;

            display: flex;
            flex-direction: column;

            overflow: hidden;

            background: #f0f5f0;

            border: 1px solid #8fb995;

            border-radius: 10px;

            box-shadow:
              0 2px 7px
              rgba(27, 94, 32, 0.05);
          }

          .produtores-admin-scroll {
            width: 100%;
            flex: 1;

            min-height: 0;

            overflow-y: scroll;
            overflow-x: auto;
          }

          .produtores-admin-scroll
          .dashboard-table {
            width: 100%;

            margin: 0;

            background: transparent;
          }

          .produtores-admin-scroll
          .dashboard-table thead {
            position: sticky;

            top: 0;

            z-index: 10;
          }

          .produtores-admin-scroll
          .dashboard-table th {
            position: sticky;

            top: 0;

            z-index: 10;

            padding: 16px 20px;

            background: #f0f5f0;

            color: #304b34;

            border-bottom:
              1px solid #b7cfba;
          }

          .produtores-admin-scroll
          .dashboard-table td {
            padding: 17px 20px;

            background: #ffffff;

            border-bottom:
              1px solid #dce6dd;
          }

          .produtores-admin-scroll
          .dashboard-table tr:last-child td {
            border-bottom: none;
          }

          .produtores-admin-scroll
          .dashboard-table tbody tr:hover td {
            background: #f8fbf8;
          }

          .produtores-admin-scroll::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }

          .produtores-admin-scroll::-webkit-scrollbar-track {
            background: #e8efe9;
          }

          .produtores-admin-scroll::-webkit-scrollbar-thumb {
            background: #a7bbaa;

            border:
              2px solid #e8efe9;

            border-radius: 10px;
          }

          .produtores-admin-scroll::-webkit-scrollbar-thumb:hover {
            background: #879d8b;
          }

          @media (max-width: 1000px) {
            .produtores-admin-page {
              padding: 24px;
            }
          }

          @media (max-width: 700px) {
            body {
              overflow: auto !important;
            }

            .produtores-admin-page {
              height: auto;

              min-height:
                calc(100vh - 75px);

              padding:
                22px 16px 35px;

              overflow: visible;
            }

            .produtores-admin-formulario,
            .produtores-admin-detalhes {
              max-width:
                none !important;
            }

            .produtores-admin-formulario
            .cadastro-produto-form {
              grid-template-columns:
                1fr;
            }

            .produtores-admin-formulario
            .acoes-form {
              flex-direction:
                column-reverse;
            }

            .produtores-admin-formulario
            .acoes-form button {
              width: 100%;
            }

            .produtores-admin-lista {
              min-height: 450px;
            }

            .produtores-admin-scroll {
              max-height: 500px;
            }
          }
        `}
      </style>

      <section className="dashboard-content produtores-admin-page">

        <div className="page-header">

          <button
            className="btn-principal"
            type="button"
            onClick={() => {
              setMostrarFormulario(
                !mostrarFormulario
              )

              setProdutorSelecionado(
                null
              )

              setMensagem('')
            }}
          >

            <span className="btn-icone">
              {mostrarFormulario
                ? '×'
                : '+'}
            </span>

            {mostrarFormulario
              ? 'Cancelar'
              : 'Cadastrar produtor'}

          </button>

        </div>

        {mensagem && (
          <p
            className={`mensagem-pagina ${
              mensagem.includes(
                'sucesso'
              )
                ? 'sucesso'
                : 'erro'
            }`}
          >
            {mensagem}
          </p>
        )}

        {mostrarFormulario && (
          <div className="cadastro-card produtores-admin-formulario">

            <form
              className="cadastro-produto-form"
              onSubmit={
                handleCadastro
              }
            >

              <div className="campo">

                <label>
                  CPF
                </label>

                <input
                  type="text"
                  placeholder="Somente números"
                  value={
                    novoProdutor.cpf
                  }
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

                <label>
                  Nome completo
                </label>

                <input
                  type="text"
                  placeholder="Nome do produtor"
                  value={
                    novoProdutor.nome
                  }
                  onChange={(e) =>
                    setNovoProdutor({
                      ...novoProdutor,

                      nome:
                        e.target.value
                    })
                  }
                  required
                />

              </div>

              <div className="acoes-form campo-grande">

                <button
                  className="btn-cancelar-admin"
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(
                      false
                    )

                    setNovoProdutor({
                      cpf: '',
                      nome: ''
                    })
                  }}
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
          <div className="edicao-card produtores-admin-detalhes">

            <div
              style={{
                display: 'flex',

                justifyContent:
                  'space-between',

                alignItems:
                  'flex-start',

                gap: '20px',

                marginBottom:
                  '20px'
              }}
            >

              <div
                className="edicao-titulo"
                style={{
                  margin: 0
                }}
              >

                <h3>
                  Dados do produtor
                </h3>

                <p>
                  Consulte as informações cadastradas do produtor.
                </p>

              </div>

              <button
                className="btn-voltar"
                type="button"
                onClick={
                  fecharDetalhes
                }
              >
                Fechar
              </button>

            </div>

            <div
              style={{
                display: 'grid',

                gridTemplateColumns:
                  'repeat(2, minmax(0, 1fr))',

                gap: '14px 18px'
              }}
            >

              <div className="campo">

                <label>
                  CPF
                </label>

                <div style={campoInformacao}>
                  {formatarCpf(
                    produtorSelecionado.cpf
                  )}
                </div>

              </div>

              <div className="campo">

                <label>
                  Nome completo
                </label>

                <div style={campoInformacao}>
                  {produtorSelecionado.nome ||
                    'Não informado'}
                </div>

              </div>

              <div className="campo">

                <label>
                  Telefone
                </label>

                <div style={campoInformacao}>
                  {produtorSelecionado.telefone ||
                    'Não informado'}
                </div>

              </div>

              <div className="campo">

                <label>
                  E-mail
                </label>

                <div style={campoInformacao}>
                  {produtorSelecionado.email ||
                    'Não informado'}
                </div>

              </div>

              <div
                className="campo"
                style={{
                  gridColumn:
                    '1 / -1'
                }}
              >

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
                  gridColumn:
                    '1 / -1'
                }}
              >

                <label>
                  Endereço de retirada
                </label>

                <div style={campoInformacao}>
                  {produtorSelecionado.endereco ||
                    'Não informado'}
                </div>

              </div>

              <div className="campo">

                <label>
                  Status
                </label>

                <div
                  style={{
                    minHeight:
                      '40px',

                    display: 'flex',

                    alignItems:
                      'center'
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

                <label>
                  Ativo desde
                </label>

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

                justifyContent:
                  'flex-end',

                marginTop:
                  '14px',

                paddingTop:
                  '12px',

                borderTop:
                  '1px solid rgba(27, 94, 32, 0.18)'
              }}
            >

              <button
                type="button"
                className={
                  produtorSelecionado.ativo
                    ? 'btn-excluir'
                    : 'btn-editar'
                }
                onClick={
                  toggleAtivo
                }
              >
                {produtorSelecionado.ativo
                  ? 'Desativar acesso'
                  : 'Ativar acesso'}
              </button>

            </div>

          </div>
        )}

        <div className="produtores-admin-lista">

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
            <div className="table-responsive produtores-admin-scroll">

              <table className="dashboard-table">

                <thead>

                  <tr>

                    <th>
                      CPF
                    </th>

                    <th>
                      Nome completo
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {produtores.map(
                    (produtor) => (
                      <tr
                        key={
                          produtor.cpf
                        }
                        onClick={() =>
                          selecionarProdutor(
                            produtor
                          )
                        }
                        style={{
                          cursor:
                            'pointer'
                        }}
                        title="Clique para visualizar os dados do produtor"
                      >

                        <td>
                          {formatarCpf(
                            produtor.cpf
                          )}
                        </td>

                        <td>

                          <strong className="produto-nome">
                            {produtor.nome ||
                              '-'}
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
                    )
                  )}

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
  minHeight: '40px',

  display: 'flex',

  alignItems: 'center',

  padding: '8px 12px',

  background: '#ffffff',

  color: '#3f4e42',

  border:
    '1px solid #91ad95',

  borderRadius: '6px',

  fontSize: '14px'
}

export default ProdutoresAdmin