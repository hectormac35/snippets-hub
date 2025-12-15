
const { verifyAccess } = require('../utils/jwt');
function requireAuth(req,res,next){
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try { const p = verifyAccess(token); req.user = { id:p.sub, email:p.email, role:p.role }; next(); }
  catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
}
module.exports = { requireAuth };
