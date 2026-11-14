/* 게임 배경음악 4종 (외부 음원 없이 브라우저가 직접 만들어요 — 저작권 걱정 없음)
 * basic  : 기본(현재) · arcade : 신나는 오락실 · rich : 풍성한 · wa : 일본풍(세련)
 * 각 트랙: bpm(분당 박자), div(한 박자를 몇 칸으로 나눌지), len(반복 길이), play(칸 번호, 시작 시각)
 */
(function(){
const ctx=()=>SND.ctx, out=()=>SND.bgm;
let noiseBuf=null;
function noise(){ if(noiseBuf) return noiseBuf; const c=ctx(), b=c.createBuffer(1,c.sampleRate,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; return noiseBuf=b; }
function hit(t,dur,vol,freq,q,type){ const c=ctx(), s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); s.buffer=noise(); f.type=type||"highpass"; f.frequency.value=freq; f.Q.value=q||1;
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur); s.connect(f); f.connect(g); g.connect(out()); s.start(t); s.stop(t+dur+.02); }
const hat=(t,v)=>hit(t,.05,v||.35,7000,1);
const snare=(t,v)=>{ hit(t,.14,v||.55,1800,.8,"bandpass"); };
function kick(t,v,low){ const c=ctx(), o=c.createOscillator(), g=c.createGain(); o.type="sine"; o.frequency.setValueAtTime(low?110:150,t); o.frequency.exponentialRampToValueAtTime(low?38:45,t+.14);
  g.gain.setValueAtTime(v||.9,t); g.gain.exponentialRampToValueAtTime(.0001,t+(low?.5:.22)); o.connect(g); g.connect(out()); o.start(t); o.stop(t+.55); }
function pad(m,t,dur,vol){ const c=ctx(), g=c.createGain(), f=c.createBiquadFilter(); f.type="lowpass"; f.frequency.value=1100; g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+dur*.35); g.gain.linearRampToValueAtTime(.0001,t+dur);
  [["sine",0],["triangle",.004]].forEach(([ty,det])=>{ const o=c.createOscillator(); o.type=ty; o.frequency.value=midi(m)*(1+det); o.connect(f); o.start(t); o.stop(t+dur+.05); }); f.connect(g); g.connect(out()); }
let echo=null;
function echoBus(){ if(echo&&echo.c===ctx()) return echo.in; const c=ctx(), inp=c.createGain(), d=c.createDelay(1), fb=c.createGain(), lp=c.createBiquadFilter(); d.delayTime.value=.3; fb.gain.value=.32; lp.type="lowpass"; lp.frequency.value=2600;
  inp.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(out()); echo={c,in:inp}; return inp; }
function lead(m,t,dur,type,vol,send){ const c=ctx(), o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.value=midi(m);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.02); g.gain.setValueAtTime(vol,t+Math.max(.03,dur-.12)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(out()); if(send){ const s=c.createGain(); s.gain.value=send; g.connect(s); s.connect(echoBus()); } o.start(t); o.stop(t+dur+.05); }
function pluck(m,t,vol,dur){ const c=ctx(), g=c.createGain(), f=c.createBiquadFilter(); f.type="lowpass"; f.frequency.setValueAtTime(4200,t); f.frequency.exponentialRampToValueAtTime(700,t+.5);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.006); g.gain.exponentialRampToValueAtTime(.0001,t+(dur||1)); 
  [["triangle",1],["sine",2]].forEach(([ty,mul],i)=>{ const o=c.createOscillator(); o.type=ty; o.frequency.value=midi(m)*mul; const gg=c.createGain(); gg.gain.value=i?0.25:1; o.connect(gg); gg.connect(f); o.start(t); o.stop(t+(dur||1)+.05); }); f.connect(g); g.connect(out());
  const s=c.createGain(); s.gain.value=.4; g.connect(s); s.connect(echoBus()); }
