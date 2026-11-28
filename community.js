/* 커뮤니티 1단계 — 글 없이 즐기는 함께 공부하기
 * - 주간 리그: 이번 주 경험치 순위(참여를 켠 사람만 이름·경험치·연속 출석일·참새 모습이 보입니다)
 * - 함께 공부 중: 오늘 공부한 사람 수 / 지금 공부 중인 사람 수(리그 참가자 기준)
 * - 친구: 친구 코드로 추가하고(서로 추가하면 맞친구) 이번 주 경험치를 봅니다
 * - 대화: 맞친구끼리만 1:1 메시지(chats/{두 uid}/msgs). 친구를 지우면 대화도 막힙니다  ※ 현재 CHAT_ON=false 로 꺼져 있습니다
 * - 응원: 정해진 이모티콘 10개만 보낼 수 있어요(자유 글 없음). 한 사람에게 하루 한 번
 * - 신고: 이상한 닉네임은 신고할 수 있어요
 * 저장 위치(Firestore): leagues/{주 시작일}/members/{uid}, codes/{코드}, cheers/{id}, reports/{id}
 * 로그인(계정)한 사람만 쓸 수 있어요. 게스트는 로그인 안내가 보입니다.
 */
(function(){
const A=()=>window.APP;
const $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const STICKERS=[["👍","최고예요"],["🔥","불타오르네"],["💪","힘내요"],["🎉","축하해요"],["👏","박수!"],["🌸","예쁩니다"],["😊","반갑습니다"],["⭐","대단해요"],["🐥","같이 합니다"],["💖","고마워요"]];
const REWARD=[50,30,20];
/* 1:1 자유 글 대화 스위치. 출시 전에는 꺼 둠 (치은 결정 2026-11-22). 다시 켜려면 true로 바꾸세요.
   꺼져 있으면: 대화 버튼·대화 창·새 메시지 알림이 없어요. 리그·함께 공부·친구·이모티콘 응원·신고는 그대로입니다. */
const CHAT_ON=false;
const lg=()=>A().LS.get("jp-league",{joined:false,code:"",claimed:{}});
const saveLg=v=>A().LS.set("jp-league",v);
const friends=()=>A().LS.get("jp-friends",[]);
const saveFr=v=>A().LS.set("jp-friends",v);
const cloud=()=>A().cloud;
const signedIn=()=>{ const c=cloud(); const p=A().curProfile(); return !!(c&&c.ok&&p&&p.cloud&&c.auth.currentUser&&c.auth.currentUser.uid===p.cloud); };
const uid=()=>cloud().auth.currentUser.uid;
const verified=()=>{ try{ return !!cloud().auth.currentUser.emailVerified; }catch(e){ return false; } };
const db=()=>cloud().db;

function weekKey(d){ const x=new Date(d||Date.now()); const dow=(x.getDay()+6)%7; x.setDate(x.getDate()-dow); return x.toLocaleDateString("sv-SE"); }
const prevWeek=()=>{ const x=new Date(); x.setDate(x.getDate()-7); return weekKey(x); };
function weekXp(){ const d=(A().LS.get("jp-xp",{d:{}}).d)||{}, w=weekKey(); let n=0; for(const k in d) if(weekKey(new Date(k+"T12:00:00"))===w) n+=d[k]; return n; }
const members=w=>db().collection("leagues").doc(w).collection("members");

/* ---------- 내 기록 올리기 ---------- */
let pubT=0;
function touch(){ if(!lg().joined) return; clearTimeout(pubT); pubT=setTimeout(publish,4000); }
async function publish(){
  if(!signedIn()||!verified()||!lg().joined) return;
  const p=A().curProfile();
  try{ await members(weekKey()).doc(uid()).set({name:p.name,title:(window.PATH&&PATH.repTitle&&PATH.repTitle())||"",xp:weekXp(),streak:A().streakDays(),day:A().today(),lv:(window.PATH&&PATH.level&&PATH.level())||1,at:Date.now()}); }catch(e){}
}
const genCode=()=>{ const al="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s=""; for(let i=0;i<6;i++) s+=al[Math.floor(Math.random()*al.length)]; return s; };
async function join(){
  if(!signedIn()) return;
  const s=lg(); let code=s.code;
  if(!code){ for(let i=0;i<6&&!code;i++){ const c=genCode(); try{ await db().collection("codes").doc(c).set({uid:uid(),name:A().curProfile().name}); code=c; }catch(e){} } }
  if(!code){ A().toast("잠시 후 다시 해 주세요"); return; }
  s.joined=true; s.code=code; saveLg(s); await publish(); wKey=""; startWatch(); render();
}
async function leave(){
  if(!confirm("리그에서 나가시겠습니까? 내 이름과 경험치가 목록에서 사라집니다.")) return;
  try{ await members(weekKey()).doc(uid()).delete(); }catch(e){}
  const s=lg(); s.joined=false; saveLg(s); stopWatch(); UN.cheers=0; UN.gifts=0; UN.chats={}; badge(); render();
}

/* ---------- 불러오기 ---------- */
async function load(){
  const w=weekKey(), snap=await members(w).orderBy("xp","desc").limit(50).get();
  const list=snap.docs.map(d=>({uid:d.id,...d.data()}));
  const fr=friends(); const have=new Set(list.map(x=>x.uid)); const extra=[];
  await Promise.all(fr.filter(f=>!have.has(f.uid)).map(async f=>{ try{ const d=await members(w).doc(f.uid).get(); extra.push(d.exists?{uid:f.uid,...d.data()}:{uid:f.uid,name:f.name,xp:0,none:true}); }catch(e){ extra.push({uid:f.uid,name:f.name,xp:0,none:true}); } }));
  const me=uid(), mutual={}; await Promise.all(fr.map(async f=>{ try{ const d=await db().collection("follows").doc(f.uid+"_"+me).get(); mutual[f.uid]=d.exists; }catch(e){ mutual[f.uid]=false; } }));
  let cheers=[]; try{ const cs=await db().collection("cheers").where("to","==",uid()).limit(50).get(); cheers=cs.docs.map(d=>d.data()).sort((a,b)=>b.at-a.at); }catch(e){}
  let gifts=[]; try{ const gs=await db().collection("gifts").where("to","==",uid()).where("claimed","==",false).limit(30).get(); gifts=gs.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>b.at-a.at); }catch(e){}
  return {list,extra,cheers,mutual,gifts};
}
async function weeklyReward(){
  const pw=prevWeek(), s=lg(); if(s.claimed&&s.claimed[pw]) return;
  try{ const snap=await members(pw).orderBy("xp","desc").limit(3).get(); const i=snap.docs.findIndex(d=>d.id===uid());
    s.claimed=s.claimed||{}; s.claimed[pw]=1; saveLg(s);
    if(i>=0&&snap.docs[i].data().xp>0){ window.PATH&&PATH.addSeeds(REWARD[i]); A().toast("지난주 리그 "+(i+1)+"위! 씨앗 "+REWARD[i]+"개를 받았습니다"); } }catch(e){}
}

const pairId=o=>[uid(),o].sort().join("_");
/* ---------- 알림: 응원·대화가 오면 탭 배지 · 토스트 · (허용 시) 브라우저 알림 ---------- */
const UN={cheers:0,gifts:0,chats:{}}; let watchers=[], wInit={}, wKey="";
const chatRead=()=>{ try{ return JSON.parse(localStorage.getItem("jp-chat-read")||"{}"); }catch(e){ return {}; } };
const markRead=o=>{ const m=chatRead(); m[pairId(o)]=Date.now(); try{ localStorage.setItem("jp-chat-read",JSON.stringify(m)); }catch(e){} UN.chats[o]=false; badge(); document.querySelectorAll('[data-chat="'+o+'"]').forEach(b=>b.classList.remove("dotb")); };
function badge(){
  const n=UN.cheers+(UN.gifts||0)+Object.values(UN.chats).filter(Boolean).length, b=document.querySelector('.vb[data-view="community"]'); if(!b) return;
  let d=b.querySelector(".vbdot"); if(!n){ if(d) d.remove(); } else { if(!d){ d=document.createElement("b"); d.className="vbdot"; b.appendChild(d); } d.textContent=n>9?"9+":String(n); }
}
function notify(title,body){
  A().toast(title+(body?": "+body:""));
  try{ if(window.Notification&&Notification.permission==="granted"&&document.hidden) new Notification(title,{body:body||"",icon:"icon-192.png"}); }catch(e){}
}
function stopWatch(){ watchers.forEach(u=>{ try{ u(); }catch(e){} }); watchers=[]; wInit={}; }
async function startWatch(){
  if(!signedIn()||!lg().joined){ stopWatch(); UN.cheers=0; UN.gifts=0; UN.chats={}; badge(); return; }
  const me=uid(), fr=friends(), mutual=[];
  await Promise.all(fr.map(async f=>{ try{ const d=await db().collection("follows").doc(f.uid+"_"+me).get(); if(d.exists) mutual.push(f); }catch(e){} }));
  const key=me+":"+mutual.map(f=>f.uid).sort().join(","); if(key===wKey&&watchers.length) return; wKey=key; stopWatch();
  watchers.push(db().collection("cheers").where("to","==",me).limit(50).onSnapshot(s=>{
    const seen=+(localStorage.getItem("jp-cheer-seen")||0); let n=0, last=null;
    s.docs.forEach(d=>{ const x=d.data(); if(x.at>seen){ n++; if(!last||x.at>last.at) last=x; } });
    const was=UN.cheers; UN.cheers=n; badge();
    if(wInit.cheers&&n>was&&last&&!(window.APP.view&&APP.view()==="community")) notify((last.fromName||"친구")+" 님이 응원을 보냈습니다",last.sticker);
    wInit.cheers=true; },()=>{}));
  watchers.push(db().collection("gifts").where("to","==",me).where("claimed","==",false).limit(30).onSnapshot(s=>{ const was=UN.gifts||0; UN.gifts=s.size; badge();
    if(wInit.gifts&&UN.gifts>was&&!(window.APP.view&&APP.view()==="community")){ const g=s.docs[0].data(); notify((g.fromName||"친구")+" 님이 선물을 보냈습니다",g.kind==="seed"?"씨앗 "+g.amount+"개":(g.itemName||"아이템")); }
    wInit.gifts=true; },()=>{}));
  if(CHAT_ON) mutual.forEach(f=>{
    watchers.push(db().collection("chats").doc(pairId(f.uid)).collection("msgs").orderBy("at").limitToLast(1).onSnapshot(s=>{
      const m=s.docs[0]&&s.docs[0].data(); if(!m){ wInit[f.uid]=true; return; }
      const dlg=$("chatDlg"), open=dlg&&dlg.open&&dlg.dataset.o===f.uid;
      if(m.from===me||open){ if(open&&m.from!==me) markRead(f.uid); UN.chats[f.uid]=false; badge(); wInit[f.uid]=true; return; }
      const unread=m.at>(chatRead()[pairId(f.uid)]||0), was=UN.chats[f.uid]; UN.chats[f.uid]=unread; badge();
      if(wInit[f.uid]&&unread&&!was) notify(f.name+" 님의 메시지",m.text.length>30?m.text.slice(0,30)+"…":m.text);
      wInit[f.uid]=true; },()=>{}));
  });
}
async function askNotify(){ try{ const p=await Notification.requestPermission(); A().toast(p==="granted"?"알림을 켰습니다. 앱을 열어 둔 동안 알려 줍니다":"알림이 꺼져 있습니다"); }catch(e){ A().toast("이 브라우저는 알림을 지원하지 않습니다"); } render(); }

/* ---------- 화면 ---------- */
const bird=(eq,cls)=>window.PATH?PATH.birdSvg(eq||{},cls||"cmb"):"";
const ROWS={};
const rangeText=()=>{ const a=new Date(weekKey()+"T12:00:00"), b=new Date(a); b.setDate(b.getDate()+6); const f=d=>(d.getMonth()+1)+"."+d.getDate(); return f(a)+" ~ "+f(b); };
let busy=false;
const hueOf=u=>{ let h=0; String(u).split("").forEach(c=>{ h=(h*31+c.charCodeAt(0))%360; }); return h; };
const initial=n=>{ const t=String(n||"?").trim(); return E(t?Array.from(t)[0].toUpperCase():"?"); };
const avatar=(x,big)=>`<span class="cmav${big?" big":""}" style="--h:${hueOf(x.uid)}">${initial(x.name)}${x.lv&&!big?`<i>${x.lv}</i>`:""}</span>`;
function row(x,rank,me,isFr,mutual){
  ROWS[x.uid]=Object.assign({mutual:!!mutual,isFr:!!isFr},x);
  const mine=x.uid===(signedIn()?uid():"");
  const sub=x.none?"이번 주 기록 없음":[x.lv?"Lv."+x.lv:"",x.streak?x.streak+"일 연속":""].filter(Boolean).map(E).join(" · ");
  const medal=rank&&rank<=3?` r${rank}`:"";
  return `<div class="cmr ${mine?"me":""}"><span class="cmk${medal}">${rank||""}</span><button class="cmbw" data-bird="${x.uid}" aria-label="${E(x.name||"")}님 프로필 보기">${avatar(x)}</button>
   <span class="cmn" data-bird="${x.uid}" role="button" tabindex="0"><b>${E(x.name||"")}${x.title==="JLPT 정복자"?` <span class="cmcr" title="JLPT 정복자">★</span>`:""}${mine?` <em class="me">나</em>`:""}${isFr&&!mine?` <em>${mutual?"친구":"요청함"}</em>`:""}</b><small >${sub}</small></span><span class="cmx">${x.xp||0}<small>XP</small></span>
   ${mine?`<span class="cmb2 ph"></span>`:`<button class="cmb2" data-cheer="${x.uid}" data-n="${E(x.name||"")}">응원</button>`}</div>`;
}
async function render(){
  const v=$("communityView"); if(!v||busy) return;
  const head=`<div class="cm"><h2>커뮤니티</h2>`;
  if(!cloud()||!cloud().ok){ v.innerHTML=head+`<p class="sub">서버에 연결할 수 없습니다. 인터넷을 확인해 주세요.</p></div>`; return; }
  if(!signedIn()){
    v.innerHTML=head+`<p class="sub">로그인하면 친구와 함께 공부하고, 주간 리그에 참여할 수 있습니다.<br>경험치는 일주일마다 초기화됩니다.</p>
     <div class="lrows"><div class="cmrow3"><b>주간 리그</b><span>이번 주 경험치 순위</span></div><div class="cmrow3"><b>친구</b><span>친구 코드로 추가하고 서로 응원하기</span></div><div class="cmrow3"><b>함께 공부 중</b><span>오늘 몇 명이 함께 공부하고 있을까요?</span></div></div>
     <div class="qbtns" style="margin-top:16px"><button class="cta" data-cm="login" style="max-width:240px">로그인</button><button class="cta sec" data-cm="signup" style="max-width:240px">회원가입</button></div></div>`; return; }
  if(!verified()){
    v.innerHTML=head+`<p class="sub">이메일 인증이 필요합니다.<br><b>${E(cloud().auth.currentUser.email||"")}</b> 로 보낸 인증 메일의 링크를 누른 뒤, 아래 버튼을 눌러 주세요.<br>메일이 안 보이면 스팸함도 확인해 주세요.</p>
     <div class="qbtns" style="margin-top:16px"><button class="cta" data-cm="verified" style="max-width:240px">인증했습니다</button><button class="cta sec" data-cm="resend" style="max-width:240px">인증 메일 다시 받기</button></div></div>`; return; }
  if(!lg().joined){
    v.innerHTML=head+`<p class="sub">주간 리그에 참여하시겠습니까?</p><div class="lrows"><div class="cmrow3"><b>다른 사용자에게 보이는 것</b><span>닉네임(${E(A().curProfile().name)}), 이번 주 경험치, 연속 공부일, 레벨, 칭호</span></div><div class="cmrow3"><b>보이지 않는 것</b><span>이메일, 틀린 단어, 학습 기록</span></div></div>
     <div class="qbtns" style="margin-top:16px"><button class="cta" data-cm="join" style="max-width:240px">참여하기</button></div><p class="sub" style="margin-top:10px">언제든 나갈 수 있습니다.</p></div>`; return; }
  busy=true; v.innerHTML=head+`<p class="sub">불러오는 중…</p></div>`;
  let d; try{ await publish(); d=await load(); }catch(e){ busy=false; v.innerHTML=head+`<p class="sub">불러오지 못했습니다. 잠시 후 다시 해 주세요.</p><button class="cta sec" data-cm="reload" style="max-width:200px">다시 시도</button></div>`; return; }
  busy=false; weeklyReward(); wKey=""; startWatch();
  const fr=friends(), frSet=new Set(fr.map(f=>f.uid)), me=signedIn()?uid():"";
  const today=A().today(), now=Date.now(), nToday=d.list.filter(x=>x.day===today).length, nNow=d.list.filter(x=>now-(x.at||0)<10*60*1000).length;
  const myIdx=d.list.findIndex(x=>x.uid===me), myXp=weekXp();
  const friendRows=fr.map(f=>{ const x=d.list.find(y=>y.uid===f.uid)||d.extra.find(y=>y.uid===f.uid)||{uid:f.uid,name:f.name,xp:0,none:true}; return row(x,"",false,true,d.mutual[f.uid]); }).join("");
  const seen=+(localStorage.getItem("jp-cheer-seen")||0), unread=d.cheers.filter(c=>c.at>seen).length;
  v.innerHTML=head+`<div class="cmhd"><div><b>이번 주 리그</b><small>${rangeText()}</small></div><div class="cmme">${myIdx>=0?(myIdx+1)+"위":"50위 밖"} · ${myXp} XP</div></div>
   <div class="cmqa"><button class="pill on" data-cm="addfriend">친구 추가</button><span class="sub">내 친구 코드 <b>${E(lg().code)}</b></span></div>
   <div class="sub cmact">${nToday?`오늘 ${nToday}명이 함께 공부했어요${nNow?` · 지금 ${nNow}명이 공부 중입니다`:""}`:"오늘의 첫 번째 주인공이 되어 보세요"}</div>
   <div class="cml">${d.list.length?d.list.map((x,i)=>row(x,i+1,x.uid===me,frSet.has(x.uid),d.mutual[x.uid])).join(""):`<p class="sub">아직 아무도 없습니다. 첫 번째로 이름을 올려 보세요!</p>`}</div>
   <div class="cmfh"><h3 class="cmh3" style="margin:0">친구</h3><span class="cmfb"><button class="pill" data-cm="invite">앱 초대하기</button><button class="pill on" data-cm="addfriend">친구 추가</button></span></div>
   <div class="cml" style="margin-top:8px">${fr.length?friendRows:`<p class="sub">아직 친구가 없습니다. 「친구 추가」에서 친구 코드를 입력해 보세요.</p>`}</div>
   <p class="sub" style="margin-top:6px">${CHAT_ON?"서로 친구로 추가하면 「대화」 버튼이 생깁니다.":"서로 친구로 추가하면 이번 주 경험치를 보고 응원을 보낼 수 있습니다."}</p>
   ${d.gifts&&d.gifts.length?`<h3 class="cmh3">받은 선물 <em class="cmnew">${d.gifts.length}</em></h3><div class="cml">${d.gifts.map(g=>`<div class="cmc cmg"><span><b>${E(g.fromName||"친구")}</b> 님이 ${g.kind==="seed"?"씨앗 "+(+g.amount||0)+"개":"「"+E(g.itemName||"아이템")+"」"}를 보냈습니다<small>${new Date(g.at).toLocaleDateString("ko-KR")}</small></span><button class="pill on sm" data-claim="${E(g.id)}">받기</button></div>`).join("")}</div>`:""}
   <h3 class="cmh3">받은 응원${unread?` <em class="cmnew">새 ${unread}</em>`:""}</h3>
   <div class="cml">${d.cheers.length?d.cheers.slice(0,10).map(c=>`<div class="cmc"><b>${E(c.fromName||"")}</b> 님이 <span class="stkv">${E(c.sticker)}</span> 응원을 보냈습니다<small>${new Date(c.at).toLocaleDateString("ko-KR")}</small></div>`).join(""):`<p class="sub">아직 받은 응원이 없습니다.</p>`}</div>
   ${window.Notification&&Notification.permission==="default"?`<button class="cmnotif" data-cm="notify">응원·메시지 알림 켜기 (앱을 열어 둔 동안)</button>`:""}
   <button class="cmleave" data-cm="leave">리그에서 나가기</button></div>`;
  try{ localStorage.setItem("jp-cheer-seen",String(Date.now())); }catch(e){} UN.cheers=0; UN.gifts=0; badge();
}


function birdDlg(u){
  const x=ROWS[u]; if(!x) return; let d=$("birdDlg");
  if(!d){ d=document.createElement("dialog"); d.id="birdDlg"; document.body.appendChild(d);
    d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-bclose]")){ d.close(); return; }
      const ch=ev.target.closest("[data-bcheer]"), gf=ev.target.closest("[data-bgift]");
      if(gf){ d.close(); giftDlg(gf.dataset.bgift,gf.dataset.n); } else if(ch){ d.close(); cheerDlg(ch.dataset.bcheer,ch.dataset.n); } else if(ev.target.closest("[data-frdel],[data-rep]")) d.close(); }); }
  const me=signedIn()&&u===uid(), nm=E(x.name||"");
  const stat=(l,v)=>`<div><small>${l}</small><b>${v}</b></div>`;
  d.innerHTML=`<div class="dh"><h2 style="margin:0">프로필</h2><button class="x" data-bclose aria-label="닫기">×</button></div><div class="pfc">${avatar(x,true)}<h3>${nm}${me?` <em class="me">나</em>`:""}</h3>${x.title?`<i class="cmtt ${x.title==="JLPT 정복자"?"gold":""}">${E(x.title)}</i>`:""}
   <div class="pfst">${stat("이번 주",(x.xp||0)+" XP")}${stat("연속 공부",(x.streak||0)+"일")}${stat("레벨",x.lv?"Lv."+x.lv:"-")}</div>
   ${me?`<p class="sub">내 프로필이에요. 다른 사람에게는 닉네임, 이번 주 경험치, 연속 공부, 레벨, 칭호만 보여요.</p>`:`<div class="qbtns" style="margin-top:14px"><button class="pill on" data-bcheer="${x.uid}" data-n="${nm}">응원 보내기</button>${isDevOn()?`<button class="pill" data-bgift="${x.uid}" data-n="${nm}">선물하기</button>`:""}</div>
   <div class="pfmore">${x.isFr?`<button type="button" data-frdel="${x.uid}" data-n="${nm}">친구 삭제</button>`:""}<button type="button" data-rep="${x.uid}">신고</button></div>`}</div>`;
  if(!d.open) d.showModal();
}
/* ---------- 응원 · 신고 · 친구 추가 ---------- */
function cheerDlg(to,name){
  let d=$("cheerDlg"); if(!d){ d=document.createElement("dialog"); d.id="cheerDlg"; document.body.appendChild(d);
    d.addEventListener("click",async ev=>{ if(ev.target===d||ev.target.closest("[data-cclose]")){ d.close(); return; }
      const s=ev.target.closest("[data-sticker]"); if(!s) return; const to=d.dataset.to, nm=d.dataset.n, day=A().today();
      try{ await db().collection("cheers").doc(uid()+"_"+to+"_"+day).set({from:uid(),fromName:A().curProfile().name,to,sticker:s.dataset.sticker,day,at:Date.now()}); A().toast(nm+" 님에게 응원을 보냈습니다"); }
      catch(e){ A().toast("오늘은 이미 응원했어요"); } d.close(); }); }
  d.dataset.to=to; d.dataset.n=name;
  d.innerHTML=`<div class="dh"><h2 style="margin:0">${E(name)} 님에게 응원</h2><button class="x" data-cclose aria-label="닫기">×</button></div><div class="db"><div class="stk">${STICKERS.map(([e,l])=>`<button class="stkb" data-sticker="${e}"><span>${e}</span><small>${l}</small></button>`).join("")}</div><p class="sub" style="margin-top:10px">한 명에게는 하루에 한 번만 보낼 수 있습니다.</p></div>`;
  if(!d.open) d.showModal();
}
async function report(target){
  if(!confirm("이 사용자의 이름을 신고하시겠습니까?")) return;
  try{ await db().collection("reports").add({by:uid(),target,week:weekKey(),at:Date.now()}); A().toast("신고했습니다. 확인하겠습니다"); }catch(e){ A().toast("신고하지 못했습니다"); }
}
async function addFriend(code){
  code=(code||"").trim().toUpperCase(); if(code.length!==6){ A().toast("친구 코드는 6자리입니다"); return; }
  if(code===lg().code){ A().toast("내 코드예요"); return; }
  try{ const d=await db().collection("codes").doc(code).get(); if(!d.exists){ A().toast("없는 코드입니다"); return; }
    const f=friends(); if(f.some(x=>x.uid===d.data().uid)){ A().toast("이미 친구입니다"); return; }
    try{ await db().collection("follows").doc(uid()+"_"+d.data().uid).set({from:uid(),to:d.data().uid,at:Date.now()}); }catch(e){}
    f.push({uid:d.data().uid,name:d.data().name}); saveFr(f); A().toast("「"+d.data().name+"」 님을 친구로 추가했습니다"); wKey=""; startWatch(); render(); }catch(e){ A().toast("추가하지 못했습니다"); }
}

