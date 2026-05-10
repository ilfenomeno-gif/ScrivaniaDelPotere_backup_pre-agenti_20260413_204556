/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 4313;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
    try {
        const reqUrl = new URL(req.url || '/', `http://127.0.0.1:${PORT}`);
        let rel = decodeURIComponent(reqUrl.pathname);
        if (rel === '/') rel = '/index.html';

        const safePath = path.normalize(rel).replace(/^([/\\])+/, '');
        const full = path.join(ROOT, safePath);
        if (!full.startsWith(ROOT)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        fs.readFile(full, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Not Found');
                return;
            }
            const ext = path.extname(full).toLowerCase();
            res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
            res.end(data);
        });
    } catch (err) {
        res.writeHead(500);
        res.end(String(err && err.message ? err.message : err));
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`LIVE_GAME_SERVER http://127.0.0.1:${PORT}`);
});