function flute(m,t,dur,vol){ const c=ctx(), o=c.createOscillator(), g=c.createGain(), l=c.createOscillator(), lg=c.createGain(); o.type="sine"; o.frequency.value=midi(m);
  l.frequency.value=5.2; lg.gain.value=midi(m)*.006; l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.12); g.gain.setValueAtTime(vol,t+Math.max(.15,dur-.18)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(out()); const s=c.createGain(); s.gain.value=.5; g.connect(s); s.connect(echoBus()); o.start(t); l.start(t); o.stop(t+dur+.05); l.stop(t+dur+.05);
  hit(t,.12,vol*.25,3000,1.2,"bandpass"); }

/* ---- 공통 도우미 ---- */
const noteAt=(list,i,fn)=>{ for(const n of list) if(n[0]===i) fn(n[1],n[2],n[3]); };
function bell(m,t,dur,vol){ const c=ctx(), g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+Math.min(dur,1.6));
  [[1,1],[2.76,.22],[5.4,.07]].forEach(([mul,v])=>{ const o=c.createOscillator(), gg=c.createGain(); o.type="sine"; o.frequency.value=midi(m)*mul; gg.gain.value=v; o.connect(gg); gg.connect(g); o.start(t); o.stop(t+1.7); });
  g.connect(out()); const s=c.createGain(); s.gain.value=.4; g.connect(s); s.connect(echoBus()); }
/* 8비트(패미컴 풍) 소리: 펄스파(듀티 12.5·25·50%) · 삼각파 · 노이즈 */
const pulseWaves={};
function pulse(duty){ if(pulseWaves[duty]&&pulseWaves[duty].c===ctx()) return pulseWaves[duty].w; const N=48, re=new Float32Array(N), im=new Float32Array(N);
  for(let n=1;n<N;n++){ re[n]=Math.sin(2*Math.PI*n*duty)/(Math.PI*n); im[n]=(1-Math.cos(2*Math.PI*n*duty))/(Math.PI*n); }
  const w=ctx().createPeriodicWave(re,im); pulseWaves[duty]={c:ctx(),w}; return w; }
function chip(m,t,dur,duty,vol){ const c=ctx(), o=c.createOscillator(), g=c.createGain(); o.setPeriodicWave(pulse(duty)); o.frequency.value=midi(m);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.005); g.gain.setValueAtTime(vol,t+Math.max(.01,dur-.02)); g.gain.linearRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(out()); o.start(t); o.stop(t+dur+.03); }
function chipKick(t){ const c=ctx(), o=c.createOscillator(), g=c.createGain(); o.type="triangle"; o.frequency.setValueAtTime(190,t); o.frequency.exponentialRampToValueAtTime(42,t+.11);
  g.gain.setValueAtTime(.9,t); g.gain.exponentialRampToValueAtTime(.0001,t+.14); o.connect(g); g.connect(out()); o.start(t); o.stop(t+.16); }
const chipSnare=(t,v)=>hit(t,.09,v||.5,2500,.6,"bandpass");
const chipHat=(t,v)=>hit(t,.025,v||.22,9000,1);

/* ---- 신나는 오락실 (옛날 오락실) : 1980년대 아케이드 게임처럼 짧게 끊어 치는 "뜬뜬뜬" 소리.
   스타카토 펄스파 · 규칙적으로 두들기는 베이스 · 노이즈 틱 · 코인/레이저 효과음. 화음은 Em | D | C | B7 의 단순한 반복 ---- */
const AR_BASS=[52,50,48,47,52,50,48,47];
const AR_MEL=[
 [0,76,1],[2,76,1],[4,79,1],[6,76,1],
 [8,74,1],[10,74,1],[12,78,1],[14,74,1],
 [16,72,1],[18,72,1],[20,76,1],[22,72,1],
 [24,71,1],[26,75,1],[28,78,1],[30,81,1],
 [32,76,1],[34,83,1],[36,79,1],[38,76,1],
 [40,74,1],[42,81,1],[44,78,1],[46,74,1],
 [48,72,1],[50,79,1],[52,76,1],[54,72,1],
 [56,83,1],[57,82,1],[58,81,1],[59,80,1],[60,79,1],[62,76,2]];
