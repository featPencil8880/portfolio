import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] || '.');
const portArg = process.argv.indexOf('--port');
const port = Number(portArg === -1 ? process.env.PORT || 4173 : process.argv[portArg + 1]);
const mimeTypes = {
    '.avif': 'image/avif',
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.rss': 'application/rss+xml; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf',
    '.txt': 'text/plain; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.webp': 'image/webp',
    '.xml': 'application/xml; charset=utf-8',
    '.yml': 'text/yaml; charset=utf-8'
};

function safePath(urlPath) {
    const decoded = decodeURIComponent(new URL(urlPath, 'http://localhost').pathname);
    const relativePath = decoded.replace(/^\/+/, '');
    const candidate = resolve(root, relativePath);
    if (candidate !== root && !candidate.startsWith(root + sep)) return null;
    return candidate;
}

const server = createServer((request, response) => {
    let path;
    try {
        path = safePath(request.url || '/');
    } catch (error) {
        response.writeHead(400).end('Bad request');
        return;
    }
    if (!path) {
        response.writeHead(403).end('Forbidden');
        return;
    }

    try {
        if (statSync(path).isDirectory()) path = join(path, 'index.html');
        const contentType = mimeTypes[extname(path).toLowerCase()] || 'application/octet-stream';
        response.writeHead(200, { 'Content-Type': contentType });
        createReadStream(path).pipe(response);
    } catch {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    }
});

server.listen(port, '127.0.0.1', () => {
    console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.close(() => process.exit(0)));
}
