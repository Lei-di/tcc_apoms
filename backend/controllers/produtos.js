const pool = require('../models/db');

const listarProdutos = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM produtos WHERE cpf_produtor = $1',
      [req.produtor.cpf]
    );
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar produtos', erro });
  }
};

const cadastrarProduto = async (req, res) => {
  const { nome_produto, quantidade, data_validade, preco } = req.body;
  const cpf_produtor = req.produtor.cpf;

  try {
    const resultado = await pool.query(
      'INSERT INTO produtos (cpf_produtor, nome_produto, quantidade, data_validade, preco) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cpf_produtor, nome_produto, quantidade, data_validade, preco]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao cadastrar produto', erro });
  }
};

const deletarProduto = async (req, res) => {
  const { id } = req.params;
  const cpf_produtor = req.produtor.cpf;

  try {
    const resultado = await pool.query(
      'DELETE FROM produtos WHERE id = $1 AND cpf_produtor = $2 RETURNING *',
      [id, cpf_produtor]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Produto não encontrado.' });
    }

    res.json({ mensagem: 'Produto removido com sucesso.' });
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao deletar produto', erro });
  }
};

const listarProdutosDisponiveis = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM lista_produtos ORDER BY nome');
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar lista de produtos', erro });
  }
};

module.exports = { listarProdutos, cadastrarProduto, deletarProduto, listarProdutosDisponiveis };