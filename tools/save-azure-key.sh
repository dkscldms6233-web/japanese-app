#!/bin/bash
# Azure Speech 키를 클립보드에서 읽어 ~/.config/surasura/azure.env 에 저장해요 (화면에 키를 보여 주지 않아요).
# 쓰는 법: Azure 포털에서 '키 1' 옆 복사 버튼을 누른 뒤, 이 파일을 실행하세요.
K=$(pbpaste | tr -d '[:space:]')
if [ ${#K} -lt 30 ] || [ ${#K} -gt 40 ] || ! echo "$K" | grep -qE '^[A-Za-z0-9]+$'; then
  echo "클립보드에 키가 없어요. Azure 포털에서 '키 1' 옆 복사 버튼을 다시 누르고 한 번 더 실행해 주세요."; exit 1
fi
mkdir -p ~/.config/surasura; umask 077
printf 'AZURE_SPEECH_KEY=%s\nAZURE_SPEECH_REGION=koreacentral\n' "$K" > ~/.config/surasura/azure.env
chmod 600 ~/.config/surasura/azure.env
echo "저장했어요 (키 길이 ${#K}자). 이제 Claude에게 '키 저장했어'라고 알려 주세요."
