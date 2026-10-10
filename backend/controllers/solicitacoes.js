const pool = require('../models/db')

const {
  criarNotificacao,
  notificarAdministradores
} = require('./notificacoes')

// Produtor

const cadastroProdutorCompleto = async (cpf) => {
  const resultado = await pool.query(
    `SELECT
      nome,
      telefone,
      email,
      cidade,
      endereco,
      ativo
     FROM produtores
     WHERE cpf = $1
       AND tipo = 'produtor'`,
    [cpf]
  )

  if (resultado.rows.length === 0) {
    return {
      completo: false,
      ativo: false,
      nome: ''
    }
  }

  const produtor = resultado.rows[0]

  const completo = Boolean(
    produtor.nome?.trim() &&
    produtor.telefone?.trim() &&
    produtor.email?.trim() &&
    produtor.cidade?.trim() &&
    produtor.endereco?.trim()
  )

  return {
    completo,
    ativo: produtor.ativo,
    nome: produtor.nome
  }
}

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
    const situacaoProdutor =
      await cadastroProdutorCompleto(
        cpf_produtor
      )

    if (!situacaoProdutor.ativo) {
      return res.status(403).json({
        codigo: 'ACESSO_INATIVO',
        mensagem:
          'Seu acesso ao sistema está inativo.'
      })
    }

    if (!situacaoProdutor.completo) {
      return res.status(403).json({
        codigo: 'CADASTRO_INCOMPLETO',
        mensagem:
          'Complete seus dados antes de enviar uma oferta.'
      })
    }

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

    await notificarAdministradores({
      tipo: 'nova_solicitacao',
      titulo: 'Nova solicitação',
      mensagem:
        `${situacaoProdutor.nome} enviou uma nova oferta de ${nome_produto}.`,
      link: '/admin'
    })

    res.status(201).json(
      resultado.rows[0]
    )
  } catch (erro) {
    console.error(
      'Erro ao criar solicitação:',
      erro
    )

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
         observacao_produtor = $5
       WHERE id = $6
         AND cpf_produtor = $7
         AND status = 'pendente'
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
      tipo: 'solicitacao_atualizada',
      titulo: 'Solicitação atualizada',
      mensagem:
        `${nomeProdutor} atualizou a oferta de ${nome_produto}.`,
      link: '/admin'
    })

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
      [
        id,
        cpf_produtor
      ]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem:
          'Solicitação não encontrada ou já avaliada.'
      })
    }

    res.json({
      mensagem:
        'Solicitação excluída com sucesso.'
    })
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao excluir solicitação',
      erro
    })
  }
}

