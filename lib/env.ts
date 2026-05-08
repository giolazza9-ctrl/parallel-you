import * as fs from 'fs';
import * as path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var __parallelYouEnvLoadedAt: number | undefined;
}

function parseEnvValue(rawValue: string) {
  const trimmed = rawValue.trim();
  if (!trimmed) return '';

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  const hashIndex = trimmed.indexOf(' #');
  if (hashIndex >= 0) {
    return trimmed.slice(0, hashIndex).trim();
  }

  return trimmed;
}

export function loadRootDotEnv() {
  const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local'),
  ].filter((envPath) => fs.existsSync(envPath));

  if (envPaths.length === 0) {
    global.__parallelYouEnvLoadedAt = Date.now();
    return;
  }

  const newestMtime = Math.max(...envPaths.map((envPath) => fs.statSync(envPath).mtimeMs));
  if (global.__parallelYouEnvLoadedAt && global.__parallelYouEnvLoadedAt >= newestMtime) return;

  for (const envPath of envPaths) {
    const contents = fs.readFileSync(envPath, 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex <= 0) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key) continue;

      const value = parseEnvValue(trimmed.slice(separatorIndex + 1));
      process.env[key] = value;
    }
  }

  global.__parallelYouEnvLoadedAt = newestMtime;
}

loadRootDotEnv();
