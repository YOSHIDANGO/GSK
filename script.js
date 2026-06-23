const stages = [
  {
    id: "slot", title: "ステージ1：兆しのランプ", count: "1 / 5", prompt: "光るかどうかは、まだ見ない。", startLabel: "レバーの前へ",
    intro: ["これは、ランプが光れば大当たりのスロットゲームです。", "レバーを叩く前に、ランプをなでる、ボタンを押す、少し間を置く。", "意味があるかはわかりません。でも、光ってほしいなら、今できることをしてからレバーオンしてください。"],
    images: { idle: "stage1_slot_base.png", resolving: "stage1_slot_spinning.png", win: "stage1_slot_win.png", lose: "stage1_slot_base.png" },
    winText: "BONUS確定", loseText: "……ランプは光らない。"
  },
  {
    id: "ball", title: "ステージ2：最後の封印", count: "2 / 5", prompt: "残るカプセルボールは、これひとつ。", startLabel: "カプセルを構える",
    intro: ["目の前に、伝説級のモンスターが現れました。", "手元に残っているのは、カプセルボールがひとつだけ。投げたあとは、揺れるカプセルを見守るしかありません。", "Aを押すのか、Bを押しっぱなしにするのか、下を押すのか。自分だけのやり方で、なんとかゲットしてください。"],
    images: { idle: "stage2_battle_base.png", resolving: "stage2_battle_capturing.png", win: "stage2_battle_success.png", lose: "stage2_battle_fail.png" },
    winText: "カプセルボールに封じ込めた！", loseText: "惜しい。封印がほどけた。"
  },
  {
    id: "gacha", title: "ステージ3：最後の一回", count: "3 / 5", prompt: "石はひとつ。押せるのも一度だけ。", startLabel: "召喚画面へ",
    intro: ["レアキャラを引くために、これまで無課金で貯めてきた石。", "その石も、あと1回分だけになってしまいました。ここで引けなければ、次はいつになるかわかりません。", "画面をなでるか、長押しするか、少し待つか。押す瞬間は、あなたに任されています。"],
    images: { idle: "stage3_gacha_top.png", resolving: "stage3_gacha_drawing.png", win: "stage3_gacha_win.png", lose: "stage3_gacha_lose.png" },
    winText: "特別な気配が現れた。", loseText: "いつもの光が、静かに消えた。"
  },
  {
    id: "mail", title: "ステージ4：当落のお知らせ", count: "4 / 5", prompt: "開けなければ、まだ落ちていない。", startLabel: "通知を確認する",
    intro: ["抽選結果のお知らせが届きました。", "開ければ、当選か落選かが確定します。でも、開けなければ、まだ落ちていません。", "封筒をなでるのか、少し待つのか、勢いで開けるのか。心の準備ができたら、通知を開いてください。"],
    images: { idle: "stage4_lottery_base.png", resolving: "stage4_lottery_opening.png", win: "stage4_lottery_win.png", lose: "stage4_lottery_lose.png" },
    winText: "当選のお知らせ", loseText: "今回はご用意できませんでした"
  },
  {
    id: "exam", title: "ステージ5：結果照会", count: "5 / 5", prompt: "見るまでは、まだどちらでもない。", startLabel: "結果ページへ",
    intro: ["合否発表ページが開かれています。", "受験番号は入力済み。あとは、結果表示ボタンを押すだけです。見るまでは、まだどちらでもありません。", "すぐ押すのか、少し待つのか、画面を隠しながら見るのか。覚悟ができたら、結果を照会してください。"],
    images: { idle: "stage5_exam_base.png", resolving: "stage5_exam_base.png", win: "stage5_exam_base.png", lose: "stage5_exam_base.png" },
    winText: "合格", loseText: "不合格"
  }
];

