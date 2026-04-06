#!/usr/bin/env node
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = '0.0.0.0';
require('./.next/standalone/apps/web/server.js');
