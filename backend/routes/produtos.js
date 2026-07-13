const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth');
const { listarProdutos, cadastrarProduto, deletarProduto, listarProdutosDisponiveis } = require('../controllers/produtos');

router.get('/disponiveis', listarProdutosDisponiveis);
router.get('/', verificarToken, listarProdutos);
router.post('/', verificarToken, cadastrarProduto);
router.delete('/:id', verificarToken, deletarProduto);

module.exports = router;