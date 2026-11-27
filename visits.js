/* 방문자 수(익명): 기기마다 무작위 번호(jp-vid)를 한 번 만들고, 하루에 한 번만 서버(visits)에 "오늘 왔습니다"를 남깁니다.
 * 이름·이메일·학습 내용은 저장하지 않습니다. 개발자 계정만 읽을 수 있어요(firestore.rules). 내 컴퓨터(localhost)와 개발자 기기는 세지 않습니다. */
(function(){
if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
const day=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
function go(){
  try{
    if(localStorage.getItem("jp-vskip")==="1") return;
    const d=day(); if(localStorage.getItem("jp-vday")===d) return;
    if(!window.firebase||!firebase.apps||!firebase.apps.length) return;
    let v=localStorage.getItem("jp-vid"), nw=false;
    if(!v){ const a=new Uint8Array(9); crypto.getRandomValues(a); v=[...a].map(x=>x.toString(36).padStart(2,"0")).join("").slice(0,12); localStorage.setItem("jp-vid",v); nw=true; }
    const pwa=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
    firebase.firestore().collection("visits").doc(d+"_"+v).set({d,v,t:Date.now(),pwa:!!pwa,nw}).then(()=>{ localStorage.setItem("jp-vday",d); }).catch(()=>{});
  }catch(e){}
}
addEventListener("load",()=>setTimeout(go,4000));
})();
