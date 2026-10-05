const pool = require('../models/db')

// Produtor

const listarSolicitacoesProdutor = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT *
       FROM solicitacoes
       WHERE cpf_produtor = $1
       ORDER BY data_solicitacao DESC`,
      [req.produtor.cpf]
    )

    res.json(resultado.rows)
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao buscar solicitações',
      erro
    })
  }
}

const criarSolicitacao = async (req, res) => {
  const {
    nome_produto,
    quantidade,
    data_disponibilidade,
    preco,
    observacao_produtor
  } = req.body

  const cpf_produtor = req.produtor.cpf

  try {
    const resultado = await pool.query(
      `INSERT INTO solicitacoes
        (
          cpf_produtor,
          nome_produto,
          quantidade,
          data_disponibilidade,
          preco,
          observacao_produtor
        )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        cpf_produtor,
        nome_produto,
        quantidade,
        data_disponibilidade,
        preco,
        observacao_produtor || null
      ]
    )

    res.status(201).json(resultado.rows[0])
  } catch (erro) {
    console.error('Erro ao criar solicitação:', erro)

    res.status(500).json({
      mensagem: 'Erro ao criar solicitação',
      erro
    })
  }
}

const editarSolicitacao = async (req, res) => {
  const { id } = req.params

  const {
    nome_produto,
    quantidade,
    data_disponibilidade,
    preco,
    observacao_produtor
  } = req.body

  const cpf_produtor = req.produtor.cpf

  try {
    const resultado = await pool.query(
      `UPDATE solicitacoes
       SET
         nome_produto = $1,
         quantidade = $2,
         data_disponibilidade = $3,
         preco = $4,
         observacao_produtor = $5,
         status = 'pendente',
         observacao = NULL,
         data_avaliacao = NULL
       WHERE id = $6
         AND cpf_produtor = $7
         AND status IN ('pendente', 'rejeitado')
       RETURNING *`,
      [
        nome_produto,
        quantidade,
        data_disponibilidade,
        preco,
        observacao_produtor || null,
        id,
        cpf_produtor
      ]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem:
          'Solicitação não encontrada ou não pode mais ser editada.'
      })
    }

    res.json(resultado.rows[0])
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao editar solicitação',
      erro
    })
  }
}

const excluirSolicitacao = async (req, res) => {
  const { id } = req.params
  const cpf_produtor = req.produtor.cpf

  try {
    const resultado = await pool.query(
      `DELETE FROM solicitacoes
       WHERE id = $1
         AND cpf_produtor = $2
         AND status = 'pendente'
       RETURNING *`,
      [id, cpf_produtor]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem:
          'Solicitação não encontrada ou já avaliada.'
      })
    }

    res.json({
      mensagem: 'Solicitação excluída com sucesso.'
    })
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao excluir solicitação',
      erro
    })
  }
}


// Administrador

const listarTodasSolicitacoes = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT
         s.*,
         p.nome AS nome_produtor,
         p.cidade AS nucleo_produtivo
       FROM solicitacoes s
       JOIN produtores p
         ON s.cpf_produtor = p.cpf
       ORDER BY data_solicitacao DESC`
    )

    res.json(resultado.rows)
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao buscar solicitações',
      erro
    })
  }
}

const avaliarSolicitacao = async (req, res) => {
  const { id } = req.params
  const { status, observacao } = req.body

  if (!['aprovado', 'rejeitado'].includes(status)) {
    return res.status(400).json({
      mensagem: 'Status inválido.'
    })
  }

  const cliente = await pool.connect()

  try {
    await cliente.query('BEGIN')

    const resultado = await cliente.query(
      `UPDATE solicitacoes
       SET
         status = $1,
         observacao = $2,
         data_avaliacao = NOW()
       WHERE id = $3
         AND status = 'pendente'
       RETURNING *`,
      [
        status,
        observacao,
        id
      ]
    )

    if (resultado.rows.length === 0) {
      await cliente.query('ROLLBACK')

      return res.status(404).json({
        mensagem:
          'Solicitação não encontrada ou já avaliada.'
      })
    }

    const solicitacao = resultado.rows[0]

    if (status === 'aprovado') {
      await cliente.query(
        `INSERT INTO produtos
        (
          cpf_produtor,
          nome_produto,
          quantidade,
          data_disponibilidade,
          preco
        )
        VALUES ($1, $2, $3, $4, $5)`,
        [
          solicitacao.cpf_produtor,
          solicitacao.nome_produto,
          solicitacao.quantidade,
          solicitacao.data_disponibilidade,
          solicitacao.preco
        ]
      )
    }

    await cliente.query('COMMIT')

    res.json(solicitacao)
  } catch (erro) {
    await cliente.query('ROLLBACK')

    console.error('Erro ao avaliar solicitação:', erro)

    res.status(500).json({
      mensagem: 'Erro ao avaliar solicitação',
      erro
    })
  } finally {
    cliente.release()
  }
}

module.exports = {
  listarSolicitacoesProdutor,
  criarSolicitacao,
  editarSolicitacao,
  excluirSolicitacao,
  listarTodasSolicitacoes,
  avaliarSolicitacao
}