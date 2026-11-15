/* 애니로 배우기 — 애니메이션 속 말투를 한 줄씩 공부하고 따라 말해 보는 곳
 *
 * - 실제 작품의 대사를 옮겨 싣지 않았어요. 저작권을 지키기 위해, 애니에서 자주 들리는 '말투와 상황'을 본떠
 *   이 앱을 위해 새로 쓴 문장이에요. (특정 작품·캐릭터의 대사가 아니에요)
 * - 새 문장은 아래 LINES 에 { t:유형, ja:후리가나표기, ko:번역, note:말투 설명 } 형식으로 늘리면 돼요.
 * - 후리가나 표기: 漢字[よみ]  (한자 덩어리 바로 뒤에 [읽기])
 */
(function(){
const TYPES=[
 ["hot","🔥 열혈 주인공"],["tsun","💢 츤데레"],["chu2","🌙 중2병·허세"],["life","🏫 학원·일상"],
 ["love","💗 고백·로맨스"],["rival","⚔️ 악역·라이벌"],["help","🌱 응원·선배"],["react","😲 리액션"]
];
const LINES=[
 /* 열혈 */
 {t:"hot",ja:"絶対[ぜったい]に諦[あきら]めない!",ko:"절대로 포기하지 않을 거야!",note:"諦めない = 諦める(포기하다)의 부정형. 주인공이 외치는 가장 대표적인 결의 표현이에요."},
 {t:"hot",ja:"仲間[なかま]は俺[おれ]が守[まも]る!",ko:"동료는 내가 지킨다!",note:"俺는 남자가 쓰는 거친 '나'. 仲間は…俺が… 로 '동료만큼은 내가'라는 강조가 돼요."},
 {t:"hot",ja:"俺[おれ]は強[つよ]くなってみせる!",ko:"나는 강해져 보이겠어!",note:"〜てみせる = ~해 보이겠다(각오). 〜てみる(~해 보다)와 헷갈리지 마세요."},
 {t:"hot",ja:"負[ま]けるわけにはいかないんだ!",ko:"질 수는 없어!",note:"〜わけにはいかない = ~할 수는 없다. 끝의 んだ가 감정을 실어 줘요."},
 {t:"hot",ja:"まだ終[お]わってない!ここからが本番[ほんばん]だ!",ko:"아직 안 끝났어! 지금부터가 진짜야!",note:"〜てない는 〜ていない의 줄임말(구어). 本番 = 실전·진짜 무대."},
 {t:"hot",ja:"俺[おれ]を信[しん]じてくれ!",ko:"나를 믿어 줘!",note:"〜てくれ = ~해 줘(남자의 부탁). 정중하게는 信じてください."},
 {t:"hot",ja:"みんなで一緒[いっしょ]に行[い]こう!",ko:"다 같이 가자!",note:"行こう = 行く의 권유·의지형. '~하자'."},
 /* 츤데레 */
 {t:"tsun",ja:"べ、別[べつ]にあんたのためじゃないんだからね!",ko:"뭐, 딱히 너를 위해서가 아니거든!",note:"츤데레의 상징 문장. あんた = 너(거친 말), 〜んだからね로 쏘아붙이는 느낌."},
 {t:"tsun",ja:"勘違[かんちが]いしないでよ、ただの偶然[ぐうぜん]なんだから。",ko:"착각하지 마, 그냥 우연이니까.",note:"〜ないでよ = ~하지 마(여자 말투의 반발). 勘違い = 착각."},
 {t:"tsun",ja:"心配[しんぱい]なんかしてないし!",ko:"걱정 같은 거 안 했거든!",note:"なんか = ~따위. 문장 끝의 し는 이유를 흘리며 부정하는 구어체."},
 {t:"tsun",ja:"うるさいわね、ほっといてよ!",ko:"시끄러워, 내버려 둬!",note:"ほっとく = 放っておく의 줄임말(내버려 두다). 〜わね는 여성스러운 말끝."},
 {t:"tsun",ja:"助[たす]けてあげてもいいけど、一回[いっかい]だけよ。",ko:"도와줘도 되지만, 딱 한 번만이야.",note:"〜てあげてもいい = ~해 줘도 좋다(생색). 〜けど로 말끝을 흐려요."},
 {t:"tsun",ja:"バ、バカ!見[み]ないでよ!",ko:"바, 바보! 보지 마!",note:"당황했을 때 말을 더듬는 표현. バカ는 친한 사이의 가벼운 욕이에요."},
 /* 중2병 */
 {t:"chu2",ja:"我[われ]が右腕[みぎうで]に宿[やど]りし力[ちから]を見[み]せてやろう。",ko:"내 오른팔에 깃든 힘을 보여 주마.",note:"我が·宿りし는 옛날 투의 문어체. 중2병 캐릭터의 단골 표현이에요."},
 {t:"chu2",ja:"俺[おれ]の封印[ふういん]された力[ちから]が目覚[めざ]める…!",ko:"내 봉인된 힘이 깨어난다…!",note:"封印された = 봉인되었다(수동). 目覚める = 눈뜨다·각성하다."},
 {t:"chu2",ja:"ふっ、運命[うんめい]とは残酷[ざんこく]なものだな。",ko:"훗, 운명이란 잔혹한 법이지.",note:"〜とは〜なものだ = ~란 ~한 것이다. 폼 잡을 때 쓰는 말투."},
 {t:"chu2",ja:"闇[やみ]に堕[お]ちた者[もの]に、光[ひかり]はない。",ko:"어둠에 떨어진 자에게 빛은 없다.",note:"者 = 사람(격식·무게 잡는 말). 〜に〜はない 구조로 단정해요."},
 {t:"chu2",ja:"貴様[きさま]に私[わたし]の気持[きも]ちがわかるか!",ko:"네놈이 내 기분을 알기나 해!",note:"貴様는 아주 거친 '너'. 실제 대화에선 쓰면 안 되는 말이에요."},
 /* 학원·일상 */
 {t:"life",ja:"やばい、遅刻[ちこく]する!",ko:"큰일 났다, 지각하겠어!",note:"やばい = 큰일이다·위험하다(좋은 뜻으로도 써요). 일상 애니의 필수 표현."},
 {t:"life",ja:"宿題[しゅくだい]、全然[ぜんぜん]やってない…。",ko:"숙제, 전혀 안 했어….",note:"全然 + 부정 = 전혀. やってない는 やっていない의 줄임말."},
 {t:"life",ja:"今日[きょう]のお昼[ひる]ごはん、何[なに]にする?",ko:"오늘 점심 뭐 먹을래?",note:"何にする? = 뭘로 할래? 친구끼리 쓰는 반말."},
 {t:"life",ja:"放課後[ほうかご]、一緒[いっしょ]にカラオケ行[い]かない?",ko:"방과 후에 같이 노래방 안 갈래?",note:"〜ない? = ~하지 않을래?(가벼운 권유). 行く의 행선지 に는 구어에서 자주 빠져요."},
 {t:"life",ja:"先生[せんせい]、トイレ行[い]ってもいいですか?",ko:"선생님, 화장실 가도 돼요?",note:"〜てもいいですか = ~해도 됩니까? 허락을 구하는 기본 문형."},
 {t:"life",ja:"また明日[あした]ね!",ko:"내일 또 봐!",note:"ね로 부드럽게 마무리하는 헤어짐 인사. 친한 사이에서 써요."},
 /* 고백 */
 {t:"love",ja:"ずっと前[まえ]から、君[きみ]のことが好[す]きでした。",ko:"훨씬 전부터 너를 좋아했어.",note:"〜のことが好き = ~를 좋아하다(사람에게 쓰는 말). 과거형 でした는 '그때부터 쭉'의 느낌."},
 {t:"love",ja:"私[わたし]と付[つ]き合[あ]ってください!",ko:"저와 사귀어 주세요!",note:"付き合う = 사귀다. 고백의 정석 문장이에요."},
 {t:"love",ja:"君[きみ]の笑顔[えがお]を、ずっと見[み]ていたい。",ko:"너의 웃는 얼굴을 계속 보고 싶어.",note:"〜たい = ~하고 싶다. 見ていたい = 계속 보고 있고 싶다."},
 {t:"love",ja:"一緒[いっしょ]にいると、なんだか安心[あんしん]する。",ko:"같이 있으면 왠지 안심이 돼.",note:"〜と = ~하면(자연스러운 결과). なんだか = 왠지."},
 {t:"love",ja:"今度[こんど]の花火大会[はなびたいかい]、一緒[いっしょ]に行[い]かない?",ko:"이번 불꽃놀이 축제, 같이 안 갈래?",note:"여름 축제 에피소드의 단골 대사. 行かない? = 갈래?"},
 /* 악역·라이벌 */
 {t:"rival",ja:"お前[まえ]に俺[おれ]は倒[たお]せない。",ko:"네가 나를 쓰러뜨릴 수는 없다.",note:"倒せない = 倒す의 가능형 부정(쓰러뜨릴 수 없다). お前는 거친 '너'."},
 {t:"rival",ja:"面白[おもしろ]い、もっと楽[たの]しませてくれ。",ko:"재미있군, 좀 더 즐겁게 해 줘.",note:"楽しませる = 즐겁게 해 주다(사역형). 여유 있는 라이벌의 말투."},
 {t:"rival",ja:"次[つぎ]は負[ま]けないぞ。",ko:"다음엔 안 질 거다.",note:"〜ぞ는 남자가 강하게 다짐할 때 붙이는 말끝."},
 {t:"rival",ja:"俺[おれ]が相手[あいて]になってやる。",ko:"내가 상대해 주겠다.",note:"〜てやる = ~해 주겠다(내려다보는 어조). 호의가 아니라 도전이에요."},
 {t:"rival",ja:"甘[あま]いな、そんな攻撃[こうげき]は効[き]かない。",ko:"무르군, 그런 공격은 안 통해.",note:"甘い = 달다·물러 터졌다. 効く = 효과가 있다."},
 /* 응원 */
 {t:"help",ja:"大丈夫[だいじょうぶ]、君[きみ]ならできる。",ko:"괜찮아, 너라면 할 수 있어.",note:"〜なら = ~라면. 선배·스승이 격려할 때 자주 써요."},
 {t:"help",ja:"焦[あせ]らなくていい、一歩[いっぽ]ずつ進[すす]もう。",ko:"서두르지 않아도 돼, 한 걸음씩 나아가자.",note:"〜なくていい = ~하지 않아도 된다. 〜ずつ = ~씩."},
 {t:"help",ja:"よく頑張[がんば]ったな。",ko:"정말 잘 해냈구나.",note:"よく = 잘·훌륭히. 〜な로 감탄을 담은 칭찬."},
 {t:"help",ja:"失敗[しっぱい]は、成長[せいちょう]のチャンスだよ。",ko:"실패는 성장의 기회야.",note:"〜だよ = 부드럽게 알려 주는 말끝."},
 {t:"help",ja:"自分[じぶん]を信[しん]じて。",ko:"자신을 믿어.",note:"〜て로 끝내는 가벼운 명령·부탁. 信じる = 믿다."},
 /* 리액션 */
 {t:"react",ja:"まさか、そんなはずがない!",ko:"설마, 그럴 리가 없어!",note:"まさか = 설마. 〜はずがない = ~일 리가 없다."},
 {t:"react",ja:"なんだと!?もう一回[いっかい]言[い]ってみろ!",ko:"뭐라고!? 다시 한번 말해 봐!",note:"なんだと = 뭐라고(화난 반문). 〜てみろ = ~해 봐라(거친 명령)."},
 {t:"react",ja:"すごい!こんなの初[はじ]めて見[み]た!",ko:"대박! 이런 건 처음 봐!",note:"こんなの = 이런 것. 初めて = 처음으로."},
 {t:"react",ja:"やった!勝[か]ったぞ!",ko:"해냈다! 이겼다!",note:"やった = 해냈다·좋아. 勝った = 이겼다."},
 {t:"react",ja:"えっ、うそでしょ!?",ko:"어, 거짓말이지!?",note:"うそでしょ = 거짓말이지(믿기지 않을 때). 친한 사이의 구어."}
];
LINES.forEach((l,i)=>{ l.id="an"+i; l.text=plain(l.ja); });

const ST=document.createElement("style");
ST.textContent=`.an-wrap{max-width:720px;margin:0 auto}
.an-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.an-tabs.sc{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px}.an-tabs .pill{white-space:nowrap}
.an-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px;margin-bottom:12px}
.an-card.done{border-color:#4c9a62}
.an-ja{font-size:22px;line-height:2.1;font-weight:700}.an-ko{color:var(--sub);margin:2px 0 6px}
.an-note{font-size:13px;color:var(--sub);background:var(--chip);border-radius:10px;padding:8px 10px;margin:8px 0}
.an-act{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px}
.an-res{margin-top:8px;font-size:14px}.an-res b{font-size:18px}
.an-blank{display:inline-block;min-width:3em;border-bottom:3px solid var(--accent);color:var(--accent);text-align:center}
.an-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.an-opts .opt{font-size:18px;padding:12px 8px}
.an-type{font-size:12px;color:var(--sub)}`;
document.head.appendChild(ST);

const KEY="jp-anime";
let done=new Set(LS.get(KEY,[])), aType="all", aMode="learn", aRes={}, aQ=null, aRec=null;
const saveDone=()=>LS.set(KEY,[...done]);
const tname=t=>(TYPES.find(x=>x[0]===t)||[0,t])[1];
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;

function lev(a,b){ const m=a.length,n=b.length; if(!m) return n; if(!n) return m; let p=Array.from({length:n+1},(_,j)=>j);
  for(let i=1;i<=m;i++){ const c=[i]; for(let j=1;j<=n;j++) c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)); p=c; } return p[n]; }
