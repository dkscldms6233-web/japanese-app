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
const TITLES=["견습생","수련생","열혈 학습자","중급 도전자","숙련자","달인","명인"];

/* ---------- 경험치 ---------- */
const xpState=()=>get("jp-xp",{t:0,d:{}});
function addXp(n){ if(!n) return; const s=xpState(); s.t=(s.t||0)+n; s.d=s.d||{}; const d=A().today(); s.d[d]=(s.d[d]||0)+n; set("jp-xp",s);  try{ if(window.COMMUNITY) COMMUNITY.touch(); }catch(e){} }
const lvOf=t=>Math.floor(Math.sqrt((t||0)/50))+1;
const lvFloor=l=>50*(l-1)*(l-1);
const titleOf=l=>TITLES[Math.min(l-1,TITLES.length-1)];

/* ---------- 자동 복습(간격 반복) ---------- */
function srsUpdate(key,ok){
  const s=get("jp-srs",{}), e=s[key]||{b:0};
  e.b=ok?Math.min((e.b||0)+1,6):0; e.d=Date.now()+IV[e.b]*864e5; s[key]=e; set("jp-srs",s);
}
const dueKeys=()=>{ const s=get("jp-srs",{}), n=Date.now(); return Object.keys(s).filter(k=>s[k].d<=n); };
function duePool(){ const set1=new Set(dueKeys()); return A().ALL.filter(w=>set1.has(w.key)); }

