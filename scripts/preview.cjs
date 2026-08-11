const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(process.cwd(), process.argv[2] || '.');
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

const server = http.createServer((request, response) => {
  let pathname = decodeURIComponent(new URL(request.url, `http://${host}:${port}`).pathname);
  if (pathname === '/') {
    pathname = '/index.html';
  }

  const file = path.resolve(root, `.${pathname}`);
  const relativeFile = path.relative(root, file);
  if (relativeFile.startsWith('..') || path.isAbsolute(relativeFile)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  });
});

server.listen(port, host, () => {
  console.log(`Serving ${root} at http://localhost:${port}/`);
});
