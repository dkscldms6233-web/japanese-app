/* 애니로 배우기 — 애니메이션 속 말투를 한 줄씩 공부하고 따라 말해 보는 곳
 *
 * - '명대사' 유형: 널리 알려진 짧은 대사를 학습용으로 인용하고 작품명·캐릭터·링크 출처를 적었어요(저작권은 각 권리자에게 있어요).
 *   장면 사진은 쓰지 않고, 이 앱에서 직접 그린 일러스트(실제 장면 아님)를 보여 줘요.
 * - 새 문장은 아래 LINES 에 { t:유형, ja:후리가나표기, ko:번역, note:말투 설명 } 형식으로 늘리면 돼요.
 *   명대사는 src:{w:작품명, c:캐릭터, wiki:위키 검색어}, fx:그림 효과(유형 키)를 더 적어요.
 * - 후리가나 표기: 漢字[よみ]  (한자 덩어리 바로 뒤에 [읽기])
 */
(function(){
const TYPES=[
 ["famous","명대사(출처)"]
];
const LINES=[
 /* 명대사 (출처 표기) */
 {t:"famous",fx:"hot",ja:"海賊王[かいぞくおう]に、おれはなる!",ko:"해적왕이 될 거야, 나는!",note:"「おれは海賊王になる」의 어순을 뒤집어(도치) 의지를 강하게 강조한 말투예요.",src:{w:"ONE PIECE",c:"モンキー・D・ルフィ",wiki:"ONE PIECE"}},
 {t:"famous",fx:"hot",ja:"諦[あきら]めたらそこで試合終了[しあいしゅうりょう]ですよ。",ko:"포기하면 그 순간 시합 종료예요.",note:"〜たら = ~하면, そこで = 바로 그 시점에서. 스승이 조용히 타이르는 정중한 말투(ですよ).",src:{w:"SLAM DUNK",c:"安西先生",wiki:"SLAM DUNK"}},
 {t:"famous",fx:"hot",ja:"オラ、ワクワクすっぞ!",ko:"오라, 두근두근하는구먼!",note:"オラ = 나(시골 사투리 느낌), すっぞ = するぞ의 줄임. 강한 상대를 만났을 때의 설렘을 나타내요.",src:{w:"ドラゴンボール",c:"孫悟空",wiki:"ドラゴンボール"}},
 {t:"famous",fx:"hot",ja:"オレは自分[じぶん]の言葉[ことば]は曲[ま]げねぇ。それがオレの忍道[にんどう]だ!",ko:"나는 내 말을 번복하지 않아. 그게 나의 닌자의 길이다!",note:"曲げねぇ = 曲げない의 거친 말투(ない→ねぇ). 忍道 = 닌자로서의 신념.",src:{w:"NARUTO -ナルト-",c:"うずまきナルト",wiki:"NARUTO -ナルト-"}},
 {t:"famous",fx:"help",ja:"俺[おれ]が長男[ちょうなん]だから我慢[がまん]できたけど、次男[じなん]だったら我慢[がまん]できなかった。",ko:"내가 장남이니까 참았지, 차남이었으면 못 참았을 거야.",note:"〜だから…できた / 〜だったら…できなかった 가정(〜たら)과 이유(から)를 대비해서 말해요.",src:{w:"鬼滅の刃",c:"竈門炭治郎",wiki:"鬼滅の刃"}},
 {t:"famous",fx:"hot",ja:"逃[に]げちゃダメだ。",ko:"도망치면 안 돼.",note:"〜ちゃ = 〜ては의 줄임말(구어). 〜ちゃダメ = ~하면 안 된다. 스스로를 다그치는 말이에요.",src:{w:"新世紀エヴァンゲリオン",c:"碇シンジ",wiki:"新世紀エヴァンゲリオン"}},
 {t:"famous",fx:"help",ja:"一度[いちど]あったことは忘[わす]れないものさ、思[おも]い出[だ]せないだけで。",ko:"한 번 있었던 일은 잊히지 않는 법이란다, 기억해 내지 못할 뿐이지.",note:"〜ものさ = ~인 법이란다(타이르는 말투). 思い出せない = 思い出す의 가능형 부정.",src:{w:"千と千尋の神隠し",c:"銭婆(제니바)",wiki:"千と千尋の神隠し"}},
 {t:"famous",fx:"love",ja:"君[きみ]の名前[なまえ]は?",ko:"네 이름은?",note:"君 = 너(친근하고 부드러운 말). 名前は? 하나로 이름을 묻는 짧은 구어 질문이에요.",src:{w:"君の名は。",c:"타키와 미츠하",wiki:"君の名は。"}},
 {t:"famous",fx:"rival",ja:"駆逐[くちく]してやる!この世[よ]から…一匹[いっぴき]残[のこ]らず!",ko:"몰살해 주겠어! 이 세상에서… 한 마리도 남김없이!",note:"〜てやる = ~해 주겠다(강한 적의). 〜残らず = 하나도 남김없이. 一匹 = 짐승을 세는 말.",src:{w:"進撃の巨人",c:"エレン・イェーガー",wiki:"進撃の巨人"}},
 {t:"famous",fx:"hot",ja:"大丈夫[だいじょうぶ]、僕[ぼく]、最強[さいきょう]だから。",ko:"괜찮아, 나, 최강이니까.",note:"僕 = 남자의 부드러운 '나'. 〜から로 이유를 가볍게 단언하는 여유가 매력이에요.",src:{w:"呪術廻戦",c:"五条悟",wiki:"呪術廻戦"}},
 {t:"famous",fx:"react",ja:"わくわく!",ko:"두근두근!",note:"わくわく = 설렘을 나타내는 의태어. 〜する를 붙여 わくわくする(두근거리다)도 돼요.",src:{w:"SPY×FAMILY",c:"アーニャ・フォージャー",wiki:"SPY×FAMILY"}},
 {t:"famous",fx:"rival",ja:"真実[しんじつ]はいつもひとつ!",ko:"진실은 언제나 하나!",note:"いつも = 언제나. 〜は〜ひとつ 로 단정하는 추리물의 결정적 한마디예요.",src:{w:"名探偵コナン",c:"江戸川コナン",wiki:"名探偵コナン"}},
 {t:"famous",fx:"hot",ja:"月[つき]に代[か]わっておしおきよ!",ko:"달을 대신해서 벌을 내리겠어!",note:"〜に代わって = ~을 대신해서. おしおき = 벌주기. 〜よ는 여성스러운 말끝.",src:{w:"美少女戦士セーラームーン",c:"月野うさぎ(세일러문)",wiki:"美少女戦士セーラームーン"}},
 {t:"famous",fx:"help",ja:"絶対[ぜったい]だいじょうぶだよ。",ko:"틀림없이 괜찮을 거야.",note:"絶対 = 절대·틀림없이. 상대를 안심시키는 부드러운 〜だよ 말끝이에요.",src:{w:"カードキャプターさくら",c:"木之本桜",wiki:"カードキャプターさくら"}},
 {t:"famous",fx:"tsun",ja:"ただの人間[にんげん]には興味[きょうみ]ありません。",ko:"평범한 인간에게는 흥미 없습니다.",note:"〜には興味がありません의 が가 빠진 구어. 정중체(ません)인데 말은 당당한 것이 포인트예요.",src:{w:"涼宮ハルヒの憂鬱",c:"涼宮ハルヒ",wiki:"涼宮ハルヒの憂鬱"}},
 {t:"famous",fx:"chu2",ja:"これもシュタインズ・ゲートの選択[せんたく]だ。",ko:"이것도 슈타인즈 게이트의 선택이다.",note:"これも = 이것도. 〜の選択だ 로 운명을 받아들이는 중2병 스타일의 체념이에요.",src:{w:"STEINS;GATE",c:"岡部倫太郎",wiki:"STEINS;GATE"}},
 {t:"famous",fx:"react",ja:"親父[おやじ]にもぶたれたことないのに!",ko:"아버지한테도 맞아 본 적 없는데!",note:"〜たことがない = ~한 적이 없다. ぶたれる = 맞다(수동). 親父 = 아버지(거친 말).",src:{w:"機動戦士ガンダム",c:"アムロ・レイ",wiki:"機動戦士ガンダム"}},
 {t:"famous",fx:"chu2",ja:"やれやれだぜ。",ko:"이거 참, 못 말리겠군.",note:"やれやれ = 어이없을 때의 한숨 소리. 〜だぜ는 남자가 폼 잡을 때의 말끝이에요.",src:{w:"ジョジョの奇妙な冒険",c:"空条承太郎",wiki:"ジョジョの奇妙な冒険"}},
 {t:"famous",fx:"rival",ja:"お前[まえ]はもう死[し]んでいる。",ko:"너는 이미 죽어 있다.",note:"もう = 이미. 死んでいる = 죽어 있는 상태(〜ている 결과 상태).",src:{w:"北斗の拳",c:"ケンシロウ",wiki:"北斗の拳"}},
 {t:"famous",fx:"hot",ja:"私[わたし]が来[き]た!",ko:"내가 왔다!",note:"来た = 来る의 과거형. 구하러 온 영웅의 등장 대사로, 짧은 문장에 안도감이 담겨요.",src:{w:"僕のヒーローアカデミア",c:"オールマイト",wiki:"僕のヒーローアカデミア"}},
];
LINES.forEach((l,i)=>{ l.id="an"+i; l.text=plain(l.ja); });

const ST=document.createElement("style");
ST.textContent=`.an-wrap{max-width:720px;margin:0 auto}
.an-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.an-tabs.sc{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px}.an-tabs .pill{white-space:nowrap}
.an-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px;margin-bottom:12px}
.an-card.done{border-color:#4c9a62}
.an-ja{font-size:22px;line-height:2.1;font-weight:700}.an-ko{color:var(--sub);margin:2px 0 6px}
.an-note{font-size:13px;color:var(--sub);background:var(--chip);border-radius:10px;padding:8px 10px;margin:8px 0}
.an-act{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px}
.an-res{margin-top:8px;font-size:14px}.an-res b{font-size:18px}
.an-blank{display:inline-block;min-width:3em;border-bottom:3px solid var(--accent);color:var(--accent);text-align:center}
.an-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.an-opts .opt{font-size:18px;padding:12px 8px}
.an-type{font-size:12px;color:var(--sub)}
.an-art{display:block;width:100%;max-width:340px;height:auto;border-radius:10px;margin:0 auto 8px}
.an-src{font-size:13px;margin:6px 0;color:var(--text)}.an-src a{color:var(--accent);text-decoration:underline}
.an-hero{border:1px solid var(--line);border-radius:12px;padding:12px 14px;margin:8px 0}
.an-hs{font-size:13px;color:var(--sub);margin-bottom:8px}
.an-ty{animation:anTy 1.1s steps(18) both}
@keyframes anTy{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.an-hud{display:flex;justify-content:space-between;font-weight:700;font-size:16px;margin:6px 2px}
.an-grade{display:inline-block;float:right;width:46px;height:46px;line-height:46px;text-align:center;border-radius:50%;font-size:26px;font-weight:900;color:#fff;animation:anPop .5s cubic-bezier(.2,1.6,.4,1) both}
.an-grade.big{float:none;width:90px;height:90px;line-height:90px;font-size:52px;margin-bottom:6px}
.an-grade.gS{background:linear-gradient(135deg,#ff9f1c,#ff3d6e);box-shadow:0 0 14px #ff9f1c}.an-grade.gA{background:#4c9a62}.an-grade.gB{background:#3b82c4}.an-grade.gC{background:#8a8f98}
@keyframes anPop{from{transform:scale(0) rotate(-40deg)}to{transform:scale(1) rotate(0)}}
.an-dex{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.an-tile{background:var(--card);border:1px dashed var(--line);border-radius:12px;padding:10px;text-align:left;color:var(--sub);display:flex;flex-direction:column;gap:4px;font:inherit}
.an-tile.on{border:1px solid var(--accent);color:var(--text);cursor:pointer}.an-tile b{font-size:12px;color:var(--accent)}.an-tile span{font-size:15px;font-weight:700}.an-tile small{font-size:11px;color:var(--sub)}
.an-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#222;color:#fff;border-radius:8px;padding:10px 16px;z-index:50;animation:anToast 2.2s both;pointer-events:none}
@keyframes anToast{0%{opacity:0;transform:translate(-50%,20px)}12%,80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}
.an-foot{font-size:12px;color:var(--sub);margin:14px 0}`;
document.head.appendChild(ST);


/* 이 앱에서 직접 그린 만화 컷 풍 일러스트(실제 장면이 아니에요) */
const FX={
 hot:["#ff7a45","#ffd166","M160 20c14 22 30 30 24 56-4 16-16 24-24 24s-20-8-24-24c-6-26 10-34 24-56z"],
 tsun:["#ff9db5","#ffe3ea",""],chu2:["#3b2f6b","#8d7bd6",""],life:["#7fc8f8","#e6f6ff",""],
 love:["#ff8fab","#ffe0ea",""],rival:["#2b2d42","#8d99ae",""],help:["#7bc96f","#e8f7e0",""],react:["#ffd23f","#fff3b0",""]
};
const HAIR=["#3a2e2a","#c0392b","#2d6cdf","#f2c14e","#7a4fb5","#2e8b57","#e07aa0","#444"];

/* 작품을 떠올리게 하는 단순한 상징 소품(캐릭터 얼굴·디자인을 옮기지 않고 소품 아이콘만 얹어요). 좌표는 머리 중심 기준 */
const PROP={
 "ONE PIECE":{s:`<ellipse cx="0" cy="-22" rx="40" ry="8" fill="#e9c46a" stroke="#b8923a" stroke-width="1.5"/><path d="M-22 -24c0-22 44-22 44 0z" fill="#f4d58d" stroke="#b8923a" stroke-width="1.5"/><rect x="-22" y="-28" width="44" height="6" fill="#d62828"/>`},
 "SLAM DUNK":{h:"#eee",s:`<circle cx="52" cy="40" r="17" fill="#ee7b2e" stroke="#222" stroke-width="1.5"/><path d="M35 40h34M52 23v34M41 28q11 12 0 24M63 28q-11 12 0 24" stroke="#222" stroke-width="1.3" fill="none"/><circle cx="-9" cy="2" r="8" fill="none" stroke="#333" stroke-width="1.6"/><circle cx="9" cy="2" r="8" fill="none" stroke="#333" stroke-width="1.6"/>`},
 "ドラゴンボール":{s:`<circle cx="-52" cy="40" r="17" fill="#ff9f1c" stroke="#c76b00" stroke-width="1.5"/><g fill="#d62828"><circle cx="-52" cy="34" r="3"/><circle cx="-58" cy="42" r="3"/><circle cx="-46" cy="42" r="3"/><circle cx="-52" cy="48" r="3"/></g>`},
 "NARUTO -ナルト-":{s:`<rect x="-27" y="-18" width="54" height="9" fill="#2c4a7c"/><rect x="-12" y="-19" width="24" height="11" rx="2" fill="#c9d2dc" stroke="#667" stroke-width="1.2"/><path d="M-5 -14l10 0M0 -17v6" stroke="#667" stroke-width="1.2"/>`},
 "鬼滅の刃":{s:`<g><path d="M-40 54c0-8 6-16 14-18h52c8 2 14 10 14 18z" fill="#1b4332"/>${"x".repeat(0)}<g fill="#0b2018"><rect x="-36" y="40" width="10" height="7"/><rect x="-16" y="40" width="10" height="7"/><rect x="4" y="40" width="10" height="7"/><rect x="24" y="40" width="10" height="7"/><rect x="-26" y="47" width="10" height="7"/><rect x="-6" y="47" width="10" height="7"/><rect x="14" y="47" width="10" height="7"/></g></g><rect x="26" y="4" width="5" height="12" rx="2" fill="#f1faee" stroke="#c33" stroke-width="1"/>`},
 "新世紀エヴァンゲリオン":{s:`<path d="M-18 -34l-6-18 12 10zM18 -34l6-18-12 10z" fill="#7b2cbf"/><path d="M-26 -30c0-8 52-8 52 0v8h-52z" fill="#7b2cbf" opacity=".85"/>`},
 "千と千尋の神隠し":{s:`<rect x="-8" y="-40" width="16" height="7" rx="3" fill="#a06cd5" stroke="#6b3fa0" stroke-width="1.2"/><circle cx="-34" cy="26" r="7" fill="#a06cd5"/>`},
 "君の名は。":{s:`<path d="M-26 -22c20 8 40 8 52 0" stroke="#d62828" stroke-width="5" fill="none"/><path d="M26 -22c8 12 4 28-6 34" stroke="#d62828" stroke-width="4" fill="none"/><path d="M22 12l-8 8M22 12l8 8" stroke="#d62828" stroke-width="3"/>`},
 "進撃の巨人":{s:`<path d="M-44 56c0-30 14-40 44-40s44 10 44 40z" fill="#4b6b3a" opacity=".9"/><path d="M-18 34l18 -8 18 8" stroke="#2f4a22" stroke-width="3" fill="none"/>`},
 "呪術廻戦":{h:"#f1f1f1",s:`<rect x="-30" y="-4" width="60" height="13" rx="3" fill="#222"/>`},
 "SPY×FAMILY":{h:"#e56b9a",s:`<path d="M-22 -34l-8 -16 14 6zM22 -34l8 -16 -14 6z" fill="#222"/><ellipse cx="50" cy="42" rx="12" ry="7" transform="rotate(-25 50 42)" fill="#d9a066" stroke="#8a5a2b" stroke-width="1.2"/>`},
 "名探偵コナン":{s:`<circle cx="-9" cy="2" r="8" fill="#cfe9ff" fill-opacity=".5" stroke="#222" stroke-width="1.8"/><circle cx="9" cy="2" r="8" fill="#cfe9ff" fill-opacity=".5" stroke="#222" stroke-width="1.8"/><path d="M-1 2h2" stroke="#222" stroke-width="1.8"/><path d="M0 30l-12 -6v12zM0 30l12 -6v12z" fill="#d62828"/><circle cx="0" cy="30" r="3" fill="#a31"/>`},
 "美少女戦士セーラームーン":{h:"#f7d51d",s:`<circle cx="-30" cy="-34" r="10" fill="#f7d51d"/><circle cx="30" cy="-34" r="10" fill="#f7d51d"/><path d="M0 -26a8 8 0 1 0 0 -14 6 6 0 1 1 0 14z" fill="#ffd60a" stroke="#c9a000" stroke-width="1"/>`},
 "カードキャプターさくら":{s:`<g transform="translate(50 34)"><path d="M0 -20l5 12 13 1-10 8 4 13-12 -7-12 7 4 -13-10 -8 13 -1z" fill="#ff8fab" stroke="#c2185b" stroke-width="1.3"/><path d="M0 8v26" stroke="#c2185b" stroke-width="3"/></g>`},
 "涼宮ハルヒの憂鬱":{s:`<path d="M-26 -30c0 -8 12 -10 26 -10s26 2 26 10" fill="none"/><path d="M0 -36l-18 -10 0 20zM0 -36l18 -10 0 20z" fill="#ffd60a" stroke="#c9a000" stroke-width="1.3"/><circle cx="0" cy="-36" r="4" fill="#f4b400"/>`},
 "STEINS;GATE":{s:`<path d="M-34 54l10 -28 12 16 12 -16 12 16 12 -16 10 28z" fill="#f8f9fa" stroke="#999" stroke-width="1.5"/><rect x="38" y="30" width="28" height="22" rx="3" fill="#bbb" stroke="#555" stroke-width="1.5"/><rect x="42" y="34" width="14" height="14" fill="#333"/>`},
 "機動戦士ガンダム":{s:`<path d="M0 -20l-10 -20 M0 -20l10 -20" stroke="#ffd60a" stroke-width="5" stroke-linecap="round"/><rect x="-8" y="-24" width="16" height="6" fill="#d62828"/>`},
 "ジョジョの奇妙な冒険":{h:"#1a1a2e",s:`<path d="M-30 -26c0 -24 60 -24 60 0z" fill="#1a1a2e" stroke="#555" stroke-width="1.5"/><rect x="-32" y="-28" width="64" height="7" rx="2" fill="#2b2b45"/><path d="M-30 30q30 24 60 0" stroke="#d4af37" stroke-width="3" fill="none"/>`},
 "北斗の拳":{s:`<g fill="#e8e8e8" stroke="#111" stroke-width="1"><circle cx="-34" cy="46" r="3"/><circle cx="-24" cy="40" r="3"/><circle cx="-14" cy="42" r="3"/><circle cx="-4" cy="48" r="3"/><circle cx="8" cy="50" r="3"/><circle cx="20" cy="46" r="3"/><circle cx="32" cy="40" r="3"/></g>`},
 "僕のヒーローアカデミア":{h:"#f2d544",s:`<path d="M-14 -36l-12 -24 22 12zM14 -36l12 -24 -22 12z" fill="#f2d544" stroke="#c9a000" stroke-width="1.3"/>`}
};
function panel(fx,id,work){
  const f=FX[fx]||FX.hot, seed=[...id].reduce((a,c)=>a+c.charCodeAt(0),0), pr=PROP[work]||null, hair=(pr&&pr.h)||HAIR[seed%HAIR.length];
  const pid="dt"+id, bg=`<defs><linearGradient id="g${pid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f[1]}"/><stop offset="1" stop-color="${f[0]}"/></linearGradient><pattern id="${pid}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.4" fill="#fff" opacity=".45"/><circle cx="11" cy="11" r="2.4" fill="#fff" opacity=".45"/></pattern></defs><rect width="320" height="120" fill="url(#g${pid})"/><rect width="320" height="120" fill="url(#${pid})"/><g stroke="#fff" stroke-width="2" opacity=".55" stroke-linecap="round"><path d="M14 24h46M30 34h30M262 94h40M278 104h24"/></g>`;
  const sym={hot:`<path d="M262 74c8 10 14 14 10 26-2 8-8 12-12 12s-10-4-12-12c-4-12 2-16 14-26z" fill="#ff5a1f"/>`,
   tsun:`<g stroke="#e63757" stroke-width="4" stroke-linecap="round" fill="none"><path d="M254 28q8 6 0 14M270 28q-8 6 0 14M254 46q8-6 16 0"/></g>`,
   chu2:`<circle cx="262" cy="34" r="16" fill="#f7f3c6"/><circle cx="268" cy="30" r="14" fill="${f[0]}"/><path d="M40 28l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#f7f3c6"/>`,
   life:`<rect x="238" y="50" width="56" height="44" fill="#fff" stroke="#8aa" /><rect x="248" y="60" width="10" height="10" fill="#9ad"/><rect x="268" y="60" width="10" height="10" fill="#9ad"/><path d="M234 50l32-20 32 20z" fill="#e57373"/>`,
   love:`<path d="M262 44c-8-12-22-4-14 8l14 14 14-14c8-12-6-20-14-8z" fill="#ff4d79"/><path d="M52 34c-5-7-13-2-9 5l9 8 9-8c4-7-4-12-9-5z" fill="#ff8fab"/>`,
   rival:`<path d="M262 16l-14 34h12l-8 30 22-38h-12l10-26z" fill="#ffd60a" stroke="#222" stroke-width="1.5"/>`,
   help:`<path d="M262 96V64" stroke="#2e7d32" stroke-width="4" stroke-linecap="round"/><path d="M262 66c-14-2-18-14-16-20 12-2 18 6 16 20zM262 70c14-2 18-14 16-20-12-2-18 6-16 20z" fill="#66bb6a"/>`,
   react:`<text x="250" y="60" font-size="44" font-weight="900" fill="#ff3b30" stroke="#fff" stroke-width="2" paint-order="stroke">!?</text>`}[fx]||"";
  return `<svg class="an-art" viewBox="0 0 320 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="만화 컷 풍 일러스트(실제 장면 아님)">${bg}${sym}
   <g transform="translate(160 66)"><path d="M-30 54c0-20 14-30 30-30s30 10 30 30z" fill="${hair==="#444"?"#3d5a80":"#4a6fa5"}"/><circle r="26" fill="#ffe0c2"/><path d="M-27 -4c-4-26 12-34 27-34s31 8 27 34c-6-12-14-18-27-18s-21 6-27 18z" fill="${hair}"/>
   <ellipse cx="-9" cy="2" rx="3.4" ry="5" fill="#222"/><ellipse cx="9" cy="2" rx="3.4" ry="5" fill="#222"/><circle cx="-8" cy="0" r="1.2" fill="#fff"/><circle cx="10" cy="0" r="1.2" fill="#fff"/>
   ${fx==="react"||fx==="hot"||fx==="rival"?`<path d="M-7 14q7 7 14 0z" fill="#b23a48"/>`:`<path d="M-6 14q6 4 12 0" stroke="#b23a48" stroke-width="2" fill="none" stroke-linecap="round"/>`}${pr?pr.s:""}</g>
   <rect x="2" y="2" width="316" height="116" fill="none" stroke="#111" stroke-width="3"/></svg>`;
}

const KEY="jp-anime";
let done=new Set(LS.get(KEY,[])), aType="famous", aMode="learn", aRes={}, aQ=null, aRec=null;
const saveDone=()=>{ LS.set(KEY,[...done]); done.forEach(id=>got.add(id)); saveGot(); };
let got=new Set(LS.get("jp-anime-got",[])); done.forEach(id=>got.add(id));
const saveGot=()=>LS.set("jp-anime-got",[...got]);
let aWho=null, aBest=LS.get("jp-anime-best",{who:0,blank:0}), aPop=null;
const TITLES=[[0,"견습 팬"],[3,"열혈 입문자"],[6,"애니 팬"],[10,"명대사 수집가"],[15,"애니 마스터"],[20,"전설의 오타쿠"]];
const myTitle=()=>{ const n=[...got].filter(id=>LINES.some(l=>l.id===id)).length; return TITLES.filter(x=>n>=x[0]).pop()[1]; };
const dayNo=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/864e5);
function touchStreak(){ const s=LS.get("jp-anime-streak",{last:0,n:0}), d=dayNo(); if(s.last===d) return s; const n=s.last===d-1?s.n+1:1; const r={last:d,n}; LS.set("jp-anime-streak",r); return r; }
const streak=()=>{ const s=LS.get("jp-anime-streak",{last:0,n:0}); return s.last>=dayNo()-1?s.n:0; };
const unlock=id=>{ if(!got.has(id)){ got.add(id); saveGot(); aPop="새 명대사 도감에 등록!"; } touchStreak(); };
const grade=p=>p>=95?"S":p>=85?"A":p>=60?"B":"C";
const todayLine=()=>LINES[dayNo()%LINES.length];
const tname=t=>(TYPES.find(x=>x[0]===t)||[0,t])[1];
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;

function lev(a,b){ const m=a.length,n=b.length; if(!m) return n; if(!n) return m; let p=Array.from({length:n+1},(_,j)=>j);
  for(let i=1;i<=m;i++){ const c=[i]; for(let j=1;j<=n;j++) c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1)); p=c; } return p[n]; }
