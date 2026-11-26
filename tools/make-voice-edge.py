#!/usr/bin/env python3
"""글자·청해·뉴스 음성을 단어장과 같은 일본어 목소리(여자 Nanami, 청해 남자 대사는 Keita)로 다시 만들어요. 무료·키 없음.
준비:  python3 -m venv ev && ev/bin/pip install edge-tts
사용:  node tools/voice-jobs.js /tmp/jobs.json && ev/bin/python tools/make-voice-edge.py /tmp/jobs.json
- 파일 이름(키)은 그대로 두고 내용만 바꿔요. 만든 뒤 목록(listen-audio.js 등)은 그대로 써요.
- 주의: Edge 음성은 마이크로소프트가 공식으로 연 방법이 아니에요. 배포 약관은 확인 필요."""
import asyncio,json,os,subprocess,sys,tempfile,array,math,audioop,wave
import sys as _sys; _sys.path.insert(0,os.path.dirname(os.path.abspath(__file__))); import tts_backend
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),"..")
NEWS_MODE="--news-recent" in sys.argv   # 매일 뉴스 갱신: 이미 있는 파일은 건너뛰고, 목록(news-audio.js)을 다시 쓰고, 안 쓰는 옛 음성은 지워요
J=json.load(open([a for a in sys.argv[1:] if not a.startswith("--")][0],encoding="utf-8")); TARGET=-19.0; CONC=3
NANAMI="ja-JP-NanamiNeural"; KEITA="ja-JP-KeitaNeural"
KFIX={"を":"オ","は":"ハ","へ":"ヘ","ぢ":"ジ","づ":"ズ","ぢゃ":"ジャ","ぢゅ":"ジュ","ぢょ":"ジョ","ヲ":"オ","ハ":"ハ","ヘ":"ヘ","ヂ":"ジ","ヅ":"ズ","ヂャ":"ジャ","ヂュ":"ジュ","ヂョ":"ジョ"}
def norm(raw,pre,post):
    i=raw.find(b'data'); b=raw[i+8:]; b=b[:len(b)//2*2]; n=480*2
    env=[audioop.rms(b[k:k+n],2) for k in range(0,len(b)-n,n)]
    mx=max(env) or 1; act=[v for v in env if v>mx*.2]; r=math.sqrt(sum(v*v for v in act)/len(act)) or 1
    on=next((i for i,v in enumerate(env) if v>mx*.1),0); off=max((i for i,v in enumerate(env) if v>mx*.1),default=len(env)-1)
    b=b[max(0,on-pre)*n:min(len(b),(off+1+post)*n)]
    g=10**(TARGET/20)*32768/r; a=array.array('h'); a.frombytes(b); out=array.array('h')
    for x in a:
        y=x*g/32768; ay=abs(y)
        if ay>.7: y=math.copysign(.7+.28*math.tanh((ay-.7)/.28),y)
        out.append(int(max(-1,min(1,y))*32767))
    return out.tobytes()
def encode(mp3,dst,tmp,br,pre,post):
    wav=tmp+".wav"; nw=tmp+"n.wav"
    subprocess.run(["afconvert","-f","WAVE","-d","LEI16@24000","-c","1",mp3,wav],check=True)
    pcm=norm(open(wav,"rb").read(),pre,post); o=wave.open(nw,"wb"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(24000); o.writeframes(pcm); o.close()
    subprocess.run(["afconvert","-f","m4af","-d","aac","-b",str(br),nw,tmp+".m4a"],check=True)
    os.replace(tmp+".m4a",dst)
    for f in (wav,nw): os.remove(f)
def tasks():
    for j in J["kana"]:
        t=KFIX.get(j["text"],j["text"]) if j["isChar"] else j["text"]
        yield ("kana",j["key"],t,NANAMI,"-10%",48000,5,10)
    for j in J["listen"]:
        pct=round((j["rate"]-1)*100); yield ("listen",j["key"],j["text"],KEITA if j["who"]=="M" else NANAMI,f"{pct:+d}%",48000,6,12)
    for j in J["news"]:
        yield ("news",j["key"],j["text"],NANAMI,"-5%",32000,6,12)
    for j in J.get("funny",[]):
        yield ("funny",j["key"],j["text"],NANAMI,"-8%",32000,6,12)
print("음성:",tts_backend.backend_name(),flush=True)
T=[t for t in tasks() if not (NEWS_MODE and os.path.exists(os.path.join(ROOT,"audio",t[0],t[1]+".m4a")))]; print("만들 것",len(T),flush=True)
async def main():
    sem=asyncio.Semaphore(CONC); loop=asyncio.get_running_loop(); tmpd=tempfile.mkdtemp(); fail=[]; done=0
    os.makedirs(os.path.join(ROOT,"audio","funny"),exist_ok=True)
    async def one(i,t):
        nonlocal done
        d,key,text,voice,rate,br,pre,post=t
        async with sem:
            mp3=os.path.join(tmpd,f"{i}.mp3")
            for k in range(4):
                try: await tts_backend.save_mp3(text,voice,rate,mp3); break
                except Exception as e:
                    if k==3: fail.append((d,key,text[:20])); return
                    await asyncio.sleep(1.5*(k+1))
            try: await loop.run_in_executor(None,encode,mp3,os.path.join(ROOT,"audio",d,key+".m4a"),os.path.join(tmpd,str(i)),br,pre,post)
            except Exception as e: fail.append((d,key,"encode")); return
            os.remove(mp3); done+=1
            if done%100==0: print(f"{done}/{len(T)}",flush=True)
    await asyncio.gather(*[one(i,t) for i,t in enumerate(T)])
    print(f"완료 {done}개, 실패 {len(fail)}개 {fail[:10]}",flush=True)
    if NEWS_MODE:
        keys=[j["key"] for j in J["news"]]; have=[k for k in keys if os.path.exists(os.path.join(ROOT,"audio","news",k+".m4a"))]
        open(os.path.join(ROOT,"news-audio.js"),"w",encoding="utf-8").write('/* tools/make-voice-edge.py --news-recent 가 만든 목록이에요 (직접 고치지 마세요) */\nwindow.NEWS_VOICES={"9":"Nanami","11":"Nanami"};\nwindow.NEWS_AUDIO='+json.dumps({k:1 for k in have})+";\n")
        want=set(keys); pr=0
        for f in os.listdir(os.path.join(ROOT,"audio","news")):
            if f.endswith(".m4a") and f[:-4] not in want: os.remove(os.path.join(ROOT,"audio","news",f)); pr+=1
        print(f"뉴스 목록 {len(have)}개 갱신, 안 쓰는 옛 음성 {pr}개 삭제",flush=True)
asyncio.run(main())
