#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const appDir = __dirname;
const standaloneDir = path.join(appDir, '.next', 'standalone', 'apps', 'web');

// Copy .next/static into the standalone output so Next.js can serve /_next/static/
const staticSrc = path.join(appDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
if (fs.existsSync(staticSrc) && !fs.existsSync(staticDest)) {
  fs.mkdirSync(path.dirname(staticDest), { recursive: true });
  fs.cpSync(staticSrc, staticDest, { recursive: true });
}

// Copy public/ into the standalone output so static public assets are served
const publicSrc = path.join(appDir, 'public');
const publicDest = path.join(standaloneDir, 'public');
if (fs.existsSync(publicSrc) && !fs.existsSync(publicDest)) {
  fs.mkdirSync(publicDest, { recursive: true });
  fs.cpSync(publicSrc, publicDest, { recursive: true });
}

process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = '0.0.0.0';
require('./.next/standalone/apps/web/server.js');