const norm=s=>s.replace(/[\s、。,.!?!?…「」・ー~〜]/g,"").replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
function sim(heard,l){ const h=norm(heard); if(!h) return 0;
  const best=[norm(l.text),norm(reading(l.ja))].map(t=>1-lev(h,t)/Math.max(h.length,t.length,1));
  return Math.max(0,Math.round(Math.max(...best)*100)); }

function card(l){
  const r=aRes[l.id];
  return `<div class="an-card ${done.has(l.id)?"done":""}" data-id="${l.id}">
   ${panel(l.fx||l.t,l.id,l.src&&l.src.wiki)}
   <div class="an-type">${tname(l.t)}${l.t==="famous"?"":" · 오리지널 문장"}</div>
   <div class="an-ja">${toRuby(l.ja)}</div><div class="an-ko">${E(l.ko)}</div>
   ${l.src?`<div class="an-src">출처: <b>${E(l.src.w)}</b> · ${E(l.src.c)} · <a href="https://ja.wikipedia.org/w/index.php?search=${encodeURIComponent(l.src.wiki)}&go=Go" target="_blank" rel="noopener noreferrer">작품 정보(위키백과)</a></div><div class="an-act"><a class="pill sm" href="https://www.youtube.com/results?search_query=${encodeURIComponent(l.src.w+" "+l.ja.replace(/\[[^\]]*\]/g,"").replace(/[。!?!?…、]/g,""))}" target="_blank" rel="noopener noreferrer">▶ 원본 성우 목소리 (유튜브)</a></div>`:""}
   <div class="an-note">${E(l.note)}</div>
   <div class="an-act">${canSay()?`<button class="pill sm" data-an="say" data-id="${l.id}">${ic("sound")} 듣기</button><button class="pill sm" data-an="slow" data-id="${l.id}">천천히</button>`:""}
    <button class="pill sm" data-an="rec" data-id="${l.id}">${aRec===l.id?"듣는 중…(탭하면 중지)":"따라 말하기"}</button>
    <button class="pill sm ${done.has(l.id)?"on":""}" data-an="done" data-id="${l.id}">${done.has(l.id)?"외웠어요":"외웠어요"}</button></div>
   ${r?`<div class="an-res">${r.err?E(r.err):`<div class="an-grade g${grade(r.pct)}">${grade(r.pct)}</div>내가 말한 것: <b>${E(r.heard)}</b><br>일치도 <b>${r.pct}%</b> ${r.pct>=85?"완벽해요!":r.pct>=60?"좋아요, 한 번 더!":"다시 들어 보고 도전!"}`}</div>`:""}
  </div>`;
}
function listHtml(){
  const arr=LINES.filter(l=>aType==="all"||l.t===aType);
  return `<div class="sub" style="margin-bottom:6px">듣고 → 따라 말하고 → 외웠으면 체크! ${SR?"":"<br>이 브라우저는 말하기 점수를 지원하지 않아요(크롬 권장). 듣고 소리 내어 따라 해 보세요."}</div>`
    + arr.map(card).join("");
}
function mkQuiz(){
  const pool=shuffle(LINES.filter(l=>aType==="all"||l.t===aType)).slice(0,10);
  const items=pool.map(l=>{
    const ch=chunkOrd(l.ja), cand=ch.map((c,i)=>({c,i})).filter(x=>x.c.replace(/[、。!?!?…]/g,"").length>=2&&!/^(は|が|を|に|で|と|も|へ|の)$/.test(x.c));
    if(!cand.length) return null;
    const pick=cand[Math.floor(Math.random()*cand.length)], ans=pick.c.replace(/[、。!?!?…]+$/,"");
    const others=shuffle([...new Set(LINES.filter(o=>o!==l).flatMap(o=>chunkOrd(o.ja)).map(x=>x.replace(/[、。!?!?…]+$/,"")).filter(x=>x.length>=2&&x!==ans&&!/^(は|が|を|に|で|と|も|へ|の)$/.test(x)))]).slice(0,3);
    return {l,ch,idx:pick.i,ans,opts:shuffle([ans,...others])};
  }).filter(Boolean);
  return {items,i:0,score:0,picked:null};
}
function quizHtml(){
  if(!aQ) aQ=mkQuiz(); const q=aQ;
  if(q.i>=q.items.length) return `<div class="an-card" style="text-align:center"><h3>결과 ${q.score} / ${q.items.length}</h3><button class="cta" data-an="qagain" style="max-width:260px;margin:10px auto">한 번 더</button></div>`;
  const it=q.items[q.i], sh=it.ch.map((c,i)=>i===it.idx?`<span class="an-blank">${q.picked?E(it.ans):"　　"}</span>${/[、。!?!?…]+$/.test(c)?E(c.match(/[、。!?!?…]+$/)[0]):""}`:E(c)).join(" ");
  return `<div class="an-card"><div class="sub">${q.i+1} / ${q.items.length} · ${tname(it.l.t)}</div>
   <div class="an-ja" style="margin:8px 0">${sh}</div><div class="an-ko">${E(it.l.ko)}</div>
   <div class="an-opts">${it.opts.map((o,k)=>`<button class="opt ${q.picked?(o===it.ans?"correct":(q.picked===o?"wrong":"")):""}" data-an="pick" data-o="${E(o)}" ${q.picked?"disabled":""}>${E(o)}</button>`).join("")}</div>
   ${q.picked?`<div class="an-note">${q.picked===it.ans?"⭕ 정답!":"❌ 정답은 「"+E(it.ans)+"」"}<br>${toRuby(it.l.ja)}<br>${E(it.l.note)}</div><button class="cta" data-an="qnext">${q.i+1>=q.items.length?"결과 보기":"다음"}</button>`:""}</div>`;
}
function mkWho(){
  const works=[...new Set(LINES.map(l=>l.src.w))];
  const items=shuffle(LINES.slice()).slice(0,10).map(l=>({l,ans:l.src.w,opts:shuffle([l.src.w,...shuffle(works.filter(w=>w!==l.src.w)).slice(0,3)])}));
  return {items,i:0,score:0,combo:0,max:0,lives:3,picked:null};
}
function whoHtml(){
  if(!aWho) aWho=mkWho(); const q=aWho;
  const hud=`<div class="an-hud"><span>${"❤️".repeat(Math.max(q.lives,0))||"💀"}</span><span>🔥 콤보 ${q.combo}</span><span>⭐ ${q.score}</span></div>`;
  if(q.i>=q.items.length||q.lives<=0){
    const nb=q.score>aBest.who; if(nb){ aBest.who=q.score; LS.set("jp-anime-best",aBest); }
    const g=q.lives<=0?"C":q.score>=130?"S":q.score>=90?"A":"B";
    return `<div class="an-card" style="text-align:center"><div class="an-grade g${g} big">${g}</div><h3>${q.lives<=0?"게임 오버…":"🎉 클리어!"} ${q.score}점</h3><div class="sub">최고 기록 ${aBest.who}점${nb?" · 신기록!":""} · 최대 콤보 ${q.max}</div><button class="cta" data-an="wagain" style="max-width:260px;margin:12px auto">한 번 더</button></div>`;
  }
  const it=q.items[q.i];
  return `${hud}<div class="an-card"><div class="sub">${q.i+1} / ${q.items.length} · 이 대사, 어느 작품일까?</div>
   <div class="an-ja an-ty" style="margin:8px 0" key="${q.i}">${toRuby(it.l.ja)}</div><div class="an-ko">${E(it.l.ko)}</div>
   <div class="an-opts">${it.opts.map(o=>`<button class="opt ${q.picked?(o===it.ans?"correct":(q.picked===o?"wrong":"")):""}" data-an="wpick" data-o="${E(o)}" ${q.picked?"disabled":""}>${E(o)}</button>`).join("")}</div>
   ${q.picked?`<div class="an-note">${q.picked===it.ans?"⭕ 정답!"+(q.combo>=3?" 🔥 "+q.combo+"콤보!":""):"❌ 정답은 「"+E(it.ans)+"」"}<br>${E(it.l.src.c)} · ${E(it.l.note)}</div><button class="cta" data-an="wnext">${q.i+1>=q.items.length||q.lives<=0?"결과 보기":"다음"}</button>`:""}</div>`;
}
function dexHtml(){
  const n=LINES.filter(l=>got.has(l.id)).length;
  return `<div class="sub" style="margin-bottom:8px">따라 말해서 60% 이상이거나, 퀴즈에서 맞히거나, '외웠어요'를 누르면 카드가 열려요! (${n} / ${LINES.length})</div><div class="an-dex">${LINES.map(l=>got.has(l.id)
    ?`<button class="an-tile on" data-an="say" data-id="${l.id}"><b>${E(l.src.w)}</b><span>${toRuby(l.ja)}</span><small>${E(l.ko)}</small></button>`
    :`<div class="an-tile"><b>???</b><span>아직 잠겨 있어요</span></div>`).join("")}</div>`;
}
function heroHtml(){
  const l=todayLine(), n=[...got].filter(id=>LINES.some(x=>x.id===id)).length, s=streak();
  return `<div class="an-hero"><div class="an-hs">${myTitle()} · ${s}일 연속 · 도감 ${n}/${LINES.length}</div>
   <div class="sub">오늘의 명대사</div><div class="an-ja an-ty" key="hero">${toRuby(l.ja)}</div><div class="an-ko">${E(l.ko)} · <small>${E(l.src.w)}</small></div>
   ${canSay()?`<button class="pill sm" data-an="say" data-id="${l.id}">${ic("sound")} 듣기</button>`:""}</div>`;
}
window.renderAnime=function(){
  const v=$("animeView"); if(!v) return;
  const pop=aPop; aPop=null;
  v.innerHTML=`<div class="an-wrap"><div class="qm-h"><h2>애니로 배우기</h2></div>
   ${heroHtml()}
   <div class="an-tabs sc">${[["learn","한 줄 공부"],["who","작품 맞히기"],["quiz","빈칸 퀴즈"],["dex","도감"]].map(m=>`<button class="pill ${aMode===m[0]?"on":""}" data-an="mode" data-m="${m[0]}">${m[1]}</button>`).join("")}</div>
   ${aMode==="learn"?listHtml():aMode==="who"?whoHtml():aMode==="dex"?dexHtml():quizHtml()}
   ${pop?`<div class="an-toast">${pop}</div>`:""}
   <div class="an-foot">명대사는 학습을 위한 짧은 인용이며 저작권은 각 작품의 권리자에게 있어요. 그림은 이 앱에서 직접 그린 일러스트이며 작품을 떠올리게 하는 상징 소품만 넣었어요(실제 캐릭터·장면이 아니에요). 대사는 방영분과 표현이 조금 다를 수 있어요.</div></div>`;
};
function stopRec(){ if(aRec&&window._anRec){ try{ window._anRec.stop(); }catch(e){} } }
function startRec(l){
  if(!SR){ aRes[l.id]={err:"이 브라우저는 음성 인식을 지원하지 않아요. 크롬에서 써 보세요."}; return renderAnime(); }
  if(aRec){ stopRec(); return; }
  try{ speechSynthesis.cancel(); }catch(e){}
  const rec=new SR(); rec.lang="ja-JP"; rec.interimResults=false; rec.maxAlternatives=3; window._anRec=rec; aRec=l.id; renderAnime();
  let got=false;
  rec.onresult=e=>{ got=true; let best=null; for(const a of e.results[0]){ const p=sim(a.transcript,l); if(!best||p>best.pct) best={heard:a.transcript,pct:p}; } aRes[l.id]=best; if(best&&best.pct>=60) unlock(l.id); };
  rec.onerror=e=>{ got=true; aRes[l.id]={err:e.error==="not-allowed"?"마이크 사용을 허용해 주세요.":e.error==="no-speech"?"목소리가 들리지 않았어요. 다시 해 보세요.":"음성 인식에 실패했어요. 다시 해 보세요."}; };
  rec.onend=()=>{ if(!got) aRes[l.id]={err:"목소리가 들리지 않았어요. 다시 해 보세요."}; aRec=null; renderAnime(); };
  try{ rec.start(); }catch(e){ aRec=null; renderAnime(); }
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-an]"); if(!b||!$("animeView").contains(b)) return; const a=b.dataset.an, l=LINES.find(x=>x.id===b.dataset.id);
  if(a==="say"&&l) speakJa(l.text,.9);
  else if(a==="slow"&&l) speakJa(l.text,.6);
  else if(a==="rec"&&l) startRec(l);
  else if(a==="done"&&l){ done.has(l.id)?done.delete(l.id):(done.add(l.id),touchStreak()); saveDone(); renderAnime(); }
  else if(a==="mode"){ aMode=b.dataset.m; aQ=null; aWho=null; renderAnime(); }
  else if(a==="type"){ aType=b.dataset.t; aQ=null; renderAnime(); }
  else if(a==="pick"){ if(aQ&&!aQ.picked){ aQ.picked=b.dataset.o; if(b.dataset.o===aQ.items[aQ.i].ans){ aQ.score++; unlock(aQ.items[aQ.i].l.id); } renderAnime(); } }
  else if(a==="qnext"){ aQ.i++; aQ.picked=null; renderAnime(); window.scrollTo(0,0); }
  else if(a==="wpick"){ const q=aWho; if(q&&!q.picked){ q.picked=b.dataset.o; const it=q.items[q.i];
    if(q.picked===it.ans){ q.combo++; q.max=Math.max(q.max,q.combo); q.score+=10+Math.min(q.combo-1,5)*2; unlock(it.l.id); } else { q.combo=0; q.lives--; } renderAnime(); } }
  else if(a==="wnext"){ aWho.i++; aWho.picked=null; renderAnime(); window.scrollTo(0,0); }
  else if(a==="wagain"){ aWho=null; renderAnime(); }
  else if(a==="qagain"){ aQ=null; renderAnime(); }
});
})();