const typeDefs = {
  resonance: { name: "本体共鳴型シャーマン", icon: "type_resonance.png", behavior: "ランプや画面の動きへ、指先を同期させる", summary: "機械が揺れれば、こちらの気持ちも揺れる。対象と動きを合わせて運命に相づちを打つタイプです。確率との関係は未確認ですが、呼吸はかなり合っています。" },
  mash: { name: "連打祈祷型", icon: "type_mash.png", behavior: "停止ボタンやAボタンへ、考える前に念を送る", summary: "できることがあるなら、まず押す。もう一度押す。指先の忙しさで不安を追い越すタイプです。一打に意味がなくても、全部には少し意味がある気がします。" },
  hide: { name: "隠蔽確認型", icon: "type_hide.png", behavior: "結果を覆い、少しずつ視界へ入れる", summary: "見なければ、悪い結果はまだ届いていない。視界を閉じて心の読み込み時間を確保するタイプです。もちろん最後には、ちゃんと隙間から確認します。" },
  stroke: { name: "なで信仰型", icon: "type_stroke.png", behavior: "ランプも封筒も画面も、ひとまず丁寧になでる", summary: "機械にも通知にも礼儀正しくお願いするタイプです。優しくすれば結果も優しくなる。そんな未確認の互恵関係を、あなたはまだ諦めていません。" },
  timing: { name: "間合い調整型", icon: "type_timing.png", behavior: "押せるボタンを前に、ちょうどいい一拍を探す", summary: "すぐには押さない。早すぎず遅すぎない、運命の間合いを読むタイプです。結果が決まっていても、受け取るタイミングくらいはこちらで選びたいのです。" },
  stare: { name: "無言凝視型", icon: "type_stare.png", behavior: "余計な入力をせず、結果の気配を見つめ続ける", summary: "動かないことが最大の祈り。外からは静かでも、内側はかなり騒がしいタイプです。何もしないという儀式は、思っているより体力を使います。" },
  escape: { name: "読み込み逃避型", icon: "type_escape.png", behavior: "結果欄の外を触り、見る瞬間を小分けにする", summary: "結果が来る直前だけ、別の場所が気になるタイプです。逃げ道を一本残すことで、ちゃんと戻ってこられます。それも立派な人間の知恵です。" }
};

const $ = selector => document.querySelector(selector);
const el = {
  intro: $("#intro"), game: $("#game"), result: $("#result"), startBtn: $("#startBtn"), mount: $("#experienceMount"),
  stageCount: $("#stageCount"), stageTitle: $("#stageTitle"), stagePrompt: $("#stagePrompt"), whisper: $("#stageWhisper"), nextBtn: $("#nextBtn"),
  resultIcon: $("#resultIcon"), resultType: $("#resultType"), resultSummary: $("#resultSummary"), resultBehavior: $("#resultBehavior"),
  scoreFaith: $("#scoreFaith"), scoreHesitation: $("#scoreHesitation"), scoreAvoidance: $("#scoreAvoidance"), scoreHuman: $("#scoreHuman"),
  fortuneHits: $("#fortuneHits"), fortuneRank: $("#fortuneRank"), fortuneComment: $("#fortuneComment"),
  finalLog: $("#finalLog"), shareBtn: $("#shareBtn"), restartBtn: $("#restartBtn"), copyStatus: $("#copyStatus")
};

let current = 0, stageStartedAt = 0, resolveStartedAt = 0, lastInputAt = 0;
let stageState = "intro", resolving = false, resolved = false, currentLog = null, stageLogs = [], timers = [];
let pointerStart = null, gestureStroked = false, holdStart = 0, suppressClick = false;

