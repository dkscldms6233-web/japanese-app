/* 학습 경로 · 경험치(XP) · 자동 복습(간격 반복)
 * - 홈 화면에 유닛 → 레슨 순서의 학습 경로를 보여 줘요. 글자 입문 레슨과 단어 레슨(20개씩)이 한 길로 이어져요.
 * - 단어 레슨은 퀴즈에서 70% 이상 맞히면 완료돼요. 이미 아는 유닛은 건너뛸 수 있어요.
 * - 단어를 풀 때마다(record) 복습 일정이 갱신돼요: 틀리면 10분 뒤, 맞히면 1일 → 3일 → 7일 → 14일 → 30일 → 60일 뒤에 다시 나와요.
 * - 경험치·경로 진행·복습 일정은 계정에 동기화돼요(index.html 의 PER 목록).
 * 기록 키: jp-path(레슨 완료), jp-xp(경험치), jp-srs(복습 일정)
 */
(function(){
const A=()=>window.APP;
const get=(k,d)=>A().LS.get(k,d), set=(k,v)=>A().LS.set(k,v);
const LESSON_N=20, UNIT_N=5, PASS=.7;
const IV=[10/1440,1,3,7,14,30,60];            // 복습 간격(일)
const TITLES=[[1,"견습생"],[4,"수련생"],[8,"열혈 학습자"],[12,"중급 도전자"],[16,"숙련자"],[20,"고수"],[25,"달인"],[30,"명인"],[36,"현자"],[42,"대가"],[46,"전설"],[50,"일본어 마스터"]]; // [시작 레벨, 칭호]
const MAXLV=50;

/* ---------- 경험치 ---------- */
const xpState=()=>get("jp-xp",{t:0,d:{}});
function addXp(n){ if(!n) return; const s=xpState(); s.t=(s.t||0)+n; s.d=s.d||{}; const d=A().today(); s.d[d]=(s.d[d]||0)+n; set("jp-xp",s);  try{ if(window.COMMUNITY) COMMUNITY.touch(); }catch(e){} }
/* 레벨이 오를수록 필요한 경험치가 점점 커져요. 50레벨까지 약 20,800 XP(= N5·N4를 거의 다 공부했을 때) */
const lvFloor=l=>Math.round(50*Math.pow(l-1,1.55));
const lvOf=t=>{ let l=1; while(l<MAXLV&&(t||0)>=lvFloor(l+1)) l++; return l; };
const titleOf=l=>{ let n=TITLES[0][1]; for(const [s,t] of TITLES) if(l>=s) n=t; return n; };
const lvPct=(x,l)=>l>=MAXLV?100:Math.round((x-lvFloor(l))/(lvFloor(l+1)-lvFloor(l))*100);

/* ---------- 자동 복습(간격 반복) ---------- */
function srsUpdate(key,ok){
  const s=get("jp-srs",{}), e=s[key]||{b:0};
  e.b=ok?Math.min((e.b||0)+1,6):0; e.d=Date.now()+IV[e.b]*864e5; s[key]=e; set("jp-srs",s);
}
const dueKeys=()=>{ const s=get("jp-srs",{}), n=Date.now(); return Object.keys(s).filter(k=>s[k].d<=n); };
function duePool(){ const set1=new Set(dueKeys()); return A().ALL.filter(w=>set1.has(w.key)); }

/* ---------- 내 참새 · 씨앗 · 상점 ---------- */
const SLOTS=[["head","머리"],["face","얼굴"],["neck","목"],["special","특별아이템"]];
const WC='filter="url(#fWc)"', INK="#5e4b42";
/* 벚꽃 한 송이(꽃잎 5장·꽃술·옅은 번짐) */
const sakura=(x,y,s,rot)=>{ const pet=`<path d="M0 0C-13-5-16-23-7-30L0-24L7-30C16-23 13-5 0 0Z" fill="#fde8ef" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><path d="M0 -2C-6-6-8-15-4-20C0-16 4-16 6-20C9-14 6-6 0 -2Z" fill="#f4a8bf" opacity=".55"/><path d="M0 -3V-19" stroke="#e58aa6" stroke-width=".8" opacity=".8"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot||0}) scale(${s})">${[0,72,144,216,288].map(a=>`<g transform="rotate(${a})">${pet}</g>`).join("")}<circle r="5.5" fill="#f7c7d6" opacity=".9"/>${[0,40,80,120,160,200,240,280,320].map(a=>`<g transform="rotate(${a})"><path d="M0 0V-12" stroke="#d9507a" stroke-width="1"/><circle cy="-13" r="1.8" fill="#d9507a"/></g>`).join("")}</g>`; };
const leaf=(x,y,s,rot,c)=>`<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0C8-6 20-4 26 4C18 12 6 10 0 0Z" fill="${c||"#96ca9f"}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`;
const arcP=(t,cx,cy,rx,ry)=>[cx+rx*Math.cos(t*Math.PI/180),cy-ry*Math.sin(t*Math.PI/180)];
const daisy=(x,y,r,c)=>`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${[0,45,90,135,180,225,270,315].map(a=>`<ellipse cx="0" cy="${-r*.95}" rx="${r*.34}" ry="${r*.62}" fill="${c||"#fffdf6"}" stroke="${INK}" stroke-width="1" transform="rotate(${a})"/>`).join("")}<circle r="${r*.38}" fill="#f1c85a" stroke="${INK}" stroke-width=".9"/></g>`;
const wreathSvg=()=>{ const cx=240,cy=50,rx=47,ry=44; let s=`<path d="${Array.from({length:19},(_,i)=>{ const [x,y]=arcP(172-i*8.4,cx,cy,rx,ry); return (i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1); }).join(" ")}" stroke="#6f9a62" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  [168,152,136,120,104,88,72,56,40,24].forEach((t,i)=>{ const [x,y]=arcP(t,cx,cy,rx,ry), ang=Math.atan2(ry*Math.cos(t*Math.PI/180),rx*Math.sin(t*Math.PI/180))*180/Math.PI; s+=leaf(x,y,.72,ang+(i%2?42:-42),"#8dc29a"); });
  [[160,"s"],[128,"d"],[96,"p"],[64,"s2"],[32,"d2"]].forEach(([t,k])=>{ const [x,y]=arcP(t,cx,cy,rx,ry);
    if(k==="s") s+=sakura(x,y,.6,t); else if(k==="s2") s+=sakura(x,y,.55,t+30); else if(k==="d") s+=daisy(x,y,11.5); else if(k==="d2") s+=daisy(x,y,10,"#fff0c9");
    else s+=`<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><g fill="#cdb8ee" stroke="${INK}" stroke-width="1">${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-6" rx="4.4" ry="6" transform="rotate(${a})"/>`).join("")}</g><circle r="2.6" fill="#f1c85a" stroke="${INK}" stroke-width=".8"/></g>`; });
  return s; };
const pearlsSvg=()=>{ const P=t=>[210+t*96,116+Math.sin(t*Math.PI)*38], rOf=t=>4.2+Math.sin(t*Math.PI)*2.4; let out=[], t=0, last=null;
  for(let i=0;i<=400&&t<=1;i++){ t=i/400; const r=rOf(t), [x,y]=P(t); if(!last||Math.hypot(x-last.x,y-last.y)>=last.r+r+.6){ out.push({x,y,r}); last={x,y,r}; } }
  const str=Array.from({length:41},(_,i)=>{ const [x,y]=P(i/40); return (i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1); }).join(" ");
  return `<path d="${str}" stroke="#8d8680" stroke-width="1.2" fill="none"/>`+out.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}" fill="#fbf7f0" stroke="${INK}" stroke-width="1"/><circle cx="${(p.x+p.r*.35).toFixed(1)}" cy="${(p.y+p.r*.4).toFixed(1)}" r="${(p.r*.55).toFixed(1)}" fill="#f2dce6" opacity=".7"/><circle cx="${(p.x-p.r*.38).toFixed(1)}" cy="${(p.y-p.r*.42).toFixed(1)}" r="${(p.r*.26).toFixed(1)}" fill="#fff"/>`).join(""); };

/* ---------- 급수 클리어 특별 아이템(씨앗으로는 살 수 없어요) ---------- */
const grandWreath=()=>{ const cx=240,cy=50,rx=49,ry=46; let s=`<path d="${Array.from({length:21},(_,i)=>{ const [x,y]=arcP(176-i*8.2,cx,cy,rx,ry); return (i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1); }).join(" ")}" stroke="#6f9a62" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  [172,158,144,130,116,102,88,74,60,46,32,20].forEach((t,i)=>{ const [x,y]=arcP(t,cx,cy,rx,ry), ang=Math.atan2(ry*Math.cos(t*Math.PI/180),rx*Math.sin(t*Math.PI/180))*180/Math.PI; s+=leaf(x,y,.8,ang+(i%2?40:-40),i%3?"#8dc29a":"#a6d3a8"); });
  [[166,.78],[140,.7],[114,.82],[88,.74],[62,.8],[36,.7],[16,.62]].forEach(([t,sc],i)=>{ const [x,y]=arcP(t,cx,cy,rx,ry); s+=sakura(x,y,sc,t*1.3+i*20); });
  [[152,"#f7c7d6"],[100,"#fff3c4"],[48,"#f7c7d6"]].forEach(([t,c])=>{ const [x,y]=arcP(t,cx,cy-6,rx+4,ry+4); s+=`<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" d="M0 0C-5 3-6 10 0 13C6 10 5 3 0 0Z" fill="${c}" stroke="${INK}" stroke-width="1"/>`; });
  s+=`<path d="M196 58C190 74 186 90 188 108" stroke="#f4aebf" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M200 60C198 78 196 94 200 112" stroke="#fde8ef" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M188 108L184 118L190 114L193 120L192 108Z" fill="#f4aebf" stroke="${INK}" stroke-width="1"/>`;
  [[170,6],[300,22],[160,36],[292,-2],[182,-6]].forEach(([x,y],i)=>{ s+=`<path transform="translate(${x} ${y}) rotate(${i*35})" d="M0 0C-4 2-5 8 0 10C5 8 4 2 0 0Z" fill="#fbcad9" stroke="${INK}" stroke-width=".8" opacity=".9"/>`; });
  s+=`<g fill="#ffe27a" stroke="${INK}" stroke-width=".6"><path d="M300 40l1.6 3.6l3.6 1.6l-3.6 1.6l-1.6 3.6l-1.6-3.6l-3.6-1.6l3.6-1.6z"/><path d="M176 -2l1.3 3l3 1.3l-3 1.3l-1.3 3l-1.3-3l-3-1.3l3-1.3z"/></g>`; return s; };
const starPath=(x,y,r)=>{ let d=""; for(let i=0;i<10;i++){ const a=(i*36-90)*Math.PI/180, rr=i%2?r*.42:r; d+=(i?"L":"M")+(x+rr*Math.cos(a)).toFixed(1)+" "+(y+rr*Math.sin(a)).toFixed(1); } return d+"Z"; };
const phoenixFeathers=()=>[[-58,66,"#5fb7a6"],[-30,76,"#e07a63"],[0,84,"#5fb7a6"],[30,76,"#e07a63"],[58,66,"#5fb7a6"]].map(([a,len,c])=>`<g transform="translate(238 34) rotate(${a})"><path d="M0 0C-10 -${len*.3} -14 -${len*.7} 0 -${len}C14 -${len*.7} 10 -${len*.3} 0 0Z" fill="#ebc86e" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M0 -4C-4 -${len*.3} -5 -${len*.6} 0 -${len*.86}C5 -${len*.6} 4 -${len*.3} 0 -4Z" fill="${c}" opacity=".85"/><path d="M0 -4V-${len*.9}" stroke="${INK}" stroke-width=".9" opacity=".6"/><ellipse cx="0" cy="-${len*.7}" rx="3.4" ry="4.6" fill="#fffaf2" stroke="${INK}" stroke-width="1"/><circle cx="0" cy="-${len*.7}" r="1.6" fill="#d94a5a"/></g>`).join("");
const ITEMS=[
 {id:"sprout",slot:"head",name:"새싹 잎",price:20,svg:`<g ${WC}><path d="M238 27C238 15 240 6 246 -2" stroke="#5e4b42" stroke-width="2.48" fill="none" stroke-linecap="round"/><path d="M240 10C222 12 206 2 201 -15C222 -17 238 -7 240 10Z" fill="#96ca9f" stroke="#5e4b42" stroke-width="1.4" stroke-linejoin="round"/><path d="M244 5C257 6 271 -4 273 -21C257 -23 246 -13 244 5Z" fill="#96ca9f" stroke="#5e4b42" stroke-width="1.4" stroke-linejoin="round"/><path d="M240 10C226 4 212 -4 205 -12M244 5C254 0 262 -8 268 -18" stroke="#5e4b42" stroke-width="1.4" fill="none" stroke-linecap="round"/><ellipse cx="238" cy="27" rx="9" ry="4" fill="#7ccf8e" opacity=".7"/></g>`},
 {id:"flower",slot:"head",name:"벚꽃 핀",price:35,svg:`<g ${WC}><path d="M170 74C186 64 196 52 204 40" stroke="#8a6a52" stroke-width="3.2" fill="none" stroke-linecap="round"/>${leaf(176,70,.8,-150)}${leaf(190,56,.7,-40)}${sakura(204,36,.95,12)}${sakura(184,58,.58,-20)}<g transform="translate(222 20)"><path d="M0 0C-6 4-7 12 0 15C7 12 6 4 0 0Z" fill="#f7c7d6" stroke="${INK}" stroke-width="1.2"/></g></g>`},
 {id:"bow",slot:"head",name:"공주 리본",price:45,svg:`<g ${WC} transform="translate(208 26) scale(.76)"><g><path d="M-9 -3C-28 -22-50 -38-76 -42C-80 -20-80 14-74 36C-50 34-26 14-9 5Z" fill="#f09bb6" stroke="#8c3a5a" stroke-width="1.6" stroke-linejoin="round"/><path d="M-9 -4C-22 -16-44 -32-62 -36L-66 -34C-70 -14-70 10-66 30L-62 32C-44 26-22 10-9 6Z" fill="#f7adc2" stroke="#8c3a5a" stroke-width="1.6" stroke-linejoin="round"/><path d="M-62 -34C-60 -14-60 12-62 30" stroke="#8c3a5a" stroke-width="1.2" fill="none" opacity=".6"/><ellipse cx="-40" cy="-6" rx="14" ry="9" fill="#ee86a5" opacity=".32"/><ellipse cx="-52" cy="14" rx="9" ry="7" fill="#fbd0dc" opacity=".6"/><ellipse cx="-30" cy="-16" rx="8" ry="4" fill="#fbd0dc" opacity=".55"/><g transform="translate(0 6) scale(1 .6) translate(0 -6)"><path d="M-3 8L-18 6C-34 26-56 46-68 64C-60 74-34 80-16 82C-10 56-6 30-3 8Z" fill="#f7adc2" stroke="#8c3a5a" stroke-width="1.7" stroke-linejoin="round"/><ellipse cx="-34" cy="54" rx="10" ry="16" fill="#ee86a5" opacity=".3" transform="rotate(32 -34 54)"/><path d="M-26 40C-34 52-44 62-54 70" stroke="#fbd0dc" stroke-width="5" opacity=".6" stroke-linecap="round" fill="none"/><path d="M-18 6C-20 30-18 56-16 82" stroke="#8c3a5a" stroke-width=".9" fill="none" opacity=".35"/></g><path d="M-14 -6C-26 -14-40 -20-56 -24M-14 0C-30 -2-46 -2-62 -4M-14 6C-28 12-44 18-58 24" stroke="#8c3a5a" stroke-width="1" fill="none" opacity=".4" stroke-linecap="round"/></g><g transform="scale(-1 1)"><path d="M-9 -3C-28 -22-50 -38-76 -42C-80 -20-80 14-74 36C-50 34-26 14-9 5Z" fill="#f09bb6" stroke="#8c3a5a" stroke-width="1.6" stroke-linejoin="round"/><path d="M-9 -4C-22 -16-44 -32-62 -36L-66 -34C-70 -14-70 10-66 30L-62 32C-44 26-22 10-9 6Z" fill="#f7adc2" stroke="#8c3a5a" stroke-width="1.6" stroke-linejoin="round"/><path d="M-62 -34C-60 -14-60 12-62 30" stroke="#8c3a5a" stroke-width="1.2" fill="none" opacity=".6"/><ellipse cx="-40" cy="-6" rx="14" ry="9" fill="#ee86a5" opacity=".32"/><ellipse cx="-52" cy="14" rx="9" ry="7" fill="#fbd0dc" opacity=".6"/><ellipse cx="-30" cy="-16" rx="8" ry="4" fill="#fbd0dc" opacity=".55"/><g transform="translate(0 6) scale(1 .6) translate(0 -6)"><path d="M-3 8L-18 6C-34 26-56 46-68 64C-60 74-34 80-16 82C-10 56-6 30-3 8Z" fill="#f7adc2" stroke="#8c3a5a" stroke-width="1.7" stroke-linejoin="round"/><ellipse cx="-34" cy="54" rx="10" ry="16" fill="#ee86a5" opacity=".3" transform="rotate(32 -34 54)"/><path d="M-26 40C-34 52-44 62-54 70" stroke="#fbd0dc" stroke-width="5" opacity=".6" stroke-linecap="round" fill="none"/><path d="M-18 6C-20 30-18 56-16 82" stroke="#8c3a5a" stroke-width=".9" fill="none" opacity=".35"/></g><path d="M-14 -6C-26 -14-40 -20-56 -24M-14 0C-30 -2-46 -2-62 -4M-14 6C-28 12-44 18-58 24" stroke="#8c3a5a" stroke-width="1" fill="none" opacity=".4" stroke-linecap="round"/></g><rect x="-15" y="-13" width="30" height="24" rx="8" fill="#f8b7c9" stroke="#8c3a5a" stroke-width="1.8"/><path d="M-7 -11V9M0 -12V10M7 -11V9" stroke="#8c3a5a" stroke-width="1" opacity=".4"/><path d="M-11 -8Q0 -12 11 -8" stroke="#fff" stroke-opacity=".6" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="3" cy="4" rx="8" ry="4" fill="#ee86a5" opacity=".35"/></g>`},
 {id:"straw",slot:"head",name:"밀짚모자",price:50,svg:`<g ${WC}><ellipse cx="238" cy="42" rx="86" ry="16" fill="#eed3a0" stroke="#5e4b42" stroke-width="1.8599999999999999"/><path d="M168 42Q238 60 308 42M178 48Q238 64 298 48" stroke="#5e4b42" stroke-opacity=".55" stroke-width="1.4" fill="none"/><path d="M194 40C192 4 284 4 282 40C262 50 214 50 194 40Z" fill="#eed3a0" stroke="#5e4b42" stroke-width="1.8599999999999999" stroke-linejoin="round"/><path d="M208 16C226 8 250 8 268 16" stroke="#fff" stroke-opacity=".4" stroke-width="1.8599999999999999" fill="none" stroke-linecap="round"/><path d="M194 30C218 42 258 42 282 30L283 41C260 52 216 52 193 41Z" fill="#dd6c62" stroke="#5e4b42" stroke-width="1.4" stroke-linejoin="round"/><path d="M262 40l12 12l-3 -14zM262 40l-8 14l12-4z" fill="#dd6c62" stroke="#5e4b42" stroke-width="1.4" stroke-linejoin="round"/></g>`},
 {id:"crown",slot:"head",name:"왕관",price:150,svg:`<g ${WC}><path d="M202 36C206 14 224 4 238 4C252 4 270 14 274 36Z" fill="#b8404f" stroke="${INK}" stroke-width="1.6"/><path d="M198 42L192 2L214 20L224 -10L238 14L252 -10L262 20L284 2L278 42Z" fill="#ebc86e" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M198 42Q238 54 278 42L277 32Q238 44 199 32Z" fill="#e2b04e" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><g fill="#fffaf2" stroke="${INK}" stroke-width="1.4"><circle cx="192" cy="2" r="5"/><circle cx="224" cy="-10" r="5"/><circle cx="252" cy="-10" r="5"/><circle cx="284" cy="2" r="5"/></g><path d="M238 -6V8M232 0H244" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M238 -8C233 -4 233 2 238 5C243 2 243 -4 238 -8Z" fill="#d94a5a" stroke="${INK}" stroke-width="1.2"/><path d="M232 33L238 28L244 33L238 41Z" fill="#d94a5a" stroke="${INK}" stroke-width="1.4"/><path d="M212 35L216 31L220 35L216 40Z" fill="#6aa8e0" stroke="${INK}" stroke-width="1.2"/><path d="M256 35L260 31L264 35L260 40Z" fill="#6cc29a" stroke="${INK}" stroke-width="1.2"/><path d="M204 36L208 33L212 37M222 38L226 35L230 39M246 39L250 35L254 38M266 37L270 34L274 37" stroke="${INK}" stroke-width="1" fill="none" opacity=".7"/><path d="M206 12L212 22M270 12L264 22" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/></g>`},
 {id:"wizard",slot:"head",name:"마법사 모자",price:70,svg:`<g ${WC}><path d="M204 38C208 18 230 -6 252 -38C256 -12 266 18 278 38Z" fill="#8a76c4" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M252 -38C262 -34 266 -24 262 -18" stroke="${INK}" stroke-width="1.6" fill="none"/><ellipse cx="240" cy="40" rx="64" ry="13" fill="#7a66b8" stroke="${INK}" stroke-width="1.8"/><path d="M204 32C228 42 258 42 278 32L279 40C258 50 226 50 203 40Z" fill="#f1c85a" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><g fill="#ffe27a" stroke="${INK}" stroke-width=".9"><path d="M238 12l2.6 6l6.4.6l-4.9 4.2l1.5 6.3l-5.6-3.4l-5.6 3.4l1.5-6.3l-4.9-4.2l6.4-.6z"/><path d="M262 -6l1.8 4l4.4.4l-3.4 2.9l1 4.3l-3.8-2.3l-3.8 2.3l1-4.3l-3.4-2.9l4.4-.4z"/></g><path d="M226 8C219 10 218 20 226 22C222 18 222 12 226 8Z" fill="#ffe27a" stroke="${INK}" stroke-width=".9"/></g>`},
 {id:"beret",slot:"head",name:"베레모",price:55,svg:`<g ${WC}><g transform="rotate(-9 240 30)"><path d="M194 38C184 12 212 -2 246 -2C284 -2 302 16 292 36C284 46 258 50 236 50C214 50 200 46 194 38Z" fill="#b85a66" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M198 34C220 44 262 46 288 34" stroke="#8f3f4b" stroke-width="3.4" fill="none" opacity=".55" stroke-linecap="round"/><path d="M248 3C236 12 222 22 208 28M248 3C250 16 252 30 250 44M248 3C262 12 278 20 290 26" stroke="${INK}" stroke-width="1" fill="none" opacity=".45"/><ellipse cx="248" cy="-1" rx="6" ry="4.6" fill="#9c4552" stroke="${INK}" stroke-width="1.4"/><path d="M214 10C232 2 256 2 272 10" stroke="#fff" stroke-opacity=".3" stroke-width="3" fill="none" stroke-linecap="round"/></g></g>`},
 {id:"beanie",slot:"head",name:"털모자",price:60,svg:`<g ${WC}><clipPath id="cBea"><path d="M197 40C195 10 281 10 279 40Z"/></clipPath><path d="M197 40C195 10 281 10 279 40Z" fill="#f4e7cd" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><g clip-path="url(#cBea)"><path d="M190 30H290M190 22H290" stroke="#dd6c62" stroke-width="5" opacity=".9"/></g><path d="M196 38C222 46 256 46 280 38L281 51C256 59 222 59 197 51Z" fill="#dd6c62" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M208 43V55M220 46V57M232 47V58M244 47V58M256 46V57M268 44V55" stroke="${INK}" stroke-width="1" opacity=".5"/><g transform="translate(238 13)"><circle r="12.5" fill="#fbf4e4" stroke="${INK}" stroke-width="1.6"/><path d="M-8 -3C-3-9 5-9 8-3M-9 3C-3-2 5-2 9 3M-5 8C-1 5 3 5 6 8" stroke="${INK}" stroke-width="1" fill="none" opacity=".55"/></g></g>`},
 {id:"wreath",slot:"head",name:"꽃관",price:65,svg:`<g ${WC}>${wreathSvg()}</g>`},
 {id:"bunny",slot:"head",name:"토끼 귀 머리띠",price:50,svg:`<g ${WC}><path d="${Array.from({length:13},(_,i)=>{ const [x,y]=arcP(168-i*12,240,52,45,38); return (i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1); }).join(" ")}" stroke="#f4aebf" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><g transform="translate(216 20) rotate(-16)"><path d="M-9 0C-13-18-10-40 0-46C10-40 13-18 9 0Z" fill="#fbf6ee" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M-4 -3C-7-16-5-32 0-38C5-32 7-16 4 -3Z" fill="#f7c0cf" opacity=".95"/></g><g transform="translate(250 15) rotate(9)"><path d="M-9 0C-13-18-10-40 0-46C10-40 13-18 9 0Z" fill="#fbf6ee" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M-4 -3C-7-16-5-32 0-38C5-32 7-16 4 -3Z" fill="#f7c0cf" opacity=".95"/></g></g>`},
 {id:"phones",slot:"head",name:"헤드폰",price:75,svg:`<g ${WC}><path d="M204 62C194 22 224 -6 252 -4C276 0 292 20 292 52" stroke="#34312f" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M209 58C202 26 228 4 252 3C272 5 285 22 286 48" stroke="#ece4d6" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/><path d="M222 -2C232 -5 244 -6 254 -5" stroke="#fff" stroke-opacity=".45" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="198" y="50" width="9" height="16" rx="3" fill="#cfd3d8" stroke="${INK}" stroke-width="1.3" transform="rotate(-8 202 58)"/><rect x="287" y="44" width="11" height="28" rx="5.5" fill="#34312f" stroke="${INK}" stroke-width="1.6"/><g transform="rotate(-6 206 82)"><ellipse cx="206" cy="82" rx="16" ry="21" fill="#34312f" stroke="${INK}" stroke-width="1.8"/><ellipse cx="206" cy="82" rx="11.5" ry="16" fill="#46423f" stroke="#cfd3d8" stroke-width="1.5"/><ellipse cx="206" cy="82" rx="5" ry="7.4" fill="#cfd3d8" stroke="${INK}" stroke-width="1"/><circle cx="200" cy="97" r="1.5" fill="#cfd3d8"/><path d="M196 70Q199 63 206 62" stroke="#fff" stroke-opacity=".4" stroke-width="2.2" fill="none" stroke-linecap="round"/></g></g>`},
 {id:"glasses",slot:"face",name:"동그란 안경",price:40,svg:`<g ${WC}><path d="M236 70L203 60" stroke="#5e4b42" stroke-width="3.1" stroke-linecap="round"/><circle cx="252" cy="77" r="18" fill="rgba(210,238,255,.38)" stroke="#5e4b42" stroke-width="3.1"/><circle cx="252" cy="77" r="18" fill="none" stroke="#5e4b42" stroke-width="1.4"/><path d="M242 69Q249 62 259 65" stroke="#fff" stroke-opacity=".55" stroke-width="1.984" fill="none" stroke-linecap="round"/><path d="M270 74L283 71" stroke="#5e4b42" stroke-width="2.48" stroke-linecap="round"/></g>`},
 {id:"shades",slot:"face",name:"선글라스",price:60,svg:`<g ${WC}><path d="M234 70L202 59" stroke="#f6efe4" stroke-width="4" stroke-linecap="round"/><ellipse cx="252" cy="77" rx="22" ry="16" fill="#5b6c93" stroke="#f6efe4" stroke-width="3.4"/><ellipse cx="252" cy="77" rx="22" ry="16" fill="none" stroke="#5e4b42" stroke-width="1.3"/><path d="M238 70L254 64M241 79L262 70" stroke="#d9ecfb" stroke-opacity=".8" stroke-width="2.6" stroke-linecap="round"/><path d="M272 72L284 69" stroke="#f6efe4" stroke-width="3.4" stroke-linecap="round"/></g>`},
 {id:"patch",slot:"face",name:"해적 안대",price:50,svg:`<g ${WC}><path d="M240 68C228 54 216 40 202 30" stroke="#2b2928" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M236 82C222 86 208 84 194 78" stroke="#2b2928" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M250 62C264 58 280 66 280 78C280 90 266 96 252 94C238 92 230 82 234 72C236 66 242 63 250 62Z" fill="#2f2c2b" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M246 68C254 66 264 68 272 74" stroke="#fff" stroke-opacity=".3" stroke-width="2.4" fill="none" stroke-linecap="round"/><g stroke="#e8e2d6" stroke-width="1.8" stroke-linecap="round" opacity=".9"><path d="M252 74L266 88M266 74L252 88"/></g><circle cx="259" cy="78" r="0" fill="#fff"/></g>`},
 {id:"stargl",slot:"face",name:"별 안경",price:55,svg:`<g ${WC}><path d="M236 72L204 62" stroke="#e8c56a" stroke-width="4.4" stroke-linecap="round"/><path d="M0 -22L6.4 -7L22 -6.4L9.6 3.4L14 19L0 10L-14 19L-9.6 3.4L-22 -6.4L-6.4 -7Z" transform="translate(253 78) scale(1.2)" fill="rgba(255,243,170,.25)" stroke="#e8c56a" stroke-width="4" stroke-linejoin="round"/><path d="M0 -22L6.4 -7L22 -6.4L9.6 3.4L14 19L0 10L-14 19L-9.6 3.4L-22 -6.4L-6.4 -7Z" transform="translate(253 78) scale(1.2)" fill="none" stroke="#5e4b42" stroke-width="1.2" stroke-linejoin="round"/><path d="M274 74L286 71" stroke="#e8c56a" stroke-width="3.6" stroke-linecap="round"/></g>`},
 {id:"scarf",slot:"neck",name:"빨간 목도리",price:40,svg:`<g ${WC}><path d="M222 148L212 196L246 192L254 152Z" fill="#dd6c62" stroke="#5e4b42" stroke-width="1.55" stroke-linejoin="round"/><path d="M215 178L249 174" stroke="#fff" stroke-width="3.1" stroke-opacity=".85"/><path d="M214 188L248 184" stroke="#5e4b42" stroke-width="1.8599999999999999"/><path d="M212 196V206M220 195V207M228 194V206M236 193V205M244 192V204" stroke="#5e4b42" stroke-width="1.612" stroke-linecap="round"/><path d="M198 116C238 140 282 134 308 106L314 130C284 158 232 162 194 138Z" fill="#dd6c62" stroke="#5e4b42" stroke-width="1.55" stroke-linejoin="round"/><path d="M214 128L222 144M236 134L243 150M258 134L263 150M280 126L284 141" stroke="#fff" stroke-opacity=".4" stroke-width="2.48" stroke-linecap="round"/></g>`},
 {id:"tie",slot:"neck",name:"넥타이",price:45,svg:`<g ${WC} transform="matrix(.85 0 0 .85 47.8 31.1)"><path d="M230 104L254 124L244 142Z" fill="#fffaf2" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M288 100L264 120L274 140Z" fill="#fffaf2" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M250 123L268 123L266 140L252 140Z" fill="#b8404f" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/><clipPath id="cTie"><path d="M252 140L266 140L276 196L259 214L242 196Z"/></clipPath><path d="M252 140L266 140L276 196L259 214L242 196Z" fill="#c9473f" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><g clip-path="url(#cTie)" stroke="#2f3f78" stroke-width="4" opacity=".85"><path d="M238 148L282 164M238 162L282 178M238 176L282 192M238 190L282 206"/></g><path d="M255 126L264 126" stroke="#fff" stroke-opacity=".45" stroke-width="2.2" stroke-linecap="round"/><path d="M254 146L256 194" stroke="#fff" stroke-opacity=".3" stroke-width="2.4" stroke-linecap="round"/></g>`},
 {id:"bell",slot:"neck",name:"방울 목걸이",price:30,svg:`<g ${WC}><path d="M212 116Q258 156 304 112" stroke="#5e4b42" stroke-width="2.48" fill="none" stroke-linecap="round"/><circle cx="258" cy="146" r="12" fill="#ebc86e" stroke="#5e4b42" stroke-width="1.612"/><path d="M247 148H269" stroke="#5e4b42" stroke-width="1.488"/><circle cx="258" cy="153" r="2.4" fill="#a8741a"/><path d="M250 140Q253 135 259 135" stroke="#fff" stroke-opacity=".4" stroke-width="1.488" fill="none" stroke-linecap="round"/></g>`},
 {id:"pearl",slot:"neck",name:"진주 목걸이",price:80,svg:`<g ${WC}>${pearlsSvg()}</g>`},
 {id:"lei",slot:"neck",name:"꽃목걸이",price:70,svg:`<g ${WC}><path d="M208 114Q258 160 306 110" stroke="#7da56e" stroke-width="5" fill="none" stroke-linecap="round"/>${[[216,126,"#f7c7d6"],[232,140,"#fff3c4"],[250,148,"#f4aebf"],[268,146,"#cdb8ee"],[286,134,"#fff3c4"],[300,120,"#f7c7d6"]].map(([x,y,c])=>`<g transform="translate(${x} ${y})"><g fill="${c}" stroke="${INK}" stroke-width="1.1">${[0,72,144,216,288].map(a=>`<circle cx="0" cy="-6.5" r="5.2" transform="rotate(${a})"/>`).join("")}</g><circle r="2.6" fill="#f1c85a" stroke="${INK}" stroke-width=".8"/></g>`).join("")}${leaf(226,134,.55,60)}${leaf(262,152,.55,95)}${leaf(292,128,.55,-60)}</g>`},
 {id:"bandana",slot:"neck",name:"노란 반다나",price:50,svg:`<g ${WC}><clipPath id="cBand"><path d="M196 116C238 136 284 132 312 106L316 118L262 182Z"/></clipPath><path d="M196 116C238 136 284 132 312 106L316 118L262 182Z" fill="#f1c85a"/><g clip-path="url(#cBand)"><path d="M200 120C240 140 284 136 312 110" stroke="#d9a63a" stroke-width="4" fill="none" opacity=".7"/><path d="M226 140L262 176M296 128L262 176" stroke="#d9a63a" stroke-width="1.1" opacity=".55"/><g fill="#fffaf2" stroke="#5e4b42" stroke-width=".8">${[[224,142],[246,152],[268,150],[288,138],[240,166],[262,168],[252,178],[274,158]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.3"/>`).join("")}</g></g><path d="M196 116C238 136 284 132 312 106L316 118L262 182Z" fill="none" stroke="#5e4b42" stroke-width="1.8" stroke-linejoin="round"/></g>`},
 {id:"starpen",slot:"neck",name:"별 펜던트",price:65,svg:`<g ${WC}><path d="M210 116Q258 152 304 112" stroke="#d9a63a" stroke-width="2.6" fill="none"/><g transform="translate(258 150)"><path d="M0 -14L4 -4.5L14 -4L6.4 2.4L9 12L0 6.6L-9 12L-6.4 2.4L-14 -4L-4 -4.5Z" fill="#f4d56e" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 -8L1.6 -3L6 -2.8L2.4 .6L3.6 5L0 2.6L-3.6 5L-2.4 .6L-6 -2.8L-1.6 -3Z" fill="#fff3c4" opacity=".8"/></g></g>`},
 {id:"sp_n5",slot:"head",name:"벚꽃 요정 화관",special:true,level:"N5",svg:`<g ${WC}>${grandWreath()}</g>`},
 {id:"sp_n4",slot:"neck",name:"별빛 스카프",special:true,level:"N4",svg:`<g ${WC}><path d="M204 124C160 112 128 140 96 128C112 150 146 160 176 154C190 152 198 146 206 140Z" fill="#5b6c93" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/><path d="M104 130C130 144 160 150 192 142" stroke="#8da0cf" stroke-width="2" fill="none" opacity=".7"/><path d="M198 116C238 140 282 134 308 106L314 130C284 158 232 162 194 138Z" fill="#5b6c93" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/><path d="M204 120C240 142 282 138 308 112" stroke="#8da0cf" stroke-width="2.4" fill="none" opacity=".7"/><path d="M222 148L214 192L244 188L252 152Z" fill="#5b6c93" stroke="${INK}" stroke-width="1.7" stroke-linejoin="round"/><g fill="#f4d56e" stroke="${INK}" stroke-width=".7">${[[120,134,5],[146,146,6],[172,148,5],[214,134,5],[246,146,6],[276,138,5],[300,118,4],[230,176,5],[238,162,4]].map(([x,y,r])=>`<path d="${starPath(x,y,r)}"/>`).join("")}</g><g fill="#fff" opacity=".85"><circle cx="134" cy="126" r="1.4"/><circle cx="160" cy="156" r="1.4"/><circle cx="262" cy="130" r="1.4"/><circle cx="226" cy="190" r="1.4"/></g><path d="M214 190V200M222 189V201M230 188V200M238 187V199" stroke="#f4d56e" stroke-width="2" stroke-linecap="round"/></g>`},
 {id:"sp_n3",slot:"body",name:"무사의 검",special:true,level:"N3",svg:`<g ${WC}><path d="M140 86C174 104 202 146 214 200" stroke="#6f4630" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M140 86C174 104 202 146 214 200" stroke="#e8c9a0" stroke-width="1.3" fill="none" stroke-dasharray="3 4" opacity=".8"/><g transform="translate(192 138)"><circle r="11" fill="#ebc86e" stroke="${INK}" stroke-width="1.5"/><circle r="7" fill="#b8404f" stroke="${INK}" stroke-width="1"/><circle cx="-2.4" cy="-1.6" r="1.4" fill="#fff"/><circle cx="2.4" cy="-1.6" r="1.4" fill="#fff"/><circle cy="2.4" r="1.4" fill="#fff"/></g><g transform="translate(48 228) rotate(-58) scale(1.3)"><path d="M0 -6.4L116 -6.4C121 -6.4 121 6.4 116 6.4L0 6.4C-5 6.4 -5 -6.4 0 -6.4Z" fill="#202229" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 -3.4L112 -3.4" stroke="#8c93a8" stroke-width="1.4" opacity=".8" stroke-linecap="round"/><g fill="#ebc86e" stroke="${INK}" stroke-width=".5">${[22,46,92].map(x=>`<g transform="translate(${x} 0)">${[0,72,144,216,288].map(a=>`<circle cx="0" cy="-3" r="1.9" transform="rotate(${a})"/>`).join("")}<circle r="1.3" fill="#d94a5a"/></g>`).join("")}</g><rect x="-5" y="-7.2" width="14" height="14.4" rx="4" fill="#ebc86e" stroke="${INK}" stroke-width="1.3"/><rect x="62" y="-10.6" width="15" height="6.2" rx="2" fill="#ebc86e" stroke="${INK}" stroke-width="1.2"/><path d="M69.5 -4.4C70 8 64 22 56 34" stroke="#d94a5a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M69.5 -4.4C71 8 66 22 58 34" stroke="#fffaf2" stroke-width="1.2" fill="none" stroke-dasharray="2.4 3" stroke-linecap="round"/><path d="M52 34L55 46M56 35L58 47M60 34L61 46" stroke="#d94a5a" stroke-width="1.7" stroke-linecap="round"/><rect x="111" y="-7.6" width="11" height="15.2" rx="3" fill="#ebc86e" stroke="${INK}" stroke-width="1.3"/><ellipse cx="127" cy="0" rx="3.2" ry="11.6" fill="#ebc86e" stroke="${INK}" stroke-width="1.5"/><path d="M127 -6C125 -3 125 3 127 6M127 -6C129 -3 129 3 127 6" stroke="#6f4630" stroke-width="1" fill="none"/><rect x="130" y="-5.8" width="46" height="11.6" rx="3" fill="#f4efe2" stroke="${INK}" stroke-width="1.4"/><path d="M134 -5.8L140 0L134 5.8M143 -5.8L149 0L143 5.8M152 -5.8L158 0L152 5.8M161 -5.8L167 0L161 5.8M170 -5.8L176 0" stroke="#2c3b82" stroke-width="2.2" fill="none" stroke-linejoin="round"/><path d="M137 -5.8L143 0L137 5.8M146 -5.8L152 0L146 5.8M155 -5.8L161 0L155 5.8M164 -5.8L170 0L164 5.8" stroke="#2c3b82" stroke-width="2.2" fill="none" stroke-linejoin="round" opacity=".5"/><ellipse cx="150" cy="0" rx="3.6" ry="3" fill="#ebc86e" stroke="${INK}" stroke-width=".9"/><rect x="172" y="-6.6" width="8" height="13.2" rx="2.8" fill="#ebc86e" stroke="${INK}" stroke-width="1.3"/></g><g fill="#ffe27a" stroke="${INK}" stroke-width=".5"><path d="M168 36l1.6 3.8l3.8 1.6l-3.8 1.6l-1.6 3.8l-1.6-3.8l-3.8-1.6l3.8-1.6z"/><path d="M150 54l1.2 2.8l2.8 1.2l-2.8 1.2l-1.2 2.8l-1.2-2.8l-2.8-1.2l2.8-1.2z"/></g></g>`},
 {id:"sp_n2",slot:"head",name:"무사의 투구",special:true,level:"N2",svg:`<g ${WC}><path d="M176 50C150 52 138 68 140 94C158 88 172 74 182 62Z" fill="#c9473f" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M172 64C156 66 146 74 144 86M178 58C160 60 148 68 142 80" stroke="#7a2a24" stroke-width="1.1" fill="none" opacity=".7"/><path d="M174 54C166 0 300 -2 292 50Z" fill="#3f4a6b" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M190 30C220 18 256 18 284 30M182 42C220 28 260 28 290 42" stroke="#6a7aa8" stroke-width="1.6" fill="none" opacity=".8"/><g fill="#d9b04e" stroke="${INK}" stroke-width=".8">${[186,200,214,228,242,256,270,284].map(x=>`<circle cx="${x}" cy="${40-Math.abs(x-238)*.06}" r="2"/>`).join("")}</g><path d="M172 54C214 70 262 66 296 50L298 60C262 76 214 78 170 64Z" fill="#d9b04e" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M296 52C312 50 318 64 310 76C300 68 298 60 296 52Z" fill="#c9473f" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M246 12C234-10 210-26 190-24C208-10 230 6 240 22Z" fill="#ebc86e" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M250 12C262-10 286-26 306-24C288-10 266 6 256 22Z" fill="#ebc86e" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="248" cy="16" r="5.4" fill="#d94a5a" stroke="${INK}" stroke-width="1.4"/><path d="M200 -14L208 -9M300 -14L292 -9" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/></g>`},
 {id:"sp_n1",slot:"head",name:"봉황관",special:true,level:"N1",svg:`<g ${WC}>${phoenixFeathers()}<path d="M200 42C198 22 224 12 238 12C252 12 278 22 276 42Z" fill="#b8404f" stroke="${INK}" stroke-width="1.6"/><path d="M198 44L202 18L220 30L238 4L256 30L274 18L278 44Z" fill="#ebc86e" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M198 44Q238 56 278 44L277 33Q238 45 199 33Z" fill="#e2b04e" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="238" cy="33" r="6.4" fill="#d94a5a" stroke="${INK}" stroke-width="1.5"/><circle cx="236" cy="31" r="1.8" fill="#fff"/><path d="M216 36L220 31L224 36L220 41Z" fill="#6cc29a" stroke="${INK}" stroke-width="1.2"/><path d="M252 36L256 31L260 36L256 41Z" fill="#6aa8e0" stroke="${INK}" stroke-width="1.2"/><circle cx="238" cy="2" r="5" fill="#fffaf2" stroke="${INK}" stroke-width="1.3"/><g fill="#fffaf2" stroke="${INK}" stroke-width="1">${[[200,52],[199,62],[200,72],[201,82],[276,52],[277,62],[276,72]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.4"/>`).join("")}</g><path d="M200 46V82M276 46V74" stroke="#d9a63a" stroke-width="1" opacity=".7"/></g>`}
];
const charState=()=>{ const s=get("jp-char",null)||{seeds:30,owned:[],equip:{}}; s.equip=s.equip||{}; Object.keys(s.equip).forEach(k=>{ const it=ITEMS.find(x=>x.id===s.equip[k]); if(!it||it.slot!==k) delete s.equip[k]; }); return s; };
/* 급수를 전부 끝낸 사람에게만 열리는 특별 아이템(건너뛰기로는 안 열려요) */
function levelProgress(L){ const st=get("jp-path",{done:{}}); let all=0, real=0; build().forEach(u=>{ if(u.tag===L) u.nodes.forEach(n=>{ all++; if(st.done&&st.done[n.id]===1) real++; }); }); return {all,real}; }
const levelCleared=L=>{ const p=levelProgress(L); return p.all>0&&p.real>=p.all; };
function checkSpecial(){ try{ const s=charState(); let changed=false;
  ITEMS.filter(x=>x.special).forEach(it=>{ if(!s.owned.includes(it.id)&&levelCleared(it.level)){ s.owned.push(it.id); changed=true; A().toast(it.level+" 클리어! 특별 아이템 「"+it.name+"」을(를) 받았어요"); } });
  if(changed) saveChar(s);
  /* N5부터 N1까지 모든 단계를 직접 끝내면 특별 칭호 */
  if(["N5","N4","N3","N2","N1"].every(levelCleared)){ const gs=giftState(); gs.extra=gs.extra||[]; if(!gs.extra.some(x=>x.title===MASTER_TITLE)){ gs.extra.push({title:MASTER_TITLE,at:Date.now()}); set("jp-gift",gs); A().toast("N5~N1 전부 클리어! 칭호 「"+MASTER_TITLE+"」을(를) 받았어요"); } }
  }catch(e){} }
const saveChar=s=>{ set("jp-char",s); try{ if(window.COMMUNITY) COMMUNITY.touch(); }catch(e){} };
function addSeeds(n){ const s=charState(); s.seeds=(s.seeds||0)+n; saveChar(s); }
const DEFS=`<defs><linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#f0a824"/></linearGradient><linearGradient id="gPink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd3e0"/><stop offset="1" stop-color="#ff93b4"/></linearGradient><linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a7e"/><stop offset="1" stop-color="#e0483f"/></linearGradient><linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9ebb2"/><stop offset="1" stop-color="#52b870"/></linearGradient><linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8f7"/><stop offset="1" stop-color="#4294d4"/></linearGradient><linearGradient id="gStraw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbeab9"/><stop offset="1" stop-color="#ebc67c"/></linearGradient><linearGradient id="gDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a5552"/><stop offset="1" stop-color="#211e1d"/></linearGradient><filter id="fWc" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".018 .026" numOctaves="3" seed="7" result="warp"/><feDisplacementMap in="SourceGraphic" in2="warp" scale="6" result="d"/><feGaussianBlur in="d" stdDeviation="1.6" result="b"/><feComposite in="d" in2="b" operator="arithmetic" k1="0" k2="1.55" k3="-.55" k4="0" result="edge"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="gr"/><feColorMatrix in="gr" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.55 1.05" result="ga"/><feComposite in="edge" in2="ga" operator="in"/></filter></defs>`;
function birdSvg(equip,cls){
  const eq=equip||charState().equip||{}, order=["body","belly","neck","face","head"];
  return `<svg class="${cls||""}" viewBox="0 -44 375 376" aria-hidden="true">${DEFS}<image href="mascot.png" x="0" y="0" width="375" height="332"/>${order.map(sl=>{ const it=ITEMS.find(x=>x.id===eq[sl]); return it?`<g>${it.svg}</g>`:""; }).join("")}</svg>`;
}
function birdHtml(){
  const s=charState(), cheapest=Math.min(...ITEMS.filter(x=>!s.owned.includes(x.id)).map(x=>x.price),Infinity), can=cheapest<=(s.seeds||0);
  return `<div class="hbw"><button class="hbird" data-shop="1" aria-label="${E(birdTitle())} 꾸미기">${birdSvg(null)}</button><button class="hbtag ${can?"hot":""}" data-shop="1">꾸미기 · 현재 씨앗 ${s.seeds||0}</button></div>`;
}
const birdTitle=()=>{ try{ const p=A().curProfile(); return p&&p.cloud?p.name+"님의 참새":"내 참새"; }catch(e){ return "내 참새"; } };
let shopSlot="head", shopPrev={};
function shopRender(){
  const d=document.getElementById("shopDlg"), s=charState(), pv=Object.keys(shopPrev).filter(k=>shopPrev[k]&&shopPrev[k]!==s.equip[k]);
  const eq=Object.assign({},s.equip,shopPrev), pvItems=pv.map(k=>ITEMS.find(x=>x.id===shopPrev[k])).filter(Boolean);
  d.innerHTML=`<div class="dh"><h2 style="margin:0">${E(birdTitle())}</h2><button class="x" data-sclose aria-label="닫기">×</button></div>
  <div class="db"><div class="shopbird">${birdSvg(eq,"big")}</div>
  <p class="sub" style="text-align:center;margin:4px 0 2px;min-height:22px;font-size:.85em">${pvItems.length?`미리보기: <b style="color:var(--accent-text)">${pvItems.map(i=>E(i.name)).join(", ")}</b> · <button class="shreset" data-sreset="1">원래대로</button>`:""}</p>
  <p class="sub" style="text-align:center;margin:0 0 10px;font-size:.85em">현재 씨앗 <b style="color:var(--accent-text)">${s.seeds||0}</b>개<br>씨앗은 단계별로 공부하기 / 7일 연속출석 / 주간리그를 통해서 받을 수 있어요.</p>
  <div class="shtabs">${SLOTS.map(([k,n])=>`<button class="pill ${shopSlot===k?"on":""}" data-sslot="${k}">${n}</button>`).join("")}</div>
  ${shopSlot==="special"?`<p class="sub" style="text-align:center;margin:4px 0">급수의 단어 퀴즈를 전부 직접 통과하면 받는 특별아이템이에요(건너뛰기는 안 돼요)</p>`:""}<div class="shl">${ITEMS.filter(x=>shopSlot==="special"?x.special:(!x.special&&x.slot===shopSlot)).map(it=>{ const own=s.owned.includes(it.id), on=s.equip[it.slot]===it.id, isPv=shopPrev[it.slot]===it.id, lp=it.special?levelProgress(it.level):null;
    return `<div class="shi ${isPv?"pv":""}" data-spv="${it.id}"><div class="shp">${birdSvg({[it.slot]:it.id},"mini")}</div><div class="shn"><b>${E(it.name)}${it.special?` <em class="spb">${it.level}</em>`:""}</b><small>${own?(on?"착용 중":"보유 중"):(it.special?`${it.level} 전체 클리어 · ${lp.real} / ${lp.all} 단계`:it.price+" 씨앗")}</small></div>
     ${own?`<button class="pill ${on?"":"on"}" data-sequip="${it.id}">${on?"벗기":"입히기"}</button>`:(it.special?`<span class="shlock">잠김</span>`:`<button class="pill ${(s.seeds||0)>=it.price?"on":""}" data-sbuy="${it.id}" ${(s.seeds||0)>=it.price?"":"disabled"} style="line-height:1.15">購入<small style="display:block;font-size:10px;font-weight:400">구입</small></button>`)}</div>`; }).join("")}</div></div>`;
}
function openShop(){ checkSpecial(); let d=document.getElementById("shopDlg");
  if(!d){ d=document.createElement("dialog"); d.id="shopDlg"; document.body.appendChild(d);
    d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-sclose]")){ shopPrev={}; d.close(); A().renderHome(); return; }
      const sl=ev.target.closest("[data-sslot]"), by=ev.target.closest("[data-sbuy]"), eq=ev.target.closest("[data-sequip]"), rs=ev.target.closest("[data-sreset]"), pv=ev.target.closest("[data-spv]");
      if(sl){ shopSlot=sl.dataset.sslot; shopRender(); }
      else if(rs){ shopPrev={}; shopRender(); }
      else if(by){ const it=ITEMS.find(x=>x.id===by.dataset.sbuy), s=charState(); if(it&&(s.seeds||0)>=it.price&&!s.owned.includes(it.id)){ s.seeds-=it.price; s.owned.push(it.id); s.equip[it.slot]=it.id; delete shopPrev[it.slot]; saveChar(s); A().toast("「"+it.name+"」을(를) 샀어요!"); shopRender(); } }
      else if(eq){ const it=ITEMS.find(x=>x.id===eq.dataset.sequip), s=charState(); if(it&&s.owned.includes(it.id)){ if(s.equip[it.slot]===it.id) delete s.equip[it.slot]; else s.equip[it.slot]=it.id; delete shopPrev[it.slot]; saveChar(s); shopRender(); } }
      else if(pv){ const it=ITEMS.find(x=>x.id===pv.dataset.spv); if(it){ if(shopPrev[it.slot]===it.id) delete shopPrev[it.slot]; else shopPrev[it.slot]=it.id; shopRender(); } } }); }
  shopRender(); if(!d.open) d.showModal();
}

