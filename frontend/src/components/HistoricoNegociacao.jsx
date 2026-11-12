import ResumoValores from './ResumoValores'
import IconeStatus from './IconeStatus'

function Etapa({ titulo, data, children, status }) {
  const instante = data ? new Date(data) : null
  return (
    <li className="negociacao-etapa">
      <h5>{status && <IconeStatus status={status} />}{titulo}</h5>
      <p className="negociacao-data">{instante && Number.isFinite(instante.getTime())
        ? instante.toLocaleDateString('pt-BR', { timeZone: 'America/Cuiaba' })
        : 'Data não registrada'}</p>
      {children}
    </li>
  )
}

export default function HistoricoNegociacao({ solicitacao: s }) {
  const temContraoferta = ['contraoferta', 'contraoferta_aceita', 'contraoferta_recusada'].includes(s.status)
  return (
    <section className="historico-negociacao">
      <h4>Histórico da negociação</h4>
      <ol className="negociacao-etapas" role="list">
        <Etapa titulo="Oferta do produtor" data={s.data_solicitacao}>
          <ResumoValores quantidade={s.quantidade} preco={s.preco} />
          {s.observacao_produtor && <p>{s.observacao_produtor}</p>}
        </Etapa>
        {temContraoferta && (
          <Etapa titulo="Contraoferta enviada pela APOMS" data={s.data_contraoferta}>
            <ResumoValores quantidade={s.quantidade_contraoferta} preco={s.preco_contraoferta} />
            {s.observacao && <p>{s.observacao}</p>}
          </Etapa>
        )}
        {s.status === 'contraoferta_aceita' && (
          <Etapa status={s.status} titulo="Produtor aceitou - valores finais acordados" data={s.data_resposta_contraoferta}>
            <ResumoValores quantidade={s.quantidade_contraoferta} preco={s.preco_contraoferta} />
          </Etapa>
        )}
        {s.status === 'contraoferta_recusada' && (
          <Etapa status={s.status} titulo="Produtor recusou a contraoferta" data={s.data_resposta_contraoferta}>
            <p>Negociação encerrada sem acordo.</p>
          </Etapa>
        )}
        {s.status === 'aprovado' && (
          <Etapa status={s.status} titulo="Aprovado - APOMS" data={s.data_avaliacao}>
            <ResumoValores quantidade={s.quantidade} preco={s.preco} />
          </Etapa>
        )}
        {s.status === 'rejeitado' && (
          <Etapa status={s.status} titulo="APOMS rejeitou a oferta" data={s.data_avaliacao}>
            <p>{s.observacao || 'Negociação encerrada sem acordo.'}</p>
          </Etapa>
        )}
        {s.status === 'pendente' && <li className="negociacao-pendente"><IconeStatus status={s.status} />Aguardando avaliação da APOMS.</li>}
        {s.status === 'contraoferta' && <li className="negociacao-pendente"><IconeStatus status={s.status} />Aguardando resposta do produtor.</li>}
      </ol>
    </section>
  )
}