function clampOct(m,lo,hi){ while(m<lo) m+=12; while(m>hi) m-=12; return m; }
function laser(t,from,to,dur,vol){ const c=ctx(), o=c.createOscillator(), g=c.createGain(); o.setPeriodicWave(pulse(.5)); o.frequency.setValueAtTime(from,t); o.frequency.exponentialRampToValueAtTime(to,t+dur);
  g.gain.setValueAtTime(vol,t); g.gain.linearRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(out()); o.start(t); o.stop(t+dur+.02); }
const arcade={bpm:156,div:2,len:64,play(i,t){
  const bar=i>>3,k=i&7,d=60/156/2,r=AR_BASS[bar];
  // 쿵쿵 두들기는 베이스: 8분음표마다 짧게 (사각파 25%)
  chip(r-12,t,d*.45,.25,.13);
  if(k===0||k===4) chipKick(t); if(k===2||k===6) chipSnare(t,.35); chipHat(t,.12);
  // "뜬뜬뜬" 선율: 짧게 끊어 치는 사각파
  noteAt(AR_MEL,i,(m,len)=>{ chip(m,t,d*.5*len,.5,.15); });
  // 효과음: 4마디마다 동전 소리, 마지막 마디 끝에 레이저
  if(bar===3&&k===7){ chip(83,t,d*.4,.5,.12); chip(88,t+d*.45,d*.9,.5,.12); }
  if(bar===7&&k===6) laser(t,1800,260,d*1.8,.07);
}};

/* ---- 풍성한 : 'Yumeiro Patissiere OST - Imagination' 음원을 분석해 같은 뼈대로 새로 작곡한 오리지널 곡 (선율은 옮기지 않았어요)
   분석 결과: 템포 약 110 BPM · 4박 · D장조(D·G·A 위주, D·Dsus 상태가 길게 유지) · 화음에 E7·A7·Em7·G와 빌려온 Gm이 번갈아 나옴
   · 첫 8초는 반짝이는 고음 · 음량은 약 24초와 64초 부근에서 두 번 커짐 · 에너지는 800~1800Hz의 중음역에 몰려 따뜻함(고음은 적음) · 저음(베이스) 비중 약 28%
   구성: 반짝이는 도입 4마디 → 주제 8마디 → 마무리 4마디 (16마디). 모든 악기가 현재 화음의 구성음만 연주해요 ---- */
function violin(m,t,dur,vol){ const c=ctx(), o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain(), l=c.createOscillator(), lg=c.createGain(); o.type="sawtooth"; o.frequency.value=midi(m); f.type="lowpass"; f.frequency.value=2200;
  l.frequency.value=5.2; lg.gain.value=midi(m)*.004; l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.14); g.gain.setValueAtTime(vol,t+Math.max(.2,dur-.18)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(f); f.connect(g); g.connect(out()); const s=c.createGain(); s.gain.value=.4; g.connect(s); s.connect(echoBus()); o.start(t); l.start(t); o.stop(t+dur+.05); l.stop(t+dur+.05); }
const RC=[
 {b:38,up:[66,69,73,76]},   // Dmaj9
 {b:38,up:[62,66,69,73]},   // Dmaj7
 {b:43,up:[62,67,71,74]},   // G
 {b:40,up:[62,64,68,71]},   // E7
 {b:38,up:[62,66,69,74]},   // D
 {b:43,up:[58,62,67,70]},   // Gm (빌려온 단조 화음)
 {b:42,up:[62,66,69,74]},   // D/F#
 {b:45,up:[61,64,67,73]},   // A7
 {b:40,up:[59,62,67,71]},   // Em7
 {b:45,up:[61,64,67,73]},   // A7
 {b:38,up:[62,66,69,73]},   // Dmaj7
 {b:43,up:[62,67,71,74]},   // G
 {b:38,up:[62,66,69,74]},   // D
 {b:43,up:[58,62,67,70]},   // Gm
 {b:42,up:[62,66,69,74]},   // D/F#
 {b:45,up:[62,64,67,69]}];  // A7sus4 → A7
