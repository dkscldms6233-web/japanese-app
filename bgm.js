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

/* ---- 풍성한 (판타지 · 악기 중심) : 선율은 아주 조금, 악기를 겹겹이 쌓았어요.
   Am9 | Fmaj7#11 | Cmaj7#11 | Em9 | Am9 | Dm9 | B♭maj7#11 | Esus4→E7(♭9)  (리디안 · 프리지안 도미넌트의 신비로운 색)
   현악·합창·호른 패드 / 하프 아르페지오 / 첼로 베이스 / 클라리넷 피치카토 / 첼레스타·종 / 플루트 / 팀파니·트라이앵글 / 마법의 상행 글리산도 ---- */
function choir(m,t,dur,vol){ const c=ctx(), g=c.createGain(), f=c.createBiquadFilter(), l=c.createOscillator(), lg=c.createGain(); f.type="lowpass"; f.frequency.value=1500;
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+dur*.4); g.gain.linearRampToValueAtTime(.0001,t+dur); l.frequency.value=5; lg.gain.value=midi(m)*.004; l.connect(lg);
  [-6,0,6].forEach(det=>{ const o=c.createOscillator(); o.type="sawtooth"; o.frequency.value=midi(m); o.detune.value=det; lg.connect(o.frequency); o.connect(f); o.start(t); o.stop(t+dur+.05); });
  l.start(t); l.stop(t+dur+.05); f.connect(g); g.connect(out()); }
function brass(m,t,dur,vol){ const c=ctx(), o=c.createOscillator(), g=c.createGain(), f=c.createBiquadFilter(); o.type="sawtooth"; o.frequency.value=midi(m);
  f.type="lowpass"; f.frequency.setValueAtTime(300,t); f.frequency.linearRampToValueAtTime(1800,t+dur*.6); f.frequency.linearRampToValueAtTime(500,t+dur);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+dur*.5); g.gain.linearRampToValueAtTime(.0001,t+dur); o.connect(f); f.connect(g); g.connect(out()); o.start(t); o.stop(t+dur+.05); }
const RC=[
 {b:45,up:[60,64,67,71]},{b:41,up:[57,60,64,71]},{b:48,up:[59,64,66,67]},{b:40,up:[59,62,66,67]},
 {b:45,up:[60,64,67,71]},{b:50,up:[60,64,65,69]},{b:46,up:[58,62,65,69]},{b:40,up:[59,62,64,69]}];
const E7=[56,59,62,65];
const FLU=[[0,76,12],[16,77,8],[24,76,4],[28,72,4],[32,79,12],[44,76,4],[48,74,8],[56,76,8],[64,81,12],[80,81,8],[88,77,8],[96,82,8],[104,79,8],[112,80,8],[120,76,8]];
const MAGIC=[69,72,76,79,81,84,88,91];
const HP=[0,1,2,3,2,1,3,2, 0,1,2,3,1,2,3,2];
const rich={bpm:80,div:4,len:128,play(i,t){
  const bar=i>>4,k=i&15,d=60/80/4,c=RC[bar],nx=RC[(bar+1)%8], up=(bar===7&&k>=8)?E7:c.up;
  if(k===0){ c.up.forEach(m=>pad(m-12,t,d*16,.075)); c.up.forEach(m=>pad(m,t+.05,d*16,.04));            // 현악 패드(두 옥타브)
    choir(c.up[0]+12,t,d*16,.02); choir(c.up[2]+12,t,d*16,.016);                                          // 합창
    brass(c.b+12,t,d*16,.06); }                                                                           // 호른 스웰
  if(k===0) tone(c.b,t,d*7,"triangle",.9,out());                                                          // 첼로 베이스
  if(k===8) tone(c.b+7,t,d*5,"triangle",.65,out());
  if(k===14) tone(nx.b+(nx.b>c.b?-1:1),t,d*2,"triangle",.5,out());
  pluck(up[HP[k]]+(k%4===3?12:0),t,.13,1.5);                                                              // 하프 아르페지오
  if(k%4===2) tone(up[(k>>2)%4]+12,t,d*.8,"triangle",.07,out());                                            // 클라리넷 풍 피치카토
  if(k===0||k===8) bell(up[(k>>3)*2+1]+24,t,d*8,.07);                                                     // 첼레스타·종
  if(k===12) bell(up[2]+36,t,d*4,.03);                                                                      // 트라이앵글 풍 아주 높은 종
  if(k===0&&(bar===0||bar===4)) kick(t,.65,true);                                                          // 팀파니
  if(bar===7&&k>=12) kick(t,.25+.14*(k-12),true);
  if(k%4===2) hat(t,.06);
  if((bar===3&&k>=10&&k<=15)||(bar===7&&k>=6&&k<=13)){ const j=bar===3?k-10:k-6; const m=MAGIC[Math.min(7,j)]; pluck(m,t,.13,1.3); bell(m+12,t,d*3,.05); }   // 마법의 상행 글리산도
  noteAt(FLU,i,(m,len)=>{ flute(m,t,d*len*.95,.15); });                                                   // 플루트(아주 드문 선율)
}};