function addDlg(){
  let d=$("addFrDlg"); if(!d){ d=document.createElement("dialog"); d.id="addFrDlg"; document.body.appendChild(d);
    d.addEventListener("click",async ev=>{ if(ev.target===d||ev.target.closest("[data-fclose]")){ d.close(); return; }
      if(ev.target.closest("[data-fcopy]")){ try{ await navigator.clipboard.writeText(lg().code); A().toast("복사했습니다"); }catch(err){ A().toast("코드: "+lg().code); } } });
    d.addEventListener("submit",async ev=>{ ev.preventDefault(); const code=new FormData(ev.target).get("c"); await addFriend(code); d.close(); }); }
  d.innerHTML=`<div class="dh"><h2 style="margin:0">친구 추가</h2><button class="x" data-fclose aria-label="닫기">×</button></div><div class="db">
   <p class="sub">친구의 6자리 코드를 입력하세요. 친구도 내 코드를 입력하면 ${CHAT_ON?"서로 대화할 수 있습니다.":"서로 응원을 주고받을 수 있습니다."}</p>
   <form class="cmadd"><input name="c" maxlength="6" placeholder="친구 코드 6자리" autocomplete="off" autocapitalize="characters" autofocus><button class="pill on" type="submit">추가</button></form>
   <div class="cmcode"><span>내 친구 코드 <b>${E(lg().code)}</b></span><button class="pill sm" data-fcopy="1">복사</button></div></div>`;
  if(!d.open) d.showModal();
}
/* ---------- 1:1 대화 (맞친구끼리만) ---------- */
let chatUnsub=null;
function chatDlg(other,name){
  if(!CHAT_ON) return;
  let d=$("chatDlg"); if(!d){ d=document.createElement("dialog"); d.id="chatDlg"; document.body.appendChild(d);
    d.addEventListener("close",()=>{ if(chatUnsub){ chatUnsub(); chatUnsub=null; } });
    d.addEventListener("click",async ev=>{ if(ev.target===d||ev.target.closest("[data-chclose]")){ d.close(); return; }
      if(ev.target.closest("[data-chmenu]")){ const m=d.querySelector(".chmenu"); if(m) m.hidden=!m.hidden; return; }
      if(ev.target.closest("[data-chdel]")){ if(!confirm("정말 이 친구를 삭제하시겠습니까?\n삭제하면 서로 대화할 수 없고, 다시 서로 추가해야 합니다.")) return; const o=d.dataset.o;
        try{ await db().collection("follows").doc(uid()+"_"+o).delete(); }catch(e){} saveFr(friends().filter(f=>f.uid!==o)); d.close(); wKey=""; startWatch(); render(); return; }
      if(ev.target.closest("[data-chrep]")){ const m=d.querySelector(".chmenu"); if(m) m.hidden=true; report(d.dataset.o); return; }
      const m=d.querySelector(".chmenu"); if(m&&!m.hidden&&!ev.target.closest(".chmenu")) m.hidden=true; });
    d.addEventListener("submit",async ev=>{ ev.preventDefault(); const inp=ev.target.querySelector("input"), t=inp.value.trim().slice(0,200); if(!t) return; inp.value="";
      try{ await db().collection("chats").doc(pairId(d.dataset.o)).collection("msgs").add({from:uid(),text:t,at:Date.now()}); }catch(e){ A().toast("보내지 못했습니다"); } }); }
  d.dataset.o=other; markRead(other);
  d.innerHTML=`<div class="dh"><h2 style="margin:0">${E(name)}</h2><span class="chhr"><button class="x" data-chmenu="1" aria-label="더보기">⋯</button><button class="x" data-chclose aria-label="닫기">×</button></span></div>
   <div class="chmenu" hidden><button data-chrep="1">신고하기</button><button data-chdel="1" class="danger">친구 삭제</button></div>
   <div class="chmsgs" id="chMsgs"><p class="sub" style="text-align:center">불러오는 중…</p></div>
   <form class="chform"><input maxlength="200" placeholder="메시지 (200자까지)" autocomplete="off"><button class="pill on" type="submit">보내기</button></form>`;
  if(!d.open) d.showModal();
  if(chatUnsub) chatUnsub();
  chatUnsub=db().collection("chats").doc(pairId(other)).collection("msgs").orderBy("at").limitToLast(100).onSnapshot(s=>{
    const box=$("chMsgs"); if(!box) return; const me=uid();
    box.innerHTML=s.docs.length?s.docs.map(x=>{ const m=x.data(), mine=m.from===me; return `<div class="chm ${mine?"mine":""}"><span>${E(m.text)}</span></div>`; }).join(""):`<p class="sub" style="text-align:center">첫 메시지를 보내 보세요</p>`;
    box.scrollTop=box.scrollHeight; },()=>{ const box=$("chMsgs"); if(box) box.innerHTML=`<p class="sub" style="text-align:center">대화할 수 없습니다. 서로 친구로 추가해야 합니다.</p>`; });
}


