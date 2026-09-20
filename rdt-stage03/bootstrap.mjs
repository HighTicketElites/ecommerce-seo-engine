import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const encoded = fs.readFileSync(new URL('./runtime.part.00', import.meta.url), 'utf8').trim();
const archive = '/tmp/resideterra-stage03.tgz';
fs.writeFileSync(archive, Buffer.from(encoded, 'base64'));
execFileSync('tar', ['-xzf', archive, '-C', process.cwd()], { stdio: 'inherit' });
console.log('Stage03 source restored for build.');
