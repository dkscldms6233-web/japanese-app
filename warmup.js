/* 술술 일본어 · 첫 시작 놀이 "카드 뒤집기 짝 맞추기" (2026-11-22)
   - 완전히 처음 시작하는 사람이 시작 안내(급수·목표 선택)를 끝낸 직후, 딱 한 번만 나와요.
   - 일본어 카드와 한국어 뜻 카드가 뒤집힌 채 섞여 있고, 같은 짝을 찾아요. 답은 미리 보여 주지 않아요.
   - 단어는 처음 고른 급수에서 뽑아요. '잘 모르겠어요(전체)'를 고른 사람만 가장 쉬운 N5 단어예요.
   - 틀려도 점수·시간 제한이 없어요. 로그인할 때마다 나오지 않아요. (jp-warm-done 이 저장되면 다시 안 나와요) */
window.WARMUP=(function(){
  const PAIRS=3;
  let st=null, timer=null;
  const $=id=>document.getElementById(id);
  const shuffle=a=>{ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
  const done=()=>{ try{ return !!LS.get("jp-warm-done",0); }catch(e){ return true; } };
  const mark=()=>{ try{ LS.set("jp-warm-done",1); }catch(e){} };
  function say(t){ try{ if(!("speechSynthesis" in window)) return; speakJa(t,.8); }catch(e){} }
  /* 단어 고르기: 처음 고른 급수 안에서 "짧고 자주 쓰는(핵심, tier 1)" 단어를 먼저 써요.
     '잘 모르겠어요(전체)'는 가장 쉬운 N5. 후보가 모자라면 조건을 조금씩 넓혀요. */
  function pool(){
    /* 가장 낮은 난이도: 어떤 급수를 골랐든 N5 핵심 단어 중 아주 짧은 것만 (한자엔 읽는 법이 같이 보여요) */
    const base=w=>w.ko&&w.text&&w.key&&!w.sent&&w.lv==="N5"&&!/[(),·\/~]/.test(w.ko);
    const tries=[
      w=>w.tier===1&&w.text.length<=2&&String(w.ko).length<=3,
      w=>w.tier===1&&w.text.length<=3&&String(w.ko).length<=4,
      w=>w.tier<=2&&w.text.length<=3&&String(w.ko).length<=4
    ];
    for(const f of tries){ const p=ALL.filter(w=>base(w)&&f(w)); if(p.length>=12) return p; }
    return ALL.filter(w=>base(w)&&w.text.length<=4&&String(w.ko).length<=7);
  }
  function build(){
    const p=shuffle(pool()), used=new Set(), ws=[];
    for(const w of p){ if(used.has(w.ko)||used.has(w.text)) continue; used.add(w.ko); used.add(w.text); ws.push(w); if(ws.length===PAIRS) break; }
    if(ws.length<PAIRS) return null;
    return shuffle(ws.flatMap((w,i)=>[{p:i,t:"jp",w,open:false,done:false},{p:i,t:"ko",w,open:false,done:false}]));
  }
  function dlg(){ let d=$("warmDlg"); if(!d){ d=document.createElement("dialog"); d.id="warmDlg"; d.className="wdlg"; document.body.appendChild(d); d.addEventListener("click",onClick); d.addEventListener("close",()=>{ clearTimeout(timer); try{ speechSynthesis.cancel(); }catch(e){} try{ renderHome(); }catch(e){} }); } return d; }
  function bird(){ try{ return window.PATH?PATH.birdSvg(null,"wbird"):MONKEY; }catch(e){ return ""; } }
  const stars=n=>Array.from({length:PAIRS},(_,i)=>`<i class="${i<n?"on":""}">★</i>`).join("");
  function confetti(n){ return `<div class="wconf" aria-hidden="true">${Array.from({length:n||18},(_,i)=>`<i style="left:${(i*(100/(n||18))+Math.random()*4).toFixed(1)}%;animation-delay:${(Math.random()*.5).toFixed(2)}s;--r:${Math.floor(Math.random()*360)}deg">${["✨","🌸","⭐","🎉","💖"][i%5]}</i>`).join("")}</div>`; }
  function intro(){
    dlg().innerHTML=`<div class="wbody"><div class="wmk big">${bird()}</div>
      <h2>환영해요! 🎉</h2>
      <p class="wsub">처음에 카드를 3초 동안 보여 줘요.<br>잘 기억했다가 <b>같은 뜻의 짝</b>을 찾아봐요.<br>일본어 ↔ 한국어, 틀려도 괜찮아요 😊</p>
      <button class="cta" data-w="go">▶ 놀이 시작</button>
      <button class="wlater" data-w="later">나중에 할게요</button></div>`;
  }
  function start(){
    const cards=build(); if(!cards){ mark(); dlg().close(); return; }
    st={cards,open:[],matched:0,lock:false,tries:0};
    dlg().innerHTML=`<div class="wbody">
      <div class="wstars" id="wst">${stars(0)}</div>
      <div class="wq" id="wmsg">카드를 눌러 뒤집어 봐요!</div>
      <div class="wgrid">${cards.map((c,i)=>`<button type="button" class="wc" data-w="flip" data-i="${i}" data-p="${c.p}" aria-label="카드 ${i+1}"><span class="wcin"><span class="wback"><svg class="wbk" viewBox="0 0 64 64" width="58" height="58" aria-hidden="true"><rect x="6" y="10" width="52" height="38" rx="14" fill="#fff"/><path d="M20 46L14 58L30 48Z" fill="#fff"/><text x="32" y="37" font-size="22" font-weight="800" text-anchor="middle" fill="#5b5bf0">すら</text><circle cx="52" cy="10" r="4" fill="#ffd54f"/><circle cx="10" cy="54" r="2.5" fill="#ffd54f" opacity=".8"/></svg></span><span class="wfront ${c.t}">${c.t==="jp"?R(c.w.f):E(c.w.ko)}</span></span></button>`).join("")}</div>
      <p class="wsub small">일본어와 뜻이 같은 카드를 찾아요</p></div>`;
    /* 가장 쉽게: 시작할 때 카드를 3초 동안 모두 펼쳐서 보여 줘요 */
    st.lock=true; msg("잘 보고 기억해 두세요!");
    dlg().querySelectorAll(".wc").forEach(el=>el.classList.add("open"));
    timer=setTimeout(()=>{ dlg().querySelectorAll(".wc").forEach(el=>el.classList.remove("open")); if(st){ st.lock=false; } msg("카드를 눌러 뒤집어 봐요!"); },3000);
  }
  const msg=t=>{ const m=$("wmsg"); if(m) m.textContent=t; };
  const card=i=>dlg().querySelector(`.wc[data-i="${i}"]`);
  function flip(i){
    const c=st.cards[i]; if(st.lock||c.open||c.done) return;
    c.open=true; card(i).classList.add("open"); st.open.push(i);
    if(c.t==="jp") say(c.w.yomi||c.w.text);
    if(st.open.length===1){ msg("하나 더 뒤집어 봐요!"); return; }
    st.lock=true; st.tries++;
    const [a,b]=st.open; st.open=[];
    if(st.cards[a].p===st.cards[b].p){
      st.cards[a].done=st.cards[b].done=true; st.matched++;
      timer=setTimeout(()=>{
        [a,b].forEach(k=>{ const el=card(k); if(el){ el.classList.add("done"); } });
        const s=$("wst"); if(s) s.innerHTML=stars(st.matched);
        msg(CHEER.ok(st.matched)); st.lock=false;
        dlg().querySelector(".wbody").insertAdjacentHTML("beforeend",confetti(10));
        setTimeout(()=>{ const f=dlg().querySelector(".wconf"); if(f) f.remove(); },2300);
        if(st.matched>=PAIRS) timer=setTimeout(result,1500);
      },450);
    } else {
      timer=setTimeout(()=>{
        [a,b].forEach(k=>{ const el=card(k); if(el){ el.classList.add("shake"); } });
        msg("아깝다! 기억해 두고 다시 해 봐요 💪");
        timer=setTimeout(()=>{ [a,b].forEach(k=>{ st.cards[k].open=false; const el=card(k); if(el){ el.classList.remove("open","shake"); } }); st.lock=false; },650);
      },700);
    }
  }
  function result(){
    const xp=15, seeds=5, m=CHEER.result(100);
    try{ if(window.PATH){ PATH.addXp(xp); PATH.addSeeds(seeds); } }catch(e){}
    dlg().innerHTML=`<div class="wbody"><div class="wmk big">${bird()}</div>
      <h2>やったー! 🎉</h2>
      <div class="wstars big">${stars(PAIRS)}</div>
      <p class="wsub"><b>짝을 다 찾았어요!</b><br>${m.sub}</p>
      <div class="wxp">+${xp} XP · 🌱 씨앗 ${seeds}개</div>
      <button class="cta" data-w="end">오늘 첫 학습 하러 가기</button>${confetti()}</div>`;
  }
  function onClick(e){
    const b=e.target.closest("[data-w]"); if(!b) return; const a=b.dataset.w;
    if(a==="go"){ start(); return; }
    if(a==="later"){ mark(); dlg().close(); return; }
    if(a==="end"){ dlg().close(); return; }
    if(a==="flip"&&st) flip(+b.dataset.i);
  }
  return{
    /* 시작 안내를 방금 끝낸 처음 사용자에게만 (이미 한 적이 있거나, 학습 기록이 있으면 나오지 않아요) */
    open(force){
      if(!force&&(done()||Object.keys(log||{}).length)) return;
      if(!pool().length) return;
      mark(); intro(); const d=dlg(); if(!d.open) d.showModal();
    },
    reset(){ try{ LS.set("jp-warm-done",0); }catch(e){} },
    sample(n){ return shuffle(pool()).slice(0,n||12).map(w=>w.lv+" "+w.text+" "+w.ko); }   /* 점검용 */
  };
})();
