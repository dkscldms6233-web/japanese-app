"""음성 만들기 공통 도구 — 마이크로소프트 Azure AI Speech(정식 서비스)를 쓰고, 키가 없으면 예전 Edge 방식으로 돌아가요.
- 키는 코드에 쓰지 않아요. 환경 변수 AZURE_SPEECH_KEY / AZURE_SPEECH_REGION 또는 ~/.config/surasura/azure.env 파일에서 읽어요.
- 같은 목소리(ja-JP-NanamiNeural 여자, ja-JP-KeitaNeural 남자)를 써서 소리는 그대로예요.
- 사용: await save_mp3(text, voice, rate, path)   (rate 예: "-10%")
- 무료 한도(F0): 한 달 50만 글자. 글자 수는 SSML 태그를 뺀 읽을 글자만 세요.  """
import os, asyncio, urllib.request, urllib.error
from xml.sax.saxutils import escape
ENV=os.path.expanduser("~/.config/surasura/azure.env")
def _load():
    key=os.environ.get("AZURE_SPEECH_KEY",""); reg=os.environ.get("AZURE_SPEECH_REGION","")
    if (not key or not reg) and os.path.exists(ENV):
        for line in open(ENV,encoding="utf-8"):
            if "=" in line and not line.strip().startswith("#"):
                k,v=line.strip().split("=",1)
                if k=="AZURE_SPEECH_KEY" and not key: key=v.strip()
                if k=="AZURE_SPEECH_REGION" and not reg: reg=v.strip()
    return key,reg
KEY,REGION=_load()
USE_AZURE=bool(KEY and REGION)
ENDPOINT=os.environ.get("AZURE_SPEECH_ENDPOINT") or (f"https://{REGION}.tts.speech.microsoft.com/cognitiveservices/v1" if REGION else "")
FMT="audio-24khz-48kbitrate-mono-mp3"
def ssml(text,voice,rate):
    return ("<speak version='1.0' xml:lang='ja-JP'><voice name='%s'><prosody rate='%s'>%s</prosody></voice></speak>"%(voice,rate,escape(text))).encode("utf-8")
def _post(body):
    req=urllib.request.Request(ENDPOINT,data=body,method="POST",headers={"Ocp-Apim-Subscription-Key":KEY,"Content-Type":"application/ssml+xml","X-Microsoft-OutputFormat":FMT,"User-Agent":"surasura-tts"})
    with urllib.request.urlopen(req,timeout=60) as r: return r.read()
async def save_mp3(text,voice,rate,path):
    if USE_AZURE:
        loop=asyncio.get_running_loop()
        data=await loop.run_in_executor(None,_post,ssml(text,voice,rate))
        open(path,"wb").write(data)
    else:
        import edge_tts   # 키가 없을 때만 (비공식 방식, 배포용으로는 권하지 않아요)
        await edge_tts.Communicate(text,voice,rate=rate).save(path)
def backend_name(): return "Azure AI Speech (정식)" if USE_AZURE else "Edge (비공식)"
