
const router = require('express').Router();
const { z } = require('zod'); const bcrypt = require('bcryptjs');
const { prisma } = require('../utils/prisma');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');
const { v4: uuidv4 } = require('uuid');

const NODE_ENV = process.env.NODE_ENV || 'development';
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'refresh_token';

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: NODE_ENV === 'production', // ✅ solo segura en prod
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax', // ✅ necesaria para localhost
    path: '/api/v1/auth/refresh',
    maxAge: 1000 * 60 * 60 * 24 * parseInt(process.env.REFRESH_TTL_DAYS || '7', 10),
  });
}

router.post('/register', async (req,res)=>{
  const schema = z.object({ name:z.string().min(1), email:z.string().email(), password:z.string().min(6) });
  try{
    const body = schema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (exists) return res.status(409).json({ error:'Email already registered' });
    const hash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({ data: { name: body.name, email: body.email.toLowerCase(), password: hash } });
    // Personal workspace
    const ws = await prisma.workspace.create({ data: { name: `${user.name.split(' ')[0] || 'Personal'} Workspace`, createdById: user.id } });
    await prisma.membership.create({ data: { userId: user.id, workspaceId: ws.id, role: 'OWNER' } });
    const tid = uuidv4(); await prisma.refreshToken.create({ data:{ tokenId: tid, userId: user.id } });
    const accessToken = signAccess(user); const refreshToken = signRefresh({ sub:user.id, tid: tid });
    setRefreshCookie(res, refreshToken);
    res.status(201).json({ user: { id:user.id, email:user.email, name:user.name, role:user.role, theme:user.theme }, accessToken, defaultWorkspaceId: ws.id });
  }catch(e){ if(e.name==='ZodError') return res.status(400).json({ error:'Validation' }); res.status(500).json({ error:'Internal' }); }
});

router.post('/login', async (req,res)=>{
  const schema = z.object({ email:z.string().email(), password:z.string().min(6) });
  try{
    const body = schema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user) return res.status(401).json({ error:'Invalid credentials' });
    const ok = await bcrypt.compare(body.password, user.password);
    if (!ok) return res.status(401).json({ error:'Invalid credentials' });
    const tid = uuidv4(); await prisma.refreshToken.create({ data:{ tokenId: tid, userId: user.id } });
    const accessToken = signAccess(user); const refreshToken = signRefresh({ sub:user.id, tid: tid });
    setRefreshCookie(res, refreshToken);
    res.json({ user: { id:user.id, email:user.email, name:user.name, role:user.role, theme:user.theme }, accessToken });
  }catch(e){ if(e.name==='ZodError') return res.status(400).json({ error:'Validation' }); res.status(500).json({ error:'Internal' }); }
});

// Dev OAuth stub: accepts email, creates/returns user (simulate SSO)
router.post('/oauth/dev', async (req,res)=>{
  const email = (req.body?.email||'').toLowerCase();
  const name = req.body?.name || 'SSO User';
  if (!email) return res.status(400).json({ error:'Missing email' });
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user){
    user = await prisma.user.create({ data: { email, name, password: await require('bcryptjs').hash(require('crypto').randomBytes(8).toString('hex'), 10) } });
    const ws = await prisma.workspace.create({ data: { name: `${name.split(' ')[0]} Workspace`, createdById: user.id } });
    await prisma.membership.create({ data: { userId: user.id, workspaceId: ws.id, role: 'OWNER' } });
  }
  const tid = require('uuid').v4(); await prisma.refreshToken.create({ data:{ tokenId: tid, userId: user.id } });
  const accessToken = require('../utils/jwt').signAccess(user);
  const refreshToken = require('../utils/jwt').signRefresh({ sub:user.id, tid });
  setRefreshCookie(res, refreshToken);
  res.json({ user: { id:user.id, email:user.email, name:user.name, role:user.role, theme:user.theme }, accessToken });
});

router.post('/refresh', async (req,res)=>{
  const cookie = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!cookie) return res.status(401).json({ error:'Missing refresh' });
  try{
    const payload = require('../utils/jwt').verifyRefresh(cookie);
    const found = await prisma.refreshToken.findUnique({ where: { tokenId: payload.tid } });
    if (!found || found.revoked) return res.status(401).json({ error:'Invalid refresh' });
    await prisma.refreshToken.update({ where: { tokenId: payload.tid }, data: { revoked:true } });
    const newTid = require('uuid').v4(); await prisma.refreshToken.create({ data:{ tokenId: newTid, userId: payload.sub } });
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    const accessToken = require('../utils/jwt').signAccess(user);
    const refreshToken = require('../utils/jwt').signRefresh({ sub:user.id, tid: newTid });
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  }catch{ res.status(401).json({ error:'Invalid refresh' }); }
});

router.post('/logout', async (req,res)=>{
  const cookie = req.cookies?.[REFRESH_COOKIE_NAME];
  if (cookie){
    try{ const p = require('../utils/jwt').verifyRefresh(cookie); await prisma.refreshToken.update({ where: { tokenId: p.tid }, data: { revoked:true } }); }catch{}
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path:'/api/v1/auth/refresh' });
  res.json({ ok:true });
});

module.exports = router;
