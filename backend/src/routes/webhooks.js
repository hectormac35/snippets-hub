
const router = require('express').Router();
const { z } = require('zod'); const { prisma } = require('../utils/prisma'); const { requireAuth } = require('../middleware/auth');

router.get('/:workspaceId', requireAuth, async (req,res)=>{
  const list = await prisma.webhook.findMany({ where:{ workspaceId: req.params.workspaceId } });
  res.json(list);
});

router.post('/:workspaceId', requireAuth, async (req,res)=>{
  const schema = z.object({ url:z.string().url(), events:z.array(z.string()).min(1), secret:z.string().optional() });
  try{
    const body = schema.parse(req.body||{});
    const w = await prisma.webhook.create({ data: { workspaceId: req.params.workspaceId, url: body.url, events: body.events, secret: body.secret } });
    res.status(201).json(w);
  }catch{ res.status(400).json({ error:'Validation' }); }
});

router.post('/:id/toggle', requireAuth, async (req,res)=>{
  const cur = await prisma.webhook.findUnique({ where:{ id:req.params.id } });
  if (!cur) return res.status(404).json({ error:'Not found' });
  const w = await prisma.webhook.update({ where:{ id:cur.id }, data:{ active: !cur.active } });
  res.json(w);
});

router.delete('/:id', requireAuth, async (req,res)=>{
  await prisma.webhook.delete({ where:{ id:req.params.id } });
  res.status(204).end();
});

module.exports = router;