const A7T=[61,64,67,73];
const RM=[   // 리듬을 다양하게(점4분·긴 음·도약) 바꾼 새 주제: A(상승) → B(대답) → C(절정)
 [32,81,3],[35,78,1],[36,81,2],[38,86,2],  [40,82,3],[43,79,1],[44,74,2],[46,79,2],  [48,78,2],[50,81,1],[51,86,1],[52,90,4],  [56,88,3],[59,85,1],[60,81,2],[62,79,2],
 [64,83,2],[66,86,2],[68,83,1],[69,79,1],[70,76,2],  [72,85,3],[75,81,1],[76,76,2],[78,81,2],  [80,86,4],[84,85,2],[86,81,2],  [88,83,3],[91,86,1],[92,86,2],[94,83,2],
 [96,90,3],[99,88,1],[100,86,2],[102,81,2],  [104,82,2],[106,86,2],[108,91,4],  [112,90,3],[115,86,1],[116,81,2],[118,78,2],  [120,81,2],[122,85,2],[124,88,4]];
const AP=[0,1,2,3,2,1,2,1];
const rich={bpm:110,div:2,len:128,play(i,t){
  const bar=i>>3,k=i&7,d=60/110/2,c=RC[bar], up=(bar===15&&k>=4)?A7T:c.up, v=bar<8?.85:bar<12?1:.85;
  if(k===0){ up.forEach(m=>{ pad(m+12,t,d*8,.07*v); pad(m,t,d*8,.035*v); }); tone(c.b,t,d*7,"triangle",.85*v,out()); }                    // 현악 패드 + 베이스(저음 비중)
  if(k===4) tone(c.b+(bar%2?0:7),t,d*3.5,"triangle",.6*v,out());
  if(k%2===1) tone(up[(k>>1)%4]+12,t,d*.45,"triangle",.1*v,out());   // 피치카토 (처음부터)
  if(k===0||k===4) kick(t,.22*v,true); if(k===2||k===6) snare(t,.12); if(k%2===0) hat(t,.12);
  if(bar===15&&k>=4) snare(t,.15+.06*(k-4));
  if(bar<4) noteAt(RM,i+32,(m,len)=>{ flute(m,t,d*len*.95,.3); });   // 도입에도 주제 선율(플루트)
  noteAt(RM,i,(m,len)=>{ if(bar<8){ flute(m,t,d*len*.95,.3); } else { violin(m,t,d*len*.97,.26); flute(m+12,t,d*len*.9,.1); } });
}};

/* ---- 일본풍 (동양 판타지) : 게임 속 '일본풍 동양 판타지' 음악 느낌. 코토의 흐르는 아르페지오 + 샤쿠하치 선율 + 현악·합창 패드 + 부드러운 북과 종.
   음계는 D 장조 5음 음계(D·E·F#·A·B)만 써서 어떤 음이 겹쳐도 부딪히지 않고 맑아요. 진행: D | Bm | Esus | A | D | Bm | Esus | A→D ---- */
function shaku(m,t,dur,vol){ const c=ctx(), o=c.createOscillator(), g=c.createGain(), l=c.createOscillator(), lg=c.createGain();
  o.type="sine"; o.frequency.setValueAtTime(midi(m-.6),t); o.frequency.exponentialRampToValueAtTime(midi(m),t+.14);
  l.frequency.value=4.6; lg.gain.value=midi(m)*.0035; l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.22); g.gain.setValueAtTime(vol,t+Math.max(.3,dur-.4)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(out()); const s=c.createGain(); s.gain.value=.45; g.connect(s); s.connect(echoBus()); o.start(t); l.start(t); o.stop(t+dur+.05); l.stop(t+dur+.05);
  hit(t,.18,vol*.1,2600,1.2,"bandpass"); }
