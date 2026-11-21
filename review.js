/* 복습 · 오답 노트 화면
 * - 복습: 카드를 보고 스스로 기억 정도(다시 / 어려움 / 알맞음 / 쉬움)를 골라요. 기존 복습 일정(jp-srs)에 그대로 반영돼요.
 * - 오답 노트: 틀린 단어와 내가 고른 답(jp-wlog)을 함께 보여 주고, 틀린 단어만 다시 풀 수 있어요.
 * 기존 기록(jp-wrong·jp-miss·jp-srs)의 형식은 바꾸지 않았어요. */
(function(){
const A=()=>window.APP, $=id=>document.getElementById(id), E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const IV=[10/1440,1,3,7,14,30,60], DAY=864e5, PER_SESSION=20;
const TYPE={meaning:"뜻 고르기",reading:"읽기 고르기",card:"카드",review:"복습",order:"문장 순서"};

/* ---------- 복습 일정 계산 ---------- */
const srs=()=>A().LS.get("jp-srs",{});
function counts(){
  const s=srs(), now=Date.now(), mid=new Date(); mid.setHours(24,0,0,0); const t0=mid.getTime();
  let due=0,tom=0,week=0;
  Object.keys(s).forEach(k=>{ if(!A().byKey(k)) return; const d=s[k].d||0; if(d<=now) due++; else { if(d<t0+DAY) tom++; if(d<t0+7*DAY) week++; } });
  return {due,tom,week,total:Object.keys(s).length};
}
function dueWords(){
  const s=srs(), now=Date.now(), miss=A().miss();
  return Object.keys(s).filter(k=>(s[k].d||0)<=now).map(k=>A().byKey(k)).filter(Boolean)
    .sort((a,b)=>((miss[b.key]||0)-(miss[a.key]||0))||((s[a.key].d||0)-(s[b.key].d||0)));
}
const fmt=d=>d<1?Math.max(1,Math.round(d*1440))+"분":d<30?Math.round(d)+"일":"한 달+";
function nextIv(key,grade){ const b=(srs()[key]||{b:0}).b||0, nb=grade==="again"?0:grade==="hard"?Math.max(1,b-1):grade==="good"?Math.min(6,b+1):Math.min(6,b+2); return fmt(IV[nb]); }

/* ---------- 다이얼로그 ---------- */
let S=null;
function dlg(){ let d=$("rvDlg"); if(!d){ d=document.createElement("dialog"); d.id="rvDlg"; document.body.appendChild(d);
  d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-rvx]")){ d.close(); A().renderHome(); return; }
    const a=ev.target.closest("[data-rv]"); if(!a) return; act(a,d); }); } return d; }