const asset = name => `./assets/${name}`;
const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
function clearTimers() { timers.forEach(clearTimeout); timers = []; }
function showScreen(name) { el.intro.classList.toggle("hidden", name !== "intro"); el.game.classList.toggle("hidden", name !== "game"); el.result.classList.toggle("hidden", name !== "result"); }
function freshLog(stage) {
  return {
    stageId: stage.id, stageTitle: stage.title, taps: 0, strokes: 0, longPressMs: 0, hesitationMs: 0, waitNoInputMs: 0, outsideTaps: 0,
    lampTouches: 0, leverPulls: 0, stopButtonTaps: 0, aButtonTaps: 0, bButtonHolds: 0, dpadDownTaps: 0, screenTapsDuringCapture: 0,
    gachaButtonHolds: 0, gachaHesitationMs: 0, envelopeTouches: 0, envelopeHolds: 0, envelopeHesitationMs: 0,
    hides: 0, examHesitationMs: 0, examPeeks: 0, result: null
  };
}

function stageMarkup(stage) {
  const image = asset(stage.images.idle);
  const bg = `<img class="experience-backdrop" src="${image}" alt="" aria-hidden="true" draggable="false"><img class="experience-bg" src="${image}" alt="" draggable="false">`;
  if (stage.id === "slot") return `<section class="experience-stage stage-slot">${bg}<div class="stage-overlay"><button class="hotspot hotspot-lamp" data-action="lamp" aria-label="ランプに触れる"></button><button class="hotspot hotspot-lever" data-action="lever" aria-label="レバーを引く"></button><div class="hotspot-stop-buttons" aria-label="停止ボタン"><button class="hotspot stop-one" data-action="stop" aria-label="左の停止ボタン"></button><button class="hotspot stop-two" data-action="stop" aria-label="中央の停止ボタン"></button><button class="hotspot stop-three" data-action="stop" aria-label="右の停止ボタン"></button></div><div class="lamp-glow" aria-hidden="true"></div><p class="experience-hint">ランプ、ボタン、レバー。気になるところへ。</p></div></section>`;
  if (stage.id === "ball") return `<section class="experience-stage stage-ball">${bg}<div class="stage-overlay"><button class="hotspot hotspot-ball-screen" data-action="screen" aria-label="バトル画面に触れる"></button><div class="capsule-shake" aria-hidden="true"></div><div class="screen-flash" aria-hidden="true"></div><div class="handheld-controls"><div class="dpad" aria-label="十字キー"><button data-action="dpad-up" aria-label="上"></button><button data-action="dpad-left" aria-label="左"></button><span></span><button data-action="dpad-right" aria-label="右"></button><button data-action="dpad-down" aria-label="下"></button></div><div class="system-buttons"><button data-action="select" aria-label="SELECT"></button><button data-action="start" aria-label="START"></button></div><div class="ab-buttons"><button class="button-b" data-action="b" aria-label="Bボタン"></button><button class="button-a" data-action="a" aria-label="Aボタン"></button></div></div></div></section>`;
  if (stage.id === "gacha") return `<section class="experience-stage stage-gacha">${bg}<div class="stage-overlay"><button class="hotspot hotspot-gacha" data-action="gacha" aria-label="一回召喚する"></button><div class="gacha-curtain" aria-hidden="true"><i></i><i></i></div><div class="gacha-light" aria-hidden="true"></div><p class="experience-hint">押す前の一秒まで、あなたのもの。</p></div></section>`;
  if (stage.id === "mail") return `<section class="experience-stage stage-mail">${bg}<div class="stage-overlay"><button class="hotspot hotspot-envelope" data-action="envelope" aria-label="抽選結果の封筒を開く"></button><div class="mail-cover" aria-hidden="true"></div><p class="experience-hint">封筒は、急がせてこない。</p></div></section>`;
  return `<section class="experience-stage stage-exam">${bg}<div class="stage-overlay"><button class="hotspot hotspot-exam-button" data-action="exam" aria-label="結果を表示する"></button><button class="hotspot hotspot-exam-result" data-action="exam-result" aria-label="結果欄を少しずつ見る"></button><div class="exam-loading" aria-live="polite"><i></i><span>照会しています</span></div><div class="exam-result-panel" aria-live="polite"><small>照会結果</small><strong></strong><p></p><button type="button" data-action="peek">少しだけ見る</button></div><div class="exam-curtain" aria-hidden="true"></div></div></section>`;
}