/* ---------- 경로 구성 ---------- */
const KANA_UNITS=[["h","히라가나 기본",0,9],["h","히라가나 탁음 · 요음 · 촉음",10,18],["k","가타카나 기본",0,9],["k","가타카나 탁음 · 요음 · 촉음",10,18]];
const KANA_LABEL={h:["あ행","か행","さ행","た행","な행","は행","ま행","や행","ら행","わ행·ん","が행","ざ행","だ행","ば행","ぱ행","きゃ행","ひゃ행","ぎゃ행","っ · ー"],
                  k:["ア행","カ행","サ행","タ행","ナ행","ハ행","マ행","ヤ행","ラ행","ワ행·ン","ガ행","ザ행","ダ행","バ행","パ행","キャ행","ヒャ행","ギャ행","ッ · ー"]};
const KANA_GLYPH={h:["あ","か","さ","た","な","は","ま","や","ら","わ","が","ざ","だ","ば","ぱ","きゃ","ひゃ","ぎゃ","っ"],k:["ア","カ","サ","タ","ナ","ハ","マ","ヤ","ラ","ワ","ガ","ザ","ダ","バ","パ","キャ","ヒャ","ギャ","ッ"]};
let UN=null, UN_SIG="";
function levels(){ const my=A().myLv(); return my.length?["N5","N4","N3","N2","N1"].filter(l=>my.includes(l)):["N5","N4","N3","N2","N1"]; }
function lessonWords(L,idx){ const ws=A().ALL.filter(w=>w.lv===L||w.lv2===L).map((w,i)=>({w,i})); ws.sort((a,b)=>((a.w.tier||2)-(b.w.tier||2))||(a.i-b.i)); return ws.slice(idx*LESSON_N,(idx+1)*LESSON_N).map(x=>x.w); }
function build(){
  const sig=levels().join(",")+"|"+A().ALL.length; if(UN&&sig===UN_SIG) return UN; UN_SIG=sig; UN=[];
  KANA_UNITS.forEach(([k,title,a,b],ui)=>{ const nodes=[]; for(let i=a;i<=b;i++) nodes.push({id:k+i,kind:"kana",k,i,label:KANA_LABEL[k][i],glyph:KANA_GLYPH[k][i]}); UN.push({id:"ku"+ui,title,tag:"글자 입문",nodes}); });
  levels().forEach(L=>{ const n=A().ALL.filter(w=>w.lv===L||w.lv2===L).length, cnt=Math.ceil(n/LESSON_N);
    for(let u=0;u*UNIT_N<cnt;u++){ const nodes=[]; for(let j=u*UNIT_N;j<Math.min(cnt,(u+1)*UNIT_N);j++) nodes.push({id:"w:"+L+":"+j,kind:"word",L,j,label:"단어 "+(j*LESSON_N+1)+"~"+Math.min(n,(j+1)*LESSON_N),glyph:String(j+1)});
      UN.push({id:"wu"+L+u,title:L+" 단어 "+(u*UNIT_N*LESSON_N+1)+"~"+Math.min(n,(u+1)*UNIT_N*LESSON_N),tag:L,nodes}); } });
  return UN;
}
const state=()=>get("jp-path",{done:{},open:null});
function isDone(n,st){ if(n.kind==="kana"){ const d=get("jp-kana",{done:{}}).done||{}; return !!d[n.id]||!!(st.done&&st.done[n.id]); } return !!(st.done&&st.done[n.id]); }
const showKana=()=>{ const p=A().prefs(); if(p.showKana!==undefined) return !!p.showKana; const d=get("jp-kana",{done:{}}).done||{}; return Object.keys(d).length>0; };
const vis=()=>build().filter(u=>!u.id.startsWith("ku"));
function current(){ const st=state(); for(const u of vis()) for(const n of u.nodes) if(!isDone(n,st)) return {u,n}; return null; }
let showAllUnits=false;

