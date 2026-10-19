const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

function carregar(nome, banco) {
  const contexto = {
    module: { exports: {} }, console,
    require: dependencia => {
      if (dependencia === '../models/db') return banco
      if (dependencia === './notificacoes') return {
        criarNotificacao: async () => {},
        notificarAdministradores: async () => {},
        resolverNotificacoesRelacionadas: async () => {},
      }
      throw Error(dependencia)
    },
  }
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../controllers', nome + '.js'), 'utf8'), contexto)
  return contexto.module.exports
}

function resposta() {
  return {
    codigo: 200,
    status(codigo) { this.codigo = codigo; return this },
    json(dados) { this.dados = dados; return this },
  }
}

const casos = [
  ['solicitacoes', 'editarSolicitacao', 8, false],
  ['solicitacoes', 'excluirSolicitacao', 3, false],
  ['solicitacoes', 'responderContraoferta', 3, true],
  ['solicitacoes', 'avaliarSolicitacao', 2, true],
  ['produtos', 'avaliarSolicitacaoProduto', 2, true],
]

function bancoContraoferta(campos = {}) {
  const chamadas = []
  const oferta = {
    id: 1, cpf_produtor: '123', nome_produto: 'Alface',
    quantidade: '10 kg', preco: '5', versao: '42',
    quantidade_contraoferta: '8 kg', preco_contraoferta: '4',
    ...campos,
  }
  return {
    chamadas,
    async query(sql, parametros) {
      chamadas.push({ sql, parametros })
      if (sql.includes('FROM produtores')) return { rows: [{ nome: 'Produtor' }] }
      return { rows: sql.includes('FROM solicitacoes') || sql.includes('UPDATE solicitacoes') ? [oferta] : [] }
    },
    async connect() { return this },
    release() {},
  }
}

test('aceitação usa exatamente os valores da contraoferta', async () => {
  const banco = bancoContraoferta()
  const res = resposta()
  await carregar('solicitacoes', banco).responderContraoferta({
    params: { id: 1 }, produtor: { cpf: '123' },
    body: { versao: '42', resposta: 'aceitar' },
  }, res)
  assert.equal(res.codigo, 200)
  const insercao = banco.chamadas.find(item => item.sql.includes('INSERT INTO produtos'))
  assert.equal(insercao.parametros[2], '8 kg')
  assert.equal(insercao.parametros[4], '4')
  assert.equal(banco.chamadas.some(item => item.sql === 'COMMIT'), true)
})

test('aceitação nunca substitui quantidade ou preço inválidos pelos originais', async () => {
  for (const campo of ['quantidade_contraoferta', 'preco_contraoferta']) {
    for (const valor of [undefined, null, '', ' ', 0, -1, 'inválido', Infinity]) {
      const banco = bancoContraoferta({ [campo]: valor })
      const res = resposta()
      await carregar('solicitacoes', banco).responderContraoferta({
        params: { id: 1 }, produtor: { cpf: '123' },
        body: { versao: '42', resposta: 'aceitar' },
      }, res)
      assert.equal(res.codigo, 409, `${campo}: ${valor}`)
      assert.equal(banco.chamadas.some(item => /^\s*(UPDATE|INSERT|COMMIT)\b/.test(item.sql)), false)
      assert.equal(banco.chamadas.some(item => item.sql === 'ROLLBACK'), true)
    }
  }
})

test('envio da contraoferta exige os dois campos, sem completar com a oferta original', async () => {
  for (const campo of ['quantidade_contraoferta', 'preco_contraoferta']) {
    for (const valor of [undefined, null, '', ' ', 0, -1, 'inválido', Infinity]) {
      const banco = bancoContraoferta()
      const res = resposta()
      await carregar('solicitacoes', banco).avaliarSolicitacao({
        params: { id: 1 },
        body: {
          versao: '42', status: 'contraoferta',
          quantidade_contraoferta: 8, preco_contraoferta: 4, [campo]: valor,
        },
      }, res)
      assert.equal(res.codigo, 400, `${campo}: ${valor}`)
      assert.equal(banco.chamadas.some(item => /^\s*(UPDATE|INSERT|COMMIT)\b/.test(item.sql)), false)
    }
  }
})

for (const [arquivo, acao, parametroVersao, transacao] of casos) {
  test(`${acao}: versão antiga ou registro removido não produz efeitos`, async () => {
    const chamadas = []
    let liberado = false
    const banco = {
      async query(sql, parametros) {
        chamadas.push(sql)
        if (['BEGIN', 'ROLLBACK'].includes(sql)) return { rows: [] }
        assert.match(sql, new RegExp(`xmin::text = \\$${parametroVersao}\\b`))
        assert.equal(parametros[parametroVersao - 1], '42')
        if (transacao) assert.match(sql, /FOR UPDATE/)
        return { rows: [] }
      },
      async connect() { return this },
      release() { liberado = true },
    }
    const req = {
      params: { id: '1' }, produtor: { cpf: '123' },
      body: { versao: '42', status: 'aprovado', resposta: 'aceitar' },
    }
    const res = resposta()
    await carregar(arquivo, banco)[acao](req, res)
    assert.equal(res.codigo, 409)
    assert.match(res.dados.mensagem, /alterada/)
    assert.equal(chamadas.length, transacao ? 3 : 1)
    assert.equal(chamadas.includes('COMMIT'), false)
    assert.equal(liberado, transacao)
  })
}

test('aprovação com versão atual confirma a transação e cria um produto', async () => {
  const chamadas = []
  const oferta = { id: 1, cpf_produtor: '123', nome_produto: 'Alface', quantidade: '10 kg', preco: '5', status: 'pendente', versao: '42' }
  const banco = {
    async query(sql) {
      chamadas.push(sql)
      return { rows: sql.includes('FROM solicitacoes') || sql.includes('UPDATE solicitacoes') ? [oferta] : [] }
    },
    async connect() { return this },
    release() {},
  }
  const res = resposta()
  await carregar('solicitacoes', banco).avaliarSolicitacao({
    params: { id: 1 }, body: { versao: '42', status: 'aprovado' },
  }, res)
  assert.equal(res.codigo, 200)
  assert.equal(chamadas.filter(sql => sql.includes('INSERT INTO produtos')).length, 1)
  assert.equal(chamadas.includes('COMMIT'), true)
  assert.equal(chamadas.includes('ROLLBACK'), false)
})
