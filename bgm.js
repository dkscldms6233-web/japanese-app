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

/* ---- 신나는 오락실 (8비트) : 패미컴 풍. 펄스파 선율 + 빠른 아르페지오 + 삼각파 베이스 + 노이즈 드럼. C | G | Am | F | C | G | F | G7 ---- */
const AR_CH=[[60,64,67,72],[59,62,67,71],[57,60,64,69],[53,57,60,65],[60,64,67,72],[59,62,67,71],[53,57,60,65],[55,59,62,65]];
const AR_BASS=[48,43,45,41,48,43,41,43];
const AR_MEL=[
 [0,76,2],[2,79,2],[4,84,4],[8,79,2],[10,76,2],[12,79,4],
 [16,74,2],[18,79,2],[20,83,4],[24,79,2],[26,74,2],[28,79,4],
 [32,76,2],[34,81,2],[36,84,4],[40,81,2],[42,76,2],[44,81,4],
 [48,77,2],[50,81,2],[52,84,4],[56,81,2],[58,77,2],[60,72,4],
 [64,84,2],[66,79,2],[68,76,4],[72,79,2],[74,84,2],[76,88,4],
 [80,83,2],[82,79,2],[84,74,4],[88,79,2],[90,83,2],[92,86,4],
 [96,81,2],[98,77,2],[100,72,4],[104,77,2],[106,81,2],[108,84,4],
 [112,83,2],[114,86,2],[116,83,2],[118,79,2],[120,74,2],[122,79,2],[124,83,4]];
const AR_ARP=[0,1,2,1];
const arcade={bpm:168,div:4,len:128,play(i,t){
  const bar=i>>4,k=i&15,d=60/168/4,ch=AR_CH[bar];
  // 베이스(삼각파): 8분음표 위주, 마디 끝에서 다음 근음으로 걸어가요
  if(k%4===0||k===6||k===10) tone(AR_BASS[bar]+(k===6||k===10?12:0),t,d*(k%4===0?3:1.6),"triangle",1,out());
  if(k===14) tone(AR_BASS[(bar+1)%8]+(AR_BASS[(bar+1)%8]>AR_BASS[bar]?-1:1),t,d*1.8,"triangle",.8,out());
  // 화음 아르페지오(좁은 펄스파)
  chip(clampOct(ch[AR_ARP[k&3]],55,79),t,d*.9,.125,.045);
  // 노이즈 드럼
  if(k===0||k===8||(k===10&&bar%2)) chipKick(t); if(k===4||k===12) chipSnare(t,bar===7&&k===12?.7:.5); if(k%2===0) chipHat(t,k%4===2?.2:.12);
  if(bar===7&&k>=12) chipSnare(t,.3+.06*(k-12));
  noteAt(AR_MEL,i,(m,len)=>{ chip(m,t,d*len*.92,.5,.15); chip(m,t+.01,d*len*.9,.25,.04); });
}};
function clampOct(m,lo,hi){ while(m<lo) m+=12; while(m>hi) m-=12; return m; }

/* ---- 풍성한 (판타지) : Cmaj7 | Am9 | Fmaj7#11 | G6/9 | Cmaj7 | E♭maj7 | A♭maj7 | G7sus→G7
   v1의 부드러운 패드·아르페지오·에코 위에, 신비로운 빌려온 화음(♭III·♭VI)과 종소리·하프 글리산도를 더했어요 ---- */
const RC=[
 {b:48,up:[60,64,67,71]},{b:45,up:[60,64,67,71]},{b:41,up:[57,60,64,71]},{b:43,up:[59,62,64,69]},
 {b:48,up:[60,64,67,71]},{b:51,up:[58,62,67,74]},{b:44,up:[56,60,63,67]},{b:43,up:[60,62,65,67]}];
const RICH_MEL=[
 [0,76,6],[6,79,2],[8,83,4],[12,81,4],[16,81,6],[22,79,2],[24,76,4],[28,72,4],
 [32,77,4],[36,81,2],[38,83,2],[40,84,6],[46,81,2],[48,79,6],[54,76,2],[56,74,4],[60,71,4],
 [64,76,4],[68,79,2],[70,84,2],[72,83,4],[76,79,4],[80,79,4],[84,82,4],[88,86,6],[94,82,2],
 [96,84,4],[100,80,4],[104,79,4],[108,75,4],[112,74,4],[116,77,2],[118,74,2],[120,71,4],[124,74,4]];
