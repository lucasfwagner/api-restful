const prisma = require('../lib/prisma');

async function listOrders(req, res) {
  try {
    const where = req.userRole === 'admin' ? {} : { userId: req.userId };

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(orders);
  } catch {
    return res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
}

async function getOrder(req, res) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: true } },
      },
    });

    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    if (req.userRole !== 'admin' && order.userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    return res.json(order);
  } catch {
    return res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
}

async function createOrder(req, res) {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Itens do pedido são obrigatórios' });
  }

  const invalidItem = items.find((i) => !i.productId || !Number.isInteger(Number(i.quantity)) || Number(i.quantity) < 1);
  if (invalidItem) {
    return res.status(400).json({ error: 'Cada item deve ter productId e quantidade maior que zero' });
  }

  try {
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== productIds.length) {
      return res.status(400).json({ error: 'Um ou mais produtos não encontrados' });
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Estoque insuficiente para o produto: ${product.name}` });
      }
    }

    const total = items.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId);
      return acc + product.price * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: req.userId,
          total,
          orderItems: {
            create: items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return { productId: item.productId, quantity: item.quantity, price: product.price };
            }),
          },
        },
        include: {
          orderItems: { include: { product: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    return res.status(201).json(order);
  } catch {
    return res.status(500).json({ error: 'Erro ao criar pedido' });
  }
}

async function updateOrderStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status inválido. Use: ${validStatuses.join(', ')}` });
  }

  try {
    const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    if (req.userRole !== 'admin' && order.userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const updated = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: {
        orderItems: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json(updated);
  } catch {
    return res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
}

async function deleteOrder(req, res) {
  try {
    const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    if (req.userRole !== 'admin' && order.userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.order.delete({ where: { id: Number(req.params.id) } });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Erro ao deletar pedido' });
  }
}

async function getOrderProducts(req, res) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    if (req.userRole !== 'admin' && order.userId !== req.userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const products = order.orderItems.map((item) => ({
      ...item.product,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: item.price * item.quantity,
    }));

    return res.json(products);
  } catch {
    return res.status(500).json({ error: 'Erro ao buscar produtos do pedido' });
  }
}

module.exports = { listOrders, getOrder, createOrder, updateOrderStatus, deleteOrder, getOrderProducts };