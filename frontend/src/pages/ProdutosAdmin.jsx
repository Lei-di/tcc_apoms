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

  const buscarProdutos = async () => {
    try {
      const resposta = await api.get('/produtos/disponiveis')
      setProdutos(resposta.data)
    } catch (err) {
      console.error('Erro ao buscar produtos:', err)
    }
  }

  const limparFormulario = () => {
    setNomeProduto('')
    setEditando(null)
    setMostrarFormulario(false)
  }

  const salvarProduto = async (e) => {
    e.preventDefault()

    const nome = nomeProduto.trim()

    if (!nome) {
      return
    }

    try {
      if (editando) {
        await api.put(
          `/produtos/disponiveis/${editando}`,
          { nome }
        )

        setMensagem('Produto atualizado com sucesso!')
      } else {
        await api.post(
          '/produtos/disponiveis',
          { nome }
        )

        setMensagem('Produto cadastrado com sucesso!')
      }

      limparFormulario()
      buscarProdutos()
    } catch (err) {
      if (err.response?.status === 409) {
        setMensagem('Esse produto já está cadastrado.')
      } else {
        setMensagem('Erro ao salvar produto.')
      }
    }
  }

  const iniciarEdicao = (produto) => {
    setEditando(produto.id)
    setNomeProduto(produto.nome)
    setMostrarFormulario(true)
    setMensagem('')
  }

  const excluirProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto da lista?')) {
      return
    }

    try {
      await api.delete(`/produtos/disponiveis/${id}`)

      setMensagem('Produto removido com sucesso!')
      buscarProdutos()
    } catch (err) {
      setMensagem('Erro ao excluir produto.')
    }
  }

  return (
    <LayoutSistema
      titulo="Lista de produtos"
      subtitulo="Gerencie os produtos disponíveis para cadastro de ofertas."
      paginaAtiva="admin-produtos"
      tipoUsuario="admin"
    >
      <section className="dashboard-content">

        <div className="page-header">

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
              {mostrarFormulario ? '×' : '+'}
            </span>

            {mostrarFormulario
              ? 'Cancelar'
              : 'Cadastrar produto'}
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
            style={{ marginBottom: '25px' }}
          >

            <form
              className="cadastro-produto-form"
              onSubmit={salvarProduto}
            >

              <div className="campo campo-grande">
                <label>Nome do produto</label>

                <input
                  type="text"
                  placeholder="Ex: Abobrinha"
                  value={nomeProduto}
                  onChange={(e) =>
                    setNomeProduto(e.target.value)
                  }
                  required
                />
              </div>

              <div className="acoes-form campo-grande">

                <button
                  className="btn-voltar"
                  type="button"
                  onClick={limparFormulario}
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

        <div className="table-card">

          {produtos.length === 0 ? (
            <div className="estado-vazio">

              <h3>Nenhum produto cadastrado</h3>

              <p>
                Cadastre produtos para disponibilizá-los aos produtores.
              </p>

            </div>
          ) : (
            <div className="table-responsive">

              <table className="dashboard-table">

                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id}>

                      <td>
                        <strong className="produto-nome">
                          {produto.nome}
                        </strong>
                      </td>

                      <td>
                        <div className="acoes-tabela">

                          <button
                            className="btn-editar"
                            type="button"
                            onClick={() =>
                              iniciarEdicao(produto)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn-excluir"
                            type="button"
                            onClick={() =>
                              excluirProduto(produto.id)
                            }
                          >
                            Excluir
                          </button>

                        </div>
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

export default ProdutosAdmin