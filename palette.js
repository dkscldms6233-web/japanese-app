/* 색감 시안: A 블루+민트 · B 코랄+파스텔 · C 퍼플+비비드 (오른쪽 아래 작은 버튼으로 바꿔 볼 수 있어요. 주소 끝에 ?pal=a 도 돼요) */
(function(){
const P={
 a:{n:"A",acc:"#2f7df6",dk:"#1f63cf",soft:"#e8f2ff",chip:"#f1f5fb",line:"#e4ebf5",text:"#1b2a44",sub:"#62708a",gb:"#e8f2ff",gf:"#1f63cf",lb:"#dcf7ee",lf:"#0f8a63"},
 b:{n:"B",acc:"#ff6f59",dk:"#ee5a43",soft:"#ffeae4",chip:"#fff5f1",line:"#f5e6e0",text:"#3a2420",sub:"#85706a",gb:"#fff0d9",gf:"#d98a00",lb:"#ffe4ee",lf:"#d93c72"},
 c:{n:"C",acc:"#6c4cf0",dk:"#5636d6",soft:"#efeaff",chip:"#f5f3ff",line:"#e8e4f8",text:"#25194d",sub:"#6d6786",gb:"#e0f8ee",gf:"#0f9d6c",lb:"#fff0d6",lf:"#d98a00"}};
const q=new URLSearchParams(location.search).get("pal");
let cur=q||localStorage.getItem("jp-pal")||"";
const ST=document.createElement("style"); document.head.appendChild(ST);
function apply(k){
  cur=P[k]?k:""; try{ localStorage.setItem("jp-pal",cur); }catch(e){}
  const p=P[cur]; document.documentElement.dataset.pal=cur;
  ST.textContent=p?`
:root[data-pal]{--accent:${p.acc};--accent-dk:${p.dk};--accent-text:${p.dk};--accent-soft:${p.soft};--chip:${p.chip};--line:${p.line};--text:${p.text};--sub:${p.sub}}
:root[data-pal] .hgoal{background:${p.gb}!important;border-color:transparent!important}
:root[data-pal] .hgoal .sub b{color:${p.gf}}:root[data-pal] .hgoal .prog{background:rgba(255,255,255,.7)}:root[data-pal] .hgoal .prog div{background:${p.gf}!important}
:root[data-pal] .pstat{background:${p.lb}!important;border-color:transparent!important}
:root[data-pal] .pstat .prow1 b{color:${p.lf}}:root[data-pal] .pstat .prog{background:rgba(255,255,255,.7)}:root[data-pal] .pstat .prog div{background:${p.lf}!important}
:root[data-pal] .cta{background:${p.acc}}:root[data-pal] .pill.on{background:${p.acc};border-color:${p.acc};color:#fff}
`:"";
  document.querySelectorAll("#palsw button").forEach(b=>b.classList.toggle("on",b.dataset.k===cur));
}
const sw=document.createElement("div"); sw.id="palsw";
sw.innerHTML=[["","기본"],["a","A"],["b","B"],["c","C"]].map(([k,n])=>`<button data-k="${k}">${n}</button>`).join("");
sw.addEventListener("click",e=>{ const b=e.target.closest("button"); if(b) apply(b.dataset.k); });
const S2=document.createElement("style");
S2.textContent="#palsw{position:fixed;right:8px;bottom:84px;z-index:70;display:flex;gap:4px;background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:4px;box-shadow:0 2px 8px rgba(0,0,0,.12)}#palsw button{border:0;background:none;font:inherit;font-size:12px;font-weight:700;color:#6b7280;padding:4px 9px;border-radius:999px;cursor:pointer}#palsw button.on{background:#25221e;color:#fff}";
document.head.appendChild(S2); document.body.appendChild(sw); apply(cur);
})();
