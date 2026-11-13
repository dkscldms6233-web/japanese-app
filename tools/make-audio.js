#!/usr/bin/env node
/* 청해 음성 파일 만들기 (VOICEVOX 엔진을 내 맥에서 돌려서 만들어요 — 무료, 키 필요 없음)
 * 준비: VOICEVOX 엔진(https://voicevox.hiroshiba.jp/)을 실행해 두면 http://127.0.0.1:50021 에서 응답해요.
 * 사용:  node tools/make-audio.js           (없는 파일만 새로 만들어요)
 *        node tools/make-audio.js --dry     (엔진 없이 몇 줄 만들지만 세기)
 * 결과:  audio/listen/<키>.m4a 와 listen-audio.js(음성이 있는 대사 목록)
 * 여자(F)=春日部つむぎ(8), 남자(M)=玄野武宏(11). 급수가 낮을수록 천천히 읽어요.
 * 변환은 macOS 기본 afconvert(wav→AAC)를 써요. 대사를 고치면 다시 돌리면 바뀐 대사만 새로 만들어요.
 * 크레딧(앱 청해 화면 아래)은 VOICEVOX 이용 규약에 따라 표시해요: "VOICEVOX:春日部つむぎ / VOICEVOX:玄野武宏"
 */
const fs=require("fs"),path=require("path"),vm=require("vm"),cp=require("child_process");
const root=path.join(__dirname,"..");
const ctx={window:{}}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"jlpt-listen.js"),"utf8"),ctx);
const plain=s=>s.replace(/\[[^\]]*\]/g,"");
/* 앱(index.html)의 jAudioKey/jRate 와 똑같이 유지해야 해요 */
const jRate=(lv,news)=>news?1:({N5:.85,N4:.9,N3:.95}[lv]||1);
const jKey=(who,text,rate)=>{ let h=5381,s=who+"|"+text+"|"+rate; for(let i=0;i<s.length;i++) h=((h*33)^s.charCodeAt(i))>>>0; return h.toString(36); };
const SPEAKER={F:8,M:11}, BASE="http://127.0.0.1:50021";
const dir=path.join(root,"audio","listen"); fs.mkdirSync(dir,{recursive:true});
const jobs=new Map();
ctx.window.JLPT_LISTEN.forEach(d=>{ const rate=jRate(d.lv,d.type==="news");
  d.lines.forEach(([who,t])=>{ const text=plain(t), key=jKey(who,text,rate); jobs.set(key,{who,text,rate,key}); }); });
const todo=[...jobs.values()].filter(j=>!fs.existsSync(path.join(dir,j.key+".m4a")));
console.log(`대사 ${jobs.size}줄 중 새로 만들 것 ${todo.length}줄`);
if(process.argv.includes("--dry")) process.exit(0);
(async()=>{
  const tmp=fs.mkdtempSync(path.join(require("os").tmpdir(),"vv-"));
  for(const j of todo){
    const sp=SPEAKER[j.who]||SPEAKER.F;
    const q=await (await fetch(`${BASE}/audio_query?speaker=${sp}&text=${encodeURIComponent(j.text)}`,{method:"POST"})).json();
    q.speedScale=j.rate; q.prePhonemeLength=0.2; q.postPhonemeLength=0.3; q.outputSamplingRate=24000; q.outputStereo=false;
    const r=await fetch(`${BASE}/synthesis?speaker=${sp}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(q)});
    if(!r.ok){ console.error("실패:",r.status,await r.text()); process.exit(1); }
    const wav=path.join(tmp,j.key+".wav"); fs.writeFileSync(wav,Buffer.from(await r.arrayBuffer()));
    cp.execFileSync("afconvert",["-f","m4af","-d","aac","-b","48000",wav,path.join(dir,j.key+".m4a")]); fs.unlinkSync(wav); process.stdout.write(".");
  }
  const have=[...jobs.keys()].filter(k=>fs.existsSync(path.join(dir,k+".m4a")));
  fs.writeFileSync(path.join(root,"listen-audio.js"),"/* tools/make-audio.js 가 만든 목록이에요 (직접 고치지 마세요) */\nwindow.LISTEN_AUDIO="+JSON.stringify(Object.fromEntries(have.map(k=>[k,1])))+";\n");
  console.log(`\n완료: 음성 ${have.length}개, 목록 listen-audio.js 갱신`);
})();
