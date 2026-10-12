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

  const limparFormulario = () => {
    setNomeProduto('')
    setQuantidade('')
    setUnidade('')
    setDataDisponibilidade('')
    setPreco('')
    setObservacao('')
    setMensagem('')
    setCadastroSucesso(false)
  }

  const handleCancelar = () => {
    limparFormulario()
  }

  const handleCadastro = async (e) => {
    e.preventDefault()

    try {
      await api.post(
        '/solicitacoes',
        {
          nome_produto: nomeProduto,
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
      <style>
        {`
          .cadastro-oferta-page {
            padding-top: 18px;
            padding-bottom: 18px;
          }

          .cadastro-oferta-page .cadastro-card {
            width: 100%;
            max-width: 900px;
            padding: 20px 22px;

            background: #f0f5f0;

            border: 1px solid #8fb995;
            border-radius: 10px;

            box-shadow:
              0 2px 7px rgba(27, 94, 32, 0.05);
          }

          .cadastro-oferta-page .cadastro-produto-form {
            gap: 14px 18px;
          }

          .cadastro-oferta-page .campo label {
            margin-bottom: 5px;
            color: #304b34;
            font-size: 13px;
            font-weight: 600;
          }

          .cadastro-oferta-page .campo input,
          .cadastro-oferta-page .campo select,
          .cadastro-oferta-page .campo textarea {
            background: #ffffff;
            border-color: #91ad95;
          }

          .cadastro-oferta-page .campo input,
          .cadastro-oferta-page .campo select {
            min-height: 40px;
            padding-top: 8px;
            padding-bottom: 8px;
          }

          .cadastro-oferta-page .campo input:focus,
          .cadastro-oferta-page .campo select:focus,
          .cadastro-oferta-page .campo textarea:focus {
            outline: none;
            border-color: #1b5e20;

            box-shadow:
              0 0 0 2px rgba(27, 94, 32, 0.08);
          }

          .cadastro-acoes {
            margin-top: 0;
            padding-top: 12px;

            border-top:
              1px solid rgba(27, 94, 32, 0.18);
          }

          .cadastro-oferta-page .btn-principal {
            background: #1b5e20;
          }

          .cadastro-oferta-page .btn-principal:hover {
            background: #174f1b;
          }

          .cadastro-oferta-page .btn-cancelar-oferta {
            min-width: 100px;

            background: #ffffff;
            color: #4b594d;

            border:
              1px solid #91aa95;

            font-size: 13px;
            font-weight: 600;
          }

          .cadastro-oferta-page .btn-cancelar-oferta:hover {
            background: #f5f8f5;
            color: #304533;
            border-color: #778f7b;
          }

          @media (max-height: 750px) and (min-width: 701px) {
            .cadastro-oferta-page {
              padding-top: 12px;
              padding-bottom: 12px;
            }

            .cadastro-oferta-page .cadastro-card {
              padding: 16px 20px;
            }

            .cadastro-oferta-page .cadastro-produto-form {
              gap: 10px 16px;
            }

            .cadastro-oferta-page .campo input,
            .cadastro-oferta-page .campo select {
              min-height: 38px;
            }
          }

          @media (max-width: 700px) {
            .cadastro-oferta-page {
              padding-top: 18px;
              padding-bottom: 35px;
            }
          }
        `}
      </style>

      <section className="dashboard-content cadastro-produto-content cadastro-oferta-page">

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
                    marginTop: '18px'
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
                    style={textareaModalStyle}
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
                    marginTop: '20px'
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
                rows="3"
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

            <div className="acoes-form campo-grande cadastro-acoes">

              <button
                className="btn-cancelar-oferta"
                type="button"
                onClick={handleCancelar}
              >
                Cancelar
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
  marginTop: '7px',
  marginBottom: 0,
  color: '#435a46',
  fontSize: '12px'
}

const linkSolicitacaoProduto = {
  display: 'inline',
  padding: 0,
  background: 'transparent',
  color: '#1b5e20',
  border: 'none',
  borderRadius: 0,
  fontSize: '12px',
  fontWeight: '700',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  cursor: 'pointer'
}

const textareaStyle = {
  width: '100%',
  minHeight: '74px',
  maxHeight: '90px',
  padding: '10px 12px',

  border:
    '1px solid #91ad95',

  borderRadius: '6px',
  background: '#ffffff',
  fontSize: '14px',
  resize: 'vertical'
}

const textareaModalStyle = {
  width: '100%',
  padding: '12px',
  border:
    '1px solid #d7e1d8',
  borderRadius: '6px',
  background: 'white',
  fontSize: '14px',
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
  background: '#ffffff',
  border:
    '1px solid #dfe8df',
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
  color: '#314a34',
  fontSize: '20px'
}

const modalDescricao = {
  marginTop: '6px',
  color: '#768178',
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
  color: '#677269',
  border:
    '1px solid #d4ddd5',
  borderRadius: '6px',
  fontSize: '22px'
}

export default CadastroProduto