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

/* ---- 신나는 오락실 : 8마디 C | G/B | Am7 | Em7 | F | C/E | Dm7 | G7sus4→G7 (파헬벨 풍 하행 베이스 + 마지막 도미넌트로 돌아옴) ---- */
const AR=[
 {b:48,nb:47,ch:[60,64,67]},        // C
 {b:47,nb:45,ch:[59,62,67]},        // G/B
 {b:45,nb:40,ch:[57,60,64,67]},     // Am7
 {b:40,nb:41,ch:[59,62,64,67]},     // Em7
 {b:41,nb:40,ch:[53,57,60,65]},     // F
 {b:40,nb:38,ch:[55,60,64]},        // C/E
 {b:38,nb:43,ch:[57,60,62,65]},     // Dm7
 {b:43,nb:48,ch:[55,60,62,65]}      // G7sus4 (뒤 반마디에서 G7)
];
const AR_MEL=[
 [0,76,2],[2,79,1],[3,84,1],[4,83,2],[6,79,2],
 [8,79,2],[10,83,1],[11,86,1],[12,84,2],[14,79,2],
 [16,81,2],[18,84,1],[19,81,1],[20,79,2],[22,76,2],
 [24,76,2],[26,79,1],[27,83,1],[28,86,2],[30,83,2],
 [32,84,2],[34,81,1],[35,84,1],[36,81,2],[38,77,2],
 [40,76,2],[42,79,1],[43,84,1],[44,79,2],[46,76,2],
 [48,77,2],[50,81,1],[51,84,1],[52,81,2],[54,77,2],
 [56,77,1],[57,79,1],[58,83,1],[59,79,1],[60,74,2],[62,71,2]];
const arcade={bpm:152,div:2,len:64,play(i,t){
  const bar=i>>3,k=i&7,d=60/152/2,c=AR[bar];
  // 베이스: 근음 · 옥타브 · 다음 마디 근음으로 반음 접근
  if(k===0||k===3||k===4) tone(c.b,t,d*1.6,"triangle",1,out());
  if(k===2||k===6) tone(c.b+12,t,d*1.2,"triangle",.8,out());
  if(k===7) tone(c.nb+(c.nb>c.b?-1:1),t,d*.9,"triangle",.7,out());
  // 드럼 (마지막 마디는 필인)
  if(k===0||k===4) kick(t,.8); if(bar===7){ if(k>=4) snare(t,.28+.05*k); else if(k===2) snare(t,.4); } else if(k===2||k===6) snare(t,.4); if(k%2===1) hat(t,.22);
  // 화음 아르페지오 (홀수 칸)
  if(k%2===1){ const ch=bar===7&&k>=5?[55,59,62,65]:c.ch; tone(clampOct(ch[(k>>1)%ch.length],58,76),t,d*1.1,"square",.06,out()); }
  noteAt(AR_MEL,i,(m,len)=>{ tone(m,t,d*len*.95,"square",.2,out()); tone(m-12,t,d*len*.95,"triangle",.05,out()); });
}};

/* ---- 풍성한 : 8마디 Cmaj9 | Am9 | Dm9 | G13 | Em7 | A7 | Dm7 | G7(b9) (재즈의 I–vi–ii–V · iii–VI–ii–V 턴어라운드, 보이스 리딩) ---- */
const RC=[
 {b:48,up:[64,67,71,74]},   // Cmaj9
 {b:45,up:[60,64,67,71]},   // Am9
 {b:50,up:[60,64,65,69]},   // Dm9
 {b:43,up:[59,64,65,69]},   // G13
 {b:52,up:[55,59,62,67]},   // Em7
 {b:45,up:[55,61,64,69]},   // A7
 {b:50,up:[57,60,62,65]},   // Dm7
 {b:43,up:[59,62,65,68]}    // G7(b9)
];
const RICH_MEL=[
 [0,76,4],[4,79,3],[7,77,1],[8,76,4],[12,74,4],
 [16,72,4],[20,76,3],[23,74,1],[24,72,4],[28,71,4],
 [32,69,4],[36,72,3],[39,74,1],[40,77,4],[44,76,4],
 [48,74,4],[52,71,2],[54,69,2],[56,67,4],[60,71,4],
 [64,76,4],[68,79,3],[71,78,1],[72,79,4],[76,83,4],
 [80,81,4],[84,76,2],[86,73,2],[88,76,4],[92,81,4],
 [96,77,4],[100,74,3],[103,72,1],[104,69,4],[108,72,4],
 [112,71,3],[115,68,1],[116,67,4],[120,68,2],[122,71,2],[124,74,4]];
