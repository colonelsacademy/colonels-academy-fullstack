#!/usr/bin/env node
process.env.PORT = process.env.PORT || '3000';
process.env.HOSTNAME = '0.0.0.0';

const path = require('path');
// Change working directory to standalone output so static files resolve correctly
process.chdir(path.join(__dirname, '.next', 'standalone', 'apps', 'web'));
require('./server.js');
