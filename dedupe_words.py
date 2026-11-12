#!/usr/bin/env python3
"""후보 단어 중 기존에 없는 것만 걸러냄.
사용: python3 dedupe_words.py 후보파일.txt   (후보 형식: 표기[후리가나]|뜻|품사코드, '#N3' 줄 허용)
      출력 = 새 단어만 남긴 같은 형식. 마지막 줄에 '새 단어 x / 후보 y' 표시.
"""
import re, glob, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
plain = lambda s: re.sub(r"\[[^\]]*\]", "", s)
seen = set()
orig = open("index.html", encoding="utf-8").read()
for m in re.finditer(r'\{lv:"(N\d)",f:"([^"]+)"', orig): seen.add(plain(m.group(2)))
ex = open("words-extra.js", encoding="utf-8").read()
for m in re.finditer(r'\["(N\d)","([^"]+)"', ex): seen.add(plain(m.group(2)))
for f in glob.glob("words-bulk*.js") + ["words-auto.js"]:
    for l in open(f, encoding="utf-8").read().split("\n"):
        if l.count("|") == 2: seen.add(plain(l.split("|")[0].strip()))
tot = new = 0
for l in open(sys.argv[1], encoding="utf-8").read().split("\n"):
    l = l.strip()
    if l.startswith("#"): print(l); continue
    if l.count("|") != 2: continue
    tot += 1
    t = plain(l.split("|")[0])
    if t in seen: continue
    seen.add(t); new += 1; print(l)
print(f"# 새 단어 {new} / 후보 {tot}", file=sys.stderr)
