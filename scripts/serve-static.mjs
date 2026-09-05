// Serves .output/public with gzip and long cache headers, the way real
// hosting would, so Lighthouse numbers mean something. node scripts/serve-static.mjs [port]
import { createServer } from 'node:http'
import { createReadStream, statSync, existsSync } from 'node:fs'
import { join, extname } from 'node:path'
import { createGzip } from 'node:zlib'

const root = join(process.cwd(), '.output/public')
const port = Number(process.argv[2] || 3211)
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain', '.xml': 'application/xml' }

createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let file = join(root, path)
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (!existsSync(file)) file = join(root, path + '.html')
  if (!existsSync(file)) { file = join(root, '404.html'); res.statusCode = 404 }
  const ext = extname(file)
  const type = types[ext] || 'application/octet-stream'
  res.setHeader('Content-Type', type)
  res.setHeader('Cache-Control', path.startsWith('/_nuxt/') || path.startsWith('/fonts/') ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate')
  const gz = /gzip/.test(req.headers['accept-encoding'] || '') && /^(text|application)\//.test(type)
  if (gz) { res.setHeader('Content-Encoding', 'gzip'); createReadStream(file).pipe(createGzip()).pipe(res) }
  else createReadStream(file).pipe(res)
}).listen(port, () => console.log('static on http://localhost:' + port))
