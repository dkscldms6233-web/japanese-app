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

/* ---- 공통: 코드 진행(마디마다 베이스 · 화음) + 선율을 칸 단위로 재생하는 도우미 ---- */
const noteAt=(list,i,fn)=>{ for(const n of list) if(n[0]===i) fn(n[1],n[2]); };
const clampOct=(m,lo,hi)=>{ while(m<lo) m+=12; while(m>hi) m-=12; return m; };

/* 악기 보조: 종소리(글로켄슈필), 바이올린 */
function bell(m,t,dur,vol){ const c=ctx(), g=c.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.004); g.gain.exponentialRampToValueAtTime(.0001,t+Math.min(dur,1.2));
  [[1,1],[2.76,.25],[5.4,.08]].forEach(([mul,v])=>{ const o=c.createOscillator(), gg=c.createGain(); o.type="sine"; o.frequency.value=midi(m)*mul; gg.gain.value=v; o.connect(gg); gg.connect(g); o.start(t); o.stop(t+1.3); });
  g.connect(out()); const s=c.createGain(); s.gain.value=.35; g.connect(s); s.connect(echoBus()); }
function violin(m,t,dur,vol){ const c=ctx(), o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain(), l=c.createOscillator(), lg=c.createGain(); o.type="sawtooth"; o.frequency.value=midi(m); f.type="lowpass"; f.frequency.value=2000;
  l.frequency.value=5.4; lg.gain.value=midi(m)*.0045; l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(vol,t+.16); g.gain.setValueAtTime(vol,t+Math.max(.2,dur-.2)); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(f); f.connect(g); g.connect(out()); const s=c.createGain(); s.gain.value=.45; g.connect(s); s.connect(echoBus()); o.start(t); l.start(t); o.stop(t+dur+.05); l.stop(t+dur+.05); }

/* ---- 신나는 오락실 : 단순하게. C | G/B | Am7 | Em7 | F | C/E | Dm7 | G7 — 하행 베이스 + 마디당 두 음의 선율 + 드럼 ---- */
const AR=[
 {b:48,nb:47},{b:47,nb:45},{b:45,nb:40},{b:40,nb:41},{b:41,nb:40},{b:40,nb:38},{b:38,nb:43},{b:43,nb:48}];
const AR_MEL=[[0,79,3],[4,76,3],[8,79,3],[12,74,3],[16,76,3],[20,72,3],[24,76,3],[28,71,3],[32,77,3],[36,81,3],[40,79,3],[44,76,3],[48,74,3],[52,77,3],[56,79,6]];
const arcade={bpm:144,div:2,len:64,play(i,t){
  const bar=i>>3,k=i&7,d=60/144/2,c=AR[bar];
  if(k===0||k===3||k===4) tone(c.b,t,d*1.6,"triangle",1,out());
  if(k===2||k===6) tone(c.b+12,t,d*1.2,"triangle",.75,out());
  if(k===7) tone(c.nb+(c.nb>c.b?-1:1),t,d*.9,"triangle",.65,out());
  if(k===0||k===4) kick(t,.8); if(bar===7&&k>=5) snare(t,.3+.05*k); else if(k===2||k===6) snare(t,.38); if(k%2===1) hat(t,.2);
  noteAt(AR_MEL,i,(m,len)=>{ tone(m,t,d*len*.95,"square",.19,out()); });
}};

/* ---- 풍성한 : 모험·판타지(마을·들판 테마 풍). 6/8박자 16마디. 하프 아르페지오 + 피치카토 베이스 + 플루트·종소리 선율 + 현악 패드
   A: C | Am | F | G | C | Em | Dm7 | G7  /  B: F | C/E | Dm7 | B♭(차용화음) | F | Gsus4 | Am7 | G7 — 오리지널 곡이에요 ---- */
const RQ=[
 {b:48,h:[60,64,67,72]},{b:45,h:[57,60,64,69]},{b:41,h:[53,57,60,65]},{b:43,h:[55,59,62,67]},
 {b:48,h:[60,64,67,72]},{b:52,h:[59,62,64,67]},{b:50,h:[57,60,62,65]},{b:43,h:[55,59,62,65]},
 {b:41,h:[53,57,60,65]},{b:52,h:[55,60,64,67]},{b:50,h:[57,60,62,65]},{b:46,h:[58,62,65,70]},
 {b:41,h:[53,57,60,65]},{b:43,h:[55,60,62,67]},{b:45,h:[57,60,64,67]},{b:43,h:[55,59,62,65]}];
const RQ_MEL=[
 [0,79,3],[3,76,2],[5,74,1], [6,72,3],[9,69,2],[11,72,1], [12,69,3],[15,72,2],[17,77,1], [18,74,6],
 [24,79,3],[27,84,2],[29,79,1], [30,83,3],[33,79,2],[35,76,1], [36,77,3],[39,74,2],[41,77,1], [42,74,3],[45,71,3],
 [48,84,3],[51,81,2],[53,77,1], [54,79,3],[57,76,3], [60,81,3],[63,77,2],[65,74,1], [66,82,3],[69,77,3],
 [72,84,3],[75,81,2],[77,84,1], [78,83,3],[81,79,3], [84,81,3],[87,79,2],[89,76,1], [90,74,3],[93,71,2],[95,74,1]];
