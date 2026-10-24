// `next start` on the first free port from 3000, as `next dev` already does.
// `next start` itself fails outright when its port is taken. An explicit
// `-p`/`--port` argument or a PORT variable is passed through untouched.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';

const args = process.argv.slice(2);
const portGiven = Boolean(process.env.PORT)
  || args.some((arg) => arg === '-p' || arg === '--port' || arg.startsWith('--port='));

/** Whether nothing is listening on `port`, on any interface. */
function isFree(port) {
  return new Promise((resolve) => {
    const probe = createServer()
      .once('error', () => resolve(false))
      .once('listening', () => probe.close(() => resolve(true)))
      .listen(port);
  });
}

async function firstFreePort(from) {
  for (let port = from; port < from + 100; port += 1) {
    if (await isFree(port)) return port;
  }
  throw new Error(`No free port between ${from} and ${from + 99}`);
}

const nextArgs = portGiven ? args : ['-p', String(await firstFreePort(3000)), ...args];
const nextBin = createRequire(import.meta.url).resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'start', ...nextArgs], { stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
