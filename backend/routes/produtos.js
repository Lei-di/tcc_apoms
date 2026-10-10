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
  excluirProdutoDisponivel,

  criarSolicitacaoProduto,
  listarMinhasSolicitacoesProdutos,
  listarSolicitacoesProdutosAdmin,
  avaliarSolicitacaoProduto
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


// Solicitações de inclusão no catálogo

router.post(
  '/solicitacoes',
  verificarToken,
  criarSolicitacaoProduto
)

router.get(
  '/solicitacoes/minhas',
  verificarToken,
  listarMinhasSolicitacoesProdutos
)

router.get(
  '/solicitacoes',
  verificarAdmin,
  listarSolicitacoesProdutosAdmin
)

router.patch(
  '/solicitacoes/:id/avaliar',
  verificarAdmin,
  avaliarSolicitacaoProduto
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