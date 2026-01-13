import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sleep = ms => new Promise(r => setTimeout(r, ms));

const srcDir = path.join(__dirname, '..', '..', 'src');

const server = http.createServer((req, res) => {
    const file = path.join(srcDir, req.url === '/' ? 'index.html' : req.url);
    if (fs.existsSync(file)) {
        const ext = path.extname(file);
        const types = {'.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css'};
        res.writeHead(200, {'Content-Type': types[ext] || 'text/plain'});
        res.end(fs.readFileSync(file));
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(9999);
await sleep(1000);

const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();

page.on('console', msg => {
    if (msg.text().includes('Observatory') || msg.text().includes('error') || msg.text().includes('Coordinates')) {
        console.log('>', msg.text());
    }
});

await page.setGeolocation({ latitude: -18.4696091, longitude: -43.4953982, accuracy: 100 });
await browser.defaultBrowserContext().overridePermissions('http://localhost:9999', ['geolocation']);

await page.goto('http://localhost:9999/index.html', { waitUntil: 'networkidle0' });

console.log('✅ Waiting 15 seconds...');
await sleep(15000);

const content = await page.evaluate(() => {
    return {
        locationResult: document.getElementById('locationResult')?.innerHTML || 'NULL',
        coordinates: document.getElementById('coordinates')?.innerHTML || 'NULL',
        bodyText: document.body.textContent.substring(0, 1000)
    };
});

console.log('\n==== locationResult ====');
console.log(content.locationResult.substring(0, 500));
console.log('\n==== coordinates ====');
console.log(content.coordinates.substring(0, 500));

const found = content.locationResult.includes('-18') || content.coordinates.includes('-18') || content.bodyText.includes('-18');

await browser.close();
server.close();

console.log('\n' + (found ? '✅ TEST PASSED - Coordinates found!' : '❌ TEST FAILED - Coordinates not found'));
process.exit(found ? 0 : 1);