/* ---------- 선물: 개발자만 보낼 수 있어요(이벤트·보상용). 받는 건 누구나 ---------- */
const isDevOn=()=>document.body.classList.contains("dev-on");
function giftPaint(d){ const P=PATH.gift, name=d.dataset.n, tab=d.dataset.tab, its=P.allItems();
    d.innerHTML=`<div class="dh"><h2 style="margin:0">${E(name)} 님에게 선물</h2><button class="x" data-gclose aria-label="닫기">×</button></div><div class="db">
     <div class="shtabs" style="justify-content:flex-start"><button class="pill ${tab==="seed"?"on":""}" data-gtab="seed">씨앗</button><button class="pill ${tab==="item"?"on":""}" data-gtab="item">아이템</button></div>
     ${tab==="seed"?`<div class="gseeds" style="margin-top:10px">${[10,50,100,300,500,1000].map(n=>`<button class="pill" data-gseed="${n}">${n}개</button>`).join("")}</div>`
     :`<div class="gitems">${its.map(i=>`<div class="gi2"><div class="gp">${PATH.birdSvg({[i.slot]:i.id},"mini")}</div><b>${E(i.name)}</b><button class="pill sm on" data-gitem="${E(i.id)}">보내기</button></div>`).join("")}</div>`}
     <p class="sub" style="margin-top:10px">개발자 전용입니다. 내 씨앗·아이템은 줄지 않습니다.</p></div>`; }