const responderContraoferta = async (req, res) => {
  const { id } = req.params
  const { resposta } = req.body

  const cpf_produtor = req.produtor.cpf

  if (
    ![
      'aceitar',
      'recusar'
    ].includes(resposta)
  ) {
    return res.status(400).json({
      mensagem:
        'Resposta da contraoferta inválida.'
    })
  }

  const cliente = await pool.connect()

  try {
    await cliente.query('BEGIN')

    const resultado = await cliente.query(
      `SELECT *
       FROM solicitacoes
       WHERE id = $1
         AND cpf_produtor = $2
         AND status = 'contraoferta'
       FOR UPDATE`,
      [
        id,
        cpf_produtor
      ]
    )

    if (resultado.rows.length === 0) {
      await cliente.query('ROLLBACK')

      return res.status(404).json({
        mensagem:
          'Contraoferta não encontrada ou já respondida.'
      })
    }

    const solicitacao = resultado.rows[0]

    const produtorResultado =
      await cliente.query(
        `SELECT nome
         FROM produtores
         WHERE cpf = $1`,
        [cpf_produtor]
      )

    const nomeProdutor =
      produtorResultado.rows[0]?.nome ||
      'Produtor'

    if (resposta === 'aceitar') {
      const quantidadeFinal =
        solicitacao.quantidade_contraoferta ||
        solicitacao.quantidade

      const precoFinal =
        solicitacao.preco_contraoferta ||
        solicitacao.preco

      await cliente.query(
        `UPDATE solicitacoes
         SET
           status = 'contraoferta_aceita',
           data_resposta_contraoferta = NOW()
         WHERE id = $1`,
        [id]
      )

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
          quantidadeFinal,
          solicitacao.data_disponibilidade,
          precoFinal
        ]
      )

      await cliente.query('COMMIT')

      await notificarAdministradores({
        tipo: 'contraoferta_aceita',
        titulo: 'Contraoferta aceita',
        mensagem:
          `${nomeProdutor} aceitou a contraoferta de ${solicitacao.nome_produto}.`,
        link: '/admin'
      })

      return res.json({
        mensagem:
          'Contraoferta aceita com sucesso.'
      })
    }

    await cliente.query(
      `UPDATE solicitacoes
       SET
         status = 'contraoferta_recusada',
         data_resposta_contraoferta = NOW()
       WHERE id = $1`,
      [id]
    )

    await cliente.query('COMMIT')

    await notificarAdministradores({
      tipo: 'contraoferta_recusada',
      titulo: 'Contraoferta recusada',
      mensagem:
        `${nomeProdutor} recusou a contraoferta de ${solicitacao.nome_produto}.`,
      link: '/admin'
    })

    res.json({
      mensagem:
        'Contraoferta recusada.'
    })
  } catch (erro) {
    await cliente.query('ROLLBACK')

    console.error(
      'Erro ao responder contraoferta:',
      erro
    )

    res.status(500).json({
      mensagem:
        'Erro ao responder contraoferta',
      erro
    })
  } finally {
    cliente.release()
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
       ORDER BY s.data_solicitacao DESC`
    )

    res.json(resultado.rows)
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao buscar solicitações',
      erro
    })
  }
}

const avaliarSolicitacao = async (req, res) => {
  const { id } = req.params

  const {
    status,
    observacao,
    preco_contraoferta,
    quantidade_contraoferta
  } = req.body

  if (
    ![
      'aprovado',
      'rejeitado',
      'contraoferta'
    ].includes(status)
  ) {
    return res.status(400).json({
      mensagem: 'Status inválido.'
    })
  }

  if (!observacao?.trim()) {
    return res.status(400).json({
      mensagem:
        'Informe um comentário para a avaliação.'
    })
  }

  const cliente = await pool.connect()

  try {
    await cliente.query('BEGIN')

    const resultadoAtual =
      await cliente.query(
        `SELECT *
         FROM solicitacoes
         WHERE id = $1
           AND status = 'pendente'
         FOR UPDATE`,
        [id]
      )

    if (resultadoAtual.rows.length === 0) {
      await cliente.query('ROLLBACK')

      return res.status(404).json({
        mensagem:
          'Solicitação não encontrada ou já avaliada.'
      })
    }

    const solicitacaoAtual =
      resultadoAtual.rows[0]

    let solicitacao

    if (status === 'contraoferta') {
      const quantidadeProposta =
        String(
          quantidade_contraoferta ||
          solicitacaoAtual.quantidade
        ).trim()

      const precoProposto =
        preco_contraoferta !== null &&
        preco_contraoferta !== undefined &&
        preco_contraoferta !== ''
          ? Number(preco_contraoferta)
          : Number(solicitacaoAtual.preco)

      if (
        !quantidadeProposta ||
        Number.isNaN(precoProposto) ||
        precoProposto <= 0
      ) {
        await cliente.query('ROLLBACK')

        return res.status(400).json({
          mensagem:
            'Informe valores válidos para a contraoferta.'
        })
      }

      const quantidadeMudou =
        quantidadeProposta !==
        solicitacaoAtual.quantidade

      const precoMudou =
        Number(precoProposto) !==
        Number(solicitacaoAtual.preco)

      if (
        !quantidadeMudou &&
        !precoMudou
      ) {
        await cliente.query('ROLLBACK')

        return res.status(400).json({
          mensagem:
            'Altere o preço ou a quantidade para enviar uma contraoferta.'
        })
      }

      const resultado =
        await cliente.query(
          `UPDATE solicitacoes
           SET
             status = 'contraoferta',
             observacao = $1,
             quantidade_contraoferta = $2,
             preco_contraoferta = $3,
             data_avaliacao = NOW(),
             data_contraoferta = NOW()
           WHERE id = $4
           RETURNING *`,
          [
            observacao.trim(),
            quantidadeProposta,
            precoProposto,
            id
          ]
        )

      solicitacao =
        resultado.rows[0]
    } else {
      const resultado =
        await cliente.query(
          `UPDATE solicitacoes
           SET
             status = $1,
             observacao = $2,
             data_avaliacao = NOW(),
             quantidade_contraoferta = NULL,
             preco_contraoferta = NULL,
             data_contraoferta = NULL,
             data_resposta_contraoferta = NULL
           WHERE id = $3
           RETURNING *`,
          [
            status,
            observacao.trim(),
            id
          ]
        )

      solicitacao =
        resultado.rows[0]

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
    }

    await cliente.query('COMMIT')

    if (status === 'aprovado') {
      await criarNotificacao({
        cpf_destinatario:
          solicitacao.cpf_produtor,

        tipo:
          'solicitacao_aprovada',

        titulo:
          'Oferta aprovada',

        mensagem:
          `Sua oferta de ${solicitacao.nome_produto} foi aprovada pela APOMS.`,

        link:
          '/solicitacoes'
      })
    }

    if (status === 'rejeitado') {
      await criarNotificacao({
        cpf_destinatario:
          solicitacao.cpf_produtor,

        tipo:
          'solicitacao_rejeitada',

        titulo:
          'Oferta rejeitada',

        mensagem:
          `Sua oferta de ${solicitacao.nome_produto} foi rejeitada. Consulte o retorno da APOMS.`,

        link:
          '/solicitacoes'
      })
    }

    if (status === 'contraoferta') {
      await criarNotificacao({
        cpf_destinatario:
          solicitacao.cpf_produtor,

        tipo:
          'contraoferta_recebida',

        titulo:
          'Nova contraoferta',

        mensagem:
          `A APOMS enviou uma contraoferta para ${solicitacao.nome_produto}.`,

        link:
          '/solicitacoes'
      })
    }

    res.json(solicitacao)
  } catch (erro) {
    await cliente.query('ROLLBACK')

    console.error(
      'Erro ao avaliar solicitação:',
      erro
    )

    res.status(500).json({
      mensagem:
        'Erro ao avaliar solicitação',
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
  responderContraoferta,
  listarTodasSolicitacoes,
  avaliarSolicitacao
}