function introMarkup(stage) {
  return `<section class="stage-intro-panel" data-stage-state="intro">
    <span>${stage.count}</span>
    <h2>${stage.title}</h2>
    <div>${stage.intro.map(text => `<p>${text}</p>`).join("")}</div>
    <button class="primary-btn" data-action="begin-stage">${stage.startLabel}</button>
  </section>`;
}

function startGame() { current = 0; stageLogs = []; el.copyStatus.textContent = ""; showScreen("game"); loadStage(); }
function loadStage() {
  clearTimers(); stageState = "intro"; resolving = resolved = false; suppressClick = false;
  const stage = stages[current]; currentLog = freshLog(stage);
  el.stageCount.textContent = stage.count; el.stageTitle.textContent = stage.title; el.stagePrompt.textContent = stage.prompt; el.whisper.textContent = "";
  el.nextBtn.classList.add("hidden"); el.mount.innerHTML = introMarkup(stage);
  el.mount.querySelector('[data-action="begin-stage"]').addEventListener("click", () => beginStage(stage));
}
function beginStage(stage) {
  stageState = "idle"; stageStartedAt = performance.now(); lastInputAt = stageStartedAt;
  el.mount.innerHTML = stageMarkup(stage); setStageState("idle"); bindStage(stage);
}
function setStageState(state) {
  stageState = state;
  const stage = stages[current], experience = el.mount.querySelector(".experience-stage");
  if (!experience) return;
  experience.dataset.state = state;
  experience.classList.remove("state-idle", "state-resolving", "state-loading", "state-win", "state-lose", "is-resolving", "is-revealed", "is-win", "is-lose");
  experience.classList.add(`state-${state}`);
  if (state === "resolving" || state === "loading") experience.classList.add("is-resolving");
  if (state === "win" || state === "lose") experience.classList.add("is-revealed", `is-${state}`);
  const imageState = state === "loading" ? "resolving" : state;
  experience.querySelectorAll(".experience-bg, .experience-backdrop").forEach(image => {
    if (stage.images[imageState]) image.src = asset(stage.images[imageState]);
  });
}
function noteInput() { lastInputAt = performance.now(); }