let gBusy=false;
function giftDlg(to,name){
  const P=window.PATH&&PATH.gift; if(!P) return;
  let d=$("giftDlg"); if(!d){ d=document.createElement("dialog"); d.id="giftDlg"; document.body.appendChild(d);
    d.addEventListener("click",async ev=>{ if(ev.target===d||ev.target.closest("[data-gclose]")){ d.close(); return; }
      const tb=ev.target.closest("[data-gtab]"); if(tb){ d.dataset.tab=tb.dataset.gtab; giftPaint(d); return; }
      const sd=ev.target.closest("[data-gseed]"), it=ev.target.closest("[data-gitem]"); if(!sd&&!it||gBusy) return;
      const to=d.dataset.to, nm=d.dataset.n, day=A().today(), seed=!!sd;
      const amount=seed?+sd.dataset.gseed:0, item=seed?"":it.dataset.gitem, label=seed?"씨앗 "+amount+"개":"「"+P.itemName(item)+"」";
      if(!isDevOn()){ A().toast("개발자만 보낼 수 있습니다"); return; }
      if(!confirm(nm+" 님에게 "+label+"를 선물하시겠습니까?")) return;
      gBusy=true;
      try{ const g={from:uid(),fromName:"운영자",to,kind:seed?"seed":"item",day,claimed:false,at:Date.now()}; if(seed) g.amount=amount; else { g.item=item; g.itemName=P.itemName(item); }
        await db().collection("gifts").add(g);
        A().toast(nm+" 님에게 선물을 보냈습니다"); d.close(); }
      catch(e){ A().toast("보내지 못했어요(개발자 권한·서버 규칙 확인)"); }
      gBusy=false; }); }
  d.dataset.to=to; d.dataset.n=name; d.dataset.tab=d.dataset.tab||"seed";
  giftPaint(d); if(!d.open) d.showModal();
}
document.addEventListener("click",async e=>{
  const v=$("communityView"); if(!v||!v.contains(e.target)) return;
  const bd=e.target.closest("[data-bird]"), cm=e.target.closest("[data-cm]"), ch=e.target.closest("[data-cheer]"), rp=e.target.closest("[data-rep]"), ct=e.target.closest("[data-chat]"), gf=e.target.closest("[data-gift]"), cl=e.target.closest("[data-claim]"), fd=e.target.closest("[data-frdel]");
  if(fd){ if(!confirm("정말 「"+(fd.dataset.n||"이 친구")+"」님을 친구에서 삭제하시겠습니까?\n다시 서로 추가해야 친구가 됩니다.")) return; const o=fd.dataset.frdel; try{ await db().collection("follows").doc(uid()+"_"+o).delete(); }catch(err){} saveFr(friends().filter(f=>f.uid!==o)); wKey=""; startWatch(); render(); return; }
  if(bd){ birdDlg(bd.dataset.bird); return; }
  if(cm){ const a=cm.dataset.cm;
    if(a==="login"||a==="signup") A().openAuth(a);
    else if(a==="invite"){ if(window.SETTINGS) SETTINGS.invite(lg().code); } else if(a==="addfriend") addDlg(); else if(a==="notify") askNotify();
    else if(a==="verified"){ try{ await cloud().auth.currentUser.reload(); await cloud().auth.currentUser.getIdToken(true); }catch(err){} if(verified()) A().toast("인증됐습니다!"); else A().toast("아직 인증되지 않았습니다"); render(); }
    else if(a==="resend"){ try{ await cloud().auth.currentUser.sendEmailVerification(); A().toast("인증 메일을 다시 보냈습니다"); }catch(err){ A().toast("잠시 후 다시 해 주세요"); } }
    else if(a==="join") join(); else if(a==="leave") leave(); else if(a==="reload") render();
    else if(a==="copy"){ try{ await navigator.clipboard.writeText(lg().code); A().toast("복사했습니다"); }catch(err){ A().toast("코드: "+lg().code); } } }
  else if(cl){ cl.disabled=true; try{ const ref=db().collection("gifts").doc(cl.dataset.claim), snap=await ref.get(); const g=snap.data(); if(!snap.exists||g.to!==uid()||g.claimed) throw 0; await ref.update({claimed:true}); const got=window.PATH.gift.receive(g); A().toast(got?got+"를 받았어요!":"받았습니다"); }catch(err){ A().toast("받지 못했어요. 잠시 후 다시 해 주세요"); } render(); }
  else if(gf) giftDlg(gf.dataset.gift,gf.dataset.n);
  else if(ct) chatDlg(ct.dataset.chat,ct.dataset.n);
  else if(ch) cheerDlg(ch.dataset.cheer,ch.dataset.n);
  else if(rp) report(rp.dataset.rep);
});

