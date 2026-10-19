const { validarDataOferta } = require('../middlewares/dataOferta')
const express = require('express')
const router = express.Router()
const { exigirVersao } = require('../middlewares/versao')

const {
  verificarToken,
  verificarAdmin
} = require('../middlewares/auth')

const {
  listarSolicitacoesProdutor,
  criarSolicitacao,
  editarSolicitacao,
  excluirSolicitacao,
  responderContraoferta,
  listarTodasSolicitacoes,
  avaliarSolicitacao
} = require('../controllers/solicitacoes')

// Produtor

router.get(
  '/minhas',
  verificarToken,
  listarSolicitacoesProdutor
)

router.post(
  '/',
  verificarToken,
  validarDataOferta,
  criarSolicitacao
)

router.put(
  '/:id',
  verificarToken,
  exigirVersao,
  validarDataOferta,
  editarSolicitacao
)

router.delete(
  '/:id',
  verificarToken,
  exigirVersao,
  excluirSolicitacao
)

router.patch(
  '/:id/contraoferta/responder',
  verificarToken,
  exigirVersao,
  responderContraoferta
)

// Administrador

router.get(
  '/todas',
  verificarAdmin,
  listarTodasSolicitacoes
)

router.patch(
  '/:id/avaliar',
  verificarAdmin,
  exigirVersao,
  avaliarSolicitacao
)

module.exports = router
