
const router = require('express').Router();
const { z } = require('zod'); const crypto = require('crypto');
const { prisma } = require('../utils/prisma'); const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req,res)=>{
  const list = await prisma.apiToken.findMany({ where:{ userId: req.user.id, revoked:false }, select:{ id:true,name:true,lastChars:true,createdAt:true,revoked:true } });
  res.json(list);
});

router.post('/', requireAuth, async (req,res)=>{
  const schema = z.object({ name:z.string().min(1).max(100) });
  try{
    const { name } = schema.parse(req.body||{});
    const plain = 'pat_' + crypto.randomBytes(24).toString('hex');
    const hash = crypto.createHash('sha256').update(plain).digest('hex');
    const token = await prisma.apiToken.create({ data: { userId: req.user.id, name, tokenHash: hash, lastChars: plain.slice(-6) } });
    res.status(201).json({ id: token.id, token: plain, lastChars: token.lastChars });
  }catch{ res.status(400).json({ error:'Validation' }); }
});

router.post('/:id/revoke', requireAuth, async (req,res)=>{
  await prisma.apiToken.update({ where:{ id:req.params.id }, data:{ revoked:true } });
  res.json({ ok:true });
});

module.exports = router;
