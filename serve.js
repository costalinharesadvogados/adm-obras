const http=require('http'),fs=require('fs'),path=require('path');
const mt={'.html':'text/html','.js':'application/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((q,r)=>{let f=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));if(q.url==='/')f=path.join(__dirname,'index.html');
fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);return r.end('nf')}r.writeHead(200,{'Content-Type':mt[path.extname(f)]||'application/octet-stream'});r.end(d)})}).listen(8099,()=>console.log('up'));
