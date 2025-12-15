
const router = require('express').Router();
const { z } = require('zod'); const { prisma } = require('../utils/prisma');
const { requireAuth } = require('../middleware/auth');
const { parseQuery } = require('../utils/search');

const Snip = z.object({
  title: z.string().max(200).optional(),
  language: z.string().min(1).max(50),
  description: z.string().optional(),
  code: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  favorite: z.boolean().optional().default(false),
  visibility: z.enum(['public','private','unlisted']).optional().default('private'),
  workspaceId: z.string().uuid()
});

function makeSlug(){ return Math.random().toString(36).slice(2,10); }

async function notifyWorkspace(workspaceId, event, payload){
  const hooks = await prisma.webhook.findMany({ where: { workspaceId, active:true, events: { has: event } } });
  for(const h of hooks){
    try {
      await fetch(h.url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ event, payload, ts: Date.now() }) });
    } catch {}
  }
}

router.get('/', requireAuth, async (req,res)=>{
  const limit = Math.min(parseInt(req.query.limit||'20',10), 100);
  const offset = Math.max(parseInt(req.query.offset||'0',10), 0);
  const workspaceId = (req.query.workspaceId||'').toString();
  const qRaw = (req.query.q||'').toString();
  const parsed = parseQuery(qRaw);

  const where = { userId: req.user.id, deletedAt: null };
  if (workspaceId) where.workspaceId = workspaceId;
  if (parsed.language) where.language = parsed.language;
  if (parsed.favorite !== null) where.favorite = parsed.favorite;
  if (parsed.text.length){
    const text = parsed.text.join(' ');
    where.OR = [
      { title: { contains: text, mode:'insensitive' } },
      { description: { contains: text, mode:'insensitive' } },
      { code: { contains: text, mode:'insensitive' } }
    ];
  }
  if (parsed.tags.length){
    where.AND = (where.AND||[]).concat(parsed.tags.map(t=>({ tags: { has: t } })));
  }
  if (parsed.before) where.createdAt = { lte: new Date(parsed.before) };
  if (parsed.after) where.createdAt = { ...(where.createdAt||{}), gte: new Date(parsed.after) };

  const [total, items] = await Promise.all([
    prisma.snippet.count({ where }), prisma.snippet.findMany({ where, orderBy:{ createdAt:'desc' }, skip: offset, take: limit })
  ]);
  res.json({ total, limit, offset, items });
});

router.get('/trash', requireAuth, async (req,res)=>{
  const items = await prisma.snippet.findMany({ where: { userId: req.user.id, deletedAt: { not: null } }, orderBy:{ deletedAt:'desc' } });
  res.json(items);
});

router.post('/', requireAuth, async (req,res)=>{
  try{
    const data = Snip.parse(req.body);
    const s = await prisma.snippet.create({ data: { ...data, userId: req.user.id, shareSlug: (data.visibility!=='private')? (makeSlug()): null } });
    await prisma.auditLog.create({ data: { workspaceId: data.workspaceId, userId: req.user.id, action:'snippet.create', targetType:'snippet', targetId:s.id } });
    await notifyWorkspace(data.workspaceId, 'snippet.created', { id:s.id, title:s.title });
    res.status(201).json(s);
  }catch(e){ if(e.name==='ZodError') return res.status(400).json({ error:'Validation' }); res.status(500).json({ error:'Internal' }); }
});

router.put('/:id', requireAuth, async (req,res)=>{
  try{
    const body = Snip.partial().parse(req.body);
    const prev = await prisma.snippet.findFirst({ where:{ id:req.params.id, userId:req.user.id } });
    if (!prev || prev.deletedAt) return res.status(404).json({ error:'Not found' });
    // versioning (save previous)
    const count = await prisma.snippetVersion.count({ where:{ snippetId: prev.id } });
    await prisma.snippetVersion.create({ data: { snippetId: prev.id, version: count+1, title: prev.title, language: prev.language, description: prev.description, code: prev.code, tags: prev.tags, authorId: req.user.id } });
    const next = { ...prev, ...body };
    if ((next.visibility==='public' || next.visibility==='unlisted') && !next.shareSlug) next.shareSlug = makeSlug();
    if (next.visibility==='private') next.shareSlug = null;
    const saved = await prisma.snippet.update({ where:{ id: prev.id }, data: {
      title: body.title ?? prev.title, language: body.language ?? prev.language, description: body.description ?? prev.description,
      code: body.code ?? prev.code, tags: body.tags ?? prev.tags, favorite: body.favorite ?? prev.favorite,
      visibility: next.visibility, shareSlug: next.shareSlug, workspaceId: body.workspaceId ?? prev.workspaceId
    } });
    await prisma.auditLog.create({ data: { workspaceId: saved.workspaceId, userId: req.user.id, action:'snippet.update', targetType:'snippet', targetId:saved.id } });
    await notifyWorkspace(saved.workspaceId, 'snippet.updated', { id:saved.id, title:saved.title });
    res.json(saved);
  }catch(e){ if(e.name==='ZodError') return res.status(400).json({ error:'Validation' }); res.status(500).json({ error:'Internal' }); }
});

router.delete('/:id', requireAuth, async (req,res)=>{
  const s = await prisma.snippet.findFirst({ where:{ id:req.params.id, userId:req.user.id } });
  if (!s) return res.status(404).json({ error:'Not found' });
  const del = await prisma.snippet.update({ where:{ id:s.id }, data:{ deletedAt: new Date() } });
  await prisma.auditLog.create({ data: { workspaceId: del.workspaceId, userId: req.user.id, action:'snippet.delete', targetType:'snippet', targetId:del.id } });
  await notifyWorkspace(del.workspaceId, 'snippet.deleted', { id: del.id });
  res.status(204).end();
});

router.post('/:id/restore', requireAuth, async (req,res)=>{
  const s = await prisma.snippet.findFirst({ where:{ id:req.params.id, userId:req.user.id } });
  if (!s || !s.deletedAt) return res.status(404).json({ error:'Not found' });
  const restored = await prisma.snippet.update({ where:{ id:s.id }, data:{ deletedAt: null } });
  res.json(restored);
});

router.delete('/:id/purge', requireAuth, async (req,res)=>{
  const s = await prisma.snippet.findFirst({ where:{ id:req.params.id, userId:req.user.id } });
  if (!s) return res.status(404).json({ error:'Not found' });
  await prisma.snippet.delete({ where:{ id:s.id } });
  res.status(204).end();
});

router.get('/:id/versions', requireAuth, async (req,res)=>{
  const list = await prisma.snippetVersion.findMany({ where:{ snippetId: req.params.id }, orderBy:{ version:'desc' } });
  res.json(list);
});

router.post('/:id/versions/restore/:ver', requireAuth, async (req,res)=>{
  const ver = parseInt(req.params.ver,10);
  const v = await prisma.snippetVersion.findFirst({ where:{ snippetId: req.params.id, version: ver } });
  if (!v) return res.status(404).json({ error:'Version not found' });
  const saved = await prisma.snippet.update({ where:{ id: req.params.id }, data:{ title:v.title, language:v.language, description:v.description, code:v.code, tags:v.tags } });
  res.json(saved);
});

router.get('/stats/summary', requireAuth, async (req,res)=>{
  const items = await prisma.snippet.findMany({ where: { userId: req.user.id, deletedAt: null } });
  const counts = {}; const byWorkspace = {};
  for(const s of items){ counts[s.language]=(counts[s.language]||0)+1; byWorkspace[s.workspaceId]=(byWorkspace[s.workspaceId]||0)+1; }
  res.json({ total: items.length, counts, byWorkspace });
});

module.exports = router;
