import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS = [
  { id: '1XxUF7xa4udVa3653IDlGfjz0qUN0n1YV', name: 'bg-landscape.jpg' },
  { id: '1PvF3nnsKdWG9Fj3MyT_Sb8F0-sQ1MXdP', name: 'bg-portrait.jpg' },
  { id: '155CeucAqWMWIP6nkgDwF0lyT00kxBRp0', name: 'song1.mp3' },
  { id: '1UFHMyYrP5jJDNxCZX_xiVYmMR9AeJj4y', name: 'song2.mp3' },
  { id: '1uqKcSu5V0jtCE1sbqIzq7G5XfV0NtiAH', name: 'sebastian.jpg' }
];

const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function downloadFile(fileId, outputPath) {
  return new Promise((resolve, reject) => {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    
    https.get(url, (res) => {
      let data = [];
      
      if (res.statusCode === 302 || res.statusCode === 303) {
        // Handle redirect
        https.get(res.headers.location, (redirectRes) => {
          let chunks = [];
          redirectRes.on('data', chunk => chunks.push(chunk));
          redirectRes.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const content = buffer.toString('utf-8');
            const match = content.match(/confirm=([a-zA-Z0-9_-]+)/);
            
            if (match) {
              const confirmToken = match[1];
              const finalUrl = `https://drive.google.com/uc?export=download&confirm=${confirmToken}&id=${fileId}`;
              
              https.get(finalUrl, (finalRes) => {
                const fileStream = fs.createWriteStream(outputPath);
                finalRes.pipe(fileStream);
                fileStream.on('finish', () => {
                  fileStream.close();
                  resolve();
                });
              }).on('error', reject);
            } else {
              // Direct download worked
              fs.writeFileSync(outputPath, buffer);
              resolve();
            }
          });
        }).on('error', reject);
      } else {
        // Direct download
        let chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const content = buffer.toString('utf-8');
          const match = content.match(/confirm=([a-zA-Z0-9_-]+)/);
          
          if (match) {
             const confirmToken = match[1];
             const finalUrl = `https://drive.google.com/uc?export=download&confirm=${confirmToken}&id=${fileId}`;
             const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'].join('; ') : '';
             
             const options = {
                 headers: {
                     'Cookie': cookie
                 }
             };

             https.get(finalUrl, options, (finalRes) => {
               const fileStream = fs.createWriteStream(outputPath);
               finalRes.pipe(fileStream);
               fileStream.on('finish', () => {
                 fileStream.close();
                 resolve();
               });
             }).on('error', reject);
          } else {
             fs.writeFileSync(outputPath, buffer);
             resolve();
          }
        });
      }
    }).on('error', reject);
  });
}

async function main() {
  console.log('Downloading assets for Vercel deployment...');
  for (const asset of ASSETS) {
    const outputPath = path.join(publicDir, asset.name);
    console.log(`Downloading ${asset.name}...`);
    try {
      await downloadFile(asset.id, outputPath);
      console.log(`Successfully downloaded ${asset.name}`);
    } catch (err) {
      console.error(`Failed to download ${asset.name}:`, err);
    }
  }
}

main();
