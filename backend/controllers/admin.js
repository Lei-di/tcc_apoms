const pool = require('../models/db')

const validarCpf = (cpf) => {
  const cpfLimpo = String(cpf || '').replace(/\D/g, '')

  if (cpfLimpo.length !== 11) {
    return false
  }

  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return false
  }

  let soma = 0

  for (let i = 0; i < 9; i++) {
    soma += Number(cpfLimpo[i]) * (10 - i)
  }

  let primeiroDigito = (soma * 10) % 11

  if (primeiroDigito === 10) {
    primeiroDigito = 0
  }

  if (primeiroDigito !== Number(cpfLimpo[9])) {
    return false
  }

  soma = 0

  for (let i = 0; i < 10; i++) {
    soma += Number(cpfLimpo[i]) * (11 - i)
  }

  let segundoDigito = (soma * 10) % 11

  if (segundoDigito === 10) {
    segundoDigito = 0
  }

  return segundoDigito === Number(cpfLimpo[10])
}

const listarProdutores = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT
        cpf,
        nome,
        telefone,
        email,
        cidade,
        endereco,
        ativo,
        data_ativacao
       FROM produtores
       WHERE tipo = $1
       ORDER BY nome`,
      ['produtor']
    )

    res.json(resultado.rows)
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao buscar produtores',
      erro
    })
  }
}

const cadastrarProdutor = async (req, res) => {
  const cpf = String(req.body.cpf || '').replace(/\D/g, '')
  const nome = req.body.nome?.trim()

  if (!validarCpf(cpf)) {
    return res.status(400).json({
      mensagem: 'CPF inválido.'
    })
  }

  if (!nome) {
    return res.status(400).json({
      mensagem: 'Informe o nome completo do produtor.'
    })
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO produtores
        (
          cpf,
          nome,
          telefone,
          email,
          cidade,
          endereco,
          tipo,
          ativo,
          data_ativacao
        )
       VALUES (
         $1,
         $2,
         NULL,
         NULL,
         NULL,
         NULL,
         $3,
         $4,
         NULL
       )
       RETURNING cpf, nome, ativo`,
      [
        cpf,
        nome,
        'produtor',
        false
      ]
    )

    res.status(201).json(resultado.rows[0])
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({
        mensagem: 'CPF já cadastrado.'
      })
    }

    console.error(
      'Erro ao cadastrar produtor:',
      erro
    )

    res.status(500).json({
      mensagem: 'Erro ao cadastrar produtor',
      erro
    })
  }
}

const editarProdutor = async (req, res) => {
  const { cpf } = req.params

  const {
    nome,
    telefone,
    email,
    cidade,
    endereco
  } = req.body

  try {
    const resultado = await pool.query(
      `UPDATE produtores
       SET
         nome = $1,
         telefone = $2,
         email = $3,
         cidade = $4,
         endereco = $5
       WHERE cpf = $6
         AND tipo = $7
       RETURNING cpf, nome`,
      [
        nome,
        telefone,
        email,
        cidade,
        endereco,
        cpf,
        'produtor'
      ]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Produtor não encontrado.'
      })
    }

    res.json(resultado.rows[0])
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao editar produtor',
      erro
    })
  }
}

const toggleAtivoProdutor = async (req, res) => {
  const { cpf } = req.params

  try {
    const resultado = await pool.query(
      `UPDATE produtores
       SET ativo = NOT ativo
       WHERE cpf = $1
         AND tipo = $2
       RETURNING cpf, nome, ativo`,
      [
        cpf,
        'produtor'
      ]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Produtor não encontrado.'
      })
    }

    res.json(resultado.rows[0])
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao atualizar status do produtor',
      erro
    })
  }
}

module.exports = {
  listarProdutores,
  cadastrarProdutor,
  editarProdutor,
  toggleAtivoProdutor
}