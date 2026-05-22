import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import mysql from 'mysql2/promise';
import cookieParser from 'cookie-parser';

export const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Cloudinary is DISABLED by default.
// To enable: set ENABLE_CLOUDINARY=true in .env with valid credentials.
const cloudinaryReady = process.env.ENABLE_CLOUDINARY === 'true' &&
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (cloudinaryReady) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary enabled for cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('Cloudinary disabled — local file storage will be used.');
}

const uploadDir = process.env.VERCEL ? '/tmp' : 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'nexus_cms_super_secret_key_2026');
const DB_FILE = path.join(process.cwd(), 'database.json');
let isTiDB = !!process.env.DATABASE_URL;
let dbInitialized = false;

const defaultDb = {
  admin: { username: 'admin', passwordHash: bcrypt.hashSync('admin123', 10) },
  projects: [
    { id: 'PRJ-001', title: 'Neon E-Commerce', cat: 'Web App', status: 'ACTIVE', description: 'Detailed description of the Neon E-Commerce', dateCreated: '2024-01-01', link: 'https://daiken.dev', image: '' }
  ],
  certificates: [
    { id: 'CERT-001', title: 'Advanced React Patterns', issuer: 'Frontend Masters', year: 2023, description: 'Details about Advanced React Patterns', image: '', cat: '' }
  ],
  notifications: [
    { id: 'NOTIF-001', type: 'SYSTEM', message: 'System update deployed successfully.', time: new Date().toISOString(), read: false }
  ],
  categories: [
    { id: 'CAT-1', type: 'portfolio', name: 'Web App' },
    { id: 'CAT-2', type: 'portfolio', name: 'Mobile App' },
    { id: 'CAT-3', type: 'certificate', name: 'Frontend' }
  ],
  settings: {
    siteTitle: "Daiken's Portfolio", contactEmail: "contact@daiken.dev",
    socialLinks: { github: "https://github.com/daiken", linkedin: "https://linkedin.com/in/daiken", twitter: "https://twitter.com/daiken", instagram: "", email: "contact@daiken.dev", whatsapp: "" },
    maintenanceMode: false,
    heroData: {
      typeText1: "> System Initialized...",
      typeText2: "> Loading Portfolio_AI_Engineer/Designer_",
      heading: "Architecting Intelligence & Digital Experiences.",
      description: "Fusing code, design, and machine learning to build future-ready solutions. Welcome to my neural workspace.",
      exploreText: "EXPLORE MY WORK",
      cvText: "DOWNLOAD_CV.exe"
    },
    aboutData: {
      fingerprintText: "IDENTIFICATION",
      fingerprintActiveText: "ACCESS GRANTED",
      leftTerminalTitle: "PROFILE V1.0",
      skillsTitle: "KEAHLIAN TEKNIS",
      skillsList: "Front-End Development, Back-End, Desain UI/UX (Figma), Data Science, Cloud Architecture",
      sysStats: "Sys_stats: OK | CPU: 34% | RAM: 4.2GB",
      rightTerminalTitle: "TERMINAL V1.0",
      scanCompleteText: "[BIOMETRIC SCAN COMPLETE]",
      scanDetails: "USER_ID: 9942\nACCESS: Administrator\nHACKER_MODE: ENGAGED"
    }
  }
};

const readDB = () => {
    if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    return defaultDb;
};

const writeDB = (data: any) => {
    if (!process.env.VERCEL) fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

if (!process.env.VERCEL && !fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
}

const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) return res.sendStatus(401);

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
};

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use('/api', limiter);
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

const getConnection = async () => {
    try {
        return await mysql.createConnection({
            uri: process.env.DATABASE_URL!,
            ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
        });
    } catch (err: any) {
        if (err.code === 'ER_BAD_DB_ERROR') {
            const url = new URL(process.env.DATABASE_URL!);
            const dbName = url.pathname.substring(1);
            url.pathname = '/';
            try {
                const tempConn = await mysql.createConnection({
                    uri: url.toString(),
                    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
                });
                await tempConn.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
                await tempConn.end();
            } catch (createErr: any) {
                console.log("Could not create database automatically. Please create it manually. Error:", createErr.message);
                throw err;
            }
            return await mysql.createConnection({
                uri: process.env.DATABASE_URL!,
                ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
            });
        }
        throw err;
    }
};

