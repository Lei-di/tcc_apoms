const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

function montar(atualizar) {
  let estado
  let efeito
  let evento
  const contexto = {
    AbortController,
    useState(inicial) {
      estado = inicial
      return [estado, valor => { estado = typeof valor === 'function' ? valor(estado) : valor }]
    },
    useRef: current => ({ current }),
    useEffect: fn => { efeito = fn },
    useEffectEvent: fn => fn,
    assinarAtualizacoes: fn => { evento = fn; return () => { evento = null } },
  }
  const fonte = fs.readFileSync(path.join(__dirname, '../../frontend/src/hooks/useAtualizacaoAutomatica.js'), 'utf8')
    .replace(/^import .*\r?\n/gm, '')
    .replace('export default ', '')
  vm.runInNewContext(fonte, contexto)
  const hook = contexto.useAtualizacaoAutomatica(atualizar)
  const desmontar = efeito()
  return { estado: () => estado, desmontar, atualizar: () => evento?.(), tentar: hook.tentarNovamente }
}

const processar = () => new Promise(resolve => setImmediate(resolve))

test('lista não é considerada carregada enquanto a consulta está pendente', async () => {
  let concluir
  const tela = montar(() => new Promise(resolve => { concluir = resolve }))
  assert.equal(tela.estado().carregando, true)
  assert.equal(tela.estado().carregado, false)
  concluir([undefined])
  await processar()
  assert.equal(tela.estado().carregando, false)
  assert.equal(tela.estado().carregado, true)
  tela.desmontar()
})

test('falha inicial não é tratada como lista vazia; nova tentativa recupera', async () => {
  let falhar = true
  const tela = montar(async () => falhar ? [{ erro: Error('offline') }] : [undefined])
  await processar()
  assert.equal(tela.estado().carregado, false)
  assert.match(tela.estado().erro, /indisponível/)
  falhar = false
  await tela.tentar()
  assert.equal(tela.estado().carregado, true)
  assert.equal(tela.estado().erro, '')
  tela.desmontar()
})

test('troca rápida de página cancela consulta anterior e ignora resposta atrasada', async () => {
  let sinal
  let concluir
  const anterior = montar(signal => {
    sinal = signal
    return new Promise(resolve => { concluir = resolve })
  })
  anterior.desmontar()
  assert.equal(sinal.aborted, true)
  const nova = montar(() => new Promise(() => {}))
  concluir([undefined])
  await processar()
  assert.equal(anterior.estado().carregado, false)
  assert.equal(nova.estado().carregando, true)
  assert.equal(nova.estado().carregado, false)
  nova.desmontar()
})

test('falha de atualização mantém dados já carregados e informa erro', async () => {
  let falhar = false
  const tela = montar(async () => falhar ? [{ erro: { response: { status: 503 } } }] : [undefined])
  await processar()
  falhar = true
  await tela.atualizar()
  assert.equal(tela.estado().carregado, true)
  assert.equal(tela.estado().carregando, false)
  assert.match(tela.estado().erro, /indisponível/)
  tela.desmontar()
})
