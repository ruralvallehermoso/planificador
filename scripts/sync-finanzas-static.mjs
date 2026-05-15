import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(root, 'external-projects/finanzas/frontend/dashboard/dist');
const targetDir = join(root, 'public/static/finanzas');

await rm(targetDir, { recursive: true, force: true });
await mkdir(targetDir, { recursive: true });
await cp(sourceDir, targetDir, { recursive: true });

const indexPath = join(targetDir, 'index.html');
const indexHtml = await readFile(indexPath, 'utf8');
await writeFile(
  indexPath,
  indexHtml.replaceAll('"/assets/', '"/static/finanzas/assets/'),
);
