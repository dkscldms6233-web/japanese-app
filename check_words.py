#!/usr/bin/env python3
"""단어 파일 검사: python3 check_words.py
- words-extra.js, words-bulk*.js, words-auto.js 의 단어를 읽어 형식·후리가나·중복을 확인하고 급수별 개수와 목표 대비 남은 수를 출력해요.
- 형식(bulk/auto): 한 줄에 '표기[후리가나]|한국어 뜻|품사코드', 급수는 '#N3' 같은 줄로 바꿔요.
- 품사코드: n 명사 / s 명사+する / 1 일단동사 / 5 오단동사 / i い형 / na な형 / adv 부사 / k 불규칙
"""
import re, glob, os, collections
os.chdir(os.path.dirname(os.path.abspath(__file__)))
TARGET = {"N5": 587, "N4": 775, "N3": 1677, "N2": 2645, "N1": 3500}
KJ = "一-鿿々"
rub = re.compile("([" + KJ + "]+)\\[([^\\]]+)\\]")
PC = {"n", "s", "1", "5", "i", "na", "adv", "k"}
plain = lambda s: re.sub(r"\[[^\]]*\]", "", s)
seen = set(); cnt = collections.Counter(); bad = []
orig = open("index.html", encoding="utf-8").read()
for m in re.finditer(r'\{lv:"(N\d)",f:"([^"]+)"', orig): seen.add(plain(m.group(2))); cnt[m.group(1)] += 1
ex = open("words-extra.js", encoding="utf-8").read()
for m in re.finditer(r'\["(N\d)","([^"]+)"', ex): seen.add(plain(m.group(2))); cnt[m.group(1)] += 1
files = glob.glob("words-bulk*.js") + glob.glob("words-auto.js")
key = lambda x: (0, int(re.search(r"(\d+)\.js", x).group(1))) if "bulk" in x else (1, 0)
for f in sorted(files, key=key):
    lv = "N5"
    for n, line in enumerate(open(f, encoding="utf-8").read().split("\n"), 1):
        line = line.strip()
        if line.startswith("#"): lv = line[1:].strip(); continue
        if "|" not in line or line.startswith(("/*", "window", "`")): continue
        p = line.split("|")
        if len(p) != 3 or p[2] not in PC or not p[1].strip(): bad.append(f"{f}:{n} 형식 {line}"); continue
        rest = rub.sub("", p[0])
        if re.search("[" + KJ + "]", rest) or "[" in rest or "]" in rest: bad.append(f"{f}:{n} 후리가나 {line}"); continue
        t = plain(p[0])
        if t in seen: continue
        seen.add(t); cnt[lv] += 1
for lv in ["N5", "N4", "N3", "N2", "N1"]:
    print(f"{lv}: {cnt[lv]}개 / 목표 {TARGET[lv]}개 (남은 {max(0, TARGET[lv]-cnt[lv])})")
print("합계", sum(cnt.values()))
print("문제 줄:", len(bad))
for b in bad[:30]: print(" ", b)

# ---- 상세 정보 / 한자 사전 커버리지 ----
import json
det=set(); kx=set()
if os.path.exists("words-detail.js"):
    for line in open("words-detail.js",encoding="utf-8").read().split("\n"):
        line=line.strip(); p=line.split("|")
        if len(p)>=5 and p[0] and not line.startswith(("#","/*","window","`")):
            det.add(p[0].strip())
            if not (p[1].strip() and p[2].strip() and p[4].strip()): print("  상세 누락:", p[0])
if os.path.exists("kanji-extra.js"):
    for line in open("kanji-extra.js",encoding="utf-8").read().split("\n"):
        p=line.strip().split("|")
        if len(p)==5 and len(p[0])==1: kx.add(p[0])
kb=set(re.findall(r"^ (.):\{ko",orig,re.M))|kx
need=set(); words=[]
for m in re.finditer(r'\{lv:"(N\d)",f:"([^"]+)"',orig): words.append(plain(m.group(2)))
words+= [plain(m.group(2)) for m in re.finditer(r'\["(N\d)","([^"]+)"',ex)]
has_ex=set(plain(m.group(2)) for m in re.finditer(r'\["(N\d)","([^"]+)","[^"]*","[^"]*","[^"]+"',ex))
allw=set(words)
for f in files:
    for line in open(f,encoding="utf-8").read().split("\n"):
        line=line.strip(); p=line.split("|")
        if len(p)==3 and p[2] in PC: allw.add(plain(p[0]))
bw=set(); 
for f in files:
    for line in open(f,encoding="utf-8").read().split("\n"):
        for m in rub.finditer(line):
            for k in m.group(1): need.add(k)
print("한자 사전:", len(kb&need), "/", len(need), "(없는 한자", len(need-kb), ")")
print("상세정보(예문·포인트·관련단어) 작성:", len(det), "/", len(allw))

# ---- 할 일 목록: python3 check_words.py --todo [N] ----
import sys
if "--todo" in sys.argv:
    n = int(sys.argv[sys.argv.index("--todo")+1]) if len(sys.argv) > sys.argv.index("--todo")+1 else 150
    freq = collections.Counter()
    for f in files:
        for line in open(f, encoding="utf-8").read().split("\n"):
            for m in rub.finditer(line):
                for k in set(m.group(1)): freq[k] += 1
    print("\n[없는 한자 — 빈도순]")
    print("".join(k for k, _ in freq.most_common() if k not in kb)[:n*2] or "(없음)")
    order = {"N5": 0, "N4": 1, "N3": 2, "N2": 3, "N1": 4}
    todo = []; seen2 = set()
    for f in sorted(files, key=key):
        lv = "N5"
        for line in open(f, encoding="utf-8").read().split("\n"):
            line = line.strip()
            if line.startswith("#"): lv = line[1:].strip(); continue
            p = line.split("|")
            if len(p) == 3 and p[2] in PC:
                t = plain(p[0])
                if t not in det and t not in seen2: seen2.add(t); todo.append((order.get(lv, 9), lv, p[0], p[1]))
    for m in re.finditer(r'\["(N\d)","([^"]+)","([^"]*)"', ex):
        t = plain(m.group(2))
        if t not in det and t not in seen2: seen2.add(t); todo.append((order.get(m.group(1), 9), m.group(1), m.group(2), m.group(3)))
    todo.sort(key=lambda x: x[0])
    print(f"\n[상세정보 없는 단어 {len(todo)}개 — 급수 낮은 순, 앞 {n}개]")
    for _, lv, f, ko in todo[:n]: print(f"{lv}\t{f}\t{ko}")
