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

/* ---- 신나는 오락실 (8비트) : 새로 작곡. 마이너 키의 질주하는 영웅 테마. Am | F | C | G | Am | F | G | E7 (A마이너 · 안달루시아 풍 끝맺음)
   펄스파 선율의 옥타브 도약 + 16분 아르페지오 + 쉬지 않는 베이스 + 4박 드럼 ---- */
const AR_CH=[[57,60,64,69],[53,57,60,65],[60,64,67,72],[55,59,62,67],[57,60,64,69],[53,57,60,65],[55,59,62,67],[52,56,59,62]];
const AR_BASS=[45,41,48,43,45,41,43,40];
const AR_MEL=[
 [0,81,2],[2,76,2],[4,81,2],[6,84,2],[8,83,2],[10,81,2],[12,76,4],
 [16,81,2],[18,77,2],[20,81,2],[22,84,2],[24,86,2],[26,84,2],[28,81,4],
 [32,79,2],[34,76,2],[36,79,2],[38,84,2],[40,83,2],[42,79,2],[44,76,4],
 [48,74,2],[50,79,2],[52,83,2],[54,86,2],[56,83,2],[58,79,2],[60,74,4],
 [64,88,2],[66,84,2],[68,81,2],[70,84,2],[72,88,4],[76,84,4],
 [80,89,2],[82,84,2],[84,81,2],[86,84,2],[88,89,4],[92,84,4],
 [96,86,2],[98,83,2],[100,79,2],[102,83,2],[104,86,4],[108,83,4],
 [112,83,2],[114,80,2],[116,83,2],[118,88,2],[120,86,2],[122,83,2],[124,80,4]];
const AR_ARP=[0,1,2,3,2,1,2,1];
const arcade={bpm:176,div:4,len:128,play(i,t){
  const bar=i>>4,k=i&15,d=60/176/4,ch=AR_CH[bar],r=AR_BASS[bar];
  // 쉬지 않고 달리는 베이스(삼각파): 8분음표, 4번째마다 옥타브, 마디 끝에서 다음 근음으로 반음 접근
  if(k%2===0) tone(r+(k%8===6?12:0),t,d*1.7,"triangle",1,out());
  if(k===15){ const nr=AR_BASS[(bar+1)%8]; tone(nr+(nr>r?-1:1),t,d*1.2,"triangle",.8,out()); }
  chip(clampOct(ch[AR_ARP[k&7]],55,81),t,d*.85,.125,.04);                  // 16분 아르페지오
  if(k%8===0) chipKick(t); if(k%8===4) chipSnare(t,.55); if(k===10&&bar%2===1) chipKick(t);
  if(k%2===0) chipHat(t,k%4===2?.22:.12);
  if(bar===7&&k>=12) chipSnare(t,.3+.07*(k-12));
  noteAt(AR_MEL,i,(m,len)=>{ chip(m,t,d*len*.9,.5,.14); chip(m+12,t,d*len*.5,.125,.025); });
}};
function clampOct(m,lo,hi){ while(m<lo) m+=12; while(m>hi) m-=12; return m; }

/* ---- 풍성한 (판타지) : 새로 작곡. D장조 · Dmaj9 | A/C# | Bm9 | Gmaj7#11 | Dmaj9 | C(♭VII) | G/B | A7sus4→A7
   현악 패드 + 합창 같은 목소리 패드 + 하프 아르페지오 + 첼레스타(종) 선율 + 팀파니. 빌려온 ♭VII 화음이 '마법' 같은 느낌 ---- */
function choir(m,t,dur,vol){ const c=ctx(), g=c.createGain(), f=c.createBiquadFilter(), l=c.createOscillator(), lg=c.createGain(); f.type="lowpass"; f.frequency.value=1500;
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+dur*.4); g.gain.linearRampToValueAtTime(.0001,t+dur); l.frequency.value=5; lg.gain.value=midi(m)*.004; l.connect(lg);
  [-5,0,5].forEach(det=>{ const o=c.createOscillator(); o.type="sawtooth"; o.frequency.value=midi(m); o.detune.value=det; lg.connect(o.frequency); o.connect(f); o.start(t); o.stop(t+dur+.05); });
  l.start(t); l.stop(t+dur+.05); f.connect(g); g.connect(out()); }
const RC=[
 {b:50,up:[66,69,73,76]},{b:49,up:[64,69,73,76]},{b:47,up:[62,66,69,73]},{b:43,up:[62,66,71,73]},
 {b:50,up:[66,69,73,76]},{b:48,up:[64,67,72,76]},{b:47,up:[62,67,71,74]},{b:45,up:[62,64,67,69]}];
const A7=[61,64,67,69];
const RICH_MEL=[
 [0,78,6],[6,81,2],[8,85,4],[12,83,4],
 [16,81,6],[22,78,2],[24,76,4],[28,73,4],
 [32,74,4],[36,78,2],[38,81,2],[40,83,6],[46,81,2],
 [48,83,4],[52,85,4],[56,81,4],[60,78,4],
 [64,86,6],[70,85,2],[72,81,4],[76,78,4],
 [80,84,6],[86,79,2],[88,76,4],[92,79,4],
 [96,83,4],[100,86,4],[104,83,4],[108,79,4],
 [112,81,4],[116,85,2],[118,88,2],[120,85,4],[124,81,4]];
const HP=[0,1,2,3,2,1,3,2, 0,1,2,3,1,2,3,2];
const rich={bpm:92,div:4,len:128,play(i,t){
  const bar=i>>4,k=i&15,d=60/92/4,c=RC[bar],nx=RC[(bar+1)%8], up=(bar===7&&k>=8)?A7:c.up;
  if(k===0){ c.up.forEach(m=>pad(m-12,t,d*16,.08)); choir(c.up[0],t,d*16,.022); choir(c.up[2],t,d*16,.018); }   // 현악 + 합창 패드
  if(k===0) tone(c.b,t,d*6,"sine",1,out());
  if(k===8) tone(c.b+(bar%2?7:12),t,d*4,"sine",.8,out());
  if(k===14) tone(nx.b+(nx.b>c.b?-1:1),t,d*2,"sine",.55,out());
  pluck(up[HP[k]]+(k%4===3?12:0),t,.12,1.4);                                // 하프 아르페지오
  if(k===0&&(bar===0||bar===4)) kick(t,.6,true);                            // 팀파니
  if(bar===7&&k>=12) kick(t,.25+.12*(k-12),true);
  if(k%4===2) hat(t,.07);
  if(k===0) bell(up[3]+24,t,d*10,.08);                                      // 반짝이는 종소리
  noteAt(RICH_MEL,i,(m,len)=>{ lead(m,t,d*len*.95,"triangle",.21,.5); bell(m+12,t,d*len,.07); });
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
