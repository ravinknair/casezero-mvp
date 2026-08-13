#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const reportDir = './test-reports';
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const testProc = spawn('node', ['--test', 'tests/casezero-e2e.test.mjs'], {
  cwd: process.cwd(),
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

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CaseZero Test Results</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #071827 0%, #111827 100%);
      color: #e2e8f0;
      padding: 40px 20px;
      min-height: 100vh;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #7dd3fc 0%, #60a5fa 50%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .subtitle { font-size: 1.1em; color: #94a3b8; margin-bottom: 40px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .card {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .card h2 { font-size: 2em; margin-bottom: 5px; }
    .card p { font-size: 0.9em; color: #94a3b8; }
    .passed { color: #34d399; }
    .failed { color: #f87171; }
    .total { color: #60a5fa; }
    .output {
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9em;
      line-height: 1.6;
      color: #a0aec0;
      max-height: 500px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .status {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 20px;
    }
    .status.pass { background: rgba(52, 211, 153, 0.1); color: #34d399; }
    .status.fail { background: rgba(248, 113, 113, 0.1); color: #f87171; }
    .timestamp { color: #64748b; font-size: 0.9em; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>CaseZero Test Report</h1>
    <p class="subtitle">Deterministic workflow simulation tests</p>
    
    <div class="summary">
      <div class="card">
        <h2 class="total">${total}</h2>
        <p>Total Tests</p>
      </div>
      <div class="card">
        <h2 class="passed">${passed}</h2>
        <p>Passed</p>
      </div>
      <div class="card">
        <h2 class="failed">${failed}</h2>
        <p>Failed</p>
      </div>
    </div>

    <div>
      <h2 style="margin-bottom: 15px; font-size: 1.3em;">Test Output</h2>
      <div class="output">${output.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      <div class="status ${failed === 0 ? 'pass' : 'fail'}">
        ${failed === 0 ? '✓ All tests passed' : '✗ Some tests failed'}
      </div>
      <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;

  const reportPath = path.join(reportDir, 'index.html');
  fs.writeFileSync(reportPath, html);
  console.log(`✓ Test report saved to: ${reportPath}`);
  process.exit(code);
});
