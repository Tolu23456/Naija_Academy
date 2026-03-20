#!/usr/bin/env node
/**
 * Fetches Supabase config from GitHub Repository Variables and writes .env
 * Runs automatically before the app starts.
 *
 * One-time setup:
 *   gh auth login
 *
 * Then add these as GitHub Repository Variables (not Secrets):
 *   Settings → Secrets and variables → Actions → Variables tab
 *   - SUPABASE_URL
 *   - SUPABASE_ANON_KEY
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');
const REPO = (() => {
  try {
    const remote = execSync('git remote get-url origin', { stdio: ['pipe', 'pipe', 'pipe'] })
      .toString().trim();
    const match = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
})();

function getVariable(name) {
  try {
    const result = execSync(
      `gh variable get ${name}${REPO ? ` --repo ${REPO}` : ''}`,
      { stdio: ['pipe', 'pipe', 'pipe'] }
    ).toString().trim();
    return result || null;
  } catch {
    return null;
  }
}

function checkGhAuth() {
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

console.log('Setting up environment from GitHub...');

if (!checkGhAuth()) {
  console.error('\n  GitHub CLI is not authenticated.');
  console.error('  Run this once to connect:\n');
  console.error('    gh auth login\n');
  console.error('  Then add SUPABASE_URL and SUPABASE_ANON_KEY as Repository Variables at:');
  console.error('  https://github.com/' + (REPO || '<your-repo>') + '/settings/variables/actions\n');
  process.exit(0);
}

const supabaseUrl = getVariable('SUPABASE_URL');
const supabaseAnonKey = getVariable('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('\n  Could not fetch one or more GitHub Variables.');
  console.warn('  Make sure these exist as Repository Variables (not Secrets):');
  console.warn('    - SUPABASE_URL');
  console.warn('    - SUPABASE_ANON_KEY');
  console.warn('  Visit: https://github.com/' + (REPO || '<your-repo>') + '/settings/variables/actions\n');
  process.exit(0);
}

const envContent = [
  `EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl}`,
  `EXPO_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}`,
  '',
].join('\n');

fs.writeFileSync(ENV_PATH, envContent, 'utf8');
console.log('  .env created successfully from GitHub Variables.');
