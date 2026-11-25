/* 술술 플러스 — 공부를 더 깊게 도와주는 유료 이용권(기간제, 자동 갱신 없음).
 * 기본 공부(단어·퀴즈·게임·문법·뉴스·모의시험)는 계속 무료예요. 플러스는 "내 약점을 알려 주고 거기에 맞춰 연습"하는 기능이에요.
 *  - 맞춤 복습: 자주 틀리는 단어만 골라서 퀴즈 (무료는 하루 1번 체험)
 *  - 심화 분석: 약한 단어 TOP 10 · 급수별/품사별 약점 · 자주 헷갈리는 오답 짝
 * 이용 기간(plusUntil)은 서버(functions)만 쓸 수 있는 wallets/{uid} 문서에 있고, 앱은 읽기만 해요.
 * 결제는 billing.js(토스 웹 결제)가 열릴 때까지 "준비 중"으로 보여요. 플레이 앱 안에서는 구매 구역을 숨겨요. */
(function(){
const A=()=>window.APP, E=s=>A().E(s);
const PASSES=[{sku:"plus_30",days:30,price:3300,tag:"가볍게"},{sku:"plus_180",days:180,price:15400,tag:"인기",note:"한 달 2,567원"},{sku:"plus_365",days:365,price:27500,tag:"시험 준비",note:"한 달 2,292원"}];
const won=n=>n.toLocaleString("ko-KR")+"원";
const uid=()=>{ try{ const u=A().cloud&&A().cloud.auth&&A().cloud.auth.currentUser; return u?u.uid:""; }catch(e){ return ""; } };
const KEY=()=>"jp-plus-until@"+uid();
const until=()=>{ try{ if(DEMO()) return Date.now()+30*864e5; return uid()?(+localStorage.getItem(KEY())||0):0; }catch(e){ return 0; } };
/* 내 컴퓨터(localhost)에서만: 주소 끝에 ?plusdemo=on 을 붙이면 플러스를 켠 화면을 시험해 볼 수 있어요 (?plusdemo=off 로 끔). 배포된 사이트에서는 동작하지 않아요. */
const DEMO=()=>{ try{ if(!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return false; const q=new URLSearchParams(location.search).get("plusdemo"); if(q) sessionStorage.setItem("jp-plusdemo",q); return sessionStorage.getItem("jp-plusdemo")==="on"; }catch(e){ return false; } };
const isPlus=()=>DEMO()||until()>Date.now();
const setUntil=ms=>{ try{ if(uid()) localStorage.setItem(KEY(),String(ms||0)); }catch(e){} };
const ymd=ms=>{ const d=new Date(ms); return d.getFullYear()+"."+(d.getMonth()+1)+"."+d.getDate(); };
const daysLeft=()=>Math.max(0,Math.ceil((until()-Date.now())/864e5));
async function sync(){ try{ const c=A().cloud; if(!(c&&c.ok&&uid())) return; const s=await c.db.collection("wallets").doc(uid()).get(); const t=s.exists&&s.data().plusUntil; setUntil(t&&t.toMillis?t.toMillis():0); }catch(e){} }

/* ---- 약점 계산: 누적 오답 횟수 + 오답 노트 + 최근 오답 기록 ---- */
function weakRank(){
  const miss=A().miss(), wrong=A().wrong(), wl=A().wlog(), sc={};
  Object.keys(miss).forEach(k=>{ sc[k]=(sc[k]||0)+miss[k]*2; });
  Object.keys(wrong).forEach(k=>{ sc[k]=(sc[k]||0)+3; });
  wl.forEach(x=>{ if(x.k) sc[x.k]=(sc[x.k]||0)+1; });
  return Object.entries(sc).map(([k,v])=>({w:A().byKey(k),v,n:miss[k]||0})).filter(x=>x.w).sort((a,b)=>b.v-a.v);
}
const GRP={n:"명사",v:"동사",a:"형용사",d:"부사·기타"};
const grp=p=>{ p=p||""; return p.startsWith("名詞")?"n":p.includes("動詞")?"v":p.includes("形容詞")?"a":"d"; };

/* ---- 맞춤 복습 ---- */
const today=()=>A().today();
function freeUsed(){ try{ return localStorage.getItem("jp-plus-free")===today(); }catch(e){ return false; } }
function startWeak(){
  const rk=weakRank();
  if(rk.length<4){ A().toast("아직 틀린 단어가 적어요. 퀴즈를 조금 더 풀어 보세요."); return; }
  if(!isPlus()){ if(freeUsed()){ open("weak"); return; } try{ localStorage.setItem("jp-plus-free",today()); }catch(e){} }
  const pool=rk.slice(0,60).map(x=>x.w);
  A().startQuiz("meaning",pool,10);
}

/* ---- 화면 조각 ---- */
function tileHtml(){ const used=!isPlus()&&freeUsed(); return `<button class="t2 c2" data-plus="weak"><span class="ti">${A().ic("target")}</span><b>맞춤 복습 <em class="plusbadge">PLUS</em></b><small>${isPlus()?"자주 틀리는 단어만 골라서 10문제":used?"오늘 무료 체험을 썼어요 · 플러스는 무제한":"자주 틀리는 단어만 · 하루 1번 무료 체험"}</small></button>`; }
function statsHtml(){
  const rk=weakRank(), plus=isPlus(); if(!rk.length) return "";
  const rows=rk.slice(0,10).map(x=>`<div class="row" data-key="${x.w.key}"><span>${A().R(x.w.f)} <span class="sub">${E(x.w.ko)}</span></span><span class="sub">${x.n?x.n+"번 틀림":"복습 중"}</span></div>`).join("");
  let more="";
  if(plus){
    const lv={}, pg={}; rk.forEach(x=>{ lv[x.w.lv]=(lv[x.w.lv]||0)+x.v; const g=grp(x.w.pos); pg[g]=(pg[g]||0)+x.v; });
    const bar=(o,names)=>{ const t=Object.values(o).reduce((a,b)=>a+b,0)||1; return Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="pbar"><span>${names?names[k]:k}</span><div><i style="width:${Math.round(v/t*100)}%"></i></div><b>${Math.round(v/t*100)}%</b></div>`).join(""); };
    const conf={}; A().wlog().slice(-120).forEach(x=>{ if(!x.p||!x.c||x.p===x.c) return; const k=x.p+"→"+x.c; conf[k]=(conf[k]||0)+1; });
    const cf=Object.entries(conf).sort((a,b)=>b[1]-a[1]).slice(0,4);
    more=`<h4 class="ph">급수별 약점</h4>${bar(lv)}<h4 class="ph">품사별 약점</h4>${bar(pg,GRP)}`+(cf.length?`<h4 class="ph">자주 헷갈린 짝 <small>(내가 고른 답 → 정답)</small></h4>${cf.map(([k,n])=>`<div class="pconf">${E(k.split("→")[0])} <b>→</b> ${E(k.split("→")[1])}<small>${n}번</small></div>`).join("")}`:"");
    return `<div class="panel plusp"><h3>내 약점 분석 <em class="plusbadge">PLUS</em></h3><div class="top5">${rows}</div>${more}<button class="pill on plusgo" data-plus="weak">약한 단어 10문제 풀기</button></div>`;
  }
  more=`<button class="plusup" data-plus="open"><b>내 약점 분석 보기</b><small>약한 단어 TOP 10 · 급수·품사별 약점 · 헷갈린 오답 짝</small><span class="plusbadge">PLUS</span></button>`;
  return `<div class="panel plusp">${more}<button class="pill on plusgo" data-plus="weak">약한 단어 10문제 풀기 <small>(하루 1번 무료)</small></button></div>`;
}
function shopHtml(){ return `<div class="seedpay plusrow"><b>술술 플러스</b><small>${isPlus()?`이용 중 · ${ymd(until())}까지 (${daysLeft()}일 남음)`:"내 약점을 찾아 주는 맞춤 복습·심화 분석"}</small><button class="pill on" data-plus="open">${isPlus()?"자세히":"알아보기"}</button></div>`; }

/* ---- 플러스 탭 (하단 메뉴) ---- */
function open(why){ try{ document.querySelectorAll("dialog[open]").forEach(d=>d.close()); }catch(e){} try{ window.__plusWhy=why||""; }catch(e){} A().setView("plus"); }
function passesHtml(){
  const SP=window.SEEDPAY, inPlay=(()=>{ try{ return sessionStorage.getItem("jp-twa")==="1"; }catch(e){ return false; } })();
  const ready=SP&&SP.ready&&SP.ready(), signed=!!uid();
  if(inPlay) return `<p class="sub">플레이스토어 앱에서는 구매를 지원하지 않아요. 웹(surasura-nihongo.web.app)에서 가능해요.</p>`;
  const act=p=>ready&&signed?`<button class="pill on" data-pbuy="${p.sku}">${won(p.price)}</button>`:`<button class="pill" disabled>${ready?"로그인 필요":"준비 중"}</button>`;
  return `<div class="plusps">${PASSES.map(p=>`<div class="pp${p.tag==="인기"?" hot":""}"><span class="tg">${p.tag}</span><b>${p.days}일</b><em>${won(p.price)}</em><small>${p.note||"부가세 포함"}</small>${act(p)}</div>`).join("")}</div>
  <p class="sub" style="font-size:12px">기간제 이용권이라 <b>자동으로 갱신되지 않아요</b>. 끝나기 전에 또 사면 남은 기간 뒤에 이어져요. 가격은 부가세 포함이에요. <a href="terms.html" target="_blank" rel="noopener">이용약관</a>${ready?"":" 결제는 곧 열려요."}</p>`;
}
function renderTab(){
  const el=document.getElementById("plusView"); if(!el) return;
  const plus=isPlus(), rk=weakRank(), why=window.__plusWhy; window.__plusWhy="";
  const ben=`<ul class="plusben"><li><b>맞춤 복습 무제한</b><span>자주 틀리는 단어만 골라서 퀴즈로 풀어요 (무료는 하루 1번)</span></li><li><b>심화 약점 분석</b><span>약한 단어 TOP 10, 급수별·품사별 약점, 자주 헷갈리는 오답 짝</span></li><li><b>앞으로 더해질 기능</b><span>시험 직전 총정리 같은 기능도 플러스에 먼저 들어가요</span></li></ul>`;
  const free=!plus&&freeUsed();
  el.innerHTML=`<div class="plustab"><div class="plushero${plus?" on":""}"><span class="plusbadge">PLUS</span><h2>술술 플러스</h2>
   <p>${plus?`이용 중이에요 · ${ymd(until())}까지 (${daysLeft()}일 남음)`:"내 약점을 찾아서, 거기에 맞춰 연습해요"}</p></div>
   <p class="sub" style="margin:0 2px 12px">단어·퀴즈·게임·문법·뉴스·모의시험은 <b>계속 무료</b>예요. 플러스는 공부를 더 깊게 도와주는 선택 기능이에요.</p>
   ${why==="weak"?`<p class="sub plusnote">오늘의 무료 체험(1번)을 썼어요. 내일 다시 체험하거나, 플러스로 무제한으로 쓸 수 있어요.</p>`:""}
   <div class="pluscta"><button class="pill on plusgo" data-plus="weak">${plus?"맞춤 복습 시작 · 약한 단어 10문제":free?"오늘 무료 체험은 끝났어요":"맞춤 복습 무료 체험 (하루 1번)"}</button>${rk.length<4?`<small>틀린 단어가 4개 이상 쌓이면 시작할 수 있어요</small>`:""}</div>
   ${plus?(statsHtml()||`<div class="panel plusp"><div class="sub">아직 분석할 오답이 없어요. 퀴즈를 풀면 여기에 약점이 쌓여요.</div></div>`):`${ben}<h3 class="plusst">이용권</h3>${passesHtml()}`}
   ${plus?`<h3 class="plusst">이용권 연장</h3>${passesHtml()}`:""}</div>`;
}
document.addEventListener("click",ev=>{ const b=ev.target.closest("[data-pbuy]"); if(b&&window.SEEDPAY) SEEDPAY.buy(b.dataset.pbuy,renderTab); });
document.addEventListener("click",e=>{ const b=e.target.closest("[data-plus]"); if(!b) return; e.preventDefault(); const k=b.dataset.plus; if(k==="weak") startWeak(); else open(); });
window.addEventListener("load",()=>{ setTimeout(sync,2500); });
window.PLUS={isPlus,open,startWeak,tileHtml,statsHtml,shopHtml,renderTab,sync,setUntil,PASSES};
})();