function bindStage(stage) {
  const experience = el.mount.querySelector(".experience-stage");
  experience.addEventListener("pointerdown", event => {
    if (resolved) return; noteInput(); pointerStart = { x: event.clientX, y: event.clientY }; gestureStroked = false; holdStart = performance.now(); currentLog.taps += 1;
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) { currentLog.outsideTaps += 1; if (stage.id === "exam") currentLog.hides += resolving ? 1 : 0; }
    if (action === "lamp") currentLog.lampTouches += 1;
    if (action === "screen" && resolving) currentLog.screenTapsDuringCapture += 1;
    if (action === "envelope") { currentLog.envelopeTouches += 1; suppressClick = false; later(() => { if (holdStart && !resolved) { currentLog.envelopeHolds += 1; currentLog.hides += 1; suppressClick = true; experience.classList.add("is-covered"); el.whisper.textContent = "まだ見ないことにした。"; } }, 620); }
  });
  experience.addEventListener("pointermove", event => {
    if (!pointerStart || resolved) return;
    if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 24 && !gestureStroked) { gestureStroked = true; currentLog.strokes += 1; noteInput(); experience.classList.add("is-stroked"); later(() => experience.classList.remove("is-stroked"), 280); }
  });
  experience.addEventListener("pointerup", () => { if (holdStart) currentLog.longPressMs += Math.round(performance.now() - holdStart); pointerStart = null; holdStart = 0; });
  experience.addEventListener("pointercancel", () => { pointerStart = null; holdStart = 0; });

  el.mount.querySelectorAll('[data-action="stop"]').forEach(button => button.addEventListener("pointerdown", () => { if (!resolved) { currentLog.stopButtonTaps += 1; noteInput(); button.classList.add("pressed"); later(() => button.classList.remove("pressed"), 100); } }));
  el.mount.querySelector('[data-action="lever"]')?.addEventListener("click", () => { if (!resolved) { currentLog.leverPulls += 1; runResult(); } });
  el.mount.querySelector('[data-action="a"]')?.addEventListener("pointerdown", event => { if (!resolved) { event.currentTarget.classList.add("pressed"); currentLog.aButtonTaps += 1; noteInput(); if (!resolving) runResult(); } });
  el.mount.querySelector('[data-action="a"]')?.addEventListener("pointerup", event => event.currentTarget.classList.remove("pressed"));
  const bButton = el.mount.querySelector('[data-action="b"]'); let bStarted = 0;
  bButton?.addEventListener("pointerdown", event => { if (!resolved) { event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.classList.add("pressed"); bStarted = performance.now(); noteInput(); } });
  const releaseB = event => { if (bStarted) { currentLog.bButtonHolds += Math.round(performance.now() - bStarted); bStarted = 0; event.currentTarget.classList.remove("pressed"); noteInput(); } };
  bButton?.addEventListener("pointerup", releaseB); bButton?.addEventListener("pointercancel", releaseB);
  el.mount.querySelector('[data-action="dpad-down"]')?.addEventListener("pointerdown", event => { if (!resolved) { currentLog.dpadDownTaps += 1; noteInput(); event.currentTarget.classList.add("pressed"); later(() => event.currentTarget.classList.remove("pressed"), 120); } });
  const gachaButton = el.mount.querySelector('[data-action="gacha"]'); let gachaStarted = 0;
  gachaButton?.addEventListener("pointerdown", () => { if (!resolved) { gachaStarted = performance.now(); noteInput(); } });
  gachaButton?.addEventListener("pointerup", () => { if (!resolved && gachaStarted) { currentLog.gachaButtonHolds += Math.round(performance.now() - gachaStarted); currentLog.gachaHesitationMs = Math.round(performance.now() - stageStartedAt); gachaStarted = 0; runResult(); } });
  el.mount.querySelector('[data-action="envelope"]')?.addEventListener("click", () => { if (!resolved && !suppressClick) { currentLog.envelopeHesitationMs = Math.round(performance.now() - stageStartedAt); runResult(); } suppressClick = false; });
  el.mount.querySelector('[data-action="exam"]')?.addEventListener("click", () => { if (!resolved) { currentLog.examHesitationMs = Math.round(performance.now() - stageStartedAt); runResult(); } });
  el.mount.querySelector('[data-action="exam-result"]')?.addEventListener("click", () => { if (resolving) peekExam(); });
  el.mount.querySelector('[data-action="peek"]')?.addEventListener("click", peekExam);
}