/* ---------- 스타일 ---------- */
const ST=document.createElement("style");
ST.textContent=`.cm{max-width:640px;margin:0 auto;padding-bottom:20px}.cm h2{margin:6px 0 8px}
.cmrow3{display:flex;flex-direction:column;gap:2px;padding:13px 2px;border-bottom:1px solid var(--line)}.cmrow3 span{font-size:13px;color:var(--sub)}
.cmhd{display:flex;justify-content:space-between;align-items:flex-end;margin-top:6px}.cmhd small{display:block;color:var(--sub);font-size:12px}.cmme{font-weight:800;color:var(--accent-text);font-size:17px}
.cmact{margin:4px 0 8px}
.cml{border-top:1px solid var(--line)}.cml>.sub{padding:12px 2px}
.cmr{display:flex;align-items:center;gap:10px;padding:8px 2px;border-bottom:1px solid var(--line)}.cmr.me{background:var(--accent-soft);border-radius:10px;padding-left:8px;padding-right:8px}
.cmk{width:22px;text-align:center;font-weight:800;color:var(--sub);font-size:14px;flex:none}
.cmbw{width:48px;height:48px;flex:none;border:0;background:none;padding:0;cursor:pointer}.birdv{text-align:center;padding:6px 16px 18px}.birdv .bfrm{width:220px;height:220px;margin:0 auto 10px;border-radius:32px;border-width:4px}.birdv .bfrm .big{width:100%;height:auto}.cmbw.frm{border-radius:14px;border-width:2px}.birdv .bn{font-size:12px;color:var(--sub)}.cmbw svg{width:100%;height:100%;display:block}
.cmn{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.3}.cmn b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cmn small{color:var(--sub);font-size:11px}.cmn em{font-style:normal;font-size:10px;font-weight:800;color:var(--blue-dk);background:var(--blue-soft);border-radius:999px;padding:1px 6px;margin-left:4px}
.cmx{font-weight:800;font-size:15px;text-align:right}.cmx small{font-size:10px;color:var(--sub);margin-left:2px}
.cmb2{border:1px solid var(--line);background:none;border-radius:999px;font:inherit;font-size:12px;font-weight:700;padding:4px 10px;color:var(--accent-text);cursor:pointer}
.cmrep{border:0;background:none;color:var(--sub);font:inherit;font-size:10px;cursor:pointer;padding:2px;text-decoration:underline}
.cmh3{margin:22px 0 6px;font-size:15px;color:var(--sub);font-weight:600}.cmnew{font-style:normal;background:var(--accent);color:var(--onacc);border-radius:999px;font-size:10px;padding:1px 7px;margin-left:4px}
.cmcode{display:flex;justify-content:space-between;align-items:center;padding:10px 2px}.cmcode b{letter-spacing:.12em;font-size:17px;margin-left:6px}
.cmadd{display:flex;gap:8px;margin-bottom:8px}.cmadd input{flex:1;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--text);font:inherit;text-transform:uppercase}
.cmc{padding:10px 2px;border-bottom:1px solid var(--line);font-size:14px}.cmc small{display:block;color:var(--sub);font-size:11px}
.cmwait{font-size:11px;color:var(--sub);white-space:nowrap}.cmb2.chat{background:var(--accent);border-color:var(--accent);color:var(--onacc)}
.cmfh{display:flex;justify-content:space-between;align-items:center;margin-top:22px}.cmfb{display:flex;gap:6px}.cmqa{display:flex;align-items:center;gap:10px;margin:6px 0 4px}.cmqa b{letter-spacing:.1em;color:var(--text)}
.chmsgs{height:46vh;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:6px}.chm{display:flex}.chm span{max-width:78%;padding:8px 12px;border-radius:16px;background:var(--chip);word-break:break-word;font-size:15px}.chm.mine{justify-content:flex-end}.chm.mine span{background:var(--accent);color:var(--onacc)}
.chform{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line)}.chform input{flex:1;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--text);font:inherit}
#chatDlg,#addFrDlg{border:0;border-radius:18px;padding:0;max-width:400px;width:calc(100% - 28px);background:var(--card);color:var(--text)}#chatDlg::backdrop,#addFrDlg::backdrop{background:rgba(0,0,0,.45)}
.chhr{display:flex;gap:6px;align-items:center}.dh{position:relative}
.chmenu{position:absolute;right:46px;top:46px;z-index:5;background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.18);display:flex;flex-direction:column;min-width:130px;overflow:hidden}.chmenu[hidden]{display:none}.chmenu button{background:none;border:0;font:inherit;font-size:14px;text-align:left;padding:12px 14px;cursor:pointer;color:var(--text)}.chmenu button+button{border-top:1px solid var(--line)}.chmenu .danger{color:var(--bad)}
.cmtt.gold{background:linear-gradient(100deg,#f6d365,#f0a824,#f6d365);background-size:200% 100%;color:#5a3a00;box-shadow:0 0 8px rgba(240,168,36,.6);animation:cmgold 3s linear infinite}.cmtt.gold::before{content:"★ "}@keyframes cmgold{to{background-position:-200% 0}}.cmtt{font-style:normal;font-size:11px;font-weight:700;background:var(--accent-soft);color:var(--accent-text);border-radius:999px;padding:1px 8px;margin-left:4px;white-space:nowrap}.vb{position:relative}.vbdot{position:absolute;top:2px;right:calc(50% - 22px);min-width:17px;height:17px;border-radius:9px;background:var(--accent);color:var(--onacc);font-size:10px;font-weight:800;line-height:17px;text-align:center;padding:0 4px}
.cmb2.dotb{position:relative}.cmb2.dotb::after{content:"";position:absolute;top:-3px;right:-3px;width:9px;height:9px;border-radius:50%;background:var(--bad);border:2px solid var(--bg)}
.cmnotif{display:block;margin:10px auto 0;background:none;border:0;color:var(--sub);font:inherit;font-size:13px;text-decoration:underline;cursor:pointer}
.cmleave{display:block;margin:20px auto 0;background:none;border:0;color:var(--sub);font:inherit;font-size:13px;text-decoration:underline;cursor:pointer}
#birdDlg{border:0;border-radius:18px;padding:0;max-width:380px;width:calc(100% - 28px);background:var(--card);color:var(--text)}#birdDlg::backdrop{background:rgba(0,0,0,.45)}
#giftDlg{border:0;border-radius:18px;padding:0;max-width:400px;width:calc(100% - 28px);background:var(--card);color:var(--text);max-height:86vh}#giftDlg::backdrop{background:rgba(0,0,0,.45)}.gseeds{display:flex;gap:8px;flex-wrap:wrap}.gseeds .pill:disabled{opacity:.4}.gitems{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.gi2{border:1px solid var(--line);border-radius:12px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:13px}.gi2 .gp{width:78px;height:78px}.gi2 .gp svg{width:100%;height:100%}.cmg{display:flex;justify-content:space-between;align-items:center;gap:8px}.cmg small{display:block}
#cheerDlg{border:0;border-radius:18px;padding:0;max-width:380px;width:calc(100% - 28px);background:var(--card);color:var(--text)}#cheerDlg::backdrop{background:rgba(0,0,0,.45)}
.stk{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.stkb{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 2px;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--text);cursor:pointer;font:inherit}.stkb span{font-size:28px;line-height:1.2}.stkb small{font-size:10px;color:var(--sub)}.stkb:active{transform:scale(.94);background:var(--accent-soft)}.stkv{font-size:22px;vertical-align:middle}`;
ST.textContent+=`.cmav{position:relative;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:hsl(var(--h) 70% 90%);color:hsl(var(--h) 55% 32%);font-weight:900;font-size:19px}.cmav i{position:absolute;right:-4px;bottom:-3px;min-width:19px;height:19px;border-radius:999px;background:var(--accent);color:var(--onacc);font-style:normal;font-size:10px;font-weight:800;display:grid;place-items:center;padding:0 4px;border:2px solid var(--card)}.cmav.big{width:84px;height:84px;font-size:36px;margin:0 auto}
html[data-theme=dark] .cmav{background:hsl(var(--h) 35% 24%);color:hsl(var(--h) 70% 82%)}
.cmbw{width:44px!important;height:44px!important;border:0!important;background:none!important;padding:0!important}
.cmk.r1{color:#d49a00}.cmk.r2{color:#8a96a8}.cmk.r3{color:#b8733a}
.cmn{cursor:pointer}.cmn b em{font-style:normal;font-size:10.5px;font-weight:800;color:var(--accent-text);background:var(--accent-soft);border-radius:6px;padding:1px 6px;margin-left:4px;vertical-align:1px}.cmn b em.me{background:var(--accent);color:var(--onacc)}
.cmn small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cmcr{color:#e0a000;font-size:13px}
.cmb2.ph{visibility:hidden;pointer-events:none}
.pfc{text-align:center;padding:4px 18px 18px}.pfc h3{margin:10px 0 4px;font-size:20px;border:0;padding:0;background:none}.pfc h3::before{display:none}.pfc h3 em.me{font-style:normal;font-size:11px;font-weight:800;background:var(--accent);color:var(--onacc);border-radius:6px;padding:2px 7px;vertical-align:3px}
.pfst{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.pfst div{background:var(--ivory,var(--chip));border-radius:12px;padding:10px 4px}.pfst small{display:block;font-size:11px;color:var(--sub);font-weight:700}.pfst b{font-size:15px}
.pfmore{display:flex;justify-content:center;gap:16px;margin-top:14px}.pfmore button{border:0;background:none;color:var(--sub);font:inherit;font-size:12.5px;text-decoration:underline;cursor:pointer}`;
document.head.appendChild(ST);

try{ const au=A().cloud&&A().cloud.ok&&A().cloud.auth; if(au) au.onAuthStateChanged(()=>{ wKey=""; startWatch(); }); }catch(e){}
window.COMMUNITY={render,touch};
})();
