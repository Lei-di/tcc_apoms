export default function IconeStatus({ status }) {
  const aprovado = ['aprovado', 'contraoferta_aceita'].includes(status)
  const rejeitado = ['rejeitado', 'contraoferta_recusada'].includes(status)
  const tipo = aprovado ? 'aprovado' : rejeitado ? 'rejeitado' : 'pendente'
  return (
    <svg className={`icone-status icone-status-${tipo}`} width="18" height="18"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      {aprovado ? <path d="m8 12 3 3 5-6" />
        : rejeitado ? <path d="m9 9 6 6m0-6-6 6" />
          : <path d="M12 7v5l3 2" />}
    </svg>
  )
}