/* ---------- 내 참새 · 씨앗 · 상점 ---------- */
const SLOTS=[["head","머리"],["face","얼굴"],["neck","목"]];
const WC='filter="url(#fWc)"', INK="#5e4b42";
/* 벚꽃 한 송이(꽃잎 5장·꽃술·옅은 번짐) */
const sakura=(x,y,s,rot)=>{ const pet=`<path d="M0 0C-13-5-16-23-7-30L0-24L7-30C16-23 13-5 0 0Z" fill="#fde8ef" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><path d="M0 -2C-6-6-8-15-4-20C0-16 4-16 6-20C9-14 6-6 0 -2Z" fill="#f4a8bf" opacity=".55"/><path d="M0 -3V-19" stroke="#e58aa6" stroke-width=".8" opacity=".8"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${rot||0}) scale(${s})">${[0,72,144,216,288].map(a=>`<g transform="rotate(${a})">${pet}</g>`).join("")}<circle r="5.5" fill="#f7c7d6" opacity=".9"/>${[0,40,80,120,160,200,240,280,320].map(a=>`<g transform="rotate(${a})"><path d="M0 0V-12" stroke="#d9507a" stroke-width="1"/><circle cy="-13" r="1.8" fill="#d9507a"/></g>`).join("")}</g>`; };
const leaf=(x,y,s,rot,c)=>`<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0C8-6 20-4 26 4C18 12 6 10 0 0Z" fill="${c||"#96ca9f"}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`;
const ITEMS=[
 {id:"sprout",slot:"head",name:"새싹 잎",price:20,svg:`<g ${WC}><path d="M238 27C238 15 240 6 246 -2" stroke="#5e4b42" stroke-width="2.48" fill="none" stroke-linecap="round"/><path d="M240 10C222 12 206 2 201 -15C222 -17 238 -7 240 10Z" fill="#96ca9f" stroke="#5e4b42" stroke-width="1.4" stroke-linejoin="round"/><path d="M244 5C257 6 271 -4 273 -21C257 -23 246 -13 244 5Z" fill="#96ca9f" stroke="#5e4b42" stroke-width="1.4" stroke-linejoin="round"/><path d="M240 10C226 4 212 -4 205 -12M244 5C254 0 262 -8 268 -18" stroke="#5e4b42" stroke-width="1.4" fill="none" stroke-linecap="round"/><ellipse cx="238" cy="27" rx="9" ry="4" fill="#7ccf8e" opacity=".7"/></g>`},
 {id:"flower",slot:"head",name:"벚꽃 핀",price:35,svg:`<g ${WC}><path d="M170 74C186 64 196 52 204 40" stroke="#8a6a52" stroke-width="3.2" fill="none" stroke-linecap="round"/>${leaf(176,70,.8,-150)}${leaf(190,56,.7,-40)}${sakura(204,36,.95,12)}${sakura(184,58,.58,-20)}<g transform="translate(222 20)"><path d="M0 0C-6 4-7 12 0 15C7 12 6 4 0 0Z" fill="#f7c7d6" stroke="${INK}" stroke-width="1.2"/></g></g>`},
 {id:"bow",slot:"head",name:"공주 리본",price:45,svg:`<g ${WC} transform="translate(212 36)"><path d="M-3 8C-12 24-24 36-32 50L-20 44L-13 56C-8 40 -3 24 4 10Z" fill="#f4aebf" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M3 8C12 24 24 36 32 50L20 44L13 56C8 40 3 24 -4 10Z" fill="#f4aebf" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M0 0C-10-26-48-34-52-6C-54 16-22 20 0 0Z" fill="#f4aebf" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 0C10-26 48-34 52-6C54 16 22 20 0 0Z" fill="#f4aebf" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M-7 -2C-16-17-37-20-40-7C-41 6-20 9-7 -2Z" fill="#fde0e8" opacity=".95"/><path d="M7 -2C16-17 37-20 40-7C41 6 20 9 7 -2Z" fill="#fde0e8" opacity=".95"/><path d="M-46 -10C-38 -22 -22 -26 -10 -18M46 -10C38 -22 22 -26 10 -18" stroke="${INK}" stroke-width="1" fill="none" stroke-dasharray="2 3" opacity=".7"/><circle r="9" fill="#e97f9c" stroke="${INK}" stroke-width="1.5"/><circle r="4.2" fill="#fffaf2" stroke="${INK}" stroke-width="1"/><g fill="#ffe27a" stroke="${INK}" stroke-width=".8"><path d="M-44 -26l2 5l5 2l-5 2l-2 5l-2-5l-5-2l5-2z"/><path d="M48 -22l1.6 4l4 1.6l-4 1.6l-1.6 4l-1.6-4l-4-1.6l4-1.6z"/></g></g>`},
 {id:"straw",slot:"head",name:"밀짚모자",price:50,svg:`<g ${WC}><ellipse cx="238" cy="42" rx="86" ry="16" fill="#eed3a0" stroke="#5e4b42" stroke-width="1.8599999999999999"/><path d="M168 42Q238 60 308 42M178 48Q238 64 298 48" stroke="#5e4b42" stroke-opacity=".55" stroke-width="1.4" fill="none"/><path d="M194 40C192 4 284 4 282 40C262 50 214 50 194 40Z" fill="#eed3a0" stroke="#5e4b42" stroke-width="1.8599999999999999" stroke-linejoin="round"/><path d="M208 16C226 8 250 8 268 16" stroke="#fff" stroke-opacity=".4" stroke-width="1.8599999999999999" fill="none" stroke-linecap="round"/><path d="M194 30C218 42 258 42 282 30L283 41C260 52 216 52 193 41Z" fill="#dd6c62" stroke="#5e4b42" stroke-width="1.4" stroke-linejoin="round"/><path d="M262 40l12 12l-3 -14zM262 40l-8 14l12-4z" fill="#dd6c62" stroke="#5e4b42" stroke-width="1.4" stroke-linejoin="round"/></g>`},
 {id:"crown",slot:"head",name:"왕관",price:150,svg:`<g ${WC}><path d="M202 36C206 14 224 4 238 4C252 4 270 14 274 36Z" fill="#b8404f" stroke="${INK}" stroke-width="1.6"/><path d="M198 42L192 2L214 20L224 -10L238 14L252 -10L262 20L284 2L278 42Z" fill="#ebc86e" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M198 42Q238 54 278 42L277 32Q238 44 199 32Z" fill="#e2b04e" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><g fill="#fffaf2" stroke="${INK}" stroke-width="1.4"><circle cx="192" cy="2" r="5"/><circle cx="224" cy="-10" r="5"/><circle cx="252" cy="-10" r="5"/><circle cx="284" cy="2" r="5"/></g><path d="M238 -6V8M232 0H244" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M238 -8C233 -4 233 2 238 5C243 2 243 -4 238 -8Z" fill="#d94a5a" stroke="${INK}" stroke-width="1.2"/><path d="M232 33L238 28L244 33L238 41Z" fill="#d94a5a" stroke="${INK}" stroke-width="1.4"/><path d="M212 35L216 31L220 35L216 40Z" fill="#6aa8e0" stroke="${INK}" stroke-width="1.2"/><path d="M256 35L260 31L264 35L260 40Z" fill="#6cc29a" stroke="${INK}" stroke-width="1.2"/><path d="M204 36L208 33L212 37M222 38L226 35L230 39M246 39L250 35L254 38M266 37L270 34L274 37" stroke="${INK}" stroke-width="1" fill="none" opacity=".7"/><path d="M206 12L212 22M270 12L264 22" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" stroke-linecap="round"/></g>`},
 {id:"wizard",slot:"head",name:"마법사 모자",price:70,svg:`<g ${WC}><path d="M204 38C208 18 230 -6 252 -38C256 -12 266 18 278 38Z" fill="#8a76c4" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M252 -38C262 -34 266 -24 262 -18" stroke="${INK}" stroke-width="1.6" fill="none"/><ellipse cx="240" cy="40" rx="64" ry="13" fill="#7a66b8" stroke="${INK}" stroke-width="1.8"/><path d="M204 32C228 42 258 42 278 32L279 40C258 50 226 50 203 40Z" fill="#f1c85a" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><g fill="#ffe27a" stroke="${INK}" stroke-width=".9"><path d="M238 12l2.6 6l6.4.6l-4.9 4.2l1.5 6.3l-5.6-3.4l-5.6 3.4l1.5-6.3l-4.9-4.2l6.4-.6z"/><path d="M262 -6l1.8 4l4.4.4l-3.4 2.9l1 4.3l-3.8-2.3l-3.8 2.3l1-4.3l-3.4-2.9l4.4-.4z"/></g><path d="M226 8C219 10 218 20 226 22C222 18 222 12 226 8Z" fill="#ffe27a" stroke="${INK}" stroke-width=".9"/></g>`},
 {id:"beret",slot:"head",name:"베레모",price:55,svg:`<g ${WC}><path d="M190 36C184 4 232 -8 270 8C296 18 290 40 272 44C250 52 208 50 190 36Z" fill="#b85a66" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M200 30C220 38 252 38 276 30" stroke="${INK}" stroke-width="1.2" fill="none" opacity=".6"/><path d="M214 8C236 0 262 6 276 16" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M254 6C256 0 262 -2 264 2C264 6 258 8 254 6Z" fill="#9c4552" stroke="${INK}" stroke-width="1.4"/></g>`},
 {id:"beanie",slot:"head",name:"털모자",price:60,svg:`<g ${WC}><path d="M192 38C190 4 286 4 284 38Z" fill="#f4e7cd" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M198 26C224 18 254 18 280 26M196 16C226 6 252 6 278 16" stroke="#dd6c62" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/><path d="M190 36C220 46 258 46 286 36L288 50C260 62 218 62 188 50Z" fill="#dd6c62" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M204 42V56M218 46V59M232 47V60M246 47V60M260 46V59M274 43V56" stroke="${INK}" stroke-width="1" opacity=".55"/><g transform="translate(238 -2)"><circle r="14" fill="#fbf4e4" stroke="${INK}" stroke-width="1.6"/><path d="M-9 -4C-4 -10 5 -10 9 -4M-10 3C-4 -2 5 -2 10 3M-6 9C-2 6 3 6 7 9" stroke="${INK}" stroke-width="1" fill="none" opacity=".6"/></g></g>`},
 {id:"wreath",slot:"head",name:"꽃관",price:65,svg:`<g ${WC}><path d="M190 52C196 16 228 2 240 2C256 2 284 16 288 50" stroke="#7da56e" stroke-width="6" fill="none" stroke-linecap="round"/>${leaf(194,40,.7,-110)}${leaf(206,20,.7,-70)}${leaf(232,4,.7,-30)}${leaf(262,6,.7,-150)}${leaf(278,26,.7,-110)}${sakura(200,34,.5,0)}<g>${[[222,12,"#fff3c4"],[250,8,"#cdb8ee"],[270,20,"#f7c7d6"],[286,40,"#fff3c4"]].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="7.5" fill="${c}" stroke="${INK}" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="2.6" fill="#f1c85a" stroke="${INK}" stroke-width=".8"/>`).join("")}</g></g>`},
 {id:"bunny",slot:"head",name:"토끼 귀 머리띠",price:50,svg:`<g ${WC}><path d="M192 44C196 16 224 4 240 4C258 4 280 18 286 46" stroke="#f4aebf" stroke-width="7" fill="none" stroke-linecap="round"/><g transform="rotate(-10 218 10)"><path d="M208 12C198-8 204-40 218-44C232-38 232-6 224 12Z" fill="#fbf6ee" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M214 6C208-8 212-30 218-34C224-28 224-8 220 6Z" fill="#f7c0cf" opacity=".9"/></g><g transform="rotate(12 258 10)"><path d="M248 12C240-8 246-40 260-44C274-38 274-6 266 12Z" fill="#fbf6ee" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M254 6C248-8 252-30 260-34C266-28 266-8 262 6Z" fill="#f7c0cf" opacity=".9"/></g></g>`},
 {id:"phones",slot:"head",name:"헤드폰",price:75,svg:`<g ${WC}><path d="M200 70C190 20 228 -6 252 2C276 10 292 34 292 52" stroke="#5e4b42" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M200 70C190 20 228 -6 252 2C276 10 292 34 292 52" stroke="#8fd1c0" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="204" cy="76" r="17" fill="#8fd1c0" stroke="${INK}" stroke-width="2"/><circle cx="204" cy="76" r="9" fill="#6fb8a6" stroke="${INK}" stroke-width="1.4"/><path d="M194 70Q200 63 209 66" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="284" y="46" width="14" height="22" rx="6" fill="#8fd1c0" stroke="${INK}" stroke-width="1.8"/></g>`},
 {id:"glasses",slot:"face",name:"동그란 안경",price:40,svg:`<g ${WC}><path d="M236 70L203 60" stroke="#5e4b42" stroke-width="3.1" stroke-linecap="round"/><circle cx="252" cy="77" r="18" fill="rgba(210,238,255,.38)" stroke="#5e4b42" stroke-width="3.1"/><circle cx="252" cy="77" r="18" fill="none" stroke="#5e4b42" stroke-width="1.4"/><path d="M242 69Q249 62 259 65" stroke="#fff" stroke-opacity=".55" stroke-width="1.984" fill="none" stroke-linecap="round"/><path d="M270 74L283 71" stroke="#5e4b42" stroke-width="2.48" stroke-linecap="round"/></g>`},
 {id:"shades",slot:"face",name:"선글라스",price:60,svg:`<g ${WC}><path d="M234 70L202 59" stroke="#f6efe4" stroke-width="4" stroke-linecap="round"/><ellipse cx="252" cy="77" rx="22" ry="16" fill="#5b6c93" stroke="#f6efe4" stroke-width="3.4"/><ellipse cx="252" cy="77" rx="22" ry="16" fill="none" stroke="#5e4b42" stroke-width="1.3"/><path d="M238 70L254 64M241 79L262 70" stroke="#d9ecfb" stroke-opacity=".8" stroke-width="2.6" stroke-linecap="round"/><path d="M272 72L284 69" stroke="#f6efe4" stroke-width="3.4" stroke-linecap="round"/></g>`},
 {id:"heartglasses",slot:"face",name:"하트 안경",price:55,svg:`<g ${WC}><path d="M238 72L204 62" stroke="#ee86a6" stroke-width="4.4" stroke-linecap="round"/><path d="M0 12C-22 -4 -20 -24 -9 -24C-3 -24 0 -19 0 -17C0 -19 3 -24 9 -24C20 -24 22 -4 0 12Z" transform="translate(253 76) scale(1.3)" fill="rgba(255,214,228,.22)" stroke="#ee86a6" stroke-width="4.2" stroke-linejoin="round"/><path d="M0 12C-22 -4 -20 -24 -9 -24C-3 -24 0 -19 0 -17C0 -19 3 -24 9 -24C20 -24 22 -4 0 12Z" transform="translate(253 76) scale(1.3)" fill="none" stroke="#5e4b42" stroke-width="1.2" stroke-linejoin="round"/><path d="M238 60Q243 54 250 56" stroke="#fff" stroke-opacity=".7" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M272 71L285 69" stroke="#ee86a6" stroke-width="3.6" stroke-linecap="round"/></g>`},
 {id:"stargl",slot:"face",name:"별 안경",price:55,svg:`<g ${WC}><path d="M236 72L204 62" stroke="#e8c56a" stroke-width="4.4" stroke-linecap="round"/><path d="M0 -22L6.4 -7L22 -6.4L9.6 3.4L14 19L0 10L-14 19L-9.6 3.4L-22 -6.4L-6.4 -7Z" transform="translate(253 78) scale(1.2)" fill="rgba(255,243,170,.25)" stroke="#e8c56a" stroke-width="4" stroke-linejoin="round"/><path d="M0 -22L6.4 -7L22 -6.4L9.6 3.4L14 19L0 10L-14 19L-9.6 3.4L-22 -6.4L-6.4 -7Z" transform="translate(253 78) scale(1.2)" fill="none" stroke="#5e4b42" stroke-width="1.2" stroke-linejoin="round"/><path d="M274 74L286 71" stroke="#e8c56a" stroke-width="3.6" stroke-linecap="round"/></g>`},
 {id:"scarf",slot:"neck",name:"빨간 목도리",price:40,svg:`<g ${WC}><path d="M222 148L212 196L246 192L254 152Z" fill="#dd6c62" stroke="#5e4b42" stroke-width="1.55" stroke-linejoin="round"/><path d="M215 178L249 174" stroke="#fff" stroke-width="3.1" stroke-opacity=".85"/><path d="M214 188L248 184" stroke="#5e4b42" stroke-width="1.8599999999999999"/><path d="M212 196V206M220 195V207M228 194V206M236 193V205M244 192V204" stroke="#5e4b42" stroke-width="1.612" stroke-linecap="round"/><path d="M198 116C238 140 282 134 308 106L314 130C284 158 232 162 194 138Z" fill="#dd6c62" stroke="#5e4b42" stroke-width="1.55" stroke-linejoin="round"/><path d="M214 128L222 144M236 134L243 150M258 134L263 150M280 126L284 141" stroke="#fff" stroke-opacity=".4" stroke-width="2.48" stroke-linecap="round"/></g>`},
 {id:"tie",slot:"neck",name:"나비넥타이",price:45,svg:`<g ${WC} transform="translate(258 140)"><path d="M-4 0C-14-13-32-18-38-11C-33-4-33 4-38 11C-32 18-14 13-4 0Z" fill="#3e5078" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 0C14-13 32-18 38-11C33-4 33 4 38 11C32 18 14 13 4 0Z" fill="#3e5078" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M-12 -4L-30 -9M-12 0L-31 0M-12 4L-30 9M12 -4L30 -9M12 0L31 0M12 4L30 9" stroke="#9fb4de" stroke-width="1.2" opacity=".75" stroke-linecap="round"/><rect x="-7.5" y="-9" width="15" height="18" rx="5.5" fill="#2f3f64" stroke="${INK}" stroke-width="1.8"/><path d="M-3 -5V5" stroke="#9fb4de" stroke-width="1.4" opacity=".7" stroke-linecap="round"/><circle cx="0" cy="0" r="2.2" fill="#ebc86e" stroke="${INK}" stroke-width=".9"/></g>`},
 {id:"bell",slot:"neck",name:"방울 목걸이",price:30,svg:`<g ${WC}><path d="M212 116Q258 156 304 112" stroke="#5e4b42" stroke-width="2.48" fill="none" stroke-linecap="round"/><circle cx="258" cy="146" r="12" fill="#ebc86e" stroke="#5e4b42" stroke-width="1.612"/><path d="M247 148H269" stroke="#5e4b42" stroke-width="1.488"/><circle cx="258" cy="153" r="2.4" fill="#a8741a"/><path d="M250 140Q253 135 259 135" stroke="#fff" stroke-opacity=".4" stroke-width="1.488" fill="none" stroke-linecap="round"/></g>`},
 {id:"pearl",slot:"neck",name:"진주 목걸이",price:80,svg:`<g ${WC}>${Array.from({length:13},(_,i)=>{ const t=i/12, x=210+t*96, y=116+Math.sin(t*Math.PI)*38+(t<.5?0:0); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(6.4+Math.sin(t*Math.PI)*2.2).toFixed(1)}" fill="#fbf6ee" stroke="${INK}" stroke-width="1.2"/><circle cx="${(x-1.8).toFixed(1)}" cy="${(y-2).toFixed(1)}" r="1.8" fill="#fff" opacity=".9"/>`; }).join("")}</g>`},
 {id:"lei",slot:"neck",name:"꽃목걸이",price:70,svg:`<g ${WC}><path d="M208 114Q258 160 306 110" stroke="#7da56e" stroke-width="5" fill="none" stroke-linecap="round"/>${[[216,126,"#f7c7d6"],[232,140,"#fff3c4"],[250,148,"#f4aebf"],[268,146,"#cdb8ee"],[286,134,"#fff3c4"],[300,120,"#f7c7d6"]].map(([x,y,c])=>`<g transform="translate(${x} ${y})"><g fill="${c}" stroke="${INK}" stroke-width="1.1">${[0,72,144,216,288].map(a=>`<circle cx="0" cy="-6.5" r="5.2" transform="rotate(${a})"/>`).join("")}</g><circle r="2.6" fill="#f1c85a" stroke="${INK}" stroke-width=".8"/></g>`).join("")}${leaf(226,134,.55,60)}${leaf(262,152,.55,95)}${leaf(292,128,.55,-60)}</g>`},
 {id:"bandana",slot:"neck",name:"노란 반다나",price:50,svg:`<g ${WC}><path d="M196 116C238 136 284 132 312 106L316 118L262 182Z" fill="#f1c85a" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M200 120C240 140 284 136 312 110" stroke="#d9a63a" stroke-width="3.4" fill="none" opacity=".7"/><path d="M226 140L262 176M296 128L262 176" stroke="#d9a63a" stroke-width="1.1" opacity=".55"/><g fill="#fffaf2" stroke="${INK}" stroke-width=".8">${[[222,138],[246,148],[270,146],[292,132],[236,162],[262,164],[250,176],[278,154]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.6"/>`).join("")}</g></g>`},
 {id:"starpen",slot:"neck",name:"별 펜던트",price:65,svg:`<g ${WC}><path d="M210 116Q258 152 304 112" stroke="#d9a63a" stroke-width="2.6" fill="none"/><g transform="translate(258 150)"><path d="M0 -14L4 -4.5L14 -4L6.4 2.4L9 12L0 6.6L-9 12L-6.4 2.4L-14 -4L-4 -4.5Z" fill="#f4d56e" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M0 -8L1.6 -3L6 -2.8L2.4 .6L3.6 5L0 2.6L-3.6 5L-2.4 .6L-6 -2.8L-1.6 -3Z" fill="#fff3c4" opacity=".8"/></g></g>`}
];
const charState=()=>{ const s=get("jp-char",null); return s||{seeds:30,owned:[],equip:{}}; };
const saveChar=s=>set("jp-char",s);
function addSeeds(n){ const s=charState(); s.seeds=(s.seeds||0)+n; saveChar(s); }
const DEFS=`<defs><linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#f0a824"/></linearGradient><linearGradient id="gPink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd3e0"/><stop offset="1" stop-color="#ff93b4"/></linearGradient><linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a7e"/><stop offset="1" stop-color="#e0483f"/></linearGradient><linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9ebb2"/><stop offset="1" stop-color="#52b870"/></linearGradient><linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd8f7"/><stop offset="1" stop-color="#4294d4"/></linearGradient><linearGradient id="gStraw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbeab9"/><stop offset="1" stop-color="#ebc67c"/></linearGradient><linearGradient id="gDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a5552"/><stop offset="1" stop-color="#211e1d"/></linearGradient><filter id="fWc" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".018 .026" numOctaves="3" seed="7" result="warp"/><feDisplacementMap in="SourceGraphic" in2="warp" scale="6" result="d"/><feGaussianBlur in="d" stdDeviation="1.6" result="b"/><feComposite in="d" in2="b" operator="arithmetic" k1="0" k2="1.55" k3="-.55" k4="0" result="edge"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="gr"/><feColorMatrix in="gr" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.55 1.05" result="ga"/><feComposite in="edge" in2="ga" operator="in"/></filter></defs>`;
function birdSvg(equip,cls){
  const eq=equip||charState().equip||{}, order=["neck","face","head"];
  return `<svg class="${cls||""}" viewBox="0 -44 375 376" aria-hidden="true">${DEFS}<image href="mascot.png" x="0" y="0" width="375" height="332"/>${order.map(sl=>{ const it=ITEMS.find(x=>x.id===eq[sl]); return it?`<g>${it.svg}</g>`:""; }).join("")}</svg>`;
}
function birdHtml(){
  const s=charState(), cheapest=Math.min(...ITEMS.filter(x=>!s.owned.includes(x.id)).map(x=>x.price),Infinity), can=cheapest<=(s.seeds||0);
  return `<div class="hbw"><button class="hbird" data-shop="1" aria-label="내 참새 꾸미기">${birdSvg(null)}</button><button class="hbtag ${can?"hot":""}" data-shop="1">꾸미기 · 씨앗 ${s.seeds||0}</button></div>`;
}
let shopSlot="head", shopPrev={};
function shopRender(){
  const d=document.getElementById("shopDlg"), s=charState(), pv=Object.keys(shopPrev).filter(k=>shopPrev[k]&&shopPrev[k]!==s.equip[k]);
  const eq=Object.assign({},s.equip,shopPrev), pvItems=pv.map(k=>ITEMS.find(x=>x.id===shopPrev[k])).filter(Boolean);
  d.innerHTML=`<div class="dh"><h2 style="margin:0">내 참새</h2><button class="x" data-sclose aria-label="닫기">×</button></div>
  <div class="db"><div class="shopbird">${birdSvg(eq,"big")}</div>
  <p class="sub" style="text-align:center;margin:4px 0 2px;min-height:22px">${pvItems.length?`미리보기: <b style="color:var(--accent-text)">${pvItems.map(i=>E(i.name)).join(", ")}</b> · <button class="shreset" data-sreset="1">원래대로</button>`:"아이템을 누르면 미리 입혀 볼 수 있어요"}</p>
  <p class="sub" style="text-align:center;margin:0 0 10px">씨앗 <b style="color:var(--accent-text)">${s.seeds||0}</b>개 · 7일 선물과 레슨을 끝내면 씨앗을 받아요</p>
  <div class="shtabs">${SLOTS.map(([k,n])=>`<button class="pill ${shopSlot===k?"on":""}" data-sslot="${k}">${n}</button>`).join("")}</div>
  <div class="shl">${ITEMS.filter(x=>x.slot===shopSlot).map(it=>{ const own=s.owned.includes(it.id), on=s.equip[it.slot]===it.id, isPv=shopPrev[it.slot]===it.id;
    return `<div class="shi ${isPv?"pv":""}" data-spv="${it.id}"><div class="shp">${birdSvg({[it.slot]:it.id},"mini")}</div><div class="shn"><b>${E(it.name)}</b><small>${own?(on?"착용 중":"보유 중"):it.price+" 씨앗"}</small></div>
     ${own?`<button class="pill ${on?"":"on"}" data-sequip="${it.id}">${on?"벗기":"입히기"}</button>`:`<button class="pill ${(s.seeds||0)>=it.price?"on":""}" data-sbuy="${it.id}" ${(s.seeds||0)>=it.price?"":"disabled"}>사기</button>`}</div>`; }).join("")}</div></div>`;
}
function openShop(){ let d=document.getElementById("shopDlg");
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
  const x=xpState(), l=lvOf(x.t), lo=lvFloor(l), hi=lvFloor(l+1), pc=Math.round((x.t-lo)/(hi-lo)*100), st=A().streakDays();
  return `<div class="pstat"><div class="prow1"><b>Lv.${l} ${titleOf(l)}</b><span>${st?st+"일 연속 · ":""}${x.t} XP · 씨앗 ${charState().seeds||0}</span></div><div class="prog"><div style="width:${pc}%"></div></div></div>`;
}
function reviewHtml(){ const n=dueKeys().length; if(!n) return ""; return `<button class="lrow" data-pr="1" style="border-top:1px solid var(--line);margin-top:12px"><span>${n?`복습할 단어 <b style="color:var(--accent-text)">${n}개</b>`:"복습할 단어가 아직 없어요"}</span><i>›</i></button>`; }
function pathHtml(full){
  const st=state(), cur=current(), all=vis(); if(cur) openUnits.add(cur.u.id);
  const offs=[0,26,44,26,0,-26,-44,-26];
  return `<div class="path">${all.map(u=>{
    const done=u.nodes.filter(n=>isDone(n,st)).length, open=openUnits.has(u.id), alld=done===u.nodes.length;
    return `<div class="pu ${open?"open":""} ${alld?"all":""}"><button class="puh" data-pu="${u.id}"><span class="pun">${E(u.tag)}</span><b>${E(u.title)}</b><small>${done} / ${u.nodes.length}</small></button>
     ${open?`<div class="pnodes">${u.nodes.map((n,i)=>{ const dn=isDone(n,st), isCur=cur&&cur.n.id===n.id;
        return `<div class="pn" style="margin-left:calc(50% - 32px + ${offs[i%offs.length]}px)"><button class="pnb ${dn?"done":""} ${isCur?"cur":""}" data-pn="${n.id}" aria-label="${E(n.label)}">${dn?"✓":E(n.glyph)}</button><small>${E(n.label)}</small>${isCur?`<span class="pnow">지금 할 레슨</span>`:""}</div>`; }).join("")}
       ${alld?"":`<button class="pskip" data-pskip="${u.id}">이 유닛은 이미 알아요</button>`}</div>`:""}</div>`; }).join("")}</div>`;
}
/* 홈의 '이어서 하기' 한 줄 */
function continueHtml(){ const c=current(); if(!c) return ""; return `<button class="lrow" data-pn="${c.n.id}" style="border-top:1px solid var(--line);margin-top:12px"><span>이어서 하기 · <b>${E(c.n.L||"")} ${E(c.n.label)}</b></span><i>›</i></button>`; }
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
  return `<div class="home">${back}<h2 style="margin:6px 0 4px">학습 경로</h2><div class="sub">레슨을 눌러 단어 20개를 공부하고, 퀴즈에서 70% 이상 맞히면 완료돼요</div>${pathHtml(true)}</div>`;
}
const E=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- 레슨 시트 ---------- */
let active=null;
function sheet(n){
  const ws=lessonWords(n.L,n.j); let d=document.getElementById("pathDlg");
  if(!d){ d=document.createElement("dialog"); d.id="pathDlg"; document.body.appendChild(d); d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-pclose]")) d.close(); }); }
  d.innerHTML=`<div class="dh"><h2 style="margin:0">${E(n.L)} · ${E(n.label)}</h2><button class="x" data-pclose aria-label="닫기">×</button></div>
   <div class="db"><p class="sub">${ws.length}개 단어를 보고, 퀴즈에서 ${Math.round(PASS*100)}% 이상 맞히면 레슨이 완료돼요.</p>
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
  if(!ws.length){ A().toast("이 레슨에는 단어가 없어요"); return; }
  active=mode==="quiz"?{id,keys:new Set(ws.map(w=>w.key))}:null;
  A().setView("quiz"); A().startQuiz(mode==="quiz"?"meaning":"card",ws,ws.length);
}
function markDone(id,skip){ const st=state(); st.done=st.done||{}; if(!st.done[id]) st.done[id]=skip?2:1; set("jp-path",st); }

/* ---------- 7일 연속 여정 · 선물 ---------- */
const GIFT_TITLES=["새싹 참새","날갯짓 참새","하늘 참새","한 달 참새"];
const NUM=["零","一","二","三","四","五","六","七","八","九","十"];
const kan=n=>n<=10?NUM[n]:n<20?"十"+(n%10?NUM[n%10]:""):NUM[Math.floor(n/10)]+"十"+(n%10?NUM[n%10]:"");
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
const tree=(x,y,s,k)=>k?`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2" y="-2" width="4" height="12" fill="var(--fo-trunk)"/><path d="M0-34l12 16h-6l10 14h-32l10-14h-6z" fill="var(--fo2)"/></g>`:`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2" y="-2" width="4" height="14" fill="var(--fo-trunk)"/><circle cx="0" cy="-14" r="14" fill="var(--fo1)"/><circle cx="-9" cy="-6" r="9" fill="var(--fo2)"/><circle cx="9" cy="-7" r="9" fill="var(--fo2)"/></g>`;
const forestBg=()=>`<g class="jf"><ellipse cx="80" cy="100" rx="110" ry="26" fill="var(--fo1)" opacity=".55"/><ellipse cx="250" cy="102" rx="120" ry="28" fill="var(--fo1)" opacity=".55"/>
 ${tree(14,34,.9,1)}${tree(72,30,1,0)}${tree(128,32,.8,1)}${tree(196,30,.95,0)}${tree(256,34,.85,1)}${tree(306,30,1,0)}
 <ellipse cx="34" cy="92" rx="17" ry="9" fill="var(--fo3)"/><ellipse cx="112" cy="94" rx="15" ry="8" fill="var(--fo2)"/><ellipse cx="190" cy="92" rx="18" ry="9" fill="var(--fo3)"/><ellipse cx="274" cy="94" rx="16" ry="8" fill="var(--fo2)"/>
 <g fill="#ffb3c7"><circle cx="58" cy="90" r="2.4"/><circle cx="150" cy="93" r="2.4"/><circle cx="232" cy="90" r="2.4"/></g><g fill="#ffd95c"><circle cx="90" cy="92" r="2.2"/><circle cx="214" cy="94" r="2.2"/><circle cx="300" cy="90" r="2.2"/></g></g>`;
function journeyHtml(){
  const J=journey(), prev=+(localStorage.getItem("jp-jpos")||0);
  const stops=[0,1,2,3,4,5,6].map(i=>{ const x=JX(i), y=JY(i), done=i<J.pos, cur=i===J.pos-1;
    if(i===6) return `<g class="jg ${J.pos>=7?"on":""}"><rect x="${x-13}" y="${y-8}" width="26" height="20" rx="3"/><rect x="${x-13}" y="${y-13}" width="26" height="7" rx="2"/><path d="M${x} ${y-13}v25M${x-4} ${y-17}q4 -2 4 4q0 -6 4 -4"/></g>`;
    return `<g class="js ${done?"done":""} ${cur?"cur":""}"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y+4}" text-anchor="middle">${i+1}</text></g>`; }).join("");
  const line=[0,1,2,3,4,5,6].map(i=>`${i?"L":"M"}${JX(i)} ${JY(i)}`).join(" ");
  const pxy=p=>p<=0?[6,JY(0)]:[JX(p-1),JY(p-1)];
  const [fx,fy]=pxy(prev), [tx,ty]=pxy(J.pos);
  const msg=J.pending?"일곱 걸음을 다 걸었어요! 선물 상자가 기다려요":J.pos===0?"오늘 공부하면 참새가 숲길을 나서요":J.pos<7?`${7-J.pos}일 더 걸으면 선물 상자가 열려요`:"도착했어요! 내일부터 새 여정이 시작돼요";
  setTimeout(()=>{ const b=document.querySelector(".jrb"); if(b){ b.style.left=(tx/3.2)+"%"; b.style.top=((ty-40)/JH*100)+"%"; } try{ localStorage.setItem("jp-jpos",String(J.pos)); }catch(e){} },80);
  return `<div class="jr"><div class="jrh"><b>7일 숲길 여정</b><span>${J.pos} / 7일</span></div>
   <div class="jrroad"><svg viewBox="0 0 320 ${JH}" aria-hidden="true">${forestBg()}<path class="jl2" d="${line}"/><path class="jl" d="${line}"/>${stops}</svg><div class="jrb" style="left:${fx/3.2}%;top:${(fy-40)/JH*100}%">${birdSvg(null)}</div></div>
   <div class="jrf"><span>${msg}</span>${J.pending?`<button class="cta" data-gift="open" style="width:auto;padding:10px 18px;font-size:15px">선물 받기</button>`:""}</div>
   ${J.items.length?`<button class="jrc" data-gift="box">내 선물함 · ${J.items.length}개 ›</button>`:""}</div>`;
}
function giftDlg(){ let d=document.getElementById("giftDlg"); if(!d){ d=document.createElement("dialog"); d.id="giftDlg"; document.body.appendChild(d); d.addEventListener("click",ev=>{ if(ev.target===d||ev.target.closest("[data-gclose]")){ d.close(); A().renderHome(); } else { const g=ev.target.closest("[data-gift]"); if(g) giftAct(g.dataset.gift); } }); } return d; }
const stamp=n=>{ const t=kan(n)+"日"; return `<div class="stamp"><b style="font-size:${t.length>3?22:28}px">${t}</b><small>連続</small></div>`; };
function giftAct(a){
  const d=giftDlg();
  if(a==="open"){ const J=journey(); if(!J.pending) return;
    d.innerHTML=`<div class="db" style="text-align:center;padding:28px 20px"><p class="sub">${J.pending*7}일 연속 달성!</p><svg class="gbox" viewBox="0 0 120 110" aria-hidden="true"><rect x="20" y="46" width="80" height="54" rx="6"/><rect x="14" y="32" width="92" height="20" rx="5"/><path d="M60 32v68M60 32q-16 -22 -26 -10q-6 12 26 10zM60 32q16 -22 26 -10q6 12 -26 10z"/></svg><div><button class="cta" data-gift="reveal" data-j="${J.pending}" style="max-width:220px;margin:14px auto 0">상자 열기</button></div></div>`;
    if(!d.open) d.showModal(); return; }
  if(a==="reveal"){ const J=journey(), j=J.pending; if(!j) return; const gs=giftState(); gs.claimed[J.run+":"+j]=1; gs.items.push({j,n:j*7,title:giftTitle(j),at:Date.now()}); set("jp-gift",gs); addXp(100); addSeeds(70);
    d.innerHTML=`<div class="db" style="text-align:center;padding:26px 20px"><p class="sub">선물이 도착했어요</p>${stamp(j*7)}<h3 style="margin:12px 0 2px">「${giftTitle(j)}」 칭호</h3><p class="sub" style="margin:0">+100 XP · 씨앗 70개 · 선물함에 보관돼요</p><button class="cta" data-gclose style="max-width:220px;margin:18px auto 0">좋아요</button></div>`; return; }
  if(a==="box"){ const its=giftState().items;
    d.innerHTML=`<div class="dh"><h2 style="margin:0">내 선물함</h2><button class="x" data-gclose aria-label="닫기">×</button></div><div class="db"><div class="gl">${its.slice().reverse().map(x=>`<div class="gi">${stamp(x.n)}<b>${E(x.title)}</b><small>${new Date(x.at).toLocaleDateString("ko-KR")}</small></div>`).join("")}</div></div>`;
    if(!d.open) d.showModal(); }
}

