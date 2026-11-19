/* 커뮤니티 1단계 — 글 없이 즐기는 함께 공부하기
 * - 주간 리그: 이번 주 경험치 순위(참여를 켠 사람만 이름·경험치·연속 출석일·참새 모습이 보여요)
 * - 함께 공부 중: 오늘 공부한 사람 수 / 지금 공부 중인 사람 수(리그 참가자 기준)
 * - 친구: 친구 코드로 추가하고 이번 주 경험치를 서로 봐요
 * - 응원: 정해진 응원 문구만 보낼 수 있어요(자유 글 없음). 한 사람에게 하루 한 번
 * - 신고: 이상한 닉네임은 신고할 수 있어요
 * 저장 위치(Firestore): leagues/{주 시작일}/members/{uid}, codes/{코드}, cheers/{id}, reports/{id}
 * 로그인(계정)한 사람만 쓸 수 있어요. 게스트는 로그인 안내가 보여요.
 */
(function(){
const A=()=>window.APP;
const $=id=>document.getElementById(id);
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const STICKERS=["화이팅!","대단해요","같이 해요","오늘도 힘내요","고마워요"];
const REWARD=[50,30,20];
const lg=()=>A().LS.get("jp-league",{joined:false,code:"",claimed:{}});
const saveLg=v=>A().LS.set("jp-league",v);
const friends=()=>A().LS.get("jp-friends",[]);
const saveFr=v=>A().LS.set("jp-friends",v);
const cloud=()=>A().cloud;
const signedIn=()=>{ const c=cloud(); const p=A().curProfile(); return !!(c&&c.ok&&p&&p.cloud&&c.auth.currentUser&&c.auth.currentUser.uid===p.cloud); };
const uid=()=>cloud().auth.currentUser.uid;
const db=()=>cloud().db;

function weekKey(d){ const x=new Date(d||Date.now()); const dow=(x.getDay()+6)%7; x.setDate(x.getDate()-dow); return x.toLocaleDateString("sv-SE"); }
const prevWeek=()=>{ const x=new Date(); x.setDate(x.getDate()-7); return weekKey(x); };
function weekXp(){ const d=(A().LS.get("jp-xp",{d:{}}).d)||{}, w=weekKey(); let n=0; for(const k in d) if(weekKey(new Date(k+"T12:00:00"))===w) n+=d[k]; return n; }
const members=w=>db().collection("leagues").doc(w).collection("members");

/* ---------- 내 기록 올리기 ---------- */
let pubT=0;
function touch(){ if(!lg().joined) return; clearTimeout(pubT); pubT=setTimeout(publish,4000); }
async function publish(){
  if(!signedIn()||!lg().joined) return;
  const p=A().curProfile();
  try{ await members(weekKey()).doc(uid()).set({name:p.name,xp:weekXp(),streak:A().streakDays(),day:A().today(),eq:(window.PATH&&PATH.equip())||{},at:Date.now()}); }catch(e){}
}
const genCode=()=>{ const al="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s=""; for(let i=0;i<6;i++) s+=al[Math.floor(Math.random()*al.length)]; return s; };
async function join(){
  if(!signedIn()) return;
  const s=lg(); let code=s.code;
  if(!code){ for(let i=0;i<6&&!code;i++){ const c=genCode(); try{ await db().collection("codes").doc(c).set({uid:uid(),name:A().curProfile().name}); code=c; }catch(e){} } }
  if(!code){ A().toast("잠시 후 다시 해 주세요"); return; }
  s.joined=true; s.code=code; saveLg(s); await publish(); render();
}
async function leave(){
  if(!confirm("리그에서 나갈까요? 내 이름과 경험치가 목록에서 사라져요.")) return;
  try{ await members(weekKey()).doc(uid()).delete(); }catch(e){}
  const s=lg(); s.joined=false; saveLg(s); render();
}

/* ---------- 불러오기 ---------- */
async function load(){
  const w=weekKey(), snap=await members(w).orderBy("xp","desc").limit(50).get();
  const list=snap.docs.map(d=>({uid:d.id,...d.data()}));
  const fr=friends(); const have=new Set(list.map(x=>x.uid)); const extra=[];
  await Promise.all(fr.filter(f=>!have.has(f.uid)).map(async f=>{ try{ const d=await members(w).doc(f.uid).get(); extra.push(d.exists?{uid:f.uid,...d.data()}:{uid:f.uid,name:f.name,xp:0,none:true}); }catch(e){ extra.push({uid:f.uid,name:f.name,xp:0,none:true}); } }));
  let cheers=[]; try{ const cs=await db().collection("cheers").where("to","==",uid()).limit(50).get(); cheers=cs.docs.map(d=>d.data()).sort((a,b)=>b.at-a.at); }catch(e){}
  return {list,extra,cheers};
}
async function weeklyReward(){
  const pw=prevWeek(), s=lg(); if(s.claimed&&s.claimed[pw]) return;
  try{ const snap=await members(pw).orderBy("xp","desc").limit(3).get(); const i=snap.docs.findIndex(d=>d.id===uid());
    s.claimed=s.claimed||{}; s.claimed[pw]=1; saveLg(s);
    if(i>=0&&snap.docs[i].data().xp>0){ window.PATH&&PATH.addSeeds(REWARD[i]); A().toast("지난주 리그 "+(i+1)+"위! 씨앗 "+REWARD[i]+"개를 받았어요"); } }catch(e){}
}

/* ---------- 화면 ---------- */
const bird=(eq,cls)=>window.PATH?PATH.birdSvg(eq||{},cls||"cmb"):"";
const rangeText=()=>{ const a=new Date(weekKey()+"T12:00:00"), b=new Date(a); b.setDate(b.getDate()+6); const f=d=>(d.getMonth()+1)+"."+d.getDate(); return f(a)+" ~ "+f(b); };
let busy=false;
function row(x,rank,me,isFr){
  const mine=x.uid===(signedIn()?uid():"");
  return `<div class="cmr ${mine?"me":""}"><span class="cmk">${rank||""}</span><span class="cmbw">${bird(x.eq)}</span>
   <span class="cmn"><b>${E(x.name||"")}</b>${isFr&&!mine?` <em>친구</em>`:""}<small>${x.none?"이번 주 기록 없음":(x.streak?x.streak+"일 연속":"")}</small></span><span class="cmx">${x.xp||0}<small>XP</small></span>
   ${mine?"":`<button class="cmb2" data-cheer="${x.uid}" data-n="${E(x.name||"")}">응원</button><button class="cmrep" data-rep="${x.uid}" aria-label="신고">신고</button>`}</div>`;
}
async function render(){
  const v=$("communityView"); if(!v||busy) return;
  const head=`<div class="cm"><h2>커뮤니티</h2>`;
  if(!cloud()||!cloud().ok){ v.innerHTML=head+`<p class="sub">서버에 연결할 수 없어요. 인터넷을 확인해 주세요.</p></div>`; return; }
  if(!signedIn()){
    v.innerHTML=head+`<p class="sub">로그인하면 친구와 함께 공부하고, 주간 리그에 참여할 수 있어요.<br>글은 쓰지 않고, 이름과 이번 주 경험치만 보여요.</p>
     <div class="lrows"><div class="cmrow3"><b>주간 리그</b><span>이번 주 경험치 순위와 지난주 상위 3명에게 씨앗 선물</span></div><div class="cmrow3"><b>친구</b><span>친구 코드로 추가하고 서로 응원하기</span></div><div class="cmrow3"><b>함께 공부 중</b><span>오늘 몇 명이 공부했는지 한눈에</span></div></div>
     <div class="qbtns" style="margin-top:16px"><button class="cta" data-cm="login" style="max-width:240px">로그인</button><button class="cta sec" data-cm="signup" style="max-width:240px">회원가입</button></div></div>`; return; }
  if(!lg().joined){
    v.innerHTML=head+`<p class="sub">주간 리그에 참여할까요?</p><div class="lrows"><div class="cmrow3"><b>다른 사용자에게 보이는 것</b><span>닉네임(${E(A().curProfile().name)}), 이번 주 경험치, 연속 출석일, 내 참새 모습</span></div><div class="cmrow3"><b>보이지 않는 것</b><span>이메일, 틀린 단어, 학습 기록</span></div></div>
     <div class="qbtns" style="margin-top:16px"><button class="cta" data-cm="join" style="max-width:240px">참여하기</button></div><p class="sub" style="margin-top:10px">언제든 나갈 수 있어요.</p></div>`; return; }
  busy=true; v.innerHTML=head+`<p class="sub">불러오는 중…</p></div>`;
  let d; try{ await publish(); d=await load(); }catch(e){ busy=false; v.innerHTML=head+`<p class="sub">불러오지 못했어요. 잠시 후 다시 해 주세요.</p><button class="cta sec" data-cm="reload" style="max-width:200px">다시 시도</button></div>`; return; }
  busy=false; weeklyReward();
  const fr=friends(), frSet=new Set(fr.map(f=>f.uid)), me=signedIn()?uid():"";
  const today=A().today(), now=Date.now(), nToday=d.list.filter(x=>x.day===today).length, nNow=d.list.filter(x=>now-(x.at||0)<10*60*1000).length;
  const myIdx=d.list.findIndex(x=>x.uid===me), myXp=weekXp();
  const friendRows=fr.map(f=>{ const x=d.list.find(y=>y.uid===f.uid)||d.extra.find(y=>y.uid===f.uid)||{uid:f.uid,name:f.name,xp:0,none:true}; return row(x,"",false,true); }).join("");
  const seen=+(localStorage.getItem("jp-cheer-seen")||0), unread=d.cheers.filter(c=>c.at>seen).length;
  v.innerHTML=head+`<div class="cmhd"><div><b>이번 주 리그</b><small>${rangeText()}</small></div><div class="cmme">${myIdx>=0?(myIdx+1)+"위":"50위 밖"} · ${myXp} XP</div></div>
   <div class="sub cmact">오늘 ${nToday}명이 공부했어요${nNow?` · 지금 ${nNow}명이 공부 중`:""}</div>
   <div class="cml">${d.list.length?d.list.map((x,i)=>row(x,i+1,x.uid===me,frSet.has(x.uid))).join(""):`<p class="sub">아직 아무도 없어요. 첫 번째로 이름을 올려 보세요!</p>`}</div>
   <h3 class="cmh3">친구</h3>
   <div class="cmcode"><span>내 친구 코드 <b>${E(lg().code)}</b></span><button class="pill sm" data-cm="copy">복사</button></div>
   <form class="cmadd" id="cmAdd"><input name="c" maxlength="6" placeholder="친구 코드 6자리" autocomplete="off" autocapitalize="characters"><button class="pill on" type="submit">추가</button></form>
   <div class="cml">${fr.length?friendRows:`<p class="sub">친구 코드를 입력해서 친구를 추가해 보세요.</p>`}</div>
   <h3 class="cmh3">받은 응원${unread?` <em class="cmnew">새 ${unread}</em>`:""}</h3>
   <div class="cml">${d.cheers.length?d.cheers.slice(0,10).map(c=>`<div class="cmc"><b>${E(c.fromName||"")}</b> 님이 「${E(c.sticker)}」를 보냈어요<small>${new Date(c.at).toLocaleDateString("ko-KR")}</small></div>`).join(""):`<p class="sub">아직 받은 응원이 없어요.</p>`}</div>
   <button class="cmleave" data-cm="leave">리그에서 나가기</button></div>`;
  try{ localStorage.setItem("jp-cheer-seen",String(Date.now())); }catch(e){}
}

/* ---------- 응원 · 신고 · 친구 추가 ---------- */
function cheerDlg(to,name){
  let d=$("cheerDlg"); if(!d){ d=document.createElement("dialog"); d.id="cheerDlg"; document.body.appendChild(d);
    d.addEventListener("click",async ev=>{ if(ev.target===d||ev.target.closest("[data-cclose]")){ d.close(); return; }
      const s=ev.target.closest("[data-sticker]"); if(!s) return; const to=d.dataset.to, nm=d.dataset.n, day=A().today();
      try{ await db().collection("cheers").doc(uid()+"_"+to+"_"+day).set({from:uid(),fromName:A().curProfile().name,to,sticker:s.dataset.sticker,day,at:Date.now()}); A().toast(nm+" 님에게 응원을 보냈어요"); }
      catch(e){ A().toast("오늘은 이미 응원했어요"); } d.close(); }); }
  d.dataset.to=to; d.dataset.n=name;
  d.innerHTML=`<div class="dh"><h2 style="margin:0">${E(name)} 님에게 응원</h2><button class="x" data-cclose aria-label="닫기">×</button></div><div class="db"><div class="stk">${STICKERS.map(s=>`<button class="pill" data-sticker="${s}">${s}</button>`).join("")}</div><p class="sub" style="margin-top:10px">한 사람에게 하루에 한 번 보낼 수 있어요.</p></div>`;
  if(!d.open) d.showModal();
}
async function report(target){
  if(!confirm("이 사용자의 이름을 신고할까요?")) return;
  try{ await db().collection("reports").add({by:uid(),target,week:weekKey(),at:Date.now()}); A().toast("신고했어요. 확인할게요"); }catch(e){ A().toast("신고하지 못했어요"); }
}
async function addFriend(code){
  code=(code||"").trim().toUpperCase(); if(code.length!==6){ A().toast("친구 코드는 6자리예요"); return; }
  if(code===lg().code){ A().toast("내 코드예요"); return; }
  try{ const d=await db().collection("codes").doc(code).get(); if(!d.exists){ A().toast("없는 코드예요"); return; }
    const f=friends(); if(f.some(x=>x.uid===d.data().uid)){ A().toast("이미 친구예요"); return; }
    f.push({uid:d.data().uid,name:d.data().name}); saveFr(f); A().toast("「"+d.data().name+"」 님을 친구로 추가했어요"); render(); }catch(e){ A().toast("추가하지 못했어요"); }
}

document.addEventListener("click",async e=>{
  const v=$("communityView"); if(!v||!v.contains(e.target)) return;
  const cm=e.target.closest("[data-cm]"), ch=e.target.closest("[data-cheer]"), rp=e.target.closest("[data-rep]");
  if(cm){ const a=cm.dataset.cm;
    if(a==="login"||a==="signup") A().openAuth(a);
    else if(a==="join") join(); else if(a==="leave") leave(); else if(a==="reload") render();
    else if(a==="copy"){ try{ await navigator.clipboard.writeText(lg().code); A().toast("복사했어요"); }catch(err){ A().toast("코드: "+lg().code); } } }
  else if(ch) cheerDlg(ch.dataset.cheer,ch.dataset.n);
  else if(rp) report(rp.dataset.rep);
});
document.addEventListener("submit",e=>{ if(e.target.id==="cmAdd"){ e.preventDefault(); addFriend(new FormData(e.target).get("c")); } });

/* ---------- 스타일 ---------- */
const ST=document.createElement("style");
ST.textContent=`.cm{max-width:640px;margin:0 auto;padding-bottom:20px}.cm h2{margin:6px 0 8px}
.cmrow3{display:flex;flex-direction:column;gap:2px;padding:13px 2px;border-bottom:1px solid var(--line)}.cmrow3 span{font-size:13px;color:var(--sub)}
.cmhd{display:flex;justify-content:space-between;align-items:flex-end;margin-top:6px}.cmhd small{display:block;color:var(--sub);font-size:12px}.cmme{font-weight:800;color:var(--accent-text);font-size:17px}
.cmact{margin:4px 0 8px}
.cml{border-top:1px solid var(--line)}.cml>.sub{padding:12px 2px}
.cmr{display:flex;align-items:center;gap:10px;padding:8px 2px;border-bottom:1px solid var(--line)}.cmr.me{background:var(--accent-soft);border-radius:10px;padding-left:8px;padding-right:8px}
.cmk{width:22px;text-align:center;font-weight:800;color:var(--sub);font-size:14px;flex:none}
.cmbw{width:38px;height:38px;flex:none}.cmbw svg{width:100%;height:100%;display:block}
.cmn{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.3}.cmn b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cmn small{color:var(--sub);font-size:11px}.cmn em{font-style:normal;font-size:10px;font-weight:800;color:var(--blue-dk);background:var(--blue-soft);border-radius:999px;padding:1px 6px;margin-left:4px}
.cmx{font-weight:800;font-size:15px;text-align:right}.cmx small{font-size:10px;color:var(--sub);margin-left:2px}
.cmb2{border:1px solid var(--line);background:none;border-radius:999px;font:inherit;font-size:12px;font-weight:700;padding:4px 10px;color:var(--accent-text);cursor:pointer}
.cmrep{border:0;background:none;color:var(--sub);font:inherit;font-size:10px;cursor:pointer;padding:2px;text-decoration:underline}
.cmh3{margin:22px 0 6px;font-size:15px;color:var(--sub);font-weight:600}.cmnew{font-style:normal;background:var(--accent);color:var(--onacc);border-radius:999px;font-size:10px;padding:1px 7px;margin-left:4px}
.cmcode{display:flex;justify-content:space-between;align-items:center;padding:10px 2px}.cmcode b{letter-spacing:.12em;font-size:17px;margin-left:6px}
.cmadd{display:flex;gap:8px;margin-bottom:8px}.cmadd input{flex:1;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--text);font:inherit;text-transform:uppercase}
.cmc{padding:10px 2px;border-bottom:1px solid var(--line);font-size:14px}.cmc small{display:block;color:var(--sub);font-size:11px}
.cmleave{display:block;margin:20px auto 0;background:none;border:0;color:var(--sub);font:inherit;font-size:13px;text-decoration:underline;cursor:pointer}
#cheerDlg{border:0;border-radius:18px;padding:0;max-width:380px;width:calc(100% - 28px);background:var(--card);color:var(--text)}#cheerDlg::backdrop{background:rgba(0,0,0,.45)}
.stk{display:flex;flex-wrap:wrap;gap:8px}`;
document.head.appendChild(ST);

window.COMMUNITY={render,touch};
})();
