import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function Painel() {
  const [solicitacoes, setSolicitacoes] =
    useState([])

  const [carregando, setCarregando] =
    useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    buscarSolicitacoes()
  }, [])

  const buscarSolicitacoes = async () => {
    try {
      const resposta =
        await api.get('/solicitacoes/minhas')

      setSolicitacoes(resposta.data)
    } catch (err) {
      console.error(
        'Erro ao buscar solicitações:',
        err
      )

      navigate('/')
    } finally {
      setCarregando(false)
    }
  }

  const pendentes =
    solicitacoes.filter(
      (solicitacao) =>
        solicitacao.status ===
        'pendente'
    )

  const aprovadas =
    solicitacoes.filter(
      (solicitacao) =>
        solicitacao.status ===
          'aprovado' ||
        solicitacao.status ===
          'contraoferta_aceita'
    )

  const contraofertas =
    solicitacoes.filter(
      (solicitacao) =>
        solicitacao.status ===
        'contraoferta'
    )

  const formatarPreco = (preco) => {
    if (
      preco === null ||
      preco === undefined
    ) {
      return '-'
    }

    return Number(preco).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    )
  }

  return (
    <LayoutSistema
      titulo="Painel do Produtor"
      subtitulo="Acompanhe o resumo das suas ofertas e o que precisa da sua atenção."
      paginaAtiva="painel"
    >
      <section className="dashboard-content">

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px',
            marginBottom: '28px'
          }}
        >

          <div
            className="table-card"
            style={{
              padding: '22px'
            }}
          >

            <span style={tituloCard}>
              Ofertas pendentes
            </span>

            <strong style={numeroCard}>
              {pendentes.length}
            </strong>

            <span style={descricaoCard}>
              Aguardando avaliação da APOMS
            </span>

          </div>

          <div
            className="table-card"
            style={{
              padding: '22px'
            }}
          >

            <span style={tituloCard}>
              Ofertas aprovadas
            </span>

            <strong style={numeroCard}>
              {aprovadas.length}
            </strong>

            <span style={descricaoCard}>
              Ofertas finalizadas com aprovação
            </span>

          </div>

          <div
            className="table-card"
            style={{
              padding: '22px'
            }}
          >

            <span style={tituloCard}>
              Contraofertas aguardando resposta
            </span>

            <strong style={numeroCard}>
              {contraofertas.length}
            </strong>

            <span style={descricaoCard}>
              Propostas aguardando sua decisão
            </span>

          </div>

        </div>

        <div className="table-card">

          <div
            style={{
              padding: '22px 24px',
              borderBottom:
                '1px solid #e4e9e6'
            }}
          >

            <h2
              style={{
                margin: 0,
                color: '#26332b',
                fontSize: '18px'
              }}
            >
              Requer sua atenção
            </h2>

            <p
              style={{
                marginTop: '6px',
                color: '#7b8580',
                fontSize: '13px'
              }}
            >
              Contraofertas enviadas pela APOMS aguardando sua resposta.
            </p>

          </div>

          {carregando ? (
            <div style={estadoPainel}>
              Carregando informações...
            </div>
          ) : contraofertas.length === 0 ? (
            <div style={estadoPainel}>
              Você não possui contraofertas aguardando resposta.
            </div>
          ) : (
            <div>

              {contraofertas.map(
                (solicitacao) => (
                  <div
                    key={solicitacao.id}
                    style={{
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'space-between',
                      gap: '20px',
                      padding:
                        '18px 24px',
                      borderBottom:
                        '1px solid #edf0ee'
                    }}
                  >

                    <div>

                      <strong
                        style={{
                          display:
                            'block',
                          marginBottom:
                            '6px',
                          color:
                            '#26332b',
                          fontSize:
                            '14px'
                        }}
                      >
                        {
                          solicitacao.nome_produto
                        }
                      </strong>

                      <span
                        style={{
                          display:
                            'block',
                          color:
                            '#7b8580',
                          fontSize:
                            '12px',
                          lineHeight:
                            '1.6'
                        }}
                      >
                        Quantidade proposta:{' '}
                        {
                          solicitacao.quantidade_contraoferta
                        }
                        {' • '}
                        Preço proposto:{' '}
                        {formatarPreco(
                          solicitacao.preco_contraoferta
                        )}
                      </span>

                      {solicitacao.observacao && (
                        <span
                          style={{
                            display:
                              'block',
                            marginTop:
                              '4px',
                            color:
                              '#8a938e',
                            fontSize:
                              '12px'
                          }}
                        >
                          {
                            solicitacao.observacao
                          }
                        </span>
                      )}

                    </div>

                    <button
                      className="btn-secundario"
                      type="button"
                      onClick={() =>
                        navigate(
                          '/solicitacoes'
                        )
                      }
                    >
                      Ver contraoferta
                    </button>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </section>
    </LayoutSistema>
  )
}

const tituloCard = {
  display: 'block',
  marginBottom: '10px',
  color: '#7b8580',
  fontSize: '13px'
}

const numeroCard = {
  display: 'block',
  color: '#26332b',
  fontSize: '30px'
}

const descricaoCard = {
  display: 'block',
  marginTop: '7px',
  color: '#8a938e',
  fontSize: '12px'
}

const estadoPainel = {
  padding: '45px 25px',
  color: '#8a938e',
  fontSize: '13px',
  textAlign: 'center'
}

export default Painel