function choirW(m,t,dur,vol){ const c=ctx(), g=c.createGain(), f=c.createBiquadFilter(), l=c.createOscillator(), lg=c.createGain(); f.type="lowpass"; f.frequency.value=1300;
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+dur*.4); g.gain.linearRampToValueAtTime(.0001,t+dur); l.frequency.value=4.8; lg.gain.value=midi(m)*.004; l.connect(lg);
  [-5,0,5].forEach(det=>{ const o=c.createOscillator(); o.type="sawtooth"; o.frequency.value=midi(m); o.detune.value=det; lg.connect(o.frequency); o.connect(f); o.start(t); o.stop(t+dur+.05); });
  l.start(t); l.stop(t+dur+.05); f.connect(g); g.connect(out()); }
const WF=[
 {b:38,pad:[62,64,69]},    // D(add9)
 {b:47,pad:[59,62,66]},    // Bm
 {b:40,pad:[64,69,71]},    // Esus
 {b:45,pad:[57,59,64]},    // Asus2
 {b:38,pad:[62,64,69]},
 {b:47,pad:[59,62,66]},
 {b:40,pad:[64,69,71]},
 {b:45,pad:[57,59,64]}];
const WF_MEL=[[0,81,3],[3,78,1],[4,76,2],[6,74,2],[8,78,3],[11,83,1],[12,81,4],[16,83,3],[19,81,1],[20,76,4],[24,81,6],[30,78,2],
 [32,86,3],[35,83,1],[36,81,2],[38,78,2],[40,83,3],[43,81,1],[44,78,4],[48,76,3],[51,78,1],[52,81,4],[56,83,4],[60,81,2],[62,74,2]];
const WFP=[0,1,2,3,2,1,2,4];            // 코토 아르페지오(화음 구성음 위주)
const wa={bpm:76,div:2,len:64,play(i,t){
  const bar=i>>3,k=i&7,d=60/76/2,c=WF[bar], notes=[c.pad[0],c.pad[1],c.pad[2],c.pad[0]+12,c.pad[1]+12];
  pluck(notes[WFP[k]],t,k===0?.26:.17,1.6);                                                    // 코토: 흐르는 아르페지오
  if(k===0){ c.pad.forEach(m=>pad(m,t,d*8,.06)); choirW(c.pad[0],t,d*8,.017); tone(c.b,t,d*6,"triangle",.8,out()); }   // 현악 · 합창 · 낮은 베이스
  if(k===0&&(bar===0||bar===4)) kick(t,.5,true);                                              // 부드러운 북
  if(bar===7&&k>=6) kick(t,.3+.12*(k-6),true);
  if((bar===1||bar===5)&&k===4) bell(86,t,d*8,.06);                                             // 카구라 방울 풍 종소리
  if((bar===3||bar===7)&&k===6){ [86,83,81,78,76,74].forEach((m,j)=>pluck(m,t+j*.07,.12,1.1)); }   // 코토 글리산도(하행)
  noteAt(WF_MEL,i,(m,len)=>shaku(m,t,d*len*.97,.2));                                           // 샤쿠하치 선율
}};

/* ---- 클래식 왈츠 (산뜻한 아침 왈츠) : 참고한 곡 소개글의 편성 '현악 4중주 + 플루트 + 차임벨' 그대로, G장조 3/4박자 분당 138박, 16마디.
   구성: 제1바이올린(선율) · 제2바이올린/비올라(짝짝 짧은 현·길게 받침) · 첼로(쿵 피치카토·활로 길게) · 플루트(2번째·4번째 구절 선율) · 차임벨(구절 첫머리 반짝임)
   소리: 현악은 활 소리·몸통 울림(공명 필터)·비브라토를 넣고, 플루트는 숨소리를 섞고, 악기마다 좌우 위치·큰 홀 리버브·사람 같은 타이밍 흔들림을 줘서 인공적인 느낌을 줄였어요. 북·두꺼운 저음은 쓰지 않아요
   진행: G G D7 G | G C D7 G | Em Am D7 G | C A7 D7 G  (4마디 구절 ×4: 제시 → 응답 → 대비 → 마무리) ---- */