/* ---------- 홈 화면 조각 ---------- */
let openUnits=new Set();
function statusHtml(){
  const x=xpState(), l=lvOf(x.t), pc=lvPct(x.t,l), st=A().streakDays();
  return `<div class="pstat"><div class="prow1"><b>Lv.${l} ${titleOf(l)}</b><span>${st?st+"일 연속 · ":""}${x.t} XP · 현재 씨앗 ${charState().seeds||0}</span></div><div class="prog"><div style="width:${pc}%"></div></div></div>`;
}
/* 내 계정 화면: 내 참새 + 레벨·연속 출석·씨앗 */
function profileHtml(){
  const x=xpState(), l=lvOf(x.t), pc=lvPct(x.t,l), st=A().streakDays();
  return `<div class="pfbird">${birdSvg(null,"big")}</div>
   <div class="pfchips"><span><b>Lv.${l}</b> ${titleOf(l)}</span><span><b>${st}</b>일 연속</span><span>씨앗 <b>${charState().seeds||0}</b></span></div>
   ${earnedTitles().length?`<div class="pftt"><small>대표 칭호</small><select data-reptitle aria-label="대표 칭호">${["",...earnedTitles()].map(t=>`<option value="${E(t)}" ${t===repTitle()?"selected":""}>${t?"「"+E(t)+"」":"없음"}</option>`).join("")}</select></div>`:""}
   <div class="pfxp"><div class="prog"><div style="width:${pc}%"></div></div><small>${x.t} XP · ${l>=MAXLV?"최고 레벨이에요!":`다음 레벨까지 ${lvFloor(l+1)-x.t} XP`}</small></div>`;
}
function reviewHtml(){ const n=dueKeys().length; if(!n) return ""; return `<button class="lrow" data-pr="1" style="border-top:1px solid var(--line);margin-top:12px"><span>${n?`복습할 단어 <b style="color:var(--accent-text)">${n}개</b>`:"복습할 단어가 아직 없어요"}</span><i>›</i></button>`; }
function pathHtml(full){
  const st=state(), cur=current(), all=vis(); if(cur) openUnits.add(cur.u.id);
  const offs=[0,26,44,26,0,-26,-44,-26];
  return `<div class="path">${all.map(u=>{
    const done=u.nodes.filter(n=>isDone(n,st)).length, open=openUnits.has(u.id), alld=done===u.nodes.length;
    return `<div class="pu ${open?"open":""} ${alld?"all":""}"><button class="puh" data-pu="${u.id}"><span class="pun">${E(u.tag)}</span><b>${E(u.title)}</b><small>${done} / ${u.nodes.length}</small></button>
     ${open?`<div class="pnodes">${u.nodes.map((n,i)=>{ const dn=isDone(n,st), isCur=cur&&cur.n.id===n.id;
        return `<div class="pn" style="margin-left:calc(50% - 32px + ${offs[i%offs.length]}px)"><button class="pnb ${dn?"done":""} ${isCur?"cur":""}" data-pn="${n.id}" aria-label="${E(n.label)}">${dn?"✓":E(n.glyph)}</button><small>${E(n.label)}</small>${isCur?`<span class="pnow">지금 할 단계</span>`:""}</div>`; }).join("")}
       ${alld?"":`<button class="pskip" data-pskip="${u.id}">이 유닛은 이미 알아요</button>`}</div>`:""}</div>`; }).join("")}</div>`;
}
/* 홈의 '이어서 하기' 한 줄 */
function continueHtml(){ const c=current(); if(!c) return ""; return `<div style="border-top:1px solid var(--line);margin-top:12px;padding-top:8px;font-size:11px;color:var(--sub)">단계별로 공부하기</div><button class="lrow" data-pn="${c.n.id}"><span>이어서 하기 · <b>${E(c.n.L||"")} ${E(c.n.label)}</b></span><i>›</i></button>`; }
/* 따로 분리한 화면: 전체 학습 경로 · 기초 */
let page=null;
const back=`<button class="back" data-ppage="home">‹ 홈으로</button>`;
function basicHtml(){
  const d=get("jp-kana",{done:{}}).done||{}, cnt=k=>{ let n=0; for(let i=0;i<19;i++) if(d[k+i]) n++; return n; };
  return `<div class="home">${back}<h2 style="margin:6px 0 4px">기초</h2><div class="sub" style="margin-bottom:10px">일본어 글자와 기초 단어를 처음부터 배워요</div>
   <div class="lrows"><button class="lrow" data-bkana="h"><span>히라가나<small style="display:block;font-weight:400;color:var(--sub);font-size:13px">글자표 · 행별 레슨 · 따라 쓰기</small></span><span style="color:var(--sub);font-size:13px;font-weight:600">${cnt("h")} / 19 ›</span></button>
   <button class="lrow" data-bkana="k"><span>가타카나<small style="display:block;font-weight:400;color:var(--sub);font-size:13px">외래어에 쓰는 글자</small></span><span style="color:var(--sub);font-size:13px;font-weight:600">${cnt("k")} / 19 ›</span></button>
   <button class="lrow" data-ppage="path"><span>N5 기초 단어<small style="display:block;font-weight:400;color:var(--sub);font-size:13px">쉬운 단어부터 20개씩</small></span><i>›</i></button></div></div>`;
}
function pageHtml(){
  if(page==="basic") return basicHtml();
  return `<div class="home">${back}<h2 style="margin:6px 0 4px">단계별로 공부하기</h2><div class="sub">단계를 눌러 단어 20개를 공부하고, 퀴즈에서 70% 이상 맞히면 완료돼요</div>${pathHtml(true)}</div>`;
}
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- 레슨 시트 ---------- */
let active=null;
function sheet(n){
  const ws=lessonWords(n.L,n.j); let d=document.getElementById("pathDlg");
  if(!d){ d=document.createElement("dialog"); d.id="pathDlg"; document.body.appendChild(d); d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-pclose]")) d.close(); }); }
  d.innerHTML=`<div class="dh"><h2 style="margin:0">${E(n.L)} · ${E(n.label)}</h2><button class="x" data-pclose aria-label="닫기">×</button></div>
   <div class="db"><p class="sub">${ws.length}개 단어를 보고, 퀴즈에서 ${Math.round(PASS*100)}% 이상 맞히면 단계가 완료돼요.</p>
   <div class="pwl">${ws.map(w=>`<div class="pwi"><b>${A().R(w.f)}</b><span>${E(w.ko)}</span></div>`).join("")}</div>
   <div class="qbtns" style="flex-direction:column;align-items:stretch;margin-top:12px"><button class="cta sec" data-pgo="card">카드로 먼저 보기</button><button class="cta" data-pgo="quiz">퀴즈 시작</button></div></div>`;
  d.dataset.n=n.id; if(!d.open) d.showModal();
}
function startNode(id){
  if(id[0]==="h"||id[0]==="k"){ const k=id[0]==="k"; window.KANA&&window.KANA.openLesson(+id.slice(1),k); return; }
  const [,L,j]=id.split(":"), n=build().flatMap(u=>u.nodes).find(x=>x.id===id); if(n) sheet(n);
}
function go(mode){
  const d=document.getElementById("pathDlg"); if(!d) return; const id=d.dataset.n, [,L,j]=id.split(":"), ws=lessonWords(L,+j); d.close();
  if(!ws.length){ A().toast("이 단계에는 단어가 없어요"); return; }
  active=mode==="quiz"?{id,keys:new Set(ws.map(w=>w.key))}:null;
  A().setView("quiz"); A().startQuiz(mode==="quiz"?"meaning":"card",ws,ws.length);
}
function markDone(id,skip){ const st=state(); st.done=st.done||{}; if(!st.done[id]) st.done[id]=skip?2:1; set("jp-path",st); if(!skip) checkSpecial(); }

