#!/usr/bin/env node
/* 청해 음성 파일 만들기 (Google Cloud Text-to-Speech)
 * 사용:  GOOGLE_TTS_KEY=내API키 node tools/make-audio.js          (없는 파일만 새로 만들어요)
 *        node tools/make-audio.js --dry                           (키 없이 글자 수·파일 수만 세기)
 * 결과:  audio/listen/<키>.mp3 와 listen-audio.js(어떤 대사가 음성이 있는지 목록)
 * 여자(F)=ja-JP-Neural2-B, 남자(M)=ja-JP-Neural2-C. 급수가 낮을수록 천천히 읽어요.
 * 대사를 고치면 이 스크립트를 다시 돌리면 바뀐 대사만 새로 만들어요. (키는 파일에 저장하지 않아요)
 */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const ctx={window:{}}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"jlpt-listen.js"),"utf8"),ctx);
const plain=s=>s.replace(/\[[^\]]*\]/g,"");
/* 앱(index.html)의 jAudioKey/jRate 와 똑같이 유지해야 해요 */
const jRate=(lv,news)=>news?1:({N5:.85,N4:.9,N3:.95}[lv]||1);
const jKey=(who,text,rate)=>{ let h=5381,s=who+"|"+text+"|"+rate; for(let i=0;i<s.length;i++) h=((h*33)^s.charCodeAt(i))>>>0; return h.toString(36); };
const VOICE={F:"ja-JP-Neural2-B",M:"ja-JP-Neural2-C"};
const dir=path.join(root,"audio","listen"); fs.mkdirSync(dir,{recursive:true});
const jobs=new Map();
ctx.window.JLPT_LISTEN.forEach(d=>{ const rate=jRate(d.lv,d.type==="news");
  d.lines.forEach(([who,t])=>{ const text=plain(t), key=jKey(who,text,rate); jobs.set(key,{who,text,rate,key}); }); });
const todo=[...jobs.values()].filter(j=>!fs.existsSync(path.join(dir,j.key+".mp3")));
const chars=todo.reduce((a,j)=>a+j.text.length,0);
console.log(`대사 ${jobs.size}줄 중 새로 만들 것 ${todo.length}줄 (${chars}자)`);
if(process.argv.includes("--dry")) process.exit(0);
const KEY=process.env.GOOGLE_TTS_KEY; if(!KEY){ console.error("GOOGLE_TTS_KEY 환경 변수에 API 키를 넣고 다시 실행해 주세요."); process.exit(1); }
(async()=>{
  for(const j of todo){
    const r=await fetch("https://texttospeech.googleapis.com/v1/text:synthesize?key="+encodeURIComponent(KEY),{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({input:{text:j.text},voice:{languageCode:"ja-JP",name:VOICE[j.who]||VOICE.F},audioConfig:{audioEncoding:"MP3",speakingRate:j.rate,sampleRateHertz:24000}})});
    const body=await r.json();
    if(!r.ok){ console.error("실패:",r.status,(body.error&&body.error.message)||""); process.exit(1); }
    fs.writeFileSync(path.join(dir,j.key+".mp3"),Buffer.from(body.audioContent,"base64")); process.stdout.write(".");
  }
  const have=[...jobs.keys()].filter(k=>fs.existsSync(path.join(dir,k+".mp3")));
  fs.writeFileSync(path.join(root,"listen-audio.js"),"/* tools/make-audio.js 가 만든 목록이에요 (직접 고치지 마세요) */\nwindow.LISTEN_AUDIO="+JSON.stringify(Object.fromEntries(have.map(k=>[k,1])))+";\n");
  console.log(`\n완료: 음성 ${have.length}개, 목록 listen-audio.js 갱신`);
})();
