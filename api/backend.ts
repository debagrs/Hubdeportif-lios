import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type Row = Record<string, any>;
type AuthUser = { id: string; email: string; role: 'admin' | 'student'; emailVerified: boolean; portfolioId?: string | null; portfolioSlug?: string | null; displayName?: string | null };

const COOKIE_NAME = 'labinterface_hub_session';
const SESSION_DAYS = 14;
const MAX_STUDENTS = Number(process.env.MAX_STUDENTS || 5);
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const DEFAULT_THEME = { accent: '#00FFFF', secondary: '#D2A979', cardRadius: 'round', projectLayout: 'grid' } as const;
const MAIL_PROVIDER = String(process.env.MAIL_PROVIDER || 'resend').trim().toLowerCase() === 'brevo' ? 'brevo' : 'resend';

const has = (name: string) => Boolean(String(process.env[name] || '').trim());
const dbConfigured = () => has('DATABASE_URL');
const mailConfigured = () => MAIL_PROVIDER === 'brevo'
  ? has('BREVO_API_KEY') && has('BREVO_SENDER_EMAIL')
  : has('RESEND_API_KEY') && has('RESEND_FROM');
const storageConfigured = () => (has('R2_ENDPOINT') || has('R2_ACCOUNT_ID')) && ['R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY','R2_BUCKET','R2_PUBLIC_URL'].every(has);
const normalizeEmail = (value: unknown) => String(value || '').trim().toLowerCase();
const text = (value: unknown) => String(value ?? '').trim();
const body = (req: VercelRequest): Row => typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
const firstQuery = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const noStore = (res: VercelResponse) => res.setHeader('Cache-Control', 'no-store, max-age=0');
const safeSlug = (value: unknown) => text(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 72);
const safeFilename = (value: unknown) => text(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-').slice(-120) || 'imagem.webp';
const jsonArray = (value: unknown) => Array.isArray(value) ? value : [];
const jsonObject = (value: unknown, fallback: Row = {}) => value && typeof value === 'object' && !Array.isArray(value) ? value as Row : fallback;
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const escapeHtml = (value: unknown) => text(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char] || char));
const safeHttpUrl = (value: unknown) => {
  const raw = text(value);
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : '';
  } catch {
    return '';
  }
};
const safeHex = (value: unknown, fallback: string) => /^#[0-9a-fA-F]{6}$/.test(text(value)) ? text(value).toUpperCase() : fallback;
const sanitizeTheme = (value: unknown) => {
  const raw = jsonObject(value);
  return {
    accent: safeHex(raw.accent, DEFAULT_THEME.accent),
    secondary: safeHex(raw.secondary, DEFAULT_THEME.secondary),
    cardRadius: ['round', 'soft', 'square'].includes(text(raw.cardRadius)) ? text(raw.cardRadius) : DEFAULT_THEME.cardRadius,
    projectLayout: ['grid', 'editorial'].includes(text(raw.projectLayout)) ? text(raw.projectLayout) : DEFAULT_THEME.projectLayout,
  };
};

function getSql() {
  if (!dbConfigured()) throw new Error('DATABASE_URL não configurada.');
  return neon(String(process.env.DATABASE_URL));
}

async function query<T extends Row = Row>(statement: string, params: unknown[] = []) {
  const rows = await getSql().query(statement, params);
  return rows as T[];
}

