/* 한국어 문장이 단어 중간에서 끊기지 않게: 한글이 중심인 글에만 word-break:keep-all을 붙여요(일본어 글은 그대로 둬요) */
(function(){
const ST=document.createElement("style");
ST.textContent=".kw{word-break:keep-all;overflow-wrap:break-word}";
document.head.appendChild(ST);
const HAN=/[가-힣]/g, JP=/[぀-ヿ一-鿿]/g;
function one(el){
  if(el.classList.contains("kw")||/^(SCRIPT|STYLE|SVG|PATH|RUBY|RT|RP|TEXTAREA|INPUT)$/i.test(el.tagName)) return;
  let t=""; for(const n of el.childNodes) if(n.nodeType===3) t+=n.nodeValue;
  if(t.length<4) return;
  const h=(t.match(HAN)||[]).length; if(!h) return;
  if(h>(t.match(JP)||[]).length) el.classList.add("kw");
}
function mark(root){ if(root.nodeType!==1) return; one(root); root.querySelectorAll("*").forEach(one); }
let q=new Set(), raf=0;
const flush=()=>{ raf=0; const a=[...q]; q=new Set(); a.forEach(n=>{ if(n.isConnected) mark(n); }); };
new MutationObserver(ms=>{ ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.nodeType===1) q.add(n); else if(n.nodeType===3&&n.parentElement) q.add(n.parentElement); })); if(!raf) raf=requestAnimationFrame(flush); })
  .observe(document.body,{childList:true,subtree:true});
mark(document.body);
})();
