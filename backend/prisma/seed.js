const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@exemplo.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@exemplo.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'usuario@exemplo.com' },
    update: {},
    create: {
      name: 'Usuário Teste',
      email: 'usuario@exemplo.com',
      password: userPassword,
      role: 'user',
    },
  });

  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Notebook Dell', description: 'Notebook Dell Inspiron 15', price: 3499.90, stock: 10 },
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: { name: 'Mouse Logitech', description: 'Mouse sem fio Logitech MX Master 3', price: 549.90, stock: 25 },
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {},
      create: { name: 'Teclado Mecânico', description: 'Teclado mecânico RGB HyperX', price: 799.90, stock: 15 },
    }),
  ]);

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      status: 'completed',
      total: 4049.80,
      orderItems: {
        create: [
          { productId: products[0].id, quantity: 1, price: 3499.90 },
          { productId: products[1].id, quantity: 1, price: 549.90 },
        ],
      },
    },
  });

  console.log('Seed concluído:', { admin, user, products, order });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });