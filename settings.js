/* 설정 — 이용자가 직접 바꾸는 간단한 앱 설정
 * 화면 모드 · 글자 크기 · 후리가나 · 하루 목표 · 내 급수 · 게임 소리 · 계정 · 기록 백업/복원/초기화
 * 값은 기존 설정(prefs)에 그대로 저장됩니다. */
(function(){
const A=()=>window.APP, $=id=>document.getElementById(id);
const SCALES=[["normal","보통",1],["large","크게",1.1],["xl","아주 크게",1.2]];

/* 글자 크기: 시작할 때 저장된 값을 적용합니다 */
function scaleOf(){ const k=A().prefs().fontScale; return (SCALES.find(x=>x[0]===k)||SCALES[0]); }
function applyScale(){ const z=scaleOf()[2]; document.body.style.zoom=z===1?"":String(z); }

function seg(name,items,cur){ return `<div class="stseg" role="group">${items.map(([v,l])=>`<button type="button" class="pill ${String(cur)===String(v)?"on":""}" data-st="${name}" data-v="${v}" aria-pressed="${String(cur)===String(v)}">${l}</button>`).join("")}</div>`; }
const row=(t,sub,ctrl)=>`<div class="strow"><div class="stl"><b>${t}</b>${sub?`<small>${sub}</small>`:""}</div>${ctrl}</div>`;

function render(){
  const d=dlg(), P=A().prefs(), my=A().myLv(), prof=A().curProfile(), th=A().theme();
  const lvs=["전체","N5","N4","N3","N2","N1"].map(l=>{ const on=l==="전체"?!my.length:my.includes(l); return `<button type="button" class="pill sm ${on?"on":""}" data-st="lv" data-v="${l}" aria-pressed="${on}">${l}</button>`; }).join("");
  d.innerHTML=`<div class="dh"><h2 style="margin:0">설정</h2><button class="x" data-stx aria-label="닫기">×</button></div><div class="db stdb">
   ${row("화면 모드","",seg("theme",[["auto","자동"],["light","라이트"],["dark","다크"]],th))}
   ${row("글자 크기","",seg("scale",SCALES.map(x=>[x[0],x[1]]),scaleOf()[0]))}
   ${row("후리가나","한자 위의 읽기",`<label class="stsw"><input type="checkbox" data-st="furi" ${P.nofuri?"":"checked"}><span>보이기</span></label>`)}
   ${row("하루 목표",null,seg("goal",[[10,"10문제"],[20,"20문제"],[30,"30문제"]],A().goalN()))}
   ${row("내 급수","홈·퀴즈의 기본 범위",`<div class="stchips">${lvs}</div>`)}
   ${row("게임 소리","배경음악과 효과음",`<label class="stsw"><input type="checkbox" data-st="sound" ${P.sound===false?"":"checked"}><span>켜기</span></label>`)}
   <h3 class="sth">계정</h3>
   ${row(prof.cloud?E(prof.name):"게스트",prof.cloud?"로그인됨":"기록이 이 기기에만 저장됩니다",`<button type="button" class="pill" data-st="acct">${prof.cloud?"계정 열기":"로그인·가입"}</button>`)}
   <details class="stmore"><summary>더 보기 <small>도움 · 기록 지우기</small></summary>
   <h3 class="sth">도움</h3>
   ${row("앱 둘러보기","주요 기능을 한눈에 보기",`<button type="button" class="pill" data-st="tour">보기</button>`)}
   ${row("친구 초대하기","앱을 아직 안 쓰는 친구에게 링크 보내기",`<button type="button" class="pill" data-st="invite">초대</button>`)}
   ${row("문의하기","오류·제안을 보내 주세요",`<button type="button" class="pill" data-st="inq">문의</button>`)}
   <h3 class="sth">내 기록</h3>
   <div class="stbtns"><button type="button" class="pill dng" data-st="reset">학습 기록 지우기</button></div>
   </details>
  </div>`;
  if(!d.open) d.showModal();
}
const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function dlg(){ let d=$("setDlg"); if(!d){ d=document.createElement("dialog"); d.id="setDlg"; document.body.appendChild(d);
  d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-stx]")){ d.close(); return; }
    const b=ev.target.closest("button[data-st]"); if(b) act(b); });
  d.addEventListener("change",ev=>{ const i=ev.target.closest("input[data-st]"); if(!i) return;
    if(i.dataset.st==="furi") A().applyFuri(!i.checked);
    else if(i.dataset.st==="sound") A().setPref("sound",i.checked); }); }
  return d; }

