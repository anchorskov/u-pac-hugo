# 📥 Update Legislators KV (Cloudflare Workers)

This guide helps you refresh the `legislators_current` key in your Cloudflare KV storage with fresh public domain data.

---

## 🔁 Steps to Update

### 1. Fetch Latest `legislators-current.json`
Download from [congress-legislators GitHub](https://github.com/unitedstates/congress-legislators):

```bash
curl -o scripts/legislators-current.json \
  https://raw.githubusercontent.com/unitedstates/congress-legislators/main/legislators-current.json

Run the Transform Script
 node scripts/transform-legislators.js

Upload to Cloudflare KV (REMOTE)
wrangler kv key put legislators_current \
  --namespace-id=<bed00144de4b44c0bb6e06218fc8cf80
> \
  --path=./sibi-d1-worker/legislators_compact.json \
  --remote
Replace <your-namespace-id> with your production namespace ID.

🧪 Test
curl https://u-pac.org/api/find-candidates?zip=82070 | jq

Notes
Always use --remote to write to production

Prefer automation and logs to avoid mistakes

Git commit after every update