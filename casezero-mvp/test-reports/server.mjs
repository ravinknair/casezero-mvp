#!/usr/bin/env node

import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3001;

// Simple HTTP server for the test dashboard
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Run tests endpoint
  if (req.url === '/api/run-tests' && req.method === 'POST') {
    console.log('📋 Running tests...');
    
    const testProc = spawn('node', ['--test', 'tests/casezero-e2e.test.mjs'], {
      cwd: path.join(__dirname, '..'), // casezero-mvp parent directory
      stdio: 'pipe',
    });

    let output = '';
    testProc.stdout.on('data', (data) => {
      output += data.toString();
    });
    testProc.stderr.on('data', (data) => {
      output += data.toString();
    });

    testProc.on('close', (code) => {
      const passed = (output.match(/ok \d+/g) || []).length;
      const failed = (output.match(/not ok \d+/g) || []).length;
      const total = passed + failed;

      const result = {
        success: code === 0,
        passed,
        failed,
        total,
        output,
        timestamp: new Date().toISOString(),
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      console.log(`✅ Tests complete: ${passed}/${total} passed`);
    });

    // Handle process errors
    testProc.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
      console.error('❌ Error running tests:', err);
    });

    return;
  }

  // Serve the dashboard HTML
  if (req.url === '/' || req.url === '/index.html') {
    const dashboardPath = path.join(__dirname, 'index.html');
    fs.readFile(dashboardPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Dashboard not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         🧪 CaseZero Test Dashboard Server                 ║
╚════════════════════════════════════════════════════════════╝

📊 Dashboard: http://localhost:${PORT}
🔄 Run Tests: POST http://localhost:${PORT}/api/run-tests

To run tests from the dashboard:
1. Open: http://localhost:${PORT}
2. Click "Run Tests" button
3. Results update in real-time

To stop: Press Ctrl+C

  `);
});
