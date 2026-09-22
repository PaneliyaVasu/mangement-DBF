import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './server/src/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const distPath = path.resolve(__dirname, 'dist');

// Serve static frontend files
app.use(express.static(distPath));

// Fallback to index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🕊️ Surat Center Management Platform running on http://0.0.0.0:${PORT}`);
});
