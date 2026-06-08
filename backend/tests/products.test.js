const request = require('supertest');
const app = require('../src/app');
const { clearDatabase, createAdminUser, createTestUser, createTestProduct, prisma } = require('./helpers');

let adminToken;
let userToken;
let productId;

beforeAll(async () => {
  await clearDatabase();

  await createAdminUser({ email: 'admin@prod.com' });
  await createTestUser({ email: 'user@prod.com' });

  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@prod.com',
    password: 'admin123',
  });
  adminToken = adminLogin.body.token;

  const userLogin = await request(app).post('/api/auth/login').send({
    email: 'user@prod.com',
    password: 'senha123',
  });
  userToken = userLogin.body.token;
});

afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

describe('GET /api/products', () => {
  beforeAll(async () => {
    await createTestProduct({ name: 'Produto A', price: 50 });
    await createTestProduct({ name: 'Produto B', price: 150 });
  });

  it('deve listar produtos sem autenticação', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('deve suportar busca por nome', async () => {
    const res = await request(app).get('/api/products?search=Produto A');
    expect(res.status).toBe(200);
    expect(res.body.data.some((p) => p.name.includes('Produto A'))).toBe(true);
  });

  it('deve suportar paginação', async () => {
    const res = await request(app).get('/api/products?page=1&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body).toHaveProperty('total');
  });
});

describe('GET /api/products/:id', () => {
  beforeAll(async () => {
    const p = await createTestProduct({ name: 'Produto Único' });
    productId = p.id;
  });

  it('deve retornar produto por ID', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', productId);
  });

  it('deve retornar 404 para ID inexistente', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/products', () => {
  it('admin deve criar produto', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Novo Produto', price: 199.90, stock: 10 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Novo Produto');
  });

  it('usuário comum não deve criar produto', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Produto Não Autorizado', price: 50 });

    expect(res.status).toBe(403);
  });

  it('deve rejeitar criação sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'sem nome e preço' });

    expect(res.status).toBe(400);
  });

  it('deve rejeitar preço negativo', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Produto Inválido', price: -10 });

    expect(res.status).toBe(400);
  });

  it('deve rejeitar sem autenticação', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Produto Sem Auth', price: 50 });

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/products/:id', () => {
  let editId;

  beforeAll(async () => {
    const p = await createTestProduct({ name: 'Para Editar' });
    editId = p.id;
  });

  it('admin deve atualizar produto', async () => {
    const res = await request(app)
      .put(`/api/products/${editId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Produto Editado', price: 299.90 });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Produto Editado');
  });

  it('deve retornar 404 para produto inexistente', async () => {
    const res = await request(app)
      .put('/api/products/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Inexistente' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/products/:id', () => {
  let deleteId;

  beforeAll(async () => {
    const p = await createTestProduct({ name: 'Para Deletar' });
    deleteId = p.id;
  });

  it('admin deve deletar produto', async () => {
    const res = await request(app)
      .delete(`/api/products/${deleteId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('deve retornar 404 para produto já deletado', async () => {
    const res = await request(app)
      .delete(`/api/products/${deleteId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('usuário comum não deve deletar produto', async () => {
    const p = await createTestProduct({ name: 'Protegido' });
    const res = await request(app)
      .delete(`/api/products/${p.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});