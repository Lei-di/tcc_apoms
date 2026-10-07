const pool = require('../models/db')

const criarNotificacao = async ({
  cpf_destinatario,
  tipo,
  titulo,
  mensagem,
  link
}) => {
  try {
    await pool.query(
      `INSERT INTO notificacoes
      (
        cpf_destinatario,
        tipo,
        titulo,
        mensagem,
        link
      )
      VALUES ($1, $2, $3, $4, $5)`,
      [
        cpf_destinatario,
        tipo,
        titulo,
        mensagem,
        link || null
      ]
    )
  } catch (erro) {
    console.error(
      'Erro ao criar notificação:',
      erro
    )
  }
}

const notificarAdministradores = async ({
  tipo,
  titulo,
  mensagem,
  link
}) => {
  try {
    const resultado = await pool.query(
      `SELECT cpf
       FROM produtores
       WHERE tipo = 'admin'
         AND ativo = TRUE`
    )

    for (const administrador of resultado.rows) {
      await criarNotificacao({
        cpf_destinatario: administrador.cpf,
        tipo,
        titulo,
        mensagem,
        link
      })
    }
  } catch (erro) {
    console.error(
      'Erro ao notificar administradores:',
      erro
    )
  }
}

const listarNotificacoes = async (req, res) => {
  const cpf = req.produtor.cpf

  try {
    const resultado = await pool.query(
      `SELECT
        id,
        tipo,
        titulo,
        mensagem,
        link,
        lida,
        data_criacao
       FROM notificacoes
       WHERE cpf_destinatario = $1
       ORDER BY data_criacao DESC
       LIMIT 50`,
      [cpf]
    )

    res.json(resultado.rows)
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao buscar notificações',
      erro
    })
  }
}

const marcarComoLida = async (req, res) => {
  const { id } = req.params
  const cpf = req.produtor.cpf

  try {
    const resultado = await pool.query(
      `UPDATE notificacoes
       SET lida = TRUE
       WHERE id = $1
         AND cpf_destinatario = $2
       RETURNING *`,
      [
        id,
        cpf
      ]
    )

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem:
          'Notificação não encontrada.'
      })
    }

    res.json(resultado.rows[0])
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao atualizar notificação',
      erro
    })
  }
}

const marcarTodasComoLidas = async (req, res) => {
  const cpf = req.produtor.cpf

  try {
    await pool.query(
      `UPDATE notificacoes
       SET lida = TRUE
       WHERE cpf_destinatario = $1
         AND lida = FALSE`,
      [cpf]
    )

    res.json({
      mensagem:
        'Notificações marcadas como lidas.'
    })
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao atualizar notificações',
      erro
    })
  }
}

module.exports = {
  criarNotificacao,
  notificarAdministradores,
  listarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas
}