// Copies the flag SVGs the quizzes need from the `flag-icons` package into
// public/flags/ (already committed - only rerun if you change flag codes).
//
// Usage: npm run copy:flags            (uses node_modules/flag-icons)
//        node scripts/copy-flags.mjs path/to/flag-icons
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const pkg = process.argv[2] ?? 'node_modules/flag-icons';
const src = join(pkg, 'flags', '4x3');
const data = readFileSync('src/data/countries.ts', 'utf8');
const codes = [...data.matchAll(/flag: '([a-z-]+)'/g)].map((m) => m[1]);

mkdirSync('public/flags', { recursive: true });
let missing = 0;
for (const code of codes) {
  const file = join(src, `${code}.svg`);
  if (!existsSync(file)) {
    console.error(`Missing flag: ${code}`);
    missing++;
    continue;
  }
  copyFileSync(file, join('public/flags', `${code}.svg`));
}
copyFileSync(join(pkg, 'LICENSE'), join('public/flags', 'LICENSE.txt'));
console.log(`Copied ${codes.length - missing} flags to public/flags`);
if (missing) process.exit(1);
