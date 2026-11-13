/* 새 게임 3종: 일본어 워들 · しりとり(끝말잇기) · 떨어지는 단어
 * index.html의 게임 도구(G, stopG, gCountdown, gResult, sfx, record …)를 그대로 써요.
 */
(function(){
const toHira=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
const ST=document.createElement("style");
ST.textContent=`.wd-hint{text-align:center;margin:6px 0 10px}.wd-hint b{font-size:20px}.wd-hint small{display:block;color:var(--sub);margin-top:2px}
.wd-grid{display:grid;gap:6px;justify-content:center;margin:10px auto}
.wd-row{display:grid;gap:6px}.wd-c{width:46px;height:46px;border:2px solid var(--line);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;background:var(--card)}
.wd-c.cur{border-color:var(--accent)}.wd-c.ok{background:#4c9a62;border-color:#4c9a62;color:#fff}.wd-c.pos{background:#d8a83c;border-color:#d8a83c;color:#fff}.wd-c.no{background:#8a8d93;border-color:#8a8d93;color:#fff}
.wd-tabs{display:flex;gap:6px;justify-content:center;margin:8px 0}.wd-tabs .pill{padding:4px 12px}
.wd-kb{display:grid;gap:4px;margin:6px auto;max-width:420px}.wd-k{border:1px solid var(--line);background:var(--card);border-radius:8px;height:38px;font:inherit;font-size:17px;font-weight:700;color:var(--text);cursor:pointer;padding:0}
.wd-k.ok{background:#4c9a62;color:#fff;border-color:#4c9a62}.wd-k.pos{background:#d8a83c;color:#fff;border-color:#d8a83c}.wd-k.no{background:#8a8d93;color:#fff;border-color:#8a8d93}.wd-k.sp{visibility:hidden}
.wd-act{display:flex;gap:8px;justify-content:center;margin:8px 0}.wd-act .pill{min-width:92px;justify-content:center}
.sh-chain{display:flex;flex-direction:column;gap:6px;margin:10px 0}.sh-w{border-radius:14px;padding:6px 14px;max-width:85%}.sh-w small{display:block;opacity:.75;font-size:12px}
.sh-w.com{background:var(--chip);align-self:flex-start}.sh-w.me{background:var(--accent-soft);align-self:flex-end;text-align:right}
.sh-need{text-align:center;font-size:15px;margin:8px 0}.sh-need b{display:inline-block;font-size:34px;color:var(--accent);margin:0 4px}
.sh-in{display:flex;gap:6px;justify-content:center;align-items:center;margin:8px 0;min-height:56px;flex-wrap:wrap}.sh-in span{min-width:42px;height:48px;padding:0 6px;border:2px solid var(--line);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;background:var(--card)}.sh-in span.lock{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}.sh-in .caret{min-width:3px;width:3px;padding:0;border:0;background:var(--accent);height:34px;animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
.sh-msg{text-align:center;min-height:22px;font-size:14px;margin-bottom:4px}
.sh-opt{display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:1px}.sh-opt small{opacity:.7;font-size:12px}
#fopts{display:grid!important;grid-template-columns:1fr 1fr;gap:8px}#fopts .opt{font-size:15px;padding:10px 8px;min-height:54px}
.fallarea{position:relative;height:240px;border:1.5px solid var(--line);border-radius:16px;overflow:hidden;background:linear-gradient(#f3f6fb,#e9eef7);margin:8px 0}
[data-theme=dark] .fallarea{background:linear-gradient(#1c2230,#161b27)}
.fallarea .gr{position:absolute;left:0;right:0;bottom:0;height:10px;background:repeating-linear-gradient(45deg,#c0392b 0 10px,#e8c4c0 10px 20px);opacity:.55}
.fw{position:absolute;padding:6px 14px;border-radius:12px;background:var(--card);border:2px solid var(--line);font-family:"Hiragino Sans","Hiragino Kaku Gothic ProN","Noto Sans JP","Yu Gothic","Meiryo",sans-serif;font-size:26px;font-weight:500;letter-spacing:.04em;white-space:nowrap;transform:translateX(-50%);box-shadow:0 2px 6px rgba(0,0,0,.12)}
.fw.tgt{border-color:var(--accent);background:var(--accent-soft)}.fw.danger{border-color:#c0392b}.fw.pop{animation:fwpop .35s forwards}
@keyframes fwpop{to{transform:translateX(-50%) scale(1.5);opacity:0}}`;
document.head.appendChild(ST);

/* ======================= 일본어 워들 ======================= */
const KBET0=[["ん","っ","ー"],["ゃ","ゅ","ょ"],["ぁ","ぃ","ぅ","ぇ","ぉ"]];
const KB={
  basic:[["あ","か","さ","た","な","は","ま","や","ら","わ"],["い","き","し","ち","に","ひ","み","","り",""],["う","く","す","つ","ぬ","ふ","む","ゆ","る",""],["え","け","せ","て","ね","へ","め","","れ",""],["お","こ","そ","と","の","ほ","も","よ","ろ","を"]],
  dak:[["が","ざ","だ","ば","ぱ"],["ぎ","じ","ぢ","び","ぴ"],["ぐ","ず","づ","ぶ","ぷ"],["げ","ぜ","で","べ","ぺ"],["ご","ぞ","ど","ぼ","ぽ"]],
  etc:KBET0
};

const toKata=s=>s.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60));
function kbHTML(tab,state,attr,kata){
  const rows=KB[tab]||[];
  const cv=c=>kata?toKata(c):c;
  const keyBtn=c=>c?`<button class="wd-k ${state[c]||""}" ${attr}="key" data-c="${cv(c)}">${cv(c)}</button>`:`<span class="wd-k sp"></span>`;
  return rows.map(r=>`<div class="wd-row" style="grid-template-columns:repeat(${r.length},1fr)">${r.map(keyBtn).join("")}</div>`).join("");
}
const kbTabs=(tab,attr,kata)=>`<div class="wd-tabs">${[["basic",kata?"ア〜ワ":"あ〜わ"],["dak","゛ ゜"],["etc","ん·작은 글자"]].map(([k,l])=>`<button class="pill sm ${tab===k?"on":""}" ${attr}="tab" data-t="${k}">${l}</button>`).join("")}</div>`;
let WDK=false; // 마지막에 고른 문자: false=히라가나, true=가타카나
function wdPool(kata){
  const re=kata?/^[ァ-ヶー]+$/:/^[ぁ-ゖー]+$/;
  const p=ALL.filter(inScope).filter(w=>re.test(w.yomi)).map(w=>({w,r:w.yomi}));
  const by=n=>p.filter(x=>x.r.length===n);
  for(const n of [4,3,5]) if(by(n).length>=15) return by(n);
  return p.filter(x=>x.r.length>=3&&x.r.length<=6);
}
function startWordle(){
  stopG(); Q=null; G={type:"wordle",intro:true};
  wdIntro();
}
function wdIntro(){
  $("quizView").innerHTML=`<div class="qbox gbox"><h2>일본어 워들</h2>
   <div class="sub" style="text-align:center">뜻 힌트를 보고 <b>읽기</b>를 맞혀요. 6번 안에 도전!<br>초록=글자와 위치가 맞음 · 노랑=글자는 있지만 위치가 달라요 · 회색=없는 글자</div>
   <div class="kseg" style="max-width:360px;margin:14px auto;display:grid;grid-template-columns:1fr 1fr;gap:6px;background:var(--chip);border-radius:14px;padding:4px">
     <button class="pill ${WDK?"":"on"}" style="justify-content:center;padding:10px" data-wd="script" data-k="0">히라가나 <small>ひらがな</small></button>
     <button class="pill ${WDK?"on":""}" style="justify-content:center;padding:10px" data-wd="script" data-k="1">가타카나 <small>カタカナ</small></button></div>
   <div class="sub" style="text-align:center">${WDK?"외래어 단어를 가타카나로 입력해요 (ー, ッ, ァィゥェォ, ャュョ 포함)":"한자어·고유어 단어의 읽기를 히라가나로 입력해요 (っ, ゃゅょ, ぁぃぅぇぉ, ー 포함)"}</div>
   <div class="qbtns" style="flex-direction:column;align-items:stretch;max-width:360px;margin:14px auto"><button class="cta" data-wd="new" data-m="daily">오늘의 문제 (${jlv()})</button><button class="cta sec" data-wd="new" data-m="free">연습 (무제한)</button></div>
   <div class="qbtns"><button class="pill" data-act="gquit">그만하기</button></div></div>`;
}
function hashStr(s){ let h=5381; for(let i=0;i<s.length;i++) h=((h*33)^s.charCodeAt(i))>>>0; return h; }
function wdBegin(mode){
  const pool=wdPool(WDK);
  if(pool.length<10){ toast(`이 급수에는 ${WDK?"가타카나":"히라가나"} 단어가 부족해요 (다른 급수나 문자를 골라 보세요)`); return; }
  const pick=mode==="daily"?pool[hashStr(today()+"|"+jlv()+"|"+(WDK?"k":"h")+"|"+pool.length)%pool.length]:pool[Math.floor(Math.random()*pool.length)];
  G={type:"wordle",mode,kata:WDK,ans:pick.r,w:pick.w,len:pick.r.length,guesses:[],cur:"",tab:"basic",hint:false,keys:{},over:false,seen:new Map()};
  wdRender(); bgmStop();
}
function wdEval(guess,ans){
  const res=Array(ans.length).fill("no"), rest={};
  for(let i=0;i<ans.length;i++){ if(guess[i]===ans[i]) res[i]="ok"; else rest[ans[i]]=(rest[ans[i]]||0)+1; }
  for(let i=0;i<ans.length;i++){ if(res[i]!=="ok"&&rest[guess[i]]>0){ res[i]="pos"; rest[guess[i]]--; } }
  return res;
}
function wdRender(){
  const g=G, w=g.w, show=g.hint&&w.text!==w.yomi?`<br><span style="font-size:26px">${E(w.text)}</span>`:"";
  const rows=[]; for(let r=0;r<6;r++){
    const guess=g.guesses[r], isCur=r===g.guesses.length&&!g.over;
    const cells=[...Array(g.len)].map((_,i)=>{ if(guess) return `<div class="wd-c ${guess.res[i]}">${guess.s[i]}</div>`; if(isCur) return `<div class="wd-c cur">${g.cur[i]||""}</div>`; return `<div class="wd-c"></div>`; }).join("");
    rows.push(`<div class="wd-row" style="grid-template-columns:repeat(${g.len},${g.len>5?40:46}px)">${cells}</div>`); }
  $("quizView").innerHTML=`<div class="qbox gbox"><div class="gfx" id="gfx"></div>
   <div class="gstat"><span>${g.mode==="daily"?"오늘의 문제":"연습"} · ${jlv()} · ${g.kata?"가타카나":"히라가나"}</span><span>${g.guesses.length} / 6번</span><button class="pill sm" data-act="gquit">그만하기</button></div>
   <div class="wd-hint"><b>${E(w.ko)}</b>${show}<small>${g.len}글자 · ${(POS[w.pos]||[w.pos])[0]}${w.text!==w.yomi&&!g.hint?` · <a href="#" data-wd="hint" style="color:var(--accent)">한자 힌트 보기(-10점)</a>`:""}</small></div>
   <div class="wd-grid">${rows.join("")}</div>
   <div class="wd-act"><button class="pill" data-wd="del">지우기 ⌫</button><button class="pill on" data-wd="enter" ${g.cur.length===g.len?"":"disabled"}>확인</button></div>
   ${kbTabs(g.tab,"data-wd",g.kata)}
   <div class="wd-kb">${kbHTML(g.tab,g.keys,"data-wd",g.kata)}</div></div>`;
}
function wdEnter(){
  const g=G; if(!g||g.type!=="wordle"||g.over||g.cur.length!==g.len) return;
  const res=wdEval(g.cur,g.ans), rank={ok:3,pos:2,no:1};
  [...g.cur].forEach((c,i)=>{ if(!g.keys[c]||rank[res[i]]>rank[g.keys[c]]) g.keys[c]=res[i]; });
  g.guesses.push({s:g.cur,res}); const won=res.every(x=>x==="ok"); g.cur="";
  sfx(won?"clear":"tick");
  if(won||g.guesses.length>=6){ g.over=true; wdRender(); setTimeout(()=>wdEnd(won),900); } else wdRender();
}
function wdEnd(won){
  const g=G; if(!g||g.type!=="wordle") return; sfx(won?"end":"ng");
  const tries=g.guesses.length, score=won?(7-tries)*20+(g.hint?0:10):0, key=g.kata?"wordle_k":"wordle", prev=getBest(key), isNew=score>0&&(prev==null||score>prev);
  if(isNew) setBest(key,score); record(g.w,won);
  const seen=new Map([[g.w.key,{w:g.w,st:won?"ok":"ng"}]]);
  gResult({title:`일본어 워들 결과 (${g.kata?"가타카나":"히라가나"})`,big:won?`${tries}번 만에 성공!`:"아쉬워요",score,isNew,seen,marks:new Set(),type:"wordle",
    note:`정답은 「${g.ans}」(${E(g.w.text)} · ${E(g.w.ko)}) · 점수 ${score}점${prev!=null&&!isNew?` · 최고 기록 ${prev}점`:""}`});
}

