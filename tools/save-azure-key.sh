#!/bin/bash
# Azure Speech 키를 ~/.config/surasura/azure.env 에 저장해요. 키는 화면에 보이지 않아요.
# 쓰는 법: Azure 포털의 '키 1' 값을 복사한 뒤, 이 파일을 실행하고 붙여 넣기(Cmd+V) 후 엔터.
printf "복사한 키를 붙여 넣고 엔터 (화면에는 안 보여요): "
read -rs K; echo
K=$(echo "$K" | tr -d '[:space:]')
if [ ${#K} -lt 30 ] || [ ${#K} -gt 90 ] || ! echo "$K" | grep -qE '^[A-Za-z0-9]+$'; then
  echo "키 모양이 아니에요. 포털에서 '키 1' 값을 다시 복사해서 한 번 더 실행해 주세요."; exit 1
fi
mkdir -p ~/.config/surasura; umask 077
printf 'AZURE_SPEECH_KEY=%s\nAZURE_SPEECH_REGION=koreacentral\n' "$K" > ~/.config/surasura/azure.env
chmod 600 ~/.config/surasura/azure.env
echo "저장했어요 (키 길이 ${#K}자). Claude에게 '키 저장했어'라고 알려 주세요."
