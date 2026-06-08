# Projeto Universitário — Loja Online

API RESTful com Node.js + React

## Tecnologias Utilizadas

### Back-end
- **Node.js** + **Express** — servidor HTTP e roteamento
- **PostgreSQL** — banco de dados relacional
- **Prisma ORM** — acesso e migrations do banco
- **JWT (jsonwebtoken)** — autenticação por token
- **bcryptjs** — hash de senhas
- **Jest** + **Supertest** — testes de integração

### Front-end
- **React 18** + **Vite** — SPA moderna
- **React Bootstrap** — componentes de UI
- **React Router v6** — roteamento de páginas
- **Axios** — cliente HTTP com interceptors
- **Cypress** — testes E2E automatizados

## Recursos da API

| Recurso    | Descrição                                   |
|------------|---------------------------------------------|
| `users`    | Autenticação e perfil de usuário            |
| `products` | Catálogo de produtos (CRUD)                 |
| `orders`   | Pedidos com relacionamento N-N de produtos  |

**Relacionamento:** um pedido possui muitos produtos via `order_items`.  
Rota especial: `GET /api/orders/:id/products`

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+

---

## Como Rodar

> Para rodar o projeto você precisará de **2 terminais abertos ao mesmo tempo**: um para o back-end e outro para o front-end.

### 1. Banco de dados

No terminal, como o usuário `postgres`, crie o usuário e os bancos:

```bash
psql -U postgres -c "CREATE USER projeto_user WITH PASSWORD 'projeto123' CREATEDB;"
psql -U postgres -c "CREATE DATABASE projeto_db OWNER projeto_user;"
psql -U postgres -c "CREATE DATABASE projeto_test_db OWNER projeto_user;"
```

### 2. Back-end

```bash
cd backend
npm install
```

Copie o arquivo de variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o `.env` com os dados do banco criado acima:

```env
DATABASE_URL="postgresql://projeto_user:projeto123@localhost:5432/projeto_db"
JWT_SECRET="supersecretjwtkey2024universitario"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

Execute as migrations e popule o banco:

```bash
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

O servidor estará rodando em `http://localhost:3001`.

### 3. Front-end

> **Abra um novo terminal** (mantenha o do back-end rodando).

```bash
cd frontend
npm install
npm run dev
```

Acesse: **http://localhost:3000**

---

## Usuários padrão (criados pelo seed)

| Email                  | Senha    | Perfil |
|------------------------|----------|--------|
| admin@exemplo.com      | admin123 | Admin  |
| usuario@exemplo.com    | user123  | User   |

### Dados de exemplo criados pelo seed

- 3 produtos: Notebook Dell (R$ 3.499,90), Mouse Logitech (R$ 549,90), Teclado Mecânico (R$ 799,90)
- 1 pedido já criado para o usuário padrão (status: `completed`)

---

## Endpoints da API

### Autenticação (público)
```
POST /api/auth/signup   — registrar novo usuário
POST /api/auth/login    — login (retorna token JWT)
```

### Usuários (requer autenticação)
```
GET  /api/users/me      — perfil do usuário logado
PUT  /api/users/me      — atualizar perfil
GET  /api/users/        — listar todos (somente admin)
```

### Produtos
```
GET    /api/products         — listar todos (público, suporta paginação e busca)
GET    /api/products/:id     — detalhes de um produto (público)
POST   /api/products         — criar produto (somente admin)
PUT    /api/products/:id     — atualizar produto (somente admin)
DELETE /api/products/:id     — excluir produto (somente admin)
```

### Pedidos (requer autenticação)
```
GET    /api/orders              — listar pedidos (usuário vê os seus; admin vê todos)
POST   /api/orders              — criar pedido
GET    /api/orders/:id          — detalhes com itens
PUT    /api/orders/:id          — atualizar status
DELETE /api/orders/:id          — excluir pedido
GET    /api/orders/:id/products — listar produtos de um pedido
```

---

## Testes

### Back-end (Jest + Supertest)

O arquivo `.env.test` já está configurado e usa um banco separado (`projeto_test_db`).

```bash
cd backend
npm test
npm run test:coverage
```

### Front-end (Cypress E2E)

Com o frontend e o backend rodando:

```bash
cd frontend
npm run cy:open    # abre a interface gráfica do Cypress
npm run cy:run     # executa em modo headless (CI)
```

---

## Estrutura do Projeto

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # modelos do banco (User, Product, Order, OrderItem)
│   │   └── seed.js          # dados iniciais
│   ├── src/
│   │   ├── controllers/     # lógica de negócio
│   │   ├── middleware/      # autenticação JWT
│   │   ├── routes/          # definição das rotas
│   │   ├── auth.test.js     # testes de autenticação
│   │   ├── products.test.js # testes de produtos
│   │   └── orders.test.js   # testes de pedidos
│   ├── .env.example         # modelo de variáveis de ambiente
│   └── .env.test            # variáveis para ambiente de teste
└── frontend/
    ├── src/
    │   ├── components/      # Layout, PrivateRoute
    │   ├── context/         # AuthContext (JWT)
    │   ├── pages/           # Login, Register, Dashboard, Products, Orders
    │   └── services/        # cliente Axios configurado
    └── cypress/
        └── e2e/             # testes automatizados E2E
```
