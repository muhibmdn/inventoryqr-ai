require('dotenv').config();
const { execSync } = require('child_process');

const command = process.argv.slice(2).join(' ');
if (!command) {
  console.error('Usage: node scripts/run-prisma-with-env.js <prisma-command>');
  process.exit(1);
}

try {
  execSync(`pnpm prisma ${command}`, { stdio: 'inherit' });
} catch (error) {
  process.exit(error.status || 1);
}