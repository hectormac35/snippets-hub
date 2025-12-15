
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const pino = require('pino'); const pinoHttp = require('pino-http');
const client = require('prom-client');
const YAML = require('yamljs'); const swaggerUi = require('swagger-ui-express');
const { prisma } = require('./utils/prisma');

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true, directives: {
      "script-src": ["'self'","'unsafe-inline'"],
      "img-src": ["'self'","data:"],
      "connect-src": ["'self'", ...allowed],
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({ origin: (o,cb)=>{ if(!o) return cb(null,true); return allowed.includes(o) ? cb(null,true) : cb(new Error('CORS')); }, credentials:true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));

const limiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use(limiter);

// Health/Ready
app.get('/health', (_req,res)=> res.json({ ok:true }));
app.get('/ready', async (_req,res)=>{ try{ await prisma.$queryRaw`SELECT 1`; res.json({ ready:true }); }catch{ res.status(503).json({ ready:false }); } });

// OpenAPI (minimal placeholder)
const openapi = YAML.parse(`openapi: 3.0.3
info: {title: Snippets Hub API, version: 1.0.0}`);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Metrics
const register = new client.Registry(); client.collectDefaultMetrics({ register });
app.get('/metrics', async (_req,res)=>{ res.set('Content-Type', register.contentType); res.end(await register.metrics()); });

// API v1
const v1 = express.Router();
app.use('/api/v1', v1);
v1.use('/auth', require('./routes/auth'));
v1.use('/workspaces', require('./routes/workspaces'));
v1.use('/snippets', require('./routes/snippets'));
v1.use('/public', require('./routes/public'));
v1.use('/pat', require('./routes/pat'));
v1.use('/webhooks', require('./routes/webhooks'));
v1.use('/me', require('./routes/me'));

app.use((req,res)=> res.status(404).json({ error: 'Not found' }));
app.use((err,req,res,_next)=>{ req.log?.error?.(err); res.status(500).json({ error: 'Internal' }); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> logger.info({ msg:`API http://localhost:${PORT}` }));
