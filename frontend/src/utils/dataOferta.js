export function dataHoje(agora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Cuiaba', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(agora)
  const campo = tipo => partes.find(parte => parte.type === tipo).value
  return `${campo('year')}-${campo('month')}-${campo('day')}`
}

export function erroDataOferta(data, agora = new Date()) {
  if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return 'Informe uma data de disponibilidade válida.'
  }
  const interpretada = new Date(`${data}T00:00:00.000Z`)
  if (!Number.isFinite(interpretada.getTime()) || interpretada.toISOString().slice(0, 10) !== data) {
    return 'Informe uma data de disponibilidade válida.'
  }
  if (data < dataHoje(agora)) {
    return 'A data de disponibilidade não pode ser anterior a hoje.'
  }
  return ''
}

