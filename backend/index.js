const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Teste de conexão
const pool = require('./models/db');
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err);
    } else {
        console.log('Banco de dados conectado em:', res.rows[0].now);
    }
});

const PORT = process.env.PORT || 3000;
const produtoresRoutes = require('./routes/produtores');
app.use('/produtores', produtoresRoutes);
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
