/* 술술 일본어 · 앱 둘러보기 (처음 시작하는 사람용 튜토리얼)
   - 시작 안내(급수·목표)를 끝낸 직후 한 번만 나오고, 설정 > 더 보기 > 앱 둘러보기에서 다시 볼 수 있어요.
   - 한 화면에 눌러야 할 큰 버튼은 '다음' 하나. 건너뛰기는 작은 글씨예요. */
window.TOUR=(function(){
  const A=()=>window.APP, $=id=>document.getElementById(id);
  const STEPS=[
    {ic:"home",t:"홈에서 매일 5분",d:"오늘의 학습 카드에서 <b>[오늘 10문제 시작]</b>만 누르면 돼요. 매일 하면 연속 출석이 쌓여요."},
    {ic:"book",t:"학습: 단어·퀴즈·문법·뉴스",d:"단어 1만 개와 예문, 퀴즈, 문법 정리, 매일 올라오는 일본어 뉴스를 한곳에서 볼 수 있어요."},
    {ic:"target",t:"JLPT 모의시험",d:"문자·어휘, 문법, 독해, 청해를 실제 시험처럼 연습해요. 급수를 고르고 시작하면 돼요."},
    {ic:"game",t:"게임으로 외우기",d:"짝 맞추기, 워들, 끝말잇기, 떨어지는 단어. 놀다 보면 단어가 저절로 외워져요."},
    {ic:"star",t:"술술 플러스",d:"내가 자주 틀리는 단어만 골라 복습해 줘요. 하루 한 번은 무료로 체험할 수 있어요."},
    {ic:"user",t:"친구와 함께",d:"로그인하면 친구를 응원하고 주간 리그에도 참여해요. 게스트도 모든 학습은 쓸 수 있어요."}
  ];
  let i=0, after=null;
  const done=()=>{ try{ return !!LS.get("jp-tour-done",0); }catch(e){ return true; } };
  const mark=()=>{ try{ LS.set("jp-tour-done",1); }catch(e){} };
  function dlg(){
    let d=$("tourDlg");
    if(!d){ d=document.createElement("dialog"); d.id="tourDlg"; d.className="tour"; document.body.appendChild(d);
      d.addEventListener("click",e=>{ const b=e.target.closest("[data-tr]"); if(!b) return; const a=b.dataset.tr; if(a==="next"){ i++; i>=STEPS.length?finish():render(); } else if(a==="prev"){ i=Math.max(0,i-1); render(); } else if(a==="skip") finish(); });
      d.addEventListener("cancel",e=>{ e.preventDefault(); finish(); }); }
    return d;
  }
  function render(){
    const s=STEPS[i], last=i===STEPS.length-1;
    dlg().innerHTML=`<div class="trtop"><span class="trn">${i+1} / ${STEPS.length}</span><button type="button" class="trskip" data-tr="skip">${last?"닫기":"건너뛰기"}</button></div>
     <div class="tric" aria-hidden="true">${A().ic(s.ic)}</div>
     <h2>${s.t}</h2><p>${s.d}</p>
     <div class="trdots" aria-hidden="true">${STEPS.map((_,k)=>`<i class="${k===i?"on":""}"></i>`).join("")}</div>
     <div class="trbtns">${i>0?`<button type="button" class="trprev" data-tr="prev">이전</button>`:`<span></span>`}<button type="button" class="cta trnext" data-tr="next">${last?"시작하기":"다음"}</button></div>`;
  }
  function open(cb){ i=0; after=cb||null; const d=dlg(); render(); if(!d.open) d.showModal(); }
  function finish(){ mark(); const d=dlg(); if(d.open) d.close(); const f=after; after=null; if(f) setTimeout(f,250); }
  /* 처음이면 둘러보기를 보여 주고, 끝나면 다음 동작(cb)을 이어서 해요. 이미 봤으면 바로 cb */
  function maybe(cb){ if(done()){ if(cb) cb(); return; } open(cb); }
  return{open,maybe,done};
})();
