#!/usr/bin/env node
// Railway start wrapper - ensures PORT and HOSTNAME are set for Next.js standalone
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = '0.0.0.0';

const path = require('path');

// In monorepo, standalone output is at .next/standalone/apps/web/server.js
// The process runs from /app/apps/web so we need the relative path
const serverPath = path.join(__dirname, '.next', 'standalone', 'apps', 'web', 'server.js');

console.log('Starting Next.js server from:', serverPath);
console.log('PORT:', process.env.PORT);
console.log('HOSTNAME:', process.env.HOSTNAME);

require(serverPath);
