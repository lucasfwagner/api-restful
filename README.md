# Trabalho Final — API RESTful + React

Projeto da disciplina. Fiz uma loja online simples com back-end em Node.js e front-end em React.

## Tecnologias

**Back-end:** Node.js, Express, PostgreSQL, Prisma, JWT, bcryptjs, Jest, Supertest

**Front-end:** React, Vite, React Bootstrap, React Router, Axios, Cypress

## Como rodar

Precisa ter Node.js 18+ e PostgreSQL instalados.

### 1. Criar os bancos de dados

```bash
psql -U postgres -c "CREATE USER projeto_user WITH PASSWORD 'projeto123' CREATEDB;"
psql -U postgres -c "CREATE DATABASE projeto_db OWNER projeto_user;"
psql -U postgres -c "CREATE DATABASE projeto_test_db OWNER projeto_user;"
```

### 2. Back-end

```bash
cd backend
npm install
cp .env.example .env
```

Edita o `.env`:

```env
DATABASE_URL="postgresql://projeto_user:projeto123@localhost:5432/projeto_db"
JWT_SECRET="supersecretjwtkey2024universitario"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

```bash
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

### 3. Front-end (novo terminal)

```bash
cd frontend
npm install
npm run dev
```

Acessa em: http://localhost:3000

## Usuários criados pelo seed

| Email               | Senha    | Tipo  |
|---------------------|----------|-------|
| admin@exemplo.com   | admin123 | Admin |
| usuario@exemplo.com | user123  | User  |

## Testes

**Back-end** (pode rodar sem o servidor ligado):
```bash
cd backend
npm test
```

**Front-end com Cypress** (precisa do back-end e do front-end rodando):

Abre dois terminais:

Terminal 1 — back-end:
```bash
cd backend
npm run dev
```

Terminal 2 — front-end:
```bash
cd frontend
npm run dev
```

Aí abre um terceiro terminal e roda:
```bash
cd frontend
npm run cy:open
```

Vai abrir uma janela do Cypress. Clica em **E2E Testing**, escolhe o navegador (Chrome, Edge, etc) e clica em **Start**. Depois é só clicar nos arquivos de teste (`auth.cy.js`, `products.cy.js`) para rodar.