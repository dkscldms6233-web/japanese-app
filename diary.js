/* 공부 다이어리: 공부한 날마다 스티커가 붙는 달력
 * - 공부 기록(jp-log, 날짜 → {n:푼 문제})을 읽어서 푼 날에 스티커를 붙여 줘요. 기록이 있던 날은 지난 달도 채워져 있어요.
 * - 스티커 그림은 날짜로 정해져서(저장 안 함) 같은 날은 항상 같은 스티커예요.
 * - 홈에는 이번 주 칸을, 전체 보기에는 한 달 달력을 보여 줘요. 기록 키: jp-dia-seen(오늘 스티커를 이미 보여 줬는지)
 */
(function(){
const A=()=>window.APP;
const E=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const P=(d)=>`<svg viewBox="0 0 24 24" width="62%" height="62%" aria-hidden="true">${d}</svg>`;
/* 스티커 팩: 팩마다 6종 [색, 그림] (흰 그림이 잘 보이는 진한 색) */
const PACKS={
 basic:{name:"기본 팩",price:0,st:[
  ["#d9577a",P('<path fill="#fff" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>')],
  ["#4f86c6",P('<path fill="#fff" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>')],
  ["#d99a2b",P('<g fill="#fff"><circle cx="12" cy="6.5" r="3.3"/><circle cx="17.3" cy="10.4" r="3.3"/><circle cx="15.3" cy="16.6" r="3.3"/><circle cx="8.7" cy="16.6" r="3.3"/><circle cx="6.7" cy="10.4" r="3.3"/></g><circle cx="12" cy="12" r="2.6" fill="#d99a2b"/>')],
  ["#3e8e6a",P('<path fill="#fff" d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z"/><path d="M5 19l7-7" stroke="#3e8e6a" stroke-width="1.6" fill="none"/>')],
  ["#7b72c9",P('<path fill="#fff" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>')],
  ["#d9704f",P('<path fill="#fff" d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 9.5 4.3 4.3 0 0 1 17 18z"/>')]]},
 blossom:{name:"벚꽃 팩",price:120,st:[
  ["#d9577a",P('<g fill="#fff"><circle cx="12" cy="6.5" r="3.3"/><circle cx="17.3" cy="10.4" r="3.3"/><circle cx="15.3" cy="16.6" r="3.3"/><circle cx="8.7" cy="16.6" r="3.3"/><circle cx="6.7" cy="10.4" r="3.3"/></g><circle cx="12" cy="12" r="2.4" fill="#d9577a"/>')],
  ["#c74b86",P('<g fill="#fff"><circle cx="12" cy="6.2" r="3.6"/><circle cx="17.8" cy="12" r="3.6"/><circle cx="12" cy="17.8" r="3.6"/><circle cx="6.2" cy="12" r="3.6"/></g><circle cx="12" cy="12" r="2.2" fill="#c74b86"/>')],
  ["#e0678a",P('<path fill="#fff" d="M12 20C6 20 6 11 6 8c3 1 4.500 1 6-1 1.500 2 3 2 6 1 0 3 0 12-6 12z"/>')],
  ["#b84a78",P('<g fill="#fff"><circle cx="12" cy="7.800" r="3.800"/><circle cx="8" cy="14.500" r="3.800"/><circle cx="16" cy="14.500" r="3.800"/></g>')],
  ["#d96c8a",P('<ellipse cx="12" cy="12" rx="4.200" ry="8.200" transform="rotate(35 12 12)" fill="#fff"/>')],
  ["#cf5a74",P('<circle cx="12" cy="9" r="4.500" fill="#fff"/><path d="M12 13.500v7M12 17.500l-3-2M12 16l3-2" stroke="#fff" stroke-width="1.800" stroke-linecap="round" fill="none"/>')]]},
 sky:{name:"하늘 팩",price:120,st:[
  ["#e0a82e",P('<circle cx="12" cy="12" r="4.500" fill="#fff"/><g stroke="#fff" stroke-width="1.800" stroke-linecap="round" fill="none"><path d="M12 2.500v3M12 18.500v3M2.500 12h3M18.500 12h3M5.300 5.300l2.100 2.100M16.600 16.600l2.100 2.100M18.700 5.300l-2.100 2.100M7.400 16.600l-2.100 2.100"/></g>')],
  ["#4f86c6",P('<path fill="#fff" d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>')],
  ["#3a9bb8",P('<g stroke="#fff" stroke-width="1.800" stroke-linecap="round" fill="none"><path d="M12 3v18M4.200 7.500l15.600 9M4.200 16.500l15.600-9"/></g>')],
  ["#7b72c9",P('<g fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round"><path d="M4 17a8 8 0 0 1 16 0"/><path d="M7.200 17a4.800 4.800 0 0 1 9.600 0"/></g>')],
  ["#6f8fd8",P('<path fill="#fff" d="M13 2L5 13h6l-1 9 8-11h-6z"/>')],
  ["#3e8e6a",P('<path fill="#fff" d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v6a2 2 0 0 0 4 0" stroke="#fff" stroke-width="1.800" fill="none"/>')]]}
};
/* 표지: 홈 카드와 달력 바탕 */
const COVERS={basic:{name:"기본",price:0},paper:{name:"종이",price:0},blossom:{name:"벚꽃",price:80},night:{name:"밤하늘",price:80}};
const KEY="jp-dia-deco";
const deco=()=>{ try{ const d=A().LS.get(KEY,null)||{}; return {cover:d.cover||"basic",pack:d.pack||"basic",own:Array.isArray(d.own)?d.own:[]}; }catch(e){ return {cover:"basic",pack:"basic",own:[]}; } };
const saveDeco=d=>{ try{ A().LS.set(KEY,d); }catch(e){} };
const owns=(d,id)=>PACKS[id]&&PACKS[id].price===0||COVERS[id]&&COVERS[id].price===0||d.own.includes(id);
const ST=()=>PACKS[deco().pack]?PACKS[deco().pack].st:PACKS.basic.st;
const pad=n=>String(n).padStart(2,"0");
const ds=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const hash=s=>{ let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; };
const sticker=d=>{ const S=ST(); return S[hash(d)%S.length]; };
const log=()=>{ try{ return A().LS.get("jp-log",{})||{}; }catch(e){ return {}; } };
const studied=(d,L)=>{ const e=(L||log())[d]; return !!(e&&e.n>0); };
const todayS=()=>ds(new Date());
const stk=(d,cls)=>{ const [c,svg]=sticker(d); return `<span class="dst ${cls||""}" style="background:${c}">${svg}</span>`; };
const DOW=["월","화","수","목","금","토","일"];
function monday(d){ const x=new Date(d); x.setHours(12); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x; }
function monthCount(y,m,L){ let n=0; const last=new Date(y,m+1,0).getDate(); for(let i=1;i<=last;i++) if(studied(y+"-"+pad(m+1)+"-"+pad(i),L)) n++; return n; }

/* ---------- 홈 카드: 이번 주 ---------- */
function cardHtml(){
  const L=log(), t=todayS(), got=studied(t,L), now=new Date(), mon=monday(now), cells=[];
  for(let i=0;i<7;i++){ const d=new Date(mon); d.setDate(mon.getDate()+i); const s=ds(d), isT=s===t, on=studied(s,L), fut=s>t;
    cells.push(`<div class="dwk${isT?" t":""}"><i>${on?stk(s,isT&&got&&!shown()?"new":""):`<span class="dst none${isT?" today":""}">${isT?"?":""}</span>`}</i><b>${DOW[i]}</b></div>`); }
  const n=monthCount(now.getFullYear(),now.getMonth(),L);
  setTimeout(markShown,1200);
  const G=window.PATH&&PATH.giftInfo?PATH.giftInfo():null;
  let foot=`<p class="dmsg">${got?"오늘 스티커를 받았어요! 내일도 만나요":"오늘 공부하면 스티커를 받아요"}</p>`;
  if(G){
    if(G.pending) foot=`<div class="dgiftrow"><span>7일 연속 달성! 선물이 도착했어요</span><button type="button" class="dgift" data-gift="open">선물 받기</button></div>`;
    else { const left=Math.max(0,7-G.pos); foot=`<div class="dgoal"><div class="dgt"><span>${got?"오늘 스티커를 받았어요!":"오늘 공부하면 스티커를 받아요"}</span><b>${G.pos>=7?"선물 완주":"선물까지 "+left+"일"}</b></div><div class="dgbar"><i style="width:${Math.min(100,G.pos/7*100).toFixed(0)}%"></i></div></div>`; }
    if(G.titles) foot+=`<button type="button" class="dtit" data-gift="box">내 칭호 모음 ${G.titles}개 ›</button>`;
  }
  const streakChip=G&&G.s>0?`<span class="dstreak">연속 ${G.s}일</span>`:"";
  return `<section class="h2dia" data-cover="${deco().cover}"><div class="dhd"><b>공부 다이어리</b>${streakChip}<button type="button" class="dmore" data-dia="open">${now.getMonth()+1}월 스티커 ${n}장 ›</button></div>
   <div class="dweek">${cells.join("")}</div>${foot}</section>`;
}
const shown=()=>{ try{ return localStorage.getItem("jp-dia-seen")===todayS(); }catch(e){ return false; } };
function markShown(){ try{ if(studied(todayS())) localStorage.setItem("jp-dia-seen",todayS()); }catch(e){} }

/* ---------- 전체 보기: 한 달 달력 ---------- */
let vy,vm,decoOpen=false;
function dlg(){ let d=document.getElementById("diaDlg"); if(!d){ d=document.createElement("dialog"); d.id="diaDlg"; document.body.appendChild(d);
  d.addEventListener("click",e=>{ if(e.target===d||e.target.closest("[data-diax]")){ d.close(); return; } if(e.target.closest("[data-diaco]")){ decoOpen=!decoOpen; paint(); return; }
    const cv=e.target.closest("[data-diacover]"); if(cv){ pick("cover",cv.dataset.diacover); return; }
    const pk=e.target.closest("[data-diapack]"); if(pk){ pick("pack",pk.dataset.diapack); return; }
    const mv=e.target.closest("[data-diam]"); if(mv){ vm+=+mv.dataset.diam; if(vm<0){ vm=11; vy--; } if(vm>11){ vm=0; vy++; } paint(); } }); }
  return d; }
function pick(kind,id){
  const D=deco(), item=(kind==="cover"?COVERS:PACKS)[id]; if(!item) return;
  if(!owns(D,id)){
    let ok=false; try{ ok=PATH.gift.spendSeeds(item.price); }catch(e){}
    if(!ok){ try{ A().toast("씨앗이 모자라요. 공부하면 씨앗을 모을 수 있어요"); }catch(e){} return; }
    D.own.push(id); try{ A().toast(item.name+"을 샀어요!"); }catch(e){}
  }
  D[kind]=id; saveDeco(D); paint(); try{ A().renderHome(); }catch(e){}
}
function streak(){ try{ return A().streakDays(); }catch(e){ return 0; } }
function paint(){
  const d=dlg(), L=log(), t=todayS(), first=new Date(vy,vm,1), lead=(first.getDay()+6)%7, last=new Date(vy,vm+1,0).getDate(), cells=[];
  for(let i=0;i<lead;i++) cells.push('<div class="dday"></div>');
  for(let i=1;i<=last;i++){ const s=vy+"-"+pad(vm+1)+"-"+pad(i), on=studied(s,L), isT=s===t;
    cells.push(`<div class="dday${isT?" t":""}">${on?stk(s,""):`<span class="dst none${isT?" today":""}">${i}</span>`}</div>`); }
  const n=monthCount(vy,vm,L), isNow=vy===new Date().getFullYear()&&vm===new Date().getMonth(), D=deco();
  const seeds=()=>{ try{ return PATH.gift.seeds(); }catch(e){ return 0; } };
  const coverRow=Object.entries(COVERS).map(([id,c])=>{ const own=owns(D,id), on=D.cover===id; return `<button type="button" class="dco${on?" on":""}" data-diacover="${id}"><span class="dcsw" data-cover="${id}"></span><b>${c.name}</b><small>${on?"사용 중":own?"사용":"씨앗 "+c.price}</small></button>`; }).join("");
  const packRow=Object.entries(PACKS).map(([id,p])=>{ const own=owns(D,id), on=D.pack===id; return `<button type="button" class="dpk${on?" on":""}" data-diapack="${id}"><span class="dpks">${p.st.slice(0,4).map(x=>`<span class="dst" style="background:${x[0]}">${x[1]}</span>`).join("")}</span><span class="dpkt"><b>${p.name}</b><small>스티커 6종</small></span><em>${on?"사용 중":own?"사용":"씨앗 "+p.price}</em></button>`; }).join("");
  const decoPanel=decoOpen?`<div class="ddeco"><div class="ddh"><b>꾸미기</b><span class="dseed">씨앗 ${seeds()}개</span></div><p class="dlab">표지</p><div class="dcos">${coverRow}</div><p class="dlab">스티커 팩</p><div class="dpks2">${packRow}</div><p class="sub" style="margin:8px 2px 0;font-size:12px">씨앗은 공부하고 연속 출석·주간 리그로 모을 수 있어요</p></div>`:"";
  d.innerHTML=`<div class="dh"><h2 style="margin:0">공부 다이어리</h2><button class="x" data-diax aria-label="닫기">×</button></div>
   <div class="db"><div class="dnav"><button type="button" data-diam="-1" aria-label="지난 달">‹</button><b>${vy}년 ${vm+1}월</b><button type="button" data-diam="1" aria-label="다음 달" ${isNow?"disabled":""}>›</button></div>
   <div class="dcal" data-cover="${D.cover}"><div class="ddow">${DOW.map(x=>`<span>${x}</span>`).join("")}</div><div class="dgrid">${cells.join("")}</div></div>
   <div class="dsum"><div><b>${n}장</b><span>이 달 스티커</span></div><div><b>${streak()}일</b><span>연속 공부</span></div></div>
   <button type="button" class="dcobtn${decoOpen?" on":""}" data-diaco>${decoOpen?"꾸미기 닫기":"꾸미기"}</button>${decoPanel}
   <p class="sub" style="margin:10px 2px 0;text-align:center">그날 문제를 하나라도 풀면 스티커가 붙어요</p></div>`;
}
function open(){ const n=new Date(); vy=n.getFullYear(); vm=n.getMonth(); decoOpen=false; paint(); const d=dlg(); if(!d.open) d.showModal(); }
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-dia=open]"); if(b){ e.preventDefault(); open(); } });
window.DIARY={cardHtml,open};
})();