const ARPP=[0,2,1,3,2,3,1,2, 0,2,1,3,2,1,3,2];
const MAGIC=[72,76,79,83,88,91];   // 하프 글리산도(C 계열 상행)
const rich={bpm:104,div:4,len:128,play(i,t){
  const bar=i>>4,k=i&15,d=60/104/4,c=RC[bar],nx=RC[(bar+1)%8];
  if(k===0) c.up.forEach(m=>pad(m+(bar>=5?0:12),t,d*16,.1));
  if(k===0) tone(c.b,t,d*6,"sine",1,out());
  if(k===8) tone(c.b+(bar%2?7:12),t,d*4,"sine",.8,out());
  if(k===14) tone(nx.b+(nx.b>c.b?-1:1),t,d*2,"sine",.6,out());
  tone(c.up[ARPP[k]]+12,t,d*2.2,"triangle",.17,out());
  if(k===0||k===8) kick(t,.55,true); if(k===4||k===12) snare(t,.2); if(k%2===0) hat(t,k%4===2?.15:.09);
  if(k===0) bell(c.up[3]+24,t,d*10,.1);                              // 반짝이는 종소리
  if(bar===3&&k>=12||bar===7&&k>=8){ const j=bar===3?k-12:(k-8)>>1; if(bar===3||(k-8)%2===0) pluck(MAGIC[Math.min(MAGIC.length-1,j)],t,.16,1.2); }  // 하프 글리산도
  noteAt(RICH_MEL,i,(m,len)=>{ lead(m,t,d*len*.95,"triangle",.23,.5); lead(m+12,t,d*len*.95,"sine",.05,.3); if(bar>=4) bell(m+12,t,d*len,.05); });
}};

/* ---- 일본풍 (에도 시대 · 전통 음악 풍) : 느리고 고요한 코토·샤쿠하치·북. 인센(陰旋) 음계 D·E♭·G·A·C, 80% 이상은 쉬는 소리 ---- */
const KOTO=[[50,57,62,69],[43,50,55,62],[50,57,62,67],[45,52,60,69]];
const WA_MEL=[[0,74,5],[5,72,2],[7,69,1],[8,67,6],[14,69,2],[16,72,4],[20,74,3],[23,75,1],[24,74,8],[32,81,4],[36,79,3],[39,74,1],[40,72,6],[46,69,2],[48,67,4],[52,69,2],[54,72,2],[56,74,8]];
function shaku(m,t,dur,vol){ const c=ctx(), o=c.createOscillator(), g=c.createGain(), l=c.createOscillator(), lg=c.createGain();
  o.type="sine"; o.frequency.setValueAtTime(midi(m-1.2),t); o.frequency.exponentialRampToValueAtTime(midi(m),t+.18);   // 아래에서 미끄러져 올라오는 숨소리
  l.frequency.value=4.6; lg.gain.value=midi(m)*.005; l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.35); g.gain.setValueAtTime(vol,t+Math.max(.4,dur-.5)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(out()); const s=c.createGain(); s.gain.value=.5; g.connect(s); s.connect(echoBus()); o.start(t); l.start(t); o.stop(t+dur+.05); l.stop(t+dur+.05);
  hit(t,.3,vol*.2,2600,1.2,"bandpass"); }
const KOTO_PAT=[0,-1,-1,2,-1,3,-1,1];   // 8분음표 8칸 중 울리는 칸(−1은 쉼)
const wa={bpm:56,div:2,len:64,play(i,t){
  const bar=i>>3,k=i&7,d=60/56/2,kt=KOTO[bar%4];
  if(KOTO_PAT[k]>=0){ const n=kt[KOTO_PAT[k]]+(KOTO_PAT[k]>=2?12:0); pluck(n,t,k===0?.3:.2,1.8); }
  if(k===7&&bar%2===1){ [74,72,69,67].forEach((m,j)=>pluck(m,t+j*.07,.14,1.2)); }          // 코토 글리산도(하행 쓸어내림)
  if(k===0){ pad(kt[0],t,d*16,.07); pad(kt[0]+7,t,d*16,.045); }                            // 낮고 고요한 드론
  if(k===0&&bar%4===0) kick(t,.5,true);                                                      // 먼 북소리
  if(k===4&&bar%2===0) hit(t,.07,.18,1200,6,"bandpass");                                     // 츠즈미 풍 나무 소리
  if((bar===2&&k===5)||(bar===6&&k===3)) bell(93,t,d*8,.06);                                  // 풍경 소리
  noteAt(WA_MEL,i,(m,len)=>shaku(m,t,d*len*.97,.19));
}};

window.BGM_TRACKS={
  basic:{name:"기본",bpm:132,div:2,len:32,play:(i,t)=>bgmStep(i,t)},
  arcade:{name:"신나는 오락실",...arcade},
  rich:{name:"풍성한",...rich},
  wa:{name:"일본풍",...wa}
};
})();