const HARP=[0,1,2,3,2,1];
const rich={bpm:70,div:3,len:96,play(i,t){
  const bar=(i/6)|0,k=i%6,d=60/70/3,c=RQ[bar],sec=bar>=8;
  tone(clampOct(c.h[HARP[k]],57,84),t,d*2.2,"triangle",.17,out());   // 하프 풍 아르페지오
  pluck(c.h[HARP[k]]+(k%3===0?12:0),t,.08,.9);
  if(k===0||k===3) tone(c.b,t,d*1.1,"triangle",k===0?1:.8,out());      // 피치카토 베이스
  if(k===0){ c.h.slice(1).forEach(m=>pad(m-12,t,d*6,.05)); }
  if(k===0&&(bar===0||bar===8)) kick(t,.45,true);
  if(k===1||k===2||k===4||k===5) hat(t,.06);
  noteAt(RQ_MEL,i,(m,len)=>{ flute(m,t,d*len*.95,.19); if(sec) bell(m+12,t,d*len,.11); else if(len>=3&&bar%2===0) bell(m+12,t,d*len,.05); });
}};

/* ---- 일본풍 (지브리 + 전통) : 앞 8마디는 지브리 풍(피아노 아르페지오·현악 선율, C | G/B | Am7 | Em7 | Fmaj7 | Dm7 | G6 | Gsus4),
   뒤 8마디는 전통 풍(코토·샤쿠하치·북, 히라조시 음계 위 Am9 | Fmaj7 | Am9 | E(b2) | Fmaj7 | Cmaj7(no5) | Fmaj7 | E(b2)) — 오리지널 곡이에요 ---- */
const GH=[
 {b:48,t:[48,55,60,64,67]},{b:47,t:[47,55,59,62,67]},{b:45,t:[45,52,60,64,67]},{b:40,t:[52,59,62,64,67]},
 {b:41,t:[41,53,57,60,64]},{b:50,t:[50,57,60,65,69]},{b:43,t:[43,55,59,62,64]},{b:43,t:[43,55,60,62,67]}];
const GH_MEL=[[0,79,3],[3,76,1],[4,74,2],[6,72,2],[8,71,3],[11,74,1],[12,79,4],[16,81,3],[19,79,1],[20,76,2],[22,72,2],[24,76,4],[28,74,2],[30,71,2],
 [32,77,3],[35,81,1],[36,84,4],[40,81,3],[43,77,1],[44,74,2],[46,77,2],[48,79,3],[51,76,1],[52,74,2],[54,71,2],[56,74,4],[60,76,4]];
const GHP=[0,2,3,4,3,2,4,3];
const WC=[
 {b:45,ch:[57,60,64,71]},{b:41,ch:[53,57,60,64]},{b:45,ch:[57,60,64,71]},{b:40,ch:[52,59,65,69]},
 {b:41,ch:[53,57,60,64]},{b:48,ch:[48,52,59,64]},{b:41,ch:[53,57,60,64]},{b:40,ch:[52,59,65,69]}];
const WA_MEL=[[0,76,4],[4,72,2],[6,69,2],[8,71,4],[12,72,4],[16,77,4],[20,76,2],[22,72,2],[24,71,6],[32,81,4],[36,77,2],[38,76,2],[40,72,4],[44,76,4],[48,77,4],[52,72,2],[54,71,2],[56,76,8]];
const WAP=[0,2,1,3,2,3,1,2];
const wa={bpm:84,div:2,len:128,play(i,t){
  const bar=i>>3,k=i&7,d=60/84/2;
  if(bar<8){                                    // 지브리 풍
    const c=GH[bar], n=c.t[GHP[k]];
    pluck(n,t,.17+(k===0?.06:0),1.3);
    if(k===0||k===4) tone(c.b,t,d*(k===0?4:3),"sine",.7,out());
    if(k===0){ pad(c.t[2],t,d*8,.055); pad(c.t[3],t,d*8,.045); }
    if(k===3||k===7) hat(t,.045);
    noteAt(GH_MEL,i,(m,len)=>violin(m,t,d*len*.97,.13));
  } else {                                      // 전통 풍
    const j=i-64, b2=bar-8, c=WC[b2], kk=k, idx=WAP[kk], n=c.ch[idx]+(idx>=2?12:0);
    pluck(n,t,.2+(kk===0?.1:0),1.1);
    if(kk===0){ tone(c.b,t,d*7,"sine",.7,out()); pad(c.ch[0]+12,t,d*8,.06); pad(c.ch[2]+12,t,d*8,.05); }
    if(kk===0&&b2%2===0) kick(t,.5,true);
    if((kk===3||kk===7)&&b2%2===1) hit(t,.045,.2,2200,6,"bandpass");
    if(kk%2===1) hat(t,.08);
    noteAt(WA_MEL,j,(m,len)=>flute(m,t,d*len*.95,.2));
  }
}};
window.BGM_TRACKS={
  basic:{name:"기본",desc:"가볍고 경쾌한 기본 반주",bpm:132,div:2,len:32,play:(i,t)=>bgmStep(i,t)},
  arcade:{name:"신나는 오락실",desc:"간단하고 통통 튀는 게임 음악. 하행 베이스와 드럼, 마디마다 두 음만 쓰는 담백한 선율",...arcade},
  rich:{name:"풍성한 (모험·판타지)",desc:"6/8박자 모험 테마. 하프 아르페지오, 피치카토 베이스, 플루트와 종소리 선율, 현악 패드. 젤다·메이플 같은 분위기의 오리지널 곡",...rich},
  wa:{name:"일본풍 (지브리 + 전통)",desc:"앞은 지브리 같은 피아노·바이올린의 서정적인 선율, 뒤는 코토·피리·북의 전통 분위기. 오리지널 곡",...wa}
};
})();
