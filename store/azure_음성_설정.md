# Azure 음성으로 바꾸기 (같은 목소리, 정식 서비스)

지금 앱 음성은 마이크로소프트 Edge의 비공식 방식으로 만들었어요. **같은 목소리(Nanami 여자, Keita 남자)**를 마이크로소프트 정식 서비스(Azure AI Speech)로 다시 만들면 소리는 그대로이고 약관 걱정이 사라져요.

- 무료 한도(F0 등급): 한 달 **50만 글자** (가격 페이지 기준. 가입 전에 최신 내용을 확인하세요).
- 우리 음성 전체(단어·글자·청해·뉴스)는 약 11만 글자 안팎이라 한 번 만드는 데 무료 한도 안이에요. 매일 새 뉴스 음성은 한 달에 약 10만 글자 정도예요.

## 직접 하실 일 (약 15분)
1. https://azure.microsoft.com/free 에서 **Azure 계정 가입** (카드 확인이 필요해요. 무료 등급(F0)만 쓰면 요금이 나오지 않아요).
2. Azure 포털(https://portal.azure.com) → **리소스 만들기** → "**Speech**"(Azure AI Speech) 검색 → 만들기.
   - 지역: **Korea Central**
   - 가격 책정 계층: **Free (F0)**  ← 꼭 무료 등급으로
3. 만들어진 Speech 리소스 → **키 및 엔드포인트** → **KEY 1**과 **지역(위치)**을 확인하세요.
4. **키는 채팅에 붙여 넣지 마세요.** 터미널에서 아래 명령을 실행해 파일로 저장하면 돼요 (`여기에키` 부분만 바꾸세요).
   ```bash
   mkdir -p ~/.config/surasura && printf 'AZURE_SPEECH_KEY=여기에키\nAZURE_SPEECH_REGION=koreacentral\n' > ~/.config/surasura/azure.env && chmod 600 ~/.config/surasura/azure.env
   ```
5. 저장했다고 알려 주세요. 제가 소량으로 시험해 소리를 비교한 뒤 전체를 다시 만들어요.

## 그다음 제가 할 일
- 키가 있으면 `tools/tts_backend.py`가 자동으로 Azure를 써요(없으면 예전 Edge 방식). 키는 코드나 깃에 들어가지 않아요.
- 단어 9천여 개, 글자 330개, 청해 155줄, 뉴스 문단을 같은 방식으로 다시 만들고, 크레딧 표기를 "Microsoft Azure AI Speech"로 바꿔서 배포해요.
- 매일 아침 뉴스 음성 갱신(`tools/daily-news-audio.sh`)도 같은 키를 읽어서 Azure로 만들어요.

## 주의
- 무료 한도(월 50만 글자)를 넘으면 요금이 날 수 있어요. 가입할 때 **예산 알림**을 걸어 두세요.
- 키가 노출되면 포털에서 **키 재생성**을 하세요.