/* ---------- 7일 연속 여정 · 선물 ---------- */
const GIFT_TITLES=["새싹 참새","날갯짓 참새","하늘 참새","한 달 참새"];
const NUM=["零","一","二","三","四","五","六","七","八","九","十"];
const kan=n=>n<=10?NUM[n]:n<20?"十"+(n%10?NUM[n%10]:""):NUM[Math.floor(n/10)]+"十"+(n%10?NUM[n%10]:"");
/* 대표 칭호: 받은 칭호 중 하나를 골라 내 계정·리그에 보여 줘요(안 고르면 가장 높은 칭호) */
const MASTER_TITLE="JLPT 정복자";
const earnedTitles=()=>{ const seen=new Set(), out=[]; const gs0=giftState(); (gs0.extra||[]).forEach(x=>{ if(!seen.has(x.title)){ seen.add(x.title); out.push(x.title); } }); (gs0.items||[]).slice().sort((a,b)=>b.j-a.j).forEach(i=>{ if(!seen.has(i.title)){ seen.add(i.title); out.push(i.title); } }); return out; };
const repTitle=()=>{ const gs=giftState(), t=earnedTitles(); if(gs.rep==="") return ""; if(gs.rep&&t.includes(gs.rep)) return gs.rep; return t[0]||""; };
function setRepTitle(t){ const gs=giftState(); gs.rep=t; set("jp-gift",gs); try{ if(window.COMMUNITY) COMMUNITY.touch(); }catch(e){} }
const giftTitle=j=>j<=GIFT_TITLES.length?GIFT_TITLES[j-1]:"전설의 참새";
const ds=i=>new Date(Date.now()-i*864e5).toLocaleDateString("sv-SE");
const giftState=()=>get("jp-gift",{claimed:{},items:[]});
function journey(){
  const s=A().streakDays(), pos=s>0?((s-1)%7)+1:0, last=A().studiedToday()?0:1, run=s>0?ds(last+s-1):"";
  const gs=giftState(); let pending=0;
  for(let j=1;j<=Math.floor(s/7);j++){ if(!gs.claimed[run+":"+j]){ pending=j; break; } }
  return {s,pos,run,pending,items:gs.items||[]};
}
const JX=i=>24+i*45.3, JY=i=>[64,42,64,42,64,42,52][i], JH=100;
/* ---------- 계절 배경(날짜에 맞춰 자동으로 바뀌어요) ---------- */
const SEASON_NAMES={spring:"봄",summer:"여름",autumn:"가을",winter:"겨울",xmas:"크리스마스"};
function seasonKey(){ try{ const pv=sessionStorage.getItem("jp-season-pv"); if(pv) return pv; const o=localStorage.getItem("jp-season"); if(o) return o; }catch(e){} const d=new Date(), m=d.getMonth()+1, day=d.getDate();
  if(m===12&&day<=26) return "xmas";
  if((m===11&&day>=15)||m===12||m<=2) return "winter";
  if(m<=5) return "spring"; if(m<=8) return "summer"; return "autumn"; }