const norm=s=>s.replace(/[\s、。,.!?!?…「」・ー~〜]/g,"").replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
function sim(heard,l){ const h=norm(heard); if(!h) return 0;
  const best=[norm(l.text),norm(reading(l.ja))].map(t=>1-lev(h,t)/Math.max(h.length,t.length,1));
  return Math.max(0,Math.round(Math.max(...best)*100)); }

function card(l){
  const r=aRes[l.id];
  return `<div class="an-card ${done.has(l.id)?"done":""}" data-id="${l.id}">
   <div class="an-type">${tname(l.t)}</div>
   <div class="an-ja">${toRuby(l.ja)}</div><div class="an-ko">${E(l.ko)}</div>
   <div class="an-note">💡 ${E(l.note)}</div>
   <div class="an-act">${canSay()?`<button class="pill sm" data-an="say" data-id="${l.id}">${ic("sound")} 듣기</button><button class="pill sm" data-an="slow" data-id="${l.id}">🐢 천천히</button>`:""}
    <button class="pill sm" data-an="rec" data-id="${l.id}">${aRec===l.id?"🎙 듣는 중…(탭하면 중지)":"🎤 따라 말하기"}</button>
    <button class="pill sm ${done.has(l.id)?"on":""}" data-an="done" data-id="${l.id}">${done.has(l.id)?"✓ 외웠어요":"외웠어요"}</button></div>
   ${r?`<div class="an-res">${r.err?E(r.err):`내가 말한 것: <b>${E(r.heard)}</b><br>일치도 <b>${r.pct}%</b> ${r.pct>=85?"👏 완벽해요!":r.pct>=60?"👍 좋아요, 한 번 더!":"💪 다시 들어 보고 도전!"}`}</div>`:""}
  </div>`;
}
function listHtml(){
  const arr=LINES.filter(l=>aType==="all"||l.t===aType);
  return `<div class="sub" style="margin-bottom:6px">듣고(🔊) → 따라 말하고(🎤) → 외웠으면 체크! ${SR?"":"<br>이 브라우저는 말하기 점수를 지원하지 않아요(크롬 권장). 듣고 소리 내어 따라 해 보세요."}</div>`
    + arr.map(card).join("");
}
function mkQuiz(){
  const pool=shuffle(LINES.filter(l=>aType==="all"||l.t===aType)).slice(0,10);
  const items=pool.map(l=>{
    const ch=chunkOrd(l.ja), cand=ch.map((c,i)=>({c,i})).filter(x=>x.c.replace(/[、。!?!?…]/g,"").length>=2&&!/^(は|が|を|に|で|と|も|へ|の)$/.test(x.c));
    if(!cand.length) return null;
    const pick=cand[Math.floor(Math.random()*cand.length)], ans=pick.c.replace(/[、。!?!?…]+$/,"");
    const others=shuffle([...new Set(LINES.filter(o=>o!==l).flatMap(o=>chunkOrd(o.ja)).map(x=>x.replace(/[、。!?!?…]+$/,"")).filter(x=>x.length>=2&&x!==ans&&!/^(は|が|を|に|で|と|も|へ|の)$/.test(x)))]).slice(0,3);
    return {l,ch,idx:pick.i,ans,opts:shuffle([ans,...others])};
  }).filter(Boolean);
  return {items,i:0,score:0,picked:null};
}
function quizHtml(){
  if(!aQ) aQ=mkQuiz(); const q=aQ;
  if(q.i>=q.items.length) return `<div class="an-card" style="text-align:center"><h3>결과 ${q.score} / ${q.items.length}</h3><button class="cta" data-an="qagain" style="max-width:260px;margin:10px auto">한 번 더</button></div>`;
  const it=q.items[q.i], sh=it.ch.map((c,i)=>i===it.idx?`<span class="an-blank">${q.picked?E(it.ans):"　　"}</span>${/[、。!?!?…]+$/.test(c)?E(c.match(/[、。!?!?…]+$/)[0]):""}`:E(c)).join(" ");
  return `<div class="an-card"><div class="sub">${q.i+1} / ${q.items.length} · ${tname(it.l.t)}</div>
   <div class="an-ja" style="margin:8px 0">${sh}</div><div class="an-ko">${E(it.l.ko)}</div>
   <div class="an-opts">${it.opts.map((o,k)=>`<button class="opt ${q.picked?(o===it.ans?"correct":(q.picked===o?"wrong":"")):""}" data-an="pick" data-o="${E(o)}" ${q.picked?"disabled":""}>${E(o)}</button>`).join("")}</div>
   ${q.picked?`<div class="an-note">${q.picked===it.ans?"⭕ 정답!":"❌ 정답은 「"+E(it.ans)+"」"}<br>${toRuby(it.l.ja)}<br>💡 ${E(it.l.note)}</div><button class="cta" data-an="qnext">${q.i+1>=q.items.length?"결과 보기":"다음"}</button>`:""}</div>`;
}
window.renderAnime=function(){
  const v=$("animeView"); if(!v) return;
  v.innerHTML=`<div class="an-wrap"><div class="qm-h"><h2>🎌 애니로 배우기</h2></div>
   <div class="sub">애니에서 자주 들리는 말투를 한 줄씩! 말투 설명과 함께 듣고 따라 해 보세요. · 외운 문장 ${[...done].filter(id=>LINES.some(l=>l.id===id)).length} / ${LINES.length}</div>
   <div class="an-tabs"><button class="pill ${aMode==="learn"?"on":""}" data-an="mode" data-m="learn">한 줄 공부</button><button class="pill ${aMode==="quiz"?"on":""}" data-an="mode" data-m="quiz">빈칸 퀴즈</button></div>
   <div class="an-tabs sc"><button class="pill sm ${aType==="all"?"on":""}" data-an="type" data-t="all">전체</button>${TYPES.map(t=>`<button class="pill sm ${aType===t[0]?"on":""}" data-an="type" data-t="${t[0]}">${t[1]}</button>`).join("")}</div>
   ${aMode==="learn"?listHtml():quizHtml()}</div>`;
};
function stopRec(){ if(aRec&&window._anRec){ try{ window._anRec.stop(); }catch(e){} } }
function startRec(l){
  if(!SR){ aRes[l.id]={err:"이 브라우저는 음성 인식을 지원하지 않아요. 크롬에서 써 보세요."}; return renderAnime(); }
  if(aRec){ stopRec(); return; }
  try{ speechSynthesis.cancel(); }catch(e){}
  const rec=new SR(); rec.lang="ja-JP"; rec.interimResults=false; rec.maxAlternatives=3; window._anRec=rec; aRec=l.id; renderAnime();
  let got=false;
  rec.onresult=e=>{ got=true; let best=null; for(const a of e.results[0]){ const p=sim(a.transcript,l); if(!best||p>best.pct) best={heard:a.transcript,pct:p}; } aRes[l.id]=best; };
  rec.onerror=e=>{ got=true; aRes[l.id]={err:e.error==="not-allowed"?"마이크 사용을 허용해 주세요.":e.error==="no-speech"?"목소리가 들리지 않았어요. 다시 해 보세요.":"음성 인식에 실패했어요. 다시 해 보세요."}; };
  rec.onend=()=>{ if(!got) aRes[l.id]={err:"목소리가 들리지 않았어요. 다시 해 보세요."}; aRec=null; renderAnime(); };
  try{ rec.start(); }catch(e){ aRec=null; renderAnime(); }
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-an]"); if(!b||!$("animeView").contains(b)) return; const a=b.dataset.an, l=LINES.find(x=>x.id===b.dataset.id);
  if(a==="say"&&l) speakJa(l.text,.9);
  else if(a==="slow"&&l) speakJa(l.text,.6);
  else if(a==="rec"&&l) startRec(l);
  else if(a==="done"&&l){ done.has(l.id)?done.delete(l.id):done.add(l.id); saveDone(); renderAnime(); }
  else if(a==="mode"){ aMode=b.dataset.m; aQ=null; renderAnime(); }
  else if(a==="type"){ aType=b.dataset.t; aQ=null; renderAnime(); }
  else if(a==="pick"){ if(aQ&&!aQ.picked){ aQ.picked=b.dataset.o; if(b.dataset.o===aQ.items[aQ.i].ans) aQ.score++; renderAnime(); } }
  else if(a==="qnext"){ aQ.i++; aQ.picked=null; renderAnime(); window.scrollTo(0,0); }
  else if(a==="qagain"){ aQ=null; renderAnime(); }
});
})();