function overview(){
  const d=dlg(), c=counts();
  d.innerHTML=`<div class="dh"><h2 style="margin:0">복습</h2><button class="x" data-rvx aria-label="닫기">×</button></div><div class="db rvdb">
   <div class="rvsum"><div><b>${c.due}</b><span>지금 복습</span></div><div><b>${c.tom}</b><span>오늘 남은 것·내일</span></div><div><b>${c.week}</b><span>이번 주</span></div></div>
   ${c.due?`<button class="cta" data-rv="start">복습 시작 (${Math.min(c.due,PER_SESSION)}개)</button><p class="sub rvnote">자주 틀린 단어부터 나와요. 카드를 본 뒤 얼마나 기억했는지 골라 주세요.</p>`
     :`<p class="rvdone">${c.total?"오늘 복습은 끝났어요 🎉":"아직 복습할 단어가 없어요"}</p><p class="sub rvnote">${c.total?(c.tom?"내일 "+c.tom+"개가 돌아와요.":"다음 복습은 며칠 뒤에 돌아와요."):"단어 퀴즈를 풀면 복습 일정이 만들어져요."}</p>`}
   <div class="rvbtns"><button class="pill" data-rv="quizrv" ${c.due?"":"disabled"}>퀴즈로 복습하기</button><button class="pill" data-rv="wrong">오답 노트</button></div></div>`;
  if(!d.open) d.showModal();
}
function startSession(words){
  S={q:words.slice(),i:0,show:false,res:{again:0,hard:0,good:0,easy:0},redo:new Set(),n:words.length};
  card();
}
function card(){
  const d=dlg(); if(!S.q[S.i]) return finish();
  const w=S.q[S.i], ex=w.ex&&w.ex[0]&&w.ex[0].ja?w.ex[0]:null, R=A().R;
  d.innerHTML=`<div class="dh"><b class="rvpg">${S.i+1} / ${S.q.length}</b><button class="x" data-rvx aria-label="그만하기">×</button></div><div class="db rvdb">
   <div class="rvcard"><div class="rvw">${R(w.f)}</div>
   ${S.show?`<div class="rvm">${E(w.ko)}</div><div class="rvp">${E(w.pos||"")}</div>${ex?`<div class="rvex"><div>${R(ex.ja)}</div><small>${E(ex.ko||"")}</small></div>`:""}`:`<button class="pill on" data-rv="show">답 확인</button>`}</div>
   ${S.show?`<div class="rvrate">${[["again","다시","again"],["hard","어려움","hard"],["good","알맞음","good"],["easy","쉬움","easy"]].map(([g,l])=>`<button class="rv-${g}" data-rv="rate" data-g="${g}"><b>${l}</b><small>${nextIv(w.key,g)} 뒤</small></button>`).join("")}</div>`:""}</div>`;
  if(!d.open) d.showModal();
}
function finish(){
  const d=dlg(), r=S.res, total=r.again+r.hard+r.good+r.easy, ok=r.good+r.easy;
  d.innerHTML=`<div class="dh"><h2 style="margin:0">복습 끝!</h2><button class="x" data-rvx aria-label="닫기">×</button></div><div class="db rvdb">
   <p class="rvdone">${total}개 복습 · 기억한 단어 ${ok}개</p>
   <div class="rvsum"><div><b>${r.again}</b><span>다시</span></div><div><b>${r.hard}</b><span>어려움</span></div><div><b>${r.good}</b><span>알맞음</span></div><div><b>${r.easy}</b><span>쉬움</span></div></div>
   ${r.again?`<p class="sub rvnote">「다시」로 고른 단어는 오답 노트에 담겼어요.</p>`:""}
   <div class="rvbtns">${counts().due?`<button class="pill on" data-rv="more">이어서 복습</button>`:""}<button class="pill" data-rv="wrong">오답 노트</button><button class="pill" data-rv="close">닫기</button></div></div>`;
  S=null;
}
function act(b,d){ const a=b.dataset.rv;
  if(a==="start"||a==="more") startSession(dueWords().slice(0,PER_SESSION));
  else if(a==="show"){ S.show=true; card(); }
  else if(a==="rate"){ const w=S.q[S.i], g=b.dataset.g; A().recordRating(w,g); S.res[g]++;
    if(g==="again"&&!S.redo.has(w.key)){ S.redo.add(w.key); S.q.push(w); }
    S.i++; S.show=false; card(); }
  else if(a==="quizrv"){ const pool=dueWords(); d.close(); A().setView("quiz"); A().startQuiz("meaning",pool,Math.min(PER_SESSION,pool.length)); }
  else if(a==="wrong") openWrong();
  else if(a==="close"){ d.close(); A().renderHome(); }
  else if(a==="wsort"){ wSort=b.dataset.s; openWrong(); }
  else if(a==="wquiz"||a==="wread"){ const pool=wrongWords(); if(!pool.length) return; d.close(); A().setView("quiz"); A().startQuiz(a==="wread"?"reading":"meaning",pool,Math.min(PER_SESSION,pool.length)); }
  else if(a==="wcard"){ const pool=wrongWords(); if(!pool.length) return; startSession(pool.slice(0,PER_SESSION)); }
  else if(a==="wopen"){ A().openWord(b.dataset.k); }
}