let rev=null;
function revBus(){ if(rev&&rev.c===ctx()) return rev.in; const c=ctx(), len=c.sampleRate*2.2, ir=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){ const d=ir.getChannelData(ch); let lp=0; for(let i=0;i<len;i++){ lp=lp*.55+(Math.random()*2-1)*.45; d[i]=lp*Math.pow(1-i/len,2.8); } }   // 부드럽게 깎인 홀 울림
  const cv=c.createConvolver(), inp=c.createGain(), wet=c.createGain(); cv.buffer=ir; wet.gain.value=.75; inp.connect(cv); cv.connect(wet); wet.connect(out()); rev={c,in:inp}; return inp; }
function route(g,pan,rv){ const c=ctx(), p=c.createStereoPanner(); p.pan.value=pan; g.connect(p); p.connect(out()); const s=c.createGain(); s.gain.value=rv; p.connect(s); s.connect(revBus()); }
const jit=()=>(Math.random()-.5)*.016, vj=()=>.9+Math.random()*.2;   // 사람이 연주하는 것처럼 타이밍·세기를 조금 흔들어요
/* 활로 켜는 현 (바이올린·비올라·첼로 공통): 톱니파 여러 겹 + 몸통 공명 + 비브라토 + 활 긁는 소리 */
function bow(m,t,dur,vol,pan,bright,att,rv){ const c=ctx(); t+=jit(); vol*=vj(); const g=c.createGain(), f=c.createBiquadFilter(), b1=c.createBiquadFilter(), b2=c.createBiquadFilter(), l=c.createOscillator(), lg=c.createGain(), vd=c.createGain();
  f.type="lowpass"; f.Q.value=.5; f.frequency.setValueAtTime(bright*.35,t); f.frequency.exponentialRampToValueAtTime(bright,t+att*2.2); f.frequency.exponentialRampToValueAtTime(bright*.8,t+dur);
  b1.type="peaking"; b1.frequency.value=300; b1.gain.value=4; b1.Q.value=1.1; b2.type="peaking"; b2.frequency.value=2300; b2.gain.value=3.5; b2.Q.value=1.4;      // 몸통 울림
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+att); g.gain.setValueAtTime(vol,t+Math.max(att+.02,dur-.1)); g.gain.exponentialRampToValueAtTime(.0001,t+dur+.12);
  l.frequency.value=5+Math.random()*.7; lg.gain.value=midi(m)*.0032; vd.gain.setValueAtTime(0,t); vd.gain.linearRampToValueAtTime(1,t+Math.min(.4,dur*.6)); l.connect(vd); vd.connect(lg);
  [-11,-4,3,10].forEach(det=>{ const o=c.createOscillator(), gg=c.createGain(); o.type="sawtooth"; o.frequency.value=midi(m); o.detune.value=det; gg.gain.value=.26; lg.connect(o.frequency); o.connect(gg); gg.connect(f); o.start(t); o.stop(t+dur+.2); });
  l.start(t); l.stop(t+dur+.2); f.connect(b1); b1.connect(b2); b2.connect(g); route(g,pan,rv||.4); hit(t,.05,vol*.16,2800,1,"bandpass"); }
/* 짧게 끊어 치는 현 (짝짝) */
function stac(m,t,vol,pan){ const c=ctx(); t+=jit(); vol*=vj(); const g=c.createGain(), f=c.createBiquadFilter(), b1=c.createBiquadFilter(); f.type="lowpass"; f.frequency.value=2000; b1.type="peaking"; b1.frequency.value=320; b1.gain.value=4;
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.014); g.gain.exponentialRampToValueAtTime(.0001,t+.17);
  [-7,0,7].forEach(det=>{ const o=c.createOscillator(); o.type="sawtooth"; o.frequency.value=midi(m); o.detune.value=det; o.connect(f); o.start(t); o.stop(t+.22); }); f.connect(b1); b1.connect(g); route(g,pan,.3); hit(t,.03,vol*.2,3000,1,"bandpass"); }
