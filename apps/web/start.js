#!/usr/bin/env node
// Railway start wrapper - sets PORT and HOSTNAME before starting Next.js standalone server
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = '0.0.0.0';

// Load the standalone server
require('./.next/standalone/apps/web/server.js');
