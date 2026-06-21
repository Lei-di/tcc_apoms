const pool = require('../models/db');

const listarProdutores = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM produtores');
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar produtores', erro });
  }
};

const cadastrarProdutor = async (req, res) => {
  const { cpf, nome, data_nascimento, telefone, email, cidade, endereco } = req.body;
  try {
    const resultado = await pool.query(
      'INSERT INTO produtores (cpf, nome, data_nascimento, telefone, email, cidade, endereco) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [cpf, nome, data_nascimento, telefone, email, cidade, endereco]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao cadastrar produtor', erro });
  }
};

module.exports = { listarProdutores, cadastrarProdutor };