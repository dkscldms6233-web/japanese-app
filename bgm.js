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

/* ---- 신나는 오락실 ---- */
const AR_MEL=[72,0,76,79,84,79,76,0, 74,0,79,83,86,83,79,0, 76,0,81,84,81,79,76,0, 77,81,84,81,77,74,72,0];
const AR_BASS=[36,43,45,41];
const arcade={bpm:152,div:2,len:32,play(i,t){
  const bar=i>>3,k=i&7,d=60/152/2, r=AR_BASS[bar];
  if(k===0||k===3||k===4||k===7) tone(r+(k===7?12:0),t,d*1.5,"triangle",1,out());
  if(k===0||k===4) kick(t,.8); if(k===2||k===6) snare(t,.4); if(k%2===1) hat(t,.25);
  if(k%2===0) tone(AR_MEL[i]?AR_MEL[i]-12:0,t,d*.9,"square",.07,out());
  const m=AR_MEL[i]; if(m) tone(m,t,d*1.5,"square",.2,out());
}};
/* ---- 풍성한 ---- */
const RICH_CH=[[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,55,59]];
const RICH_MEL=[[0,76,6],[6,79,2],[8,83,4],[12,81,4],[16,81,6],[22,79,2],[24,76,4],[28,72,4],[32,77,6],[38,81,2],[40,84,4],[44,81,4],[48,79,4],[52,83,2],[54,86,2],[56,84,4],[60,79,4]];
const ARP=[0,2,1,3,2,3,1,2, 0,2,1,3,2,1,3,2];
const rich={bpm:108,div:4,len:64,play(i,t){
  const bar=i>>4,k=i&15,d=60/108/4,ch=RICH_CH[bar];
  if(k===0) ch.forEach(m=>pad(m+12,t,d*16,.11));
  if(k===0||k===6||k===10) tone(ch[0]-12,t,d*(k===0?6:3),"sine",1.0,out());
  tone(ch[ARP[k]]+12,t,d*2.2,"triangle",.2,out());
  if(k===0||k===8) kick(t,.7,true); if(k===4||k===12) snare(t,.28); if(k%2===0) hat(t,.16);
  RICH_MEL.forEach(([s,m,len])=>{ if(s===i){ lead(m,t,d*len*.95,"triangle",.24,.5); lead(m+12,t,d*len*.95,"sine",.05,.3); } });
}};
/* ---- 일본풍(세련) : 음계는 히라조시(A·B·C·E·F), 코토 풍 플럭 + 샤쿠하치 풍 선율 ---- */
const WA_ARP=[[57,64,69,72,69,64,72,69],[57,64,69,71,69,64,71,69],[53,60,65,69,65,60,69,65],[52,59,64,71,64,59,71,64],[57,64,69,72,69,64,72,76],[60,64,69,72,69,64,72,69],[53,60,65,69,65,60,69,65],[52,59,64,69,64,59,71,64]];
const WA_MEL=[[0,76,4],[4,72,2],[6,69,2],[8,71,4],[12,72,4],[16,77,4],[20,76,2],[22,72,2],[24,71,6],[32,81,4],[36,77,2],[38,76,2],[40,72,4],[44,76,4],[48,77,4],[52,72,2],[54,71,2],[56,69,8]];
const wa={bpm:92,div:2,len:64,play(i,t){
  const bar=i>>3,k=i&7,d=60/92/2;
  pluck(WA_ARP[bar][k],t,.22+(k===0?.08:0),1.1);
  if(k===0&&bar%2===0){ pad(45,t,d*16,.08); pad(52,t,d*16,.06); }
  if(k===0&&(bar===0||bar===2||bar===4||bar===6)) kick(t,.55,true);
  if((k===3||k===7)&&bar%2===1) hit(t,.045,.22,2200,6,"bandpass");
  if(k%2===1) hat(t,.1);
  WA_MEL.forEach(([s,m,len])=>{ if(s===i) flute(m,t,d*len*.95,.2); });
}};
window.BGM_TRACKS={
  basic:{name:"기본",desc:"가볍고 경쾌한 기본 반주",bpm:132,div:2,len:32,play:(i,t)=>bgmStep(i,t)},
  arcade:{name:"신나는 오락실",desc:"빠르고 통통 튀는 게임 음악. 베이스와 드럼이 있어요",...arcade},
  rich:{name:"풍성한",desc:"화음과 아르페지오, 울림(에코)이 겹쳐진 부드럽고 꽉 찬 소리",...rich},
  wa:{name:"일본풍 (세련)",desc:"코토 같은 퉁김과 대나무 피리 선율, 잔잔한 북. 모던한 일본 분위기",...wa}
};
})();