const snowCap=(w)=>`<path d="M${-w} 0C${-w*.6}-5 ${w*.6}-5 ${w} 0C${w*.6}3 ${-w*.6}3 ${-w} 0Z" fill="#fff" stroke="${INK}" stroke-width=".7"/>`;
const pine=(x,y,s,sn)=>{ const snowy=sn==="winter"||sn==="xmas";
  const body=`<path d="M-1.6 3C-2.6 -4 -1 -9 -2.2 -15L2.6 -15C1.6 -9 3 -4 2.2 3Z" fill="var(--fo-trunk)" stroke="${INK}" stroke-width=".8"/><path d="M0 -46L-5 -37L-3 -36L-9 -28L-6 -27L-13 -17L-9 -16L-17 -6L-6 -8L0 -5L7 -8L17 -6L9 -16L13 -17L6 -27L9 -28L3 -36L5 -37Z" fill="var(--fp2)" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/><path d="M0 -46L5 -37L3 -36L9 -28L6 -27L13 -17L9 -16L17 -6L7 -8L0 -5Z" fill="var(--fp3)" opacity=".6"/><path d="M-8 -22L-4 -20M-5 -12L-1 -10M3 -26L6 -24M7 -15L10 -13" stroke="${INK}" stroke-width=".7" opacity=".4" stroke-linecap="round"/>`;
  let extra="";
  if(snowy) extra+=`<g transform="translate(0 -40) scale(.7)">${snowCap(8)}</g><g transform="translate(-4 -28)">${snowCap(8)}</g><g transform="translate(4 -17)">${snowCap(11)}</g><g transform="translate(-2 -8)">${snowCap(13)}</g>`;
  if(sn==="xmas"){ extra+=`<path d="M0 -50l1.8 4l4.2.4l-3.2 2.8l1 4.2L0 -41l-3.8 2.4l1-4.2l-3.2-2.8l4.2-.4z" fill="#ffe27a" stroke="${INK}" stroke-width=".7"/><path d="M-12 -16L2 -22L-6 -30L8 -34" stroke="#8a6f5c" stroke-width=".8" fill="none" opacity=".6"/>${[[-8,-14,"#d94a5a"],[6,-18,"#ffe27a"],[-3,-26,"#6aa8e0"],[5,-31,"#d94a5a"],[-8,-6,"#ffe27a"],[9,-8,"#6aa8e0"],[0,-37,"#d94a5a"]].map(([ox,oy,c])=>`<circle cx="${ox}" cy="${oy}" r="2.3" fill="${c}" stroke="${INK}" stroke-width=".6"/>`).join("")}`; }
  return `<g transform="translate(${x} ${y}) scale(${s})">${body}${extra}</g>`; };
