/* 로컬 미리보기용 아주 작은 정적 서버 (배포에는 쓰이지 않음)
 * 사용: node tools/dev-server.js [폴더] [포트]  (기본: 현재 폴더, 8765) */
const http=require("http"),fs=require("fs"),path=require("path");
const root=path.resolve(process.argv[2]||process.cwd()), port=+process.argv[3]||8765;
const T={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".svg":"image/svg+xml",".m4a":"audio/mp4",".mp3":"audio/mpeg",".webmanifest":"application/manifest+json",".ico":"image/x-icon"};
http.createServer((q,r)=>{
  let p=decodeURIComponent(q.url.split("?")[0]); if(p.endsWith("/")) p+="index.html";
  const f=path.join(root,p); if(!f.startsWith(root)){ r.writeHead(403); return r.end(); }
  fs.readFile(f,(e,d)=>{ if(e){ r.writeHead(404); return r.end("not found"); } r.writeHead(200,{"Content-Type":T[path.extname(f)]||"application/octet-stream","Cache-Control":"no-cache"}); r.end(d); });
}).listen(port,()=>console.log("http://localhost:"+port));
