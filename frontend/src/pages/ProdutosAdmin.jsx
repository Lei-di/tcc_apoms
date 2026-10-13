import { useEffect, useState } from 'react'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function ProdutosAdmin() {
  const [produtos, setProdutos] = useState([])
  const [nomeProduto, setNomeProduto] = useState('')
  const [editando, setEditando] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  useEffect(() => {
    buscarProdutos()
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

  const buscarProdutos = async () => {
    try {
      const resposta = await api.get(
        '/produtos/disponiveis'
      )

      setProdutos(resposta.data)
    } catch (err) {
      console.error(
        'Erro ao buscar produtos:',
        err
      )
    }
  }

  const limparFormulario = () => {
    setNomeProduto('')
    setEditando(null)
    setMostrarFormulario(false)
  }

  const salvarProduto = async (e) => {
    e.preventDefault()

    const nome =
      nomeProduto.trim()

    if (!nome) {
      return
    }

    try {
      if (editando) {
        await api.put(
          `/produtos/disponiveis/${editando}`,
          {
            nome
          }
        )

        setMensagem(
          'Produto atualizado com sucesso!'
        )
      } else {
        await api.post(
          '/produtos/disponiveis',
          {
            nome
          }
        )

        setMensagem(
          'Produto cadastrado com sucesso!'
        )
      }

      limparFormulario()
      buscarProdutos()
    } catch (err) {
      if (
        err.response?.status === 409
      ) {
        setMensagem(
          'Esse produto já está cadastrado.'
        )
      } else {
        setMensagem(
          'Erro ao salvar produto.'
        )
      }
    }
  }

  const iniciarEdicao = (
    produto
  ) => {
    setEditando(
      produto.id
    )

    setNomeProduto(
      produto.nome
    )

    setMostrarFormulario(
      true
    )

    setMensagem('')
  }

  const excluirProduto = async (
    id
  ) => {
    const confirmar =
      window.confirm(
        'Tem certeza que deseja excluir este produto da lista?'
      )

    if (!confirmar) {
      return
    }

    try {
      await api.delete(
        `/produtos/disponiveis/${id}`
      )

      setMensagem(
        'Produto removido com sucesso!'
      )

      buscarProdutos()
    } catch (err) {
      setMensagem(
        'Erro ao excluir produto.'
      )
    }
  }

  return (
    <LayoutSistema
      titulo="Lista de produtos"
      subtitulo="Gerencie os produtos disponíveis para cadastro de ofertas."
      paginaAtiva="admin-produtos"
      tipoUsuario="admin"
    >
      <style>
        {`
          .produtos-admin-page {
            width: 100%;
            height: calc(100vh - 90px);

            display: flex;
            flex-direction: column;

            min-height: 0;

            padding: 26px 36px;

            overflow: hidden;
          }

          .produtos-admin-topo {
            flex-shrink: 0;

            display: flex;
            align-items: center;

            margin-bottom: 20px;
          }

          .produtos-admin-mensagem {
            flex-shrink: 0;
          }

          /* Formulário */

          .produtos-admin-formulario {
            width: 100%;
            max-width: 900px;

            flex-shrink: 0;

            margin-bottom: 20px;

            padding: 20px 22px;

            background: #f0f5f0;

            border: 1px solid #8fb995;

            border-radius: 10px;

            box-shadow:
              0 2px 7px
              rgba(27, 94, 32, 0.05);
          }

          .produtos-admin-formulario form {
            display: grid;
            grid-template-columns: 1fr;

            gap: 14px;
          }

          .produtos-admin-formulario
          .campo label {
            display: block;

            margin-bottom: 5px;

            color: #304b34;

            font-size: 13px;
            font-weight: 600;
          }

          .produtos-admin-formulario
          .campo input {
            width: 100%;

            min-height: 40px;

            padding: 8px 12px;

            background: #ffffff;

            color: #3f4e42;

            border: 1px solid #91ad95;

            border-radius: 6px;

            font-size: 14px;
          }

          .produtos-admin-formulario
          .campo input:focus {
            outline: none;

            border-color: #1b5e20;

            box-shadow:
              0 0 0 2px
              rgba(27, 94, 32, 0.08);
          }

          .produtos-admin-formulario
          .acoes-form {
            display: flex;

            justify-content: flex-end;
            align-items: center;

            gap: 12px;

            margin-top: 0;
            padding-top: 12px;

            border-top:
              1px solid rgba(27, 94, 32, 0.18);
          }

          .btn-cancelar-admin {
            min-width: 100px;
            min-height: 40px;

            padding: 8px 15px;

            background: #ffffff;

            color: #4b594d;

            border: 1px solid #91aa95;

            border-radius: 6px;

            font-size: 13px;
            font-weight: 600;

            cursor: pointer;
          }

          /* Painel da lista */

          .produtos-admin-lista {
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

          .produtos-admin-scroll {
            width: 100%;

            flex: 1;

            min-height: 0;

            overflow-y: scroll;
            overflow-x: hidden;
          }

          .produtos-admin-scroll
          .dashboard-table {
            width: 100%;

            margin: 0;

            table-layout: fixed;

            background: transparent;
          }

          .produtos-admin-scroll
          .dashboard-table thead {
            position: sticky;

            top: 0;

            z-index: 10;
          }

          .produtos-admin-scroll
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

          .produtos-admin-scroll
          .dashboard-table td {
            padding: 17px 20px;

            background: #ffffff;

            border-bottom:
              1px solid #dce6dd;
          }

          .produtos-admin-scroll
          .dashboard-table tr:last-child td {
            border-bottom: none;
          }

          .produtos-admin-scroll
          .dashboard-table tbody tr:hover td {
            background: #f8fbf8;
          }

          .produtos-admin-scroll
          .dashboard-table th:first-child,
          .produtos-admin-scroll
          .dashboard-table td:first-child {
            width: 45%;
          }

          .produtos-admin-scroll
          .dashboard-table th:last-child,
          .produtos-admin-scroll
          .dashboard-table td:last-child {
            width: 55%;
          }

          .produtos-admin-scroll::-webkit-scrollbar {
            width: 10px;
          }

          .produtos-admin-scroll::-webkit-scrollbar-track {
            background: #e8efe9;
          }

          .produtos-admin-scroll::-webkit-scrollbar-thumb {
            background: #a7bbaa;

            border-radius: 10px;

            border:
              2px solid #e8efe9;
          }

          .produtos-admin-scroll::-webkit-scrollbar-thumb:hover {
            background: #879d8b;
          }

          .produtos-admin-vazio {
            flex: 1;

            min-height: 0;

            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            padding: 30px;

            text-align: center;
          }

          .produtos-admin-vazio h3 {
            color: #354139;

            font-size: 17px;
            font-weight: 600;
          }

          .produtos-admin-vazio p {
            margin-top: 7px;

            color: #708074;

            font-size: 13px;
          }

          @media (max-width: 1000px) {
            .produtos-admin-page {
              padding: 24px;
            }
          }

          @media (max-width: 700px) {
            body {
              overflow: auto !important;
            }

            .produtos-admin-page {
              height: auto;

              min-height:
                calc(100vh - 75px);

              padding:
                22px 16px 35px;

              overflow: visible;
            }

            .produtos-admin-formulario {
              max-width: none;
            }

            .produtos-admin-formulario
            .acoes-form {
              flex-direction:
                column-reverse;
            }

            .produtos-admin-formulario
            .acoes-form button {
              width: 100%;
            }

            .produtos-admin-lista {
              min-height: 450px;
            }

            .produtos-admin-scroll {
              max-height: 500px;
            }
          }
        `}
      </style>

      <section className="produtos-admin-page">

        <div className="produtos-admin-topo">

          <button
            className="btn-principal"
            type="button"
            onClick={() => {
              if (mostrarFormulario) {
                limparFormulario()
              } else {
                setMostrarFormulario(true)
                setMensagem('')
              }
            }}
          >

            <span className="btn-icone">
              {mostrarFormulario
                ? '×'
                : '+'}
            </span>

            {mostrarFormulario
              ? 'Cancelar'
              : 'Cadastrar produto'}

          </button>

        </div>

        {mensagem && (
          <p
            className={`mensagem-pagina produtos-admin-mensagem ${
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
          <div className="produtos-admin-formulario">

            <form
              onSubmit={
                salvarProduto
              }
            >

              <div className="campo">

                <label>
                  Nome do produto
                </label>

                <input
                  type="text"
                  placeholder="Ex: Abobrinha"
                  value={
                    nomeProduto
                  }
                  onChange={(e) =>
                    setNomeProduto(
                      e.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="acoes-form">

                <button
                  className="btn-cancelar-admin"
                  type="button"
                  onClick={
                    limparFormulario
                  }
                >
                  Cancelar
                </button>

                <button
                  className="btn-principal"
                  type="submit"
                >
                  {editando
                    ? 'Salvar alterações'
                    : 'Cadastrar produto'}
                </button>

              </div>

            </form>

          </div>
        )}

        <div className="produtos-admin-lista">

          {produtos.length === 0 ? (
            <div className="produtos-admin-vazio">

              <h3>
                Nenhum produto cadastrado
              </h3>

              <p>
                Cadastre produtos para disponibilizá-los aos produtores.
              </p>

            </div>
          ) : (
            <div className="produtos-admin-scroll">

              <table className="dashboard-table">

                <thead>

                  <tr>

                    <th>
                      Produto
                    </th>

                    <th>
                      Ações
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {produtos.map(
                    (produto) => (
                      <tr
                        key={
                          produto.id
                        }
                      >

                        <td>

                          <strong className="produto-nome">
                            {
                              produto.nome
                            }
                          </strong>

                        </td>

                        <td>

                          <div className="acoes-tabela">

                            <button
                              className="btn-editar"
                              type="button"
                              onClick={() =>
                                iniciarEdicao(
                                  produto
                                )
                              }
                            >
                              Editar
                            </button>

                            <button
                              className="btn-excluir"
                              type="button"
                              onClick={() =>
                                excluirProduto(
                                  produto.id
                                )
                              }
                            >
                              Excluir
                            </button>

                          </div>

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

export default ProdutosAdmin