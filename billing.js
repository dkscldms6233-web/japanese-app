/* 씨앗 유료 구매 (구글 플레이 결제) — 지금은 꺼져 있어요.
 * 켜는 조건: ① 플레이스토어에 올라간 앱(TWA)에서 열었을 때만 동작 ② CFG.on=true ③ CFG.verifyUrl(서버 검증 주소)이 채워져 있을 때
 * 씨앗은 서버가 "진짜 결제 맞다"고 확인해 준 뒤에만 올려 줘요. 이 파일은 결제 결과를 믿고 씨앗을 주지 않아요.
 * 설정과 순서는 store/결제_연결_안내.md 를 보세요. */
(function(){
const CFG={
  on:false,                       // 준비가 끝나면 true
  verifyUrl:"",                   // 서버(Firebase Function) 검증 주소
  packs:[{sku:"seeds_100",seeds:100},{sku:"seeds_300",seeds:300},{sku:"seeds_700",seeds:700}]   // 플레이 콘솔에 만들 상품 ID
};
const BILL="https://play.google.com/billing";
let svc=null, details={}, loading=false, busy=false;
const A=()=>window.APP;
const inApp=()=>{ try{ return "getDigitalGoodsService" in window && "PaymentRequest" in window; }catch(e){ return false; } };
const signedIn=()=>{ try{ const c=A().cloud, p=A().curProfile(); return !!(c&&c.ok&&p&&p.cloud&&c.auth.currentUser&&c.auth.currentUser.uid===p.cloud); }catch(e){ return false; } };
const ready=()=>CFG.on&&!!CFG.verifyUrl&&inApp();
async function load(done){
  if(loading||svc) return; loading=true;
  try{ svc=await window.getDigitalGoodsService(BILL); const ds=await svc.getDetails(CFG.packs.map(p=>p.sku)); ds.forEach(d=>details[d.itemId]=d); }catch(e){ svc=null; }
  loading=false; done&&done();
}
/* 상점 화면에 끼워 넣는 조각 — 꺼져 있으면 빈 문자열이라 아무것도 안 보여요 */
function html(redraw){
  if(!ready()) return "";
  if(!signedIn()) return `<div class="seedpay"><b>씨앗 사기</b><small>로그인한 계정으로만 살 수 있어요. 기록이 계정에 안전하게 남아요.</small></div>`;
  if(!svc){ load(redraw); return `<div class="seedpay"><b>씨앗 사기</b><small>불러오는 중…</small></div>`; }
  const items=CFG.packs.filter(p=>details[p.sku]).map(p=>{ const d=details[p.sku], pr=d.price?`${d.price.value} ${d.price.currency}`:"";
    return `<button class="pill on" data-sseedbuy="${p.sku}" ${busy?"disabled":""}>${PATH.seedIc?PATH.seedIc(26):""}<b style="display:block">${p.seeds}개</b><small style="display:block;font-size:11px;font-weight:600">${pr}</small></button>`; }).join("");
  if(!items) return "";
  return `<div class="seedpay"><b>씨앗 사기</b><div class="seedpacks">${items}</div><small>결제는 구글 플레이로 진행돼요. 환불·문의는 구글 플레이에서 할 수 있어요.</small></div>`;
}
async function buy(sku,redraw){
  if(busy||!ready()||!signedIn()||!svc) return; const pack=CFG.packs.find(p=>p.sku===sku); if(!pack) return;
  busy=true; redraw&&redraw();
  try{
    const req=new PaymentRequest([{supportedMethods:BILL,data:{sku}}],{total:{label:"씨앗 "+pack.seeds+"개",amount:{currency:"KRW",value:"0"}}});
    const res=await req.show(), token=res.details&&res.details.purchaseToken;
    if(!token){ await res.complete("fail"); throw new Error("no-token"); }
    const idt=await A().cloud.auth.currentUser.getIdToken();
    const r=await fetch(CFG.verifyUrl,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+idt},body:JSON.stringify({sku,token})});
    const j=await r.json().catch(()=>({}));
    if(r.ok&&j.ok&&j.seeds>0){ await res.complete("success"); try{ await svc.consume(token); }catch(e){} PATH.addSeeds(j.seeds); A().toast("씨앗 "+j.seeds+"개가 들어왔어요!"); }
    else { await res.complete("fail"); A().toast("결제를 확인하지 못했어요. 돈이 빠져나갔다면 구글 플레이에서 환불돼요."); }
  }catch(e){ if(!(e&&e.name==="AbortError")) A().toast("결제하지 못했어요. 다시 시도해 주세요."); }
  busy=false; redraw&&redraw();
}
window.SEEDPAY={CFG,html,buy,ready};
})();
