/* 청해 음성 작업 목록 만들기: 모든 청해 대사 + 발화 표현·즉시 응답의 선택지(번호 포함)
 * 사용: node tools/listen-jobs.js /tmp/jobs.json && tools/ev/bin/python tools/make-voice-edge.py /tmp/jobs.json --skip-existing
 * 키·속도 규칙은 앱(index.html)의 jAudioKey/jRate와 같아야 해요. */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const ctx={window:{}}; vm.createContext(ctx);
fs.readdirSync(root).filter(f=>/^jlpt-(listen\d?|more\d?)\.js$/.test(f)).sort().forEach(f=>{ try{ vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx); }catch(e){} });
const plain=s=>s.replace(/\[[^\]]*\]/g,"");
const jRate=(lv,news)=>news?1:({N5:.85,N4:.9,N3:.95}[lv]||1);
const jKey=(who,text,rate)=>{ let h=5381,s=who+"|"+text+"|"+rate; for(let i=0;i<s.length;i++) h=((h*33)^s.charCodeAt(i))>>>0; return h.toString(36); };
const lcatOf=(d,q)=>{ if(d.cat) return d.cat; if(d.type==="news") return "gaiyo"; if(d.lines.length===1) return plain(d.lines[0][1]).length<60?"sokuji":"gaiyo"; return /どうして|なぜ|理由|何が|どんな|どのよう|何について|について/.test(plain(q.q))?"point":"task"; };
const seen=new Map(), add=(who,text,rate)=>{ const k=jKey(who,text,rate); if(!seen.has(k)) seen.set(k,{key:k,who,text,rate}); };
ctx.window.JLPT_LISTEN.forEach(d=>{ const rate=jRate(d.lv,d.type==="news");
  (d.lines||[]).forEach(([w,t])=>add(w,plain(t),rate));
  d.qs.forEach(q=>{ const c=lcatOf(d,q); if(c==="sokuji"||c==="hatsu"){ const r=jRate(d.lv,false), rw=(d.lines&&d.lines[0])?(d.lines[0][0]==="F"?"M":"F"):(d.who||"F");
    ["いち","に","さん"].forEach(n=>add("F",n,r)); q.o.forEach(o=>add(rw,plain(o),r)); } }); });
fs.writeFileSync(process.argv[2],JSON.stringify({listen:[...seen.values()],news:[],kana:[],funny:[],slow:[]}));
console.log("청해 음성 작업",seen.size,"개");
/* --write-list: 만들어진 음성 파일을 기준으로 listen-audio.js(음성이 있는 대사 목록)를 다시 써요 */
if(process.argv.includes("--write-list")){
  const have=[...seen.keys()].filter(k=>fs.existsSync(path.join(root,"audio","listen",k+".m4a")));
  fs.writeFileSync(path.join(root,"listen-audio.js"),"/* tools/listen-jobs.js --write-list 가 만든 목록이에요 (직접 고치지 마세요) */\nwindow.LISTEN_AUDIO="+JSON.stringify(Object.fromEntries(have.map(k=>[k,1])))+";\n");
  console.log("목록 갱신: 음성 있는 대사",have.length,"/",seen.size);
}