/* 손가락으로 튕기는 현 (피치카토) */
function pizz(m,t,vol,pan){ const c=ctx(); t+=jit(); vol*=vj(); const o=c.createOscillator(), o2=c.createOscillator(), g=c.createGain(), f=c.createBiquadFilter(), g2=c.createGain();
  f.type="lowpass"; f.frequency.setValueAtTime(2600,t); f.frequency.exponentialRampToValueAtTime(500,t+.3);
  o.type="triangle"; o.frequency.setValueAtTime(midi(m)*1.01,t); o.frequency.exponentialRampToValueAtTime(midi(m),t+.05); o2.type="sine"; o2.frequency.value=midi(m)*2; g2.gain.value=.3;
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.005); g.gain.exponentialRampToValueAtTime(.0001,t+.42);
  o.connect(f); o2.connect(g2); g2.connect(f); f.connect(g); route(g,pan,.3); [o,o2].forEach(x=>{ x.start(t); x.stop(t+.5); }); hit(t,.02,vol*.25,2200,1,"bandpass"); }
/* 플루트: 맑은 소리 + 숨소리 + 늦게 시작하는 부드러운 비브라토 + 시작할 때 살짝 올라오는 음정 */
function flute(m,t,dur,vol,pan){ const c=ctx(); t+=jit(); vol*=vj(); const o=c.createOscillator(), o2=c.createOscillator(), o3=c.createOscillator(), g=c.createGain(), g2=c.createGain(), g3=c.createGain(), l=c.createOscillator(), lg=c.createGain(), vd=c.createGain();
  o.type="sine"; o2.type="sine"; o3.type="sine"; o.frequency.setValueAtTime(midi(m)*.985,t); o.frequency.exponentialRampToValueAtTime(midi(m),t+.06); o2.frequency.value=midi(m)*2; o3.frequency.value=midi(m)*3; g2.gain.value=.22; g3.gain.value=.06;
  l.frequency.value=5.3; lg.gain.value=midi(m)*.0028; vd.gain.setValueAtTime(0,t); vd.gain.setValueAtTime(0,t+.25); vd.gain.linearRampToValueAtTime(1,t+.6); l.connect(vd); vd.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.09); g.gain.setValueAtTime(vol*.92,t+Math.max(.12,dur-.12)); g.gain.exponentialRampToValueAtTime(.0001,t+dur+.1);
  o.connect(g); o2.connect(g2); o3.connect(g3); g2.connect(g); g3.connect(g); route(g,pan,.45); [o,o2,o3,l].forEach(x=>{ x.start(t); x.stop(t+dur+.15); });
  const n=c.createBufferSource(), nf=c.createBiquadFilter(), ng=c.createGain(); n.buffer=(window.__nb||(window.__nb=(()=>{ const b=c.createBuffer(1,c.sampleRate,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; return b; })())); n.loop=true;
  nf.type="bandpass"; nf.frequency.value=Math.min(6000,midi(m)*2.4); nf.Q.value=1.4; ng.gain.setValueAtTime(.0001,t); ng.gain.linearRampToValueAtTime(vol*.28,t+.05); ng.gain.setValueAtTime(vol*.2,t+Math.max(.07,dur-.1)); ng.gain.exponentialRampToValueAtTime(.0001,t+dur+.08);
  n.connect(nf); nf.connect(ng); route(ng,pan,.3); n.start(t); n.stop(t+dur+.12); }
/* 차임벨: 어긋난 배음(2.76·4.1·5.4배)이 길게 울리는 맑은 종소리 */
function chime(m,t,vol,pan){ const c=ctx(), g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.003); g.gain.exponentialRampToValueAtTime(.0001,t+2.2);
  [[1,1,1],[2.76,.32,.7],[4.1,.18,.45],[5.4,.1,.3]].forEach(([mul,a,dec])=>{ const o=c.createOscillator(), gg=c.createGain(); o.type="sine"; o.frequency.value=midi(m)*mul; gg.gain.setValueAtTime(a,t); gg.gain.exponentialRampToValueAtTime(.0001,t+2.2*dec); o.connect(gg); gg.connect(g); o.start(t); o.stop(t+2.3); });
  route(g,pan,.7); }
