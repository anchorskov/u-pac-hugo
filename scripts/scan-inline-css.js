#!/usr/bin/env node

const globby = require('globby');
const fs = require('fs');
const readline = require('readline');

// Patterns to match <style> tags and inline styles
const STYLE_TAG_REGEX = /<style(?![^>]*nonce)[^>]*>/i;
const INLINE_STYLE_REGEX = /style\s*=\s*["']/i;

async function scanFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ input: fileStream });
  let lineNum = 0;

  for await (const line of rl) {
    lineNum++;
    if (STYLE_TAG_REGEX.test(line) || INLINE_STYLE_REGEX.test(line)) {
      console.log(`⚠️  Match in ${filePath}:${lineNum}`);
      console.log(`   → ${line.trim()}`);
    }
  }
}

async function runScan() {
  console.log("🧠 Scanning project for inline CSS & <style> tags...");

  const paths = await globby([
    '**/*.{html,htm,js,jsx,ts,tsx}',   // scan only relevant files
    '!node_modules',
    '!**/.git/**',
    '!venv',
    '!dist',
    '!public',
  ], {
    gitignore: true,
    ignore: ['**/node_modules/**']
  });

  if (paths.length === 0) {
    console.log("✅ No relevant files found.");
    return;
  }

  for (const path of paths) {
    await scanFile(path);
  }

  console.log("✅ Scan complete.");
}

runScan();
