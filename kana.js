/* 히라가나·가타카나 입문 코스 (일본어를 전혀 모르는 사람을 위한 시작 코스)
 * - 글자표(눌러서 소리 듣기) → 레슨 6개(히라가나) + 6개(가타카나) → 연습 문제(소리·글자·한글 발음·단어 읽기)
 * - 진행 상황은 LS("jp-kana")에 프로필별로 저장해요. 소리는 기기 내장 일본어 음성이에요.
 */
(function(){
const H=[["あ","a","아"],["い","i","이"],["う","u","우"],["え","e","에"],["お","o","오"],
["か","ka","카"],["き","ki","키"],["く","ku","쿠"],["け","ke","케"],["こ","ko","코"],
["さ","sa","사"],["し","shi","시"],["す","su","스"],["せ","se","세"],["そ","so","소"],
["た","ta","타"],["ち","chi","치"],["つ","tsu","츠"],["て","te","테"],["と","to","토"],
["な","na","나"],["に","ni","니"],["ぬ","nu","누"],["ね","ne","네"],["の","no","노"],
["は","ha","하"],["ひ","hi","히"],["ふ","fu","후"],["へ","he","헤"],["ほ","ho","호"],
["ま","ma","마"],["み","mi","미"],["む","mu","무"],["め","me","메"],["も","mo","모"],
["や","ya","야"],["ゆ","yu","유"],["よ","yo","요"],
["ら","ra","라"],["り","ri","리"],["る","ru","루"],["れ","re","레"],["ろ","ro","로"],
["わ","wa","와"],["を","wo","오"],["ん","n","응"]];
const D=[["が","ga","가"],["ぎ","gi","기"],["ぐ","gu","구"],["げ","ge","게"],["ご","go","고"],
["ざ","za","자"],["じ","ji","지"],["ず","zu","즈"],["ぜ","ze","제"],["ぞ","zo","조"],
["だ","da","다"],["ぢ","ji","지"],["づ","zu","즈"],["で","de","데"],["ど","do","도"],
["ば","ba","바"],["び","bi","비"],["ぶ","bu","부"],["べ","be","베"],["ぼ","bo","보"],
["ぱ","pa","파"],["ぴ","pi","피"],["ぷ","pu","푸"],["ぺ","pe","페"],["ぽ","po","포"]];
const Y=[["きゃ","kya","캬"],["きゅ","kyu","큐"],["きょ","kyo","쿄"],["しゃ","sha","샤"],["しゅ","shu","슈"],["しょ","sho","쇼"],
["ちゃ","cha","차"],["ちゅ","chu","추"],["ちょ","cho","초"],["にゃ","nya","냐"],["にゅ","nyu","뉴"],["にょ","nyo","뇨"],
["ひゃ","hya","햐"],["ひゅ","hyu","휴"],["ひょ","hyo","효"],["みゃ","mya","먀"],["みゅ","myu","뮤"],["みょ","myo","묘"],
["りゃ","rya","랴"],["りゅ","ryu","류"],["りょ","ryo","료"],["ぎゃ","gya","갸"],["ぎゅ","gyu","규"],["ぎょ","gyo","교"],
["じゃ","ja","자"],["じゅ","ju","주"],["じょ","jo","조"],["びゃ","bya","뱌"],["びゅ","byu","뷰"],["びょ","byo","뵤"],
["ぴゃ","pya","퍄"],["ぴゅ","pyu","퓨"],["ぴょ","pyo","표"]];
const toK=s=>s.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60));
const KOREAN_ROWS=["あ행","か행","さ행","た행","な행","は행","ま행","や행","ら행","わ행"];
/* 레슨: 글자 범위와 단어(히라가나/가타카나) */
const LESSONS=[
 {id:1,ktip:"ア イ ウ エ オ는 히라가나 あ い う え お와 소리가 같아요. 가타카나는 직선 위주의 각진 글자예요. 길게 끄는 소리는 ー로 써요(예: ケーキ=케-키).",name:"あ행 · か행",title:"모음과 か행",from:0,to:10,tip:"일본어의 모음은 5개(あ い う え お)예요. 우리말 '아 이 우 에 오'와 거의 같고, う는 입술을 둥글게 내밀지 않고 가볍게 발음해요.",
  hw:[["あい","사랑"],["いえ","집"],["うえ","위"],["あお","파랑"],["かお","얼굴"],["いけ","연못"],["くち","입"],["こえ","목소리"],["あき","가을"],["えき","역"]],
  kw:[["ココア","코코아"],["キウイ","키위"],["ケーキ","케이크"]]},
 {id:2,ktip:"シ(시)와 ツ(츠), ソ(소)와 ン(응)은 모양이 비슷해요. シ·ソ는 점이 옆으로 누운 모양, ツ·ン은 점이 위에서 아래로 내려오는(또는 올라가는) 모양이에요. 헷갈리는 글자 코너에서 구분해 보세요.",name:"さ행 · た행",title:"さ행과 た행",from:10,to:20,tip:"し는 '시', ち는 '치', つ는 '츠'에 가까워요. つ는 혀끝을 윗니 뒤에 대고 '츠'라고 해 보세요.",
  hw:[["さけ","술"],["すし","초밥"],["せかい","세계"],["そら","하늘"],["たこ","문어"],["つき","달"],["てがみ","편지"],["とけい","시계"],["しお","소금"],["あした","내일"]],
  kw:[["スイカ","수박"],["テスト","시험"],["ソース","소스"],["タクシー","택시"]]},
 {id:3,ktip:"ハ행의 ヒ·フ·ヘ는 히라가나와 모양이 비슷해서 쉬워요. ノート의 ー는 앞 소리를 길게 끌어요. 가타카나는 외래어에 많이 써요(예: ナイフ 나이프).",name:"な행 · は행",title:"な행과 は행",from:20,to:30,tip:"は행의 ふ는 입술을 모아 '후'와 '푸' 사이로 가볍게 내요. 조사로 쓰는 は는 'wa(와)'로 읽어요(예: 私は → 와타시와).",
  hw:[["なつ","여름"],["にく","고기"],["ぬの","천"],["ねこ","고양이"],["のり","김"],["はな","꽃"],["ひと","사람"],["ふね","배"],["へや","방"],["ほし","별"]],
  kw:[["ナイフ","나이프"],["ノート","공책"],["ネクタイ","넥타이"],["ヒーター","히터"]]},
 {id:4,ktip:"ラ행은 우리말의 'ㄹ'과 'ㄷ' 사이의 가벼운 소리예요. ン(응)은 받침처럼 쓰이고, ヲ는 일상에서 거의 쓰지 않아요.",name:"ま행 · や행 · ら행 · わ행",title:"ま・や・ら・わ행과 ん",from:30,to:48,tip:"ら행은 우리말의 'ㄹ'과 'ㄷ' 사이의 가벼운 소리예요. ん은 받침 'ㄴ·ㅇ·ㅁ'처럼 쓰이고, を는 'o(오)'로만 읽어요(조사로 써요).",
  hw:[["まど","창문"],["みみ","귀"],["むし","벌레"],["めがね","안경"],["もも","복숭아"],["やま","산"],["ゆき","눈"],["よる","밤"],["くるま","자동차"],["りんご","사과"],["わたし","나"],["ほん","책"]],
  kw:[["メロン","멜론"],["ミルク","우유"],["ワイン","와인"],["レモン","레몬"],["マスク","마스크"]]},
 {id:5,name:"탁음 · 반탁음",title:"탁한 소리(゛)와 반탁음(゜)",group:"D",tip:"글자 오른쪽 위에 점 두 개(゛)가 붙으면 탁한 소리, 동그라미(゜)는 ぱ행이에요. か→が, さ→ざ, た→だ, は→ば·ぱ. じ와 ぢ, ず와 づ는 소리가 같아요.",
  hw:[["かぎ","열쇠"],["ぎんこう","은행"],["ごはん","밥"],["かぜ","바람"],["ぞう","코끼리"],["だいがく","대학"],["でんわ","전화"],["かばん","가방"],["からだ","몸"],["ぶどう","포도"],["へび","뱀"],["ぱん","빵"]],
  kw:[["ゲーム","게임"],["バス","버스"],["ビール","맥주"],["ドア","문"],["ダンス","댄스"],["パン","빵"],["ポスト","우체통"]]},
 {id:6,ktip:"작은 ャ ュ ョ는 앞 글자와 합쳐 한 글자처럼 읽어요(シャ=샤). 작은 ッ는 뒤 소리를 짧게 막는 받침이에요(サッカー=삭카-). ー는 앞 모음을 길게 끌어요(ジュース=쥬-스).",name:"요음 · 촉음 · 장음",title:"작은 ゃゅょ, 작은 っ, 늘임표 ー",group:"Y",tip:"き 뒤에 작은 や·ゆ·よ가 붙으면 한 글자처럼 합쳐 읽어요(きゃ=캬). 작은 っ는 뒤 소리를 짧게 막는 받침이고(がっこう=각꼬-), 소리를 길게 끄는 장음은 히라가나는 모음을 하나 더(おおきい), 가타카나는 ー로 써요.",
  hw:[["じゃがいも","감자"],["しゃしん","사진"],["きゅうり","오이"],["おちゃ","차"],["びょういん","병원"],["りょこう","여행"],["ぎゅうにゅう","우유"],["かいしゃ","회사"],["がっこう","학교"],["ざっし","잡지"]],
  kw:[["シャツ","셔츠"],["ジュース","주스"],["チョコレート","초콜릿"],["ジャム","잼"],["キャンプ","캠프"],["サッカー","축구"]]}
];
const LIST={h1:[],k:[]};
function lessonChars(L,k){ // 한 레슨의 글자 목록 [표시글자, 로마자, 한글]
  let arr;
  if(L.group==="D") arr=D; else if(L.group==="Y") arr=Y; else arr=H.slice(L.from,L.to);
  return k?arr.map(([c,r,ko])=>[toK(c),r,ko]):arr;
}
const key=(L,k)=>(k?"k":"h")+L.id;
const done=()=>LS.get("jp-kana",{done:{}});
const save=d=>LS.set("jp-kana",d);
const canVoice=()=>"speechSynthesis" in window && speechSynthesis.getVoices().some(v=>/^ja/i.test(v.lang));
const say=(t,r)=>{ try{ speakJa(t,r||.8); }catch(e){} };
const KQ=document.createElement("style");
KQ.textContent=`.kana{max-width:640px;margin:0 auto}.kana h2{margin:6px 0}.kana .sub{margin:2px 0 10px}
.ktabs{display:flex;gap:8px;margin:10px 0}.ktabs .pill{flex:1;justify-content:center}
.kgrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:10px 0}
.kc{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 0 6px;text-align:center;cursor:pointer;font:inherit;color:var(--text);min-height:64px}
.kc b{display:block;font-size:26px;line-height:1.2}.kc small{display:block;font-size:11px;color:var(--sub)}.kc.empty{visibility:hidden}
.kc:active{background:var(--accent-soft)}
.krow-h{font-size:12px;color:var(--sub);margin:12px 0 -4px}
.klesson{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:12px 14px;margin:8px 0;font:inherit;color:var(--text);cursor:pointer}
.klesson .kn{width:34px;height:34px;border-radius:50%;background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;flex:none}
.klesson.ok .kn{background:var(--accent);color:#fff}.klesson b{display:block}.klesson small{color:var(--sub)}
.ktip{background:var(--accent-soft);border-radius:12px;padding:12px 14px;margin:10px 0;font-size:14px;line-height:1.6}
.kbig{font-size:84px;text-align:center;margin:10px 0;line-height:1.2}.kword{font-size:44px;text-align:center;margin:10px 0}
.ksim span{display:inline-block;margin:2px 8px 2px 0;font-size:18px}
.kcred{margin:20px 0 4px;text-align:center;font-size:11px;opacity:.4}`;
document.head.appendChild(KQ);
let K=null; // 현재 연습 상태
const root=()=>$("quizView");
const inq=on=>document.body.classList.toggle("inq",!!on);
function open(){ setView("quiz"); document.body.classList.remove("inq","inr"); renderHome(); window.scrollTo(0,0); }
function lessonBtns(k){ const d=done().done; return LESSONS.map(L=>`<button class="klesson ${d[key(L,k)]?"ok":""}" data-kana="lesson" data-id="${L.id}" data-k="${k?1:0}"><span class="kn">${d[key(L,k)]?"✓":L.id}</span><span><b>${L.title}</b><small>${k?"가타카나":"히라가나"} · ${lessonChars(L,k).length}글자 · 소리 듣기와 문제 풀이</small></span></button>`).join(""); }
function renderHome(){
  inq(false);
  const tab=(K&&K.tab)||"h";
  root().innerHTML=`<div class="kana"><div class="qm-h"><h2>일본어 글자 입문</h2></div>
  <div class="sub">히라가나와 가타카나를 처음부터 배워요. 글자를 누르면 소리가 나요. 순서대로 레슨 1~6을 풀면 읽을 수 있어요.</div>
  <div class="ktabs"><button class="pill ${tab==="h"?"on":""}" data-kana="tab" data-t="h">히라가나 ひらがな</button><button class="pill ${tab==="k"?"on":""}" data-kana="tab" data-t="k">가타카나 カタカナ</button></div>
  <div class="ktip">${tab==="h"?"히라가나는 일본 고유의 단어와 문법에 써요(예: ありがとう). 둥글둥글한 글자예요.":"가타카나는 외래어·외국 이름·강조에 써요(예: コーヒー, ソウル). 각진 글자예요. 히라가나를 먼저 익히면 쉬워요."}</div>
  <h3>글자 익히기</h3>${lessonBtns(tab==="k")}
  <button class="cta sec" data-kana="chart" data-k="${tab==="k"?1:0}" style="margin-top:6px">글자표 전체 보기 (눌러서 소리 듣기)</button>
  <button class="cta" data-kana="final" data-k="${tab==="k"?1:0}" style="margin-top:10px">${tab==="k"?"가타카나":"히라가나"} 전체 시험 (20문제)</button>
  <button class="cta sec" data-kana="confuse" style="margin-top:10px">헷갈리는 글자 구분하기</button>
  <button class="cta sec" data-kana="exit" style="margin-top:10px">퀴즈 메뉴로</button></div>`;
}
function renderChart(k){
  inq(false);
  const sec=(title,arr,cols,ex)=>`<div class="krow-h">${title}</div><div class="kgrid" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${arr.map(c=>c?`<button class="kc" data-kana="say" data-t="${c[0]}"><b>${c[0]}</b><small>${c[2]} · ${c[1]}</small></button>`:`<span class="kc empty"></span>`).join("")}</div>`;
  const map=a=>a.map(([c,r,ko])=>[k?toK(c):c,r,ko]);
  const base=map(H), pad=[];
  // 행 단위(5열): や행은 3글자 → 빈칸 채우기
  const rows=[base.slice(0,5),base.slice(5,10),base.slice(10,15),base.slice(15,20),base.slice(20,25),base.slice(25,30),base.slice(30,35),[base[35],null,base[36],null,base[37]],base.slice(38,43),[base[43],null,base[44],null,base[45]]];
  root().innerHTML=`<div class="kana"><button class="back" data-kana="home">${ic("back")}입문 코스</button><h2>${k?"가타카나":"히라가나"} 글자표</h2><div class="sub">글자를 누르면 소리가 나요. 위의 줄이 행(ア·カ·サ…), 각 칸은 한글 발음 · 로마자예요.</div>
  <div class="krow-h">기본 글자 (오십음도)</div><div class="kgrid">${rows.flat().map(c=>c?`<button class="kc" data-kana="say" data-t="${c[0]}"><b>${c[0]}</b><small>${c[2]} · ${c[1]}</small></button>`:`<span class="kc empty"></span>`).join("")}</div>
  <div class="krow-h">탁음 · 반탁음 (점 ゛ ゜ 이 붙은 글자)</div><div class="kgrid">${map(D).map(c=>`<button class="kc" data-kana="say" data-t="${c[0]}"><b>${c[0]}</b><small>${c[2]} · ${c[1]}</small></button>`).join("")}</div>
  <div class="krow-h">요음 (작은 ゃゅょ)</div><div class="kgrid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${map(Y).map(c=>`<button class="kc" data-kana="say" data-t="${c[0]}"><b>${c[0]}</b><small>${c[2]} · ${c[1]}</small></button>`).join("")}</div>
  <div class="ktip"><b>っ / ッ (작은 츠)</b> 뒤의 소리를 짧게 막아 줘요. 예: がっこう(각꼬-), サッカー(삭카-)<br><b>ー</b> 가타카나에서 앞 모음을 길게 끌어요. 예: コーヒー(코-히-)<br><b>ん / ン</b> 받침처럼 'ㄴ·ㅇ·ㅁ' 소리를 내요. 예: ほん(홍), さんぽ(삼포)</div></div>`;
}
function renderConfuse(){
  inq(false);
  const pairs=[["さ","き"],["ぬ","め"],["ろ","る"],["わ","れ","ね"],["は","ほ"],["あ","お"],["シ","ツ"],["ソ","ン"],["ク","ケ"],["ウ","ワ"],["フ","ワ"],["ミ","シ"]];
  const info={"さ":"さ(사)는 아래가 열려 있어요","き":"き(키)는 선이 두 줄 가로로 있어요","ぬ":"ぬ(누)는 꼬리가 둥글게 감겨요","め":"め(메)는 꼬리 없이 열려 있어요","ろ":"ろ(로)는 끝이 열려 있어요","る":"る(루)는 끝에 동그란 고리가 있어요","わ":"わ(와)는 뾰족하게 꺾여요","れ":"れ(레)는 오른쪽 아래가 꺾여요","ね":"ね(네)는 끝에 고리가 있어요","は":"は(하)는 오른쪽이 닫혀 있어요","ほ":"ほ(호)는 가로선이 한 줄 더 있어요","あ":"あ(아)는 가운데 교차해서 안으로 말려요","お":"お(오)는 위에 점이 있고 오른쪽이 말려요","シ":"シ(시)는 점 두 개가 옆으로 누워요(↘)","ツ":"ツ(츠)는 점 두 개가 위에서 아래로 내려와요(↓)","ソ":"ソ(소)는 점 하나가 위로 짧고 선이 비스듬해요","ン":"ン(응)은 점이 아래에서 위로(↗) 올라가요","ク":"ク(쿠)는 위 획이 짧게 시작해요","ケ":"ケ(케)는 가로선이 먼저 나와요","ウ":"ウ(우)는 위에 점이 있어요","ワ":"ワ(와)는 점 없이 뚜껑만 있어요","フ":"フ(후)는 한 획으로 꺾여요","ミ":"ミ(미)는 가로선 세 줄이에요"};
  root().innerHTML=`<div class="kana"><button class="back" data-kana="home">${ic("back")}입문 코스</button><h2>헷갈리는 글자</h2><div class="sub">모양이 비슷해서 자주 틀리는 글자예요. 눌러서 소리도 들어 보세요.</div>
  ${pairs.map(p=>`<div class="ktip"><div class="ksim">${p.map(c=>`<button class="kc" data-kana="say" data-t="${c}" style="display:inline-block;width:70px;margin-right:6px"><b>${c}</b></button>`).join("")}</div>${p.map(c=>info[c]||"").filter(Boolean).join("<br>")}</div>`).join("")}</div>`;
}
function renderLesson(L,k){
  inq(false);
  const ch=lessonChars(L,k), words=k?L.kw:L.hw;
  root().innerHTML=`<div class="kana"><button class="back" data-kana="home">${ic("back")}입문 코스</button><h2>레슨 ${L.id}. ${k?toK(L.title):L.title}</h2><div class="sub">${k?"가타카나":"히라가나"} · ${ch.length}글자</div>
  <div class="ktip">${k?(L.ktip||toK(L.tip)):L.tip}</div>
  <div class="kgrid" ${ch.length%3===0&&L.group==="Y"?'style="grid-template-columns:repeat(3,minmax(0,1fr))"':""}>${ch.map(c=>`<button class="kc" data-kana="say" data-t="${c[0]}"><b>${c[0]}</b><small>${c[2]} · ${c[1]}</small></button>`).join("")}</div>
  <h3>단어로 읽어 보기</h3><div class="kgrid" style="grid-template-columns:repeat(2,minmax(0,1fr))">${words.map(([w,ko])=>`<button class="kc" data-kana="say" data-t="${w}"><b style="font-size:22px">${w}</b><small>${ko}</small></button>`).join("")}</div>
  <button class="cta" data-kana="start" data-id="${L.id}" data-k="${k?1:0}">연습 문제 풀기 (12문제)</button></div>`;
}
/* 문제 만들기 */
function mkQuestions(pool,words,n){ // pool: [글자,로마자,한글], words: [[단어,뜻]]
  const kos=[...new Set(pool.map(c=>c[2]))], qs=[], voice=canVoice();
  const types=voice?["hear","ko","kana","word"]:["ko","kana","word"];
  for(let i=0;i<n;i++){
    const c=pool[Math.floor(Math.random()*pool.length)], t=types[i%types.length];
    const mix=(good,all,cnt=4)=>shuffle([good,...shuffle(all.filter(x=>x!==good)).slice(0,cnt-1)]);
    if(t==="word"&&words.length>=4){ const w=words[Math.floor(Math.random()*words.length)];
      qs.push({t:"word",big:w[0],ans:w[1],opts:mix(w[1],words.map(x=>x[1])),say:w[0],note:`${w[0]} = ${w[1]}`}); }
    else if(t==="hear"){ qs.push({t:"hear",big:"🔊",ans:c[0],opts:mix(c[0],pool.map(x=>x[0])),say:c[0],note:`${c[0]} = ${c[2]} (${c[1]})`}); }
    else if(t==="kana"||t==="word"){ qs.push({t:"kana",big:c[2],ans:c[0],opts:mix(c[0],pool.map(x=>x[0])),say:c[0],note:`${c[2]} = ${c[0]} (${c[1]})`,sub:"이 소리의 글자는?",opt:"kana"}); }
    else { qs.push({t:"ko",big:c[0],ans:c[2],opts:mix(c[2],kos),say:c[0],note:`${c[0]} = ${c[2]} (${c[1]})`,sub:"이 글자는 어떻게 읽을까요?"}); }
  }
  return qs;
}
function startQuiz(title,pool,words,n,lessonKey){
  K={...(K||{}),title,qs:mkQuestions(pool,words,n),i:0,score:0,sel:null,lessonKey};
  renderQ();
}
function renderQ(){
  const q=K.qs[K.i]; if(!q) return renderResult();
  inq(true);
  const prompts={hear:"들리는 글자는?",ko:q.sub,kana:q.sub,word:"이 단어의 뜻은?"};
  const done_=K.sel!==null, big=q.t==="hear"?`<button class="cta sec" data-kana="replay" style="max-width:240px;margin:14px auto">소리 듣기 ▶</button>`:`<div class="${q.t==="word"?"kword":"kbig"}">${q.big}</div>`;
  root().innerHTML=`<div class="kana"><div class="qtop"><button class="qx" data-kana="home" aria-label="그만하기">×</button><div class="prog"><div style="width:${Math.round(K.i/K.qs.length*100)}%"></div></div></div>
  <div class="sub">${K.title} · ${K.i+1} / ${K.qs.length}</div><div class="sub jprompt" style="text-align:center">${prompts[q.t]}</div>${big}
  <div class="opts4">${q.opts.map((o,i)=>{ let c=""; if(done_){ if(o===q.ans) c="correct"; else if(i===K.sel) c="wrong"; } return `<button class="opt ${c}" data-kana="ans" data-i="${i}" ${done_?"disabled":""}><kbd>${i+1}</kbd><span style="font-size:${/[ぁ-んァ-ヶ]/.test(o)?"24px":"inherit"}">${o}</span></button>`; }).join("")}</div>
  ${done_?`<div class="reveal ${q.opts[K.sel]===q.ans?"ok":"ng"}" style="position:static;margin-top:14px;border-radius:16px"><div class="rvt">${q.opts[K.sel]===q.ans?"정답이에요!":"아쉬워요"}</div><div>${q.note}</div><div class="qbtns"><button class="cta" data-kana="next">${K.i+1>=K.qs.length?"결과 보기":"계속하기"}</button></div></div>`:""}</div>`;
  if(!done_&&q.t==="hear") setTimeout(()=>{ if(K&&K.qs[K.i]===q&&K.sel===null) say(q.say); },200);
}
function renderResult(){
  inq(false);
  const n=K.qs.length, pct=Math.round(K.score/n*100), ok=pct>=70;
  if(ok&&K.lessonKey){ const d=done(); d.done[K.lessonKey]=true; save(d); }
  root().innerHTML=`<div class="kana" style="text-align:center"><h2>${K.title} 결과</h2><div class="score" style="font-size:44px;margin:16px 0">${K.score} / ${n}</div>
  <div class="sub">${ok?(K.lessonKey?"합격! 레슨을 완료로 표시했어요.":"잘했어요!"):"70% 이상이면 완료로 표시돼요. 글자표를 한 번 더 보고 다시 도전해 보세요."}</div>
  <div class="qbtns" style="flex-direction:column;align-items:stretch;max-width:380px;margin:18px auto 0"><button class="cta" data-kana="again">다시 풀기</button><button class="cta sec" data-kana="home">입문 코스로</button></div></div>`;
  if(ok&&typeof sakura==="function") sakura(14);
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-kana]"); if(!b||!root().contains(b)&&b.dataset.kana!=="open") return;
  const a=b.dataset.kana, k=b.dataset.k==="1", L=LESSONS.find(x=>x.id===+b.dataset.id);
  if(a==="open"){ open(); }
  else if(a==="home"){ K=K&&{tab:K.tab}; if(K) K.tab=K.tab||"h"; renderHome(); window.scrollTo(0,0); }
  else if(a==="exit"){ inq(false); setView("quiz"); }
  else if(a==="tab"){ K={tab:b.dataset.t}; renderHome(); }
  else if(a==="say"){ say(b.dataset.t); }
  else if(a==="chart"){ K={tab:k?"k":"h"}; renderChart(k); window.scrollTo(0,0); }
  else if(a==="confuse"){ renderConfuse(); window.scrollTo(0,0); }
  else if(a==="lesson"){ K={tab:k?"k":"h",lessonId:L.id,k}; renderLesson(L,k); window.scrollTo(0,0); }
  else if(a==="start"){ K={tab:k?"k":"h",lessonId:L.id,k}; startQuiz(`레슨 ${L.id}`,lessonChars(L,k),k?L.kw:L.hw,12,key(L,k)); window.scrollTo(0,0); }
  else if(a==="final"){ const pool=[]; LESSONS.forEach(x=>pool.push(...lessonChars(x,k))); const words=[]; LESSONS.forEach(x=>words.push(...(k?x.kw:x.hw))); K={tab:k?"k":"h",final:k?"k":"h"}; startQuiz(k?"가타카나 전체 시험":"히라가나 전체 시험",pool,words,20,null); window.scrollTo(0,0); }
  else if(a==="ans"){ if(!K||K.sel!==null) return; K.sel=+b.dataset.i; const q=K.qs[K.i]; if(q.opts[K.sel]===q.ans) K.score++; renderQ(); if(q.say&&q.t!=="hear") {} }
  else if(a==="next"){ K.i++; K.sel=null; renderQ(); window.scrollTo(0,0); }
  else if(a==="replay"){ say(K.qs[K.i].say); }
  else if(a==="again"){ if(K.lessonId){ const L2=LESSONS.find(x=>x.id===K.lessonId); startQuiz(`레슨 ${L2.id}`,lessonChars(L2,K.k),K.k?L2.kw:L2.hw,12,key(L2,K.k)); } else { const kk=K.final==="k"; const pool=[]; LESSONS.forEach(x=>pool.push(...lessonChars(x,kk))); const words=[]; LESSONS.forEach(x=>words.push(...(kk?x.kw:x.hw))); startQuiz(kk?"가타카나 전체 시험":"히라가나 전체 시험",pool,words,20,null); } window.scrollTo(0,0); }
});
window.KANA={open};
})();
