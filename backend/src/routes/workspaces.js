
const router = require('express').Router();
const { z } = require('zod'); const { prisma } = require('../utils/prisma');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req,res)=>{
  const list = await prisma.membership.findMany({ where: { userId: req.user.id }, include: { workspace: true } });
  res.json(list.map(m => ({ id:m.workspace.id, name:m.workspace.name, role:m.role })));
});

router.post('/', requireAuth, async (req,res)=>{
  const schema = z.object({ name:z.string().min(1).max(100) });
  try{
    const { name } = schema.parse(req.body||{});
    const ws = await prisma.workspace.create({ data: { name, createdById: req.user.id } });
    await prisma.membership.create({ data: { userId: req.user.id, workspaceId: ws.id, role: 'OWNER' } });
    res.status(201).json(ws);
  }catch{ res.status(400).json({ error:'Validation' }); }
});

module.exports = router;
