import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const server = http.createServer((req, res) => {
    const srcDir = path.join(__dirname, '..', '..', 'src');
    let filePath = path.join(srcDir, req.url === '/' ? 'index.html' : req.url);
    if (!filePath.startsWith(srcDir)) { res.writeHead(403); res.end(); return; }
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end(); return; }
        const ext = path.extname(filePath);
        const types = {'.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css'};
        res.writeHead(200, {'Content-Type': types[ext] || 'text/plain'});
        res.end(data);
    });
});

server.listen(9999);
await sleep(1000);

const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
const page = await browser.newPage();

await page.setGeolocation({ latitude: -18.4696091, longitude: -43.4953982, accuracy: 100 });
await page.goto('http://localhost:9999/index.html', { waitUntil: 'networkidle0' });

console.log('Waiting 10 seconds...');
await sleep(10000);

const html = await page.evaluate(() => {
    const result = document.getElementById('locationResult');
    return {
        innerHTML: result ? result.innerHTML : 'NOT FOUND',
        textContent: result ? result.textContent : 'NOT FOUND'
    };
});

console.log('\n==== locationResult content ====');
console.log(html.innerHTML);
console.log('\n==== Text content ====');
console.log(html.textContent);

await page.screenshot({ path: 'test.png' });
await browser.close();
server.close();
