import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { readFile } from 'node:fs/promises';
import claim from './api/claim.js';

const assets = new Map([
  ['/', ['index.html', 'text/html']],
  ['/styles.css', ['styles.css', 'text/css']],
  ['/app.js', ['app.js', 'text/javascript']]
]);

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/claim') {
      const body = req.method === 'GET' || req.method === 'HEAD' ? {} :
        { body: Readable.toWeb(req), duplex: 'half' };
      const response = await claim.fetch(new Request(url, { method: req.method, headers: req.headers, ...body }));
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    const asset = assets.get(url.pathname);
    if (!asset) return res.writeHead(404).end('Not found');
    const data = await readFile(new URL('./public/' + asset[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': asset[1] + '; charset=utf-8' }).end(data);
  } catch {
    res.writeHead(500).end('Server error');
  }
}).listen(Number(process.env.PORT ?? 4173), '127.0.0.1', function () {
  process.stdout.write('Local: http://127.0.0.1:' + this.address().port + '\n');
});
