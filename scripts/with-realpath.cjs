const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = fs.realpathSync(path.join(__dirname, '..'));
process.chdir(root);

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('Usage: node scripts/with-realpath.cjs <command> [...args]');
  process.exit(1);
}

const child = spawn(command, args, {
  stdio: 'inherit',
  cwd: root,
  env: process.env,
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