const ARPP=[0,2,1,3,2,3,1,2, 0,2,1,3,2,1,3,2];
const rich={bpm:104,div:4,len:128,play(i,t){
  const bar=i>>4,k=i&15,d=60/104/4,c=RC[bar],nx=RC[(bar+1)%8];
  if(k===0) c.up.forEach(m=>pad(m,t,d*16,.09));
  // 베이스: 1박 근음, 3박 5도/옥타브, 마지막 16분에서 다음 근음으로 반음 접근
  if(k===0) tone(c.b,t,d*6,"sine",1,out());
  if(k===8) tone(c.b+(bar%2?7:12),t,d*4,"sine",.8,out());
  if(k===14) tone(nx.b+(nx.b>c.b?-1:1),t,d*2,"sine",.6,out());
  tone(c.up[ARPP[k]]+12,t,d*2.2,"triangle",.17,out());
  if(k===0||k===8||(k===10&&bar%2===1)) kick(t,.65,true);
  if(k===4||k===12) snare(t,.26); if(k%2===0) hat(t,k%4===2?.2:.12); if(bar===7&&k>=12) snare(t,.18);
  noteAt(RICH_MEL,i,(m,len)=>{ lead(m,t,d*len*.95,"triangle",.23,.5); lead(m+12,t,d*len*.95,"sine",.045,.3); });
}};

/* ---- 일본풍(세련) : 히라조시 음계 위에서 Am9 | Fmaj7 | Am9 | E(b2) | Fmaj7 | Cmaj7(no5) | Fmaj7 | E(b2) → A ---- */
const WC=[
 {b:45,ch:[57,60,64,71]},   // Am9
 {b:41,ch:[53,57,60,64]},   // Fmaj7
 {b:45,ch:[57,60,64,71]},   // Am9
 {b:40,ch:[52,59,65,69]},   // E(b2) 샤쿠하치 풍의 긴장
 {b:41,ch:[53,57,60,64]},   // Fmaj7
 {b:48,ch:[48,52,59,64]},   // Cmaj7(no5)
 {b:41,ch:[53,57,60,64]},   // Fmaj7
 {b:40,ch:[52,59,65,69]}    // E(b2)
];
const WA_MEL=[[0,76,4],[4,72,2],[6,69,2],[8,71,4],[12,72,4],[16,77,4],[20,76,2],[22,72,2],[24,71,6],[32,81,4],[36,77,2],[38,76,2],[40,72,4],[44,76,4],[48,77,4],[52,72,2],[54,71,2],[56,76,8]];
const WAP=[0,2,1,3,2,3,1,2];
const wa={bpm:92,div:2,len:64,play(i,t){
  const bar=i>>3,k=i&7,d=60/92/2,c=WC[bar];
  const idx=WAP[k], n=c.ch[idx]+(idx>=2?12:0);
  pluck(n,t,.2+(k===0?.1:0),1.1);
  if(k===0){ tone(c.b,t,d*7,"sine",.7,out()); pad(c.ch[0]+12,t,d*8,.06); pad(c.ch[2]+12,t,d*8,.05); }
  if(k===0&&bar%2===0) kick(t,.5,true);
  if((k===3||k===7)&&bar%2===1) hit(t,.045,.2,2200,6,"bandpass");
  if(k%2===1) hat(t,.09);
  noteAt(WA_MEL,i,(m,len)=>flute(m,t,d*len*.95,.2));
}};
window.BGM_TRACKS={
  basic:{name:"기본",desc:"가볍고 경쾌한 기본 반주",bpm:132,div:2,len:32,play:(i,t)=>bgmStep(i,t)},
  arcade:{name:"신나는 오락실",desc:"빠르고 통통 튀는 게임 음악. 하행 베이스 진행(C–G/B–Am7–Em7–F–C/E–Dm7–G7)과 마지막 마디 드럼 필인",...arcade},
  rich:{name:"풍성한",desc:"재즈 코드(Cmaj9–Am9–Dm9–G13–Em7–A7–Dm7–G7b9)와 아르페지오, 에코가 겹친 꽉 찬 소리",...rich},
  wa:{name:"일본풍 (세련)",desc:"히라조시 음계의 코토 같은 퉁김과 피리 선율, 잔잔한 북. 모던한 일본 분위기",...wa}
};
})();
