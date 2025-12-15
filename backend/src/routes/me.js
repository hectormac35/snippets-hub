
const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { prisma } = require('../utils/prisma');
const { z } = require('zod');

router.get('/', requireAuth, async (req,res)=>{
  const user = await prisma.user.findUnique({ where:{ id:req.user.id }, select:{ id:true,email:true,name:true,role:true,theme:true,createdAt:true } });
  const workspaces = await prisma.membership.findMany({ where:{ userId:req.user.id }, include:{ workspace:true } });
  res.json({ ...user, workspaces: workspaces.map(m=>({ id:m.workspace.id, name:m.workspace.name, role:m.role })) });
});

router.put('/', requireAuth, async (req,res)=>{
  const schema = z.object({ prefs: z.object({ theme: z.enum(['light','dark']).optional() }).optional() });
  try{
    const { prefs } = schema.parse(req.body || {});
    const u = await prisma.user.update({ where:{ id:req.user.id }, data:{ theme: prefs?.theme } });
    res.json({ id:u.id, email:u.email, name:u.name, role:u.role, theme:u.theme });
  }catch{ res.status(400).json({ error:'Validation' }); }
});

router.get('/export', requireAuth, async (req,res)=>{
  const [user, snippets, collections, workspaces] = await Promise.all([
    prisma.user.findUnique({ where:{ id:req.user.id }, select:{ id:true,email:true,name:true,role:true,theme:true,createdAt:true } }),
    prisma.snippet.findMany({ where:{ userId:req.user.id } }),
    prisma.workspace.findMany({ where:{ memberships: { some: { userId: req.user.id } } } }),
    prisma.membership.findMany({ where:{ userId:req.user.id } })
  ]);
  res.setHeader('Content-Type','application/json');
  res.setHeader('Content-Disposition','attachment; filename="my_data.json"');
  res.send(JSON.stringify({ user, snippets, workspaces, memberships: workspaces.map(w => memberships = undefined) }, null, 2));
});

router.delete('/', requireAuth, async (req,res)=>{
  await prisma.snippet.deleteMany({ where:{ userId:req.user.id } });
  await prisma.membership.deleteMany({ where:{ userId:req.user.id } });
  await prisma.refreshToken.deleteMany({ where:{ userId:req.user.id } });
  await prisma.apiToken.deleteMany({ where:{ userId:req.user.id } });
  await prisma.user.delete({ where:{ id:req.user.id } });
  res.status(204).end();
});

module.exports = router;
