const pool = require('../models/db');

//produtor
const listarSolicitacoesProdutor = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM solicitacoes WHERE cpf_produtor = $1 ORDER BY data_solicitacao DESC',
      [req.produtor.cpf]
    );
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar solicitações', erro });
  }
};

const criarSolicitacao = async (req, res) => {
  const { nome_produto, quantidade, data_validade, preco } = req.body;
  const cpf_produtor = req.produtor.cpf;
  try {
    const resultado = await pool.query(
      'INSERT INTO solicitacoes (cpf_produtor, nome_produto, quantidade, data_validade, preco) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cpf_produtor, nome_produto, quantidade, data_validade, preco]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao criar solicitação', erro });
  }
};

//somente se pendente
const editarSolicitacao = async (req, res) => {
  const { id } = req.params;
  const { nome_produto, quantidade, data_validade, preco } = req.body;
  const cpf_produtor = req.produtor.cpf;
  try {
    const resultado = await pool.query(
      `UPDATE solicitacoes SET nome_produto=$1, quantidade=$2, data_validade=$3, preco=$4
       WHERE id=$5 AND cpf_produtor=$6 AND status='pendente' RETURNING *`,
      [nome_produto, quantidade, data_validade, preco, id, cpf_produtor]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Solicitação não encontrada ou já avaliada.' });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao editar solicitação', erro });
  }
};

//somente se pendente
const excluirSolicitacao = async (req, res) => {
  const { id } = req.params;
  const cpf_produtor = req.produtor.cpf;
  try {
    const resultado = await pool.query(
      `DELETE FROM solicitacoes WHERE id=$1 AND cpf_produtor=$2 AND status='pendente' RETURNING *`,
      [id, cpf_produtor]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Solicitação não encontrada ou já avaliada.' });
    }
    res.json({ mensagem: 'Solicitação excluída com sucesso.' });
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao excluir solicitação', erro });
  }
};

//admin
const listarTodasSolicitacoes = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT s.*, p.nome as nome_produtor 
       FROM solicitacoes s 
       JOIN produtores p ON s.cpf_produtor = p.cpf 
       ORDER BY data_solicitacao DESC`
    );
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao buscar solicitações', erro });
  }
};

const avaliarSolicitacao = async (req, res) => {
  const { id } = req.params;
  const { status, observacao } = req.body;

  if (!['aprovado', 'rejeitado'].includes(status)) {
    return res.status(400).json({ mensagem: 'Status inválido.' });
  }

  try {
    const resultado = await pool.query(
      `UPDATE solicitacoes SET status=$1, observacao=$2, data_avaliacao=NOW()
       WHERE id=$3 AND status='pendente' RETURNING *`,
      [status, observacao, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: 'Solicitação não encontrada ou já avaliada.' });
    }
    res.json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao avaliar solicitação', erro });
  }
};

module.exports = {
  listarSolicitacoesProdutor,
  criarSolicitacao,
  editarSolicitacao,
  excluirSolicitacao,
  listarTodasSolicitacoes,
  avaliarSolicitacao
};