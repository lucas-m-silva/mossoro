import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

// Local Database Middleware Plugin
function localDatabasePlugin() {
  const dbFile = path.resolve(import.meta.dirname || process.cwd(), 'database', 'mossoro_db.json');

  const readDb = () => {
    try {
      if (fs.existsSync(dbFile)) {
        return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
      }
    } catch (e) {
      console.error('Error reading local db:', e);
    }
    return { users: {} };
  };

  const writeDb = (data) => {
    try {
      fs.mkdirSync(path.dirname(dbFile), { recursive: true });
      fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('Error writing local db:', e);
      return false;
    }
  };

  return {
    name: 'local-database-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, 'http://localhost');

        if (url.pathname === '/api/progress' && req.method === 'GET') {
          const user = url.searchParams.get('user') || 'lucas';
          const db = readDb();
          const userData = db.users?.[user] || { completedTopics: [], notes: {} };
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(userData));
          return;
        }

        if (url.pathname === '/api/progress' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const user = payload.username || 'lucas';
              const db = readDb();
              if (!db.users) db.users = {};
              if (!db.users[user]) db.users[user] = {};

              db.users[user].completedTopics = payload.completedTopics || [];
              db.users[user].notes = payload.notes || {};
              db.users[user].updatedAt = new Date().toISOString();

              writeDb(db);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, user: db.users[user] }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        if (url.pathname === '/api/finance' && req.method === 'GET') {
          const user = url.searchParams.get('user') || 'lucas';
          const db = readDb();
          const financeData = db.users?.[user]?.finance || null;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(financeData));
          return;
        }

        if (url.pathname === '/api/finance' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const user = payload.username || 'lucas';
              const db = readDb();
              if (!db.users) db.users = {};
              if (!db.users[user]) db.users[user] = {};

              db.users[user].finance = payload.finance;
              db.users[user].updatedAt = new Date().toISOString();

              writeDb(db);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), localDatabasePlugin()],
  server: {
    port: 3000,
    open: false
  }
});
