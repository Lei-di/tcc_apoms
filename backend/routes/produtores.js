const express = require('express');
const router = express.Router();

const {
  verificarToken
} = require('../middlewares/auth');

const {
  listarProdutores,
  cadastrarProdutor,
  obterMeuPerfil,
  atualizarMeuPerfil
} = require('../controllers/produtores');

router.get(
  '/me',
  verificarToken,
  obterMeuPerfil
);

router.put(
  '/me',
  verificarToken,
  atualizarMeuPerfil
);

router.get('/', listarProdutores);
router.post('/', cadastrarProdutor);

module.exports = router;