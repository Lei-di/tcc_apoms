const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
const {
  listarSolicitacoesProdutor,
  criarSolicitacao,
  editarSolicitacao,
  excluirSolicitacao,
  listarTodasSolicitacoes,
  avaliarSolicitacao
} = require('../controllers/solicitacoes');

//produtor
router.get('/minhas', verificarToken, listarSolicitacoesProdutor);
router.post('/', verificarToken, criarSolicitacao);
router.put('/:id', verificarToken, editarSolicitacao);
router.delete('/:id', verificarToken, excluirSolicitacao);

//admin
router.get('/todas', verificarAdmin, listarTodasSolicitacoes);
router.patch('/:id/avaliar', verificarAdmin, avaliarSolicitacao);

module.exports = router;