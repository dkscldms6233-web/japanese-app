/* "다음 할 일" 안내 + 오늘의 코스(3칸)
 * - 처음 배우는 사람이 "지금 뭘 해야 하지?" 하고 멈추지 않도록, 앱이 다음 한 가지를 정해 큰 버튼으로 보여 줍니다.
 * - 오늘의 코스 3칸: ① 새로 배우기(글자 한 행 또는 단어 한 단계) ② 확인하기(복습·퀴즈) ③ 오늘의 문장 읽기. 날짜가 바뀌면 처음부터.
 * - 기록 키: jp-course {d:날짜, learn, practice, sentence}
 */
(function(){
const A=()=>window.APP, E=s=>A().E?A().E(s):String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const get=(k,d)=>A().LS.get(k,d), set=(k,v)=>A().LS.set(k,v);
const course=()=>{ const c=get("jp-course",null), t=A().today(); return c&&c.d===t?c:{d:t,learn:0,practice:0,sentence:0}; };
function mark(kind){ try{ const c=course(); if(!(kind in c)) return; c[kind]=(c[kind]||0)+1; set("jp-course",c); }catch(e){} }
const kdone=()=>(get("jp-kana",{done:{}}).done)||{};
const kcount=ch=>{ const d=kdone(); return Math.min(15,Object.keys(d).filter(k=>k[0]===ch&&d[k]&&+k.slice(1)<15).length); };
const kanaPhase=()=>{ const beg=!!A().prefs().beginner, started=Object.keys(kdone()).length>0; return (beg||started)&&(kcount("h")<15||kcount("k")<15); };

/* 새로 배우기 */
function learnT(){
  const h=kcount("h"), k=kcount("k"), d=kdone(), beg=!!A().prefs().beginner, started=Object.keys(d).length>0;
  if((beg||started)&&h<15) return {kind:"kana",k:"h",icon:"あ",title:h?"히라가나 이어서 배우기":"히라가나 배우기",sub:`${h} / 15 · 한 번에 한 행씩, 5글자만`};
  if((beg||started)&&k<15) return {kind:"kana",k:"k",icon:"ア",title:k?"가타카나 이어서 배우기":"가타카나 배우기",sub:`${k} / 15 · 외래어에 많이 써요`};
  const n=window.PATH&&PATH.nextNode&&PATH.nextNode();
  if(n) return {kind:"word",id:n.id,icon:"語",title:`${n.L} 단어 · ${n.label}`,sub:"20개를 카드로 보고 퀴즈로 확인해요"};
  return {kind:"quiz",icon:"問",title:"퀴즈로 실력 쌓기",sub:"배운 단어를 가볍게 풀어 봐요"};
}
/* 확인하기: 복습할 단어가 있으면 복습, 글자 단계면 방금 배운 글자 퀴즈, 아니면 퀴즈 */
function practiceT(){
  const due=window.PATH&&PATH.due?PATH.due():0;
  if(due>0) return {kind:"review",icon:"復",title:`복습 ${Math.min(due,10)}개`,sub:"잊기 전에 한 번 더 봐요"};
  if(kanaPhase()&&window.KANA&&KANA.check) return {kind:"kcheck",icon:"✓",title:"배운 글자 확인하기",sub:"6문제, 1분이면 끝나요"};
  return {kind:"quiz",icon:"問",title:"퀴즈로 확인하기",sub:"배운 걸 가볍게 풀어 봐요"};
}
const sentT=()=>({kind:"sentence",icon:"文",title:"오늘의 문장 읽기",sub:"한 문장만 소리 내어 읽어 봐요"});
/* 글자 단계에서는 3번째 칸이 "한 행 더"(글자 두 행 배우기), 그 뒤에는 "오늘의 문장" */
function slots(){ const c=course(), kp=kanaPhase(); return [{key:"learn",label:"배우기",done:c.learn>0,t:learnT()},{key:"practice",label:"확인하기",done:c.practice>0,t:practiceT()},kp?{key:"sentence",label:"한 행 더",done:c.learn>1,t:{...learnT(),title:"한 행 더 배우기",sub:"오늘 두 행이면 아주 잘한 거예요"}}:{key:"sentence",label:"오늘의 문장",done:c.sentence>0,t:sentT()}]; }
function get_(){ const S=slots(), nx=S.find(x=>!x.done); return nx?{...nx.t,slot:nx.key,all:false}:{...S[0].t,slot:"learn",all:true,title:"더 공부하기: "+S[0].t.title}; }
function run(t){
  t=t||get_(); const k=t.kind;
  try{
    if(k==="kana"){ window.KANA.learn(t.k==="k"); }
    else if(k==="word"){ PATH.startNode(t.id); }
    else if(k==="review"){ PATH.review(); }
    else if(k==="kcheck"){ KANA.check(); }
    else if(k==="sentence"){ A().setView("today"); }
    else { A().setView("quiz"); }
  }catch(e){ try{ A().setView("quiz"); }catch(x){} }
  window.scrollTo(0,0);
}
function homeHtml(){
  const S=slots(), nx=get_(), dn=S.filter(x=>x.done).length, all=dn===3;
  const steps=kanaPhase()?(()=>{ const h=kcount("h"),k=kcount("k"); const st=[["히라가나",h,15],["가타카나",k,15],["단어",0,1],["퀴즈",0,1]]; const cur=h<15?0:k<15?1:2;
    return `<div class="nxr" aria-label="공부 순서">${st.map((x,i)=>`<span class="${i<cur||(i<2&&x[1]>=x[2])?"dn":i===cur?"now":""}"><i>${i<cur?"✓":i+1}</i>${x[0]}</span>`).join("")}</div>`; })():"";
  const due=window.PATH&&PATH.due?PATH.due():0, kp=kanaPhase();
  const say=all?"코스 끝! 정말 잘했어요":dn===2?"마지막 한 칸이에요, 거의 다 왔어요!":dn===1?"벌써 한 칸 했어요! 하나만 더 해 볼까요?":kp?"한 행, 다섯 글자만 해요. 금방 끝나요!":due>0?(due>10?"복습할 단어가 기다리고 있어요":`복습할 단어 ${due}개가 기다리고 있어요`):"딱 10분만, 같이 해 봐요!";
  const cur=S.findIndex(x=>!x.done);
  const path=S.map((x,i)=>`${i?`<span class="nxln${S[i-1].done?" dn":""}"></span>`:""}<button type="button" class="nxn${x.done?" dn":i===cur?" now":""}" data-nxt="${x.key}"><i>${x.done?"✓":i+1}</i><span>${x.label}</span></button>`).join("");
  /* 시험 일주일 전부터 매일 다른 응원 한마디 (시험 다음 날에는 수고했다는 말) */
  const CHEER={7:"시험이 일주일 남았어요. 지금까지 쌓아 온 것도 이미 꽤 많아요 ㅎㅎ 틀렸던 단어부터 가볍게 훑어봐요.",6:"6일 남았어요. 새로운 걸 욱여넣기보다, 아는 걸 확실히 하는 게 점수로 이어져요. 오늘도 한 걸음씩!",5:"5일 남았어요. 문법에서 헷갈렸던 것만 골라 다시 봐요. 하루치만 해도 충분해요.",4:"4일 남았어요. 듣기도 하루 10분만 귀를 열어 줘요. 잘 안 들려도 괜찮아요, 귀는 금방 익숙해져요.",3:"3일 남았어요. 이제 모의시험 한 번으로 시간 배분을 느껴 봐요. 점수보다 흐름을 익히는 게 중요해요.",2:"2일 남았어요. 밤새우지 말고 푹 자요. 잠도 공부예요. 컨디션이 실력만큼 중요하거든요.",1:"내일이 시험이에요. 가볍게 복습만 하고 일찍 쉬어요. 준비물(수험표, 신분증)도 꼭 챙기고요!",0:"오늘이 시험날이에요! 여기까지 온 것만으로도 정말 대단해요. 아는 만큼만 차분히 풀면 돼요. 응원하고 있어요."};
  const di=(window.PLUS&&PLUS.ddayInfo&&PLUS.ddayInfo()); let ck="";
  try{ if(di&&((di.d>=0&&di.d<=7)||di.d===-1)&&localStorage.getItem("jp-cheerx")!==A().today()){ const msg=di.d===-1?"시험 보느라 정말 수고했어요. 푹 쉬어요. 결과가 어떻든 여기까지 해낸 건 그대로 남아요 ㅎㅎ":CHEER[di.d];
    const nowT=new Date(), hh=nowT.getHours(), tm=(hh<12?"오전 ":"오후 ")+(hh%12||12)+":"+String(nowT.getMinutes()).padStart(2,"0");
    ck=`<section class="nxcheer msg" aria-label="응원 메시지"><div class="nxmh"><img class="nxav" src="icon-192.png?v=9" alt="" width="40" height="40"><div class="nxwho"><b>술술 일본어</b><small>${di.d===-1?"시험 끝!":`시험 ${di.d===0?"D-DAY":"D-"+di.d} · 응원 도착!`}</small></div><span class="nxtm">${tm}</span><button type="button" data-ckx aria-label="오늘은 닫기">×</button></div><div class="nxtyp" aria-hidden="true"><i></i><i></i><i></i></div><div class="nxbub"><p>${E(msg)}</p></div></section>`; } }catch(e){}
  return `${ck}<section class="h2next${all?" all":""}">
   <div class="nxsay"><img src="img/coach.png?v=5" alt="" width="30" height="30"><span>${E(say)}</span></div>
   <div class="nxcard"><small>${all?"코스 완료":"다음 한 걸음"}</small><h3>${E(all?"정말 잘했어요!":nx.title)}</h3><p>${E(all?"더 하고 싶으면 이어서 해요":nx.sub)}</p>
    <button type="button" class="nxgo" data-nxt="go">${all?"더 해 볼까요?":"시작하기"}</button></div>
   <div class="nxpath" aria-label="오늘의 코스 ${dn}/3">${path}</div>${steps}</section>`;
}
/* 끝 화면용 큰 버튼 */
function btnHtml(sec){ const n=get_(); return `<button type="button" class="cta${sec?" sec":""}" data-nxt="go">${E(n.all?"더 공부하기":"다음: "+n.title)} ›</button>`; }
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-nxt]"); if(!b) return; e.preventDefault();
  const v=b.dataset.nxt; if(v==="go") return run();
  const S=slots(), s=S.find(x=>x.key===v); if(s) run(s.t); },false);
window.NEXT={mark,get:get_,run,homeHtml,btnHtml,course,kanaPhase};
})();
document.addEventListener("click",e=>{ const x=e.target.closest&&e.target.closest("[data-ckx]"); if(!x) return; try{ localStorage.setItem("jp-cheerx",(window.APP&&APP.today())||""); }catch(err){} const s=x.closest(".nxcheer"); if(s) s.remove(); });
