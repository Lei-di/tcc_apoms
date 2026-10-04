const pool = require('../models/db')

const listarProdutos = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM produtos WHERE cpf_produtor = $1',
      [req.produtor.cpf]
    )

    res.json(resultado.rows)
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao buscar produtos',
      erro
    })
  }
}

const cadastrarProduto = async (req, res) => {
  const {
    nome_produto,
    quantidade,
    data_disponibilidade,
    preco
  } = req.body

  const cpf_produtor = req.produtor.cpf

  try {
    const resultado = await pool.query(
      `INSERT INTO produtos
      (
        cpf_produtor,
        nome_produto,
        quantidade,
        data_disponibilidade,
        preco
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        cpf_produtor,
        nome_produto,
        quantidade,
        data_disponibilidade,
        preco
      ]
    )

    res.status(201).json(resultado.rows[0])
  } catch (erro) {
    console.error('Erro ao cadastrar produto:', erro)

    res.status(500).json({
      mensagem: 'Erro ao cadastrar produto',
      erro
    })
  }
}

const deletarProduto = async (req, res) => {
  const { id } = req.params
  const cpf_produtor = req.produtor.cpf

  try {
    const resultado = await pool.query(
      `DELETE FROM produtos
       WHERE id = $1
         AND cpf_produtor = $2
       RETURNING *`,
      [id, cpf_produtor]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado.'
      })
    }

    res.json({
      mensagem: 'Produto removido com sucesso.'
    })
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao deletar produto',
      erro
    })
  }
}


// Catálogo de produtos

const listarProdutosDisponiveis = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM lista_produtos ORDER BY nome'
    )

    res.json(resultado.rows)
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao buscar lista de produtos',
      erro
    })
  }
}

const cadastrarProdutoDisponivel = async (req, res) => {
  const nome = req.body.nome?.trim()

  if (!nome) {
    return res.status(400).json({
      mensagem: 'Informe o nome do produto.'
    })
  }

  try {
    const existente = await pool.query(
      `SELECT id
       FROM lista_produtos
       WHERE LOWER(nome) = LOWER($1)`,
      [nome]
    )

    if (existente.rows.length > 0) {
      return res.status(409).json({
        mensagem: 'Produto já cadastrado.'
      })
    }

    const resultado = await pool.query(
      `INSERT INTO lista_produtos (nome)
       VALUES ($1)
       RETURNING *`,
      [nome]
    )

    res.status(201).json(resultado.rows[0])
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao cadastrar produto na lista',
      erro
    })
  }
}

const editarProdutoDisponivel = async (req, res) => {
  const { id } = req.params
  const nome = req.body.nome?.trim()

  if (!nome) {
    return res.status(400).json({
      mensagem: 'Informe o nome do produto.'
    })
  }

  try {
    const existente = await pool.query(
      `SELECT id
       FROM lista_produtos
       WHERE LOWER(nome) = LOWER($1)
         AND id <> $2`,
      [nome, id]
    )

    if (existente.rows.length > 0) {
      return res.status(409).json({
        mensagem: 'Produto já cadastrado.'
      })
    }

    const resultado = await pool.query(
      `UPDATE lista_produtos
       SET nome = $1
       WHERE id = $2
       RETURNING *`,
      [nome, id]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado.'
      })
    }

    res.json(resultado.rows[0])
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao editar produto',
      erro
    })
  }
}

const excluirProdutoDisponivel = async (req, res) => {
  const { id } = req.params

  try {
    const resultado = await pool.query(
      `DELETE FROM lista_produtos
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado.'
      })
    }

    res.json({
      mensagem: 'Produto removido da lista com sucesso.'
    })
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao excluir produto',
      erro
    })
  }
}

module.exports = {
  listarProdutos,
  cadastrarProduto,
  deletarProduto,
  listarProdutosDisponiveis,
  cadastrarProdutoDisponivel,
  editarProdutoDisponivel,
  excluirProdutoDisponivel
}