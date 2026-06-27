const bcrypt = require('bcryptjs');

async function gerarSenha() {
  const senha = await bcrypt.hash('senha123', 10);
  console.log(senha);
}

gerarSenha();