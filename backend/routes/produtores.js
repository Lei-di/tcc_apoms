const express = require('express');
const router = express.Router();
const { listarProdutores, cadastrarProdutor } = require('../controllers/produtores');

router.get('/', listarProdutores);
router.post('/', cadastrarProdutor);

module.exports = router;