/* ---------- 오답 노트 ---------- */
let wSort="recent";
function wrongWords(){ const w=A().wrong(); return Object.keys(w).map(k=>A().byKey(k)).filter(Boolean); }
function openWrong(){
  const d=dlg(), wr=A().wrong(), miss=A().miss(), log=A().wlog(), R=A().R;
  const last={}, picks={}; log.forEach(e=>{ last[e.k]=Math.max(last[e.k]||0,e.t); (picks[e.k]=picks[e.k]||[]).push(e); });
  let ws=wrongWords(); ws.sort((a,b)=>wSort==="miss"?((miss[b.key]||0)-(miss[a.key]||0)):((last[b.key]||0)-(last[a.key]||0)));
  d.innerHTML=`<div class="dh"><h2 style="margin:0">오답 노트 <small class="sub">${ws.length}개</small></h2><button class="x" data-rvx aria-label="닫기">×</button></div><div class="db rvdb">
   ${ws.length?`<p class="sub rvlab">틀린 단어 다시 풀기</p><div class="rvbtns" style="margin-top:6px;justify-content:flex-start"><button class="pill on" data-rv="wquiz">뜻 고르기</button><button class="pill" data-rv="wread">읽기 고르기</button><button class="pill" data-rv="wcard">단어 카드</button></div>
   <div class="rvsort"><label for="rvSort" class="sub">정렬</label><select id="rvSort"><option value="recent" ${wSort==="recent"?"selected":""}>최근에 틀린 순</option><option value="miss" ${wSort==="miss"?"selected":""}>많이 틀린 순</option></select></div>
   <div class="rvlist">${ws.map(w=>{ const p=(picks[w.key]||[]).slice(-1)[0], k=wr[w.key]||0;
     return `<button class="rvrow" data-rv="wopen" data-k="${E(w.key)}"><span class="rvr1"><b>${R(w.f)}</b><span class="rvko">${E(w.ko)}</span></span>
      <span class="rvr2">${p&&p.p&&p.p!==p.c?`내가 고른 답: <i>${E(p.p)}</i> · ${E(TYPE[p.m]||"퀴즈")}`:(p?E(TYPE[p.m]||"퀴즈")+"에서 틀림":"이전에 틀린 단어")} · ${miss[w.key]||1}번 틀림 · ${Math.max(1,2-k)}번 더 맞히면 노트에서 제외</span></button>`; }).join("")}</div>`
   :`<p class="rvdone">오답 노트가 비었어요 🎉</p><p class="sub rvnote">퀴즈에서 틀린 단어가 여기에 쌓이고, 2번 연속 맞히면 노트에서 제외돼요.</p>`}
   <div class="rvbtns"><button class="pill" data-rv="back">복습으로</button></div></div>`;
  d.querySelector('[data-rv="back"]').addEventListener("click",overview);
  const so=d.querySelector("#rvSort"); if(so) so.addEventListener("change",()=>{ wSort=so.value; openWrong(); });
  if(!d.open) d.showModal();
}

window.REVIEW={open:overview,openWrong,counts};

/* ---------- 스타일 ---------- */
const ST=document.createElement("style");
ST.textContent=`#rvDlg{border:0;border-radius:18px;padding:0;max-width:440px;width:calc(100% - 24px);max-height:90vh;background:var(--card);color:var(--text)}#rvDlg::backdrop{background:rgba(0,0,0,.45)}
.rvpg{font-size:14px;color:var(--sub)}.rvsum{display:flex;gap:8px;margin:6px 0 14px}.rvsum>div{flex:1;text-align:center;border:1px solid var(--line);border-radius:12px;padding:10px 4px}.rvsum b{display:block;font-size:22px}.rvsum span{font-size:12px;color:var(--sub)}
.rvnote{margin:10px 0 0;text-align:center}.rvdone{font-size:17px;font-weight:700;text-align:center;margin:14px 0 4px}.rvbtns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:14px}.rvbtns .pill:disabled{opacity:.45}
.rvcard{text-align:center;padding:28px 8px;min-height:190px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}.rvw{font-size:34px;font-weight:800;line-height:1.5}.rvm{font-size:22px;font-weight:700}.rvp{font-size:13px;color:var(--sub)}.rvex{margin-top:8px;font-size:15px;text-align:left;border-left:3px solid var(--line);padding-left:10px}.rvex small{display:block;color:var(--sub);margin-top:2px}
.rvrate{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.rvrate button{border:1px solid var(--line);background:var(--card);color:var(--text);border-radius:12px;padding:10px 2px;font:inherit;cursor:pointer;display:flex;flex-direction:column;gap:2px;align-items:center}.rvrate b{font-size:14px}.rvrate small{font-size:11px;color:var(--sub)}
.rvrate .rv-again{border-color:#ee8ab0;color:#d6417f}.rvrate .rv-good{border-color:#79cdc3}.rvrate .rv-easy{border-color:#79cdc3;background:var(--accent-soft)}
.rvlab{margin:0;font-size:13px}.rvsort{display:flex;gap:8px;align-items:center;margin:12px 0 4px}.rvsort select{font:inherit;font-size:14px;border:1px solid var(--line);border-radius:10px;padding:6px 10px;background:var(--card);color:var(--text)}.rvlist{display:flex;flex-direction:column}.rvrow{text-align:left;border:0;border-bottom:1px solid var(--line);background:none;color:inherit;font:inherit;padding:10px 2px;cursor:pointer;display:flex;flex-direction:column;gap:3px}.rvr1{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}.rvr1 b{font-size:18px}.rvko{color:var(--sub);font-size:14px}.rvr2{font-size:12px;color:var(--sub)}.rvr2 i{font-style:normal;color:#d6417f;font-weight:700}`;
document.head.appendChild(ST);
})();
