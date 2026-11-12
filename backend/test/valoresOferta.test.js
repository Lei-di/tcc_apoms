const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const contexto = {}
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../frontend/src/utils/valoresOferta.js'), 'utf8').replaceAll('export ', ''), contexto)

test('valor total multiplica quantidade pelo preço unitário', () => {
  const valores = contexto.calcularValores('45 kg', '3.00')
  assert.equal(valores.unidade, 'kg')
  assert.equal(valores.preco, 3)
  assert.equal(valores.total, 135)
  assert.equal(contexto.calcularValores('2,5 caixa', '4,50').total, 11.25)
  assert.equal(contexto.calcularValores('3 unidade', '0.10').total, 0.3)
})

test('dados ausentes ou inválidos não aparecem como total zero', () => {
  for (const [quantidade, preco] of [['', 3], ['45 kg', null], ['45 kg', ''], ['0 kg', 3], ['45 kg', -1]]) {
    assert.equal(contexto.calcularValores(quantidade, preco).total, null)
  }
})
