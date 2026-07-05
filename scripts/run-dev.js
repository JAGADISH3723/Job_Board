import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const nodeCommand = process.execPath;

const runs = [
  { name: 'backend', command: nodeCommand, args: ['backend/index.cjs'] },
  { name: 'client', command: nodeCommand, args: ['node_modules/vite/bin/vite.js'] }
];

const procs = runs.map(({ name, command, args }) => {
  const proc = spawn(command, args, {
    cwd: rootDir,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: false
  });

  proc.stdout.on('data', data => process.stdout.write(`[${name}] ${data}`));
  proc.stderr.on('data', data => process.stderr.write(`[${name}] ${data}`));
  proc.on('exit', code => {
    console.log(`[${name}] exited with code ${code}`);
    if (code !== 0) process.exit(code);
  });

  proc.on('error', err => {
    console.error(`[${name}] spawn error:`, err.message);
    process.exit(1);
  });

  return proc;
});

process.on('SIGINT', () => {
  procs.forEach(proc => proc.kill('SIGINT'));
  process.exit(0);
});
