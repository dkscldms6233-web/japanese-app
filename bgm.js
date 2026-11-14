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
const RM=[
 [32,78,2],[34,81,2],[36,86,2],[38,81,2],  [40,79,2],[42,82,2],[44,86,2],[46,82,2],  [48,78,2],[50,81,2],[52,86,2],[54,81,2],  [56,85,2],[58,88,2],[60,85,2],[62,81,2],
 [64,83,2],[66,79,2],[68,83,2],[70,79,2],  [72,81,2],[74,85,2],[76,88,2],[78,85,2],  [80,86,4],[84,81,2],[86,78,2],  [88,83,2],[90,86,2],[92,79,2],[94,83,2],
 [96,81,2],[98,86,2],[100,90,4],  [104,86,2],[106,82,2],[108,79,4],  [112,81,2],[114,78,2],[116,74,4],  [120,81,2],[122,85,2],[124,88,4]];
const AP=[0,1,2,3,2,1,2,1];
const rich={bpm:110,div:2,len:128,play(i,t){
  const bar=i>>3,k=i&7,d=60/110/2,c=RC[bar], up=(bar===15&&k>=4)?A7T:c.up, v=bar<4?.6:bar<8?.85:bar<12?1:.85;
  if(k===0){ up.forEach(m=>{ pad(m+12,t,d*8,.07*v); pad(m,t,d*8,.035*v); }); tone(c.b,t,d*7,"triangle",.85*v,out()); }                    // 현악 패드 + 베이스(저음 비중)
  if(k===4) tone(c.b+(bar%2?0:7),t,d*3.5,"triangle",.6*v,out());
  if(bar<4){ bell(up[AP[k]%4]+12,t,d*3,.13); if(k===0) bell(up[3]+24,t,d*6,.1); }   // 도입: 반짝이는 고음 아르페지오
  else { if(k%2===1) tone(up[(k>>1)%4]+12,t,d*.45,"triangle",.1*v,out()); }   // 피아노 풍 아르페지오 + 피치카토
  if(bar>=4&&(k===0||k===4)) kick(t,.22*v,true); if(bar>=8&&(k===2||k===6)) snare(t,.12); if(k%2===0) hat(t,bar<4?.07:.12);
  if(bar===15&&k>=4) snare(t,.15+.06*(k-4));
  noteAt(RM,i,(m,len)=>{ if(bar<8){ flute(m,t,d*len*.95,.3); bell(m,t,d*len,.06); } else { violin(m,t,d*len*.97,.26); flute(m+12,t,d*len*.9,.1); bell(m+12,t,d*len,.08); } });
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

window.BGM_TRACKS={
  basic:{name:"기본",bpm:132,div:2,len:32,play:(i,t)=>bgmStep(i,t)},
  arcade:{name:"신나는 오락실",...arcade},
  rich:{name:"풍성한",...rich},
  wa:{name:"일본풍",...wa}
};
})();
