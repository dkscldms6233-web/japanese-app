/* 씨앗 구매 (토스페이먼츠 웹 결제) — 지금은 꺼져 있어요.
 * 흐름: 구매 버튼 → 서버에서 주문 만들기(createOrder) → 토스 결제창 → 앱으로 돌아옴(?pay=ok…) → 서버가 승인 + 지급 확인(confirmOrder) → 씨앗이 들어와요
 * 켜는 조건: CFG.on=true · CFG.clientKey(토스 클라이언트 키) · 서버(functions/) 배포 · 로그인한 이메일 인증 계정
 * 가격·씨앗 개수의 기준은 서버(functions/index.js의 PACKS)예요. 여기 적힌 값은 화면 표시용이에요. 설정 순서는 store/결제_연결_안내.md 를 보세요. */
(function(){
const CFG={
  on:false,                         // 준비가 끝나면 true
  soon:true,                        // true면 아직 결제가 안 될 때 상점에 "준비 중" 안내를 보여 줘요
  clientKey:"",                     // 토스 클라이언트 키 (테스트: test_ck_..., 실서비스: live_ck_...) — 공개돼도 되는 키예요
  apiBase:"https://asia-northeast3-surasura-nihongo.cloudfunctions.net",   // Functions 주소 (서울 리전)
  /* 화면 표시용 (서버 PACKS와 같게 유지): 가격은 부가세 10% 포함 */
  packs:[{sku:"seeds_100",seeds:100,price:1100,tag:"맛보기"},{sku:"seeds_300",seeds:300,price:2750,tag:"인기"},{sku:"seeds_700",seeds:700,price:5500,tag:"알뜰"},{sku:"seeds_1500",seeds:1500,price:11000,tag:"최고 가성비"}],
  firstBonus:"첫 구매 +50%"
};
const SDK="https://js.tosspayments.com/v2/standard";
let busy=false, sdkP=null;
const A=()=>window.APP;
const won=n=>n.toLocaleString("ko-KR")+"원";
const signedIn=()=>{ try{ const c=A().cloud, p=A().curProfile(); return !!(c&&c.ok&&p&&p.cloud&&c.auth.currentUser&&c.auth.currentUser.uid===p.cloud); }catch(e){ return false; } };
/* 구글 플레이 앱(TWA)으로 열었을 때는 웹 결제를 보여 주지 않아요 (플레이 정책: 앱 안 디지털 상품은 구글 결제만). TWA는 처음 열릴 때 referrer가 android-app:// 로 시작해요 */
const inPlayApp=()=>{ try{ if(document.referrer&&document.referrer.indexOf("android-app://")===0) sessionStorage.setItem("jp-twa","1"); return sessionStorage.getItem("jp-twa")==="1"; }catch(e){ return false; } };
const ready=()=>CFG.on&&!!CFG.clientKey&&!inPlayApp();
const ic=px=>window.PATH&&PATH.seedIc?PATH.seedIc(px):"";
function loadSdk(){ return sdkP||(sdkP=new Promise((res,rej)=>{ if(window.TossPayments) return res(); const s=document.createElement("script"); s.src=SDK; s.onload=res; s.onerror=()=>{ sdkP=null; rej(new Error("sdk")); }; document.head.appendChild(s); })); }
/* 서버 함수 호출 (callable 규약: POST {data} + 로그인 토큰) */
async function call(name,data){
  const idt=await A().cloud.auth.currentUser.getIdToken();
  const r=await fetch(CFG.apiBase+"/"+name,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+idt},body:JSON.stringify({data})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||j.error) throw new Error((j.error&&j.error.message)||"요청에 실패했어요.");
  return j.result;
}
/* 상점 화면에 끼워 넣는 조각 — 꺼져 있고 soon도 꺼져 있으면 빈 문자열 */
function html(){
  if(inPlayApp()) return "";
  if(!ready()){
    if(!CFG.soon) return "";
    return `<div class="seedpay soon"><b>씨앗 사기</b><div class="seedpacks">${CFG.packs.map(p=>`<button type="button" class="pill" disabled>${ic(24)}<b style="display:block">${p.seeds}개</b><small style="display:block;font-size:11px;font-weight:600">준비 중</small>${p.tag?`<em class="seedtag">${p.tag}</em>`:""}</button>`).join("")}</div><small>씨앗 구매는 준비 중이에요. 곧 만나요! 지금은 공부하면서 모을 수 있어요.</small></div>`;
  }
  if(!signedIn()) return `<div class="seedpay"><b>씨앗 사기</b><small>로그인(이메일 인증 완료)한 계정으로만 살 수 있어요. 구매 기록이 계정에 남아요.</small></div>`;
  const items=CFG.packs.map(p=>`<button class="pill on" data-sseedbuy="${p.sku}" ${busy?"disabled":""}>${ic(26)}<b style="display:block">${p.seeds}개</b><small style="display:block;font-size:11px;font-weight:700">${won(p.price)}</small>${p.tag?`<em class="seedtag ${p.tag==="인기"?"hot":""}">${p.tag}</em>`:""}</button>`).join("");
  return `<div class="seedpay"><b>씨앗 사기</b><div class="seedpacks">${items}</div><small>${CFG.firstBonus} 보너스 · 가격은 부가세 포함이에요 · <a href="terms.html" target="_blank" rel="noopener">이용약관·환불</a></small></div>`;
}
async function buy(sku,redraw){
  if(busy||!ready()||!signedIn()) return; const pack=CFG.packs.find(p=>p.sku===sku)||(window.PLUS&&PLUS.PASSES.find(p=>p.sku===sku)); if(!pack) return;
  busy=true; redraw&&redraw();
  try{
    await loadSdk();
    const o=await call("createOrder",{sku});
    const customerKey="u-"+A().cloud.auth.currentUser.uid;   // 계정마다 다른 긴 값 (토스: 22자 이상, 추측하기 어려워야 해요)
    const toss=window.TossPayments(CFG.clientKey);
    const pay=toss.payment({customerKey});
    const u=A().cloud.auth.currentUser;
    const base=location.origin+location.pathname;
    await pay.requestPayment({method:"CARD",amount:{currency:"KRW",value:o.amount},orderId:o.orderId,orderName:o.orderName,
      successUrl:base+"?pay=ok",failUrl:base+"?pay=fail",customerEmail:u.email||undefined});
  }catch(e){ if(!(e&&(e.code==="USER_CANCEL"||/cancel/i.test(String(e.message))))) A().toast("결제를 시작하지 못했어요. 잠시 후 다시 해 주세요."); busy=false; redraw&&redraw(); }
}
/* 결제창에서 돌아왔을 때: 주소의 ?pay=ok&paymentKey=…&orderId=…&amount=… 를 서버로 보내 승인받고 씨앗을 받아요 */
async function handleReturn(){
  const q=new URLSearchParams(location.search), st=q.get("pay"); if(!st) return;
  const keep=["pay","paymentKey","orderId","amount","code","message"]; const data={}; keep.forEach(k=>{ if(q.get(k)!=null) data[k]=q.get(k); });
  history.replaceState(null,"",location.pathname);   // 새로고침해도 다시 승인 요청이 가지 않게 주소를 정리해요
  if(st==="fail"){ const m=data.code==="PAY_PROCESS_CANCELED"?"결제를 취소했어요.":"결제가 완료되지 않았어요."; A().toast(m); return; }
  if(st!=="ok"||!data.paymentKey||!data.orderId||!data.amount) return;
  try{ sessionStorage.setItem("jp-pay-pending",JSON.stringify(data)); }catch(e){}
  await finish(data);
}
async function finish(data){
  /* 로그인 상태가 준비될 때까지 잠깐 기다려요 */
  for(let i=0;i<40&&!signedIn();i++) await new Promise(r=>setTimeout(r,500));
  if(!signedIn()){ A().toast("로그인한 뒤 다시 열면 구매가 마무리돼요."); return; }
  try{
    const r=await call("confirmOrder",{paymentKey:data.paymentKey,orderId:data.orderId,amount:Number(data.amount)});
    try{ sessionStorage.removeItem("jp-pay-pending"); }catch(e){}
    if(r&&r.plusUntil){ PLUS.setUntil(r.plusUntil); A().toast("술술 플러스가 시작됐어요!"); try{ A().renderHome(); }catch(e){} }
    else if(r&&r.seeds>0){ PATH.addSeeds(r.seeds); A().toast("씨앗 "+r.seeds+"개가 들어왔어요!"+(r.bonus?" (첫 구매 보너스 "+r.bonus+"개 포함)":"")); try{ A().renderHome(); }catch(e){} }
    else A().toast("이미 지급된 구매예요.");
  }catch(e){ A().toast(String(e.message||"구매를 확인하지 못했어요.")+" 문제가 계속되면 문의해 주세요."); }
}
/* 앱이 열릴 때: 결제창에서 돌아온 경우 처리, 중간에 끊긴 구매가 있으면 이어서 처리 */
function init(){
  if(!ready()) return;
  setTimeout(()=>{ handleReturn().then(()=>{ try{ const p=JSON.parse(sessionStorage.getItem("jp-pay-pending")||"null"); if(p&&!new URLSearchParams(location.search).get("pay")) finish(p); }catch(e){} }); },1200);
}
window.SEEDPAY={CFG,html,buy,ready,init};
window.addEventListener("load",()=>{ inPlayApp(); init(); });
})();