let schemaPromise: Promise<void> | null = null;
async function ensureSchema() {
  if (!dbConfigured()) return;
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const statements = [
        `CREATE TABLE IF NOT EXISTS hub_users (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin','student')),
          email_verified BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS hub_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES hub_users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
        `CREATE INDEX IF NOT EXISTS hub_sessions_token_idx ON hub_sessions(token_hash)`,
        `CREATE TABLE IF NOT EXISTS hub_email_tokens (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES hub_users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          purpose TEXT NOT NULL CHECK (purpose IN ('verify','reset')),
          expires_at TIMESTAMPTZ NOT NULL,
          used_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
        `CREATE INDEX IF NOT EXISTS hub_email_tokens_hash_idx ON hub_email_tokens(token_hash)`,
        `CREATE TABLE IF NOT EXISTS hub_portfolios (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE REFERENCES hub_users(id) ON DELETE CASCADE,
          slug TEXT NOT NULL UNIQUE,
          display_name TEXT NOT NULL,
          headline TEXT NOT NULL DEFAULT '',
          bio TEXT NOT NULL DEFAULT '',
          about TEXT NOT NULL DEFAULT '',
          avatar_url TEXT NOT NULL DEFAULT '',
          hero_image_url TEXT NOT NULL DEFAULT '',
          public_email TEXT NOT NULL DEFAULT '',
          instagram_url TEXT NOT NULL DEFAULT '',
          linkedin_url TEXT NOT NULL DEFAULT '',
          website_url TEXT NOT NULL DEFAULT '',
          theme JSONB NOT NULL DEFAULT '{}'::jsonb,
          published BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS hub_projects (
          id TEXT PRIMARY KEY,
          portfolio_id TEXT NOT NULL REFERENCES hub_portfolios(id) ON DELETE CASCADE,
          slug TEXT NOT NULL,
          title TEXT NOT NULL,
          subtitle TEXT NOT NULL DEFAULT '',
          category TEXT NOT NULL DEFAULT '',
          year TEXT NOT NULL DEFAULT '',
          summary TEXT NOT NULL DEFAULT '',
          body TEXT NOT NULL DEFAULT '',
          cover_url TEXT NOT NULL DEFAULT '',
          gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
          external_url TEXT NOT NULL DEFAULT '',
          tags JSONB NOT NULL DEFAULT '[]'::jsonb,
          featured BOOLEAN NOT NULL DEFAULT FALSE,
          published BOOLEAN NOT NULL DEFAULT TRUE,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(portfolio_id, slug)
        )`,
        `CREATE INDEX IF NOT EXISTS hub_projects_portfolio_idx ON hub_projects(portfolio_id, published, featured DESC, sort_order ASC)`
      ];
      for (const statement of statements) await query(statement);
      await seedAdmin();
    })().catch(error => { schemaPromise = null; throw error; });
  }
  await schemaPromise;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const digest = scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${digest}`;
}

function verifyPassword(password: string, stored: string) {
  const [kind, salt, expected] = stored.split('$');
  if (kind !== 'scrypt' || !salt || !expected) return false;
  const actual = scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(actual, 'hex'); const b = Buffer.from(expected, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

function generatePassword() {
  return `${randomBytes(5).toString('base64url')}!${randomBytes(4).toString('base64url')}`;
}

async function seedAdmin() {
  const email = normalizeEmail(process.env.HUB_ADMIN_EMAIL);
  const password = text(process.env.HUB_ADMIN_PASSWORD);
  if (!email || !password) return;
  const existing = await query('SELECT id FROM hub_users WHERE role = $1 LIMIT 1', ['admin']);
  if (existing.length) return;
  await query('INSERT INTO hub_users (id,email,password_hash,role,email_verified) VALUES ($1,$2,$3,$4,TRUE)', [randomUUID(), email, hashPassword(password), 'admin']);
}

function appUrl(req?: VercelRequest) {
  const explicit = text(process.env.APP_URL).replace(/\/$/, '');
  if (explicit) return explicit;
  const host = req ? text(req.headers['x-forwarded-host'] || req.headers.host) : '';
  if (host) return `https://${host}`;
  const vercel = text(process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL);
  return vercel ? `https://${vercel}` : 'http://localhost:3000';
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!mailConfigured()) return false;

  if (MAIL_PROVIDER === 'brevo') {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': String(process.env.BREVO_API_KEY), 'Content-Type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({
        sender: {
          email: String(process.env.BREVO_SENDER_EMAIL),
          name: text(process.env.BREVO_SENDER_NAME) || 'Portfólios LabInterface',
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!response.ok) {
      const details = await response.text().catch(() => '');
      console.error('Brevo:', response.status, details);
      return false;
    }
    return true;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.RESEND_FROM, to: [to], subject, html }),
  });
  if (!response.ok) {
    const details = await response.text().catch(() => '');
    console.error('Resend:', response.status, details);
    return false;
  }
  return true;
}

