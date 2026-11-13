const fs=require("fs"),vm=require("vm"),path=require("path");
const ctx={window:{}}; vm.createContext(ctx);
["daily.js","articles.js"].forEach(f=>vm.runInContext(fs.readFileSync(path.join(__dirname,"..",f),"utf8"),ctx));
const arts=[].concat(ctx.window.DAILY_ARTICLES||[],ctx.window.ARTICLES||[]);
process.argv.slice(2).forEach(id=>{ const a=arts.find(x=>x.id===id); if(!a){console.log("?",id);return;}
 console.log(`### ${a.id} ${a.lv} ${a.topic} | ${a.title} | ${a.titleKo}`); (a.body||[]).forEach(b=>console.log("  "+b.ja+"\n    "+b.ko)); console.log("  notes:",(a.notes||[]).map(n=>n.w).join(","),"| ref:",a.ref||""); });
