#!/usr/bin/env node
process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = "0.0.0.0";

const path = require("path");
const serverPath = path.join(__dirname, ".next", "standalone", "apps", "web", "server.js");

// Change working directory so static files resolve correctly
process.chdir(path.dirname(serverPath));
require(serverPath);
