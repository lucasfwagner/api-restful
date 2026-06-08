const request = require('supertest');
const app = require('../src/app');
const { clearDatabase, createAdminUser, createTestUser, createTestProduct, prisma } = require('./helpers');

let userToken;
let adminToken;
let product1;
let product2;
let orderId;

beforeAll(async () => {
  await clearDatabase();

  await createTestUser({ email: 'user@order.com' });
  await createAdminUser({ email: 'admin@order.com' });

  const userLogin = await request(app).post('/api/auth/login').send({
    email: 'user@order.com',
    password: 'senha123',
  });
  userToken = userLogin.body.token;

  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@order.com',
    password: 'admin123',
  });
  adminToken = adminLogin.body.token;

  product1 = await createTestProduct({ name: 'Produto P1', price: 100, stock: 50 });
  product2 = await createTestProduct({ name: 'Produto P2', price: 200, stock: 30 });
});

afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

describe('POST /api/orders', () => {
  it('deve criar pedido com itens válidos', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId: product1.id, quantity: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('total', 200);
    expect(res.body.orderItems).toHaveLength(1);
    orderId = res.body.id;
  });

  it('deve rejeitar pedido sem itens', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [] });

    expect(res.status).toBe(400);
  });

  it('deve rejeitar produto inexistente no pedido', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId: 999999, quantity: 1 }] });

    expect(res.status).toBe(400);
  });

  it('deve rejeitar pedido sem autenticação', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: product1.id, quantity: 1 }] });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/orders', () => {
  it('deve listar pedidos do usuário autenticado', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('admin deve ver todos os pedidos', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('deve rejeitar sem autenticação', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/orders/:id', () => {
  it('deve retornar pedido por ID com itens', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', orderId);
    expect(res.body).toHaveProperty('orderItems');
    expect(res.body).toHaveProperty('user');
  });

  it('deve retornar 404 para pedido inexistente', async () => {
    const res = await request(app)
      .get('/api/orders/999999')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/orders/:id/products', () => {
  it('deve listar produtos de um pedido', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}/products`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('quantity');
    expect(res.body[0]).toHaveProperty('subtotal');
  });
});

describe('PUT /api/orders/:id', () => {
  it('deve atualizar status do pedido', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'processing' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('processing');
  });

  it('deve rejeitar status inválido', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'invalido' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/orders/:id', () => {
  let deleteOrderId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId: product2.id, quantity: 1 }] });
    deleteOrderId = res.body.id;
  });

  it('deve deletar pedido do próprio usuário', async () => {
    const res = await request(app)
      .delete(`/api/orders/${deleteOrderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(204);
  });

  it('deve retornar 404 para pedido já deletado', async () => {
    const res = await request(app)
      .delete(`/api/orders/${deleteOrderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });
});