function runResult() {
  if (resolving || resolved) return;
  resolving = true; resolveStartedAt = performance.now(); lastInputAt = resolveStartedAt; currentLog.hesitationMs = Math.round(resolveStartedAt - stageStartedAt);
  const stage = stages[current];
  setStageState(stage.id === "exam" ? "loading" : "resolving");
  if (stage.id === "slot") el.whisper.textContent = "レバーは落ちた。あとは、光るかどうか。";
  if (stage.id === "ball") el.whisper.textContent = "AもBも、いまだけは押していい。";
  if (stage.id === "gacha") el.whisper.textContent = "扉の向こうが、まだ見えない。";
  if (stage.id === "mail") el.whisper.textContent = "紙一枚ぶんの時間が、長い。";
  if (stage.id === "exam") el.whisper.textContent = "通信環境のせいにできるのは、いまだけ。";
  const delay = stage.id === "ball" ? 3200 : stage.id === "slot" ? 2700 : stage.id === "exam" ? 2200 : 2400;
  later(revealResult, delay);
}
function peekExam() {
  if (!resolving || resolved) return; currentLog.examPeeks += 1; currentLog.hides += 1; noteInput();
  const experience = el.mount.querySelector(".experience-stage"); experience.classList.remove("peek-1", "peek-2"); experience.classList.add(currentLog.examPeeks > 1 ? "peek-2" : "peek-1");
}
function revealResult() {
  const stage = stages[current], experience = el.mount.querySelector(".experience-stage");
  currentLog.waitNoInputMs = Math.max(0, Math.round(performance.now() - Math.max(resolveStartedAt, lastInputAt)));
  const isWin = Math.random() < 0.5;
  currentLog.result = isWin ? "成功" : "失敗"; resolving = false; resolved = true;
  setStageState(isWin ? "win" : "lose");
  if (stage.id === "exam") { const panel = experience.querySelector(".exam-result-panel"); panel.querySelector("strong").textContent = isWin ? "合格" : "不合格"; panel.querySelector("p").textContent = isWin ? "おめでとうございます。あなたは合格です。" : "今回は合格基準に達しませんでした。"; }
  el.whisper.textContent = isWin ? stage.winText : stage.loseText; el.nextBtn.textContent = current === stages.length - 1 ? "MY儀式を診断する" : "次の結果へ"; el.nextBtn.classList.remove("hidden");
}
function nextStage() {
  if (!resolved) return; stageLogs.push(currentLog);
  if (current === stages.length - 1) return showResult(); current += 1; loadStage();
}

