const pool = require('../models/db')

const {
  criarNotificacao,
  notificarAdministradores
} = require('./notificacoes')


// Produtos aprovados do produtor

const listarProdutos = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT *
       FROM produtos
       WHERE cpf_produtor = $1`,
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
    console.error(
      'Erro ao cadastrar produto:',
      erro
    )

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
      [
        id,
        cpf_produtor
      ]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem:
          'Produto não encontrado.'
      })
    }

    res.json({
      mensagem:
        'Produto removido com sucesso.'
    })
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao deletar produto',
      erro
    })
  }
}


// Catálogo de produtos

const listarProdutosDisponiveis = async (
  req,
  res
) => {
  try {
    const resultado = await pool.query(
      `SELECT *
       FROM lista_produtos
       ORDER BY nome`
    )

    res.json(resultado.rows)
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao buscar lista de produtos',
      erro
    })
  }
}

const cadastrarProdutoDisponivel = async (
  req,
  res
) => {
  const nome = req.body.nome?.trim()

  if (!nome) {
    return res.status(400).json({
      mensagem:
        'Informe o nome do produto.'
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
        mensagem:
          'Produto já cadastrado.'
      })
    }

    const resultado = await pool.query(
      `INSERT INTO lista_produtos (nome)
       VALUES ($1)
       RETURNING *`,
      [nome]
    )

    res.status(201).json(
      resultado.rows[0]
    )
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao cadastrar produto na lista',
      erro
    })
  }
}

const editarProdutoDisponivel = async (
  req,
  res
) => {
  const { id } = req.params
  const nome = req.body.nome?.trim()

  if (!nome) {
    return res.status(400).json({
      mensagem:
        'Informe o nome do produto.'
    })
  }

  try {
    const existente = await pool.query(
      `SELECT id
       FROM lista_produtos
       WHERE LOWER(nome) = LOWER($1)
         AND id <> $2`,
      [
        nome,
        id
      ]
    )

    if (existente.rows.length > 0) {
      return res.status(409).json({
        mensagem:
          'Produto já cadastrado.'
      })
    }

    const resultado = await pool.query(
      `UPDATE lista_produtos
       SET nome = $1
       WHERE id = $2
       RETURNING *`,
      [
        nome,
        id
      ]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem:
          'Produto não encontrado.'
      })
    }

    res.json(resultado.rows[0])
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao editar produto',
      erro
    })
  }
}

const excluirProdutoDisponivel = async (
  req,
  res
) => {
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
        mensagem:
          'Produto não encontrado.'
      })
    }

    res.json({
      mensagem:
        'Produto removido da lista com sucesso.'
    })
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao excluir produto',
      erro
    })
  }
}


// Solicitações de inclusão de produtos

const criarSolicitacaoProduto = async (
  req,
  res
) => {
  const cpf_produtor = req.produtor.cpf

  const nomeProduto =
    req.body.nome_produto?.trim()

  const observacao =
    req.body.observacao_produtor?.trim() ||
    null

  if (!nomeProduto) {
    return res.status(400).json({
      mensagem:
        'Informe o nome do produto.'
    })
  }

  try {
    const produtoExistente =
      await pool.query(
        `SELECT id, nome
         FROM lista_produtos
         WHERE LOWER(TRIM(nome)) =
               LOWER(TRIM($1))`,
        [nomeProduto]
      )

    if (
      produtoExistente.rows.length > 0
    ) {
      return res.status(409).json({
        mensagem:
          'Esse produto já está disponível no catálogo.'
      })
    }

    const solicitacaoPendente =
      await pool.query(
        `SELECT id
         FROM solicitacoes_produtos
         WHERE LOWER(TRIM(nome_produto)) =
               LOWER(TRIM($1))
           AND status = 'pendente'`,
        [nomeProduto]
      )

    if (
      solicitacaoPendente.rows.length > 0
    ) {
      return res.status(409).json({
        mensagem:
          'Já existe uma solicitação pendente para esse produto.'
      })
    }

    const resultado = await pool.query(
      `INSERT INTO solicitacoes_produtos
      (
        cpf_produtor,
        nome_produto,
        observacao_produtor
      )
      VALUES ($1, $2, $3)
      RETURNING *`,
      [
        cpf_produtor,
        nomeProduto,
        observacao
      ]
    )

    const produtor = await pool.query(
      `SELECT nome
       FROM produtores
       WHERE cpf = $1`,
      [cpf_produtor]
    )

    const nomeProdutor =
      produtor.rows[0]?.nome ||
      'Um produtor'

    await notificarAdministradores({
      tipo:
        'solicitacao_inclusao_produto',

      titulo:
        'Nova solicitação de produto',

      mensagem:
        `${nomeProdutor} solicitou a inclusão de ${nomeProduto} no catálogo.`,

      link:
        '/admin'
    })

    res.status(201).json(
      resultado.rows[0]
    )
  } catch (erro) {
    console.error(
      'Erro ao solicitar inclusão de produto:',
      erro
    )

    res.status(500).json({
      mensagem:
        'Erro ao enviar solicitação de produto.',
      erro
    })
  }
}

const listarMinhasSolicitacoesProdutos =
  async (req, res) => {
    try {
      const resultado =
        await pool.query(
          `SELECT *
           FROM solicitacoes_produtos
           WHERE cpf_produtor = $1
           ORDER BY data_solicitacao DESC`,
          [req.produtor.cpf]
        )

      res.json(resultado.rows)
    } catch (erro) {
      res.status(500).json({
        mensagem:
          'Erro ao buscar solicitações de produtos.',
        erro
      })
    }
  }

const listarSolicitacoesProdutosAdmin =
  async (req, res) => {
    try {
      const resultado =
        await pool.query(
          `SELECT
             s.*,
             p.nome AS nome_produtor
           FROM solicitacoes_produtos s
           JOIN produtores p
             ON p.cpf = s.cpf_produtor
           ORDER BY
             CASE
               WHEN s.status = 'pendente'
               THEN 0
               ELSE 1
             END,
             s.data_solicitacao DESC`
        )

      res.json(resultado.rows)
    } catch (erro) {
      res.status(500).json({
        mensagem:
          'Erro ao buscar solicitações de produtos.',
        erro
      })
    }
  }

const avaliarSolicitacaoProduto = async (
  req,
  res
) => {
  const { id } = req.params

  const {
    status,
    retorno_admin,
    nome_produto_aprovado
  } = req.body

  if (
    ![
      'aprovado',
      'rejeitado'
    ].includes(status)
  ) {
    return res.status(400).json({
      mensagem:
        'Status inválido.'
    })
  }

  if (
    status === 'rejeitado' &&
    !retorno_admin?.trim()
  ) {
    return res.status(400).json({
      mensagem:
        'Informe o motivo da rejeição.'
    })
  }

  const cliente = await pool.connect()

  try {
    await cliente.query('BEGIN')

    const resultadoSolicitacao =
      await cliente.query(
        `SELECT
           s.*,
           p.nome AS nome_produtor
         FROM solicitacoes_produtos s
         JOIN produtores p
           ON p.cpf = s.cpf_produtor
         WHERE s.id = $1
           AND s.status = 'pendente'
         FOR UPDATE OF s`,
        [id]
      )

    if (
      resultadoSolicitacao.rows.length === 0
    ) {
      await cliente.query('ROLLBACK')

      return res.status(404).json({
        mensagem:
          'Solicitação não encontrada ou já avaliada.'
      })
    }

    const solicitacao =
      resultadoSolicitacao.rows[0]

    if (status === 'aprovado') {
      const nomeFinal =
        (
          nome_produto_aprovado ||
          solicitacao.nome_produto
        ).trim()

      if (!nomeFinal) {
        await cliente.query('ROLLBACK')

        return res.status(400).json({
          mensagem:
            'Informe o nome que será adicionado ao catálogo.'
        })
      }

      const produtoExistente =
        await cliente.query(
          `SELECT id, nome
           FROM lista_produtos
           WHERE LOWER(TRIM(nome)) =
                 LOWER(TRIM($1))`,
          [nomeFinal]
        )

      if (
        produtoExistente.rows.length === 0
      ) {
        await cliente.query(
          `INSERT INTO lista_produtos (nome)
           VALUES ($1)`,
          [nomeFinal]
        )
      }

      const atualizado =
        await cliente.query(
          `UPDATE solicitacoes_produtos
           SET
             status = 'aprovado',
             retorno_admin = $1,
             nome_produto_aprovado = $2,
             data_avaliacao = NOW()
           WHERE id = $3
           RETURNING *`,
          [
            retorno_admin?.trim() ||
              null,
            nomeFinal,
            id
          ]
        )

      await cliente.query('COMMIT')

      await criarNotificacao({
        cpf_destinatario:
          solicitacao.cpf_produtor,

        tipo:
          'produto_incluido',

        titulo:
          'Produto incluído no catálogo',

        mensagem:
          `Sua solicitação foi aprovada. ${nomeFinal} já está disponível no catálogo da APOMS.`,

        link:
          '/solicitacoes'
      })

      return res.json(
        atualizado.rows[0]
      )
    }

    const atualizado =
      await cliente.query(
        `UPDATE solicitacoes_produtos
         SET
           status = 'rejeitado',
           retorno_admin = $1,
           data_avaliacao = NOW()
         WHERE id = $2
         RETURNING *`,
        [
          retorno_admin.trim(),
          id
        ]
      )

    await cliente.query('COMMIT')

    await criarNotificacao({
      cpf_destinatario:
        solicitacao.cpf_produtor,

      tipo:
        'produto_nao_incluido',

      titulo:
        'Solicitação de produto rejeitada',

      mensagem:
        `A solicitação de inclusão de ${solicitacao.nome_produto} não foi aprovada. Consulte o retorno da APOMS.`,

      link:
        '/solicitacoes'
    })

    res.json(
      atualizado.rows[0]
    )
  } catch (erro) {
    await cliente.query('ROLLBACK')

    console.error(
      'Erro ao avaliar solicitação de produto:',
      erro
    )

    res.status(500).json({
      mensagem:
        'Erro ao avaliar solicitação de produto.',
      erro
    })
  } finally {
    cliente.release()
  }
}


module.exports = {
  listarProdutos,
  cadastrarProduto,
  deletarProduto,

  listarProdutosDisponiveis,
  cadastrarProdutoDisponivel,
  editarProdutoDisponivel,
  excluirProdutoDisponivel,

  criarSolicitacaoProduto,
  listarMinhasSolicitacoesProdutos,
  listarSolicitacoesProdutosAdmin,
  avaliarSolicitacaoProduto
}