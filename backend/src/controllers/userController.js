const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    return res.json(user);
  } catch {
    return res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}

async function updateMe(req, res) {
  const { name, email, password } = req.body;

  try {
    const data = {};
    if (name) data.name = name;
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: req.userId } },
      });
      if (existing) return res.status(409).json({ error: 'Email já em uso' });
      data.email = email;
    }
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });

    return res.json(user);
  } catch {
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(users);
  } catch {
    return res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

module.exports = { getMe, updateMe, listUsers };