const pool = require('../models/db');
const bcrypt = require('bcryptjs');

const listarProdutores = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT cpf, nome, telefone, email, cidade, endereco, ativo FROM produtores WHERE tipo = $1 ORDER BY nome',
      ['produtor']
    );
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar produtores', erro });
  }
};

//cadastrar novo produtor
const cadastrarProdutor = async (req, res) => {
  const { cpf, nome, telefone, email, cidade, endereco } = req.body;
  try {
    const resultado = await pool.query(
      'INSERT INTO produtores (cpf, nome, telefone, email, cidade, endereco, tipo, ativo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING cpf, nome, email',
      [cpf, nome, telefone, email, cidade, endereco, 'produtor', false]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({ mensagem: 'CPF já cadastrado.' });
    }
    res.status(500).json({ mensagem: 'Erro ao cadastrar produtor', erro });
  }
};

const editarProdutor = async (req, res) => {
  const { cpf } = req.params;
  const { nome, telefone, email, cidade, endereco } = req.body;
  try {
    const resultado = await pool.query(
      'UPDATE produtores SET nome=$1, telefone=$2, email=$3, cidade=$4, endereco=$5 WHERE cpf=$6 AND tipo=$7 RETURNING cpf, nome',
      [nome, telefone, email, cidade, endereco, cpf, 'produtor']
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Produtor não encontrado.' });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao editar produtor', erro });
  }
};

//ativa ou desativa
const toggleAtivoProdutor = async (req, res) => {
  const { cpf } = req.params;
  try {
    const resultado = await pool.query(
      'UPDATE produtores SET ativo = NOT ativo WHERE cpf=$1 AND tipo=$2 RETURNING cpf, nome, ativo',
      [cpf, 'produtor']
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Produtor não encontrado.' });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao atualizar status do produtor', erro });
  }
};

module.exports = { listarProdutores, cadastrarProdutor, editarProdutor, toggleAtivoProdutor };