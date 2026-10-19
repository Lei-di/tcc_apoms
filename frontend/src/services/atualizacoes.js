import api from './api'

const assinantes = new Set()
const observadoresStatus = new Set()
let status = 'conectando'
let controlador
let temporizador
let versao

function definirStatus(valor) {
  status = valor
  for (const observar of observadoresStatus) observar()
}

export const obterStatusAtualizacao = () => status
export function assinarStatusAtualizacao(observar) {
  observadoresStatus.add(observar)
  return () => observadoresStatus.delete(observar)
}

function notificar() {
  for (const atualizar of assinantes) atualizar()
}

async function acompanhar() {
  const atual = new AbortController()
  controlador = atual
  try {
    const resposta = await api.get('/atualizacoes', {
      params: { versao },
      signal: atual.signal,
      timeout: 30000,
    })
    if (atual.signal.aborted) return
    versao = resposta.data.versao
    definirStatus('online')
    // A resposta periódica também recupera mudanças após reconexões.
    notificar()
    temporizador = setTimeout(acompanhar, 100)
  } catch (erro) {
    if (atual.signal.aborted) return
    if ([401, 403].includes(erro.response?.status)) {
      definirStatus('expirada')
      return
    }
    definirStatus('offline')
    notificar()
    temporizador = setTimeout(acompanhar, 5000)
  }
}

export function assinarAtualizacoes(atualizar) {
  assinantes.add(atualizar)
  if (assinantes.size === 1) {
    definirStatus('conectando')
    acompanhar()
    window.addEventListener('focus', notificar)
    window.addEventListener('online', notificar)
  }
  return () => {
    assinantes.delete(atualizar)
    if (!assinantes.size) {
      controlador?.abort()
      clearTimeout(temporizador)
      versao = undefined
      window.removeEventListener('focus', notificar)
      window.removeEventListener('online', notificar)
    }
  }
}