const handleQuery = async (query: string, params: any[] = []) => {
    if (isTiDB) {
        let connection = null;
        try {
            connection = await getConnection();
            const [rows] = await connection.execute(query, params);
            return rows as any[];
        } catch (err: any) {
            if (!err.message?.includes("doesn't exist")) {
                 console.error("TiDB Error:", err);
                 if (err.code === 'ER_ACCESS_DENIED_ERROR' || err.message?.includes('Access denied')) {
                     console.warn('Disabling TiDB fallback to local db due to access denied error.');
                     isTiDB = false;
                 }
            }
        } finally {
            if (connection) await connection.end().catch(() => {});
        }
    }
    return null;
}

const initTiDB = async () => {
    if (!isTiDB || dbInitialized) return;
    try {
        const connection = await getConnection();
        await connection.execute(`CREATE TABLE IF NOT EXISTS projects (id VARCHAR(100) PRIMARY KEY, title VARCHAR(255), cat VARCHAR(100), status VARCHAR(50), description TEXT, dateCreated VARCHAR(100), link VARCHAR(255), image VARCHAR(255))`);
        await connection.execute(`CREATE TABLE IF NOT EXISTS certificates (id VARCHAR(100) PRIMARY KEY, title VARCHAR(255), issuer VARCHAR(255), year INT, description TEXT, image VARCHAR(255), cat VARCHAR(100))`);
        try { await connection.execute('ALTER TABLE certificates ADD COLUMN image VARCHAR(255)'); } catch(e){}
        try { await connection.execute('ALTER TABLE certificates ADD COLUMN cat VARCHAR(100)'); } catch(e){}
        await connection.execute(`CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(100) PRIMARY KEY, type VARCHAR(50), message TEXT, time VARCHAR(100), \`read\` BOOLEAN)`);
        await connection.execute(`CREATE TABLE IF NOT EXISTS categories (id VARCHAR(100) PRIMARY KEY, type VARCHAR(50), name VARCHAR(255))`);
        await connection.execute(`CREATE TABLE IF NOT EXISTS settings (id INT PRIMARY KEY DEFAULT 1, siteTitle VARCHAR(255), contactEmail VARCHAR(255), socialLinks JSON, maintenanceMode BOOLEAN, heroData JSON, aboutData JSON)`);

        try { await connection.execute('ALTER TABLE settings ADD COLUMN heroData JSON'); } catch(e){}
        try { await connection.execute('ALTER TABLE settings ADD COLUMN aboutData JSON'); } catch(e){}

        const [settingsRes]: any = await connection.execute('SELECT * FROM settings WHERE id=1');
        if (settingsRes.length === 0) {
            await connection.execute('INSERT INTO settings (id, siteTitle, contactEmail, socialLinks, maintenanceMode, heroData, aboutData) VALUES (1, ?, ?, ?, false, ?, ?)',
            ["Daiken's Portfolio", "contact@daiken.dev", JSON.stringify({ github: "", linkedin: "", twitter: "", instagram:"", email:"", whatsapp:"" }), JSON.stringify(defaultDb.settings.heroData), JSON.stringify(defaultDb.settings.aboutData)]);
        }
        await connection.end();
        dbInitialized = true;
    } catch (e: any) {
        if (!e.message?.includes("already exists")) {
            console.error("TiDB Init Error:", e);
            if (e.code === 'ER_ACCESS_DENIED_ERROR' || e.message?.includes('Access denied')) {
                console.warn('Disabling TiDB fallback to local db due to access denied error.');
                isTiDB = false;
            }
        }
    }
}

app.use(async (req, res, next) => {
    if (isTiDB && req.path.startsWith('/api') && !dbInitialized) {
        await initTiDB();
    }
    next();
});

