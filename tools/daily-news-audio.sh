#!/bin/bash
# 매일 새 기사의 음성 갱신 (예약 작업이 기사를 쓴 뒤에 불러요) — 단어장과 같은 Edge 일본어 여자 목소리(Nanami)
#  1) tools/ev 에 edge-tts 가 없으면 설치(처음 한 번, 인터넷 필요)
#  2) 최근 30일 기사의 새 문단 음성만 만들고, news-audio.js 목록을 갱신하고, 없어진 기사의 옛 음성은 지워요
# 인터넷이 안 되면 음성만 건너뛰어요(기사는 폰 음성으로 읽혀요).
cd "$(dirname "$0")/.." || exit 1
EV=tools/ev
if [ ! -x "$EV/bin/python" ]; then python3 -m venv "$EV" && "$EV/bin/pip" -q install edge-tts || { echo "edge-tts 설치 실패 (음성은 건너뛰어요)"; exit 2; }; fi
JOBS=$(mktemp /tmp/news-jobs.XXXXXX)
node tools/voice-jobs.js --news-recent "$JOBS" || { echo "문단 목록을 만들지 못했어요"; exit 3; }
"$EV/bin/python" tools/make-voice-edge.py --news-recent "$JOBS"; rc=$?
rm -f "$JOBS"; exit $rc
