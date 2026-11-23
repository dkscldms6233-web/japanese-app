#!/bin/bash
# 매일 새 기사의 음성 갱신 (예약 작업이 기사를 쓴 뒤에 불러요)
#  1) VOICEVOX 엔진이 꺼져 있으면 잠깐 켜고
#  2) tools/make-news-audio.js 로 새 문단의 음성만 만들고 (없어진 기사의 옛 음성은 지워요)
#  3) 내가 켠 엔진이면 끕니다.
# 엔진 위치를 바꿨다면: VOICEVOX_ENGINE=/경로/vv-engine/run bash tools/daily-news-audio.sh
cd "$(dirname "$0")/.." || exit 1
ENGINE="${VOICEVOX_ENGINE:-$HOME/Applications/VOICEVOX/VOICEVOX.app/Contents/Resources/vv-engine/run}"
URL="http://127.0.0.1:50021/version"
started=0; ENGPID=""
if ! curl -s -m 3 "$URL" >/dev/null 2>&1; then
  if [ ! -x "$ENGINE" ]; then echo "VOICEVOX 엔진을 찾지 못했어요: $ENGINE (음성은 건너뛰어요. 기사는 기기 음성으로 읽혀요)"; exit 2; fi
  nohup "$ENGINE" --host 127.0.0.1 --port 50021 >/tmp/voicevox-engine.log 2>&1 &
  ENGPID=$!; started=1
  for i in $(seq 1 90); do curl -s -m 2 "$URL" >/dev/null 2>&1 && break; sleep 2; done
fi
if ! curl -s -m 3 "$URL" >/dev/null 2>&1; then
  echo "VOICEVOX 엔진이 응답하지 않아요 (음성은 건너뛰어요)"; [ "$started" = 1 ] && kill "$ENGPID" 2>/dev/null; exit 3
fi
node tools/make-news-audio.js; rc=$?
if [ "$started" = 1 ]; then kill "$ENGPID" 2>/dev/null; sleep 1; pkill -f "vv-engine/run" 2>/dev/null; fi
exit $rc
