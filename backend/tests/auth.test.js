const request = require('supertest');
const app = require('../src/app');
const { clearDatabase, prisma } = require('./helpers');

beforeAll(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await clearDatabase();
  await prisma.$disconnect();
});

describe('POST /api/auth/signup', () => {
  it('deve registrar um novo usuário com sucesso', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'João Silva',
      email: 'joao@teste.com',
      password: 'senha123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({ name: 'João Silva', email: 'joao@teste.com' });
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('deve rejeitar email duplicado', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'João Silva',
      email: 'joao@teste.com',
      password: 'senha123',
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('deve rejeitar campos obrigatórios ausentes', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      email: 'sem-nome@teste.com',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('deve rejeitar senha muito curta', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Maria',
      email: 'maria@teste.com',
      password: '123',
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('deve fazer login com credenciais válidas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'joao@teste.com',
      password: 'senha123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'joao@teste.com');
  });

  it('deve rejeitar senha incorreta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'joao@teste.com',
      password: 'senhaerrada',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('deve rejeitar email inexistente', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'naoexiste@teste.com',
      password: 'senha123',
    });

    expect(res.status).toBe(401);
  });

  it('deve rejeitar campos ausentes', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/users/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'joao@teste.com',
      password: 'senha123',
    });
    token = res.body.token;
  });

  it('deve retornar dados do usuário autenticado', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'joao@teste.com');
    expect(res.body).not.toHaveProperty('password');
  });

  it('deve rejeitar acesso sem token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('deve rejeitar token inválido', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer tokeninvalido');
    expect(res.status).toBe(401);
  });
});