/* ======================= しりとり (끝말잇기) : 직접 입력하는 방식 ======================= */
const SMALL={"ゃ":"や","ゅ":"ゆ","ょ":"よ","ぁ":"あ","ぃ":"い","ぅ":"う","ぇ":"え","ぉ":"お"};
const lastKana=r=>{ let s=r.replace(/ー+$/,""); let c=s[s.length-1]; return SMALL[c]||c; };
let SHD=null;   // 사전: 히라가나 읽기 → 단어 목록 (모든 급수)
function shDict(){ if(SHD) return SHD; SHD=new Map(); ALL.forEach(w=>{ const r=toHira(w.yomi); if(!/^[ぁ-ゖー]+$/.test(r)||r.length<2) return; (SHD.get(r)||SHD.set(r,[]).get(r)).push(w); }); return SHD; }
const shScope=()=>ALL.filter(inScope).map(w=>({w,r:toHira(w.yomi)})).filter(x=>/^[ぁ-ゖー]+$/.test(x.r)&&x.r.length>=2&&x.r.length<=7);
function startShiri(){
  stopG(); Q=null; const pool=shScope();
  if(pool.length<30){ toast("이 급수에는 끝말잇기에 쓸 단어가 부족해요"); return; }
  gCountdown("컴퓨터와 끝말잇기! 앞 단어의 끝 글자로 시작하는 단어를 <b>직접 입력</b>해요<br>모르면 힌트를 볼 수 있어요 · 「ん」으로 끝나면 져요",()=>shBegin(pool));
}
function shBegin(pool){
  const used=new Set(), cnt=(ch)=>pool.filter(x=>x.r[0]===ch).length, starts=shuffle(pool.filter(x=>lastKana(x.r)!=="ん"&&cnt(lastKana(x.r))>=4)), start=starts[0]||pool.find(x=>lastKana(x.r)!=="ん");
  used.add(start.r);
  G={type:"shiri",pool,used,chain:[{who:"com",r:start.r,w:start.w}],score:0,rounds:0,lives:3,hints:0,hintShown:null,cur:"",tab:"basic",msg:"",seen:new Map(),over:false,busy:false};
  G.need=lastKana(start.r); G.cur=G.need; shRender(); bgmStart();
}
function shRender(){
  const g=G, chain=g.chain.slice(-2);
  $("quizView").innerHTML=`<div class="qbox gbox"><div class="gfx" id="gfx"></div>
   <div class="gstat"><span>점수 ${g.score}</span><span>이은 횟수 ${g.rounds}</span><span class="hp" role="img" aria-label="남은 기회 ${g.lives}번">${[0,1,2].map(i=>heart(i<g.lives,false)).join("")}</span></div>
   <div class="sh-chain">${chain.map(c=>`<div class="sh-w ${c.who}"><b style="font-size:20px">${E(c.w.text)}</b><small>${c.r} · ${E(c.w.ko)}</small></div>`).join("")}</div>
   <div class="sh-need"><b>${g.need}</b> 로 시작하는 단어를 입력하세요</div>
   <div class="sh-in">${[...g.cur].map((c,i)=>`<span class="${i===0?"lock":""}">${c}</span>`).join("")}<span class="caret"></span></div>
   <div class="sh-msg">${g.msg||(g.hintShown?`💡 힌트: <b>${E(g.hintShown.ko)}</b> (${g.hintShown.r.slice(0,2)}${"○".repeat(Math.max(0,g.hintShown.r.length-2))})`:"&nbsp;")}</div>
   <div class="wd-act"><button class="pill" data-sk="del">지우기 ⌫</button><button class="pill on" data-sk="enter" ${g.cur.length>=2?"":"disabled"}>확인</button><button class="pill" data-sk="hint">💡 힌트 (${3-g.hints})</button></div>
   ${kbTabs(g.tab,"data-sk",false)}
   <div class="wd-kb">${kbHTML(g.tab,{},"data-sk",false)}</div>
   <div class="qbtns"><button class="pill" data-sk="giveup">포기하기</button><button class="pill" data-act="gquit">그만하기</button></div></div>`;
}
function shHint(){
  const g=G; if(!g||g.type!=="shiri"||g.busy) return; if(g.hints>=3){ g.msg="힌트를 모두 썼어요"; return shRender(); }
  const cand=g.pool.filter(x=>x.r[0]===g.need&&!g.used.has(x.r)&&lastKana(x.r)!=="ん"); if(!cand.length){ g.msg="쓸 수 있는 단어가 없어요"; return shRender(); }
  const c=cand[Math.floor(Math.random()*cand.length)]; g.hints++; g.hintShown={r:c.r,ko:c.w.ko}; g.msg=""; shRender();
}
function shSubmit(){
  const g=G; if(!g||g.type!=="shiri"||g.over||g.busy) return; const r=g.cur;
  if(r.length<2){ return; }
  const ws=shDict().get(r);
  if(g.used.has(r)){ g.msg="이미 나온 단어예요"; return shMiss(); }
  if(!ws){ g.msg=`「${r}」는 사전에 없어요`; return shMiss(); }
  const w=ws.find(x=>g.pool.some(p=>p.w===x))||ws[0];
  g.used.add(r); g.chain.push({who:"me",r,w});
  if(lastKana(r)==="ん"){ g.seen.set(w.key,{w,st:"ng"}); record(w,false); sfx("ng"); return shEnd("lose",`「${r}」는 ん으로 끝나요. 아쉽게 졌어요!`); }
  const hinted=g.hintShown&&g.hintShown.r===r; const pts=hinted?5:10+Math.min(g.rounds,10)*2;
  g.seen.set(w.key,{w,st:"ok"}); record(w,true); g.rounds++; g.score+=pts; sfx("ok"); popFx("+"+pts,"pts");
  // 컴퓨터 차례 (선택한 급수 단어를 우선, 없으면 모든 단어에서)
  const need=lastKana(r), dict=shDict();
  let cand=g.pool.filter(y=>y.r[0]===need&&!g.used.has(y.r)&&lastKana(y.r)!=="ん");
  if(!cand.length){ cand=[]; dict.forEach((arr,rd)=>{ if(rd[0]===need&&!g.used.has(rd)&&lastKana(rd)!=="ん") cand.push({r:rd,w:arr[0]}); }); }
  if(!cand.length){ g.score+=50; popFx("+50","pts"); return shEnd("win","컴퓨터가 이을 단어가 없어요. 당신의 승리!"); }
  const nextCount=rd=>{ const ch=lastKana(rd); let n=0; dict.forEach((arr,k)=>{ if(k[0]===ch&&!g.used.has(k)) n++; }); return n; };
  const good=cand.filter(y=>nextCount(y.r)>=3), from=good.length?good:cand, y=from[Math.floor(Math.random()*from.length)];
  g.used.add(y.r); g.chain.push({who:"com",r:y.r,w:y.w}); g.need=lastKana(y.r); g.cur=g.need; g.hintShown=null; g.msg=""; g.busy=true; shRender();
  const gg=g; gFlash=setTimeout(()=>{ if(G!==gg) return; gg.busy=false; },400);
}
function shMiss(){
  const g=G; g.lives--; sfx("ng"); if(g.lives<=0) return shEnd("lose","기회를 모두 썼어요."); g.cur=g.need; shRender();
}
function shEnd(res,msg){
  const g=G; if(!g) return; g.over=true; sfx("end");
  const prev=getBest("shiri"), isNew=g.score>0&&(prev==null||g.score>prev); if(isNew) setBest("shiri",g.score);
  gResult({title:"끝말잇기 결과",big:g.score+"점",score:g.score,isNew,seen:g.seen,marks:new Set(),type:"shiri",
    note:`${msg} · 이은 횟수 ${g.rounds}${prev!=null&&!isNew?` · 최고 기록 ${prev}점`:""}`});
}