const WG={b:43,ch:[59,62,67],tn:[55,59,62,67]}, WC={b:48,ch:[60,64,67],tn:[55,60,64,67]}, WD={b:50,ch:[57,60,66],tn:[54,57,60,66]},
      WE={b:52,ch:[59,64,67],tn:[55,59,64,67]}, WAm={b:45,ch:[60,64,69],tn:[57,60,64,69]}, WA7={b:45,ch:[55,61,64],tn:[52,57,61,64]};
const WZP=[WG,WG,WD,WG, WG,WC,WD,WG, WE,WAm,WD,WG, WC,WA7,WD,WG];
const WZV=[.7,.75,.85,.8, .85,.9,.95,.9, .8,.85,.95,.9, 1,1.05,1.05,.85];   // 마디별 세기: 구절마다 부풀었다 가라앉음
const WZM=[   // 선율 [시작 칸, 음, 길이(칸)] — 한 마디 6칸(8분음표). 4마디 구절 ×4
 [0,83,3],[3,81,1],[4,79,2],  [6,81,2],[8,83,2],[10,86,2],  [12,88,3],[15,86,1],[16,84,2],  [18,83,6],
 [24,83,3],[27,86,1],[28,91,2],  [30,88,3],[33,84,1],[34,79,2],  [36,81,2],[38,84,2],[40,81,2],  [42,79,6],
 [48,88,3],[51,86,1],[52,83,2],  [54,84,3],[57,83,1],[58,81,2],  [60,78,2],[62,81,2],[64,84,2],  [66,83,6],
 [72,88,3],[75,84,1],[76,91,2],  [78,88,3],[81,85,1],[82,81,2],  [84,86,3],[87,84,1],[88,81,2],  [90,83,2],[92,79,4]];
const waltz={bpm:138,div:2,len:96,play(i,t){
  const bar=(i/6)|0, k=i%6, d=60/138/2, c=WZP[bar], v=WZV[bar], ph=(bar/4)|0;       // ph: 0=제시 1=응답 2=대비 3=마무리
  /* 쿵: 첼로 — 앞쪽은 피치카토, 대비 구절은 활로 길게 */
  if(k===0){ if(ph===2) bow(c.b,t,d*5.6,.1*v,.4,900,.12); else pizz(c.b,t,.34*v,.4); }
  /* 짝·짝: 제2바이올린·비올라 — 첫 구절은 피치카토로 가볍게, 이후는 짧은 현 */
  if(k===2||k===4){ if(ph===0) c.ch.forEach((m,j)=>pizz(m,t,.13*v,-.2+j*.15)); else c.ch.forEach((m,j)=>stac(m+(j===2?0:12),t,.07*v,-.2+j*.15)); }
  /* 대비 구절: 비올라·제2바이올린이 화음을 길게 받쳐 줘요 */
  if(k===0&&ph===2) [c.ch[1],c.ch[2]].forEach((m,j)=>bow(m,t,d*5.7,.05*v,-.1+j*.2,1500,.2));
  /* 차임벨: 구절 첫머리마다, 마지막 마디는 올라가는 반짝임 */
  if(k===0&&(bar===4||bar===12)) chime(c.tn[3]+24,t,.1*v,.3);
  if(bar===15&&(k===0||k===2||k===4)) chime([91,95,98][k/2],t,.09*v,k?-.3:.3);
  noteAt(WZM,i,(m,len)=>{ const dur=d*len*.96;
    if(ph===0||ph===2){ bow(m,t,dur,.2*v,-.35,3200,.07); if(len>=3) bow(m+12,t,dur,.025*v,-.2,3600,.1); }          // 제1바이올린 선율
    else { flute(m,t,dur,.26*v,.2); bow(m-12,t,dur,.07*v,-.35,2400,.07); }                                           // 플루트 선율 + 바이올린이 한 옥타브 아래에서 받침
  });
}};

window.BGM_TRACKS={
  basic:{name:"기본",bpm:132,div:2,len:32,play:(i,t)=>bgmStep(i,t)},
  arcade:{name:"신나는 오락실",...arcade},
  rich:{name:"풍성한",...rich},
  wa:{name:"일본풍",...wa},
  waltz:{name:"클래식 왈츠",...waltz}
};
})();
