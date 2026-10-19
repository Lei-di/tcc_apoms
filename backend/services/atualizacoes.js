const { randomUUID } = require('node:crypto')

const inicio = randomUUID()
let sequencia = 0
const aguardando = new Set()
const versaoAtual = () => `${inicio}:${sequencia}`

function observarAlteracoes(req, res, next) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.once('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        sequencia++
        for (const responder of [...aguardando]) responder()
      }
    })
  }
  next()
}

function aguardarAtualizacoes(req, res) {
  res.set('Cache-Control', 'no-store')
  if (req.query.versao !== versaoAtual()) {
    return res.json({ versao: versaoAtual() })
  }

  const responder = () => {
    limpar()
    if (!res.destroyed) res.json({ versao: versaoAtual() })
  }
  const temporizador = setTimeout(responder, 25000)
  const limpar = () => {
    clearTimeout(temporizador)
    aguardando.delete(responder)
  }
  aguardando.add(responder)
  res.once('close', limpar)
}

module.exports = { observarAlteracoes, aguardarAtualizacoes }