/* ======================= 떨어지는 단어 ======================= */
function startFall(){
  stopG(); Q=null; const pool=ALL.filter(inScope);
  if(pool.length<8){ toast("이 범위에는 단어가 부족해요"); return; }
  gCountdown("위에서 단어가 떨어져요! 가장 아래 단어의 뜻을 빨리 골라요<br>바닥에 닿으면 하트가 줄고, 3개를 잃으면 끝나요",()=>fBegin(pool));
}
function fBegin(pool){
  G={type:"fall",pool:shuffle(pool),pi:0,words:[],lives:3,score:0,combo:0,maxc:0,right:0,lv:1,last:performance.now(),spawnAt:0,seen:new Map(),marks:new Set(),opts:null,optFor:null,lostIdx:-1,raf:0};
  fRenderShell(); fSpawn(); bgmStart(); G.raf=requestAnimationFrame(fLoop);
}
function fSpawn(){
  const g=G, w=g.pool[g.pi++%g.pool.length], key=(w.text!==w.yomi&&Math.random()<.35)?"yomi":"ko";
  const el=document.createElement("div"); el.className="fw"; el.textContent=w.text; const lastX=g.lastX||50; let x=18+Math.random()*64; if(Math.abs(x-lastX)<22) x=x<50?x+30:x-30; g.lastX=x; el.style.left=x+"%"; el.style.top="0%";
  const area=$("fallarea"); if(area) area.appendChild(el);
  g.words.push({w,key,y:0,el}); g.spawnAt=performance.now()+ Math.max(2600,5200-g.lv*350);
}
function fRenderShell(){
  const g=G;
  $("quizView").innerHTML=`<div class="qbox gbox"><div class="gfx" id="gfx"></div>
   <div class="gstat"><span id="fsc">점수 ${g.score}</span><span id="fcb">연속 ${g.combo}</span><span>레벨 <b id="flv">${g.lv}</b></span>
    <span class="hp" id="fhp" role="img" aria-label="남은 기회 ${g.lives}번">${[0,1,2].map(i=>heart(i<g.lives,i===g.lostIdx)).join("")}</span></div>
   <div class="fallarea" id="fallarea"><div class="gr"></div></div>
   <div class="sub" id="fq" style="text-align:center"></div><div class="opts4" id="fopts"></div>
   <div class="qbtns">${sndBtn()}<button class="pill" data-act="gquit">그만하기</button></div></div>`;
  g.words.forEach(o=>{ const a=$("fallarea"); if(a) a.appendChild(o.el); });
}
function fLowest(){ const g=G; return g.words.reduce((a,b)=>!a||b.y>a.y?b:a,null); }
function fOptions(){
  const g=G, t=fLowest(); if(!t){ $("fopts").innerHTML=""; $("fq").textContent=""; g.optFor=null; return; }
  if(g.optFor===t) return; g.optFor=t; t.opts=t.opts||choices(t.w,t.key);
  $("fq").textContent=t.key==="ko"?"이 단어의 뜻은?":"이 단어의 읽기는?";
  $("fopts").innerHTML=t.opts.map((o,i)=>`<button class="opt" data-fo="${i}"><kbd>${i+1}</kbd>${E(o)}</button>`).join("");
  g.words.forEach(o=>o.el.classList.toggle("tgt",o===t));
}
function fLoop(now){
  const g=G; if(!g||g.type!=="fall"||!QV(view)){ if(g&&g.type==="fall") stopG(); return; }
  const dt=Math.min(.1,(now-g.last)/1000); g.last=now;
  const speed=.075+.012*(g.lv-1);    // 화면 높이 / 초
  for(const o of [...g.words]){
    o.y+=speed*dt; o.el.style.top=Math.min(o.y,1)*86+"%"; o.el.classList.toggle("danger",o.y>.7);
    if(o.y>=1){ fRemove(o,false); fMiss(o); if(g.lives<=0) return fEnd(); }
  }
  if(g.words.length<3&&now>=g.spawnAt&&g.words.every(o=>o.y>.28)) fSpawn();
  if(!g.words.length) fSpawn();
  fOptions();
  g.raf=requestAnimationFrame(fLoop);
}
function fRemove(o,pop){ const g=G; g.words=g.words.filter(x=>x!==o); if(g.optFor===o) g.optFor=null; if(pop){ o.el.classList.add("pop"); setTimeout(()=>o.el.remove(),350); } else o.el.remove(); }
function fMiss(o){
  const g=G; g.lives--; g.lostIdx=g.lives; g.combo=0; sfx("ng"); record(o.w,false);
  const r=g.seen.get(o.w.key); g.seen.set(o.w.key,{w:o.w,st:"ng"});
  const hp=$("fhp"); if(hp) hp.innerHTML=[0,1,2].map(i=>heart(i<g.lives,i===g.lostIdx)).join(""); const cb=$("fcb"); if(cb) cb.textContent="연속 0"; popFx("바닥에 닿았어요","pts neg");
}
function fPick(i){
  const g=G; if(!g||g.type!=="fall") return; const t=fLowest(); if(!t||!t.opts) return; const o=t.opts[i]; if(o===undefined) return;
  const ok=o===t.w[t.key];
  if(ok){
    const pts=10+2*Math.min(g.combo,10); g.score+=pts; g.combo++; g.maxc=Math.max(g.maxc,g.combo); g.right++; record(t.w,true); sfx("ok");
    const r=g.seen.get(t.w.key); g.seen.set(t.w.key,{w:t.w,st:(r&&r.st==="ng")?"ng":"ok"});
    popFx("+"+pts,"pts"); if(g.combo>=3) popFx(g.combo+" 콤보!",cmbCls(g.combo));
    fRemove(t,true); if(g.right%5===0){ g.lv++; popFx("레벨 "+g.lv,"clr"); const l=$("flv"); if(l) l.textContent=g.lv; }
    if(g.words.length<2) g.spawnAt=0;
  } else {
    g.combo=0; sfx("ng"); record(t.w,false); g.seen.set(t.w.key,{w:t.w,st:"ng"}); t.y=Math.min(.97,t.y+.14); popFx("틀렸어요 -","pts neg");
    const b=document.querySelector(`#fopts [data-fo="${i}"]`); if(b){ b.classList.add("wrong"); b.disabled=true; }
  }
  const sc=$("fsc"); if(sc) sc.textContent="점수 "+g.score; const cb=$("fcb"); if(cb) cb.textContent="연속 "+g.combo;
}
function fEnd(){
  const g=G; if(!g) return; g.words.forEach(o=>{ if(!g.seen.has(o.w.key)) g.seen.set(o.w.key,{w:o.w,st:"no"}); });
  sfx("end"); const prev=getBest("fall"), isNew=g.score>0&&(prev==null||g.score>prev); if(isNew) setBest("fall",g.score);
  const gg=g; gResult({title:"떨어지는 단어 결과",big:g.score+"점",score:g.score,isNew,seen:gg.seen,marks:gg.marks,type:"fall",
    note:`맞힌 단어 ${gg.right}개 · 레벨 ${gg.lv} · 최고 연속 ${gg.maxc}${prev!=null&&!isNew?` · 최고 기록 ${prev}점`:""}`});
}

