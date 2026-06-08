const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
}

async function createTestUser(overrides = {}) {
  const password = overrides.password || 'senha123';
  return prisma.user.create({
    data: {
      name: 'Usuário Teste',
      email: 'teste@exemplo.com',
      password: await bcrypt.hash(password, 10),
      role: 'user',
      ...overrides,
      ...(overrides.password ? { password: await bcrypt.hash(overrides.password, 10) } : {}),
    },
  });
}

async function createAdminUser(overrides = {}) {
  return prisma.user.create({
    data: {
      name: 'Admin Teste',
      email: 'admin@exemplo.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      ...overrides,
    },
  });
}

async function createTestProduct(overrides = {}) {
  return prisma.product.create({
    data: {
      name: 'Produto Teste',
      description: 'Descrição do produto teste',
      price: 99.90,
      stock: 100,
      ...overrides,
    },
  });
}

module.exports = { prisma, clearDatabase, createTestUser, createAdminUser, createTestProduct };