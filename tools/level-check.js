#!/usr/bin/env node
/* 기사 급수 적합도 검사
 * 사용: node tools/level-check.js            (모든 기사)
 *       node tools/level-check.js d20261112a  (id로 골라서)
 *       V=1 node tools/level-check.js a04     (걸린 단어를 급수별로 보기)
 * 기사 본문에서 앱 단어장에 걸린 단어 가운데 '기사 급수 이상(같은 급수 또는 더 어려운)' 단어의 비율을 계산해요.
 * 기준: N4·N3·N2는 40% 이상, N1은 25% 이상(N1 단어는 어휘 중 가장 드문 층이라 자연스러운 글로 40%를 채우기 어려워요).
 *       N5는 사실상 모든 단어가 해당하므로 항상 통과해요. 미달이면 종료 코드 1.
 * words-lv.json 은 index.html이 만든 단어 목록 스냅샷이에요([표기(어간), 품사, 급수]). 단어 급수를 바꾸면 다시 만들어요.
 * 새 기사는 이 검사를 통과하게 쓰세요. 어려운 급수일수록 그 급수의 단어(예: N2 기사는 N2·N1 단어)를 충분히 넣어야 해요.
 */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const ctx={window:{}}; vm.createContext(ctx);
["daily.js","articles.js"].forEach(f=>{ try{ vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx); }catch(e){ console.error(f+" 읽기 실패: "+e.message); process.exit(2);} });
const arts=[].concat(ctx.window.DAILY_ARTICLES||[],ctx.window.ARTICLES||[]);
const words=JSON.parse(fs.readFileSync(path.join(__dirname,"words-lv.json"),"utf8"));
const RANK={N5:5,N4:4,N3:3,N2:2,N1:1};
const KJ=/[一-鿿々]/;
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const plain=s=>s.replace(/\[[^\]]*\]/g,"");
const ms=[]; words.forEach(([t,pos,lv])=>{
  if(!t||(t.length<2&&!KJ.test(t))) return;
  const hasK=KJ.test(t); let pat=esc(t);
  if(hasK&&!KJ.test(t.slice(-1))&&["一段動詞","五段動詞","い形容詞"].includes(pos)){ const stem=t.slice(0,-1); pat=stem.length===1?"(?<![\\u4e00-\\u9fff々])"+esc(stem)+"(?![\\u4e00-\\u9fff々])":esc(stem); }
  else if(!hasK&&t.length<3) return;
  ms.push({lv,re:new RegExp(pat,"g"),t});
});
function hits(text){
  const rs=[]; ms.forEach(m=>{ m.re.lastIndex=0; let x; while((x=m.re.exec(text))){ if(!x[0]){m.re.lastIndex++;continue;} rs.push([x.index,x.index+x[0].length,m]); } });
  rs.sort((a,b)=>a[0]-b[0]||b[1]-a[1]); let pos=0; const h=new Set();
  for(const [s,e,m] of rs){ if(s<pos) continue; pos=e; h.add(m); } return [...h];
}
if(process.argv[2]==="--text"){ /* node tools/level-check.js --text N3 "문장..." : 글 한 편의 적합도를 미리 보기 */
  const lv=process.argv[3], h=hits(plain(process.argv[4]||"")), ge=h.filter(m=>RANK[m.lv]<=RANK[lv]).length;
  console.log(`${lv} ${(ge/h.length*100).toFixed(0)}% (${ge}/${h.length})`); ["N1","N2","N3","N4","N5"].forEach(l=>console.log("  "+l+": "+h.filter(m=>m.lv===l).map(m=>m.t).join(" "))); process.exit(0); }
const ids=process.argv.slice(2); let bad=0;
arts.filter(a=>!ids.length||ids.includes(a.id)).forEach(a=>{
  const h=hits(plain(a.title)+" "+a.body.map(s=>plain(s.ja)).join("")); const n=h.length;
  const ge=h.filter(m=>RANK[m.lv]<=RANK[a.lv]).length, r=n?ge/n:0, ok=r>=(a.lv==="N1"?0.25:0.4);
  if(!ok) bad++;
  if(process.env.V) console.log("   "+["N1","N2","N3","N4","N5"].map(l=>l+": "+h.filter(m=>m.lv===l).map(m=>m.t).join(" ")).join("\n   "));
  console.log(`${ok?"OK  ":"NG  "}${a.id}\t${a.lv}\t${(r*100).toFixed(0)}%\t(${ge}/${n})`);
});
if(bad){ console.log(bad+"편이 기준 미달이에요"); process.exit(1); }