/* ======================= 입력 처리 ======================= */
document.addEventListener("click",e=>{
  const q=$("quizView"); if(!q.contains(e.target)) return;
  const wd=e.target.closest("[data-wd]"); if(wd){ e.preventDefault(); const a=wd.dataset.wd;
    if(a==="script"){ WDK=wd.dataset.k==="1"; if(G&&G.type==="wordle"&&G.intro) wdIntro(); }
    else if(a==="new") wdBegin(wd.dataset.m);
    else if(G&&G.type==="wordle"&&!G.over){
      if(a==="key"){ if(G.cur.length<G.len){ G.cur+=wd.dataset.c; wdRender(); } }
      else if(a==="del"){ G.cur=G.cur.slice(0,-1); wdRender(); }
      else if(a==="enter") wdEnter();
      else if(a==="tab"){ G.tab=wd.dataset.t; wdRender(); }
      else if(a==="hint"){ G.hint=true; wdRender(); } }
    return; }
  const sk=e.target.closest("[data-sk]"); if(sk){ const a=sk.dataset.sk; if(!G||G.type!=="shiri"||G.over) return;
    if(a==="key"){ if(G.cur.length<9){ G.cur+=sk.dataset.c; G.msg=""; shRender(); } }
    else if(a==="del"){ if(G.cur.length>1){ G.cur=G.cur.slice(0,-1); G.msg=""; shRender(); } }
    else if(a==="enter") shSubmit();
    else if(a==="tab"){ G.tab=sk.dataset.t; shRender(); }
    else if(a==="hint") shHint();
    else if(a==="giveup") shEnd("lose","포기했어요.");
    return; }
  const fo=e.target.closest("[data-fo]"); if(fo){ fPick(+fo.dataset.fo); return; }
});
document.addEventListener("keydown",e=>{
  if(!G||!QV(view)) return;
  if(G.type==="fall"&&/^[1-4]$/.test(e.key)){ fPick(+e.key-1); }
  else if(G.type==="shiri"&&!G.over){ if(e.key==="Backspace"){ if(G.cur.length>1){ G.cur=G.cur.slice(0,-1); G.msg=""; shRender(); } } else if(e.key==="Enter") shSubmit(); else if(/^[ぁ-ゖー]$/.test(e.key)&&G.cur.length<9){ G.cur+=e.key; G.msg=""; shRender(); } }
  else if(G.type==="wordle"&&!G.over&&!G.intro){ if(e.key==="Backspace"){ G.cur=G.cur.slice(0,-1); wdRender(); } else if(e.key==="Enter") wdEnter(); else if((G.kata?/^[ァ-ヶー]$/:/^[ぁ-ゖー]$/).test(e.key)&&G.cur.length<G.len){ G.cur+=e.key; wdRender(); } }
});
window.startWordle=startWordle; window.startShiri=startShiri; window.startFall=startFall;
})();
