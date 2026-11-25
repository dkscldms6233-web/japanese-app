/* 씨앗 구매 서버 (토스페이먼츠 웹 결제) — Firebase Functions 2세대
 * 흐름: 앱 → createOrder(주문 만들기: 가격·개수는 여기서 정해요) → 토스 결제창 → 앱으로 돌아옴 → confirmOrder(결제 승인 + 씨앗 지급 확인)
 * - 가격과 씨앗 개수는 이 파일의 PACKS가 기준이에요. 앱이 보낸 금액·개수는 믿지 않아요.
 * - 시크릿 키는 코드에 쓰지 않고 `firebase functions:secrets:set TOSS_SECRET_KEY` 로 저장해요.
 * - 아직 배포하지 않았고(Blaze 요금제·사업자·토스 계약 필요), 실제 결제는 시험하지 못했어요. 배포 전에 토스 테스트 키로 먼저 시험하세요. */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const TOSS_SECRET = defineSecret("TOSS_SECRET_KEY");

/* 가격은 부가세(10%) 포함 금액이에요. 첫 구매 보너스는 한 계정에 한 번만 줘요. */
const PACKS = {
  seeds_100: { seeds: 100, price: 1100 },
  seeds_300: { seeds: 300, price: 2750 },
  seeds_700: { seeds: 700, price: 5500 },
  seeds_1500: { seeds: 1500, price: 11000 },
  /* 술술 플러스 이용권: 기간제(자동 갱신 없음). 끝나기 전에 또 사면 남은 기간 뒤에 이어 붙어요 */
  plus_30: { days: 30, price: 3300 },
  plus_180: { days: 180, price: 15400 },
  plus_365: { days: 365, price: 27500 },
};
const FIRST_BONUS_RATE = 0.5;   // 첫 구매 보너스: 구매한 개수의 50%
const REGION = "asia-northeast3";   // 서울
const opts = { region: REGION, secrets: [TOSS_SECRET], cors: true };

const orderName = p => p.days ? `술술 플러스 ${p.days}일 이용권` : `씨앗 ${p.seeds}개`;
const newOrderId = uid => "ord_" + uid.slice(0, 8) + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);   // 6~64자, 영문·숫자·_·-

function needUser(req) {
  if (!req.auth) throw new HttpsError("unauthenticated", "로그인이 필요해요.");
  if (req.auth.token.email_verified !== true) throw new HttpsError("failed-precondition", "이메일 인증을 마친 계정만 구매할 수 있어요.");
  return req.auth.uid;
}

/* 1) 주문 만들기 */
exports.createOrder = onCall(opts, async (req) => {
  const uid = needUser(req);
  const sku = String((req.data && req.data.sku) || "");
  const p = PACKS[sku];
  if (!p) throw new HttpsError("invalid-argument", "알 수 없는 상품이에요.");
  const orderId = newOrderId(uid);
  await db.collection("orders").doc(orderId).set({
    uid, sku, seeds: p.seeds || 0, days: p.days || 0, amount: p.price, status: "pending", delivered: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { orderId, amount: p.price, orderName: orderName(p) };
});

/* 토스 결제 승인 API: POST /v1/payments/confirm, 인증은 Basic base64("시크릿키:") */
async function tossConfirm(paymentKey, orderId, amount) {
  const auth = Buffer.from(TOSS_SECRET.value() + ":").toString("base64");
  const r = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: { Authorization: "Basic " + auth, "Content-Type": "application/json" },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  const body = await r.json().catch(() => ({}));
  return { ok: r.ok, body };
}

/* 2) 결제 승인 + 씨앗 지급 확인 (같은 주문은 두 번 지급하지 않아요) */
exports.confirmOrder = onCall(opts, async (req) => {
  const uid = needUser(req);
  const { paymentKey, orderId } = req.data || {};
  const amount = Number(req.data && req.data.amount);
  if (!paymentKey || !orderId || !Number.isFinite(amount)) throw new HttpsError("invalid-argument", "결제 정보가 올바르지 않아요.");
  const ref = db.collection("orders").doc(String(orderId));
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "주문을 찾을 수 없어요.");
  const o = snap.data();
  if (o.uid !== uid) throw new HttpsError("permission-denied", "내 주문이 아니에요.");
  if (o.amount !== amount) throw new HttpsError("invalid-argument", "결제 금액이 주문과 달라요.");

  /* 이미 승인된 주문: 아직 지급을 안 알렸으면 알려 주고, 알렸으면 두 번째 지급은 없어요 */
  if (o.status !== "paid") {
    const t = await tossConfirm(String(paymentKey), String(orderId), amount);
    if (!t.ok || (t.body && t.body.status && t.body.status !== "DONE") || (t.body && t.body.totalAmount !== undefined && t.body.totalAmount !== amount)) {
      await ref.update({ status: "failed", failure: String((t.body && (t.body.code || t.body.message)) || "confirm failed").slice(0, 200) });
      throw new HttpsError("aborted", "결제를 승인하지 못했어요. 돈이 빠져나갔다면 자동으로 취소돼요.");
    }
    await ref.update({ status: "paid", paymentKey: String(paymentKey), approvedAt: admin.firestore.FieldValue.serverTimestamp(), method: (t.body && t.body.method) || null });
  }

  /* 지급: 한 번만, 첫 구매 보너스 포함 (트랜잭션으로 중복 방지) */
  const wref = db.collection("wallets").doc(uid);
  const result = await db.runTransaction(async (tx) => {
    const [os, ws] = await Promise.all([tx.get(ref), tx.get(wref)]);
    const od = os.data();
    if (od.delivered) return { repeat: true, seeds: 0, bonus: 0, plusUntil: null };
    const w = ws.exists ? ws.data() : {};
    if (od.days) {   // 플러스 이용권: 남은 기간이 있으면 그 뒤에 이어 붙여요
      const nowMs = Date.now();
      const base = Math.max(nowMs, (w.plusUntil && w.plusUntil.toMillis) ? w.plusUntil.toMillis() : 0);
      const until = admin.firestore.Timestamp.fromMillis(base + od.days * 864e5);
      tx.update(ref, { delivered: true, bonus: 0, deliveredAt: admin.firestore.FieldValue.serverTimestamp() });
      tx.set(wref, { plusUntil: until, totalPaid: (w.totalPaid || 0) + od.amount, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return { repeat: false, seeds: 0, bonus: 0, plusUntil: until.toMillis() };
    }
    const bonus = w.firstBonusUsed ? 0 : Math.floor(od.seeds * FIRST_BONUS_RATE);
    tx.update(ref, { delivered: true, bonus, deliveredAt: admin.firestore.FieldValue.serverTimestamp() });
    tx.set(wref, {
      firstBonusUsed: true,
      totalSeedsBought: (w.totalSeedsBought || 0) + od.seeds,
      totalPaid: (w.totalPaid || 0) + od.amount,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { repeat: false, seeds: od.seeds + bonus, bonus, plusUntil: null };
  });
  return { ok: true, ...result };
});

if (process.env.SURA_TEST) exports._test = { PACKS, newOrderId, FIRST_BONUS_RATE };   // 점검용 (배포 때는 내보내지 않아요)
