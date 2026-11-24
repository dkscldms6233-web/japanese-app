/* 홈 화면에 추가 안내: 안드로이드 크롬은 '추가하기' 버튼으로 바로 설치, 아이폰은 방법을 알려 줘요.
 * 이미 앱으로 열었거나(standalone) 최근에 '나중에'를 눌렀다면 보이지 않아요. */
(function(){
const KEY="jp-install-dismiss", DAY=864e5;
const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true||document.referrer.startsWith("android-app://");
if(standalone) return;
let last=0; try{ last=+localStorage.getItem(KEY)||0; }catch(e){}
if(Date.now()-last<7*DAY) return;
const ios=/iPhone|iPad|iPod/.test(navigator.userAgent);
let dp=null, box=null;
const css=`#instBar{position:fixed;left:12px;right:12px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:9000;max-width:520px;margin:0 auto;background:#fff;color:#141a33;border-radius:18px;padding:14px 14px 14px 16px;box-shadow:0 10px 36px rgba(20,20,80,.28);border:1.5px solid #e4e0ff;display:flex;gap:12px;align-items:center;font-family:inherit}
#instBar img{width:44px;height:44px;border-radius:11px;flex:none}
#instBar .t{flex:1;min-width:0;font-size:14px;line-height:1.4}#instBar .t b{display:block;font-size:15.5px;margin-bottom:2px}
#instBar button{border:0;border-radius:12px;font:inherit;font-weight:800;cursor:pointer}
#instBar .go{background:#5b5bf0;color:#fff;padding:11px 14px;font-size:14.5px;flex:none}
#instBar .no{background:none;color:#5a6486;font-size:22px;padding:4px 8px;flex:none}
:root[data-theme=dark] #instBar{background:#1c2040;color:#f1f3fb;border-color:#343a66}:root[data-theme=dark] #instBar .go{background:#8e8eff;color:#0d0f1e}:root[data-theme=dark] #instBar .no{color:#aab2d4}`;
function close(){ try{ localStorage.setItem(KEY,String(Date.now())); }catch(e){} if(box){ box.remove(); box=null; } }
function show(){
  if(box||document.getElementById("onb")&&document.getElementById("onb").offsetParent) { setTimeout(show,4000); return; }
  const st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);
  box=document.createElement("div"); box.id="instBar"; box.setAttribute("role","dialog"); box.setAttribute("aria-label","홈 화면에 추가");
  const msg=ios?`<b>홈 화면에 추가해 보세요</b>아래 <b style="display:inline;font-size:inherit">공유 버튼 ⬆︎</b> → <b style="display:inline;font-size:inherit">홈 화면에 추가</b>를 누르면 앱처럼 바로 열려요.`
              :`<b>홈 화면에 추가할까요?</b>앱처럼 바로 열 수 있어요.`;
  box.innerHTML=`<img src="icon-192.png" alt=""><div class="t">${msg}</div>${ios?"":`<button class="go" type="button">추가하기</button>`}<button class="no" type="button" aria-label="닫기">×</button>`;
  document.body.appendChild(box);
  box.querySelector(".no").onclick=close;
  const go=box.querySelector(".go"); if(go) go.onclick=async()=>{ if(!dp){ close(); return; } dp.prompt(); try{ await dp.userChoice; }catch(e){} dp=null; close(); };
}
window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); dp=e; setTimeout(show,2500); });
window.addEventListener("appinstalled",()=>{ close(); });
if(ios) window.addEventListener("load",()=>setTimeout(show,3500));
})();
