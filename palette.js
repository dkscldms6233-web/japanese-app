/* 파스텔 색감(코랄+연한 색 칸) · 단순한 홈 · 정리된 위쪽/아래 메뉴. 어두운 모드는 기존 색을 그대로 써요 */
(function(){
const ST=document.createElement("style");
ST.textContent=`
:root{--tb-bg:#e8f2ff;--tb-fg:#1f63cf;--tp-bg:#ffe4ee;--tp-fg:#b3365f;--ty-bg:#fff0d9;--ty-fg:#9a5d00;--tv-bg:#efe7ff;--tv-fg:#5a3bb0}
:root[data-theme=dark]{--tb-bg:#1f2c3f;--tb-fg:#8ab8ff;--tp-bg:#3a2230;--tp-fg:#ff9fc2;--ty-bg:#3a2f1c;--ty-fg:#ffcf7a;--tv-bg:#2c2640;--tv-fg:#c3a8ff}
:root:not([data-theme=dark]){--bg:#ffffff;--card:#ffffff;--text:#3a2420;--sub:#85706a;--line:#f5e6e0;--accent:#ff6f59;--accent-dk:#ee5a43;--accent-text:#d9482f;--accent-soft:#ffeae4;--chip:#fff5f1}
body{background-image:none!important}
header .hin::before,body[data-view=home]::before{display:none!important}
header .theme{display:none}.pfmode .theme{display:flex}
.vb-hid{display:none!important}
.hs .hhero{background:var(--accent-soft);border-radius:22px;padding:16px;margin:6px 0 12px;display:grid;grid-template-columns:auto 1fr;gap:6px 14px;align-items:center}
.hs .hhl .hbw{width:auto}.hs .hhl .hbtag{background:#fff;color:var(--accent-text)}
.hs .hhr small{display:block;color:var(--accent-text);font-size:13px;font-weight:700;margin-bottom:2px}.hs .hhr b{font-size:18px;line-height:1.35}
.hs .hgbar{grid-column:1/-1;height:10px;border-radius:99px;background:rgba(255,255,255,.85);margin-top:8px;overflow:hidden}
.hs .hgbar div{height:100%;border-radius:99px;background:var(--accent);transition:width .3s}
.hs .hgl{grid-column:1/-1;display:flex;justify-content:space-between;font-size:13px;color:var(--sub)}.hs .hgl b{color:var(--accent-text)}
.hs .cta{margin:0 0 12px}
.hs .tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
.hs .tile{border:0;border-radius:18px;padding:14px;text-align:left;display:flex;flex-direction:column;gap:4px;cursor:pointer;font:inherit;min-width:0}
.hs .tile small{font-size:12px;font-weight:700;opacity:.85}.hs .tile b{font-size:15px;line-height:1.35;word-break:keep-all}
.hs .t-blue{background:var(--tb-bg);color:var(--tb-fg)}.hs .t-pink{background:var(--tp-bg);color:var(--tp-fg)}
.hs .hscard{display:block;width:100%;box-sizing:border-box;border:1px solid var(--line);background:var(--card);border-radius:18px;padding:14px 16px;margin:0 0 12px;text-align:left}
.hs .jrbox{border:1px solid var(--line);border-radius:18px;margin:0 0 12px;background:var(--card);overflow:hidden}
.hs .jrbox>summary{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;font-weight:700;cursor:pointer;list-style:none}
.hs .jrbox>summary::-webkit-details-marker{display:none}.hs .jrbox>summary b{color:var(--accent-text);font-size:14px}
.hs .jrbox[open]>summary{border-bottom:1px solid var(--line)}
.hs .jrbox .jr{border:0;margin:0;padding:8px 12px 12px}.hs .jrbox .jrh{display:none}
.hs .devnote{margin:0 0 12px}
#moreDlg{border:0;border-radius:20px;padding:0;max-width:380px;width:calc(100% - 28px);background:var(--card);color:var(--text)}#moreDlg::backdrop{background:rgba(0,0,0,.4)}
#moreDlg .mrow{display:block;position:relative;width:100%;text-align:left;border:0;border-radius:16px;padding:14px 16px;margin-bottom:10px;font:inherit;cursor:pointer}
#moreDlg .mrow b{display:block;font-size:16px}#moreDlg .mrow span{display:block;font-size:13px;margin-top:2px;opacity:.85}
#moreDlg .m1{background:var(--tp-bg);color:var(--tp-fg)}#moreDlg .m2{background:var(--tv-bg);color:var(--tv-fg)}#moreDlg .m3{background:var(--ty-bg);color:var(--ty-fg)}
#moreDlg .vbdot2{position:absolute;right:14px;top:14px;background:var(--accent);color:#fff;font-size:11px;font-weight:800;border-radius:99px;padding:1px 7px}
.pfmode{margin-top:16px;display:flex;align-items:center;justify-content:space-between;gap:8px}.pfmode small{color:var(--sub);font-size:13px}
`;
document.head.appendChild(ST);
})();
