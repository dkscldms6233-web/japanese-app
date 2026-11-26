const fs=require("fs"),path=require("path"),vm=require("vm");
const root=process.cwd();
const plain=s=>s.replace(/\[[^\]]*\]/g,"");
const jKey=(who,text,rate)=>{ let h=5381,s=who+"|"+text+"|"+rate; for(let i=0;i<s.length;i++) h=((h*33)^s.charCodeAt(i))>>>0; return h.toString(36); };
const RECENT=process.argv.includes("--news-recent");   /* 매일 뉴스 갱신용: 최근 30일 기사 + 고정 기사 문단만 */
const out={listen:[],news:[],kana:[]};
// listen
if(!RECENT){ const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(root,"jlpt-listen.js"),"utf8"),ctx);
  const jRate=(lv,news)=>news?1:({N5:.85,N4:.9,N3:.95}[lv]||1); const seen=new Set();
  ctx.window.JLPT_LISTEN.forEach(d=>{ const rate=jRate(d.lv,d.type==="news"); d.lines.forEach(([who,t])=>{ const text=plain(t), key=jKey(who,text,rate); if(!seen.has(key)){ seen.add(key); out.listen.push({key,who,text,rate}); } }); }); }
// news
{ const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(root,"articles.js"),"utf8"),ctx);
  try{ vm.runInContext(fs.readFileSync(path.join(root,"daily.js"),"utf8"),ctx); }catch(e){}
  const cur=(()=>{ const c={window:{}}; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(root,"news-audio.js"),"utf8"),c); return c.window.NEWS_AUDIO; })();
  const voiceFor=id=>String(id).charCodeAt(String(id).length-1)%2===0?9:11; const seen=new Set();
  const cutoff=Date.now()-30*864e5; ((ctx.window.DAILY_ARTICLES||[]).filter(a=>{ const d=Date.parse(a.date); return !RECENT||isNaN(d)||d>=cutoff; })).concat(ctx.window.ARTICLES||[]).forEach(a=>(a.body||[]).forEach(b=>{ const sp=voiceFor(a.id), text=plain(b.ja), key=jKey("N"+sp,text,1); if((RECENT||cur[key])&&!seen.has(key)){ seen.add(key); out.news.push({key,text}); } })); }
// kana
if(!RECENT){ const src=fs.readFileSync(path.join(root,"kana.js"),"utf8"); const grab=n=>{ const m=src.match(new RegExp("const "+n+"=(\\[[\\s\\S]*?\\]);\\n")); return eval(m[1]); };
  const toH=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
  const keyOf=t=>{ let h=5381,g=7; const s="kana4|"+t; for(let i=0;i<s.length;i++){ h=((h*33)^s.charCodeAt(i))>>>0; g=(g*131+s.charCodeAt(i))>>>0; } return h.toString(36)+g.toString(36); };
  const texts=new Set(), chars=new Set(); ["H","D","Y"].forEach(n=>grab(n).forEach(r=>{ texts.add(toH(r[0])); chars.add(toH(r[0])); })); ["WH","WK"].forEach(n=>grab(n).forEach(r=>texts.add(toH(r[0])))); { const km=src.match(/const KW=(\{[\s\S]*?\});\n/); if(km){ const KW=eval("("+km[1]+")"); for(const k in KW) for(const c in KW[k]) texts.add(toH(KW[k][c][0])); } } /* 글자 카드의 관련 단어(KW) */
  texts.forEach(t=>out.kana.push({key:keyOf(t),text:t,isChar:chars.has(t)}));
  /* 가타카나 전용 음성(kana5): 가타카나 글자·관련 단어를 가타카나 그대로 읽어요 */
  { const toKat=s=>s.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60)), key5=t=>{ let h=5381,g=7; const s="kana5|"+t; for(let i=0;i<s.length;i++){ h=((h*33)^s.charCodeAt(i))>>>0; g=(g*131+s.charCodeAt(i))>>>0; } return h.toString(36)+g.toString(36); };
    const kt=new Set(), kc=new Set(); ["H","D","Y"].forEach(n=>grab(n).forEach(r=>{ const t=toKat(r[0]); kt.add(t); kc.add(t); })); grab("WK").forEach(r=>kt.add(r[0]));
    const km=src.match(/const KW=(\{[\s\S]*?\});\n/); if(km){ const KW=eval("("+km[1]+")"); for(const c in KW.k) kt.add(KW.k[c][0]); }
    kt.forEach(t=>out.kana.push({key:key5(t),text:t,isChar:kc.has(t)})); } }
fs.writeFileSync(process.argv.find((a,i)=>i>=2&&!a.startsWith("--")),JSON.stringify(out)); console.log(Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.length])));
