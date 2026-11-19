import { spawnSync } from 'node:child_process';

const migration = '20261117000000_init';
const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function prisma(...args) {
  const result = spawnSync(executable, ['prisma', ...args], {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  return result;
}

let deployment = prisma('migrate', 'deploy');

if (deployment.status !== 0 && `${deployment.stdout}\n${deployment.stderr}`.includes('P3005')) {
  console.log(`Baselining existing database with ${migration}...`);
  const baseline = prisma('migrate', 'resolve', '--applied', migration);
  if (baseline.status !== 0) process.exit(baseline.status ?? 1);
  deployment = prisma('migrate', 'deploy');
}

process.exit(deployment.status ?? 1);