/* ---------- 바깥(index.html·kana.js)에서 부르는 훅 ---------- */
window.PATH={
  equip:()=>charState().equip||{},addSeeds,birdSvg,statusHtml,reviewHtml,pathHtml,continueHtml,pageHtml,page:()=>page,journeyHtml,birdHtml,openShop,
  rec(w,ok){ try{ if(w&&w.key){ srsUpdate(w.key,ok); if(ok) addXp(10); } }catch(e){} },
  quizEnd(score,keys){ try{
    if(!active) return; const a=active; active=null;
    if(!keys.every(k=>a.keys.has(k))) return;
    const ok=keys.length&&score/keys.length>=PASS;
    if(ok){ const st=state(); const first=!(st.done&&st.done[a.id]); markDone(a.id); if(first){ addXp(30); addSeeds(5); A().toast("레슨 완료! +30 XP · 씨앗 5개"); } else A().toast("레슨 완료!"); }
    else A().toast("70% 이상 맞히면 레슨이 완료돼요. 한 번 더 도전해 보세요");
  }catch(e){} },
  kanaDone(id){ try{ const st=state(); st.kx=st.kx||{}; if(!st.kx[id]){ st.kx[id]=1; set("jp-path",st); addXp(30); addSeeds(5); A().toast("레슨 완료! +30 XP · 씨앗 5개"); } }catch(e){} },
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
.jrc{background:none;border:0;padding:8px 0 0;font:inherit;font-size:13px;color:var(--accent-text);font-weight:600;cursor:pointer}
#giftDlg{border:0;border-radius:18px;padding:0;max-width:380px;width:calc(100% - 28px);background:var(--card);color:var(--text)}#giftDlg::backdrop{background:rgba(0,0,0,.45)}
.gbox{width:130px;height:auto;animation:gshake 1.2s ease-in-out infinite}.gbox rect,.gbox path{fill:var(--accent-soft);stroke:var(--accent);stroke-width:3;stroke-linejoin:round;stroke-linecap:round}
@keyframes gshake{0%,100%{transform:rotate(0)}20%{transform:rotate(-4deg)}40%{transform:rotate(4deg)}60%{transform:rotate(-3deg)}80%{transform:rotate(2deg)}}
.stamp{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;min-width:76px;height:76px;padding:0 8px;border:3px solid var(--seal);border-radius:10px;color:var(--seal);transform:rotate(-4deg);animation:gstamp .5s cubic-bezier(.2,1.5,.4,1)}
.stamp b{font-weight:900;line-height:1}.stamp small{font-size:10px;font-weight:700;letter-spacing:.2em;margin-top:3px}
@keyframes gstamp{from{transform:rotate(-4deg) scale(2);opacity:0}to{transform:rotate(-4deg) scale(1);opacity:1}}
.gl{display:grid;grid-template-columns:1fr 1fr;gap:14px}.gi{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}.gi small{color:var(--sub);font-size:11px}
.jl2{fill:none;stroke:var(--fo-path);stroke-width:16;stroke-linecap:round;stroke-linejoin:round;opacity:.95}
.jrb{width:40px;height:40px}.jrb svg{width:100%;height:100%;display:block}
.hbw{display:flex;flex-direction:column;align-items:center;gap:4px;width:84px}.hbw .hbird{width:72px;height:72px}.hbtag{border:0;border-radius:999px;background:var(--chip);color:var(--sub);font:inherit;font-size:11px;font-weight:700;padding:3px 9px;cursor:pointer;white-space:nowrap}.hbtag.hot{background:var(--accent);color:var(--onacc)}
.hbird{width:100%;height:100%;border:0;background:none;padding:0;cursor:pointer;display:block}.hbird svg{width:100%;height:100%;display:block}
.shopbird{display:flex;justify-content:center}.shopbird svg.big{width:210px;height:auto}
.shtabs{display:flex;gap:8px;justify-content:center;margin-bottom:6px}
.shl{display:flex;flex-direction:column;border-top:1px solid var(--line)}.shi{display:flex;align-items:center;gap:12px;padding:10px 2px;border-bottom:1px solid var(--line)}
.shi{cursor:pointer}.shi.pv{background:var(--accent-soft);border-radius:12px}.shreset{background:none;border:0;font:inherit;font-size:inherit;color:var(--sub);text-decoration:underline;cursor:pointer;padding:0}
.shp{width:52px;height:52px;flex:none;background:var(--chip);border-radius:12px;display:flex;align-items:center;justify-content:center}.shp svg{width:48px;height:auto}
.shn{flex:1;display:flex;flex-direction:column}.shn small{color:var(--sub);font-size:12px}
.ptools{display:flex;flex-direction:column;align-items:center;gap:6px;margin-top:10px}.ptools button{background:none;border:0;font:inherit;font-size:13px;color:var(--sub);text-decoration:underline;cursor:pointer}
#shopDlg{border:0;border-radius:18px;padding:0;max-width:420px;width:calc(100% - 28px);max-height:88vh;overflow:auto;background:var(--card);color:var(--text)}#shopDlg::backdrop{background:rgba(0,0,0,.45)}
#pathDlg{border:0;border-radius:18px;padding:0;max-width:440px;width:calc(100% - 28px);background:var(--card);color:var(--text)}#pathDlg::backdrop{background:rgba(0,0,0,.45)}`;
document.head.appendChild(ST);
if(A()&&A().renderHome) A().renderHome();
})();