app.get('/api/init', async (req, res) => {
    if (!isTiDB) {
        return res.json({ message: 'TiDB is not configured. Local fallback is being used.' });
    }
    try {
        dbInitialized = false;
        await initTiDB();
        res.json({
            success: true,
            message: 'Database initialized successfully.',
            note: 'Default admin credentials are username: admin / password: admin123'
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Failed to initialize database' });
    }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  let isValid = false;

  const envUser = process.env.ADMIN_USERNAME || 'admin';
  const envPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === envUser && password === envPass) {
      isValid = true;
  }

  if (isValid) {
      const token = await new jose.SignJWT({ username })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(JWT_SECRET);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
      });

      return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/projects', async (req, res) => {
  if (isTiDB) {
      try {
        const rows = await handleQuery('SELECT * FROM projects');
        if (rows) return res.json(rows);
      } catch(e: any) {
        if(!e?.message?.includes("doesn't exist")) console.error('TiDB Error:', e);
      }
  }
  res.json(readDB().projects || []);
});

app.get('/api/certificates', async (req, res) => {
  if (isTiDB) {
      try {
        const rows = await handleQuery('SELECT * FROM certificates');
        if (rows) return res.json(rows);
      } catch(e: any) { }
  }
  res.json(readDB().certificates || []);
});

app.get('/api/settings', async (req, res) => {
  if (isTiDB) {
      try {
        const rows = await handleQuery('SELECT * FROM settings LIMIT 1');
        if (rows && rows.length) {
            const row = rows[0];
            return res.json({
                ...row,
                socialLinks: typeof row.socialLinks === 'string' ? JSON.parse(row.socialLinks) : row.socialLinks,
                heroData: typeof row.heroData === 'string' ? JSON.parse(row.heroData) : row.heroData,
                aboutData: typeof row.aboutData === 'string' ? JSON.parse(row.aboutData) : row.aboutData
            });
        }
      } catch(e: any){}
  }
  res.json(readDB().settings || {});
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  const msg = `Message from ${name} (${email}): ${message}`;

  if (isTiDB) {
      const id = `NOTIF-${Date.now()}`;
      await handleQuery('INSERT INTO notifications (id, type, message, time, `read`) VALUES (?, ?, ?, ?, ?)', [id, 'USER', msg, new Date().toISOString(), false]);
      return res.json({ success: true });
  }
  const db = readDB();
  if(!db.notifications) db.notifications = [];
  const newNotif = { id: `NOTIF-${String(db.notifications.length + 1).padStart(3, '0')}`, type: 'USER', message: msg, time: new Date().toISOString(), read: false };
  db.notifications.push(newNotif);
  writeDB(db);
  res.json({ success: true });
});

