#!/usr/bin/env node
/**
 * Markdown linter dispatcher.
 *
 * Reads the `linting:` block from .workflow-config.yaml and invokes the
 * configured md_linter tool with the declared glob and exclusion patterns.
 * Passes through --fix when called as `node scripts/lint-md.js --fix`.
 *
 * Change the active tool without touching package.json:
 *   linting:
 *     md_linter: markdownlint-cli2   # ← edit this line in .workflow-config.yaml
 */

import { execFileSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONFIG_FILE = join(ROOT, '.workflow-config.yaml');

// ---------------------------------------------------------------------------
// Parse the linting: block from YAML (no external yaml library needed).
// ---------------------------------------------------------------------------

function readConfig() {
  const raw = readFileSync(CONFIG_FILE, 'utf8');

  const tool = (raw.match(/^linting:\s*\n(?:[ \t]+\S[^\n]*\n)*?[ \t]+md_linter:\s*(\S+)/m) || [])[1]
    || 'markdownlint-cli2';

  const glob = (raw.match(/^linting:\s*\n(?:[ \t]+\S[^\n]*\n)*?[ \t]+md_glob:\s*"?([^"\n]+)"?/m) || [])[1]
    || '**/*.md';

  // Collect list items under md_excludes:
  const excludesBlockMatch = raw.match(/[ \t]+md_excludes:\s*\n((?:[ \t]+-[^\n]*\n?)+)/m);
  const excludes = excludesBlockMatch
    ? excludesBlockMatch[1]
        .split('\n')
        .map(l => l.replace(/^\s+-\s*["']?/, '').replace(/["']?\s*$/, '').trim())
        .filter(Boolean)
    : [
        '!node_modules/**',
        '!venv/**',
        '!.ai_workflow/**',
        '!.pytest_cache/**',
        '!tests/**/.pytest_cache/**',
      ];

  return { tool, glob, excludes };
}

// ---------------------------------------------------------------------------
// Build argv and run.
// ---------------------------------------------------------------------------

const fix = process.argv.includes('--fix');
const { tool, glob, excludes } = readConfig();

const toolBin = join(ROOT, 'node_modules', '.bin', tool);
const resolvedBin = existsSync(toolBin) ? toolBin : tool;

const args = fix ? ['--fix'] : [];
args.push(glob, ...excludes);

try {
  execFileSync(resolvedBin, args, { stdio: 'inherit', cwd: ROOT });
} catch (err) {
  // execFileSync throws when the child exits non-zero; the child already
  // printed its own output. Mirror the exit code.
  process.exit(typeof err.status === 'number' ? err.status : 1);
}
