const prisma = require('../lib/prisma');

async function listProducts(req, res) {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);

    return res.json({ data: products, total, page: Number(page), limit: Number(limit) });
  } catch {
    return res.status(500).json({ error: 'Erro ao listar produtos' });
  }
}

async function getProduct(req, res) {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    return res.json(product);
  } catch {
    return res.status(500).json({ error: 'Erro ao buscar produto' });
  }
}

async function createProduct(req, res) {
  const { name, description, price, stock } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }

  if (Number(price) < 0) {
    return res.status(400).json({ error: 'Preço não pode ser negativo' });
  }

  try {
    const product = await prisma.product.create({
      data: { name, description, price: Number(price), stock: stock ? Number(stock) : 0 },
    });
    return res.status(201).json(product);
  } catch {
    return res.status(500).json({ error: 'Erro ao criar produto' });
  }
}

async function updateProduct(req, res) {
  const { name, description, price, stock } = req.body;

  try {
    const exists = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!exists) return res.status(404).json({ error: 'Produto não encontrado' });

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) {
      if (Number(price) < 0) return res.status(400).json({ error: 'Preço não pode ser negativo' });
      data.price = Number(price);
    }
    if (stock !== undefined) data.stock = Number(stock);

    const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data });
    return res.json(product);
  } catch {
    return res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
}

async function deleteProduct(req, res) {
  try {
    const exists = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!exists) return res.status(404).json({ error: 'Produto não encontrado' });

    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Erro ao deletar produto' });
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