const sakuraTree=(x,y,s)=>{
  const C=[[-17,-29,12],[0,-39,14],[17,-29,12],[-8,-23,11],[9,-23,11]], flo=[[-14,-32],[4,-42],[16,-30],[-4,-26],[10,-22]];
  return `<g transform="translate(${x} ${y+4}) scale(${(s*.9).toFixed(2)})"><path d="M-3.4 4C-4.2 -4 -2.6 -10 -3.2 -18L3.2 -18C2.6 -10 4.2 -4 3.6 4Z" fill="#8a6a58" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/><path d="M0 -15L-9 -25M0 -15L9 -23" stroke="#8a6a58" stroke-width="2.4" stroke-linecap="round"/>${C.map(([cx,cy,r])=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f7c9d8" stroke="${INK}" stroke-width="1"/>`).join("")}${C.map(([cx,cy,r])=>`<circle cx="${cx}" cy="${cy}" r="${r-.9}" fill="#f9d5e0"/>`).join("")}<ellipse cx="-6" cy="-42" rx="12" ry="7" fill="#fdeaf1" opacity=".85"/><ellipse cx="-17" cy="-33" rx="7" ry="5" fill="#fdeaf1" opacity=".7"/><ellipse cx="11" cy="-18" rx="14" ry="7" fill="#f2adc4" opacity=".55"/><ellipse cx="22" cy="-27" rx="6" ry="6" fill="#f2adc4" opacity=".4"/>${flo.map(([fx,fy],i)=>`<g transform="translate(${fx} ${fy}) rotate(${i*30})">${[0,72,144,216,288].map(a=>`<circle cx="0" cy="-3" r="2.5" fill="#fff6f9" stroke="#e58aa6" stroke-width=".4" transform="rotate(${a})"/>`).join("")}<circle r="1.2" fill="#e0709a"/></g>`).join("")}</g>`; };
const roundTree=(x,y,s,sn)=>{
  if(sn==="spring") return sakuraTree(x,y,s);
  if(sn==="winter"||sn==="xmas") return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-2.2 3C-3.4 -5 -1.2 -11 -3 -22L3.4 -22C1.4 -11 3.6 -5 2.4 3Z" fill="var(--fo-trunk)" stroke="${INK}" stroke-width=".8"/><path d="M0 -20L-12 -34M0 -22L12 -36M-2 -14L-14 -22M2 -16L15 -26M-8 -29L-10 -40M8 -31L10 -42" stroke="var(--fo-trunk)" stroke-width="2.2" stroke-linecap="round" fill="none"/><g transform="translate(-12 -34)">${snowCap(5)}</g><g transform="translate(12 -36)">${snowCap(5)}</g><g transform="translate(-10 -40)">${snowCap(4)}</g><g transform="translate(10 -42)">${snowCap(4)}</g><g transform="translate(-14 -22)">${snowCap(5)}</g><g transform="translate(15 -26)">${snowCap(5)}</g>${sn==="xmas"?[[-10,-41,"#ffe27a"],[10,-43,"#d94a5a"],[-13,-23,"#6aa8e0"],[15,-27,"#ffe27a"],[0,-26,"#d94a5a"]].map(([ox,oy,c])=>`<circle cx="${ox}" cy="${oy}" r="1.9" fill="${c}"/>`).join(""):""}</g>`;
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-2.2 3C-3.4 -5 -1.2 -11 -3 -20L3.4 -20C1.4 -11 3.6 -5 2.4 3Z" fill="var(--fo-trunk)" stroke="${INK}" stroke-width=".8"/><path d="M-3 -14L-9 -22M2 -15L8 -24" stroke="var(--fo-trunk)" stroke-width="2" stroke-linecap="round"/><path d="M-17 -20C-23 -28 -15 -41 -4 -38C1 -47 17 -43 17 -32C26 -28 24 -13 13 -11C7 -4 -9 -4 -15 -11C-20 -13 -18 -17 -17 -20Z" fill="var(--fo1)" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/><path d="M-13 -24C-17 -30 -10 -38 -3 -34C-8 -30 -10 -26 -13 -24Z" fill="var(--fo2)" opacity=".85"/><path d="M4 -33C10 -37 16 -32 13 -26C9 -27 6 -29 4 -33Z" fill="var(--fo2)" opacity=".85"/><path d="M-12 -14C-4 -9 6 -9 12 -14C8 -6 -6 -6 -12 -14Z" fill="var(--fo3)" opacity=".7"/><path d="M-7 -30L-4 -28M5 -22L8 -20M-2 -18L1 -16M-12 -20L-9 -18" stroke="${INK}" stroke-width=".7" opacity=".4" stroke-linecap="round"/></g>`; };
const tree=(x,y,s,k,sn)=>k?pine(x,y,s,sn):roundTree(x,y,s,sn);
const bush=(x,y,s,c,sn)=>{ const snowy=sn==="winter"||sn==="xmas"; return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-20 0C-24-9-14-15-6-12C-2-20 12-18 14-9C24-8 24 0 18 3C8 6-12 6-20 0Z" fill="${snowy?"#ffffff":`var(--fo${c})`}" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>${snowy?`<path d="M-16 2C-6 6 8 6 18 2C10 8-10 8-16 2Z" fill="#c9d9ea" opacity=".75"/>`:`<path d="M-12-4L-8-2M0-8L4-6M9-3L12 0" stroke="${INK}" stroke-width=".7" opacity=".4" stroke-linecap="round"/>`}</g>`; };
const gift=(x,y,c,r)=>`<g transform="translate(${x} ${y})"><rect x="-8" y="-9" width="16" height="12" rx="1.5" fill="${c}" stroke="${INK}" stroke-width=".9"/><path d="M0 -9V3M-8 -3H8" stroke="${r}" stroke-width="2.2"/><path d="M0 -9C-5 -15-9 -9-1 -9M0 -9C5 -15 9 -9 1 -9" fill="none" stroke="${r}" stroke-width="1.6"/></g>`;
const snowman=(x,y)=>`<g transform="translate(${x} ${y})"><circle cy="-6" r="9" fill="#fff" stroke="${INK}" stroke-width=".9"/><circle cy="-20" r="6.4" fill="#fff" stroke="${INK}" stroke-width=".9"/><path d="M-6 -17C-2 -14 2 -14 6 -17L6 -14C2 -11-2 -11-6 -14Z" fill="#d94a5a" stroke="${INK}" stroke-width=".7"/><path d="M0 -21L7 -19.5L0 -18Z" fill="#e8913a" stroke="${INK}" stroke-width=".5"/><circle cx="-2.2" cy="-22.4" r=".9" fill="#3d3836"/><circle cx="2.2" cy="-22.4" r=".9" fill="#3d3836"/><circle cy="-8" r="1" fill="#3d3836"/><circle cy="-4" r="1" fill="#3d3836"/><path d="M-5.5 -26L5.5 -26L4 -33L-4 -33Z" fill="#3d3836" stroke="${INK}" stroke-width=".7"/><path d="M-9 -27H9" stroke="#3d3836" stroke-width="2.2" stroke-linecap="round"/></g>`;
const poolScene=()=>`<path d="M-10 86C28 80 62 92 102 86C142 80 182 90 224 86C270 82 300 90 332 86L332 112L-10 112Z" fill="var(--fw1)" stroke="${INK}" stroke-width=".8" opacity=".95"/><path d="M-10 96C30 92 60 100 100 96C140 92 190 100 230 96C270 92 300 98 332 96L332 112L-10 112Z" fill="var(--fw2)" opacity=".6"/><path d="M14 94Q20 91 26 94M60 98Q66 95 72 98M126 93Q132 90 138 93M176 98Q182 95 188 98M246 93Q252 90 258 93M296 98Q302 95 308 98" stroke="#fff" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".8"/><g transform="translate(78 92)"><ellipse rx="19" ry="8" fill="#e86b79" stroke="${INK}" stroke-width="1"/><path d="M-19 0A19 8 0 0 1-9 -7.4M0 -8A19 8 0 0 1 9 -7.4M19 0A19 8 0 0 1 10 7.4M0 8A19 8 0 0 1-10 7.4" stroke="#fffaf2" stroke-width="5.4" fill="none"/><ellipse rx="19" ry="8" fill="none" stroke="${INK}" stroke-width="1"/><ellipse rx="9" ry="3.4" fill="var(--fw1)" stroke="${INK}" stroke-width=".8"/></g><g transform="translate(214 94)"><circle r="8.4" fill="#fffaf2" stroke="${INK}" stroke-width="1"/><path d="M0 -8.4C-4 -3-4 3 0 8.4M0 -8.4C4 -3 4 3 0 8.4" stroke="${INK}" stroke-width=".6" fill="none" opacity=".5"/><path d="M-6 -6C-3 -3 3 -3 6 -6L6 -2C3 1-3 1-6 -2Z" fill="#6aa8e0"/><path d="M-8 1C-4 3 4 3 8 1L7 5C3 7-3 7-7 5Z" fill="#f1c85a"/></g><g transform="translate(272 90)"><path d="M0 8V-24" stroke="#8a6f5c" stroke-width="1.8"/><path d="M-22 -20C-18 -34 18 -34 22 -20C14 -24-14 -24-22 -20Z" fill="#fffaf2" stroke="${INK}" stroke-width="1"/><path d="M-11 -29C-11 -24-11 -22-10 -22M0 -31L0 -22M11 -29C11 -24 11 -22 10 -22" stroke="#e86b79" stroke-width="5" fill="none" opacity=".9"/><path d="M-22 -20C-18 -34 18 -34 22 -20" fill="none" stroke="${INK}" stroke-width="1"/></g>`;
const forestBg=(sn)=>{ sn=sn||"summer"; const snowy=sn==="winter"||sn==="xmas";
  const hills=`<path d="M-10 84C20 62 70 60 110 76C150 88 190 66 240 70C280 74 310 66 332 80L332 110L-10 110Z" fill="var(--fg1)" opacity=".75"/><path d="M-10 92C40 78 100 84 150 92C200 98 260 80 332 92L332 110L-10 110Z" fill="var(--fg2)" opacity=".6"/>`;
  const trees=[[14,48,.82,1],[74,46,.92,0],[130,48,.74,1],[198,46,.88,0],[258,48,.78,1],[308,46,.92,0]].map(([x,y,s,k])=>tree(x,y,s,k,sn)).join("");
  const bushes=sn==="summer"?"":[[36,94,.9,3],[112,96,.8,2],[192,94,.95,3],[276,96,.82,2]].map(([x,y,s,c])=>bush(x,y,s,c,sn)).join("");
  let deco="";
  if(sn==="xmas") deco=gift(60,94,"#d94a5a","#ffe27a")+gift(75,96,"#6aa8e0","#fff")+gift(232,94,"#6cc29a","#d94a5a")+snowman(150,96)+`<path d="M6 8C60 22 120 -2 180 14C230 26 280 4 316 16" stroke="#8a6f5c" stroke-width=".8" fill="none" opacity=".5"/>`+[[24,15,"#d94a5a"],[64,15,"#ffe27a"],[104,10,"#6aa8e0"],[146,6,"#d94a5a"],[190,16,"#ffe27a"],[232,20,"#6aa8e0"],[274,14,"#d94a5a"],[304,14,"#ffe27a"]].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="2.4" fill="${c}"/>`).join("");
  else if(sn==="winter") deco=snowman(150,96);
  else if(sn==="spring") deco=`<g fill="#ffb3c7" stroke="${INK}" stroke-width=".5"><circle cx="58" cy="92" r="2.6"/><circle cx="150" cy="95" r="2.4"/><circle cx="234" cy="92" r="2.6"/></g><g fill="#fff3c4" stroke="${INK}" stroke-width=".5"><circle cx="90" cy="94" r="2.2"/><circle cx="214" cy="96" r="2.2"/><circle cx="302" cy="92" r="2.2"/></g>`;
  else if(sn==="summer") deco=poolScene()+`<circle cx="292" cy="14" r="20" fill="#fff0b0" opacity=".7"/><circle cx="292" cy="14" r="11" fill="#ffe27a" stroke="${INK}" stroke-width=".8" opacity=".95"/><path d="M292 -8V-14M314 14H322M270 14H262M308 -2L314 -8M276 -2L270 -8" stroke="#f1c85a" stroke-width="1.8" stroke-linecap="round"/>`;
  else deco=`<g stroke="${INK}" stroke-width=".6">${[[52,94,"#d9744e"],[96,96,"#e8a15f"],[158,95,"#d9744e"],[226,94,"#e8a15f"],[296,96,"#d9744e"]].map(([x,y,c])=>`<path transform="translate(${x} ${y}) rotate(${x%90})" d="M0 0C4-4 10-3 12 1C8 5 3 4 0 0Z" fill="${c}"/>`).join("")}</g>`;
  return `<g class="jf" filter="url(#fWc)">${hills}${trees}${bushes}${deco}</g>`; };
/* 떨어지는 눈 · 꽃잎 · 낙엽 */
function particles(sn){
  if(sn==="summer") return "";
  const kind=sn==="spring"?"p":sn==="autumn"?"l":"s";
  return `<g class="jpart" pointer-events="none">${Array.from({length:16},(_,i)=>{ const x=(i*21+(i%3)*9)%320, d=(i*.55)%6, dur=5+(i%5)*.9, sz=1.5+(i%3)*.7;
    const shape=kind==="s"?`<circle r="${sz}" fill="#fff" stroke="#cfdcec" stroke-width=".4"/>`:kind==="p"?`<path d="M0 0C-3 1-3 5 0 6C3 5 3 1 0 0Z" fill="#fbcad9" stroke="#e58aa6" stroke-width=".4"/>`:`<path d="M0 0C3-2 7-1 8 2C5 4 2 3 0 0Z" fill="${i%2?"#e8913a":"#d9744e"}" stroke="#a5552f" stroke-width=".4"/>`;
    return `<g class="jp" style="animation-delay:-${d.toFixed(1)}s;animation-duration:${dur.toFixed(1)}s" transform="translate(${x} 0)">${shape}</g>`; }).join("")}</g>`; }
function journeyHtml(){
  const J=journey(), prev=+(localStorage.getItem("jp-jpos")||0), sn=seasonKey(), pvOn=!!sessionStorage.getItem("jp-season-pv");
  const stops=[0,1,2,3,4,5,6].map(i=>{ const x=JX(i), y=JY(i), done=i<J.pos, cur=i===J.pos-1;
    if(i===6) return `<g class="jg ${J.pos>=7?"on":""}"><rect x="${x-13}" y="${y-8}" width="26" height="20" rx="3"/><rect x="${x-13}" y="${y-13}" width="26" height="7" rx="2"/><path d="M${x} ${y-13}v25M${x-4} ${y-17}q4 -2 4 4q0 -6 4 -4"/></g>`;
    return `<g class="js ${done?"done":""} ${cur?"cur":""}"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y+4}" text-anchor="middle">${i+1}</text></g>`; }).join("");
  const line=[0,1,2,3,4,5,6].map(i=>`${i?"L":"M"}${JX(i)} ${JY(i)}`).join(" ");
  const pxy=p=>p<=0?[6,JY(0)]:[JX(p-1),JY(p-1)];
  const [fx,fy]=pxy(prev), [tx,ty]=pxy(J.pos);
  const DAYMSG=["오늘 첫걸음을 떼 볼까요? 참새가 기다리고 있어요","첫걸음 완료! 내일도 이어서 걸어요","이틀째! 좋은 출발이에요, 이 기세로 가요","사흘째! 벌써 절반 가까이 왔어요","나흘째! 절반을 넘었어요, 조금만 더요","닷새째! 선물 상자가 눈앞이에요","엿새째! 내일이면 선물 상자가 열려요"];
  const msg=J.pending?"일곱 걸음을 다 걸었어요! 선물 상자가 기다려요":J.pos<7?DAYMSG[J.pos]:"도착했어요! 내일부터 새 여정이 시작돼요";
  setTimeout(()=>{ const b=document.querySelector(".jrb"); if(b){ b.style.left=(tx/3.2)+"%"; b.style.top=((ty-40)/JH*100)+"%"; } try{ localStorage.setItem("jp-jpos",String(J.pos)); }catch(e){} },80);
  return `<div class="jr" data-season="${sn}"><div class="jrh"><b>7일 연속 출석</b><span>${J.pos} / 7일</span></div>
   <div class="jrroad"><svg viewBox="0 0 320 ${JH}" aria-hidden="true">${DEFS}${forestBg(sn)}<path class="jl2" filter="url(#fWc)" d="${line}"/><path class="jl" d="${line}"/>${stops}${particles(sn)}</svg><div class="jrb" style="left:${fx/3.2}%;top:${(fy-40)/JH*100}%">${birdSvg(null)}</div></div>
   <div class="jrf"><span>${msg}</span>${J.pending?`<button class="cta" data-gift="open" style="width:auto;padding:10px 18px;font-size:15px">선물 받기</button>`:""}</div>
   ${(J.items.length||(giftState().extra||[]).length)?`<div class="jrx"><button class="jrc" data-gift="box">내 칭호 모음 · ${earnedTitles().length}개 ›</button></div>`:""}</div>`;
}
function giftDlg(){ let d=document.getElementById("giftDlg"); if(!d){ d=document.createElement("dialog"); d.id="giftDlg"; document.body.appendChild(d); d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-gclose]")){ d.close(); A().renderHome(); } else { const rt=ev.target.closest("[data-rt]"); if(rt){ setRepTitle(rt.dataset.rt); giftAct("box"); return; } const g=ev.target.closest("[data-gift]"); if(g) giftAct(g.dataset.gift); } }); } return d; }
const stamp=n=>{ const t=kan(n)+"日"; return `<div class="stamp"><b style="font-size:${t.length>3?22:28}px">${t}</b><small>連続</small></div>`; };
function giftAct(a){
  const d=giftDlg();
  if(a==="open"){ const J=journey(); if(!J.pending) return;
    d.innerHTML=`<div class="db" style="text-align:center;padding:28px 20px"><p class="sub">${J.pending*7}일 연속 달성!</p><svg class="giftbox" viewBox="0 0 120 110" aria-hidden="true"><rect x="20" y="46" width="80" height="54" rx="6"/><rect x="14" y="32" width="92" height="20" rx="5"/><path d="M60 32v68M60 32q-16 -22 -26 -10q-6 12 26 10zM60 32q16 -22 26 -10q6 12 -26 10z"/></svg><div><button class="cta" data-gift="reveal" data-j="${J.pending}" style="max-width:220px;margin:14px auto 0">상자 열기</button></div></div>`;
    if(!d.open) d.showModal(); return; }
  if(a==="reveal"){ const J=journey(), j=J.pending; if(!j) return; const gs=giftState(); gs.claimed[J.run+":"+j]=1; gs.items.push({j,n:j*7,title:giftTitle(j),at:Date.now()}); set("jp-gift",gs); addXp(100); addSeeds(70);
    d.innerHTML=`<div class="db" style="text-align:center;padding:26px 20px"><p class="sub">선물이 도착했어요</p>${stamp(j*7)}<h3 style="margin:12px 0 2px">「${giftTitle(j)}」 칭호</h3><p class="sub" style="margin:0">+100 XP · 씨앗 70개 · 칭호 모음에 보관돼요</p><button class="cta" data-gclose style="max-width:220px;margin:18px auto 0">좋아요</button></div>`; return; }
  if(a==="box"){ const gs=giftState(), cur=repTitle();
    const cards=[...(gs.extra||[]).map(x=>({title:x.title,at:x.at,master:1})),...(gs.items||[]).slice().reverse().map(x=>({title:x.title,at:x.at,n:x.n}))];
    d.innerHTML=`<div class="dh"><h2 style="margin:0">내 칭호 모음</h2><button class="x" data-gclose aria-label="닫기">×</button></div><div class="db">
     <p class="sub gsum">받은 칭호 <b>${new Set(cards.map(c=>c.title)).size}</b>개 · 대표 칭호 <b>${cur?"「"+E(cur)+"」":"없음"}</b></p>
     <p class="sub" style="font-size:12px;margin:0 0 10px">칸을 누르면 대표 칭호가 바뀌어요. 내 계정과 리그에 보여요.</p>
     <div class="gl">${cards.map(c=>`<button class="gi ${c.title===cur?"rep":""}" data-rt="${E(c.title)}">${c.master?`<div class="stamp"><b style="font-size:30px">全</b><small>制覇</small></div>`:stamp(c.n)}<b>${E(c.title)}</b><small>${new Date(c.at).toLocaleDateString("ko-KR")}</small>${c.title===cur?`<em class="grp">대표</em>`:""}</button>`).join("")}</div></div>`;
    if(!d.open) d.showModal(); }
}

/* ---------- 바깥(index.html·kana.js)에서 부르는 훅 ---------- */
window.PATH={
  equip:()=>charState().equip||{},dev:{state:charState,save:saveChar,items:()=>ITEMS},addSeeds,addXp,birdSvg,statusHtml,profileHtml,repTitle,setRepTitle,reviewHtml,pathHtml,continueHtml,pageHtml,page:()=>page,journeyHtml,birdHtml,openShop,
  rec(w,ok){ try{ if(w&&w.key){ srsUpdate(w.key,ok); if(ok) addXp(10); } }catch(e){} },
  quizEnd(score,keys){ try{
    if(!active) return; const a=active; active=null;
    if(!keys.every(k=>a.keys.has(k))) return;
    const ok=keys.length&&score/keys.length>=PASS;
    if(ok){ const st=state(); const first=!(st.done&&st.done[a.id]); markDone(a.id); if(first){ addXp(30); addSeeds(5); A().toast("단계 완료! +30 XP · 씨앗 5개"); } else A().toast("단계 완료!"); }
    else A().toast("70% 이상 맞히면 완료돼요. 한 번 더 도전해 보세요");
  }catch(e){} },
  kanaDone(id){ try{ const st=state(); st.kx=st.kx||{}; if(!st.kx[id]){ st.kx[id]=1; set("jp-path",st); addXp(30); addSeeds(5); A().toast("단계 완료! +30 XP · 씨앗 5개"); } }catch(e){} },
  review(){ const pool=duePool(); if(!pool.length){ A().toast("지금 복습할 단어가 없어요. 단어를 풀면 복습 일정이 생겨요"); return; } A().setView("quiz"); A().startQuiz("meaning",pool,Math.min(20,pool.length)); }
};

/* ---------- 이벤트 ---------- */
document.addEventListener("click",e=>{
  const hv=document.getElementById("homeView"); if(!hv||!hv.contains(e.target)) return;
  const pu=e.target.closest("[data-pu]"), pn=e.target.closest("[data-pn]"), sk=e.target.closest("[data-pskip]"), pr=e.target.closest("[data-pr]");
  if(pu){ const id=pu.dataset.pu; openUnits.has(id)?openUnits.delete(id):openUnits.add(id); A().renderHome(); }
  else if(pn) startNode(pn.dataset.pn);
  else if(sk){ const u=build().find(x=>x.id===sk.dataset.pskip); if(u&&confirm("「"+u.title+"」 유닛을 이미 알고 있는 것으로 표시할까요? 경험치는 오르지 않아요.")){ u.nodes.forEach(n=>markDone(n.id,true)); A().renderHome(); } }
  else if(pr) window.PATH.review();
  else if(e.target.closest("[data-shop]")) openShop();
  else if(e.target.closest("[data-ppage]")){ const v=e.target.closest("[data-ppage]").dataset.ppage; page=v==="home"?null:v; A().renderHome(); window.scrollTo(0,0); }
  else if(e.target.closest("[data-bkana]")){ window.KANA&&window.KANA.open(e.target.closest("[data-bkana]").dataset.bkana); }
});
document.addEventListener("click",e=>{ if(page&&e.target.closest('#logo,.vb[data-view="home"],[data-go="home"]')) page=null; },true);
document.addEventListener("click",e=>{ const g=e.target.closest("[data-pgo]"); if(g) go(g.dataset.pgo); const gf=e.target.closest("#homeView [data-gift]"); if(gf) giftAct(gf.dataset.gift); });

/* ---------- 스타일 ---------- */
const ST=document.createElement("style");
ST.textContent=`.pstat{border:0!important;background:none!important;padding:0!important;margin:14px 0 14px}
.pstat .prow1{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}.pstat .prow1 b{font-size:15px}.pstat .prow1 span{font-size:13px;color:var(--sub)}
.pstat .sub{display:flex;justify-content:space-between;margin-top:6px;font-size:12px}
.path{margin:18px 0 8px}.path h3{margin:22px 0 6px;font-size:15px;color:var(--sub);font-weight:600}
.pu{border:0!important;box-shadow:none!important;background:none!important;border-radius:0!important;margin-bottom:0;border-top:1px solid var(--line)!important}
.pu.all{opacity:.75}
.puh{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:14px 2px;background:none;border:0;font:inherit;color:var(--text);cursor:pointer}
.puh .pun{font-size:11px;font-weight:800;color:var(--accent-text);background:var(--accent-soft);border-radius:999px;padding:2px 9px;flex:none}
.puh b{flex:1;font-size:15px}.puh small{color:var(--sub);flex:none}
.pnodes{position:relative;padding:2px 0 18px}
.pnodes::before{content:"";position:absolute;left:50%;top:14px;bottom:56px;width:0;border-left:3px dotted var(--line);transform:translateX(-1px)}
.pn{position:relative;width:64px;text-align:center;margin-top:14px}
.pn small{display:block;font-size:11px;color:var(--sub);margin-top:4px;line-height:1.3;white-space:nowrap;position:relative;left:50%;transform:translateX(-50%)}
.pnb{width:64px;height:64px;border-radius:50%;border:1.5px solid var(--line);background:var(--card);color:var(--sub);font:inherit;font-size:19px;font-weight:700;cursor:pointer;position:relative;z-index:1;box-shadow:none;transition:transform .12s}
.pnb:active{transform:scale(.94)}
.pnb.done{background:var(--ok);border-color:var(--ok);color:#fff;box-shadow:none}
.pnb.cur{background:var(--accent);border-color:var(--accent);color:var(--onacc);box-shadow:0 0 0 6px var(--accent-soft)}
.pnow{display:block;font-size:11px;font-weight:800;color:var(--accent-text);background:var(--accent-soft);border-radius:999px;padding:3px 11px;margin-top:9px;position:relative;left:50%;transform:translateX(-50%);white-space:nowrap}
.pskip{display:block;margin:18px auto 0;background:none;border:0;color:var(--sub);text-decoration:underline;font:inherit;font-size:13px;cursor:pointer}
.pwl{display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:42vh;overflow:auto}
.pwi{border:1px solid var(--line);border-radius:10px;padding:6px 9px;display:flex;flex-direction:column;font-size:13px}.pwi b{font-size:15px}.pwi span{color:var(--sub)}
.jr{margin:22px 0 6px}.jrh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:2px}.jrh b{font-size:15px}.jrh span{font-size:13px;color:var(--sub)}
.jrroad{position:relative}.jrroad svg{display:block;width:100%;height:auto;overflow:hidden;border-radius:14px}
.jl{fill:none;stroke:var(--line);stroke-width:3;stroke-dasharray:2 7;stroke-linecap:round}
.js circle{fill:var(--card);stroke:var(--line);stroke-width:2}.js text{font-size:11px;font-weight:700;fill:var(--sub)}
.js.done circle{fill:var(--ok);stroke:var(--ok)}.js.done text{fill:#fff}
.js.cur circle{fill:var(--accent);stroke:var(--accent)}.js.cur text{fill:var(--onacc)}
.jg rect,.jg path{fill:var(--card);stroke:var(--sub);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}.jg.on rect,.jg.on path{stroke:var(--accent);fill:var(--accent-soft)}
.jrb{position:absolute;transform:translate(-50%,0);transition:left 1.1s cubic-bezier(.4,.1,.2,1),top 1.1s cubic-bezier(.4,.1,.2,1);pointer-events:none;animation:jhop 1.6s ease-in-out infinite}
@keyframes jhop{0%,100%{margin-top:0}50%{margin-top:-4px}}
.jrf{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13px;color:var(--sub);margin-top:8px}
.jrx{display:flex;justify-content:space-between;align-items:center;gap:8px}.jrs{margin-left:auto}
.jrc{background:none;border:0;padding:8px 0 0;font:inherit;font-size:13px;color:var(--accent-text);font-weight:600;cursor:pointer}
#giftDlg{border:0;border-radius:18px;padding:0;max-width:380px;width:calc(100% - 28px);background:var(--card);color:var(--text)}#giftDlg::backdrop{background:rgba(0,0,0,.45)}
.giftbox{width:130px;height:auto;animation:giftshake 1.2s ease-in-out infinite}.giftbox rect,.giftbox path{fill:var(--accent-soft);stroke:var(--accent);stroke-width:3;stroke-linejoin:round;stroke-linecap:round}
@keyframes giftshake{0%,100%{transform:rotate(0)}20%{transform:rotate(-4deg)}40%{transform:rotate(4deg)}60%{transform:rotate(-3deg)}80%{transform:rotate(2deg)}}
.stamp{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;min-width:76px;height:76px;padding:0 8px;border:3px solid var(--seal);border-radius:10px;color:var(--seal);transform:rotate(-4deg);animation:gstamp .5s cubic-bezier(.2,1.5,.4,1)}
.stamp b{font-weight:900;line-height:1}.stamp small{font-size:10px;font-weight:700;letter-spacing:.2em;margin-top:3px}
@keyframes gstamp{from{transform:rotate(-4deg) scale(2);opacity:0}to{transform:rotate(-4deg) scale(1);opacity:1}}
.gl{display:grid;grid-template-columns:1fr 1fr;gap:12px}.gi{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 6px;font:inherit;color:inherit;cursor:pointer}.gi.rep{border-color:var(--accent);background:var(--accent-soft)}.grp{position:absolute;top:6px;right:6px;font-style:normal;font-size:10px;font-weight:800;background:var(--accent);color:var(--onacc);border-radius:99px;padding:1px 7px}.gsum{margin:0 0 4px;font-size:14px}.gsum b{color:var(--accent-text)}.gi small{color:var(--sub);font-size:11px}
.jr{--fg1:var(--fo1);--fg2:var(--fo2);--fp2:var(--fo2);--fp3:var(--fo3)}
.jr[data-season="spring"]{--fo1:#f8dfe8;--fo2:#f3bdd0;--fo3:#ea9fba;--fg1:#d5ebd7;--fg2:#b7dcbd;--fp2:#9fcfa8;--fp3:#7fbe92;--fo-trunk:#b98d70;--fo-path:#f3e6cf}
.jr[data-season="summer"]{--fw1:#bfe3f2;--fw2:#8fcbe6;--fo1:#b9dfb0;--fo2:#8fcb92;--fo3:#6db97a;--fg1:#cde9bf;--fg2:#a8d9a0;--fp2:#7fc08a;--fp3:#5fae73;--fo-trunk:#b08968;--fo-path:#f1e3c6}
.jr[data-season="autumn"]{--fo1:#f3d48f;--fo2:#ebaa63;--fo3:#d9744e;--fg1:#f0dfb6;--fg2:#e5c88b;--fp2:#8fae79;--fp3:#6f9a66;--fo-trunk:#a47a58;--fo-path:#efdcc0}
.jr[data-season="winter"],.jr[data-season="xmas"]{--fo1:#ffffff;--fo2:#e4edf6;--fo3:#c9d9ea;--fg1:#f7fafd;--fg2:#e1eaf4;--fp2:#7da98f;--fp3:#5d8c77;--fo-trunk:#8a6f5c;--fo-path:#dfe8f1}
:root[data-theme=dark] .jr[data-season="spring"]{--fo1:#4a3540;--fo2:#5c3f4d;--fo3:#6d4a5a;--fg1:#2c3a30;--fg2:#243229;--fp2:#33563f;--fp3:#2b4a36;--fo-trunk:#6e5542;--fo-path:#3f3529}
:root[data-theme=dark] .jr[data-season="summer"]{--fw1:#2e5f78;--fw2:#25506a;--fo1:#2d4a35;--fo2:#356040;--fo3:#3f7048;--fg1:#2a4030;--fg2:#233829;--fp2:#2e5a3b;--fp3:#274b33;--fo-trunk:#6e5542;--fo-path:#3f3529}
:root[data-theme=dark] .jr[data-season="autumn"]{--fo1:#5a4426;--fo2:#6e4a28;--fo3:#7a3f2c;--fg1:#3a3224;--fg2:#30291d;--fp2:#3d5238;--fp3:#34462f;--fo-trunk:#6e5542;--fo-path:#3f3529}
:root[data-theme=dark] .jr[data-season="winter"],:root[data-theme=dark] .jr[data-season="xmas"]{--fo1:#e9eff6;--fo2:#aab8c9;--fo3:#7e8fa5;--fg1:#3a4553;--fg2:#2f3a47;--fp2:#2f5646;--fp3:#274a3c;--fo-trunk:#6e5542;--fo-path:#46505d}
@keyframes jfall{0%{transform:translate(var(--tx,0),-6px)}100%{transform:translate(var(--tx,0),104px)}}
.jp{animation:jfallx linear infinite}@keyframes jfallx{0%{translate:0 -8px;opacity:0}10%{opacity:1}90%{opacity:1}100%{translate:14px 106px;opacity:0}}
@media(prefers-reduced-motion:reduce){.jp{animation:none;display:none}}
.jl2{fill:none;stroke:var(--fo-path);stroke-width:16;stroke-linecap:round;stroke-linejoin:round;opacity:.95}
.jrb{width:40px;height:40px}.jrb svg{width:100%;height:100%;display:block}
.hbw{display:flex;flex-direction:column;align-items:center;gap:4px;width:84px}.hbw .hbird{width:72px;height:72px}.hbtag{border:0;border-radius:999px;background:var(--chip);color:var(--sub);font:inherit;font-size:10px;font-weight:700;padding:3px 7px;cursor:pointer;white-space:nowrap}.hbtag.hot{background:var(--accent);color:var(--onacc)}
.hbird{width:100%;height:100%;border:0;background:none;padding:0;cursor:pointer;display:block}.hbird svg{width:100%;height:100%;display:block}
.shopbird{display:flex;justify-content:center}.shopbird svg.big{width:210px;height:auto}
.shtabs{display:flex;gap:8px;justify-content:center;margin-bottom:6px}
.shl{display:flex;flex-direction:column;border-top:1px solid var(--line)}.shi{display:flex;align-items:center;gap:12px;padding:10px 2px;border-bottom:1px solid var(--line)}
.spb{font-style:normal;font-size:10px;font-weight:800;color:#fff;background:linear-gradient(90deg,#d9a63a,#e0746a);border-radius:999px;padding:1px 7px;margin-left:4px;vertical-align:middle}.shlock{font-size:12px;color:var(--sub);font-weight:700;padding:6px 10px}
.shi{cursor:pointer}.shi.pv{background:var(--accent-soft);border-radius:12px}.shreset{background:none;border:0;font:inherit;font-size:inherit;color:var(--sub);text-decoration:underline;cursor:pointer;padding:0}
.shp{width:52px;height:52px;flex:none;background:var(--chip);border-radius:12px;display:flex;align-items:center;justify-content:center}.shp svg{width:48px;height:auto}
.shn{flex:1;display:flex;flex-direction:column}.shn small{color:var(--sub);font-size:12px}
.ptools{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:10px}.ptools button{background:none;border:0;font:inherit;font-size:13px;color:var(--sub);text-decoration:underline;cursor:pointer}
#shopDlg{border:0;border-radius:18px;padding:0;max-width:420px;width:calc(100% - 28px);max-height:88vh;overflow:auto;background:var(--card);color:var(--text)}#shopDlg::backdrop{background:rgba(0,0,0,.45)}
#pathDlg{border:0;border-radius:18px;padding:0;max-width:440px;width:calc(100% - 28px);background:var(--card);color:var(--text)}#pathDlg::backdrop{background:rgba(0,0,0,.45)}`;
document.head.appendChild(ST);
/* 홈의 목표·레벨 칸을 넓고 시원하게 + 톡톡 튀는 색 포인트 */
const ST2=document.createElement("style");
ST2.textContent=`
.hgoal{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 18px 14px;margin:14px 0}
.hgoal .sub{font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px}.hgoal .sub b{color:#12a36d;font-size:16px}
.hgoal .prog{height:12px;border-radius:6px;margin:0}.hgoal .prog div{border-radius:6px;background:linear-gradient(90deg,#2ed69b,#12a36d)}
.pstat{border:1px solid var(--line)!important;background:var(--card)!important;border-radius:18px!important;padding:16px 18px 14px!important;margin:14px 0!important}
.pstat .prow1{margin-bottom:10px;align-items:center}.pstat .prow1 b{font-size:17px;color:#6d4ce0}.pstat .prow1 span{font-size:13px}
.pstat .prog{height:12px;border-radius:6px;margin:0}.pstat .prog div{border-radius:6px;background:linear-gradient(90deg,#8b6bff,#c08bff)}
.jlv .pill.on[data-l=N5]{background:var(--n5)!important;color:#fff!important}.jlv .pill.on[data-l=N4]{background:var(--n4)!important;color:#fff!important}
.jlv .pill.on[data-l=N3]{background:var(--n3)!important;color:#fff!important}.jlv .pill.on[data-l=N2]{background:var(--n2)!important;color:#fff!important}
.jlv .pill.on[data-l=N1]{background:var(--n1)!important;color:#fff!important}
.views .vb:nth-child(2).on{color:#2a7fc4;background:#e8f2fc}.views .vb:nth-child(3).on{color:#d98a00;background:#fff3d9}
.views .vb:nth-child(4).on{color:#7c4dd8;background:#f0e8ff}.views .vb:nth-child(5).on{color:#12a36d;background:#e1f6ec}
.views .vb:nth-child(6).on{color:#e0457b;background:#ffe6ef}.views .vb:nth-child(7).on{color:#0f9fb0;background:#dff5f8}
`;
ST2.textContent+=`
.hgoal{background:#fff0d9!important;border-color:transparent!important}.hgoal .sub b{color:#d98a00!important}.hgoal .prog{background:rgba(255,255,255,.75)!important}.hgoal .prog div{background:#e89a14!important}
.pstat{background:#ffe4ee!important;border-color:transparent!important}.pstat .prow1 b{color:#d93c72!important}.pstat .prog{background:rgba(255,255,255,.75)!important}.pstat .prog div{background:#e8588a!important}
:root[data-theme=dark] .hgoal{background:#3a2f1c!important}:root[data-theme=dark] .pstat{background:#3a2230!important}
`;
document.head.appendChild(ST2);
if(A()&&A().renderHome) A().renderHome();
})();