async function act(b){ const k=b.dataset.st, v=b.dataset.v, a=A();
  if(k==="theme"){ a.setTheme(v); render(); }
  else if(k==="scale"){ a.setPref("fontScale",v); applyScale(); render(); }
  else if(k==="goal"){ a.setPref("goal",+v); a.renderHome(); render(); }
  else if(k==="lv"){ let cur=a.myLv().slice(); if(v==="전체") cur=[]; else cur=cur.includes(v)?cur.filter(x=>x!==v):cur.concat(v); a.applyMyLevels(cur); render(); }
  else if(k==="acct"){ $("setDlg").close(); a.openProf(); }
  else if(k==="tour"){ $("setDlg").close(); if(window.TOUR) TOUR.open(); }
  else if(k==="invite"){ invite(); }
  else if(k==="inq"){ inquiry(); }
  else if(k==="reset"){ if(!confirm("학습 기록과 오답 노트를 모두 지우시겠습니까? 단어와 저장함은 그대로입니다.")) return; if(!confirm("정말 지우시겠습니까? 되돌릴 수 없습니다.")) return; a.resetLearning(); a.toast("기록을 지웠습니다"); a.renderHome(); }
}


/* ---------- 친구 초대: 앱을 아직 안 쓰는 친구에게 링크를 보냅니다 ---------- */
function appUrl(){ return location.href.split("#")[0].split("?")[0].replace(/index\.html$/,""); }
async function invite(code){
  const text="일본어 같이 공부합시다! 술술 일본어에서 만납니다."+(code?" 내 친구 코드는 "+code+"입니다.":""), url=appUrl();
  try{ if(navigator.share){ await navigator.share({title:"술술 일본어",text,url}); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
  try{ await navigator.clipboard.writeText(text+"\n"+url); A().toast("초대 문구와 링크를 복사했습니다"); }catch(e){ prompt("복사해서 친구에게 보내 주세요",text+"\n"+url); }
}

/* ---------- 문의하기: 로그인한 이용자가 개발자에게 글을 남겨요(하루 3번까지) ---------- */
function inqDlg(){ let d=$("inqDlg"); if(!d){ d=document.createElement("dialog"); d.id="inqDlg"; document.body.appendChild(d);
  d.addEventListener("click",async ev=>{ if(ev.target===d||ev.target.closest("[data-iqx]")){ d.close(); return; }
    if(ev.target.closest("[data-iqlogin]")){ d.close(); const s=$("setDlg"); if(s&&s.open) s.close(); A().openAuth("login"); return; }
    if(!ev.target.closest("[data-iqsend]")) return;
    const text=($("iqText").value||"").trim(), kind=$("iqKind").value, err=$("iqErr");
    if(!text){ err.textContent="내용을 적어 주세요"; return; }
    const btn=ev.target.closest("[data-iqsend]"); btn.disabled=true;
    try{ const c=A().cloud, u=c.auth.currentUser, day=A().today(); let ok=false;
      for(let n=0;n<3&&!ok;n++){ try{ await c.db.collection("inquiries").doc(u.uid+"_"+day+"_"+n).set({from:u.uid,name:String(A().curProfile().name||"").slice(0,20),kind,text:text.slice(0,500),day,at:Date.now()}); ok=true; }catch(e){} }
      if(!ok) throw 0; A().toast("문의를 보냈습니다. 고맙습니다"); d.close(); }
    catch(e){ err.textContent="보내지 못했습니다. 하루에 3번까지 보낼 수 있고, 잠시 뒤 다시 해 주세요"; btn.disabled=false; } }); }
  return d; }
function inquiry(pre){
  const d=inqDlg(), p=A().curProfile(), c=A().cloud;
  const ok=p&&p.cloud&&c&&c.ok&&c.auth.currentUser;
  d.innerHTML=`<div class="dh"><h2 style="margin:0">문의하기</h2><button class="x" data-iqx aria-label="닫기">×</button></div><div class="db iqdb">
   ${ok?`<label class="iql">종류<select id="iqKind"><option value="bug">오류 신고</option><option value="idea">기능 제안</option><option value="etc">기타</option></select></label>
   <label class="iql">내용<textarea id="iqText" rows="5" maxlength="500" placeholder="어떤 화면에서 어떤 일이 있었는지 적어 주세요"></textarea></label>
   <p class="iqerr" id="iqErr" role="alert"></p>
   <button type="button" class="cta" data-iqsend>보내기</button>
   <p class="sub stnote">하루에 3번까지 보낼 수 있습니다. 이름과 문의 내용만 전달됩니다.</p>`
   :`<p class="sub" style="margin:8px 0 14px">문의는 로그인한 뒤에 보낼 수 있습니다.</p><button type="button" class="cta" data-iqlogin>로그인</button>`}
  </div>`;
  if(!d.open) d.showModal();
  if(pre&&ok&&$("iqText")){ $("iqKind").value=pre.kind||"bug"; const t=$("iqText"); t.value=String(pre.text||"").slice(0,450); t.focus(); t.setSelectionRange(t.value.length,t.value.length); }
}
function addBtn(){ const tools=document.querySelector(".tools"); if(!tools||$("setBtn")) return;
  const b=document.createElement("button"); b.id="setBtn"; b.type="button"; b.className="pill sm"; b.setAttribute("aria-label","설정"); b.title="설정"; b.innerHTML=A().ic("gear"); b.addEventListener("click",render); tools.appendChild(b); }
try{ applyScale(); addBtn(); }catch(e){}
window.SETTINGS={open:render,invite,inquiry};

const ST=document.createElement("style");
ST.textContent=`#setBtn{padding:5px 9px;display:inline-flex;align-items:center;background:var(--card)!important;border:1px solid var(--line);color:var(--text);position:relative;z-index:2}#setBtn .ic{width:17px;height:17px}
#setDlg{border:0;border-radius:18px;padding:0;max-width:440px;width:calc(100% - 24px);max-height:90vh;background:var(--card);color:var(--text)}#setDlg::backdrop{background:rgba(0,0,0,.45)}
.stdb .strow{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}
.stl{display:flex;flex-direction:column;min-width:0}.stl b{font-size:15px}.stl small{font-size:12px;color:var(--sub)}
.stseg{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}.stseg .pill{padding:5px 11px;font-size:13px}
.stchips{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end;max-width:210px}
.stsw{display:inline-flex;align-items:center;gap:8px;font-size:14px;cursor:pointer}.stsw input{width:20px;height:20px;accent-color:var(--accent)}
.sth{font-size:13px;color:var(--sub);font-weight:700;letter-spacing:.03em;margin:18px 0 0}
.stbtns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.stbtns .dng{color:#c0392b;border-color:#e3b3ad}
.stnote{margin:10px 0 2px;line-height:1.5}
#inqDlg{border:0;border-radius:18px;padding:0;max-width:440px;width:calc(100% - 24px);background:var(--card);color:var(--text)}#inqDlg::backdrop{background:rgba(0,0,0,.45)}
.iql{display:flex;flex-direction:column;gap:6px;font-size:14px;font-weight:700;margin-bottom:12px}.iql select,.iql textarea{font:inherit;font-weight:400;border:1px solid var(--line);border-radius:10px;padding:9px 10px;background:var(--bg);color:var(--text);width:100%;box-sizing:border-box}.iqerr{color:#c0392b;font-size:13px;min-height:18px;margin:0 0 6px}`;
document.head.appendChild(ST);
})();
