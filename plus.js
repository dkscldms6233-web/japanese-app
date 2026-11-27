/* 술술 플러스 — 공부를 더 깊게 도와주는 유료 이용권(기간제, 자동 갱신 없음).
 * 기본 공부(단어·퀴즈·게임·문법·뉴스·모의시험)는 계속 무료입니다. 플러스는 "내 약점을 알려 주고 거기에 맞춰 연습"하는 기능입니다.
 *  - 맞춤 복습: 자주 틀리는 단어만 골라서 퀴즈 (무료는 하루 1번 체험)
 *  - JLPT 합격 코치: 시험일 D-day · 하루 권장량 · 영역별 약점 · 시험 직전 총정리
 *  - 심화 분석: 약한 단어 TOP 10 · 급수별/품사별 약점 · 자주 헷갈리는 오답 짝
 * 이용 기간(plusUntil)은 서버(functions)만 쓸 수 있는 wallets/{uid} 문서에 있고, 앱은 읽기만 합니다.
 * 결제는 billing.js(토스 웹 결제)가 열릴 때까지 "준비 중"으로 보입니다. 플레이 앱 안에서는 구매 구역을 숨깁니다. */
(function(){
const A=()=>window.APP, E=s=>A().E(s);
const PASSES=[{sku:"plus_30",days:30,price:3300,tag:"가볍게"},{sku:"plus_180",days:180,price:15400,tag:"인기",note:"한 달 2,567원"},{sku:"plus_365",days:365,price:27500,tag:"시험 준비",note:"한 달 2,292원"}];
const won=n=>n.toLocaleString("ko-KR")+"원";
const uid=()=>{ try{ const u=A().cloud&&A().cloud.auth&&A().cloud.auth.currentUser; return u?u.uid:""; }catch(e){ return ""; } };
const KEY=()=>"jp-plus-until@"+uid();
const until=()=>{ try{ if(DEMO()) return Date.now()+30*864e5; return uid()?(+localStorage.getItem(KEY())||0):0; }catch(e){ return 0; } };
/* 내 컴퓨터(localhost)에서만: 주소 끝에 ?plusdemo=on 을 붙이면 플러스를 켠 화면을 시험해 볼 수 있습니다 (?plusdemo=off 로 끔). 배포된 사이트에서는 동작하지 않습니다. */
const DEMO=()=>{ try{ if(!/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return false; const q=new URLSearchParams(location.search).get("plusdemo"); if(q) sessionStorage.setItem("jp-plusdemo",q); return sessionStorage.getItem("jp-plusdemo")==="on"; }catch(e){ return false; } };
const devForce=()=>{ try{ return document.body.classList.contains("dev-on")&&localStorage.getItem("jp-plusdev")==="on"; }catch(e){ return false; } }; /* 개발자 모드에서만 화면 시험용으로 켤 수 있습니다 */
const isPlus=()=>DEMO()||devForce()||until()>Date.now();
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
  if(rk.length<4){ A().toast("아직 틀린 단어가 적습니다. 퀴즈를 조금 더 풀어 보세요."); return; }
  if(!isPlus()){ if(freeUsed()){ open("weak"); return; } try{ localStorage.setItem("jp-plus-free",today()); }catch(e){} }
  const pool=rk.slice(0,60).map(x=>x.w);
  A().setView("quiz"); A().setFrom("plus"); A().startQuiz("meaning",pool,10);
}

/* ---- 화면 조각 ---- */
function tileHtml(){ const used=!isPlus()&&freeUsed(); return `<button class="t2 c2" data-plus="weak"><span class="ti">${A().ic("target")}</span><b>맞춤 복습 <em class="plusbadge">PLUS</em></b><small>${isPlus()?"자주 틀리는 단어만 골라서 10문제":used?"오늘 무료 체험을 썼습니다 · 플러스는 무제한":"자주 틀리는 단어만 · 하루 1번 무료 체험"}</small></button>`; }
function statsHtml(){
  const rk=weakRank(), plus=isPlus(); if(!rk.length) return "";
  const rows=rk.slice(0,10).map(x=>`<div class="row" data-key="${x.w.key}"><span>${A().R(x.w.f)} <span class="sub">${E(x.w.ko)}</span></span><span class="sub">${x.n?x.n+"번 틀림":"복습 중"}</span></div>`).join("");
  let more="";
  if(plus){
    const lv={}, pg={}; rk.forEach(x=>{ lv[x.w.lv]=(lv[x.w.lv]||0)+x.v; const g=grp(x.w.pos); pg[g]=(pg[g]||0)+x.v; });
    const bar=(o,names)=>{ const t=Object.values(o).reduce((a,b)=>a+b,0)||1; return Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="wkbar"><span>${names?names[k]:k}</span><div><i style="width:${Math.round(v/t*100)}%"></i></div><b>${Math.round(v/t*100)}%</b></div>`).join(""); };
    const conf={}; A().wlog().slice(-120).forEach(x=>{ if(!x.p||!x.c||x.p===x.c) return; const k=x.p+"→"+x.c; conf[k]=(conf[k]||0)+1; });
    const cf=Object.entries(conf).sort((a,b)=>b[1]-a[1]).slice(0,4);
    more=`<h4 class="ph">급수별 약점</h4>${bar(lv)}<h4 class="ph">품사별 약점</h4>${bar(pg,GRP)}`+(cf.length?`<h4 class="ph">자주 헷갈린 짝 <small>(내가 고른 답 → 정답)</small></h4>${cf.map(([k,n])=>`<div class="pconf">${E(k.split("→")[0])} <b>→</b> ${E(k.split("→")[1])}<small>${n}번</small></div>`).join("")}`:"");
    return `<div class="panel plusp"><h3>내 약점 분석 <em class="plusbadge">PLUS</em></h3><div class="top5">${rows}</div>${more}<button class="pill on plusgo" data-plus="weak">약한 단어 10문제 풀기</button></div>`;
  }
  more=`<button class="plusup" data-plus="open"><b>내 약점 분석 보기</b><small>약한 단어 TOP 10 · 급수·품사별 약점 · 헷갈린 오답 짝</small><span class="plusbadge">PLUS</span></button>`;
  return `<div class="panel plusp">${more}<button class="pill on plusgo" data-plus="weak">약한 단어 10문제 풀기 <small>(하루 1번 무료)</small></button></div>`;
}
function shopHtml(){ return `<div class="seedpay plusrow"><b>술술 플러스</b><small>${isPlus()?`이용 중 · ${ymd(until())}까지 (${daysLeft()}일 남음)`:"내 약점을 찾아 주는 맞춤 복습·심화 분석"}</small><button class="pill on" data-plus="open">${isPlus()?"자세히":"알아보기"}</button></div>`; }


/* ---- JLPT 합격 코치 (플러스) ---- */
const LVS=["N5","N4","N3","N2","N1"];
const SECN={vocab:"문자·어휘",pair:"유의 표현",gram:"문법",read:"독해",listen:"청해"};
const PASS={N5:[80,180],N4:[90,180],N3:[95,180],N2:[90,180],N1:[100,180]};
const LSg=()=>A().LS;
const plan=()=>{ try{ return LSg().get("jp-jplan",{})||{}; }catch(e){ return {}; } };
const savePlan=o=>{ try{ LSg().set("jp-jplan",o); }catch(e){} };
const hist=()=>{ try{ return LSg().get("jp-jhist",[])||[]; }catch(e){ return []; } };
function recordExam(Q){ try{ if(!Q||!Q.by) return; const h=hist(); h.push({t:Date.now(),lv:Q.lv,by:Q.by,n:Q.items.length,c:Q.score}); LSg().set("jp-jhist",h.slice(-40)); }catch(e){} }
/* 홈 화면 D-day: 시험 날짜는 누구나 정할 수 있고(합격 코치와 같은 값), 날짜를 누르면 바꿀 수 있습니다 */
function ddayHtml(){
  const pl0=plan(), lv=LVS.includes(pl0.lv)?pl0.lv:((A().myLv()[0])||"N4"), today=new Date().toLocaleDateString("sv-SE");
  /* 날짜를 안 정했으면 다가오는 공식 시험일(한국 JLPT 2026년 제2회: 12월 6일, 출처 jlpt.jp·한국 실시위원회)을 보여 줍니다 */
  const OFFICIAL=["2026-12-06"], off=!pl0.date?OFFICIAL.find(d=>d>=today):"", pl={...pl0,date:pl0.date||off||""};
  let big, top, sub, cls="", pct=0;
  if(pl.date){ const d=Math.ceil((new Date(pl.date+"T00:00:00")-new Date(new Date().toDateString()))/864e5), md=(+pl.date.slice(5,7))+"월 "+(+pl.date.slice(8,10))+"일";
    if(d<0){ big="끝"; top="시험일이 지났습니다"; sub="눌러서 새 시험 날짜 정하기"; cls=" past"; }
    else { big=d===0?"D-DAY":"D-"+d; top="JLPT "+lv+" 시험까지"; sub=md+(off?" · 공식 시험일":"")+(d<=7&&d>0?" · 마무리 주간":""); cls=d<=7?" near":d<=30?" soon":""; pct=Math.max(4,Math.min(100,Math.round((1-d/100)*100))); } }
  else { big="날짜 설정"; top=""; sub="눌러서 날짜 고르기"; cls=" none"; }
  return `<label class="hdd${cls}" title="JLPT 시험까지 남은 날 (누르면 시험 날짜 바꾸기)"><span class="hdl">JLPT</span><span class="hdn">${big}</span><input type="date" id="hmDate" value="${pl.date||""}" min="${today}" aria-label="JLPT 시험 날짜 고르기"></label>`;
}
function renderDday(){ try{ const el=document.getElementById("hdDday"); if(el) el.innerHTML=ddayHtml(); }catch(e){} }

/* ---- 오늘의 맞춤 플랜: 약점 + 복습할 단어 + 새 단어(시험까지 남은 날에 맞춰 개수 조절) ---- */
function shuf(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function buildPlan(){
  const pl=plan(), lv=LVS.includes(pl.lv)?pl.lv:(A().myLv()[0]||"N4"), srs=LSg().get("jp-srs",{});
  const words=A().ALL.filter(w=>w.lv===lv), strong=w=>(srs[w.key]&&srs[w.key].b||0)>=3;
  const weak=weakRank().slice(0,6).map(x=>x.w), used=new Set(weak.map(w=>w.key));
  const review=shuf(words.filter(w=>srs[w.key]&&!strong(w)&&!used.has(w.key))).slice(0,4); review.forEach(w=>used.add(w.key));
  let per=5, dd=null; if(pl.date){ dd=Math.ceil((new Date(pl.date+"T00:00:00")-new Date(new Date().toDateString()))/864e5); const left=words.filter(w=>!strong(w)).length; if(dd>0) per=Math.min(15,Math.max(4,Math.ceil(left/dd))); }
  const fresh=shuf(words.filter(w=>!srs[w.key]&&!used.has(w.key))).slice(0,per);
  const pool=[...weak,...review,...fresh];
  return {lv,dd,weak:weak.length,review:review.length,fresh:fresh.length,pool,min:Math.max(3,Math.round(pool.length*0.5))};
}
function planHtml(){
  const b=buildPlan(); if(b.pool.length<4) return `<div class="panel plusp"><h3>오늘의 맞춤 플랜 <em class="plusbadge">PLUS</em></h3><div class="sub">단어를 조금 더 공부하면 플랜이 만들어집니다.</div></div>`;
  const why=b.dd!=null&&b.dd>0?`시험까지 ${b.dd}일 · 하루 새 단어 ${b.fresh}개 페이스로 맞췄습니다`:"시험 날짜를 정하면 새 단어 개수를 자동으로 맞춰 줍니다";
  return `<div class="panel plusp eplan"><h3>오늘의 맞춤 플랜 <em class="plusbadge">PLUS</em></h3>
   <div class="eplrow"><div><b>${b.weak}</b><small>약점 단어</small></div><div><b>${b.review}</b><small>다시 볼 단어</small></div><div><b>${b.fresh}</b><small>새 단어</small></div><div><b>${b.min}분</b><small>예상 시간</small></div></div>
   <p class="sub" style="margin:8px 0 10px">${why}</p><button type="button" class="pill on plusgo" data-pplan="go">플랜 시작 · ${b.lv} ${b.pool.length}문제</button></div>`;
}
function startPlan(){
  const b=buildPlan(); if(b.pool.length<4){ A().toast("단어가 부족해서 플랜을 만들 수 없습니다"); return; }
  A().setView("quiz"); A().setFrom("plus"); A().startQuiz("meaning",shuf(b.pool),Math.min(b.pool.length,20));
}
/* ---- 주간 학습 리포트: 이번 주 vs 지난주 ---- */
function weeklyHtml(){
  const log=LSg().get("jp-log",{}), ds=i=>new Date(Date.now()-i*864e5).toLocaleDateString("sv-SE");
  const sum=(from,to)=>{ let n=0,c=0,d=0; for(let i=from;i<to;i++){ const e=log[ds(i)]; if(e&&e.n>0){ n+=e.n; c+=e.c||0; d++; } } return {n,c,d,acc:n?Math.round(c/n*100):0}; };
  const tw=sum(0,7), lw=sum(7,14);
  if(!tw.n&&!lw.n) return `<div class="panel plusp"><h3>주간 학습 리포트 <em class="plusbadge">PLUS</em></h3><div class="sub">이번 주 학습 기록이 아직 없습니다. 오늘 10문제만 풀어도 리포트가 만들어집니다.</div></div>`;
  const dn=(a,b,u)=>{ const d=a-b; return d===0?"지난주와 같습니다":(d>0?`지난주보다 +${d}${u}`:`지난주보다 ${d}${u}`); };
  const top=weakRank().slice(0,3).map(x=>`<span class="ewk">${A().R(x.w.f)} <small>${E(x.w.ko)}</small></span>`).join("");
  const goal=Math.max(10,Math.min(60,Math.round((tw.n/Math.max(1,tw.d)||10)*1.2/5)*5));
  const days=[...Array(7)].map((_,k)=>{ const e=log[ds(6-k)], n=e&&e.n||0; return `<i style="height:${Math.min(100,8+n*3)}%" class="${n?"on":""}" title="${n}문제"></i>`; }).join("");
  return `<div class="panel plusp eweek"><h3>주간 학습 리포트 <em class="plusbadge">PLUS</em></h3>
   <div class="ewgrid"><div><b>${tw.n}</b><small>푼 문제 · ${dn(tw.n,lw.n,"개")}</small></div><div><b>${tw.acc}%</b><small>정답률 · ${dn(tw.acc,lw.acc,"%p")}</small></div><div><b>${tw.d}일</b><small>학습한 날 · ${dn(tw.d,lw.d,"일")}</small></div></div>
   <div class="ewbars" aria-hidden="true">${days}</div>
   ${top?`<h4 class="ph">이번 주 약점 TOP 3</h4><div class="ewks">${top}</div>`:""}
   <p class="sub" style="margin:10px 0 0">다음 주 목표: <b>하루 ${goal}문제</b>${tw.acc<70?" · 정답률 70%를 먼저 노려 보세요":""}</p></div>`;
}
function coachHtml(){
  const pl=plan(), lv=LVS.includes(pl.lv)?pl.lv:(A().myLv()[0]||"N4"), words=A().ALL.filter(w=>w.lv===lv);
  const srs=LSg().get("jp-srs",{}); const learned=words.filter(w=>srs[w.key]).length, strong=words.filter(w=>(srs[w.key]&&srs[w.key].b||0)>=3).length;
  const pct=words.length?Math.round(strong/words.length*100):0;
  let dd="";
  if(pl.date){ const d=Math.ceil((new Date(pl.date+"T00:00:00")-new Date(new Date().toDateString()))/864e5);
    if(d<0) dd=`<div class="cdd"><b>시험일이 지났습니다</b><span>새 시험 날짜를 골라 주세요</span></div>`;
    else { const left=Math.max(0,words.length-strong), per=d>0?Math.ceil(left/d):left; dd=`<div class="cdd"><b>${d===0?"오늘이 시험일!":"D-"+d}</b><span>${pl.date.replace(/-/g,".")} · ${lv}</span></div><p class="sub cplan">${left?`아직 익히지 못한 단어가 <b>${left}개</b> 남았습니다. 하루 <b>${per}개</b>씩이면 시험일까지 다 익힐 수 있습니다.`:"이 급수 단어를 모두 익혔습니다! 모의시험으로 실전 감각을 올려 보세요."}</p>`; } }
  const hs=hist().filter(x=>x.lv===lv).slice(-5), sec={};
  hs.forEach(x=>Object.entries(x.by||{}).forEach(([k,v])=>{ const o=sec[k]||(sec[k]={n:0,c:0}); o.n+=v.n; o.c+=v.c; }));
  const rows=Object.keys(SECN).filter(k=>sec[k]).map(k=>({k,r:Math.round(sec[k].c/sec[k].n*100)})).sort((a,b)=>a.r-b.r);
  const avg=hs.length?Math.round(hs.reduce((a,x)=>a+x.c,0)/Math.max(1,hs.reduce((a,x)=>a+x.n,0))*100):null;
  const weak=rows[0], pass=PASS[lv];
  const exam=hs.length?`<h4 class="ph">최근 모의시험 ${hs.length}회 <small>· 평균 정답률 ${avg}%</small></h4>${rows.map(r=>`<div class="wkbar"><span>${SECN[r.k]}</span><div><i style="width:${r.r}%"></i></div><b>${r.r}%</b></div>`).join("")}
    ${weak?`<button class="pill on plusgo" data-pcoach="sec" data-lv="${lv}" data-s="${weak.k}">가장 약한 「${SECN[weak.k]}」 집중 연습</button>`:""}`
    :`<p class="sub">${lv} 모의시험을 풀면 영역별 정답률이 여기에 쌓입니다.</p>`;
  return `<div class="panel plusp coach"><h3>JLPT 합격 코치 <em class="plusbadge">PLUS</em></h3>
   <div class="cset"><span>목표 급수</span><div class="clv">${LVS.map(l=>`<button class="pill${l===lv?" on":""}" data-pcoach="lv" data-lv="${l}">${l}</button>`).join("")}</div></div>
   <div class="cset"><span>시험 날짜</span><input type="date" id="pcDate" value="${pl.date||""}" aria-label="시험 날짜"></div>
   ${dd}
   <h4 class="ph">${lv} 단어 진행률 <small>· 오래 기억한 단어 ${strong} / ${words.length}개 (${pct}%) · 공부한 단어 ${learned}개</small></h4><div class="prog"><div style="width:${pct}%"></div></div>
   ${exam}
   <h4 class="ph">시험 직전 총정리</h4><p class="sub" style="margin:0 0 8px">${lv} 단어 중 내가 자주 틀린 것만 모아 20문제로 마지막 점검을 합니다.</p><button class="pill on plusgo" data-pcoach="final" data-lv="${lv}">${lv} 총정리 20문제</button>
   <p class="sub cnote">참고: 실제 ${lv} 합격은 총점 ${pass[1]}점 중 ${pass[0]}점 이상이고, 영역별로 19점(60점 만점) 미만이면 과락입니다. 이 앱 모의시험은 직접 만든 연습 문제라 정답률이 계속 60% 이상이면 안정권으로 보세요.</p></div>`;
}
document.addEventListener("click",e=>{ const b=e.target.closest("[data-pcoach]"); if(!b) return; const k=b.dataset.pcoach, lv=b.dataset.lv;
  if(k==="lv"){ const p=plan(); p.lv=lv; savePlan(p); A().setJl(lv); renderTab(); }
  else if(k==="sec"){ A().setJl(lv); A().setView("exam"); A().setFrom("plus"); A().jStart(b.dataset.s); }
  else if(k==="final"){ const pool=weakRank().filter(x=>x.w.lv===lv).map(x=>x.w); if(pool.length<4){ A().toast(lv+" 단어 중 틀린 기록이 아직 적습니다. 퀴즈를 더 풀어 보세요."); return; } A().setView("quiz"); A().setFrom("plus"); A().startQuiz("meaning",pool.slice(0,40),20); } });
document.addEventListener("change",e=>{ if(e.target&&e.target.id==="hmDate"){ const p=plan(); p.date=e.target.value; if(!p.lv) p.lv=(A().myLv()[0]||"N4"); savePlan(p); try{ A().renderHome(); }catch(x){} renderDday(); return; } if(e.target&&e.target.id==="pcDate"){ const p=plan(); p.date=e.target.value; if(!p.lv) p.lv=(A().myLv()[0]||"N4"); savePlan(p); renderTab(); } });

/* ---- 플러스 탭 (하단 메뉴) ---- */
function open(why){ try{ document.querySelectorAll("dialog[open]").forEach(d=>d.close()); }catch(e){} try{ window.__plusWhy=why||""; }catch(e){} A().setView("plus"); }
function passesHtml(){
  const SP=window.SEEDPAY, inPlay=(()=>{ try{ return sessionStorage.getItem("jp-twa")==="1"; }catch(e){ return false; } })();
  const ready=SP&&SP.ready&&SP.ready(), signed=!!uid();
  if(inPlay) return `<p class="sub">플레이스토어 앱에서는 구매를 지원하지 않습니다. 웹(surasura-nihongo.web.app)에서 가능합니다.</p>`;
  const act=p=>ready&&signed?`<button class="pill on" data-pbuy="${p.sku}">${won(p.price)}</button>`:`<button class="pill" disabled>${ready?"로그인 필요":"준비 중"}</button>`;
  return `<div class="plusps">${PASSES.map(p=>`<div class="pp${p.tag==="인기"?" hot":""}"><span class="tg">${p.tag}</span><b>${p.days}일</b><em>${won(p.price)}</em><small>${p.note||"부가세 포함"}</small>${act(p)}</div>`).join("")}</div>
  <p class="sub" style="font-size:12px">기간제 이용권이라 <b>자동으로 갱신되지 않습니다</b>. 끝나기 전에 또 사면 남은 기간 뒤에 이어집니다. 가격은 부가세 포함입니다. <a href="terms.html" target="_blank" rel="noopener">이용약관</a>${ready?"":" 결제는 곧 열립니다."}</p>`;
}
function renderTab(){
  const el=document.getElementById("plusView"); if(!el) return;
  const plus=isPlus(), rk=weakRank(), why=window.__plusWhy; window.__plusWhy="";
  /* 아이콘: Lucide (ISC 라이선스, img/icons/LICENSE-lucide.txt) */
  const BEN=[['<svg class="pic" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"/><path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"/><path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"/></svg>',"합격 코치","시험 날짜를 정하면, 하루에 몇 개씩 익히면 되는지 계산해 줍니다"],['<svg class="pic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',"영역별 분석","모의시험에서 어디가 약한지 알려 주고, 약한 영역만 집중 연습합니다"],['<svg class="pic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/></svg>',"직전 총정리","자주 틀린 단어만 모아 20문제로 마지막 점검을 합니다"],['<svg class="pic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8"/></svg>',"맞춤 복습 무제한","내 약점 단어만 골라 연습하고, 급수별·품사별 약점도 봅니다"],['<svg class="pic" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="m9 15 2 2 4-4"/></svg>','오늘의 맞춤 플랜','약점·복습·새 단어를 시험까지 남은 날에 맞춰 10분 분량으로 짜 줍니다'],['<svg class="pic" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>','주간 학습 리포트','이번 주 정답률 변화와 약점 TOP, 다음 주 목표를 알려 줍니다'],['<svg class="pic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>','실전 시험지 모드','실제 시험 시간표대로, 표지·교시·제한 시간·종이 넘기기까지 모의시험을 시험지로 풉니다']];
  /* 혜택이 많아져서: 위에는 대표 3가지를 방울로, 아래에는 모든 기능을 묶음별 목록으로 */
  const TOP=[0,4,6], CAP={0:"D-day 맞춤 학습",4:"10분 맞춤 플랜",6:"진짜 시험처럼"}, GROUPS=[["시험 준비",[0,2,6]],["내 약점 공부",[1,3,4,5]]];
  const row=i=>`<details class="plrow"><summary><span class="plic">${BEN[i][0]}</span><b>${BEN[i][1]}</b><span class="plch" aria-hidden="true"></span></summary><p>${BEN[i][2]}</p></details>`;
  const ben=`<div class="plusstage"><i class="psp pa1"></i><i class="psp pa2"></i><i class="psp pa3"></i><i class="psp pa4"></i><i class="psp pa5"></i><h3 class="pstt">플러스, 이렇게 달라집니다</h3><div class="pbubs pb3">${TOP.map(i=>`<div class="pcell"><div class="pbub"><span class="pi">${BEN[i][0]}</span><b>${BEN[i][1]}</b></div><p>${CAP[i]}</p></div>`).join("")}</div></div>
   <div class="pllist"><h4 class="plhd">플러스 기능 ${BEN.length}가지 <small>누르면 설명이 나옵니다</small></h4>${GROUPS.map(([g,ids])=>`<h5 class="plgh">${g}</h5>${ids.map(row).join("")}`).join("")}</div>`;
  const free=!plus&&freeUsed();
  el.innerHTML=`<div class="plustab"><div class="plushero${plus?" on":""}"><span class="plusbadge">PLUS</span><h2>술술 플러스</h2>
   <p>${plus?`이용 중입니다 · ${ymd(until())}까지 (${daysLeft()}일 남음)`:"JLPT 합격까지, 내 약점에 맞춰 연습합니다"}</p></div>
   <p class="sub" style="margin:0 2px 12px">단어·퀴즈·게임·문법·뉴스·모의시험은 <b>계속 무료</b>입니다. 플러스는 JLPT 합격 준비를 더 깊게 도와주는 선택 기능입니다.</p>
   ${why==="paper"?`<p class="sub plusnote">모의시험 <b>시험지 모드</b>는 플러스 기능입니다. 플러스를 시작하면 실제 시험처럼 교시별 시간표와 종이 넘기기로 풀 수 있습니다. 연습 모드는 계속 무료입니다.</p>`:""}${why==="weak"?`<p class="sub plusnote">오늘의 무료 체험(1번)을 썼습니다. 내일 다시 체험하거나, 플러스로 무제한으로 쓸 수 있습니다.</p>`:""}
   <div class="pluscta"><button class="pill on plusgo" data-plus="weak">${plus?"맞춤 복습 시작 · 약한 단어 10문제":free?"오늘 무료 체험은 끝났습니다":"맞춤 복습 무료 체험 (하루 1번)"}</button>${rk.length<4?`<small>틀린 단어가 4개 이상 쌓이면 시작할 수 있습니다</small>`:""}</div>
   ${plus?(planHtml()+weeklyHtml()+coachHtml()+(statsHtml()||`<div class="panel plusp"><div class="sub">아직 분석할 오답이 없습니다. 퀴즈를 풀면 여기에 약점이 쌓입니다.</div></div>`)):`${ben}<h3 class="plusst">이용권</h3>${passesHtml()}`}
   ${plus?`<h3 class="plusst">이용권 연장</h3>${passesHtml()}`:""}</div>`;
}
document.addEventListener("click",e=>{ const b=e.target.closest("[data-pplan]"); if(b){ e.preventDefault(); startPlan(); } });
document.addEventListener("click",ev=>{ const b=ev.target.closest("[data-pbuy]"); if(b&&window.SEEDPAY) SEEDPAY.buy(b.dataset.pbuy,renderTab); });
document.addEventListener("click",e=>{ const b=e.target.closest("[data-plus]"); if(!b) return; e.preventDefault(); const k=b.dataset.plus; if(k==="weak") startWeak(); else open(); });
window.addEventListener("load",()=>{ setTimeout(sync,2500); });
window.PLUS={ddayHtml,renderDday,isPlus,open,startWeak,tileHtml,statsHtml,shopHtml,renderTab,recordExam,sync,setUntil,PASSES};
})();
