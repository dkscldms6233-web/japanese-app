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
const noteAt=(list,i,fn)=>{ for(const n of list) if(n[0]===i) fn(n[1],n[2]); };
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

/* ---- 민락동 : 사용자가 직접 연주한 왼손 멜로디(민락동 14.m4a)를 분석해 만든 판타지 서사곡.
   분석: 분당 60박(셋잇단 12/8) · 화음 C→Em→F→Dm7 · 낮은 근음 뒤에 5도·옥타브·3도가 흐르는 왼손 아르페지오
   구성(16마디, 약 64초): 고요한 도입(쉼표 많음) → 주제 제시(선율 사이 쉼) → 현악이 오르며 고조(북·합창) → 금관·합창·북의 절정 → 긴 여운
   소리가 점점 커지고(마디별 세기 v), 비워 두는 곳과 꽉 채우는 곳을 일부러 나눴어요 ---- */
function piano(m,t,vol,dur){ const c=ctx(), f0=midi(m), g=c.createGain(), lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.setValueAtTime(Math.min(9000,f0*9),t); lp.frequency.exponentialRampToValueAtTime(Math.max(500,f0*2.2),t+dur*.6);
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.005); g.gain.exponentialRampToValueAtTime(vol*.35,t+.35); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  [[1,1],[2,.42],[3,.2],[4,.1],[5,.05]].forEach(([h,a],j)=>{ [-3,3].forEach(det=>{ const o=c.createOscillator(), gg=c.createGain(); o.type="sine"; o.frequency.value=f0*h*(1+(h>1?.0003*h*h:0)); o.detune.value=det; gg.gain.setValueAtTime(a*.5,t); gg.gain.exponentialRampToValueAtTime(.0001,t+dur/(1+j*.6)); o.connect(gg); gg.connect(lp); o.start(t); o.stop(t+dur+.05); }); });
  lp.connect(g); g.connect(out()); const s=c.createGain(); s.gain.value=.3; g.connect(s); s.connect(echoBus()); hit(t,.03,vol*.12,1500,1,"bandpass"); }
function brass(m,t,dur,vol){ const c=ctx(), g=c.createGain(), f=c.createBiquadFilter(); f.type="lowpass"; f.Q.value=2; f.frequency.setValueAtTime(350,t); f.frequency.exponentialRampToValueAtTime(2400,t+Math.min(.35,dur*.5)); f.frequency.exponentialRampToValueAtTime(900,t+dur);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.22); g.gain.setValueAtTime(vol,t+Math.max(.25,dur-.3)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  [-6,0,6].forEach(det=>{ const o=c.createOscillator(); o.type="sawtooth"; o.frequency.value=midi(m); o.detune.value=det; o.connect(f); o.start(t); o.stop(t+dur+.05); });
  f.connect(g); g.connect(out()); const s=c.createGain(); s.gain.value=.35; g.connect(s); s.connect(echoBus()); }
const MK=[
 {b:36,r:48,f:55,o:60,t:64,pad:[60,64,67]},   // 0 C
 {b:40,r:52,f:59,o:64,t:67,pad:[59,64,67]},   // 1 Em
 {b:41,r:53,f:60,o:65,t:69,pad:[60,65,69]},   // 2 F
 {b:38,r:50,f:57,o:62,t:65,pad:[60,65,69]},   // 3 Dm7
 {b:36,r:48,f:55,o:60,t:64,pad:[60,64,67]},   // 4 C
 {b:40,r:52,f:59,o:64,t:67,pad:[59,64,67]},   // 5 Em
 {b:41,r:53,f:60,o:65,t:69,pad:[60,65,69]},   // 6 F
 {b:43,r:55,f:62,o:67,t:71,pad:[62,67,71]},   // 7 G
 {b:45,r:57,f:64,o:69,t:72,pad:[60,64,69]},   // 8 Am
 {b:41,r:53,f:60,o:65,t:69,pad:[60,65,69]},   // 9 F
 {b:36,r:48,f:55,o:60,t:64,pad:[60,64,67]},   // 10 C
 {b:43,r:55,f:62,o:67,t:71,pad:[62,67,71]},   // 11 G
 {b:45,r:57,f:64,o:69,t:72,pad:[60,64,69]},   // 12 Am
 {b:41,r:53,f:60,o:65,t:69,pad:[60,65,69]},   // 13 F
 {b:43,r:55,f:62,o:67,t:71,pad:[62,67,71]},   // 14 G
 {b:36,r:48,f:55,o:60,t:64,pad:[60,64,67]}];  // 15 C (해결)
