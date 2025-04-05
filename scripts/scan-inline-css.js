#!/usr/bin/env node

const { globby } = require('globby');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Regex to catch <style> tags without nonce and inline styles
const STYLE_TAG_REGEX = /<style(?![^>]*nonce)[^>]*>/i;
const INLINE_STYLE_REGEX = /\bstyle\s*=\s*["']/i;

// Keep stats
let matchCount = 0;
let filesWithMatch = new Set();

async function scanFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream });

  let lineNum = 0;

  for await (const line of rl) {
    lineNum++;
    if (STYLE_TAG_REGEX.test(line) || INLINE_STYLE_REGEX.test(line)) {
      matchCount++;
      filesWithMatch.add(filePath);
      console.log(`⚠️  Match in ${filePath}:${lineNum}`);
      console.log(`   → ${line.trim().slice(0, 160)}${line.length > 160 ? '…' : ''}`);
    }
  }
}

async function runScan() {
  console.log("🧠 Scanning project for inline <style> tags and inline CSS...");

  const paths = await globby([
    '**/*.{html,htm,js,jsx,ts,tsx}',
    '!node_modules/**',
    '!**/.git/**',
    '!**/venv/**',
    '!**/dist/**',
    '!**/public/**',
    '!**/coverage/**'
  ], {
    gitignore: true,
    absolute: true,
  });

  if (paths.length === 0) {
    console.log("🚫 No relevant files found to scan.");
    return;
  }

  for (const file of paths) {
    await scanFile(file);
  }

  console.log(`\n✅ Scan complete. ${matchCount} match(es) found in ${filesWithMatch.size} file(s).`);
}

runScan();
