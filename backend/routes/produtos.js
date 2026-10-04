const express = require('express')
const router = express.Router()

const {
  verificarToken,
  verificarAdmin
} = require('../middlewares/auth')

const {
  listarProdutos,
  cadastrarProduto,
  deletarProduto,
  listarProdutosDisponiveis,
  cadastrarProdutoDisponivel,
  editarProdutoDisponivel,
  excluirProdutoDisponivel
} = require('../controllers/produtos')


// Catálogo

router.get(
  '/disponiveis',
  listarProdutosDisponiveis
)

router.post(
  '/disponiveis',
  verificarAdmin,
  cadastrarProdutoDisponivel
)

router.put(
  '/disponiveis/:id',
  verificarAdmin,
  editarProdutoDisponivel
)

router.delete(
  '/disponiveis/:id',
  verificarAdmin,
  excluirProdutoDisponivel
)


// Produtos aprovados do produtor

router.get(
  '/',
  verificarToken,
  listarProdutos
)

router.post(
  '/',
  verificarToken,
  cadastrarProduto
)

router.delete(
  '/:id',
  verificarToken,
  deletarProduto
)

module.exports = router