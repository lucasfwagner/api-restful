const request = require('supertest');
const app = require('../src/app');
const { clearDatabase, createAdminUser, createTestUser, prisma } = require('./helpers');

let userToken;
let adminToken;

beforeAll(async () => {
  await clearDatabase();

  await createTestUser({ email: 'user@users.com' });
  await createAdminUser({ email: 'admin@users.com' });

  const userLogin = await request(app).post('/api/auth/login').send({
    email: 'user@users.com',
    password: 'senha123',
  });
  userToken = userLogin.body.token;

  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@users.com',
    password: 'admin123',
  });
  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

describe('PUT /api/users/me', () => {
  it('deve atualizar o nome do usuário autenticado', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Nome Atualizado' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Nome Atualizado');
    expect(res.body).not.toHaveProperty('password');
  });

  it('deve atualizar a senha do usuário', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ password: 'novaSenha456' });

    expect(res.status).toBe(200);

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'user@users.com',
      password: 'novaSenha456',
    });
    expect(loginRes.status).toBe(200);
    userToken = loginRes.body.token;
  });

  it('deve rejeitar senha muito curta', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ password: '123' });

    expect(res.status).toBe(400);
  });

  it('deve rejeitar sem autenticação', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .send({ name: 'Sem Auth' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/', () => {
  it('admin deve listar todos os usuários', async () => {
    const res = await request(app)
      .get('/api/users/')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]).not.toHaveProperty('password');
  });

  it('usuário comum não deve listar todos os usuários', async () => {
    const res = await request(app)
      .get('/api/users/')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('deve rejeitar sem autenticação', async () => {
    const res = await request(app).get('/api/users/');
    expect(res.status).toBe(401);
  });
});