/* ---- 일본풍 (에도 시대 풍) : 기존 곡에서 무서운 느낌(반음 부딪힘·낮은 울림·날카로운 종)을 줄이고 더 따뜻하게 다듬었어요 ---- */
const KOTO=[[50,57,62,69],[43,50,55,62],[50,57,62,67],[45,52,59,64]];
const WA_MEL=[[0,74,5],[5,76,2],[7,74,1],[8,71,6],[14,69,2],[16,76,4],[20,74,4],[24,74,8],[32,81,4],[36,79,3],[39,76,1],[40,74,6],[46,71,2],[48,69,4],[52,71,2],[54,74,2],[56,74,8]];
function shaku(m,t,dur,vol){ const c=ctx(), o=c.createOscillator(), g=c.createGain(), l=c.createOscillator(), lg=c.createGain();
  o.type="sine"; o.frequency.setValueAtTime(midi(m-.6),t); o.frequency.exponentialRampToValueAtTime(midi(m),t+.14);
  l.frequency.value=4.4; lg.gain.value=midi(m)*.0035; l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.28); g.gain.setValueAtTime(vol,t+Math.max(.35,dur-.45)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(out()); const s=c.createGain(); s.gain.value=.4; g.connect(s); s.connect(echoBus()); o.start(t); l.start(t); o.stop(t+dur+.05); l.stop(t+dur+.05);
  hit(t,.2,vol*.1,2600,1.2,"bandpass"); }
const KOTO_PAT=[0,-1,1,-1,2,-1,3,-1];   // 코토를 조금 더 자주 울려 포근하게
const wa={bpm:62,div:2,len:64,play(i,t){
  const bar=i>>3,k=i&7,d=60/62/2,kt=KOTO[bar%4];
  if(KOTO_PAT[k]>=0){ const n=kt[KOTO_PAT[k]]+(KOTO_PAT[k]>=2?12:0); pluck(n,t,k===0?.3:.2,1.7); }
  if(k===7&&bar%2===1){ [76,74,71,69].forEach((m,j)=>pluck(m,t+j*.07,.13,1.1)); }              // 코토 글리산도(하행)
  if(k===0){ pad(kt[0]+12,t,d*16,.05); pad(kt[0]+19,t,d*16,.035); }                           // 높고 부드러운 드론(낮은 울림 제거)
  if(k===4&&bar%2===0) hit(t,.06,.14,1400,6,"bandpass");                                      // 츠즈미 풍 나무 소리(작게)
  if((bar===3&&k===6)||(bar===7&&k===4)) bell(86,t,d*8,.04);                                   // 풍경 소리(덜 날카롭게)
  noteAt(WA_MEL,i,(m,len)=>shaku(m,t,d*len*.97,.19));
}};

window.BGM_TRACKS={
  basic:{name:"기본",bpm:132,div:2,len:32,play:(i,t)=>bgmStep(i,t)},
  arcade:{name:"신나는 오락실",...arcade},
  rich:{name:"풍성한",...rich},
  wa:{name:"일본풍",...wa}
};
})();
