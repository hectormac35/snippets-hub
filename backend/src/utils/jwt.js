
const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh';
const ACCESS_TTL_MIN = parseInt(process.env.ACCESS_TTL_MIN || '15', 10);
const REFRESH_TTL_DAYS = parseInt(process.env.REFRESH_TTL_DAYS || '7', 10);
function signAccess(user){ return jwt.sign({ sub:user.id, email:user.email, role:user.role }, ACCESS_SECRET, { expiresIn: `${ACCESS_TTL_MIN}m` }); }
function signRefresh(payload){ return jwt.sign(payload, REFRESH_SECRET, { expiresIn: `${REFRESH_TTL_DAYS}d` }); }
function verifyAccess(t){ return jwt.verify(t, ACCESS_SECRET); }
function verifyRefresh(t){ return jwt.verify(t, REFRESH_SECRET); }
module.exports = { signAccess, signRefresh, verifyAccess, verifyRefresh };