// ─── FIXED UPLOAD ENDPOINT ───────────────────────────────────────────────────
app.post('/api/admin/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    let uploadedUrl: string | null = null;

    // Only try Cloudinary when credentials are valid (not placeholder values)
    if (cloudinaryReady) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'nexus_cms',
          resource_type: 'auto'
        });
        uploadedUrl = result.secure_url;
        console.log('Uploaded to Cloudinary:', uploadedUrl);
      } catch (err: any) {
        console.error('Cloudinary upload failed, using local storage:', err?.message || err);
      }
    }

    // Always fall back to local storage if Cloudinary didn't work
    if (!uploadedUrl) {
      const publicDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `upload_${Date.now()}${ext}`;
      const targetPath = path.join(publicDir, filename);

      fs.copyFileSync(req.file.path, targetPath);
      uploadedUrl = `/uploads/${filename}`;
      console.log('Saved locally:', uploadedUrl);
    }

    // Clean up the multer temp file
    try {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    } catch (_) {}

    res.json({ url: uploadedUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Admin Projects
app.post('/api/admin/projects', authenticateToken, async (req, res) => {
  const id = `PRJ-${Date.now()}`;
  if (isTiDB) {
      await handleQuery('INSERT INTO projects (id, title, cat, status, description, dateCreated, link, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
          id, req.body.title||'', req.body.cat||'', req.body.status||'ACTIVE', req.body.description||'', req.body.dateCreated||'', req.body.link||'', req.body.image||''
      ]);
      const newProj = await handleQuery('SELECT * FROM projects WHERE id=?', [id]);
      return res.json(newProj?.[0] || req.body);
  }
  const db = readDB();
  if(!db.projects) db.projects = [];
  const newProject = { id, ...req.body };
  db.projects.push(newProject);
  writeDB(db);
  res.json(newProject);
});

app.put('/api/admin/projects/:id', authenticateToken, async (req, res) => {
  if (isTiDB) {
      const p = req.body;
      const updates = [];
      const params = [];
      for (const key of ['title', 'cat', 'status', 'description', 'dateCreated', 'link', 'image']) {
          if (p[key] !== undefined) { updates.push(`${key}=?`); params.push(p[key]); }
      }
      if (updates.length > 0) {
          params.push(req.params.id);
          await handleQuery(`UPDATE projects SET ${updates.join(', ')} WHERE id=?`, params);
      }
      const updated = await handleQuery('SELECT * FROM projects WHERE id=?', [req.params.id]);
      return res.json(updated?.[0] || p);
  }
  const db = readDB();
  if(!db.projects) db.projects = [];
  const index = db.projects.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  db.projects[index] = { ...db.projects[index], ...req.body };
  writeDB(db);
  res.json(db.projects[index]);
});

app.delete('/api/admin/projects/:id', authenticateToken, async (req, res) => {
  if (isTiDB) {
      await handleQuery('DELETE FROM projects WHERE id=?', [req.params.id]);
      return res.json({ success: true });
  }
  const db = readDB();
  if(!db.projects) db.projects = [];
  const filtered = db.projects.filter((p: any) => p.id !== req.params.id);
  if (filtered.length === db.projects.length) return res.status(404).json({ error: 'Not found' });
  db.projects = filtered;
  writeDB(db);
  res.json({ success: true });
});

// Admin Certificates
app.post('/api/admin/certificates', authenticateToken, async (req, res) => {
  const id = `CERT-${Date.now()}`;
  if (isTiDB) {
      await handleQuery('INSERT INTO certificates (id, title, issuer, year, description, image, cat) VALUES (?, ?, ?, ?, ?, ?, ?)', [
         id, req.body.title||'', req.body.issuer||'', req.body.year||new Date().getFullYear(), req.body.description||'', req.body.image||'', req.body.cat||''
      ]);
      const newCert = await handleQuery('SELECT * FROM certificates WHERE id=?', [id]);
      return res.json(newCert?.[0] || req.body);
  }
  const db = readDB();
  if(!db.certificates) db.certificates = [];
  const newCert = { id, ...req.body };
  db.certificates.push(newCert);
  writeDB(db);
  res.json(newCert);
});

app.put('/api/admin/certificates/:id', authenticateToken, async (req, res) => {
  if (isTiDB) {
      const p = req.body;
      const updates = [];
      const params = [];
      for (const key of ['title', 'issuer', 'year', 'description', 'image', 'cat']) {
          if (p[key] !== undefined) { updates.push(`${key}=?`); params.push(p[key]); }
      }
      if (updates.length > 0) {
          params.push(req.params.id);
          await handleQuery(`UPDATE certificates SET ${updates.join(', ')} WHERE id=?`, params);
      }
      const updated = await handleQuery('SELECT * FROM certificates WHERE id=?', [req.params.id]);
      return res.json(updated?.[0] || p);
  }
  const db = readDB();
  if(!db.certificates) db.certificates = [];
  const index = db.certificates.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  db.certificates[index] = { ...db.certificates[index], ...req.body };
  writeDB(db);
  res.json(db.certificates[index]);
});

app.delete('/api/admin/certificates/:id', authenticateToken, async (req, res) => {
  if (isTiDB) {
      await handleQuery('DELETE FROM certificates WHERE id=?', [req.params.id]);
      return res.json({ success: true });
  }
  const db = readDB();
  if(!db.certificates) db.certificates = [];
  const filtered = db.certificates.filter((c: any) => c.id !== req.params.id);
  if (filtered.length === db.certificates.length) return res.status(404).json({ error: 'Not found' });
  db.certificates = filtered;
  writeDB(db);
  res.json({ success: true });
});

// Administrator Categories
app.get('/api/categories', async (req, res) => {
  if (isTiDB) {
      try {
        const rows = await handleQuery('SELECT * FROM categories');
        if (rows) return res.json(rows);
      } catch(e: any) { }
  }
  res.json(readDB().categories || []);
});

app.post('/api/admin/categories', authenticateToken, async (req, res) => {
  const id = `CAT-${Date.now()}`;
  if (isTiDB) {
      await handleQuery('INSERT INTO categories (id, type, name) VALUES (?, ?, ?)', [
         id, req.body.type||'portfolio', req.body.name||''
      ]);
      const newCat = await handleQuery('SELECT * FROM categories WHERE id=?', [id]);
      return res.json(newCat?.[0] || { id, ...req.body });
  }
  const db = readDB();
  if(!db.categories) db.categories = [];
  const newCat = { id, ...req.body };
  db.categories.push(newCat);
  writeDB(db);
  res.json(newCat);
});

app.put('/api/admin/categories/:id', authenticateToken, async (req, res) => {
  if (isTiDB) {
      await handleQuery('UPDATE categories SET type=?, name=? WHERE id=?', [req.body.type, req.body.name, req.params.id]);
      const updated = await handleQuery('SELECT * FROM categories WHERE id=?', [req.params.id]);
      return res.json(updated?.[0] || req.body);
  }
  const db = readDB();
  if(!db.categories) db.categories = [];
  const index = db.categories.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  db.categories[index] = { ...db.categories[index], ...req.body };
  writeDB(db);
  res.json(db.categories[index]);
});

app.delete('/api/admin/categories/:id', authenticateToken, async (req, res) => {
  if (isTiDB) {
      await handleQuery('DELETE FROM categories WHERE id=?', [req.params.id]);
      return res.json({ success: true });
  }
  const db = readDB();
  if(!db.categories) db.categories = [];
  db.categories = db.categories.filter((c: any) => c.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

app.get('/api/admin/notifications', authenticateToken, async (req, res) => {
  if (isTiDB) {
     const rows = await handleQuery('SELECT * FROM notifications ORDER BY time DESC');
     return res.json(rows || []);
  }
  const db = readDB();
  res.json(db.notifications || []);
});

app.put('/api/admin/notifications/read-all', authenticateToken, async (req, res) => {
  if (isTiDB) {
     await handleQuery('UPDATE notifications SET `read` = true');
     const rows = await handleQuery('SELECT * FROM notifications ORDER BY time DESC');
     return res.json(rows || []);
  }
  const db = readDB();
  if(!db.notifications) db.notifications = [];
  db.notifications = db.notifications.map((n: any) => ({ ...n, read: true }));
  writeDB(db);
  res.json(db.notifications);
});

app.put('/api/admin/settings', authenticateToken, async (req, res) => {
  if (isTiDB) {
      const p = req.body;
      const updates = [];
      const params = [];
      for (const key of ['siteTitle', 'contactEmail', 'socialLinks', 'maintenanceMode', 'heroData', 'aboutData']) {
          if (p[key] !== undefined) {
              updates.push(`${key}=?`);
              params.push((key === 'socialLinks' || key === 'heroData' || key === 'aboutData') ? JSON.stringify(p[key]) : p[key]);
          }
      }
      if (updates.length > 0) {
          params.push(1);
          await handleQuery(`UPDATE settings SET ${updates.join(', ')} WHERE id=?`, params);
      }
      const rows = await handleQuery('SELECT * FROM settings WHERE id=1');
      if (rows?.[0]) {
          const row = rows[0];
          return res.json({
              ...row,
              socialLinks: typeof row.socialLinks === 'string' ? JSON.parse(row.socialLinks) : row.socialLinks,
              heroData: typeof row.heroData === 'string' ? JSON.parse(row.heroData) : row.heroData,
              aboutData: typeof row.aboutData === 'string' ? JSON.parse(row.aboutData) : row.aboutData
          });
      }
      return res.json(p);
  }
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json(db.settings);
});

app.put('/api/admin/profile', authenticateToken, async (req, res) => {
  return res.status(400).json({ error: 'Password changes must be done via the .env file.' });
});

export default app;