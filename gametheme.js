/* 게임 화면을 '진짜 게임'처럼: 사이트 위·아래 메뉴를 숨기고, 선명한 배경 + 도톰한 버튼 + 굵은 상태 막대 */
(function(){
const G="body:has(#quizView .gbox)";
const ST=document.createElement("style");
ST.textContent=`
${G}{background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27360%27%20height%3D%27150%27%20viewBox%3D%270%200%20360%20150%27%3E%3Cg%20fill%3D%27%230f4a31%27%20fill-opacity%3D%27.55%27%3E%3Cpath%20d%3D%27M20%20150V112M20%2040L-2%20112H42Z%27/%3E%3Cpath%20d%3D%27M20%20150h0%27/%3E%3Cpath%20d%3D%27M18%2040L-4%20112h44z%27/%3E%3Cpath%20d%3D%27M96%20150V120L72%20120%2096%2060%20120%20120%2096%20120z%27/%3E%3Cpath%20d%3D%27M96%2020L68%2088H124z%27/%3E%3Cpath%20d%3D%27M180%20150V104L156%20104%20180%2030%20204%20104%20180%20104z%27/%3E%3Cpath%20d%3D%27M180%2014L150%2096H210z%27/%3E%3Cpath%20d%3D%27M262%20150V116L240%20116%20262%2054%20284%20116%20262%20116z%27/%3E%3Cpath%20d%3D%27M262%2024L236%2092H288z%27/%3E%3Cpath%20d%3D%27M334%20150V108L312%20108%20334%2044%20356%20108%20334%20108z%27/%3E%3C/g%3E%3Cg%20fill%3D%27%230b3a26%27%20fill-opacity%3D%27.7%27%3E%3Crect%20x%3D%2716%27%20y%3D%27112%27%20width%3D%278%27%20height%3D%2738%27/%3E%3Crect%20x%3D%2792%27%20y%3D%27116%27%20width%3D%278%27%20height%3D%2734%27/%3E%3Crect%20x%3D%27176%27%20y%3D%27100%27%20width%3D%278%27%20height%3D%2750%27/%3E%3Crect%20x%3D%27258%27%20y%3D%27112%27%20width%3D%278%27%20height%3D%2738%27/%3E%3Crect%20x%3D%27330%27%20y%3D%27104%27%20width%3D%278%27%20height%3D%2746%27/%3E%3C/g%3E%3C/svg%3E") repeat-x left bottom/340px auto fixed,radial-gradient(90% 50% at 50% 0%,rgba(255,244,170,.55) 0%,rgba(255,244,170,0) 70%) fixed,linear-gradient(180deg,#7fd3a0 0%,#43a56e 50%,#23724c 100%) fixed!important;background-image:none;overflow-x:hidden}
${G}::before{display:none!important}
${G} header{display:none!important}
${G} main{padding:62px 12px 28px!important;max-width:560px;margin:0 auto}
${G} #quizView .gbox{background:none!important;border:0!important;box-shadow:none!important;overflow:visible;padding:8px 0 14px;color:#fff;font-size:17px;font-family:'Pretendard','Apple SD Gothic Neo','Noto Sans KR','Hiragino Sans','Yu Gothic','Malgun Gothic',system-ui,sans-serif;font-weight:700;letter-spacing:0}
${G} #quizView .gbox *{font-family:inherit;font-weight:700;letter-spacing:0}
${G} #quizView .gbox .sub,${G} #quizView .gbox p{color:#fff!important;font-size:14px;margin:4px 0}
${G} #quizView .gbox h2,${G} #quizView .gbox .qw{color:#fff}
/* 새로 채워지는 타일 */
@keyframes tilein{from{transform:scale(.55);opacity:0}to{transform:scale(1);opacity:1}}
${G} #quizView .gbox .opt.newin{animation:tilein .28s cubic-bezier(.2,1.4,.4,1)}
/* 시간 표시 참새: 동그란 뱃지 */
${G} #quizView .mbar{padding-top:0;margin:14px 0 10px}
${G} #quizView .mbar .prog{margin:0}
${G} #quizView .monk{top:-12px;width:46px;height:46px;border-radius:50%;background:#fff;border:3px solid #ffd43b;box-shadow:0 4px 0 #d9a400;display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:2}
${G} #quizView .monk svg,${G} #quizView .monk .mascot{width:34px;height:34px;object-fit:contain;animation:none!important;transform:none!important}
@keyframes monkb{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
${G} #quizView .monk{animation:monkb .6s ease-in-out infinite}
${G} #quizView .monk.fast{animation-duration:.3s}
${G} #quizView .mbar::after{content:"★";position:absolute;right:6px;top:-9px;font-size:26px;color:#ffd43b;text-shadow:0 2px 0 #d9a400;z-index:1}
/* 상태 칩 */
${G} #quizView .gbox .gstat{gap:6px;margin:6px 0 6px;font-size:15px}
${G} #quizView .gbox .gstat span{background:none;border:0;color:#fff;padding:0 4px;font-size:18px;font-weight:800;text-shadow:none}
${G} #quizView .gbox .gstat{align-items:center}
/* 시간 막대 */
${G} #quizView .gbox .prog{height:22px;border-radius:14px;background:rgba(20,10,60,.4);border:3px solid rgba(255,255,255,.85);box-shadow:inset 0 3px 0 rgba(0,0,0,.18);overflow:hidden;margin:8px 0}
${G} #quizView .gbox .prog div,${G} #gbar{border-radius:10px;background:linear-gradient(180deg,#f3ff9a,#a4e22a)!important;box-shadow:inset 0 5px 0 rgba(255,255,255,.5)}
${G} #gbar.mid{background:linear-gradient(180deg,#ffd45e,#ff9d0a)!important}
${G} #gbar.low{background:linear-gradient(180deg,#ff8aa8,#ee2d63)!important}
/* 도톰한 타일/버튼 */
${G} #quizView .gbox .opt{font-weight:800;background:#fff;color:#1d1a3d;border:0;border-radius:20px;box-shadow:0 6px 0 #a9d3b6,0 10px 14px rgba(20,10,60,.25);padding:8px 8px;font-size:20px;min-height:46px;line-height:1.3;transition:transform .08s,box-shadow .08s}
${G} #quizView .gbox .opt small{color:#5d5890;font-size:13px;font-weight:700}
${G} #quizView .gbox .opt:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 0 #a9d3b6,0 12px 16px rgba(20,10,60,.28)}
${G} #quizView .gbox .opt:active:not(:disabled){transform:translateY(5px);box-shadow:0 1px 0 #a9d3b6,0 2px 4px rgba(20,10,60,.25)}
${G} #quizView .gbox .opt.sel{background:#fff5b8;box-shadow:0 6px 0 #f2b82a,0 0 0 4px #ffd43b inset,0 0 22px rgba(255,212,59,.75);transform:translateY(-2px)}
${G} #quizView .gbox .opt.good{background:#d4f7a8;color:#1f4d12;box-shadow:0 6px 0 #8fc65a;opacity:.85}
${G} #quizView .gbox .opt.good small{color:#0b3b1d}
${G} #quizView .gbox .opt.bad{background:#ff7b8f;color:#fff;box-shadow:0 6px 0 #d83a58}
${G} #quizView .gbox .gcols{gap:10px}${G} #quizView .gbox .gcol{gap:9px}
${G} #quizView .gbox .gst2{filter:drop-shadow(0 1px 0 rgba(0,0,0,.2))}
/* 보조 버튼 */
${G} #quizView .gbox .pill{background:rgba(20,10,60,.38);color:#fff;border:2px solid rgba(255,255,255,.35);border-radius:14px;padding:9px 16px;font-size:15px;box-shadow:0 4px 0 rgba(20,10,60,.3)}
${G} #quizView .gbox .pill.on{background:#ffd43b;color:#4a3300;border-color:#ffe98a;box-shadow:0 4px 0 #d9a400}
${G} #quizView .gbox [data-act=gquit]{position:fixed;top:12px;right:12px;z-index:30;font-size:0;width:44px;height:44px;padding:0;border-radius:50%}
${G} #quizView .gbox [data-act=gquit]::before{content:"✕";font-size:20px;line-height:40px;color:#fff}
${G} #quizView .gbox input,${G} #quizView .gbox select{background:#fff;color:#2b2150;border:0;border-radius:14px;box-shadow:0 4px 0 #a9d3b6;font-size:18px;padding:12px}
/* 시작 카운트다운 · 결과 */
${G} #quizView .cdnum{color:#ffe27a;font-size:150px;text-shadow:0 6px 0 #d9a400,0 12px 20px rgba(20,10,60,.4)}
${G} #quizView .gbox .score{font-family:'Mochiy Pop One','Jua','Hiragino Maru Gothic ProN',sans-serif!important;font-weight:400!important;color:#ffe27a;font-size:68px;line-height:1.15;text-shadow:0 5px 0 #d9a400}
${G} #quizView .gbox .rank{background:rgba(255,255,255,.2);border:0;color:#fff;border-radius:999px;padding:6px 22px;display:inline-block;font-size:24px}
${G} #quizView .glist .grow{background:#fff;color:#1d1a3d;border:0;border-radius:16px;box-shadow:0 4px 0 #a9d3b6}
${G} #quizView .glist .grow *{color:inherit}
${G} #quizView .glist .grow .gtag{color:#1d1a3d}
${G} #quizView .glist .grow .gk{color:#5d5890}
${G} #quizView .gbox .newbest{background:#ffd43b;color:#4a3300}
`;
document.head.appendChild(ST);
})();