async function createEmailToken(userId: string, purpose: 'verify' | 'reset', minutes: number) {
  const raw = randomBytes(32).toString('base64url');
  await query('DELETE FROM hub_email_tokens WHERE user_id=$1 AND purpose=$2 AND used_at IS NULL', [userId, purpose]);
  await query('INSERT INTO hub_email_tokens (id,user_id,token_hash,purpose,expires_at) VALUES ($1,$2,$3,$4,NOW() + ($5 * INTERVAL \'1 minute\'))', [randomUUID(), userId, sha256(raw), purpose, minutes]);
  return raw;
}

function sessionCookie(token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}`;
}
function clearCookie() { return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`; }
function cookies(req: VercelRequest) {
  return Object.fromEntries(text(req.headers.cookie).split(';').map(v=>v.trim()).filter(Boolean).map(part=>{const i=part.indexOf('=');return i<0?[part,'']:[part.slice(0,i),part.slice(i+1)];}));
}

async function getAuthUser(req: VercelRequest): Promise<AuthUser | null> {
  if (!dbConfigured()) return null;
  await ensureSchema();
  const token = cookies(req)[COOKIE_NAME];
  if (!token) return null;
  const rows = await query(`SELECT u.id,u.email,u.role,u.email_verified,p.id AS portfolio_id,p.slug AS portfolio_slug,p.display_name
    FROM hub_sessions s JOIN hub_users u ON u.id=s.user_id LEFT JOIN hub_portfolios p ON p.user_id=u.id
    WHERE s.token_hash=$1 AND s.expires_at>NOW() LIMIT 1`, [sha256(token)]);
  if (!rows.length) return null;
  const r = rows[0];
  return { id:r.id,email:r.email,role:r.role,emailVerified:Boolean(r.email_verified),portfolioId:r.portfolio_id||null,portfolioSlug:r.portfolio_slug||null,displayName:r.display_name||null };
}

async function requireUser(req: VercelRequest, res: VercelResponse) {
  const user = await getAuthUser(req);
  if (!user) { res.status(401).json({ error:'Sessão ausente ou expirada.' }); return null; }
  return user;
}
async function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const user = await requireUser(req,res); if (!user) return null;
  if (user.role !== 'admin') { res.status(403).json({ error:'Acesso restrito à administração do Hub.' }); return null; }
  return user;
}

function mapPortfolio(row: Row, projectCount = 0) {
  return {
    id: row.id, slug: row.slug, displayName: row.display_name, headline: row.headline || '', bio: row.bio || '', about: row.about || '',
    avatarUrl: row.avatar_url || '', heroImageUrl: row.hero_image_url || '', publicEmail: row.public_email || '', instagramUrl: row.instagram_url || '', linkedinUrl: row.linkedin_url || '', websiteUrl: row.website_url || '',
    theme: sanitizeTheme(row.theme), published: Boolean(row.published), projectCount: Number(row.project_count ?? projectCount ?? 0), projects: [] as any[],
  };
}
function mapProject(row: Row) {
  return { id:row.id,portfolioId:row.portfolio_id,slug:row.slug,title:row.title,subtitle:row.subtitle||'',category:row.category||'',year:row.year||'',summary:row.summary||'',body:row.body||'',coverUrl:row.cover_url||'',gallery:jsonArray(row.gallery),externalUrl:row.external_url||'',tags:jsonArray(row.tags),featured:Boolean(row.featured),published:Boolean(row.published),sortOrder:Number(row.sort_order||0) };
}

async function targetPortfolioForUser(user: AuthUser, targetUserId?: string) {
  const userId = user.role === 'admin' && targetUserId ? targetUserId : user.id;
  const rows = await query('SELECT p.*, (SELECT COUNT(*)::int FROM hub_projects pr WHERE pr.portfolio_id=p.id) AS project_count FROM hub_portfolios p WHERE p.user_id=$1 LIMIT 1', [userId]);
  return rows[0] || null;
}

