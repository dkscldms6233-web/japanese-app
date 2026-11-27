/* 술술 일본어 · 응원 멘트
   - 같은 화면이 다시 그려져도 멘트가 바뀌지 않도록, 번호(seed)로 고정해서 골라요.
   - 말투: 참새가 옆에서 말해 주듯 친근한 해요체. 과한 표현·이모지 없음. */
window.CHEER=(function(){
  const pick=(arr,seed)=>arr[Math.abs(Math.floor(+seed||0))%arr.length];
  const OK=["정답이에요!","잘했어요!","맞아요!","정확해요!","잘하고 있어요!","좋아요!"];
  const NG=["아쉬워요, 한 번 더 볼까요?","괜찮아요, 다시 봐요.","틀려도 괜찮아요. 다시 해 봐요.","거의 다 왔어요. 다시 볼까요?"];
  const RES=[
    [100,"완벽해요!","하나도 안 틀렸어요. 정말 잘했어요."],
    [60,"잘했어요!","꾸준히 하면 더 좋아질 거예요."],
    [30,"수고했어요!","틀린 문제는 오답 노트에서 다시 풀어 봐요."],
    [0,"다시 해 볼까요?","틀린 문제는 오답 노트에서 다시 풀 수 있어요."]
  ];
  return{
    ok:seed=>pick(OK,seed),
    ng:seed=>pick(NG,seed),
    result:pct=>{ const r=RES.find(x=>pct>=x[0])||RES[RES.length-1]; return{title:r[1],sub:r[2]}; },
    /* 홈 맨 위 인사: 시간대 + 오늘 공부했는지에 따라 달라져요 (아침 = 응원, 저녁 = 수고했다는 말) */
    greet:(hour,studied)=>{
      const day=Math.floor(Date.now()/864e5);
      if(hour<5) return studied?"오늘도 수고했어요. 푹 쉬어요":"늦은 시간이네요. 가볍게만 해 볼까요?";
      if(hour<11) return studied?"아침부터 열심히 하네요!":pick(["좋은 아침이에요! 오늘도 힘내요","상쾌한 아침이에요. 한 문제부터 해 봐요","오늘도 가볍게 시작해 볼까요?"],day);
      if(hour<18) return studied?"잘하고 있어요! 한 걸음 더 가 볼까요?":pick(["오늘도 한 걸음 가 볼까요?","5분만 시간 내 볼까요?","오늘은 어떤 단어부터 볼까요?"],day);
      return studied?"오늘 하루도 수고했어요!":pick(["오늘 하루 어땠어요? 5분만 해 볼까요?","자기 전에 한 번만 해 봐요","하루 마무리로 가볍게 한 판 어때요?"],day);
    },
    /* 홈 오늘의 학습 카드 아래 한 줄 (하루 동안은 같은 문장) */
    home:(streak,hour)=>{
      const day=Math.floor(Date.now()/864e5);
      if(streak>=7) return pick(["벌써 "+streak+"일째예요. 정말 잘하고 있어요!","꾸준함이 실력이에요. "+streak+"일 연속이에요."],day);
      if(streak>=3) return pick([streak+"일 연속이에요. 오늘도 힘내요!","좋아요, "+streak+"일째예요. 오늘도 가볍게 해 봐요."],day);
      if(hour<11) return pick(["가볍게 시작해 봐요.","하루 5분이면 충분해요."],day);
      if(hour>=18) return pick(["5분만 해 봐요.","자기 전에 한 번만 해 봐요."],day);
      return pick(["하루 5분이면 충분해요.","오늘도 한 걸음 가 봐요."],day);
    }
  };
})();
