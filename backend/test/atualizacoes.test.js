const test = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const { observarAlteracoes, aguardarAtualizacoes } = require('../services/atualizacoes')
const { exigirVersao } = require('../middlewares/versao')

function resposta() {
  const res = new EventEmitter()
  res.statusCode = 200
  res.set = () => res
  res.status = codigo => { res.statusCode = codigo; return res }
  res.json = dados => { res.dados = dados; return res }
  return res
}

test('alteração concluída avisa todos os clientes aguardando', () => {
  const inicial = resposta()
  aguardarAtualizacoes({ query: {} }, inicial)
  const clientes = [resposta(), resposta()]
  for (const res of clientes) {
    aguardarAtualizacoes({ query: { versao: inicial.dados.versao } }, res)
    assert.equal(res.dados, undefined)
  }
  const escrita = resposta()
  observarAlteracoes({ method: 'DELETE' }, escrita, () => {})
  assert.equal(clientes[0].dados, undefined)
  escrita.emit('finish')
  assert.notEqual(clientes[0].dados.versao, inicial.dados.versao)
  assert.deepEqual(clientes[0].dados, clientes[1].dados)
})

test('consultas e escritas recusadas não anunciam alterações', () => {
  const antes = resposta()
  aguardarAtualizacoes({ query: {} }, antes)
  for (const [method, statusCode] of [['GET', 200], ['PATCH', 409], ['POST', 500]]) {
    const res = resposta()
    res.statusCode = statusCode
    observarAlteracoes({ method }, res, () => {})
    res.emit('finish')
  }
  const depois = resposta()
  aguardarAtualizacoes({ query: {} }, depois)
  assert.deepEqual(depois.dados, antes.dados)
})

test('desconectar cancela a espera; reconectar recupera mudanças perdidas', () => {
  const inicial = resposta()
  aguardarAtualizacoes({ query: {} }, inicial)
  const desligado = resposta()
  aguardarAtualizacoes({ query: inicial.dados }, desligado)
  desligado.emit('close')
  const escrita = resposta()
  observarAlteracoes({ method: 'PUT' }, escrita, () => {})
  escrita.emit('finish')
  assert.equal(desligado.dados, undefined)
  const reconectado = resposta()
  aguardarAtualizacoes({ query: inicial.dados }, reconectado)
  assert.notEqual(reconectado.dados.versao, inicial.dados.versao)
})

test('ações sem versão válida são recusadas antes de acessar o banco', () => {
  for (const body of [undefined, {}, { versao: 10 }, { versao: 'inválida' }]) {
    const res = resposta()
    exigirVersao({ body }, res, () => assert.fail('não deveria continuar'))
    assert.equal(res.statusCode, 428)
  }
  let passou = false
  exigirVersao({ body: { versao: '123' } }, resposta(), () => { passou = true })
  assert.equal(passou, true)
})
