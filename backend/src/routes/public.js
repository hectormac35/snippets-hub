
const router = require('express').Router();
const { prisma } = require('../utils/prisma');

router.get('/snippets', async (_req,res)=>{
  const list = await prisma.snippet.findMany({ where: { visibility: 'public', deletedAt: null }, select: { id:true,title:true,language:true,description:true,code:true,tags:true,createdAt:true,shareSlug:true }, orderBy:{ createdAt:'desc' } });
  res.json(list);
});
router.get('/snippets/:slug', async (req,res)=>{
  const s = await prisma.snippet.findFirst({ where: { shareSlug: req.params.slug, deletedAt: null, OR:[{visibility:'public'},{visibility:'unlisted'}] } });
  if (!s) return res.status(404).json({ error:'Not found' });
  // analytics
  try{ await prisma.shareHit.create({ data: { snippetId: s.id } }); }catch{}
  res.json({ id:s.id, title:s.title, language:s.language, description:s.description, code:s.code, tags:s.tags, createdAt:s.createdAt });
});

module.exports = router;
