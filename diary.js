/* 공부 다이어리: 공부한 날마다 스티커가 붙는 달력
 * - 공부 기록(jp-log, 날짜 → {n:푼 문제})을 읽어서 푼 날에 스티커를 붙여 줘요. 기록이 있던 날은 지난 달도 채워져 있어요.
 * - 스티커 그림은 날짜로 정해져서(저장 안 함) 같은 날은 항상 같은 스티커예요.
 * - 홈에는 이번 주 칸을, 전체 보기에는 한 달 달력을 보여 줘요. 기록 키: jp-dia-seen(오늘 스티커를 이미 보여 줬는지)
 */
(function(){
const A=()=>window.APP;
const E=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* 스티커: 흰 테두리(다이컷) + 부드러운 그림자의 일러스트 스티커. art(그림)를 흰 테두리 층 + 색 층으로 겹쳐서 만들어요 */
const art=g=>{ const o=g.replace(/\s(fill|stroke|stroke-width|opacity)="[^"]*"/g,""); return `<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true"><g fill="#fff" stroke="#fff" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round">${o}</g>${g}</svg>`; };
const bird=(eyes,extra,cap)=>`<ellipse cx="24" cy="29" rx="15" ry="13" fill="#a39d95"/><ellipse cx="24" cy="32" rx="9" ry="8" fill="#f6f0e6"/><circle cx="24" cy="18" r="11" fill="#b0aaa2"/><path d="M13 16a11 11 0 0 1 22 0c-4-3-18-3-22 0z" fill="#6f6a63"/><path d="M22 20.500h4l-2 3.500z" fill="#f2a33a"/>${eyes}<circle cx="16.500" cy="22.500" r="2.400" fill="#f4a3a8"/><circle cx="31.500" cy="22.500" r="2.400" fill="#f4a3a8"/><path d="M19 41v3M29 41v3" stroke="#e59a3a" stroke-width="2" stroke-linecap="round" fill="none"/>${extra||""}`;
const eyeDot='<circle cx="19.500" cy="18" r="1.900" fill="#222"/><circle cx="28.500" cy="18" r="1.900" fill="#222"/>';
const eyeLove='<path d="M17.500 17.500c0-1.600 2.500-1.600 2.500 0 0-1.600 2.500-1.600 2.500 0 0 1.800-2.500 3-2.500 3s-2.500-1.200-2.500-3z" fill="#e0525e"/><path d="M26 17.500c0-1.600 2.500-1.600 2.500 0 0-1.600 2.500-1.600 2.500 0 0 1.800-2.500 3-2.500 3s-2.500-1.200-2.500-3z" fill="#e0525e"/>';
const eyeSleep='<path d="M17.500 18q2 1.800 4 0M26.500 18q2 1.800 4 0" stroke="#222" stroke-width="1.800" fill="none" stroke-linecap="round"/>';
const cat=(fur,belly,face)=>`<path d="M12 18l-3-12 10 6zM36 18l3-12-10 6z" fill="${fur}"/><circle cx="24" cy="26" r="15" fill="${fur}"/><ellipse cx="24" cy="31" rx="7" ry="5" fill="${belly}"/>${face}<path d="M22.500 27.500h3l-1.500 2z" fill="#e57373"/><path d="M10 27h6M10 30l6-1M38 27h-6M38 30l-6-1" stroke="#888" stroke-width="1" stroke-linecap="round"/>`;
const PACKS={
 study:{name:"공부 팩",desc:"연필·책·커피 같은 공부 친구들",price:0,fx:false,st:[
  art('<g transform="rotate(-40 24 24)"><rect x="19" y="5" width="10" height="30" rx="2" fill="#f4c542"/><rect x="19" y="5" width="10" height="6" rx="2" fill="#e57373"/><path d="M19 35h10l-5 9z" fill="#f2d3a3"/><path d="M22 41.500h4l-2 3.500z" fill="#444"/></g>'),
  art('<rect x="8" y="9" width="32" height="30" rx="3" fill="#5c7cba"/><rect x="12" y="9" width="26" height="30" rx="2" fill="#7d9bd6"/><rect x="16" y="15" width="16" height="3" rx="1.500" fill="#fff"/><rect x="16" y="21" width="12" height="3" rx="1.500" fill="#fff"/>'),
  art('<path d="M10 16h24v12a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10z" fill="#e8d3b0"/><path d="M34 19h3a5 5 0 0 1 0 10h-3" fill="none" stroke="#e8d3b0" stroke-width="3.500"/><path d="M10 16h24v4H10z" fill="#c9a574"/><path d="M17 6c-2 3 2 4 0 7M24 6c-2 3 2 4 0 7" stroke="#9aa5b8" stroke-width="2.200" fill="none" stroke-linecap="round"/>'),
  art('<circle cx="24" cy="20" r="12" fill="#ffd54f"/><rect x="19" y="31" width="10" height="8" rx="2" fill="#b0b8c4"/><path d="M20 39h8l-1 4h-6z" fill="#8a93a3"/><path d="M20 17a5 5 0 0 1 5-5" stroke="#fff" stroke-width="2.400" fill="none" stroke-linecap="round"/>'),
  art('<path d="M24 5l5.600 11.600 12.400 1.800-9 8.800 2.200 12.600L24 33.800l-11.200 6 2.200-12.600-9-8.800 12.400-1.800z" fill="#ffca28"/><circle cx="19" cy="23" r="1.800" fill="#5d4037"/><circle cx="29" cy="23" r="1.800" fill="#5d4037"/><path d="M20 28q4 3.500 8 0" stroke="#5d4037" stroke-width="1.800" fill="none" stroke-linecap="round"/><circle cx="15.500" cy="27" r="2" fill="#ff8a80"/><circle cx="32.500" cy="27" r="2" fill="#ff8a80"/>'),
  art('<rect x="9" y="8" width="30" height="34" rx="3" fill="#fff3b0"/><rect x="9" y="8" width="30" height="8" rx="3" fill="#ffb74d"/><path d="M15 24h18M15 30h18M15 36h10" stroke="#c9b458" stroke-width="2.200" stroke-linecap="round" fill="none"/>')]},
 japan:{name:"일본 감성 팩",desc:"주먹밥·도리이·라멘·다루마·부채·벚꽃",price:150,fx:true,st:[
  art('<path d="M24 6c5 0 16 24 16 29 0 5-5 7-16 7S8 40 8 35C8 30 19 6 24 6z" fill="#fafafa"/><path d="M13 31h22l3 8c0 2-4 3-14 3s-14-1-14-3z" fill="#2f4f45"/><circle cx="20" cy="24" r="1.700" fill="#333"/><circle cx="28" cy="24" r="1.700" fill="#333"/><circle cx="16.500" cy="27" r="2" fill="#f7b6bd"/><circle cx="31.500" cy="27" r="2" fill="#f7b6bd"/>'),
  art('<rect x="6" y="9" width="36" height="5" rx="2" fill="#d94a3a"/><rect x="9" y="17" width="30" height="4" fill="#d94a3a"/><rect x="12" y="14" width="4" height="29" fill="#d94a3a"/><rect x="32" y="14" width="4" height="29" fill="#d94a3a"/><rect x="21" y="14" width="6" height="7" fill="#b73a2d"/>'),
  art('<circle cx="24" cy="26" r="17" fill="#e04b3d"/><ellipse cx="24" cy="22" rx="11" ry="9" fill="#fde7d3"/><circle cx="20" cy="22" r="2.200" fill="#333"/><circle cx="28" cy="22" r="2.200" fill="#333"/><path d="M19 17q5-3 10 0" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M19 34c3 3 7 3 10 0" stroke="#f5c542" stroke-width="2.400" fill="none" stroke-linecap="round"/>'),
  art('<path d="M6 22h36c0 11-7 19-18 19S6 33 6 22z" fill="#e8584a"/><ellipse cx="24" cy="22" rx="18" ry="5" fill="#ffd77a"/><path d="M14 22q3-6 6 0M22 21q3-6 6 0" stroke="#f1a33a" stroke-width="2" fill="none"/><circle cx="31" cy="21" r="3.500" fill="#fff"/><circle cx="31" cy="21" r="1.600" fill="#f5b942"/><path d="M12 10c-1 3 2 4 0 7M20 8c-1 3 2 4 0 8" stroke="#a9b3c4" stroke-width="2" fill="none" stroke-linecap="round"/>'),
  art('<path d="M24 40L6 17a26 26 0 0 1 36 0z" fill="#f48fb1"/><path d="M24 40L15 14M24 40l9-26M24 40V12" stroke="#fff" stroke-width="1.600" fill="none"/><circle cx="24" cy="40" r="3" fill="#8d6e63"/>'),
  art('<g transform="translate(24 24)"><ellipse rx="6" ry="10" cy="-9" fill="#f8a8c2"/><ellipse rx="6" ry="10" cy="-9" transform="rotate(72)" fill="#f8a8c2"/><ellipse rx="6" ry="10" cy="-9" transform="rotate(144)" fill="#f8a8c2"/><ellipse rx="6" ry="10" cy="-9" transform="rotate(216)" fill="#f8a8c2"/><ellipse rx="6" ry="10" cy="-9" transform="rotate(288)" fill="#f8a8c2"/><circle r="4" fill="#ec6f94"/></g>')]},
 sparrow:{name:"참새 팩",desc:"우리 참새의 여러 표정",price:150,fx:true,st:[
  art(bird(eyeDot,'')),
  art(bird(eyeLove,'<path d="M36 8c0-2.500 3.500-2.500 3.500 0 0-2.500 3.500-2.500 3.500 0 0 2.800-3.500 4.500-3.500 4.500S36 10.800 36 8z" fill="#ff7a8a"/>')),
  art(bird(eyeSleep,'<text x="33" y="10" font-size="9" font-weight="700" fill="#6b7fd7" font-family="sans-serif">z</text><text x="38" y="6" font-size="6" font-weight="700" fill="#6b7fd7" font-family="sans-serif">z</text>')),
  art(bird(eyeDot,'<circle cx="19.500" cy="18" r="4.400" fill="none" stroke="#3a4a6b" stroke-width="1.500"/><circle cx="28.500" cy="18" r="4.400" fill="none" stroke="#3a4a6b" stroke-width="1.500"/><path d="M23.900 18h.2" stroke="#3a4a6b" stroke-width="1.500"/><rect x="15" y="36" width="18" height="8" rx="1.500" fill="#5c7cba"/><rect x="24" y="36" width="1.500" height="8" fill="#fff"/>')),
  art(bird(eyeDot,'<ellipse cx="7" cy="25" rx="3.800" ry="8" transform="rotate(-25 7 25)" fill="#a39d95"/><ellipse cx="41" cy="25" rx="3.800" ry="8" transform="rotate(25 41 25)" fill="#a39d95"/><path d="M24 2l1.400 2.900 3.200.4-2.300 2.200.6 3.100L24 9l-2.900 1.600.6-3.100-2.300-2.200 3.200-.4z" fill="#ffca28"/>')),
  art(bird(eyeDot,'<path d="M16 34h12v5a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6z" fill="#e8d3b0"/><path d="M28 36h2a3 3 0 0 1 0 6h-2" fill="none" stroke="#e8d3b0" stroke-width="2.200"/>'))]} ,
 sweet:{name:"디저트 팩",desc:"컵케이크·버블티·아이스크림·도넛·케이크·마카롱",price:200,fx:true,st:[
  art('<path d="M10 24h28l-4 17H14z" fill="#e8b27a"/><path d="M16 24v17M24 24v17M32 24v17" stroke="#c98d55" stroke-width="1.500"/><path d="M8 24c0-7 5-9 7-9 1-5 6-8 9-8s8 3 9 8c2 0 7 2 7 9z" fill="#f8a8c2"/><circle cx="24" cy="7" r="3.500" fill="#e5484d"/>'),
  art('<path d="M13 15h22l-3 27H16z" fill="#f3dcc3"/><path d="M14 24h20l-1.500 18h-17z" fill="#b8845a"/><circle cx="20" cy="36" r="2.200" fill="#3b2a20"/><circle cx="27" cy="38" r="2.200" fill="#3b2a20"/><circle cx="25" cy="31" r="2.200" fill="#3b2a20"/><rect x="11" y="12" width="26" height="5" rx="2.500" fill="#f8a8c2"/><path d="M28 12l5-9" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/>'),
  art('<path d="M14 22h20L24 44z" fill="#e8b27a"/><path d="M18 26l8 14M25 25l-4 12M30 24l-7 14" stroke="#c98d55" stroke-width="1.300"/><circle cx="24" cy="16" r="9.500" fill="#f8a8c2"/><circle cx="16" cy="21" r="6" fill="#ffe08a"/><circle cx="32" cy="21" r="6" fill="#a8d8f0"/><circle cx="24" cy="6" r="2.800" fill="#e5484d"/>'),
  art('<circle cx="24" cy="24" r="17" fill="#e8b27a"/><circle cx="24" cy="24" r="14" fill="#f8a8c2"/><circle cx="24" cy="24" r="5" fill="#fff"/><path d="M15 17l3 2M31 15l-1 3.500M34 27l-3 .5M17 32l3-2M26 36l-.5-3.500" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M20 12l1.500 2M30 33l2-1.500" stroke="#7fd1ae" stroke-width="2" stroke-linecap="round"/>'),
  art('<path d="M6 36L12 14h26l4 22z" fill="#fde7d3"/><path d="M6 36h36v6H6z" fill="#e8b27a"/><path d="M12 14h26l1.500 8H11z" fill="#f8a8c2"/><circle cx="25" cy="11" r="5" fill="#e5484d"/><path d="M25 6c0-2 2-3 3-3" stroke="#3a8d5a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M14 28h22" stroke="#f3c8a0" stroke-width="2"/>'),
  art('<ellipse cx="24" cy="15" rx="15" ry="8" fill="#9ad8c4"/><ellipse cx="24" cy="33" rx="15" ry="8" fill="#9ad8c4"/><rect x="9" y="17" width="30" height="14" fill="#f8a8c2"/><path d="M9 15v18M39 15v18" stroke="#9ad8c4" stroke-width="0"/><ellipse cx="24" cy="24" rx="15" ry="2.500" fill="#fff" opacity=".7"/>')]},
 cat:{name:"고양이 팩",desc:"졸린 고양이, 놀란 고양이, 먹보 고양이 외",price:200,fx:true,st:[
  art(cat('#f4b86a','#fff','<circle cx="18" cy="23" r="1.900" fill="#222"/><circle cx="30" cy="23" r="1.900" fill="#222"/>')),
  art(cat('#9aa5b8','#fff','<path d="M16 23q2 2 4 0M28 23q2 2 4 0" stroke="#222" stroke-width="1.800" fill="none" stroke-linecap="round"/><text x="36" y="12" font-size="9" font-weight="700" fill="#6b7fd7" font-family="sans-serif">z</text>')),
  art(cat('#3d3d4a','#6b6b7a','<circle cx="18" cy="23" r="3" fill="#ffe14d"/><circle cx="30" cy="23" r="3" fill="#ffe14d"/><circle cx="18" cy="23" r="1.300" fill="#111"/><circle cx="30" cy="23" r="1.300" fill="#111"/>')),
  art(cat('#fff','#f4b86a','<circle cx="18" cy="23" r="1.900" fill="#222"/><circle cx="30" cy="23" r="1.900" fill="#222"/><path d="M21 31q3 3 6 0" stroke="#e57373" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M20 38h8l-1 5h-6z" fill="#8ec5e8"/>')),
  art(cat('#f4b86a','#fff','<path d="M15 22l5 2M33 22l-5 2" stroke="#222" stroke-width="2" stroke-linecap="round"/><path d="M19 33h10v4a5 5 0 0 1-10 0z" fill="#e8d3b0"/>')),
  art('<ellipse cx="24" cy="32" rx="14" ry="10" fill="#f4b86a"/><path d="M12 38c-6 1-8-5-4-8" stroke="#f4b86a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="17" cy="34" r="3.800" fill="#fff"/><circle cx="31" cy="34" r="3.800" fill="#fff"/><circle cx="24" cy="22" r="9" fill="#f4b86a"/><path d="M16 17l-1-8 6 4zM32 17l1-8-6 4z" fill="#f4b86a"/><path d="M20 22q1.500 1.500 3 0M25 22q1.500 1.500 3 0" stroke="#222" stroke-width="1.600" fill="none"/>')]},
 sky:{name:"하늘 팩",desc:"무지개·구름·달·별·우산·해",price:250,fx:true,st:[
  art('<path d="M5 36a19 19 0 0 1 38 0" fill="none" stroke="#e5484d" stroke-width="3.500"/><path d="M9 36a15 15 0 0 1 30 0" fill="none" stroke="#f5b942" stroke-width="3.500"/><path d="M13 36a11 11 0 0 1 22 0" fill="none" stroke="#5cb87a" stroke-width="3.500"/><path d="M17 36a7 7 0 0 1 14 0" fill="none" stroke="#5b8de0" stroke-width="3.500"/><ellipse cx="7" cy="38" rx="6" ry="4" fill="#fff"/><ellipse cx="41" cy="38" rx="6" ry="4" fill="#fff"/>'),
  art('<circle cx="24" cy="24" r="9" fill="#ffc83d"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.500 10.500l4 4M33.500 33.500l4 4M37.500 10.500l-4 4M14.500 33.500l-4 4" stroke="#ffc83d" stroke-width="3.200" stroke-linecap="round"/><circle cx="21" cy="23" r="1.300" fill="#7a4a00"/><circle cx="27" cy="23" r="1.300" fill="#7a4a00"/><path d="M21 27q3 2.500 6 0" stroke="#7a4a00" stroke-width="1.500" fill="none" stroke-linecap="round"/>'),
  art('<path d="M30 5a17 17 0 1 0 13 26A14 14 0 0 1 30 5z" fill="#ffd96a"/><circle cx="20" cy="26" r="2.200" fill="#e0b24a"/><circle cx="27" cy="35" r="1.800" fill="#e0b24a"/><path d="M36 8l1 2.500 2.500 1-2.500 1-1 2.500-1-2.500-2.500-1 2.500-1z" fill="#ffe9a8"/>'),
  art('<path d="M14 38a8 8 0 0 1 0-16 11 11 0 0 1 21-3 9 9 0 0 1 1 19z" fill="#cfe4f7"/><path d="M14 38a8 8 0 0 1 0-16 11 11 0 0 1 21-3 9 9 0 0 1 1 19z" fill="none" stroke="#a9c8e8" stroke-width="1.500"/><path d="M18 43l-2 4M26 43l-2 4M34 43l-2 4" stroke="#5b8de0" stroke-width="2.500" stroke-linecap="round"/>'),
  art('<path d="M6 26a18 18 0 0 1 36 0z" fill="#f48fb1"/><path d="M24 8v34" stroke="#8d6e63" stroke-width="2.500" stroke-linecap="round"/><path d="M24 42a4 4 0 0 1-8 0" fill="none" stroke="#8d6e63" stroke-width="2.500" stroke-linecap="round"/><path d="M15 26a9 9 0 0 1 9-7M33 26a9 9 0 0 0-9-7" stroke="#fff" stroke-width="1.500" fill="none"/>'),
  art('<path d="M24 4l5.500 12 13 1.500-9.700 8.800 2.800 12.800L24 32.400 12.400 39.100l2.800-12.800L5.500 17.500 18.500 16z" fill="#ffd54a"/><path d="M24 11l3 7 7.500.8-5.600 5 1.600 7.400L24 27.200" fill="#ffe58a"/>')]}
};
/* 표지: 문구 노트 느낌 (종이·줄·모눈·테이프·스프링) */
const COVERS={basic:{name:"기본",price:0},paper:{name:"종이",price:0},lined:{name:"줄 노트",price:80},grid:{name:"모눈",price:0},tape:{name:"테이프",price:60},spiral:{name:"스프링",price:100},craft:{name:"크래프트",price:120},cloud:{name:"구름 파스텔",price:120}};
const KEY="jp-dia-deco";
const deco=()=>{ try{ const d=A().LS.get(KEY,null)||{}; return {cover:COVERS[d.cover]?d.cover:"basic",pack:PACKS[d.pack]?d.pack:"study",own:Array.isArray(d.own)?d.own:[]}; }catch(e){ return {cover:"basic",pack:"study",own:[]}; } };
const saveDeco=d=>{ try{ A().LS.set(KEY,d); }catch(e){} };
const owns=(d,id)=>(PACKS[id]&&PACKS[id].price===0)||(COVERS[id]&&COVERS[id].price===0)||d.own.includes(id);
const ST=()=>PACKS[deco().pack].st;
const pad=n=>String(n).padStart(2,"0");
const ds=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const hash=s=>{ let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; };
const sticker=d=>{ const S=ST(); return S[hash(d)%S.length]; };
const log=()=>{ try{ return A().LS.get("jp-log",{})||{}; }catch(e){ return {}; } };
const studied=(d,L)=>{ const e=(L||log())[d]; return !!(e&&e.n>0); };
const todayS=()=>ds(new Date());
const stk=(d,cls)=>`<span class="dst art ${PACKS[deco().pack].fx?"fx ":""}${cls||""}">${sticker(d)}</span>`;
const DOW=["월","화","수","목","금","토","일"];
function monday(d){ const x=new Date(d); x.setHours(12); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x; }
function monthCount(y,m,L){ let n=0; const last=new Date(y,m+1,0).getDate(); for(let i=1;i<=last;i++) if(studied(y+"-"+pad(m+1)+"-"+pad(i),L)) n++; return n; }

/* ---------- 홈 카드: 이번 주 ---------- */
function cardHtml(){
  const L=log(), t=todayS(), got=studied(t,L), now=new Date(), mon=monday(now), cells=[];
  for(let i=0;i<7;i++){ const d=new Date(mon); d.setDate(mon.getDate()+i); const s=ds(d), isT=s===t, on=studied(s,L), fut=s>t;
    cells.push(`<div class="dwk${isT?" t":""}"><i>${on?stk(s,isT&&got&&!shown()?"new":""):`<span class="dst none${isT?" today":""}">${isT?"?":""}</span>`}</i><b>${DOW[i]}</b></div>`); }
  const n=monthCount(now.getFullYear(),now.getMonth(),L);
  setTimeout(markShown,1200);
  const G=window.PATH&&PATH.giftInfo?PATH.giftInfo():null;
  let foot=`<p class="dmsg">${got?"오늘 스티커를 받았어요! 내일도 만나요":"오늘 공부하면 스티커를 받아요"}</p>`;
  if(G){
    if(G.pending) foot=`<div class="dgiftrow"><span>7일 연속 달성! 선물이 도착했어요</span><button type="button" class="dgift" data-gift="open">선물 받기</button></div>`;
    else { const left=Math.max(0,7-G.pos); foot=`<div class="dgoal"><div class="dgt"><span>${got?"오늘 스티커를 받았어요!":"오늘 공부하면 스티커를 받아요"}</span><b>${G.pos>=7?"선물 완주":"선물까지 "+left+"일"}</b></div><div class="dgbar"><i style="width:${Math.min(100,G.pos/7*100).toFixed(0)}%"></i></div></div>`; }
    if(G.titles) foot+=`<button type="button" class="dtit" data-gift="box">내 칭호 모음 ${G.titles}개 ›</button>`;
  }
  const streakChip=G&&G.s>0?`<span class="dstreak">연속 ${G.s}일</span>`:"";
  return `<section class="h2dia" data-cover="${deco().cover}"><div class="dhd"><b>공부 다이어리</b>${streakChip}<button type="button" class="dmore" data-dia="open">${now.getMonth()+1}월 스티커 ${n}장 ›</button></div>
   <div class="dweek">${cells.join("")}</div>${foot}</section>`;
}
const shown=()=>{ try{ return localStorage.getItem("jp-dia-seen")===todayS(); }catch(e){ return false; } };
function markShown(){ try{ if(studied(todayS())) localStorage.setItem("jp-dia-seen",todayS()); }catch(e){} }

/* ---------- 전체 보기: 한 달 달력 ---------- */
let vy,vm,decoOpen=false;
function dlg(){ let d=document.getElementById("diaDlg"); if(!d){ d=document.createElement("dialog"); d.id="diaDlg"; document.body.appendChild(d);
  d.addEventListener("click",e=>{ if(e.target===d||e.target.closest("[data-diax]")){ d.close(); return; } if(e.target.closest("[data-diaco]")){ decoOpen=!decoOpen; paint(); return; }
    const cv=e.target.closest("[data-diacover]"); if(cv){ pick("cover",cv.dataset.diacover); return; }
    const pk=e.target.closest("[data-diapack]"); if(pk){ pick("pack",pk.dataset.diapack); return; }
    const mv=e.target.closest("[data-diam]"); if(mv){ vm+=+mv.dataset.diam; if(vm<0){ vm=11; vy--; } if(vm>11){ vm=0; vy++; } paint(); } }); }
  return d; }
function pick(kind,id){
  const D=deco(), item=(kind==="cover"?COVERS:PACKS)[id]; if(!item) return;
  if(!owns(D,id)){
    let ok=false; try{ ok=PATH.gift.spendSeeds(item.price); }catch(e){}
    if(!ok){ try{ A().toast("씨앗이 모자라요. 공부하면 씨앗을 모을 수 있어요"); }catch(e){} return; }
    D.own.push(id); try{ A().toast(item.name+"을 샀어요!"); }catch(e){}
  }
  D[kind]=id; saveDeco(D); paint(); try{ A().renderHome(); }catch(e){}
}
function streak(){ try{ return A().streakDays(); }catch(e){ return 0; } }
function paint(){
  const d=dlg(), L=log(), t=todayS(), first=new Date(vy,vm,1), lead=(first.getDay()+6)%7, last=new Date(vy,vm+1,0).getDate(), cells=[];
  for(let i=0;i<lead;i++) cells.push('<div class="dday"></div>');
  for(let i=1;i<=last;i++){ const s=vy+"-"+pad(vm+1)+"-"+pad(i), on=studied(s,L), isT=s===t;
    cells.push(`<div class="dday${isT?" t":""}">${on?stk(s,""):`<span class="dst none${isT?" today":""}">${i}</span>`}</div>`); }
  const n=monthCount(vy,vm,L), isNow=vy===new Date().getFullYear()&&vm===new Date().getMonth(), D=deco();
  const seeds=()=>{ try{ return PATH.gift.seeds(); }catch(e){ return 0; } };
  const coverRow=Object.entries(COVERS).map(([id,c])=>{ const own=owns(D,id), on=D.cover===id; return `<button type="button" class="dco${on?" on":""}" data-diacover="${id}"><span class="dcsw" data-cover="${id}"></span><b>${c.name}</b><small>${on?"사용 중":own?"사용":"씨앗 "+c.price}</small></button>`; }).join("");
  const packRow=Object.entries(PACKS).map(([id,p])=>{ const own=owns(D,id), on=D.pack===id; return `<button type="button" class="dpk${on?" on":""}" data-diapack="${id}"><span class="dpks">${p.st.map(x=>`<span class="dst art">${x}</span>`).join("")}</span><span class="dpkt"><b>${p.name}</b><small>${p.desc}</small></span><em>${on?"사용 중":own?"사용":"씨앗 "+p.price}</em></button>`; }).join("");
  const decoPanel=decoOpen?`<div class="ddeco"><div class="ddh"><b>꾸미기</b><span class="dseed">씨앗 ${seeds()}개</span></div><p class="dlab">표지</p><div class="dcos">${coverRow}</div><p class="dlab">스티커 팩</p><div class="dpks2">${packRow}</div><p class="sub" style="margin:8px 2px 0;font-size:12px">씨앗은 공부하고 연속 출석·주간 리그로 모을 수 있어요</p></div>`:"";
  d.innerHTML=`<div class="dh"><h2 style="margin:0">공부 다이어리</h2><button class="x" data-diax aria-label="닫기">×</button></div>
   <div class="db"><div class="dnav"><button type="button" data-diam="-1" aria-label="지난 달">‹</button><b>${vy}년 ${vm+1}월</b><button type="button" data-diam="1" aria-label="다음 달" ${isNow?"disabled":""}>›</button></div>
   <div class="dcal" data-cover="${D.cover}"><div class="ddow">${DOW.map(x=>`<span>${x}</span>`).join("")}</div><div class="dgrid">${cells.join("")}</div></div>
   <div class="dsum"><div><b>${n}장</b><span>이 달 스티커</span></div><div><b>${streak()}일</b><span>연속 공부</span></div></div>
   <button type="button" class="dcobtn${decoOpen?" on":""}" data-diaco>${decoOpen?"꾸미기 닫기":"꾸미기"}</button>${decoPanel}
   <p class="sub" style="margin:10px 2px 0;text-align:center">그날 문제를 하나라도 풀면 스티커가 붙어요</p></div>`;
}
function open(){ const n=new Date(); vy=n.getFullYear(); vm=n.getMonth(); decoOpen=false; paint(); const d=dlg(); if(!d.open) d.showModal(); }
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-dia=open]"); if(b){ e.preventDefault(); open(); } });
window.DIARY={cardHtml,open};
})();
