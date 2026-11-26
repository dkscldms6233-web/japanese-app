#!/usr/bin/env node
/* 글자 입문(kana.js) 음성 만들기 — VOICEVOX 엔진이 켜져 있어야 해요(http://127.0.0.1:50021).
 * 사용: node tools/make-kana-audio.js        (없는 파일만 만들어요)
 *       node tools/make-kana-audio.js --dry  (몇 개 만들지 세기)
 * 결과: audio/kana/<키>.m4a + kana-audio.js. 목소리는 청해와 같은 玄野武宏(11).
 * 키 규칙은 kana.js 의 kanaKey 와 같아야 해요. 가타카나 글자는 히라가나 소리를 같이 써요. */
const fs=require("fs"),path=require("path"),cp=require("child_process");
const root=path.join(__dirname,"..");
const src=fs.readFileSync(path.join(root,"kana.js"),"utf8");
const grab=n=>{ const m=src.match(new RegExp("const "+n+"=(\\[[\\s\\S]*?\\]);\\n")); return eval(m[1]); };
const toH=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const keyOf=t=>{ let h=5381,g=7; const s="kana4|"+t; for(let i=0;i<s.length;i++){ h=((h*33)^s.charCodeAt(i))>>>0; g=(g*131+s.charCodeAt(i))>>>0; } return h.toString(36)+g.toString(36); };
const texts=new Set(), chars=new Set();
["H","D","Y"].forEach(n=>grab(n).forEach(r=>{ texts.add(toH(r[0])); chars.add(toH(r[0])); }));
["WH","WK"].forEach(n=>grab(n).forEach(r=>texts.add(toH(r[0])))); { const km=src.match(/const KW=(\{[\s\S]*?\});\n/); if(km){ const KW=eval("("+km[1]+")"); for(const k in KW) for(const c in KW[k]) texts.add(toH(KW[k][c][0])); } } /* 글자 카드의 관련 단어(KW) */
const BASE="http://127.0.0.1:50021", dir=path.join(root,"audio","kana"); fs.mkdirSync(dir,{recursive:true});
const todo=[...texts].filter(t=>!fs.existsSync(path.join(dir,keyOf(t)+".m4a")));
console.log(`음성 ${texts.size}개 중 새로 만들 것 ${todo.length}개`);
if(process.argv.includes("--dry")) process.exit(0);
(async()=>{
  const tmp=fs.mkdtempSync(path.join(require("os").tmpdir(),"vk-"));
  for(const t of todo){
    /* 글자 하나는 は→わ·を→お 처럼 읽히지 않도록 읽기(가타카나)를 직접 지정해요 */
    const fix={"を":"オ","ぢ":"ジ","づ":"ズ","ぢゃ":"ジャ","ぢゅ":"ジュ","ぢょ":"ジョ"};
    const kt=fix[t]||t.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60));
    let q;
    if(chars.has(t)){ const ap=await (await fetch(`${BASE}/accent_phrases?speaker=11&is_kana=true&text=${encodeURIComponent(kt+"'")}`,{method:"POST"})).json();
      q=await (await fetch(`${BASE}/audio_query?speaker=11&text=${encodeURIComponent("あ")}`,{method:"POST"})).json(); q.accent_phrases=ap; if(process.env.SHOW) console.log(t,ap.map(a=>a.moras.map(m=>m.text).join("")).join("|")); }
    else q=await (await fetch(`${BASE}/audio_query?speaker=11&text=${encodeURIComponent(t)}`,{method:"POST"})).json();
    const short=[...t].length<=2; /* 글자 하나·요음은 너무 짧게 들려서 모음을 길게 늘려요 */
    q.speedScale=short?.9:.85; q.prePhonemeLength=.25; q.postPhonemeLength=.5;
    if(short) (q.accent_phrases||[]).forEach(ap=>ap.moras.forEach(m=>{ m.vowel_length*=1.3; if(m.consonant_length) m.consonant_length*=1.3; })); q.outputSamplingRate=24000; q.outputStereo=false;
    const r=await fetch(`${BASE}/synthesis?speaker=11`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(q)});
    if(!r.ok){ console.error("실패:",t,r.status); process.exit(1); }
    const wav=path.join(tmp,"a.wav"); fs.writeFileSync(wav,Buffer.from(await r.arrayBuffer()));
    cp.execFileSync("afconvert",["-f","m4af","-d","aac","-b","48000",wav,path.join(dir,keyOf(t)+".m4a")]); process.stdout.write(".");
  }
  const have=Object.fromEntries([...texts].filter(t=>fs.existsSync(path.join(dir,keyOf(t)+".m4a"))).map(t=>[keyOf(t),1]));
  fs.writeFileSync(path.join(root,"kana-audio.js"),"/* tools/make-kana-audio.js 가 만든 목록이에요 (직접 고치지 마세요) */\nwindow.KANA_AUDIO="+JSON.stringify(have)+";\n");
  console.log(`\n완료: ${Object.keys(have).length}개`);
})();