async function canEditPortfolio(user: AuthUser, portfolioId: string) {
  const rows = await query('SELECT user_id FROM hub_portfolios WHERE id=$1 LIMIT 1', [portfolioId]);
  return Boolean(rows[0] && (user.role === 'admin' || rows[0].user_id === user.id));
}

function s3Client() {
  if (!storageConfigured()) throw new Error('R2 ainda não configurado.');
  return new S3Client({
    region: 'auto',
    endpoint: text(process.env.R2_ENDPOINT) || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId:String(process.env.R2_ACCESS_KEY_ID), secretAccessKey:String(process.env.R2_SECRET_ACCESS_KEY) },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  noStore(res);
  const action = firstQuery(req.query.action) || 'health';
  try {
    if (action === 'health') {
      if (dbConfigured()) await ensureSchema();
      return res.status(200).json({ ok:true, configured:dbConfigured(), emailConfigured:mailConfigured(), storageConfigured:storageConfigured(), mailProvider:MAIL_PROVIDER });
    }

    if (action === 'public-portfolios') {
      if (!dbConfigured()) return res.status(200).json({ portfolios:[], configured:false });
      await ensureSchema();
      const rows = await query(`SELECT p.*, (SELECT COUNT(*)::int FROM hub_projects pr WHERE pr.portfolio_id=p.id AND pr.published=TRUE) AS project_count
        FROM hub_portfolios p JOIN hub_users u ON u.id=p.user_id WHERE p.published=TRUE AND u.role='student' ORDER BY p.created_at ASC LIMIT $1`, [MAX_STUDENTS]);
      return res.status(200).json({ portfolios:rows.map(r=>mapPortfolio(r)), configured:true });
    }

    if (action === 'public-portfolio') {
      const slug = safeSlug(firstQuery(req.query.slug));
      if (!dbConfigured()) return res.status(200).json({ portfolio:null, configured:false });
      await ensureSchema();
      const rows = await query(`SELECT p.*, (SELECT COUNT(*)::int FROM hub_projects pr WHERE pr.portfolio_id=p.id AND pr.published=TRUE) AS project_count FROM hub_portfolios p WHERE p.slug=$1 AND p.published=TRUE LIMIT 1`, [slug]);
      if (!rows[0]) return res.status(200).json({ portfolio:null, configured:true });
      const portfolio = mapPortfolio(rows[0]);
      const projects = await query('SELECT * FROM hub_projects WHERE portfolio_id=$1 AND published=TRUE ORDER BY featured DESC, sort_order ASC, year DESC, title ASC', [rows[0].id]);
      portfolio.projects = projects.map(mapProject);
      return res.status(200).json({ portfolio, configured:true });
    }

    if (!dbConfigured()) return res.status(503).json({ error:'O Hub ainda não foi conectado ao Neon.' });
    await ensureSchema();

    if (action === 'session') {
      const user = await getAuthUser(req);
      return res.status(200).json({ authenticated:Boolean(user), user });
    }

    if (action === 'login' && req.method === 'POST') {
      const data = body(req); const email=normalizeEmail(data.email); const password=text(data.password);
      const rows=await query('SELECT * FROM hub_users WHERE email=$1 LIMIT 1',[email]);
      if (!rows[0] || !verifyPassword(password,rows[0].password_hash)) return res.status(401).json({ error:'E-mail ou senha incorretos.' });
      if (!rows[0].email_verified && rows[0].role === 'student') return res.status(403).json({ error:'Confirme seu e-mail antes do primeiro acesso.' });
      const raw=randomBytes(32).toString('base64url');
      await query('DELETE FROM hub_sessions WHERE user_id=$1 AND expires_at<NOW()',[rows[0].id]);
      await query('INSERT INTO hub_sessions (id,user_id,token_hash,expires_at) VALUES ($1,$2,$3,NOW() + ($4 * INTERVAL \'1 day\'))',[randomUUID(),rows[0].id,sha256(raw),SESSION_DAYS]);
      res.setHeader('Set-Cookie',sessionCookie(raw));
      const user=await getAuthUser({ ...req, headers:{...req.headers,cookie:`${COOKIE_NAME}=${raw}`} } as VercelRequest);
      return res.status(200).json({ user });
    }

    if (action === 'logout' && req.method === 'POST') {
      const token=cookies(req)[COOKIE_NAME]; if(token) await query('DELETE FROM hub_sessions WHERE token_hash=$1',[sha256(token)]);
      res.setHeader('Set-Cookie',clearCookie()); return res.status(200).json({ ok:true });
    }

    if (action === 'forgot-password' && req.method === 'POST') {
      const email=normalizeEmail(body(req).email); const users=await query('SELECT id,email FROM hub_users WHERE email=$1 LIMIT 1',[email]);
      if(users[0]){
        const token=await createEmailToken(users[0].id,'reset',30); const url=`${appUrl(req)}/redefinir-senha?token=${encodeURIComponent(token)}`;
        await sendEmail(users[0].email,'Redefinir senha — Portfólios LabInterface',`<p>Recebemos um pedido para redefinir sua senha no Hub de Portfólios.</p><p><a href="${url}">Criar nova senha</a></p><p>O link expira em 30 minutos e só pode ser usado uma vez.</p>`);
      }
      return res.status(200).json({ ok:true, message:'Se esse e-mail estiver cadastrado, você receberá as instruções de recuperação.' });
    }

    if (action === 'reset-password' && req.method === 'POST') {
      const data=body(req); const token=text(data.token); const password=text(data.password);
      if(password.length<8) return res.status(400).json({ error:'A nova senha precisa ter pelo menos 8 caracteres.' });
      const rows=await query(`SELECT * FROM hub_email_tokens WHERE token_hash=$1 AND purpose='reset' AND used_at IS NULL AND expires_at>NOW() LIMIT 1`,[sha256(token)]);
      if(!rows[0]) return res.status(400).json({ error:'Este link expirou ou já foi utilizado.' });
      await query('UPDATE hub_users SET password_hash=$1,email_verified=TRUE,updated_at=NOW() WHERE id=$2',[hashPassword(password),rows[0].user_id]);
      await query('UPDATE hub_email_tokens SET used_at=NOW() WHERE id=$1',[rows[0].id]);
      await query('DELETE FROM hub_sessions WHERE user_id=$1',[rows[0].user_id]);
      return res.status(200).json({ ok:true });
    }

    if (action === 'verify-email' && req.method === 'POST') {
      const token=text(body(req).token); const rows=await query(`SELECT * FROM hub_email_tokens WHERE token_hash=$1 AND purpose='verify' AND used_at IS NULL AND expires_at>NOW() LIMIT 1`,[sha256(token)]);
      if(!rows[0]) return res.status(400).json({ error:'Este link de validação expirou ou já foi usado.' });
      await query('UPDATE hub_users SET email_verified=TRUE,updated_at=NOW() WHERE id=$1',[rows[0].user_id]);
      await query('UPDATE hub_email_tokens SET used_at=NOW() WHERE id=$1',[rows[0].id]);
      return res.status(200).json({ ok:true });
    }

    if (action === 'change-password' && req.method === 'POST') {
      const user = await requireUser(req, res); if (!user) return;
      const data = body(req);
      const currentPassword = text(data.currentPassword);
      const newPassword = text(data.newPassword);
      if (newPassword.length < 8) return res.status(400).json({ error:'A nova senha precisa ter pelo menos 8 caracteres.' });
      const rows = await query('SELECT password_hash FROM hub_users WHERE id=$1 LIMIT 1', [user.id]);
      if (!rows[0] || !verifyPassword(currentPassword, rows[0].password_hash)) return res.status(400).json({ error:'A senha atual não confere.' });
      await query('UPDATE hub_users SET password_hash=$1,updated_at=NOW() WHERE id=$2', [hashPassword(newPassword), user.id]);
      await query('DELETE FROM hub_sessions WHERE user_id=$1 AND token_hash<>$2', [user.id, sha256(cookies(req)[COOKIE_NAME] || '')]);
      return res.status(200).json({ ok:true });
    }

    if (action === 'my-portfolio') {
      const user=await requireUser(req,res); if(!user)return;
      const targetUserId=firstQuery(req.query.userId);
      const row=await targetPortfolioForUser(user,targetUserId);
      if(req.method==='GET'){
        if(!row)return res.status(200).json({portfolio:null});
        const portfolio=mapPortfolio(row); const projects=await query('SELECT * FROM hub_projects WHERE portfolio_id=$1 ORDER BY featured DESC,sort_order ASC,year DESC,title ASC',[row.id]); portfolio.projects=projects.map(mapProject);
        return res.status(200).json({portfolio});
      }
      if(req.method==='PUT'){
        if(!row)return res.status(404).json({error:'Portfólio não encontrado.'});
        const data=body(req); const theme=sanitizeTheme(data.theme);
        await query(`UPDATE hub_portfolios SET display_name=$1,headline=$2,bio=$3,about=$4,avatar_url=$5,hero_image_url=$6,public_email=$7,instagram_url=$8,linkedin_url=$9,website_url=$10,theme=$11::jsonb,published=$12,updated_at=NOW() WHERE id=$13`,[
          text(data.displayName)||row.display_name,text(data.headline),text(data.bio),text(data.about),safeHttpUrl(data.avatarUrl),safeHttpUrl(data.heroImageUrl),normalizeEmail(data.publicEmail),safeHttpUrl(data.instagramUrl),safeHttpUrl(data.linkedinUrl),safeHttpUrl(data.websiteUrl),JSON.stringify(theme),data.published!==false,row.id
        ]);
        const updated=(await query('SELECT p.*, (SELECT COUNT(*)::int FROM hub_projects pr WHERE pr.portfolio_id=p.id) AS project_count FROM hub_portfolios p WHERE id=$1',[row.id]))[0]; const portfolio=mapPortfolio(updated); const projects=await query('SELECT * FROM hub_projects WHERE portfolio_id=$1 ORDER BY featured DESC,sort_order ASC,year DESC,title ASC',[row.id]); portfolio.projects=projects.map(mapProject);
        return res.status(200).json({portfolio});
      }
      return res.status(405).json({error:'Método não permitido.'});
    }

    if (action === 'projects') {
      const user=await requireUser(req,res); if(!user)return;
      if(req.method==='GET'){
        const portfolioId=text(firstQuery(req.query.portfolioId) || user.portfolioId);
        if(!portfolioId || !(await canEditPortfolio(user,portfolioId)))return res.status(403).json({error:'Portfólio não autorizado.'});
        const rows=await query('SELECT * FROM hub_projects WHERE portfolio_id=$1 ORDER BY featured DESC,sort_order ASC,year DESC,title ASC',[portfolioId]); return res.status(200).json({projects:rows.map(mapProject)});
      }
      if(req.method==='POST'){
        const data=body(req); const portfolioId=text(data.portfolioId || user.portfolioId);
        if(!portfolioId || !(await canEditPortfolio(user,portfolioId)))return res.status(403).json({error:'Portfólio não autorizado.'});
        const id=text(data.id)||randomUUID(); const slug=safeSlug(data.slug||data.title); if(!slug||!text(data.title))return res.status(400).json({error:'Título do projeto é obrigatório.'});
        if (text(data.id)) {
          const existingProject = await query('SELECT portfolio_id FROM hub_projects WHERE id=$1 LIMIT 1', [id]);
          if (existingProject[0] && existingProject[0].portfolio_id !== portfolioId) return res.status(403).json({error:'Projeto não autorizado.'});
        }
        const duplicateSlug = await query('SELECT id FROM hub_projects WHERE portfolio_id=$1 AND slug=$2 AND id<>$3 LIMIT 1', [portfolioId, slug, id]);
        if (duplicateSlug.length) return res.status(409).json({error:'Já existe um projeto com esse endereço. Altere o título ou o slug.'});
        await query(`INSERT INTO hub_projects (id,portfolio_id,slug,title,subtitle,category,year,summary,body,cover_url,gallery,external_url,tags,featured,published,sort_order,updated_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13::jsonb,$14,$15,$16,NOW())
          ON CONFLICT(id) DO UPDATE SET slug=EXCLUDED.slug,title=EXCLUDED.title,subtitle=EXCLUDED.subtitle,category=EXCLUDED.category,year=EXCLUDED.year,summary=EXCLUDED.summary,body=EXCLUDED.body,cover_url=EXCLUDED.cover_url,gallery=EXCLUDED.gallery,external_url=EXCLUDED.external_url,tags=EXCLUDED.tags,featured=EXCLUDED.featured,published=EXCLUDED.published,sort_order=EXCLUDED.sort_order,updated_at=NOW()`,[
          id,portfolioId,slug,text(data.title),text(data.subtitle),text(data.category),text(data.year),text(data.summary),text(data.body),safeHttpUrl(data.coverUrl),JSON.stringify(jsonArray(data.gallery).map(safeHttpUrl).filter(Boolean)),safeHttpUrl(data.externalUrl),JSON.stringify(jsonArray(data.tags).map(text).filter(Boolean).slice(0,30)),Boolean(data.featured),data.published!==false,Number(data.sortOrder||0)
        ]);
        const saved=(await query('SELECT * FROM hub_projects WHERE id=$1',[id]))[0]; return res.status(200).json({project:mapProject(saved)});
      }
      if(req.method==='DELETE'){
        const id=text(firstQuery(req.query.id)); const rows=await query('SELECT p.portfolio_id FROM hub_projects p WHERE p.id=$1 LIMIT 1',[id]); if(!rows[0])return res.status(404).json({error:'Projeto não encontrado.'}); if(!(await canEditPortfolio(user,rows[0].portfolio_id)))return res.status(403).json({error:'Projeto não autorizado.'}); await query('DELETE FROM hub_projects WHERE id=$1',[id]); return res.status(200).json({ok:true});
      }
      return res.status(405).json({error:'Método não permitido.'});
    }

    if (action === 'students') {
      const admin=await requireAdmin(req,res); if(!admin)return;
      if(req.method==='GET'){
        const rows=await query(`SELECT u.id,u.email,u.email_verified,p.slug,p.display_name,p.published,(SELECT COUNT(*)::int FROM hub_projects pr WHERE pr.portfolio_id=p.id) AS project_count FROM hub_users u JOIN hub_portfolios p ON p.user_id=u.id WHERE u.role='student' ORDER BY u.created_at ASC`);
        return res.status(200).json({students:rows.map(r=>({id:r.id,email:r.email,displayName:r.display_name,slug:r.slug,emailVerified:Boolean(r.email_verified),published:Boolean(r.published),projectCount:Number(r.project_count||0)}))});
      }
      if(req.method==='POST'){
        const count=Number((await query("SELECT COUNT(*)::int AS total FROM hub_users WHERE role='student'"))[0]?.total||0); if(count>=MAX_STUDENTS)return res.status(400).json({error:`O limite atual é de ${MAX_STUDENTS} estudantes.`});
        const data=body(req); const email=normalizeEmail(data.email); const displayName=text(data.displayName); const slug=safeSlug(data.slug||displayName); if(!email||!displayName||!slug)return res.status(400).json({error:'Nome, e-mail e endereço do portfólio são obrigatórios.'});
        const exists=await query('SELECT id FROM hub_users WHERE email=$1',[email]); if(exists.length)return res.status(409).json({error:'Já existe uma conta com esse e-mail.'}); const slugExists=await query('SELECT id FROM hub_portfolios WHERE slug=$1',[slug]); if(slugExists.length)return res.status(409).json({error:'Esse endereço de portfólio já está em uso.'});
        const userId=randomUUID(); const portfolioId=randomUUID(); const temporaryPassword=generatePassword();
        await query('INSERT INTO hub_users (id,email,password_hash,role,email_verified) VALUES ($1,$2,$3,$4,FALSE)',[userId,email,hashPassword(temporaryPassword),'student']);
        await query(`INSERT INTO hub_portfolios (id,user_id,slug,display_name,headline,bio,about,theme,published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,TRUE)`,[portfolioId,userId,slug,displayName,'Designer em formação — projetos e processos','Portfólio acadêmico em construção.','Apresentação do estudante.',JSON.stringify(DEFAULT_THEME)]);
        const token=await createEmailToken(userId,'verify',60*48); const verifyUrl=`${appUrl(req)}/validar-email?token=${encodeURIComponent(token)}`;
        const emailSent=await sendEmail(email,'Ative seu portfólio — LabInterface UFSM',`<p>Olá, ${escapeHtml(displayName)}.</p><p>Seu espaço no Hub de Portfólios foi criado.</p><p><strong>Senha temporária:</strong> ${temporaryPassword}</p><p><a href="${verifyUrl}">Confirmar meu e-mail</a></p><p>Depois da confirmação, você já pode entrar e, se preferir, usar “Esqueci minha senha” para escolher outra senha.</p>`);
        return res.status(200).json({student:{id:userId,email,displayName,slug,emailVerified:false,published:true,projectCount:0},temporaryPassword,emailSent});
      }
      if(req.method==='DELETE'){
        const userId=text(firstQuery(req.query.id));
        if(!userId)return res.status(400).json({error:'Informe o estudante a excluir.'});
        const rows=await query("SELECT id FROM hub_users WHERE id=$1 AND role='student' LIMIT 1",[userId]);
        if(!rows[0])return res.status(404).json({error:'Estudante não encontrado.'});
        await query('DELETE FROM hub_users WHERE id=$1',[userId]);
        return res.status(200).json({ok:true});
      }
      return res.status(405).json({error:'Método não permitido.'});
    }

    if(action==='resend-verification' && req.method==='POST'){
      const admin=await requireAdmin(req,res); if(!admin)return; const userId=text(body(req).userId); const rows=await query("SELECT u.id,u.email,p.display_name FROM hub_users u JOIN hub_portfolios p ON p.user_id=u.id WHERE u.id=$1 AND u.role='student' LIMIT 1",[userId]); if(!rows[0])return res.status(404).json({error:'Estudante não encontrado.'}); const token=await createEmailToken(userId,'verify',60*48); const url=`${appUrl(req)}/validar-email?token=${encodeURIComponent(token)}`; const sent=await sendEmail(rows[0].email,'Confirme seu e-mail — Portfólios LabInterface',`<p>Olá, ${escapeHtml(rows[0].display_name)}.</p><p><a href="${url}">Confirmar e-mail</a></p><p>O link expira em 48 horas.</p>`); if(!sent)return res.status(503).json({error:'A conta existe, mas o serviço de e-mail ainda não conseguiu enviar a mensagem.'}); return res.status(200).json({ok:true});
    }

    if(action==='presign-upload' && req.method==='POST'){
      const user=await requireUser(req,res); if(!user)return; if(!storageConfigured())return res.status(503).json({error:'O Cloudflare R2 ainda não foi configurado.'}); const data=body(req); const contentType=text(data.contentType); const size=Number(data.size||0); const kind=text(data.kind); const portfolioId=text(data.portfolioId||user.portfolioId); if(!IMAGE_TYPES.has(contentType))return res.status(400).json({error:'Use JPG, PNG, WebP ou AVIF.'}); if(size<=0||size>MAX_IMAGE_BYTES)return res.status(400).json({error:'A imagem precisa ter no máximo 6 MB.'}); if(!['avatar','hero','cover','gallery'].includes(kind))return res.status(400).json({error:'Tipo de imagem inválido.'}); if(!portfolioId||!(await canEditPortfolio(user,portfolioId)))return res.status(403).json({error:'Portfólio não autorizado.'}); const key=`portfolios/${portfolioId}/${kind}/${randomUUID()}-${safeFilename(data.filename)}`; const command=new PutObjectCommand({Bucket:String(process.env.R2_BUCKET),Key:key,ContentType:contentType}); const uploadUrl=await getSignedUrl(s3Client(),command,{expiresIn:600}); const base=String(process.env.R2_PUBLIC_URL).replace(/\/$/,''); return res.status(200).json({uploadUrl,publicUrl:`${base}/${key}`});
    }

    return res.status(404).json({ error:'Rota não encontrada.' });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Erro interno.';
    return res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Não foi possível concluir a operação.' : message });
  }
}
