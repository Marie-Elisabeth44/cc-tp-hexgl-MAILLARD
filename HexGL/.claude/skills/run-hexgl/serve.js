const http=require('http'),fs=require('fs'),path=require('path');
const root=process.argv[2]||".",T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.ogg':'audio/ogg','.mp3':'audio/mpeg'};
http.createServer((q,s)=>{let p=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(p.endsWith(path.sep))p+='index.html';
fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);return s.end()}s.writeHead(200,{'Content-Type':T[path.extname(p)]||'application/octet-stream'});s.end(d)})}).listen(process.env.PORT||8080,()=>console.log('http://localhost:8080'));
