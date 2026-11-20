APOMS - Plataforma de Gestão de Ofertas

Como executar o projeto

1. Pré-requisitos

Para executar o projeto localmente, é necessário ter instalado:

- Node.js e npm
- PostgreSQL
- Git


2. Clonar o repositório

```bash
git clone https://github.com/Lei-di/tcc_apoms.git
cd tcc_apoms
```


3. Configurar o banco de dados

É necessário possuir um banco PostgreSQL configurado com as tabelas utilizadas pela aplicação.

Os dados de conexão devem ser informados no arquivo `.env` do backend.


4. Configurar e executar o backend

Acesse a pasta do backend e instale as dependências:

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nome_do_banco
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
JWT_SECRET=sua_chave_secreta
```

Substitua os valores pelos dados de sua configuração local.

Para iniciar o servidor:

```bash
npm run dev
```

O backend será executado em:

`http://localhost:3000`


5. Configurar e executar o frontend

Abra outro terminal na pasta principal do projeto.

Acesse a pasta do frontend e instale as dependências:

```bash
cd frontend
npm install
```

Inicie a aplicação:

```bash
npm run dev
```

Acesse o endereço informado pelo Vite no terminal, normalmente:

`http://localhost:5173`

