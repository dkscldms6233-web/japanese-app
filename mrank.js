/* 짝 맞추기 주간 랭킹 — 이번 주(월~일) 최고 점수 순위. 매주 월요일에 새로 시작합니다.
 * 저장: mrank/{주 시작일}/members/{uid} = {name, score, eq, at} (이메일 인증한 로그인 계정만) */
(function(){
const A=()=>window.APP, $=id=>document.getElementById(id);
const E=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function weekKey(){ const x=new Date(); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x.toLocaleDateString("sv-SE"); }
const cl=()=>A().cloud;
const signedIn=()=>{ const c=cl(), p=A().curProfile(); return !!(c&&c.ok&&p&&p.cloud&&c.auth.currentUser&&c.auth.currentUser.uid===p.cloud); };
const verified=()=>{ try{ return !!cl().auth.currentUser.emailVerified; }catch(e){ return false; } };
const col=()=>cl().db.collection("mrank").doc(weekKey()).collection("members");
const eqOf=()=>(window.PATH&&PATH.equip&&PATH.equip())||{};

/* 점수 올리기: 이번 주 내 기록보다 높을 때만 */
async function submit(score){
  try{ if(!(score>0)||!signedIn()||!verified()) return null;
    const ref=col().doc(cl().auth.currentUser.uid), d=await ref.get();
    if(d.exists&&(d.data().score||0)>=score) return null;
    await ref.set({name:String(A().curProfile().name||"").slice(0,12),score:Math.min(score,5000),eq:eqOf(),at:Date.now()});
    return true; }catch(e){ return null; }
}
function dlg(){ let d=$("mrDlg"); if(!d){ d=document.createElement("dialog"); d.id="mrDlg"; document.body.appendChild(d);
  d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-mrx]")){ d.close(); return; }
    if(ev.target.closest("[data-mrlogin]")){ d.close(); A().openAuth("login"); } }); }
  return d; }
const head=b=>`<div class="dh"><h2 style="margin:0">짝 맞추기 주간 랭킹</h2><button class="x" data-mrx aria-label="닫기">×</button></div><div class="db mrdb">${b}</div>`;
async function open(){
  const d=dlg(); if(!d.open) d.showModal();
  if(!signedIn()){ d.innerHTML=head(`<p class="sub">랭킹은 로그인한 뒤에 볼 수 있습니다.<br>점수를 올려서 친구들과 겨뤄 보세요.</p><button type="button" class="cta" data-mrlogin>로그인·가입</button>`); return; }
  d.innerHTML=head(`<p class="sub">불러오는 중…</p>`);
  try{
    const snap=await col().orderBy("score","desc").limit(20).get(), me=cl().auth.currentUser.uid;
    const list=snap.docs.map(x=>({uid:x.id,...x.data()}));
    const mine=list.findIndex(x=>x.uid===me);
    const rows=list.map((x,i)=>`<div class="cmr ${x.uid===me?"me":""}"><span class="cmk">${i+1}</span><span class="cmbw">${window.PATH?PATH.birdSvg(x.eq||{},"cmb"):""}</span><span class="cmn"><b>${E(x.name)}</b></span><span class="cmx">${x.score||0}<small>점</small></span></div>`).join("");
    d.innerHTML=head(`<p class="sub">이번 주 최고 점수 순위입니다.<br>매주 월요일에 새로 시작합니다.</p>${list.length?`<div class="cmlist">${rows}</div>`:`<p class="sub" style="margin:18px 0">아직 기록이 없습니다. 첫 번째 주인공이 되어 보세요!</p>`}${!verified()?`<p class="sub">이메일 인증을 마치면 내 점수도 올라갑니다.</p>`:(mine<0?`<p class="sub">20위 안에 들면 여기에 이름이 나옵니다.</p>`:"")}`);
  }catch(e){ d.innerHTML=head(`<p class="sub">랭킹을 불러오지 못했습니다. 잠시 뒤 다시 해 주세요.</p>`); }
}
window.MRANK={submit,open};
})();