const MV=[.4,.45,.5,.55, .7,.7,.75,.8, .85,.9,.95,1, 1.1,1.1,1.15,1];   // 마디별 세기: 점점 커짐
const MLH={0:"r",2:"f",3:"o",4:"t",6:"f",8:"o",9:"t",10:"f"};            // 왼손 아르페지오(원곡 패턴)
const MKM=[   // 선율 — 일부러 쉬는 곳(빈 칸)을 많이 둠
 [48,76,6],  [63,79,3],[66,76,3],  [72,81,6],[78,77,3],  [84,74,3],[87,79,3],[90,83,6],
 [96,81,4],[100,84,2],[102,88,6],  [108,84,3],[111,81,3],[114,77,6],  [120,79,3],[123,84,3],[126,88,6],  [132,86,6],[141,83,3],
 [144,88,6],[150,84,3],[153,81,3],  [156,84,3],[159,89,3],[162,84,6],  [168,91,6],[174,86,3],[177,83,3],  [180,84,12]];
const minrak={bpm:60,div:3,len:192,play(i,t){
  const bar=(i/12)|0,k=i%12,d=1/3,c=MK[bar],v=MV[bar];
  if(k===0){ c.pad.forEach(m=>pad(m,t,d*12,.03*v)); tone(c.b,t,d*(bar===15?11:10),"triangle",.55*v,out()); if(bar>=8) c.pad.forEach(m=>choirW(m+12,t,d*12,.014*v)); }   // 현악 패드·낮은 베이스·(고조부터)합창
  if(bar<4){ if(k===0) piano(c.r,t,.2*v,d*8); if(k===6&&bar>0) piano(c.o,t,.14*v,d*6); }                                   // 도입: 두세 음만, 나머지는 쉼
  else if(bar<8){ if(k===0||k===3||k===6) piano(c[k===0?"r":k===3?"o":"f"],t,.2*v,d*6); }                                  // 주제부: 성긴 왼손
  else if(MLH[k]!==undefined) piano(c[MLH[k]],t,.2*v,d*5);                                                                   // 고조부터: 흐르는 왼손 아르페지오 전체
  if(bar>=8&&bar<15){ if(k===0) kick(t,.5*v,true); if(k===6) kick(t,.28*v,true); }                                          // 큰 북
  if(bar===11&&k>=9) kick(t,.3+.15*(k-9),true);                                                                              // 절정 직전 북 연타
  if(bar===12&&k===0) hit(t,1.4,.14,5000,.7);                                                                                // 절정의 심벌
  if(bar===15&&k===0){ kick(t,.8,true); hit(t,2.2,.12,5000,.7); }
  noteAt(MKM,i,(m,len)=>{
    const dur=d*len*.97;
    if(bar<8) piano(m,t,.3*v,Math.max(1,dur*1.3));
    else if(bar<12){ violin(m,t,dur,.2*v); piano(m,t,.18*v,1.2); }
    else { brass(m,t,dur,.1*v); brass(m-12,t,dur,.06*v); violin(m+12,t,dur,.12*v); piano(m,t,.2*v,1.5); }
  });
}};

window.BGM_TRACKS={
  basic:{name:"기본",bpm:132,div:2,len:32,play:(i,t)=>bgmStep(i,t)},
  arcade:{name:"신나는 오락실",...arcade},
  rich:{name:"풍성한",...rich},
  wa:{name:"일본풍",...wa},
  minrak:{name:"민락동",...minrak}
};
})();
