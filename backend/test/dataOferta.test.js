const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const backend = require('../middlewares/dataOferta')
const frontend = {}
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../frontend/src/utils/dataOferta.js'), 'utf8').replaceAll('export ', ''), frontend)

for (const [nome, validar] of [['backend', backend], ['frontend', frontend]]) {
  test(`${nome}: impede passado e aceita hoje ou futuro`, () => {
    const agora = new Date('2026-10-18T16:00:00Z')
    assert.match(validar.erroDataOferta('2026-10-02', agora), /anterior a hoje/)
    assert.match(validar.erroDataOferta('2026-10-17', agora), /anterior a hoje/)
    assert.equal(validar.erroDataOferta('2026-10-18', agora), '')
    assert.equal(validar.erroDataOferta('2026-10-19', agora), '')
  })
  test(`${nome}: usa o dia de Cuiabá na virada de data UTC`, () => {
    assert.equal(validar.dataHoje(new Date('2026-10-19T02:00:00Z')), '2026-10-18')
    assert.equal(validar.dataHoje(new Date('2026-10-19T04:00:00Z')), '2026-10-19')
  })
  test(`${nome}: rejeita datas vazias ou inexistentes`, () => {
    for (const data of [null, undefined, '', '02/10/2026', '2026-02-30', '2026-13-01', '2026-02-29']) {
      assert.match(validar.erroDataOferta(data), /válida/)
    }
    assert.equal(validar.erroDataOferta('2028-02-29', new Date('2028-02-28T12:00:00Z')), '')
  })
}

test('requisição com data passada é recusada antes do controlador', () => {
  let codigo
  let mensagem
  backend.validarDataOferta({ body: { data_disponibilidade: '2000-01-01' } }, {
    status(valor) { codigo = valor; return this },
    json(valor) { mensagem = valor.mensagem },
  }, () => assert.fail('não deveria chegar ao controlador'))
  assert.equal(codigo, 400)
  assert.match(mensagem, /anterior a hoje/)
})