function analyzeLogs(logs) {
  const keys = Object.keys(freshLog({ id: "", title: "" })).filter(key => typeof freshLog({ id: "", title: "" })[key] === "number");
  const totals = Object.fromEntries(keys.map(key => [key, 0])); totals.success = 0;
  logs.forEach(log => { keys.forEach(key => totals[key] += log[key]); totals.success += log.result === "成功" ? 1 : 0; });
  const scores = {
    resonance: totals.lampTouches * 2 + totals.screenTapsDuringCapture * 1.2 + totals.dpadDownTaps * 2,
    mash: totals.stopButtonTaps * 3 + totals.aButtonTaps * 3 + totals.taps * .25,
    hide: totals.hides * 7 + totals.examPeeks * 4 + totals.envelopeHolds * 4,
    stroke: totals.strokes * 5 + totals.envelopeTouches * .8 + totals.lampTouches,
    timing: totals.hesitationMs / 900 + totals.gachaButtonHolds / 280 + totals.bButtonHolds / 350,
    stare: Math.max(4, totals.waitNoInputMs / 500 - totals.aButtonTaps - totals.stopButtonTaps),
    escape: totals.outsideTaps * 4 + totals.examPeeks * 5
  };
  const typeKey = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
  const faith = clamp(totals.aButtonTaps * 4 + totals.stopButtonTaps * 3 + totals.strokes * 7 + totals.lampTouches * 2 + totals.dpadDownTaps * 4);
  const hesitation = clamp(totals.hesitationMs / 650 + totals.gachaButtonHolds / 180 + totals.bButtonHolds / 250);
  const avoidance = clamp(totals.hides * 12 + totals.outsideTaps * 3 + totals.examPeeks * 8);
  const human = clamp((faith + hesitation + avoidance + 45) / 2.4);
  return { totals, typeKey, faith, hesitation, avoidance, human };
}
function logSummary(log) {
  if (log.stageId === "slot") return `ランプ接触 ${log.lampTouches} / レバー ${log.leverPulls} / 停止ボタン ${log.stopButtonTaps}`;
  if (log.stageId === "ball") return `A連打 ${log.aButtonTaps} / B長押し ${(log.bButtonHolds / 1000).toFixed(1)}秒 / ↓入力 ${log.dpadDownTaps} / 捕獲中画面タップ ${log.screenTapsDuringCapture}`;
  if (log.stageId === "gacha") return `押すまで ${(log.gachaHesitationMs / 1000).toFixed(1)}秒 / 長押し ${(log.gachaButtonHolds / 1000).toFixed(1)}秒 / なで ${log.strokes}`;
  if (log.stageId === "mail") return `開けるまで ${(log.envelopeHesitationMs / 1000).toFixed(1)}秒 / 封筒接触 ${log.envelopeTouches} / 長押し ${log.envelopeHolds} / なで ${log.strokes}`;
  return `押すまで ${(log.examHesitationMs / 1000).toFixed(1)}秒 / 少しずつ見る ${log.examPeeks} / 画面外 ${log.outsideTaps}`;
}
function getFortune(hitCount) {
  return [
    { rank: "逆神の日", comment: "今日は何かを引くより、静かに寝た方がいい日。" },
    { rank: "低空飛行", comment: "運は渋め。でも、ひとつ拾えただけまだ人間。" },
    { rank: "普通の日", comment: "良くも悪くも現実的。期待しすぎなければ悪くない。" },
    { rank: "なかなか持ってる", comment: "5回中3回当たり。今日はまだ信じていい日かもしれません。" },
    { rank: "かなり強い", comment: "ここぞという場面で引けている。ちょっと調子に乗っていい。" },
    { rank: "豪運", comment: "全部当たり。今日のあなたは、儀式が効いたことにしていい。" }
  ][hitCount];
}
function showResult() {
  const analysis = analyzeLogs(stageLogs), type = typeDefs[analysis.typeKey]; showScreen("result");
  el.resultIcon.src = asset(type.icon); el.resultIcon.alt = type.name; el.resultType.textContent = type.name; el.resultSummary.textContent = type.summary; el.resultBehavior.textContent = type.behavior;
  el.scoreFaith.textContent = analysis.faith; el.scoreHesitation.textContent = analysis.hesitation; el.scoreAvoidance.textContent = analysis.avoidance; el.scoreHuman.textContent = analysis.human;
  const fortune = getFortune(analysis.totals.success);
  el.fortuneHits.textContent = `${analysis.totals.success} / 5`;
  el.fortuneRank.textContent = fortune.rank;
  el.fortuneComment.textContent = fortune.comment;
  el.finalLog.innerHTML = stageLogs.map(log => `<article><header><strong>${log.stageTitle}</strong><span>${log.result}</span></header><p>${logSummary(log)}</p><small>ためらい ${(log.hesitationMs / 1000).toFixed(1)}秒 / 結果待ちの無操作 ${(log.waitNoInputMs / 1000).toFixed(1)}秒</small></article>`).join("");
}
function buildShareText() { return ["MY儀式 診断結果", `タイプ：${el.resultType.textContent}`, `今日の運勢：${el.fortuneRank.textContent}`, `当たり数：${el.fortuneHits.textContent}`, `信仰心：${el.scoreFaith.textContent}`, `ためらい：${el.scoreHesitation.textContent}`, `現実逃避：${el.scoreAvoidance.textContent}`, `人間味：${el.scoreHuman.textContent}`, "", "見るまで確定じゃない。", "#MY儀式"].join("\n"); }
async function shareResult() {
  const text = buildShareText();
  const shareData = { title: "MY儀式", text, url: location.href };
  el.copyStatus.textContent = "";

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(text);
        el.copyStatus.textContent = "シェアできないため結果をコピーしました。";
      } catch {
        el.copyStatus.textContent = "シェアできませんでした。";
      }
      return;
    }
  }

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(location.href)}`;
  const popup = window.open(xUrl, "_blank");
  if (popup) {
    popup.opener = null;
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    el.copyStatus.textContent = "シェア画面を開けないため結果をコピーしました。";
  } catch {
    el.copyStatus.textContent = "シェアできませんでした。";
  }
}

el.startBtn.addEventListener("click", startGame); el.nextBtn.addEventListener("click", nextStage); el.restartBtn.addEventListener("click", startGame); el.shareBtn.addEventListener("click", shareResult);
