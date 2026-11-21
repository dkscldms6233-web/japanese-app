/* 설정 — 이용자가 직접 바꾸는 간단한 앱 설정
 * 화면 모드 · 글자 크기 · 후리가나 · 하루 목표 · 내 급수 · 게임 소리 · 계정 · 기록 백업/복원/초기화
 * 값은 기존 설정(prefs)에 그대로 저장돼요. */
(function(){
const A=()=>window.APP, $=id=>document.getElementById(id);
const KEYS=["jp-kana","jp-custom","jp-star","jp-prefs","jp-wrong","jp-miss","jp-log","jp-read","jp-best","jp-path","jp-xp","jp-srs","jp-wlog","jp-gift","jp-char"];
const SCALES=[["normal","보통",1],["large","크게",1.1],["xl","아주 크게",1.2]];

/* 글자 크기: 시작할 때 저장된 값을 적용해요 */
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
   ${row(prof.cloud?E(prof.name):"게스트",prof.cloud?"로그인됨":"기록이 이 기기에만 저장돼요",`<button type="button" class="pill" data-st="acct">${prof.cloud?"계정 열기":"로그인·가입"}</button>`)}
   <h3 class="sth">내 기록</h3>
   <div class="stbtns"><button type="button" class="pill" data-st="backup">백업 복사</button><button type="button" class="pill" data-st="restore">백업에서 복원</button><button type="button" class="pill dng" data-st="reset">학습 기록 지우기</button></div>
   <p class="sub stnote">백업은 기록을 글자로 복사해 둬요. 다른 기기에서 「백업에서 복원」에 붙여 넣으면 이어서 쓸 수 있어요.</p>
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
  else if(k==="backup"){ const o={}; KEYS.forEach(x=>{ const val=a.LS.get(x,null); if(val!==null) o[x]=val; }); const t=JSON.stringify({app:"surasura",v:1,data:o});
    try{ await navigator.clipboard.writeText(t); a.toast("기록을 복사했어요. 메모 앱 같은 곳에 붙여 넣어 보관하세요"); }catch(e){ prompt("아래 글자를 모두 복사해서 보관하세요",t); } }
  else if(k==="restore"){ const t=prompt("복사해 둔 백업을 붙여 넣어 주세요"); if(!t) return; let o; try{ o=JSON.parse(t); }catch(e){ a.toast("백업 형식이 아니에요"); return; }
    if(!o||o.app!=="surasura"||!o.data){ a.toast("이 앱의 백업이 아니에요"); return; }
    if(!confirm("지금 기록을 백업 내용으로 바꿀까요? 지금 기록은 사라져요.")) return;
    Object.keys(o.data).filter(x=>KEYS.includes(x)).forEach(x=>a.LS.set(x,o.data[x])); a.toast("복원했어요"); setTimeout(()=>location.reload(),600); }
  else if(k==="reset"){ if(!confirm("학습 기록과 오답 노트를 모두 지울까요? 단어와 저장함은 그대로예요.")) return; if(!confirm("정말 지울까요? 되돌릴 수 없어요.")) return; a.resetLearning(); a.toast("기록을 지웠어요"); a.renderHome(); }
}

function addBtn(){ const tools=document.querySelector(".tools"); if(!tools||$("setBtn")) return;
  const b=document.createElement("button"); b.id="setBtn"; b.type="button"; b.className="pill sm"; b.setAttribute("aria-label","설정"); b.title="설정"; b.innerHTML=A().ic("gear"); b.addEventListener("click",render); tools.appendChild(b); }
try{ applyScale(); addBtn(); }catch(e){}
window.SETTINGS={open:render};

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
.stnote{margin:10px 0 2px;line-height:1.5}`;
document.head.appendChild(ST);
})();
