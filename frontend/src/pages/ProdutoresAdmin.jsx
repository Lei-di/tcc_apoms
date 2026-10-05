import { useEffect, useState } from 'react'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function ProdutoresAdmin() {
  const [produtores, setProdutores] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const [novoProdutor, setNovoProdutor] = useState({
    cpf: '',
    nome: '',
    telefone: '',
    email: '',
    cidade: '',
    endereco: ''
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

  const handleCadastro = async (e) => {
    e.preventDefault()

    try {
      await api.post('/admin/produtores', novoProdutor)

      setMensagem('Produtor cadastrado com sucesso!')

      setNovoProdutor({
        cpf: '',
        nome: '',
        telefone: '',
        email: '',
        cidade: '',
        endereco: ''
      })

      setMostrarFormulario(false)
      buscarProdutores()
    } catch (err) {
      if (err.response?.status === 409) {
        setMensagem('CPF já cadastrado.')
      } else {
        setMensagem('Erro ao cadastrar produtor.')
      }
    }
  }

  const toggleAtivo = async (cpf) => {
    try {
      await api.patch(`/admin/produtores/${cpf}/toggle`)

      setMensagem('Status do produtor atualizado com sucesso!')
      buscarProdutores()
    } catch (err) {
      setMensagem('Erro ao atualizar status do produtor.')
    }
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
                  onChange={(e) =>
                    setNovoProdutor({
                      ...novoProdutor,
                      cpf: e.target.value
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

              <div className="campo">
                <label>Telefone</label>

                <input
                  type="text"
                  placeholder="Telefone"
                  value={novoProdutor.telefone}
                  onChange={(e) =>
                    setNovoProdutor({
                      ...novoProdutor,
                      telefone: e.target.value
                    })
                  }
                />
              </div>

              <div className="campo">
                <label>E-mail</label>

                <input
                  type="email"
                  placeholder="E-mail"
                  value={novoProdutor.email}
                  onChange={(e) =>
                    setNovoProdutor({
                      ...novoProdutor,
                      email: e.target.value
                    })
                  }
                />
              </div>

              <div className="campo">
                <label>Cidade</label>

                <input
                  type="text"
                  placeholder="Cidade"
                  value={novoProdutor.cidade}
                  onChange={(e) =>
                    setNovoProdutor({
                      ...novoProdutor,
                      cidade: e.target.value
                    })
                  }
                />
              </div>

              <div className="campo">
                <label>Endereço</label>

                <input
                  type="text"
                  placeholder="Endereço"
                  value={novoProdutor.endereco}
                  onChange={(e) =>
                    setNovoProdutor({
                      ...novoProdutor,
                      endereco: e.target.value
                    })
                  }
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
                  Salvar produtor
                </button>

              </div>

            </form>

          </div>
        )}

        <div className="table-card">

          {produtores.length === 0 ? (
            <div className="estado-vazio">

              <h3>Nenhum produtor cadastrado</h3>

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
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>E-mail</th>
                    <th>Cidade</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {produtores.map((produtor) => (
                    <tr key={produtor.cpf}>

                      <td>
                        {produtor.cpf}
                      </td>

                      <td>
                        <strong className="produto-nome">
                          {produtor.nome}
                        </strong>
                      </td>

                      <td>
                        {produtor.telefone || '-'}
                      </td>

                      <td>
                        {produtor.email || '-'}
                      </td>

                      <td>
                        {produtor.cidade || '-'}
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

                      <td>
                        <button
                          type="button"
                          className={
                            produtor.ativo
                              ? 'btn-excluir'
                              : 'btn-editar'
                          }
                          onClick={() =>
                            toggleAtivo(produtor.cpf)
                          }
                        >
                          {produtor.ativo
                            ? 'Desativar'
                            : 'Ativar'}
                        </button>
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

export default ProdutoresAdmin