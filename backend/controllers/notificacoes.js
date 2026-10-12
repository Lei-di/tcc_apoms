const pool = require('../models/db')

const TIPOS_ACIONAVEIS = [
  'nova_solicitacao',
  'solicitacao_atualizada',
  'solicitacao_inclusao_produto',
  'contraoferta_recebida'
]

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

    for (
      const administrador
      of resultado.rows
    ) {
      await criarNotificacao({
        cpf_destinatario:
          administrador.cpf,

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

const resolverNotificacoesRelacionadas =
  async ({
    link,
    tipos = []
  }) => {
    if (!link) {
      return
    }

    try {
      const parametros = [
        link
      ]

      let filtroTipos = ''

      if (
        Array.isArray(tipos) &&
        tipos.length > 0
      ) {
        parametros.push(
          tipos
        )

        filtroTipos = `
          AND tipo = ANY($2::text[])
        `
      }

      await pool.query(
        `UPDATE notificacoes
         SET lida = TRUE
         WHERE link = $1
           AND lida = FALSE
           ${filtroTipos}`,
        parametros
      )
    } catch (erro) {
      console.error(
        'Erro ao resolver notificações relacionadas:',
        erro
      )
    }
  }

const listarNotificacoes = async (
  req,
  res
) => {
  const cpf =
    req.produtor.cpf

  try {
    const resultado =
      await pool.query(
        `SELECT
           n.id,
           n.tipo,
           n.titulo,
           n.mensagem,
           n.link,
           n.lida,
           n.data_criacao
         FROM notificacoes n
         WHERE
           n.cpf_destinatario = $1

           AND
           (
             (
               n.tipo IN (
                 'nova_solicitacao',
                 'solicitacao_atualizada'
               )

               AND EXISTS (
                 SELECT 1
                 FROM solicitacoes s
                 WHERE
                   n.link =
                     '/admin?tipo=oferta&id='
                     || s.id::text

                   AND s.status =
                     'pendente'
               )
             )

             OR

             (
               n.tipo =
                 'solicitacao_inclusao_produto'

               AND EXISTS (
                 SELECT 1
                 FROM solicitacoes_produtos sp
                 WHERE
                   n.link =
                     '/admin?tipo=inclusao&id='
                     || sp.id::text

                   AND sp.status =
                     'pendente'
               )
             )

             OR

             (
               n.tipo =
                 'contraoferta_recebida'

               AND EXISTS (
                 SELECT 1
                 FROM solicitacoes s
                 WHERE
                   n.link =
                     '/solicitacoes?tipo=oferta&id='
                     || s.id::text

                   AND s.status =
                     'contraoferta'
               )
             )

             OR

             (
               n.tipo NOT IN (
                 'nova_solicitacao',
                 'solicitacao_atualizada',
                 'solicitacao_inclusao_produto',
                 'contraoferta_recebida'
               )

               AND n.lida = FALSE
             )
           )

         ORDER BY
           n.data_criacao DESC

         LIMIT 50`,
        [
          cpf
        ]
      )

    res.json(
      resultado.rows
    )
  } catch (erro) {
    console.error(
      'Erro ao buscar notificações:',
      erro
    )

    res.status(500).json({
      mensagem:
        'Erro ao buscar notificações',

      erro
    })
  }
}

const marcarComoLida = async (
  req,
  res
) => {
  const { id } =
    req.params

  const cpf =
    req.produtor.cpf

  try {
    const resultado =
      await pool.query(
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

    if (
      resultado.rows.length ===
      0
    ) {
      return res.status(404).json({
        mensagem:
          'Notificação não encontrada.'
      })
    }

    res.json(
      resultado.rows[0]
    )
  } catch (erro) {
    res.status(500).json({
      mensagem:
        'Erro ao atualizar notificação',

      erro
    })
  }
}

const marcarTodasComoLidas =
  async (
    req,
    res
  ) => {
    const cpf =
      req.produtor.cpf

    try {
      await pool.query(
        `UPDATE notificacoes
         SET lida = TRUE
         WHERE cpf_destinatario = $1
           AND lida = FALSE`,
        [
          cpf
        ]
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
  TIPOS_ACIONAVEIS,

  criarNotificacao,
  notificarAdministradores,

  resolverNotificacoesRelacionadas,

  listarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas
}