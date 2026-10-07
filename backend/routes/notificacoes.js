const express = require('express')
const router = express.Router()

const {
  verificarToken
} = require('../middlewares/auth')

const {
  listarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas
} = require('../controllers/notificacoes')

router.get(
  '/',
  verificarToken,
  listarNotificacoes
)

router.patch(
  '/ler-todas',
  verificarToken,
  marcarTodasComoLidas
)

router.patch(
  '/:id/lida',
  verificarToken,
  marcarComoLida
)

module.exports = router