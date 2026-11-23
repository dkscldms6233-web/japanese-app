#!/usr/bin/env node
/* 뉴스 기사 음성 파일 만들기 (VOICEVOX 엔진을 내 맥에서 돌려서 만들어요 — 무료, 키 필요 없음)
 * 청해 음성(tools/make-audio.js)과 같은 방식이에요. 기계 음성보다 훨씬 사람이 읽어 주는 것 같아요.
 * 준비: VOICEVOX(https://voicevox.hiroshiba.jp/)를 설치해서 실행해 두면 http://127.0.0.1:50021 에서 응답해요.
 * 사용:  node tools/make-news-audio.js              (없는 파일만 새로 만들어요)
 *        node tools/make-news-audio.js --dry        (엔진 없이 몇 문단 만들지만 세기)
 *        기사마다 여성(波音リツ)·남성(玄野武宏) 목소리가 번갈아 읽어요(기사 id 기준으로 고정).
 *        node tools/make-news-audio.js --speaker=13 (다른 목소리: 13=青山龍星(어른 남성), 16=九州そら 등. 크레딧 이름도 같이 바꿔요)
 * 결과:  audio/news/<키>.m4a 와 news-audio.js(음성이 있는 문단 목록)
 * 기사 한 문단(body의 한 항목)마다 파일 하나예요. 글을 고치면 다시 돌리면 바뀐 문단만 새로 만들어요.
 * 앱의 키 규칙(jAudioKey("N", 글, 속도))과 똑같이 유지해야 해요.
 * 크레딧은 VOICEVOX 이용 규약에 따라 앱 기사 화면에 "VOICEVOX:<캐릭터 이름>"으로 표시돼요.
 */
const fs=require("fs"),path=require("path"),vm=require("vm"),cp=require("child_process");
const root=path.join(__dirname,"..");
const ctx={window:{}}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"articles.js"),"utf8"),ctx);
try{ vm.runInContext(fs.readFileSync(path.join(root,"daily.js"),"utf8"),ctx); }catch(e){ console.log("daily.js를 읽지 못했어요:",e.message); }   /* 앱은 daily.js의 오늘의 기사도 뉴스에 함께 보여 줘요 */
const plain=s=>s.replace(/\[[^\]]*\]/g,"");
const jKey=(who,text,rate)=>{ let h=5381,s=who+"|"+text+"|"+rate; for(let i=0;i<s.length;i++) h=((h*33)^s.charCodeAt(i))>>>0; return h.toString(36); };
const NAMES={9:"波音リツ",11:"玄野武宏",30:"No.7",13:"青山龍星",16:"九州そら",14:"冥鳴ひまり",8:"春日部つむぎ"};
/* 기사마다 목소리를 번갈아 써요: 기사 id의 마지막 글자 코드가 짝수면 여성(波音リツ), 홀수면 남성(玄野武宏). 앱(newsVoice)과 똑같아야 해요 */
const voiceFor=id=>String(id).charCodeAt(String(id).length-1)%2===0?9:11;
const arg=(process.argv.find(a=>a.startsWith("--speaker="))||"").split("=")[1];
const FORCE=+arg||0, BASE="http://127.0.0.1:50021", RATE=1;
/* 저장공간 아끼기: 말소리라 32kbps면 충분해요(파일이 청해용의 2/3). 오늘 기준 며칠 안의 새 기사에만 음성을 만들고, 더 오래된 기사는 기기 음성으로 읽어요 */
const BITRATE=32000, KEEP_DAYS=+((process.argv.find(a=>a.startsWith("--days="))||"").split("=")[1])||7;
const dir=path.join(root,"audio","news"); fs.mkdirSync(dir,{recursive:true});
const jobs=new Map();
const cutoff=Date.now()-KEEP_DAYS*864e5;
((ctx.window.DAILY_ARTICLES||[]).filter(a=>{ const d=Date.parse(a.date); return isNaN(d)||d>=cutoff; })).concat(ctx.window.ARTICLES||[]).forEach(a=>(a.body||[]).forEach(b=>{ const sp=FORCE||voiceFor(a.id), text=plain(b.ja), key=jKey("N"+sp,text,RATE); jobs.set(key,{text,key,sp}); }));
const todo=[...jobs.values()].filter(j=>!fs.existsSync(path.join(dir,j.key+".m4a")));
console.log(`문단 ${jobs.size}개 중 새로 만들 것 ${todo.length}개 (목소리: ${FORCE?NAMES[FORCE]||FORCE:"기사마다 波音リツ·玄野武宏"})`);
if(process.argv.includes("--dry")) process.exit(0);
(async()=>{
  const tmp=fs.mkdtempSync(path.join(require("os").tmpdir(),"vvn-"));
  for(const j of todo){
    const q=await (await fetch(`${BASE}/audio_query?speaker=${j.sp}&text=${encodeURIComponent(j.text)}`,{method:"POST"})).json();
    q.speedScale=RATE; q.intonationScale=1.05; q.prePhonemeLength=0.15; q.postPhonemeLength=0.25; q.outputSamplingRate=24000; q.outputStereo=false;
    const r=await fetch(`${BASE}/synthesis?speaker=${j.sp}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(q)});
    if(!r.ok){ console.error("실패:",r.status,await r.text()); process.exit(1); }
    const wav=path.join(tmp,j.key+".wav"); fs.writeFileSync(wav,Buffer.from(await r.arrayBuffer()));
    cp.execFileSync("afconvert",["-f","m4af","-d","aac","-b",String(BITRATE),wav,path.join(dir,j.key+".m4a")]); fs.unlinkSync(wav); process.stdout.write(".");
  }
  const have=[...jobs.keys()].filter(k=>fs.existsSync(path.join(dir,k+".m4a")));
  fs.writeFileSync(path.join(root,"news-audio.js"),"/* tools/make-news-audio.js 가 만든 목록이에요 (직접 고치지 마세요) */\nwindow.NEWS_VOICES="+JSON.stringify({9:NAMES[9],11:NAMES[11]})+";\nwindow.NEWS_AUDIO="+JSON.stringify(Object.fromEntries(have.map(k=>[k,1])))+";\n");
  /* 기사에서 빠진(오래돼 지워진·고쳐 쓴) 문단의 옛 음성은 지워서 폴더가 계속 커지지 않게 해요 */
  let pruned=0; fs.readdirSync(dir).forEach(f=>{ if(f.endsWith(".m4a")&&!jobs.has(f.slice(0,-4))){ fs.unlinkSync(path.join(dir,f)); pruned++; } });
  console.log(`\n완료: 음성 ${have.length}개, 목록 news-audio.js 갱신${pruned?`, 안 쓰는 옛 음성 ${pruned}개 삭제`:""}`);
})();
