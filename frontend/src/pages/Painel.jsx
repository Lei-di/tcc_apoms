import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import LayoutSistema from '../LayoutSistema'

function Painel() {
  const [solicitacoes, setSolicitacoes] = useState([])
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
    }
  }

  const pendentes = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.status === 'pendente'
  )

  const aprovadas = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.status === 'aprovado' ||
      solicitacao.status === 'contraoferta_aceita'
  )

  const contraofertas = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.status === 'contraoferta'
  )

  const irParaSolicitacoes = () => {
    navigate('/solicitacoes')
  }

  const handleTeclado = (e) => {
    if (
      e.key === 'Enter' ||
      e.key === ' '
    ) {
      irParaSolicitacoes()
    }
  }

  return (
    <LayoutSistema
      titulo="Painel do Produtor"
      subtitulo="Acompanhe o resumo das suas ofertas."
      paginaAtiva="painel"
    >
      <style>
        {`
          .painel-resumo-card {
            cursor: pointer;
            transition:
              background-color 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease,
              transform 0.2s ease;
          }

          .painel-resumo-card:hover {
            background-color: #f0f7f3;
            border-color: #bdd8c6;
            box-shadow: 0 5px 15px rgba(27, 94, 32, 0.08);
            transform: translateY(-2px);
          }

          .painel-resumo-card:focus-visible {
            outline: 2px solid #23764e;
            outline-offset: 2px;
          }
        `}
      </style>

      <section className="dashboard-content">

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px'
          }}
        >

          <div
            className="table-card painel-resumo-card"
            style={cardResumo}
            onClick={irParaSolicitacoes}
            onKeyDown={handleTeclado}
            role="button"
            tabIndex="0"
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
            className="table-card painel-resumo-card"
            style={cardResumo}
            onClick={irParaSolicitacoes}
            onKeyDown={handleTeclado}
            role="button"
            tabIndex="0"
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
            className="table-card painel-resumo-card"
            style={cardResumo}
            onClick={irParaSolicitacoes}
            onKeyDown={handleTeclado}
            role="button"
            tabIndex="0"
          >
            <span style={tituloCard}>
              Contraofertas
            </span>

            <strong style={numeroCard}>
              {contraofertas.length}
            </strong>

            <span style={descricaoCard}>
              Propostas aguardando sua decisão
            </span>
          </div>

        </div>

      </section>
    </LayoutSistema>
  )
}

const cardResumo = {
  padding: '22px'
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

export default Painel