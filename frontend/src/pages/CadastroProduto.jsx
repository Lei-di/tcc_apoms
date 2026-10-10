import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function CadastroProduto() {
  const [nomeProduto, setNomeProduto] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [unidade, setUnidade] = useState('')
  const [dataDisponibilidade, setDataDisponibilidade] = useState('')
  const [preco, setPreco] = useState('')
  const [observacao, setObservacao] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [cadastroSucesso, setCadastroSucesso] = useState(false)
  const [listaProdutos, setListaProdutos] = useState([])

  const [
    mostrarSolicitacaoProduto,
    setMostrarSolicitacaoProduto
  ] = useState(false)

  const [
    nomeProdutoSolicitado,
    setNomeProdutoSolicitado
  ] = useState('')

  const [
    observacaoSolicitacao,
    setObservacaoSolicitacao
  ] = useState('')

  const [
    mensagemSolicitacao,
    setMensagemSolicitacao
  ] = useState('')

  const [
    tipoMensagemSolicitacao,
    setTipoMensagemSolicitacao
  ] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    buscarListaProdutos()
  }, [])

  useEffect(() => {
    if (mostrarSolicitacaoProduto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [mostrarSolicitacaoProduto])

  const buscarListaProdutos = async () => {
    try {
      const resposta =
        await api.get('/produtos/disponiveis')

      setListaProdutos(resposta.data)
    } catch (err) {
      console.error(
        'Erro ao buscar lista de produtos',
        err
      )
    }
  }

  const handleCadastro = async (e) => {
    e.preventDefault()

    try {
      await api.post(
        '/solicitacoes',
        {
          nome_produto:
            nomeProduto,

          quantidade:
            `${quantidade} ${unidade}`,

          data_disponibilidade:
            dataDisponibilidade,

          preco:
            parseFloat(preco),

          observacao_produtor:
            observacao
        }
      )

      setMensagem(
        'Oferta enviada com sucesso!'
      )

      setCadastroSucesso(true)

      setNomeProduto('')
      setQuantidade('')
      setUnidade('')
      setDataDisponibilidade('')
      setPreco('')
      setObservacao('')
    } catch (err) {
      console.error(
        'Erro ao enviar oferta:',
        err
      )

      setMensagem(
        err.response?.data?.mensagem ||
        'Erro ao enviar oferta. Tente novamente.'
      )

      setCadastroSucesso(false)
    }
  }

  const abrirSolicitacaoProduto = () => {
    setNomeProdutoSolicitado('')
    setObservacaoSolicitacao('')
    setMensagemSolicitacao('')
    setTipoMensagemSolicitacao('')

    setMostrarSolicitacaoProduto(
      true
    )
  }

  const fecharSolicitacaoProduto = () => {
    setMostrarSolicitacaoProduto(
      false
    )

    setNomeProdutoSolicitado('')
    setObservacaoSolicitacao('')
    setMensagemSolicitacao('')
    setTipoMensagemSolicitacao('')
  }

  const enviarSolicitacaoProduto =
    async (e) => {
      e.preventDefault()

      setMensagemSolicitacao('')
      setTipoMensagemSolicitacao('')

      try {
        await api.post(
          '/produtos/solicitacoes',
          {
            nome_produto:
              nomeProdutoSolicitado,

            observacao_produtor:
              observacaoSolicitacao
          }
        )

        setMensagemSolicitacao(
          'Solicitação enviada para análise da APOMS.'
        )

        setTipoMensagemSolicitacao(
          'sucesso'
        )

        setNomeProdutoSolicitado('')
        setObservacaoSolicitacao('')
      } catch (err) {
        setMensagemSolicitacao(
          err.response?.data?.mensagem ||
          'Erro ao enviar solicitação.'
        )

        setTipoMensagemSolicitacao(
          'erro'
        )
      }
    }

  return (
    <LayoutSistema
      titulo="Cadastrar oferta"
      subtitulo="Informe os dados da oferta que deseja enviar."
      paginaAtiva="cadastro"
    >
      <section className="dashboard-content cadastro-produto-content">

        {mostrarSolicitacaoProduto && (
          <div
            style={modalOverlay}
            onClick={
              fecharSolicitacaoProduto
            }
          >

            <div
              style={modalConteudo}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div style={modalCabecalho}>

                <div>
                  <h3 style={modalTitulo}>
                    Solicitar inclusão de produto
                  </h3>

                  <p style={modalDescricao}>
                    Solicite à APOMS a inclusão de um produto que ainda não está disponível no catálogo.
                  </p>
                </div>

                <button
                  type="button"
                  style={botaoFecharModal}
                  onClick={
                    fecharSolicitacaoProduto
                  }
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={
                  enviarSolicitacaoProduto
                }
              >

                <div className="campo">
                  <label>
                    Nome do produto
                  </label>

                  <input
                    type="text"
                    placeholder="Ex: Queijo"
                    value={
                      nomeProdutoSolicitado
                    }
                    onChange={(e) =>
                      setNomeProdutoSolicitado(
                        e.target.value
                      )
                    }
                    required
                  />
                </div>

                <div
                  className="campo"
                  style={{
                    marginTop: '20px'
                  }}
                >
                  <label>
                    Observação
                  </label>

                  <textarea
                    placeholder="Opcional. Informe alguma observação sobre o produto."
                    value={
                      observacaoSolicitacao
                    }
                    onChange={(e) =>
                      setObservacaoSolicitacao(
                        e.target.value
                      )
                    }
                    rows="4"
                    style={textareaStyle}
                  />
                </div>

                {mensagemSolicitacao && (
                  <p
                    className={`mensagem-pagina ${tipoMensagemSolicitacao}`}
                    style={{
                      marginTop: '18px'
                    }}
                  >
                    {mensagemSolicitacao}
                  </p>
                )}

                <div
                  className="acoes-form"
                  style={{
                    marginTop: '22px'
                  }}
                >

                  <button
                    className="btn-voltar"
                    type="button"
                    onClick={
                      fecharSolicitacaoProduto
                    }
                  >
                    Fechar
                  </button>

                  {tipoMensagemSolicitacao !==
                    'sucesso' && (
                    <button
                      className="btn-principal"
                      type="submit"
                    >
                      Enviar solicitação
                    </button>
                  )}

                </div>

              </form>

            </div>

          </div>
        )}

        <div className="cadastro-card">

          <form
            className="cadastro-produto-form"
            onSubmit={handleCadastro}
          >

            <div className="campo campo-grande">
              <label>
                Produto
              </label>

              <select
                value={nomeProduto}
                onChange={(e) => {
                  setNomeProduto(
                    e.target.value
                  )

                  setMensagem('')
                  setCadastroSucesso(false)
                }}
                required
              >
                <option value="">
                  Selecione o produto
                </option>

                {listaProdutos.map(
                  (produto) => (
                    <option
                      key={produto.id}
                      value={produto.nome}
                    >
                      {produto.nome}
                    </option>
                  )
                )}
              </select>

              <p style={textoSolicitacaoProduto}>
                Não encontrou o produto que deseja ofertar?{' '}
                <button
                  type="button"
                  onClick={
                    abrirSolicitacaoProduto
                  }
                  style={linkSolicitacaoProduto}
                >
                  clique aqui.
                </button>
              </p>
            </div>

            <div className="campo">
              <label>
                Quantidade
              </label>

              <input
                type="number"
                placeholder="Ex: 20"
                value={quantidade}
                onChange={(e) =>
                  setQuantidade(
                    e.target.value
                  )
                }
                min="1"
                required
              />
            </div>

            <div className="campo">
              <label>
                Unidade de medida
              </label>

              <select
                value={unidade}
                onChange={(e) =>
                  setUnidade(
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  Selecione a unidade
                </option>

                <option value="kg">
                  kg
                </option>

                <option value="unidade">
                  unidade
                </option>

                <option value="maço">
                  maço
                </option>

                <option value="caixa">
                  caixa
                </option>

                <option value="litro">
                  litro
                </option>

                <option value="dúzia">
                  dúzia
                </option>
              </select>
            </div>

            <div className="campo">
              <label>
                Disponibilidade
              </label>

              <input
                type="date"
                value={
                  dataDisponibilidade
                }
                onChange={(e) =>
                  setDataDisponibilidade(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="campo">
              <label>
                Preço (R$)
              </label>

              <input
                type="number"
                placeholder="Ex: 3.50"
                value={preco}
                onChange={(e) =>
                  setPreco(
                    e.target.value
                  )
                }
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="campo campo-grande">
              <label>
                Observação
              </label>

              <textarea
                placeholder="Ex: produto disponível para retirada no período da manhã."
                value={observacao}
                onChange={(e) =>
                  setObservacao(
                    e.target.value
                  )
                }
                rows="4"
                style={textareaStyle}
              />
            </div>

            {mensagem && (
              <p
                className={`mensagem-form ${
                  cadastroSucesso
                    ? 'sucesso'
                    : 'erro'
                }`}
              >
                {mensagem}
              </p>
            )}

            {cadastroSucesso && (
              <div className="campo-grande">

                <button
                  className="btn-secundario"
                  type="button"
                  onClick={() =>
                    navigate(
                      '/solicitacoes'
                    )
                  }
                >
                  Visualizar solicitações
                </button>

              </div>
            )}

            <div className="acoes-form campo-grande">

              <button
                className="btn-voltar"
                type="button"
                onClick={() =>
                  navigate('/painel')
                }
              >
                Voltar
              </button>

              <button
                className="btn-principal"
                type="submit"
              >
                Enviar
              </button>

            </div>

          </form>

        </div>

      </section>
    </LayoutSistema>
  )
}

const textoSolicitacaoProduto = {
  marginTop: '10px',
  color: '#7b8580',
  fontSize: '12px'
}

const linkSolicitacaoProduto = {
  display: 'inline',
  padding: 0,
  background: 'transparent',
  color: '#23764e',
  border: 'none',
  borderRadius: 0,
  fontSize: '12px',
  fontWeight: '600',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  cursor: 'pointer'
}

const textareaStyle = {
  width: '100%',
  padding: '12px',
  border:
    '1px solid #d7ddd9',
  borderRadius: '6px',
  fontSize: '1rem',
  resize: 'vertical'
}

const modalOverlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 3000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '25px',
  background:
    'rgba(20, 28, 23, 0.55)'
}

const modalConteudo = {
  width: '100%',
  maxWidth: '650px',
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: '28px',
  background: 'white',
  border:
    '1px solid #e1e6e3',
  borderRadius: '10px',
  boxShadow:
    '0 18px 50px rgba(0, 0, 0, 0.20)'
}

const modalCabecalho = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '20px',
  marginBottom: '24px'
}

const modalTitulo = {
  margin: 0,
  color: '#26332b',
  fontSize: '20px'
}

const modalDescricao = {
  marginTop: '6px',
  color: '#7b8580',
  fontSize: '13px',
  lineHeight: '1.5'
}

const botaoFecharModal = {
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  padding: 0,
  background: 'transparent',
  color: '#657069',
  border:
    '1px solid #d7ddd9',
  borderRadius: '6px',
  fontSize: '22px'
}

export default CadastroProduto