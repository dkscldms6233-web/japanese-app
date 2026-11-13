/* 히라가나·가타카나 입문 코스 (일본어를 전혀 모르는 사람을 위한 시작 코스)
 * 화면 순서: 글자표(눌러서 소리 듣기) → 행별 레슨(あ행~ぱ행, 요음, 촉음·장음) → 전체 시험
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
["りゃ","rya","랴"],["りゅ","ryu","류"],["りょ","ryo","료"],
["ぎゃ","gya","갸"],["ぎゅ","gyu","규"],["ぎょ","gyo","교"],["じゃ","ja","자"],["じゅ","ju","주"],["じょ","jo","조"],
["びゃ","bya","뱌"],["びゅ","byu","뷰"],["びょ","byo","뵤"],["ぴゃ","pya","퍄"],["ぴゅ","pyu","퓨"],["ぴょ","pyo","표"]];
const toK=s=>s.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60));
const toH=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
/* 레슨 목록 — 한 줄(행)마다 레슨 하나 */
const LESSONS=[
 {g:"기본 글자(오십음도)",label:"あ행",chars:H.slice(0,5),tip:"모음 5개예요: あ(아) い(이) う(우) え(에) お(오). 우리말 '아 이 우 에 오'와 거의 같아요. う는 입술을 둥글게 내밀지 않고 가볍게 발음해요. 모든 글자의 기본이 되는 소리예요.",
  ktip:"ア イ ウ エ オ는 히라가나 あ い う え お와 소리가 같아요. 가타카나는 직선 위주의 각진 글자예요. 길게 끄는 소리는 ー로 써요(예: ケーキ=케-키)."},
 {g:"기본 글자(오십음도)",label:"か행",chars:H.slice(5,10),tip:"か(카) き(키) く(쿠) け(케) こ(코). 단어 첫머리에서는 'ㅋ'에 가깝고, 단어 가운데서는 'ㄲ'처럼 가볍게 들려요."},
 {g:"기본 글자(오십음도)",label:"さ행",chars:H.slice(10,15),tip:"さ(사) し(시) す(스) せ(세) そ(소). し는 '시', す는 입술을 펴고 '스'에 가깝게 발음해요."},
 {g:"기본 글자(오십음도)",label:"た행",chars:H.slice(15,20),tip:"た(타) ち(치) つ(츠) て(테) と(토). ち는 '치', つ는 혀끝을 윗니 뒤에 대고 '츠'라고 해 보세요."},
 {g:"기본 글자(오십음도)",label:"な행",chars:H.slice(20,25),tip:"な(나) に(니) ぬ(누) ね(네) の(노). 우리말 'ㄴ' 소리와 같아서 쉬워요. ぬ와 め, ね와 れ는 모양이 비슷하니 구분해 보세요."},
 {g:"기본 글자(오십음도)",label:"は행",chars:H.slice(25,30),tip:"は(하) ひ(히) ふ(후) へ(헤) ほ(호). ふ는 입술을 모아 '후'와 '푸' 사이로 가볍게 내요. 조사로 쓰는 は는 'wa(와)'로 읽어요(예: 私は → 와타시와), 조사 へ는 'e(에)'로 읽어요.",
  ktip:"ハ(하) ヒ(히) フ(후) ヘ(헤) ホ(호). ヘ는 히라가나 へ와 거의 같은 모양이에요. 가타카나는 외래어에 많이 써요(예: ホテル 호텔)."},
 {g:"기본 글자(오십음도)",label:"ま행",chars:H.slice(30,35),tip:"ま(마) み(미) む(무) め(메) も(모). 우리말 'ㅁ' 소리와 같아요."},
 {g:"기본 글자(오십음도)",label:"や행",chars:H.slice(35,38),tip:"や(야) ゆ(유) よ(요), 세 글자뿐이에요. や행에는 い·え 소리가 없어요. 이 글자들은 작게 써서 다른 글자 뒤에 붙이기도 해요(요음, 뒤에서 배워요).",
  ktip:"ヤ(야) ユ(유) ヨ(요). 세 글자뿐이에요. 작게 써서 다른 글자 뒤에 붙이기도 해요(요음)."},
 {g:"기본 글자(오십음도)",label:"ら행",chars:H.slice(38,43),tip:"ら(라) り(리) る(루) れ(레) ろ(로). 우리말 'ㄹ'과 'ㄷ' 사이의 가벼운 소리예요. 혀끝으로 윗잇몸을 톡 치듯이 발음해요."},
 {g:"기본 글자(오십음도)",label:"わ행 · ん",chars:H.slice(43,46),tip:"わ(와) を(오) ん(응). を는 'wo'라고 쓰지만 소리는 'o(오)'이고, 조사(〜을/를)로만 써요. ん은 받침 소리라 뒤에 오는 글자에 따라 'ㄴ·ㅇ·ㅁ'처럼 들려요(ほん=홍, さんぽ=삼포).",
  ktip:"ワ(와) ヲ(오) ン(응). ヲ는 일상에서 거의 쓰지 않아요. ン은 받침 소리예요(パン=팡, ペン=펜). シ·ソ와 ツ·ン이 헷갈리기 쉬워서 '헷갈리는 글자'에서 구분해 보세요."},
 {g:"탁음 · 반탁음 (점이 붙은 글자)",label:"が행",chars:D.slice(0,5),tip:"か행 글자에 점 두 개(゛)가 붙으면 'ㄱ' 소리가 돼요: が(가) ぎ(기) ぐ(구) げ(게) ご(고). 단어 가운데에서는 코를 살짝 울리는 'ㅇ' 소리로 들릴 때도 있어요."},
 {g:"탁음 · 반탁음 (점이 붙은 글자)",label:"ざ행",chars:D.slice(5,10),tip:"さ행에 점(゛)이 붙으면 'ㅈ' 소리가 돼요: ざ(자) じ(지) ず(즈) ぜ(제) ぞ(조)."},
 {g:"탁음 · 반탁음 (점이 붙은 글자)",label:"だ행",chars:D.slice(10,15),tip:"た행에 점(゛)이 붙으면 'ㄷ' 소리: だ(다) ぢ(지) づ(즈) で(데) ど(도). ぢ와 づ는 じ·ず와 소리가 같고 거의 쓰지 않아요."},
 {g:"탁음 · 반탁음 (점이 붙은 글자)",label:"ば행",chars:D.slice(15,20),tip:"は행에 점(゛)이 붙으면 'ㅂ' 소리: ば(바) び(비) ぶ(부) べ(베) ぼ(보)."},
 {g:"탁음 · 반탁음 (점이 붙은 글자)",label:"ぱ행",chars:D.slice(20,25),tip:"は행에 동그라미(゜)가 붙으면 'ㅍ' 소리(반탁음): ぱ(파) ぴ(피) ぷ(푸) ぺ(페) ぽ(포)."},
 {g:"요음 (작은 ゃ ゅ ょ)",label:"きゃ·しゃ·ちゃ·にゃ",chars:Y.slice(0,12),tip:"い단 글자(き し ち に) 뒤에 작은 や·ゆ·よ를 붙이면 한 글자처럼 합쳐 읽어요: きゃ(캬) きゅ(큐) きょ(쿄). 작게 쓰는 것이 포인트예요(きや와 きゃ는 달라요).",
  ktip:"キ シ チ ニ 뒤에 작은 ャ ュ ョ를 붙이면 한 글자처럼 합쳐 읽어요: キャ(캬) キュ(큐) キョ(쿄)."},
 {g:"요음 (작은 ゃ ゅ ょ)",label:"ひゃ·みゃ·りゃ",chars:Y.slice(12,21),tip:"ひ み り에도 같은 방식으로 붙어요: ひゃ(햐) みゃ(먀) りゃ(랴)."},
 {g:"요음 (작은 ゃ ゅ ょ)",label:"ぎゃ·じゃ·びゃ·ぴゃ",chars:Y.slice(21,33),tip:"점이 있는 글자에도 붙어요: ぎゃ(갸) じゃ(자) びゃ(뱌) ぴゃ(퍄). じゃ·じゅ·じょ는 '자·주·조'로 읽어요."},
 {g:"특수 표기",label:"작은 っ · 장음",chars:[],special:true,tip:"작은 っ(ッ)는 뒤 소리를 짧게 막는 받침이에요: がっこう(각꼬-), きって(킫테). 소리를 길게 끄는 장음은 히라가나는 모음을 하나 더 써요(おかあさん, おおきい, ありがとう). 가타카나는 ー로 써요(コーヒー=코-히-).",
  ktip:"작은 ッ는 뒤 소리를 짧게 막는 받침이에요: サッカー(삭카-), ネット(넷토). 장음은 ー로 써요: コーヒー(코-히-), ケーキ(케-키)."}
];
LESSONS.forEach((L,i)=>L.i=i);
/* 단어(표기, 뜻). 어느 레슨에서 읽을 수 있는지는 글자로 자동 계산해요 */
const WH=[["あい","사랑"],["いえ","집"],["うえ","위"],["あお","파랑"],["あう","만나다"],["いい","좋다"],["おおい","많다"],
["かお","얼굴"],["いけ","연못"],["くち","입"],["こえ","목소리"],["あき","가을"],["えき","역"],["かく","쓰다"],["きく","듣다"],["かい","조개"],["ここ","여기"],["あかい","빨갛다"],["いか","오징어"],
["さけ","술"],["すし","초밥"],["せかい","세계"],["しお","소금"],["あさ","아침"],["いし","돌"],["おかし","과자"],["すいか","수박"],["さかな","생선"],["かさ","우산"],["あおい","파랗다"],
["たこ","문어"],["つき","달"],["てがみ","편지"],["とけい","시계"],["あした","내일"],["たかい","높다·비싸다"],["ちかく","근처"],["いくつ","몇 개"],["あつい","덥다"],["こたえ","대답"],["うた","노래"],
["なつ","여름"],["にく","고기"],["ぬの","천"],["ねこ","고양이"],["のり","김"],["いぬ","개"],["さくら","벚꽃"],["なに","무엇"],["おなか","배(몸)"],["にし","서쪽"],["ねる","자다"],["こねこ","새끼 고양이"],
["はな","꽃"],["ひと","사람"],["ふね","배(선박)"],["へや","방"],["ほし","별"],["はは","엄마"],["ひかり","빛"],["はる","봄"],["ふく","옷"],["ひこうき","비행기"],
["まど","창문"],["みみ","귀"],["むし","벌레"],["もも","복숭아"],["まめ","콩"],["うみ","바다"],["あめ","비"],["みせ","가게"],["こめ","쌀"],["かめ","거북이"],
["やま","산"],["ゆき","눈(雪)"],["よる","밤"],["やすみ","휴일"],["ゆめ","꿈"],["やさい","채소"],["よむ","읽다"],["やすい","싸다"],
["くるま","자동차"],["れきし","역사"],["ろく","6"],["くり","밤(栗)"],["らいねん","내년"],["りす","다람쥐"],["さる","원숭이"],
["わたし","나"],["ほん","책"],["みかん","귤"],["かわ","강"],["わに","악어"],["せんせい","선생님"],["れんしゅう","연습"],["ほんだな","책장"],
["かぎ","열쇠"],["ぎんこう","은행"],["ごはん","밥"],["かがみ","거울"],["えがお","웃는 얼굴"],["かぜ","바람"],["ぞう","코끼리"],["ざる","소쿠리"],["ひざ","무릎"],
["だいがく","대학"],["からだ","몸"],["でんわ","전화"],["ともだち","친구"],["だれ","누구"],["かばん","가방"],["ばら","장미"],["ぶどう","포도"],["へび","뱀"],["ぱん","빵"],["えんぴつ","연필"],["さんぽ","산책"],
["しゃしん","사진"],["おちゃ","차(茶)"],["しゅくだい","숙제"],["ひゃく","100"],["りょこう","여행"],["びょういん","병원"],["じゃがいも","감자"],["ぎゅうにゅう","우유"],["きゃく","손님"],["ちょうちょう","나비"],
["がっこう","학교"],["ざっし","잡지"],["きって","우표"],["にっき","일기"],["せっけん","비누"],["おおきい","크다"],["ありがとう","고맙습니다"],["おとうさん","아버지"],["ゆうびん","우편"]];
const WK=[["ココア","코코아"],["キウイ","키위"],["ケーキ","케이크"],["コアラ","코알라"],
["スイカ","수박"],["ソース","소스"],["スカイ","하늘(sky)"],["キス","키스"],["アイス","아이스크림"],["ケース","케이스"],["スーツ","정장"],["シーソー","시소"],
["テスト","시험"],["タクシー","택시"],["チーズ","치즈"],["スタート","출발"],["タイ","태국"],["ツアー","투어"],["セーター","스웨터"],
["ナイフ","나이프"],["ノート","공책"],["ネクタイ","넥타이"],["ナース","간호사"],["ニース","니스(도시)"],
["ヒーター","히터"],["ハート","하트"],["ハーフ","절반"],["ホース","호스"],["ヘア","머리카락"],["ハイスクール","고등학교"],
["マスク","마스크"],["メモ","메모"],["マイク","마이크"],["モーター","모터"],["ミキサー","믹서"],["メニュー","메뉴"],
["タイヤ","타이어"],["ヨーヨー","요요"],["ユーモア","유머"],["ヤード","야드"],
["ライス","밥(rice)"],["リスト","목록"],["ルール","규칙"],["レモン","레몬"],["ラーメン","라멘"],["ロケット","로켓"],["カメラ","카메라"],["ミルク","우유"],["ホテル","호텔"],
["ワイン","와인"],["パン","빵"],["ペン","펜"],["メロン","멜론"],["ランチ","점심"],["ペンギン","펭귄"],["レストラン","레스토랑"],
["ゲーム","게임"],["ガス","가스"],["ガム","껌"],["ギター","기타"],["ゴール","골"],["ゼロ","제로"],["ズボン","바지"],["ダンス","댄스"],["ドア","문"],["ドラマ","드라마"],["デザート","디저트"],
["バス","버스"],["ビール","맥주"],["ボール","공"],["ピアノ","피아노"],["ポスト","우체통"],["プール","수영장"],["ピザ","피자"],["ベッド","침대"],
["シャツ","셔츠"],["ジュース","주스"],["チョコレート","초콜릿"],["ジャム","잼"],["キャンプ","캠프"],["シャワー","샤워"],["ニュース","뉴스"],["シャンプー","샴푸"],["ジャズ","재즈"],["チャンス","기회"],
["サッカー","축구"],["ネット","인터넷"],["コーヒー","커피"],["ホットケーキ","핫케이크"],["チケット","티켓"],["ラッキー","행운"],["バッグ","가방"]];
const charLesson={}; LESSONS.forEach(L=>L.chars.forEach(c=>{ charLesson[c[0]]=L.i; }));
const SPECIAL=LESSONS.findIndex(L=>L.special);
function reqOf(word){ const w=toH(word); let req=-1;
  for(let n=0;n<w.length;n++){ const c=w[n]; let r;
    if(c==="ー") r=0; else if(c==="っ") r=SPECIAL;
    else if("ゃゅょ".includes(c)){ r=charLesson[w[n-1]+c]; }
    else r=charLesson[c];
    if(r===undefined) return 99; req=Math.max(req,r); }
  return req; }
