/* 게임 화면을 '진짜 게임'처럼: 사이트 위·아래 메뉴를 숨기고, 선명한 배경 + 도톰한 버튼 + 굵은 상태 막대 */
(function(){
const G="body:has(#quizView .gbox)";
const ST=document.createElement("style");
ST.textContent=`
${G}{background:linear-gradient(180deg,#4d7cff 0%,#7a5cff 55%,#b25cff 100%) fixed!important;background-image:none;overflow-x:hidden}
${G}::before{display:none!important}
${G} header{display:none!important}
${G} main{padding:14px 12px 28px!important;max-width:560px;margin:0 auto}
${G} #quizView .gbox{background:none!important;border:0!important;box-shadow:none!important;overflow:visible;padding:8px 0 14px;color:#fff;font-size:17px}
${G} #quizView .gbox .sub,${G} #quizView .gbox p{color:rgba(255,255,255,.88)!important;font-size:13px;margin:4px 0;text-shadow:0 1px 2px rgba(0,0,0,.25)}
${G} #quizView .gbox h2,${G} #quizView .gbox .qw{color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.2)}
/* 상태 칩 */
${G} #quizView .gbox .gstat{gap:6px;margin:6px 0 6px;font-size:15px}
${G} #quizView .gbox .gstat span{background:rgba(20,10,60,.38);border:2px solid rgba(255,255,255,.28);color:#ffe27a;border-radius:14px;padding:5px 12px;font-size:16px;text-shadow:0 1px 0 rgba(0,0,0,.3)}
/* 시간 막대 */
${G} #quizView .gbox .prog{height:22px;border-radius:14px;background:rgba(20,10,60,.4);border:3px solid rgba(255,255,255,.85);box-shadow:inset 0 3px 0 rgba(0,0,0,.18);overflow:hidden;margin:8px 0}
${G} #quizView .gbox .prog div,${G} #gbar{border-radius:10px;background:linear-gradient(180deg,#8dff8a,#22c55e)!important;box-shadow:inset 0 5px 0 rgba(255,255,255,.45)}
${G} #gbar.mid{background:linear-gradient(180deg,#ffd45e,#ff9d0a)!important}
${G} #gbar.low{background:linear-gradient(180deg,#ff8aa8,#ee2d63)!important}
/* 도톰한 타일/버튼 */
${G} #quizView .gbox .opt{background:#fff;color:#2b2150;border:0;border-radius:20px;box-shadow:0 6px 0 #c8c3f0,0 10px 14px rgba(20,10,60,.25);padding:8px 8px;font-size:19px;min-height:46px;line-height:1.25;transition:transform .08s,box-shadow .08s}
${G} #quizView .gbox .opt small{color:#7c75a8;font-size:12px}
${G} #quizView .gbox .opt:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 0 #c8c3f0,0 12px 16px rgba(20,10,60,.28)}
${G} #quizView .gbox .opt:active:not(:disabled){transform:translateY(5px);box-shadow:0 1px 0 #c8c3f0,0 2px 4px rgba(20,10,60,.25)}
${G} #quizView .gbox .opt.sel{background:#fff5b8;box-shadow:0 6px 0 #f2b82a,0 0 0 4px #ffd43b inset,0 0 22px rgba(255,212,59,.75);transform:translateY(-2px)}
${G} #quizView .gbox .opt.good{background:#5be28a;color:#0b3b1d;box-shadow:0 6px 0 #2ea85a;opacity:.9}
${G} #quizView .gbox .opt.good small{color:#0b3b1d}
${G} #quizView .gbox .opt.bad{background:#ff7b8f;color:#fff;box-shadow:0 6px 0 #d83a58}
${G} #quizView .gbox .gcols{gap:10px}${G} #quizView .gbox .gcol{gap:9px}
${G} #quizView .gbox .gst2{filter:drop-shadow(0 1px 0 rgba(0,0,0,.2))}
/* 보조 버튼 */
${G} #quizView .gbox .pill{background:rgba(20,10,60,.38);color:#fff;border:2px solid rgba(255,255,255,.35);border-radius:14px;padding:9px 16px;font-size:15px;box-shadow:0 4px 0 rgba(20,10,60,.3)}
${G} #quizView .gbox .pill.on{background:#ffd43b;color:#4a3300;border-color:#ffe98a;box-shadow:0 4px 0 #d9a400}
${G} #quizView .gbox [data-act=gquit]{position:fixed;top:12px;right:12px;z-index:30;font-size:0;width:44px;height:44px;padding:0;border-radius:50%}
${G} #quizView .gbox [data-act=gquit]::before{content:"✕";font-size:20px;line-height:40px;color:#fff}
${G} #quizView .gbox input,${G} #quizView .gbox select{background:#fff;color:#2b2150;border:0;border-radius:14px;box-shadow:0 4px 0 #c8c3f0;font-size:18px;padding:12px}
/* 시작 카운트다운 · 결과 */
${G} #quizView .cdnum{color:#ffe27a;font-size:150px;text-shadow:0 6px 0 #d9a400,0 12px 20px rgba(20,10,60,.4)}
${G} #quizView .gbox .score{color:#ffe27a;font-size:72px;text-shadow:0 5px 0 #d9a400}
${G} #quizView .gbox .rank{color:#fff}
${G} #quizView .gbox .newbest{background:#ffd43b;color:#4a3300}
`;
document.head.appendChild(ST);
})();
