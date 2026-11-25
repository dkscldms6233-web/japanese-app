#!/usr/bin/env python3
"""단어장 발음 음성 만들기 (마이크로소프트 Edge 일본어 여자 목소리 Nanami, 무료·키 없음)
준비:  python3 -m venv ev && ev/bin/pip install edge-tts
사용:  ev/bin/python tools/make-word-audio.py          (없는 파일만 만들어요, 멈췄다 다시 돌려도 이어서 돼요)
       ev/bin/python tools/make-word-audio.py --dry    (몇 개 만들지 세기)
입력:  tools/words-yomi.json  ([[읽기, 표기, 급수], ...], 앱에서 뽑은 목록·급수 낮은 순)
결과:  audio/word/<키>.m4a, word-audio.js (음성이 있는 키 목록)
- 키 규칙은 index.html 의 wordKey 와 같아야 해요.
- 한자는 오독 위험이 있어서 읽기(히라가나)로 읽혀요. 단, 한 글자 は·へ·を 는 조사처럼(와·에·오) 읽히지 않게 가타카나로 줘요.
- 주의: Edge 음성은 마이크로소프트가 공식으로 연 방법이 아니에요. 배포 약관은 확인 필요."""
import asyncio,json,os,subprocess,sys,tempfile,array,math,audioop,wave
import sys as _sys; _sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import tts_backend
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..")
DIR=os.path.join(ROOT,"audio","word"); os.makedirs(DIR,exist_ok=True)
VOICE="ja-JP-NanamiNeural"; RATE="-10%"; TARGET=-19.0; CONC=6
L=json.load(open(os.path.join(ROOT,"tools","words-yomi.json"),encoding="utf-8"))
def key(y):
    h=5381;g=7
    for c in "word1|"+y:
        o=ord(c); h=((h*33)^o)&0xFFFFFFFF; g=(g*131+o)&0xFFFFFFFF
    def b36(n):
        d="0123456789abcdefghijklmnopqrstuvwxyz";r=""
        while n: r=d[n%36]+r;n//=36
        return r or "0"
    return b36(h)+b36(g)
def say_text(y): return {"は":"ハ","へ":"ヘ","を":"オ"}.get(y,y)
def norm(raw):
    i=raw.find(b'data'); b=raw[i+8:]; b=b[:len(b)//2*2]; n=480*2
    env=[audioop.rms(b[k:k+n],2) for k in range(0,len(b)-n,n)]
    if not env: return b
    mx=max(env) or 1; act=[v for v in env if v>mx*.2]; r=math.sqrt(sum(v*v for v in act)/len(act)) or 1
    on=next((i for i,v in enumerate(env) if v>mx*.1),0); off=max((i for i,v in enumerate(env) if v>mx*.1),default=len(env)-1)
    st=max(0,on-4)*n; en=min(len(b),(off+1+8)*n); b=b[st:en]   # 앞뒤 무음 정리(앞 80ms, 뒤 160ms만 남김)
    g=10**(TARGET/20)*32768/r; a=array.array('h'); a.frombytes(b); out=array.array('h')
    for x in a:
        y=x*g/32768; ay=abs(y)
        if ay>.7: y=math.copysign(.7+.28*math.tanh((ay-.7)/.28),y)
        out.append(int(max(-1,min(1,y))*32767))
    return out.tobytes()
def encode(mp3,dst,tmp):
    wav=tmp+".wav"; n=tmp+"n.wav"
    subprocess.run(["afconvert","-f","WAVE","-d","LEI16@24000","-c","1",mp3,wav],check=True)
    pcm=norm(open(wav,"rb").read()); o=wave.open(n,"wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(24000); o.writeframes(pcm); o.close()
    subprocess.run(["afconvert","-f","m4af","-d","aac","-b","48000",n,dst],check=True)
    for f in (wav,n): os.remove(f)
def write_list():
    have={key(y):1 for y,_,_ in L if os.path.exists(os.path.join(DIR,key(y)+".m4a"))}
    open(os.path.join(ROOT,"word-audio.js"),"w",encoding="utf-8").write("/* tools/make-word-audio.py 가 만든 목록이에요 (직접 고치지 마세요) */\nwindow.WORD_AUDIO="+json.dumps(have)+";\n"); return len(have)
todo=[x for x in L if not os.path.exists(os.path.join(DIR,key(x[0])+".m4a"))]
print(f"단어 {len(L)}개 중 새로 만들 것 {len(todo)}개 · 음성: {tts_backend.backend_name()}",flush=True)
if "--dry" in sys.argv: sys.exit(0)
async def main():
    sem=asyncio.Semaphore(CONC); done=0; fail=[]; loop=asyncio.get_running_loop(); tmpd=tempfile.mkdtemp()
    async def one(i,y):
        nonlocal done
        async with sem:
            mp3=os.path.join(tmpd,f"{i}.mp3")
            for t in range(4):
                try:
                    await tts_backend.save_mp3(say_text(y),VOICE,RATE,mp3); break
                except Exception as e:
                    if t==3: fail.append(y); return
                    await asyncio.sleep(1.5*(t+1))
            await loop.run_in_executor(None,encode,mp3,os.path.join(DIR,key(y)+".m4a"),os.path.join(tmpd,str(i)))
            os.remove(mp3); done+=1
            if done%200==0: print(f"{done}/{len(todo)}",flush=True); write_list()
    await asyncio.gather(*[one(i,y) for i,(y,_,_) in enumerate(todo)])
    print(f"완료: {write_list()}개, 실패 {len(fail)}개 {fail[:20]}",flush=True)
asyncio.run(main())
