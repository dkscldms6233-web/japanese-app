/* 술술 일본어 · 앱 둘러보기 (처음 시작하는 사람용, 직접 눌러 보며 배우는 안내)
   - 실제 앱 화면 위에 화살표 말풍선이 뜨고, 가리키는 버튼을 직접 눌러 보면서 다음 단계로 넘어가요.
   - 시작 안내(급수·목표)를 끝낸 직후 한 번만 나오고, 설정 > 더 보기 > 앱 둘러보기에서 다시 볼 수 있어요.
   - '다음' 단계는 화면 전체를 어둡게 하고, '눌러 보세요' 단계는 가리키는 버튼만 눌리게 해요. */
window.TOUR=(function(){
  const A=()=>window.APP;
  const nav=v=>()=>document.querySelector(`#views .vb[data-view="${v}"]`);
  const STEPS=[
    {t:()=>document.querySelector(".h2hero .cta")||document.querySelector(".h2begin"),tx:"매일 이 버튼으로 오늘의 학습을 시작해요. 하루 5분이면 충분해요.",mode:"next"},
    {t:nav("list"),tx:"아래 <b>학습</b> 탭을 눌러 보세요.",mode:"tap"},
    {t:()=>document.getElementById("subtabs"),tx:"단어장·퀴즈·문법·뉴스를 여기서 골라요.",mode:"next"},
    {t:nav("exam"),tx:"<b>모의시험</b>도 눌러 보세요. JLPT처럼 연습할 수 있어요.",mode:"tap"},
    {t:nav("game"),tx:"<b>게임</b>을 눌러 보세요. 놀면서 단어를 외워요.",mode:"tap"},
    {t:nav("plus"),tx:"<b>플러스</b>에서는 내가 자주 틀리는 단어만 골라 복습해 줘요.",mode:"tap"},
    {t:nav("home"),tx:"마지막으로 <b>홈</b>을 눌러 돌아와요. 매일 5분, 같이 해요!",mode:"tap"}
  ];
  let i=-1, after=null, els=null, timer=null, busy=false;
  const done=()=>{ try{ return !!LS.get("jp-tour-done",0); }catch(e){ return true; } };
  const mark=()=>{ try{ LS.set("jp-tour-done",1); }catch(e){} };
  const cur=()=>STEPS[i];
  function build(){
    if(els) return;
    const mk=(c)=>{ const d=document.createElement("div"); d.className=c; document.body.appendChild(d); return d; };
    els={sh:mk("tr-sh"),ring:mk("tr-ring"),tip:mk("tr-tip")};
    els.tip.addEventListener("click",e=>{ const b=e.target.closest("[data-tr]"); if(!b) return; if(b.dataset.tr==="next") go(i+1); else if(b.dataset.tr==="skip") finish(); });
    document.addEventListener("click",onTap,true);
    window.addEventListener("resize",place); window.addEventListener("scroll",place,true);
    timer=setInterval(place,250);
  }
  function onTap(e){
    if(!els||busy) return; const s=cur(); if(!s||s.mode!=="tap") return;
    const t=s.t(); if(t&&t.contains(e.target)){ busy=true; setTimeout(()=>{ busy=false; go(i+1); },650); }
  }
  function go(n){
    if(n>=STEPS.length){ finish(true); return; }
    i=n; let tries=0;
    const show=()=>{ const s=cur(), t=s&&s.t(); if(!t||!t.offsetParent){ if(++tries<6){ setTimeout(show,200); return; } go(i+1); return; }
      try{ t.scrollIntoView({block:"center",inline:"nearest"}); }catch(e){}
      render(); place(); };
    show();
  }
  function render(){
    const s=cur(), last=i===STEPS.length-1;
    els.tip.innerHTML=`<div class="tr-row"><span class="tr-n">${i+1} / ${STEPS.length}</span><button type="button" class="tr-skip" data-tr="skip">건너뛰기</button></div>
      <p>${s.tx}</p>
      ${s.mode==="next"?`<button type="button" class="cta tr-next" data-tr="next">다음</button>`:`<div class="tr-hint">${last?"홈 버튼을 눌러 주세요":"반짝이는 버튼을 눌러 보세요"}</div>`}`;
  }
  function place(){
    if(!els||i<0) return; const s=cur(); if(!s) return; const t=s.t(); if(!t||!t.offsetParent) return;
    const r=t.getBoundingClientRect(), pad=6, W=innerWidth, H=innerHeight;
    const x=Math.max(2,r.left-pad), y=Math.max(2,r.top-pad), w=Math.min(W-4,r.width+pad*2), h=r.height+pad*2;
    const rad=getComputedStyle(t).borderRadius||"12px";
    Object.assign(els.ring.style,{left:x+"px",top:y+"px",width:w+"px",height:h+"px",borderRadius:rad});
    if(s.mode==="tap") els.sh.style.clipPath=`polygon(0 0,${W}px 0,${W}px ${H}px,0 ${H}px,0 0,${x}px ${y}px,${x}px ${y+h}px,${x+w}px ${y+h}px,${x+w}px ${y}px,${x}px ${y}px)`;
    else els.sh.style.clipPath="none";
    const tip=els.tip, tw=Math.min(W-28,330); tip.style.width=tw+"px";
    const th=tip.offsetHeight, below=(y+h+th+22)<H-8, ax=x+w/2;
    const left=Math.min(Math.max(14,ax-tw/2),W-tw-14);
    tip.style.left=left+"px"; tip.style.top=(below?y+h+14:Math.max(8,y-th-14))+"px";
    tip.className="tr-tip "+(below?"up":"down"); tip.style.setProperty("--ax",Math.min(Math.max(22,ax-left),tw-22)+"px");
  }
  function open(cb){
    if(els) return; after=cb||null; i=-1;
    try{ A().setView("home"); }catch(e){}
    setTimeout(()=>{ build(); go(0); },400);
  }
  function finish(ok){
    clearInterval(timer); timer=null; document.removeEventListener("click",onTap,true);
    window.removeEventListener("resize",place); window.removeEventListener("scroll",place,true);
    if(els){ els.sh.remove(); els.ring.remove(); els.tip.remove(); els=null; }
    i=-1; mark(); if(ok){ try{ A().toast("둘러보기 끝! 오늘 첫 학습을 시작해 볼까요?"); }catch(e){} }
    const f=after; after=null; if(f) setTimeout(f,300);
  }
  function maybe(cb){ if(done()){ if(cb) cb(); return; } open(cb); }
  return{open,maybe,done};
})();
