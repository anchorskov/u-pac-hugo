#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const SOURCE_URL = 'https://raw.githubusercontent.com/unitedstates/congress-legislators/main/legislators-current.json';
const OUTPUT_PATH = path.join(__dirname, '../sibi-d1-worker/legislators_compact.json');

console.log('🌐 Downloading latest legislators-current.json...');

https.get(SOURCE_URL, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const jsonArray = JSON.parse(data);
      const kvWrapped = {
        key: 'legislators_current',
        value: jsonArray
      };

      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(kvWrapped.value), 'utf-8');

      console.log(`✅ KV-compatible file written to: ${OUTPUT_PATH}`);
      console.log('\n🆙 To update Cloudflare KV remotely, run:');
      console.log(`npx wrangler kv key put legislators_current \\`);
      console.log(`  --namespace-id=<your-production-namespace-id> \\`);
      console.log(`  --path=${OUTPUT_PATH} \\`);
      console.log(`  --remote`);
    } catch (err) {
      console.error('❌ Failed to parse or save JSON:', err.message);
    }
  });
}).on('error', err => {
  console.error('❌ Download failed:', err.message);
});