const pool=k=>(k?WK:WH).map(([w,m])=>({w,m,req:reqOf(w)})).filter(x=>x.req<99);
function lessonWords(L,k){ const P=pool(k); let nw=P.filter(x=>x.req===L.i); if(nw.length<4){ const cs=new Set(L.chars.map(c=>toH(c[0]))); const rev=P.filter(x=>x.req<L.i&&[...toH(x.w)].some(ch=>cs.has(ch))); nw=nw.concat(shuffle(rev).slice(0,4-nw.length)); } return nw.slice(0,8); }
const lessonChars=(L,k)=>k?L.chars.map(([c,r,ko])=>[toK(c),r,ko]):L.chars;
const lessonLabel=(L,k)=>k?toK(L.label):L.label;
const key=(L,k)=>(k?"k":"h")+L.i;
const done=()=>LS.get("jp-kana",{done:{}});
const save=d=>LS.set("jp-kana",d);
const canVoice=()=>"speechSynthesis" in window && speechSynthesis.getVoices().some(v=>/^ja/i.test(v.lang));
const say=(t,r)=>{ try{ speakJa(t,r||.8); }catch(e){} };
const inq=on=>document.body.classList.toggle("inq",!!on);
const root=()=>$("quizView");
const ST=document.createElement("style");
ST.textContent=`.kana{max-width:640px;margin:0 auto}.kana h2{margin:4px 0 2px;font-size:24px}.kana h3{margin:22px 0 8px;font-size:17px}
.kana .sub{margin:2px 0 10px;line-height:1.55}
.kseg{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:var(--chip);border-radius:14px;padding:4px;margin:12px 0}
.kseg button{border:0;background:transparent;border-radius:11px;padding:12px 6px;font:inherit;font-size:16px;font-weight:700;color:var(--sub);cursor:pointer;line-height:1.3}
.kseg button small{display:block;font-weight:500;font-size:12px}
.kseg button.on{background:var(--card);color:var(--accent);box-shadow:0 1px 4px rgba(0,0,0,.12)}
.kguide{display:flex;gap:8px;margin:6px 0 4px;font-size:13px;color:var(--sub)}.kguide span{flex:1;background:var(--chip);border-radius:10px;padding:8px 6px;text-align:center;line-height:1.35}.kguide b{display:block;color:var(--text);font-size:14px}
.kchart{display:grid;grid-template-columns:46px repeat(5,minmax(0,1fr));gap:5px;margin:8px 0}
.kchart .rl{display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--accent);background:var(--accent-soft);border-radius:8px}
.kchart .hd{font-size:11px;color:var(--sub);text-align:center}
.kgrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:10px 0}
.kc{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 0 6px;text-align:center;cursor:pointer;font:inherit;color:var(--text);min-height:62px}
.kc b{display:block;font-size:26px;line-height:1.2}.kc small{display:block;font-size:11px;color:var(--sub)}.kc.empty{visibility:hidden;border:0}
.kc:active{background:var(--accent-soft)}
.kdet{border:1px solid var(--line);border-radius:14px;background:var(--card);margin:10px 0;padding:0 12px}.kdet summary{padding:12px 2px;font-weight:700;cursor:pointer}
.kcta{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:var(--accent);color:#fff;border:0;border-radius:18px;padding:14px 16px;margin:14px 0 4px;font:inherit;cursor:pointer}
.kcta .kg{font-size:34px;line-height:1}.kcta b{display:block;font-size:17px}.kcta small{opacity:.85}
.kgh{margin:20px 0 6px;font-size:13px;font-weight:700;color:var(--sub);display:flex;justify-content:space-between}
.klesson{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:11px 14px;margin:7px 0;font:inherit;color:var(--text);cursor:pointer}
.klesson .kn{width:32px;height:32px;border-radius:50%;background:var(--accent-soft);color:var(--accent);display:flex;align-items:center;justify-content:center;font-weight:700;flex:none;font-size:14px}
.klesson.ok .kn{background:var(--accent);color:#fff}.klesson .kt{flex:1;min-width:0}.klesson b{display:block;font-size:16px}.klesson small{color:var(--sub);font-size:12px}
.klesson .kp{font-size:20px;letter-spacing:.06em;white-space:nowrap;color:var(--text);opacity:.75}
.ktip{background:var(--accent-soft);border-radius:12px;padding:12px 14px;margin:10px 0;font-size:14px;line-height:1.65}
.kbig{font-size:84px;text-align:center;margin:10px 0;line-height:1.2}.kword{font-size:44px;text-align:center;margin:10px 0}
.ksim{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}.ksim .kc{width:72px}
.kbtns{display:grid;gap:8px;margin-top:16px}
@media(max-width:380px){.klesson .kp{font-size:16px}.kc b{font-size:23px}}`;
document.head.appendChild(ST);
let K={tab:"h"};
const cellBtn=c=>c?`<button class="kc" data-kana="say" data-t="${c[0]}"><b>${c[0]}</b><small>${c[2]} · ${c[1]}</small></button>`:`<span class="kc empty"></span>`;
function chartHTML(k){
  const map=a=>a.map(([c,r,ko])=>[k?toK(c):c,r,ko]);
  const base=map(H), rows=[["あ행",base.slice(0,5)],["か행",base.slice(5,10)],["さ행",base.slice(10,15)],["た행",base.slice(15,20)],["な행",base.slice(20,25)],["は행",base.slice(25,30)],["ま행",base.slice(30,35)],["や행",[base[35],null,base[36],null,base[37]]],["ら행",base.slice(38,43)],["わ행",[base[43],null,base[44],null,base[45]]]];
  const th=["あ단","い단","う단","え단","お단"].map(x=>`<span class="hd">${k?toK(x):x}</span>`).join("");
  return `<div class="kchart"><span></span>${th}${rows.map(([l,a])=>`<span class="rl">${k?toK(l):l}</span>${a.map(cellBtn).join("")}`).join("")}</div>`;
}
function nextLesson(k){ const d=done().done; return LESSONS.find(L=>!d[key(L,k)]); }
function renderHome(){
  inq(false); const k=K.tab==="k", d=done().done, doneN=LESSONS.filter(L=>d[key(L,k)]).length, nx=nextLesson(k);
  let groups=""; let lastG="";
  LESSONS.forEach(L=>{ if(L.g!==lastG){ lastG=L.g; const gl=LESSONS.filter(x=>x.g===L.g), gd=gl.filter(x=>d[key(x,k)]).length; groups+=`<div class="kgh"><span>${L.g}</span><span>${gd} / ${gl.length}</span></div>`; }
    const ch=lessonChars(L,k).slice(0,5).map(c=>c[0]).join(" ")||(k?"ッ ー":"っ ー");
    groups+=`<button class="klesson ${d[key(L,k)]?"ok":""}" data-kana="lesson" data-i="${L.i}"><span class="kn">${d[key(L,k)]?"✓":L.i+1}</span><span class="kt"><b>${lessonLabel(L,k)}</b><small>${L.chars.length?L.chars.length+"글자":"촉음·장음"} · 소리 듣기 · 문제 풀이</small></span><span class="kp">${ch}</span></button>`; });
  root().innerHTML=`<div class="kana"><h2>일본어 글자 입문</h2>
  <div class="sub">일본어 글자를 처음부터 배워요. <b>① 글자표로 훑어보고 → ② 행별 레슨으로 하나씩 → ③ 전체 시험</b> 순서로 진행해 보세요. 글자를 누르면 소리가 나요.</div>
  <div class="kseg"><button class="${k?"":"on"}" data-kana="tab" data-t="h">히라가나<small>ひらがな · 기본 글자</small></button><button class="${k?"on":""}" data-kana="tab" data-t="k">가타카나<small>カタカナ · 외래어</small></button></div>
  <div class="ktip">${k?"가타카나는 외래어·외국 이름·강조에 써요(예: コーヒー, ソウル). 각진 글자예요. 히라가나를 먼저 익히면 훨씬 쉬워요.":"히라가나는 일본 고유의 단어와 문법에 써요(예: ありがとう). 둥글둥글한 글자예요. 먼저 이것부터 익혀요."}</div>
  <h3>① 글자표 <small style="font-weight:400;color:var(--sub)">· 눌러서 소리 듣기</small></h3>${chartHTML(k)}
  <details class="kdet"><summary>탁음·반탁음 글자표 (점 ゛ ゜ 이 붙은 글자)</summary><div class="kgrid">${D.map(([c,r,ko])=>cellBtn([k?toK(c):c,r,ko])).join("")}</div></details>
  <details class="kdet"><summary>요음 글자표 (작은 ゃ ゅ ょ)</summary><div class="kgrid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${Y.map(([c,r,ko])=>cellBtn([k?toK(c):c,r,ko])).join("")}</div></details>
  <h3>② 행별 레슨 <small style="font-weight:400;color:var(--sub)">· ${doneN} / ${LESSONS.length} 완료</small></h3>
  ${nx?`<button class="kcta" data-kana="lesson" data-i="${nx.i}"><span class="kg">${(lessonChars(nx,k)[0]||[k?"ッ":"っ"])[0]}</span><span><b>${doneN?"이어서 하기":"여기서 시작하기"}: ${lessonLabel(nx,k)}</b><small>${nx.i+1}번째 레슨</small></span></button>`:`<div class="ktip">레슨을 모두 마쳤어요! 아래 전체 시험에 도전해 보세요.</div>`}
  ${groups}
  <h3>③ 마무리</h3><div class="kbtns"><button class="cta" data-kana="final">${k?"가타카나":"히라가나"} 전체 시험 (20문제)</button><button class="cta sec" data-kana="confuse">헷갈리는 글자 구분하기</button><button class="cta sec" data-kana="exit">퀴즈 메뉴로</button></div></div>`;
}
function renderConfuse(){
  inq(false);
  const pairs=[["さ","き"],["ぬ","め"],["ろ","る"],["わ","れ","ね"],["は","ほ"],["あ","お"],["シ","ツ"],["ソ","ン"],["ク","ケ"],["ウ","ワ"],["フ","ワ"],["ミ","シ"]];
  const info={"さ":"さ(사)는 아래가 열려 있어요","き":"き(키)는 가로선이 두 줄이에요","ぬ":"ぬ(누)는 꼬리가 둥글게 감겨요","め":"め(메)는 꼬리 없이 열려 있어요","ろ":"ろ(로)는 끝이 열려 있어요","る":"る(루)는 끝에 동그란 고리가 있어요","わ":"わ(와)는 뾰족하게 꺾여요","れ":"れ(레)는 오른쪽 아래가 꺾여요","ね":"ね(네)는 끝에 고리가 있어요","は":"は(하)는 오른쪽이 닫혀 있어요","ほ":"ほ(호)는 가로선이 한 줄 더 있어요","あ":"あ(아)는 가운데서 교차해 안으로 말려요","お":"お(오)는 위에 점이 있고 오른쪽이 말려요","シ":"シ(시)는 점 두 개가 옆으로 누워요(↘)","ツ":"ツ(츠)는 점 두 개가 위에서 아래로 내려와요(↓)","ソ":"ソ(소)는 점 하나가 위로 짧고 선이 비스듬해요","ン":"ン(응)은 점이 아래에서 위로(↗) 올라가요","ク":"ク(쿠)는 위 획이 짧게 시작해요","ケ":"ケ(케)는 가로선이 먼저 나와요","ウ":"ウ(우)는 위에 점이 있어요","ワ":"ワ(와)는 점 없이 뚜껑만 있어요","フ":"フ(후)는 한 획으로 꺾여요","ミ":"ミ(미)는 가로선 세 줄이에요"};
  root().innerHTML=`<div class="kana"><button class="back" data-kana="home">${ic("back")}입문 코스</button><h2>헷갈리는 글자</h2><div class="sub">모양이 비슷해서 자주 틀리는 글자예요. 눌러서 소리도 들어 보세요.</div>
  ${pairs.map(p=>`<div class="ktip"><div class="ksim">${p.map(c=>`<button class="kc" data-kana="say" data-t="${c}"><b>${c}</b></button>`).join("")}</div>${p.map(c=>info[c]||"").filter(Boolean).join("<br>")}</div>`).join("")}</div>`;
}
function renderLesson(L,k){
  inq(false);
  const ch=lessonChars(L,k), words=lessonWords(L,k), nxt=LESSONS[L.i+1], prv=LESSONS[L.i-1];
  root().innerHTML=`<div class="kana"><button class="back" data-kana="home">${ic("back")}글자표·레슨 목록</button><h2>레슨 ${L.i+1}. ${lessonLabel(L,k)}</h2><div class="sub">${k?"가타카나":"히라가나"} · ${L.g}</div>
  <div class="ktip">${k?(L.ktip||toK(L.tip)):L.tip}</div>
  ${ch.length?`<div class="kgrid" style="grid-template-columns:repeat(${ch.length%3===0&&ch.length>5?3:5},minmax(0,1fr))">${ch.map(cellBtn).join("")}</div>`:""}
  <h3>${ch.length?"이 글자가 들어간 단어":"단어로 읽어 보기"}</h3>${words.length?`<div class="kgrid" style="grid-template-columns:repeat(2,minmax(0,1fr))">${words.map(x=>`<button class="kc" data-kana="say" data-t="${x.w}"><b style="font-size:22px">${x.w}</b><small>${x.m}</small></button>`).join("")}</div>`:`<div class="sub">이 행에서 새로 읽을 수 있는 단어는 아직 없어요. 다음 행에서 단어를 읽게 돼요.</div>`}
  <div class="kbtns"><button class="cta" data-kana="start" data-i="${L.i}">연습 문제 풀기 (10문제)</button>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="cta sec" data-kana="lesson" data-i="${prv?prv.i:L.i}" ${prv?"":"disabled"}>‹ 이전 레슨</button><button class="cta sec" data-kana="lesson" data-i="${nxt?nxt.i:L.i}" ${nxt?"":"disabled"}>다음 레슨 ›</button></div></div></div>`;
}
/* 문제 만들기 */
function mkQuestions(targets,optChars,words,wordPool,n){
  const voice=canVoice(), qs=[], kos=[...new Set(optChars.map(c=>c[2]))];
  let types=targets.length?(voice?["hear","ko","kana","word"]:["ko","kana","word"]):["word"]; if(!wordPool.length||wordPool.length<4||!words.length) types=types.filter(t=>t!=="word");
  if(!types.length) types=["ko"];
  const mix=(good,all)=>shuffle([good,...shuffle([...new Set(all)].filter(x=>x!==good)).slice(0,3)]);
  for(let i=0;i<n;i++){ const t=types[i%types.length];
    if(t==="word"){ const w=words[Math.floor(Math.random()*words.length)]; qs.push({t:"word",big:w.w,ans:w.m,opts:mix(w.m,wordPool.map(x=>x.m)),say:w.w,note:`${w.w} = ${w.m}`}); continue; }
    const c=targets[Math.floor(Math.random()*targets.length)];
    if(t==="hear") qs.push({t,ans:c[0],opts:mix(c[0],optChars.map(x=>x[0])),say:c[0],note:`${c[0]} = ${c[2]} (${c[1]})`});
    else if(t==="kana") qs.push({t,big:c[2],sub:"이 소리의 글자는?",ans:c[0],opts:mix(c[0],optChars.map(x=>x[0])),say:c[0],note:`${c[2]} = ${c[0]} (${c[1]})`});
    else qs.push({t:"ko",big:c[0],sub:"이 글자는 어떻게 읽을까요?",ans:c[2],opts:mix(c[2],kos),say:c[0],note:`${c[0]} = ${c[2]} (${c[1]})`}); }
  return qs;
}
function startLesson(L,k){
  const targets=lessonChars(L,k); const prev=LESSONS.slice(0,L.i).flatMap(x=>lessonChars(x,k));
  const optChars=targets.concat(shuffle(prev).slice(0,10)); if(optChars.length<4) optChars.push(...lessonChars(LESSONS[LESSONS.length>0?0:0],k));
  const wp=pool(k).filter(x=>x.req<=L.i), words=lessonWords(L,k).map(x=>({w:x.w,m:x.m}));
  K={...K,tab:k?"k":"h",lessonI:L.i,k,title:`레슨 ${L.i+1} · ${lessonLabel(L,k)}`,lessonKey:key(L,k),qs:mkQuestions(targets,optChars,words,wp.map(x=>({w:x.w,m:x.m})),10),i:0,score:0,sel:null}; renderQ();
}
function startFinal(k){
  const all=LESSONS.flatMap(L=>lessonChars(L,k)), wp=pool(k).map(x=>({w:x.w,m:x.m}));
  K={...K,tab:k?"k":"h",lessonI:null,k,title:(k?"가타카나":"히라가나")+" 전체 시험",lessonKey:null,qs:mkQuestions(all,all,wp,wp,20),i:0,score:0,sel:null}; renderQ();
}
function renderQ(){
  const q=K.qs[K.i]; if(!q) return renderResult(); inq(true);
  const prompts={hear:"들리는 글자는?",ko:q.sub,kana:q.sub,word:"이 단어의 뜻은?"}, dn=K.sel!==null;
  const big=q.t==="hear"?`<button class="cta sec" data-kana="replay" style="max-width:240px;margin:14px auto">소리 듣기 ▶</button>`:`<div class="${q.t==="word"?"kword":"kbig"}">${q.big}</div>`;
  root().innerHTML=`<div class="kana"><div class="qtop"><button class="qx" data-kana="home" aria-label="그만하기">×</button><div class="prog"><div style="width:${Math.round(K.i/K.qs.length*100)}%"></div></div></div>
  <div class="sub">${K.title} · ${K.i+1} / ${K.qs.length}</div><div class="sub jprompt" style="text-align:center">${prompts[q.t]}</div>${big}
  <div class="opts4">${q.opts.map((o,i)=>{ let c=""; if(dn){ if(o===q.ans) c="correct"; else if(i===K.sel) c="wrong"; } return `<button class="opt ${c}" data-kana="ans" data-i="${i}" ${dn?"disabled":""}><kbd>${i+1}</kbd><span style="font-size:${/[ぁ-んァ-ヶー]/.test(o)?"24px":"inherit"}">${o}</span></button>`; }).join("")}</div>
  ${dn?`<div class="reveal ${q.opts[K.sel]===q.ans?"ok":"ng"}" style="position:static;margin-top:14px;border-radius:16px"><div class="rvt">${q.opts[K.sel]===q.ans?"정답이에요!":"아쉬워요"}</div><div>${q.note}</div><div class="qbtns"><button class="cta" data-kana="next">${K.i+1>=K.qs.length?"결과 보기":"계속하기"}</button></div></div>`:""}</div>`;
  if(!dn&&q.t==="hear") setTimeout(()=>{ if(K&&K.qs&&K.qs[K.i]===q&&K.sel===null) say(q.say); },200);
}
function renderResult(){
  inq(false); const n=K.qs.length, pct=Math.round(K.score/n*100), ok=pct>=70;
  if(ok&&K.lessonKey){ const d=done(); d.done[K.lessonKey]=true; save(d); }
  const nxt=K.lessonI!=null?LESSONS[K.lessonI+1]:null;
  root().innerHTML=`<div class="kana" style="text-align:center"><h2>${K.title} 결과</h2><div class="score" style="font-size:44px;margin:16px 0">${K.score} / ${n}</div>
  <div class="sub">${ok?(K.lessonKey?"합격! 이 레슨을 완료로 표시했어요.":"잘했어요!"):"70% 이상이면 완료로 표시돼요. 글자표를 한 번 더 보고 다시 도전해 보세요."}</div>
  <div class="qbtns" style="flex-direction:column;align-items:stretch;max-width:380px;margin:18px auto 0">${ok&&nxt?`<button class="cta" data-kana="lesson" data-i="${nxt.i}">다음 레슨: ${lessonLabel(nxt,K.k)}</button><button class="cta sec" data-kana="again">다시 풀기</button>`:`<button class="cta" data-kana="again">다시 풀기</button>`}<button class="cta sec" data-kana="home">글자표·레슨 목록으로</button></div></div>`;
  if(ok&&typeof sakura==="function") sakura(14);
}
function open(){ K={tab:K.tab||"h"}; setView("quiz"); document.body.classList.add("kanamode"); renderHome(); window.scrollTo(0,0); }
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-kana]"); if(!b) return; const a=b.dataset.kana;
  if(a!=="open"&&!root().contains(b)) return;
  const L=LESSONS[+b.dataset.i];
  if(a==="open") open();
  else if(a==="home"){ K={tab:K.tab||"h"}; renderHome(); window.scrollTo(0,0); }
  else if(a==="exit"){ inq(false); setView("quiz"); }
  else if(a==="tab"){ K={tab:b.dataset.t}; renderHome(); }
  else if(a==="say") say(b.dataset.t);
  else if(a==="confuse"){ renderConfuse(); window.scrollTo(0,0); }
  else if(a==="lesson"){ K={...K}; renderLesson(L,K.tab==="k"); window.scrollTo(0,0); }
  else if(a==="start"){ startLesson(L,K.tab==="k"); window.scrollTo(0,0); }
  else if(a==="final"){ startFinal(K.tab==="k"); window.scrollTo(0,0); }
  else if(a==="ans"){ if(!K.qs||K.sel!==null) return; K.sel=+b.dataset.i; const q=K.qs[K.i]; if(q.opts[K.sel]===q.ans) K.score++; renderQ(); }
  else if(a==="next"){ K.i++; K.sel=null; renderQ(); window.scrollTo(0,0); }
  else if(a==="replay") say(K.qs[K.i].say);
  else if(a==="again"){ if(K.lessonI!=null) startLesson(LESSONS[K.lessonI],K.k); else startFinal(K.k); window.scrollTo(0,0); }
});
window.KANA={open};
})();
