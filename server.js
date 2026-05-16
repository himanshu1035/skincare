const path = require('path');
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// This file is used as the 'Startup File' for cPanel Node.js Selector
// It serves the 'standalone' build created by Next.js

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// When using 'output: standalone', Next.js creates a server.js in .next/standalone
// We point cPanel to this file to start the app correctly
try {
  require('./.next/standalone/server.js');
  console.log(`Server started on port ${port}`);
} catch (e) {
  // If the standalone server isn't found (e.g. before build), we provide a fallback
  console.error('Next.js standalone server not found. Please run "npm run build" first.');
  
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Next.js app is initializing or build is missing. Please check console.');
  });

  server.listen(port, () => {
    console.log(`Fallback server listening on ${port}`);
  });
}
