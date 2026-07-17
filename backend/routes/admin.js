const express = require('express');
const router = express.Router();
const { verificarAdmin } = require('../middlewares/auth');
const { listarProdutores, cadastrarProdutor, editarProdutor, toggleAtivoProdutor } = require('../controllers/admin');

router.get('/produtores', verificarAdmin, listarProdutores);
router.post('/produtores', verificarAdmin, cadastrarProdutor);
router.put('/produtores/:cpf', verificarAdmin, editarProdutor);
router.patch('/produtores/:cpf/toggle', verificarAdmin, toggleAtivoProdutor);

module.exports = router;