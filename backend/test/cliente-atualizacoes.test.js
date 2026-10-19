const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

function cliente() {
  const requisicoes = []
  const timers = new Map()
  const eventos = new Map()
  let proximoTimer = 0
  const contexto = {
    AbortController,
    api: { get(url, config) {
      return new Promise((resolve, reject) => requisicoes.push({ url, config, resolve, reject }))
    } },
    setTimeout(fn, tempo) { timers.set(++proximoTimer, { fn, tempo }); return proximoTimer },
    clearTimeout(id) { timers.delete(id) },
    window: {
      addEventListener(nome, fn) { eventos.set(nome, fn) },
      removeEventListener(nome) { eventos.delete(nome) },
    },
  }
  const fonte = fs.readFileSync(path.join(__dirname, '../../frontend/src/services/atualizacoes.js'), 'utf8')
    .replace("import api from './api'", '')
    .replaceAll('export ', '')
  vm.runInNewContext(fonte + '\nglobalThis.servico = { assinarAtualizacoes, obterStatusAtualizacao };', contexto)
  return { ...contexto.servico, requisicoes, timers, eventos }
}

const processar = () => new Promise(resolve => setImmediate(resolve))

test('telas compartilham uma conexão e recebem eventos sem recarregar a página', async () => {
  const app = cliente()
  let primeira = 0
  let segunda = 0
  const sair1 = app.assinarAtualizacoes(() => primeira++)
  const sair2 = app.assinarAtualizacoes(() => segunda++)
  assert.equal(app.requisicoes.length, 1)
  app.requisicoes[0].resolve({ data: { versao: 'servidor:1' } })
  await processar()
  assert.equal(primeira, 1)
  assert.equal(segunda, 1)
  assert.equal(app.obterStatusAtualizacao(), 'online')
  app.eventos.get('focus')()
  assert.equal(primeira, 2)
  sair1()
  assert.equal(app.requisicoes[0].config.signal.aborted, false)
  sair2()
  assert.equal(app.requisicoes[0].config.signal.aborted, true)
  assert.equal(app.timers.size, 0)
  assert.equal(app.eventos.size, 0)
})

test('perda de conexão informa indisponibilidade e agenda nova tentativa', async () => {
  const app = cliente()
  const sair = app.assinarAtualizacoes(() => {})
  app.requisicoes[0].reject(Error('sem conexão'))
  await processar()
  assert.equal(app.obterStatusAtualizacao(), 'offline')
  assert.equal([...app.timers.values()][0].tempo, 5000)
  sair()
})

test('sessão expirada não gera tentativas contínuas', async () => {
  const app = cliente()
  const sair = app.assinarAtualizacoes(() => {})
  app.requisicoes[0].reject({ response: { status: 401 } })
  await processar()
  assert.equal(app.obterStatusAtualizacao(), 'expirada')
  assert.equal(app.timers.size, 0)
  sair()
})

test('resposta de conexão cancelada não cria outra conexão após desmontagem', async () => {
  const app = cliente()
  let eventos = 0
  const sair = app.assinarAtualizacoes(() => eventos++)
  sair()
  app.requisicoes[0].resolve({ data: { versao: 'servidor:2' } })
  await processar()
  assert.equal(eventos, 0)
  assert.equal(app.timers.size, 0)
})
