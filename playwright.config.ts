import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '*.playwright.ts',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:9890',
    headless: true,
    viewport: { width: 1280, height: 800 },
    locale: 'pt-BR',
    ignoreHTTPSErrors: true,
  },

  webServer: {
    command: `node -e "
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join('${__dirname}','dist');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css',
  '.json':'application/json','.png':'image/png','.svg':'image/svg+xml',
  '.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  const p=req.url==='/'?'/index.html':req.url;
  const fp=path.join(ROOT,p);
  fs.readFile(fp,(err,data)=>{
    if(err){res.writeHead(404);res.end('Not found');}
    else{res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'text/plain'});res.end(data);}
  });
}).listen(9890,()=>console.log('serving dist/ on 9890'));
"`,
    url: 'http://localhost:9890/index.html',
    timeout: 15_000,
    reuseExistingServer: false,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
        },
      },
    },
  ],
});
