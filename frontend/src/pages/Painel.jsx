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

  return (
    <LayoutSistema
      titulo="Painel do Produtor"
      subtitulo="Acompanhe o resumo das suas ofertas."
      paginaAtiva="painel"
    >
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
            className="table-card"
            style={cardResumo}
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
            style={cardResumo}
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
            style={cardResumo}
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