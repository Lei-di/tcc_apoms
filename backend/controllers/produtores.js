const pool = require('../models/db');

const verificarCadastroCompleto = (produtor) => {
  return Boolean(
    produtor.nome?.trim() &&
    produtor.telefone?.trim() &&
    produtor.email?.trim() &&
    produtor.cidade?.trim() &&
    produtor.endereco?.trim()
  );
};

const listarProdutores = async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM produtores'
    );

    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao buscar produtores',
      erro
    });
  }
};

const cadastrarProdutor = async (req, res) => {
  const {
    cpf,
    nome,
    data_nascimento,
    telefone,
    email,
    cidade,
    endereco
  } = req.body;

  try {
    const resultado = await pool.query(
      `INSERT INTO produtores
      (
        cpf,
        nome,
        data_nascimento,
        telefone,
        email,
        cidade,
        endereco
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        cpf,
        nome,
        data_nascimento,
        telefone,
        email,
        cidade,
        endereco
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao cadastrar produtor',
      erro
    });
  }
};

const obterMeuPerfil = async (req, res) => {
  const cpf = req.produtor.cpf;

  try {
    const resultado = await pool.query(
      `SELECT
        cpf,
        nome,
        telefone,
        email,
        cidade,
        endereco,
        ativo,
        data_ativacao
       FROM produtores
       WHERE cpf = $1
         AND tipo = 'produtor'`,
      [cpf]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Produtor não encontrado.'
      });
    }

    const produtor = resultado.rows[0];

    res.json({
      ...produtor,
      cadastro_completo: verificarCadastroCompleto(produtor)
    });
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao buscar dados do produtor',
      erro
    });
  }
};

const atualizarMeuPerfil = async (req, res) => {
  const cpf = req.produtor.cpf;

  const nome = req.body.nome?.trim();
  const telefone = String(req.body.telefone || '')
    .replace(/\D/g, '');
  const email = req.body.email?.trim();
  const cidade = req.body.cidade?.trim();
  const endereco = req.body.endereco?.trim();

  if (
    !nome ||
    !telefone ||
    !email ||
    !cidade ||
    !endereco
  ) {
    return res.status(400).json({
      mensagem:
        'Preencha todos os campos obrigatórios.'
    });
  }

  if (
    telefone.length < 10 ||
    telefone.length > 11
  ) {
    return res.status(400).json({
      mensagem: 'Informe um telefone válido.'
    });
  }

  const emailValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailValido) {
    return res.status(400).json({
      mensagem: 'Informe um e-mail válido.'
    });
  }

  try {
    const resultado = await pool.query(
      `UPDATE produtores
       SET
         nome = $1,
         telefone = $2,
         email = $3,
         cidade = $4,
         endereco = $5
       WHERE cpf = $6
         AND tipo = 'produtor'
       RETURNING
         cpf,
         nome,
         telefone,
         email,
         cidade,
         endereco,
         ativo,
         data_ativacao`,
      [
        nome,
        telefone,
        email,
        cidade,
        endereco,
        cpf
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensagem: 'Produtor não encontrado.'
      });
    }

    const produtor = resultado.rows[0];

    res.json({
      ...produtor,
      cadastro_completo: verificarCadastroCompleto(produtor)
    });
  } catch (erro) {
    console.error(
      'Erro ao atualizar perfil:',
      erro
    );

    res.status(500).json({
      mensagem: 'Erro ao atualizar perfil',
      erro
    });
  }
};

module.exports = {
  listarProdutores,
  cadastrarProdutor,
  obterMeuPerfil,
  atualizarMeuPerfil
};