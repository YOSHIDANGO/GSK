const stages = [
  { id:"slot", title:"兆しのランプ", prompt:"光れば大当たり。レバーは、まだ引かなくていい。", image:"stage1_slot_base.png", images:{ idle:"stage1_slot_base.png", ritual:"stage1_slot_base.png", resolving:"stage1_slot_spinning.png", concealed:"stage1_slot_base.png", win:"stage1_slot_win.png", lose:"stage1_slot_base.png" } },
  { id:"ball", title:"最後の封印", prompt:"最後のカプセル。押したくなったボタンは、好きに押していい。", image:"stage2_battle_base.png", images:{ idle:"stage2_battle_base.png", ritual:"stage2_battle_base.png", resolving:"stage2_battle_capturing.png", concealed:"stage2_battle_capturing.png", win:"stage2_battle_success.png", lose:"stage2_battle_fail.png" } },
  { id:"gacha", title:"最後の一回", prompt:"残り一回。押すタイミングだけは、自分で決められる。", image:"stage3_gacha_top.png", images:{ idle:"stage3_gacha_top.png", ritual:"stage3_gacha_top.png", resolving:"stage3_gacha_drawing.png", concealed:"stage3_gacha_drawing.png", win:"stage3_gacha_win.png", lose:"stage3_gacha_lose.png" } },
  { id:"mail", title:"当落のお知らせ", prompt:"開けば分かる。開かなければ、まだ落ちていない。", image:"stage4_lottery_base.png", images:{ idle:"stage4_lottery_base.png", ritual:"stage4_lottery_base.png", resolving:"stage4_lottery_opening.png", concealed:"stage4_lottery_opening.png", win:"stage4_lottery_win.png", lose:"stage4_lottery_lose.png" } },
  { id:"exam", title:"結果照会", prompt:"受験番号は入力済み。あとは、見るだけ。", image:"stage5_exam_base.png", images:{ idle:"stage5_exam_base.png", ritual:"stage5_exam_base.png", resolving:"stage5_exam_base.png", concealed:"stage5_exam_base.png", win:"stage5_exam_base.png", lose:"stage5_exam_base.png" } }
];

const typeDefs = {
  resonance:{ name:"本体シンクロ型", title:"筐体と心拍を合わせし者", icon:"type_resonance.png", behavior:"動く画面へ指を合わせる", summary:"光る場所や揺れる画面に、自分の指先まで同期してしまうタイプです。" },
  mash:{ name:"連打祈祷型", title:"回数で運命を殴る者", icon:"type_mash.png", behavior:"意味のない連打", summary:"押せるものは押せるだけ押す。回数には意味があると、指だけが信じています。" },
  hide:{ name:"隠蔽確認型", title:"見えなければ未確定の者", icon:"type_hide.png", behavior:"結果を見ないための行動", summary:"結果を知りたいのに、最後の一瞬だけは隠しておきたいタイプです。" },
  stroke:{ name:"なで信仰型", title:"対象を過剰に愛撫する者", icon:"type_stroke.png", behavior:"対象への過剰な愛撫", summary:"なでれば何かが伝わる気がする。対象との対話を指先へ託すタイプです。" },
  timing:{ name:"間合い調整型", title:"押せるのに押さない者", icon:"type_timing.png", behavior:"押せるのに押さない時間", summary:"押す瞬間にだけは意味があると信じ、最良の一拍を探し続けるタイプです。" },
  stare:{ name:"無言凝視型", title:"視線だけで運命を圧す者", icon:"type_stare.png", behavior:"結果待ちの無言凝視", summary:"余計なことはせず、ただ見守る。その沈黙も立派な儀式です。" },
  escape:{ name:"現実回避型", title:"余白へ逃げる者", icon:"type_escape.png", behavior:"関係ない場所への退避", summary:"本当に見るべき場所ほど触れず、画面の余白へ気持ちを逃がすタイプです。" }
};

const resultPatterns = [
  [false,true,false,true,true], [true,false,true,false,false], [false,false,true,true,true],
  [true,true,false,false,true], [true,false,false,true,false], [false,true,true,false,false]
];
const params = new URLSearchParams(location.search);
const debug = {
  enabled: params.get("debug") === "1",
  result: ["win","lose"].includes(params.get("result")) ? params.get("result") : "",
  stage: ({capture:"ball",lottery:"mail"})[params.get("stage")] || params.get("stage") || "",
  echo: params.get("echo") || ""
};

const el = Object.fromEntries([
  "intro","setup","game","result","startBtn","setupStartBtn","favoriteChoices","stageCount","stageTitle","stagePrompt",
  "experienceMount","stageWhisper","nextBtn","soundToggle","debugPanel","replayText","strongestRitual","strongestEvidence","heatmapGrid",
  "resultIcon","resultType","resultTitle","resultSummary","resultBehavior","resultReason","favoriteResultTitle","favoriteResultOutcome",
  "favoriteResultComment","scoreFaith","scoreHesitation","scoreAvoidance","scoreHuman","fortuneHits","fortuneRank","fortuneComment",
  "finalLog","shareCardType","shareCardTitle","shareCardRitual","shareCardFavorite","shareCardFortune","shareBtn","restartBtn","copyStatus"
].map(id => [id, document.getElementById(id)]));

const asset = name => `./assets/${name}`;
let favoriteId = "";
let playOrder = [];
let playIndex = 0;
let stageLogs = [];
let state = null;
let timers = new Set();
let audioContext = null;
let soundEnabled = readSoundPreference();
let sessionResults = {};
let activeEcho = "";

function readSoundPreference() {
  try { return localStorage.getItem("mygishiki-sound") !== "off"; } catch { return true; }
}
function saveSoundPreference() {
  try { localStorage.setItem("mygishiki-sound", soundEnabled ? "on" : "off"); } catch { /* storage is optional */ }
}
function later(fn, ms) {
  const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
  timers.add(id); return id;
}
function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }
function showScreen(name) {
  ["intro","setup","game","result"].forEach(id => el[id].classList.toggle("hidden", id !== name));
  window.scrollTo(0, 0);
}
function ensureAudio() {
  if (!soundEnabled) return null;
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;
  audioContext ||= new AudioCtor();
  if (audioContext.state === "suspended") audioContext.resume().catch(() => {});
  return audioContext;
}
function tone(frequency, duration=.08, type="sine", volume=.035, delay=0) {
  const ctx = ensureAudio(); if (!ctx) return;
  const oscillator = ctx.createOscillator(), gain = ctx.createGain(), start = ctx.currentTime + delay;
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(volume, start+.012); gain.gain.exponentialRampToValueAtTime(.0001, start+duration);
  oscillator.connect(gain).connect(ctx.destination); oscillator.start(start); oscillator.stop(start+duration+.02);
}
function sound(name) {
  if (!soundEnabled) return;
  const sounds = {
    pull:()=>{ tone(95,.18,"square",.045); tone(55,.22,"sine",.05,.03); },
    stop:()=>tone(170 + (state?.log.stopButtonTaps || 0)*35,.08,"square",.035),
    throw:()=>{ tone(230,.12,"sine",.035); tone(520,.15,"sine",.025,.08); },
    shake:()=>tone(82,.11,"square",.025), success:()=>{ tone(523,.12); tone(784,.22,"sine",.04,.11); },
    fail:()=>tone(92,.18,"sawtooth",.025), summon:()=>tone(72,.28,"sine",.055), door:()=>tone(140,.18,"sawtooth",.03),
    card:()=>tone(660,.12,"triangle",.035), paper:()=>tone(260,.045,"triangle",.018), click:()=>tone(190,.06,"square",.02),
    reveal:()=>tone(420,.09,"sine",.02)
  };
  sounds[name]?.();
}
function vibrate(pattern=12) { if (soundEnabled && navigator.vibrate) navigator.vibrate(pattern); }
function updateSoundButton() { el.soundToggle.textContent = soundEnabled ? "音 ON" : "音 OFF"; el.soundToggle.setAttribute("aria-pressed", String(soundEnabled)); }

function renderSetup() {
  el.favoriteChoices.innerHTML = stages.map(stage => `<button type="button" data-favorite="${stage.id}"><span>${stage.title}</span><small>${stage.prompt.split("。")[0]}。</small></button>`).join("");
  el.favoriteChoices.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    favoriteId = button.dataset.favorite;
    el.favoriteChoices.querySelectorAll("button").forEach(item => item.classList.toggle("selected", item === button));
    el.setupStartBtn.disabled = false; sound("click");
  }));
  const radio = document.querySelector(`input[name="sound"][value="${soundEnabled ? "on" : "off"}"]`); if (radio) radio.checked = true;
}
function beginSession() {
  soundEnabled = document.querySelector('input[name="sound"]:checked')?.value !== "off"; saveSoundPreference(); ensureAudio(); updateSoundButton();
  if (!favoriteId) return;
  const normalOrder = stages.filter(stage => stage.id !== favoriteId);
  playOrder = [...normalOrder, stages.find(stage => stage.id === favoriteId)];
  if (debug.stage && stages.some(stage => stage.id === debug.stage)) playOrder = [stages.find(stage => stage.id === debug.stage)];
  const pattern = resultPatterns[Math.floor(Math.random()*resultPatterns.length)];
  sessionResults = Object.fromEntries(stages.map((stage,index) => [stage.id, debug.result ? debug.result === "win" : pattern[index]]));
  stageLogs = []; playIndex = 0; showScreen("game"); loadStage();
}

function freshLog(stage) {
  return {
    stageId:stage.id, stageTitle:stage.title, result:"", touchPoints:[], taps:0, outsideTaps:0, strokes:0, longPressMs:0, hesitationMs:0, waitNoInputMs:0,
    lampTouches:0, lampDistance:0, leverPulls:0, leverPullDelayMs:0, stopButtonTaps:0, stopOrder:[], lampCoverMs:0, revealHesitationMs:0,
    aButtonTaps:0, bButtonHolds:0, dpadDownTaps:0, screenTapsDuringCapture:0, throwSpeed:0, revealAction:"", postShakeRevealMs:0,
    gachaHesitationMs:0, gachaButtonHolds:0, gachaStrokes:0, doorOpenMs:0, doorStops:0, cardRevealMs:0, cardTouches:0,
    envelopeTouches:0, envelopeDistance:0, envelopeHesitationMs:0, envelopeHolds:0, flapOpenMs:0, paperSpeed:0, paperStops:0, textRevealMs:0, paperReturned:0,
    examHesitationMs:0, examCurtainMoves:0, examPeeks:0, examCurtainReturns:0, examRevealMs:0, examRehideAttempts:0, hides:0
  };
}
function createState(stage) {
  const now = performance.now();
  return { status:"intro", isResolved:false, isRevealed:false, result:sessionResults[stage.id], startedAt:now, resolvedAt:0, revealedAt:0, lastInputAt:now, pointerState:{}, interactionLogs:freshLog(stage), log:null, stage, phase:"" };
}
function determineEcho() {
  if (debug.echo) return debug.echo;
  if (!stageLogs.length) return "";
  const totals = summarize(stageLogs);
  const candidates = {
    mash:totals.aButtonTaps+totals.stopButtonTaps,
    stroke:totals.strokes+totals.gachaStrokes+totals.lampTouches,
    hold:(totals.bButtonHolds+totals.gachaButtonHolds)/500,
    timing:totals.hesitationMs/2500,
    hide:totals.hides+totals.examCurtainReturns+totals.paperReturned,
    escape:totals.outsideTaps
  };
  const [key,value] = Object.entries(candidates).sort((a,b)=>b[1]-a[1])[0];
  return value > 1 ? key : "";
}
function echoMarkup() { return `<div class="ritual-echo" aria-hidden="true"><i></i><i></i><i></i><span>×</span></div><div class="stage-feedback" aria-live="polite"></div>`; }
function imagePair(name) { const src=asset(name); return `<img class="experience-backdrop" src="${src}" alt="" aria-hidden="true" draggable="false"><img class="experience-bg" src="${src}" alt="" draggable="false">`; }

function stageMarkup(stage) {
  const bg = imagePair(stage.images.idle);
  if (stage.id === "slot") return `<section class="experience-stage stage-slot">${bg}<div class="stage-overlay">${echoMarkup()}<button class="hotspot hotspot-lamp guided-target" data-action="lamp" aria-label="ランプをなで、覆う"><small>最後にここを隠す</small></button><div class="finger-cover" aria-hidden="true"></div><button class="hotspot hotspot-lever guided-control" data-action="lever" aria-label="レバーを下へ引く"><b>↓</b><small>レバー</small></button><div class="hotspot-stop-buttons">${[1,2,3].map(n=>`<button class="hotspot stop-${n}" data-action="stop" data-stop="${n}" aria-label="停止ボタン${n}"><span>${n}</span></button>`).join("")}</div><div class="lamp-glow"></div></div></section>`;
  if (stage.id === "ball") return `<section class="experience-stage stage-ball">${bg}<div class="stage-overlay">${echoMarkup()}<button class="hotspot throw-zone guided-control throw-control" data-action="throw" aria-label="カプセルを上へ投げる"><b>↑</b><i></i><small>上へ投げる<br><em>タップでもOK</em></small></button><button class="hotspot capsule-reveal guided-target" data-action="capsule" aria-label="カプセルに触れる"><small>ここで結果を見る</small></button><div class="screen-flash"></div><div class="handheld-controls"><div class="dpad"><button aria-label="上"></button><button aria-label="左"></button><span></span><button aria-label="右"></button><button data-action="dpad-down" aria-label="下">▼</button></div><div class="system-buttons"><button aria-label="SELECT"></button><button aria-label="START"></button></div><div class="ab-buttons"><button class="button-b" data-action="b" aria-label="Bボタン">B</button><button class="button-a" data-action="a" aria-label="Aボタン">A</button></div></div></div></section>`;
  if (stage.id === "gacha") return `<section class="experience-stage stage-gacha">${bg}<div class="stage-overlay">${echoMarkup()}<button class="hotspot hotspot-gacha guided-control hold-control" data-action="gacha" aria-label="召喚ボタンを長押しする"><b>長押し</b><small>離すと召喚</small></button><div class="summon-charge"></div><div class="gacha-door" data-action="door"><i></i><i></i><strong>← 左右へ開く →<small>タップでもOK</small></strong></div><button class="gacha-card" data-action="card" aria-label="結果カードをめくる"><span>封</span><small>タップしてめくる</small></button></div></section>`;
  if (stage.id === "mail") return `<section class="experience-stage stage-mail">${bg}<div class="stage-overlay">${echoMarkup()}<button class="hotspot envelope-surface" data-action="envelope" aria-label="封筒をなでる"></button><button class="lottery-flap guided-control" data-action="flap" aria-label="封筒のふたを上へ開く"><b>↑</b><small>ふたを上へ<br><em>タップでもOK</em></small></button><div class="lottery-result-sheet"><img src="${asset(state.result ? stage.images.win : stage.images.lose)}" alt="抽選結果"></div><button class="paper-pull" data-action="paper" aria-label="中の紙を引き出す"><b>↑</b><span>紙を引き出す<small>タップでも開く</small></span></button></div></section>`;
  return `<section class="experience-stage stage-exam">${bg}<div class="stage-overlay">${echoMarkup()}<button class="hotspot hotspot-exam-button guided-control exam-control" data-action="exam" aria-label="結果を表示する"><b>結果を表示する</b></button><div class="exam-loading"><i></i><span>照会中です…</span></div><div class="exam-result-panel"><small>照会結果</small><strong>${state.result ? "合格" : "不合格"}</strong><p>${state.result ? "おめでとうございます。あなたは合格です。" : "今回は合格基準に達しませんでした。"}</p></div><div class="exam-drag-curtain" data-action="curtain"><span>↑ 上へ動かして見る<br><small>タップでも開く</small></span></div></div></section>`;
}

const firstInstructions = {
  slot:"光っている「レバー」を下へ動かす（タップでもOK）",
  ball:"画面中央のカプセルを上へ動かす（タップでもOK）",
  gacha:"画面下の「長押し」を押して、好きな時に離す",
  mail:"封筒の「ふたを上へ」を動かす（タップでもOK）",
  exam:"画面の「結果を表示する」を押す"
};
function instruct(text){
  const step=state?.status==="concealed"?3:state?.status==="resolving"?2:1;
  el.stageWhisper.innerHTML=`<strong>${step}/3</strong><span><small>次の操作</small>${text}</span>`;
}
function feedback(text){
  const node=el.experienceMount.querySelector(".stage-feedback");if(!node)return;
  const token=String(performance.now());node.dataset.token=token;node.textContent=text;node.classList.add("show");
  later(()=>{if(node.dataset.token===token)node.classList.remove("show");},620);
}

function loadStage() {
  clearTimers();
  const stage = playOrder[playIndex]; state = createState(stage); state.log = state.interactionLogs; activeEcho = determineEcho();
  el.stageCount.textContent = `${playIndex+1} / ${playOrder.length}${stage.id===favoriteId ? "・本命" : ""}`;
  el.stageTitle.textContent = stage.title; el.stagePrompt.textContent = stage.prompt; el.stageWhisper.textContent = ""; el.nextBtn.classList.add("hidden");
  el.experienceMount.innerHTML = `<section class="stage-intro-panel compact-intro" data-action="begin"><span>${stage.id===favoriteId ? "本命・最終記録" : `記録 ${playIndex+1}`}</span><h2>${stage.title}</h2><p>${stage.prompt}</p><button type="button" class="intro-enter">この画面を操作する</button></section>`;
  const intro = el.experienceMount.firstElementChild;
  let started=false; const begin=()=>{ if(started)return; started=true; beginStage(); };
  intro.addEventListener("pointerdown", begin, {once:true}); later(begin, stage.id===favoriteId ? 3600 : 2600); updateDebug();
}
function beginStage() {
  if (!state || state.status !== "intro") return;
  clearTimers(); state.status="idle"; state.startedAt=performance.now(); state.phase="";
  el.experienceMount.innerHTML=stageMarkup(state.stage);
  const experience=el.experienceMount.querySelector(".experience-stage");
  experience.classList.toggle("is-favorite", state.stage.id===favoriteId);
  if(activeEcho) experience.classList.add(`echo-${activeEcho}`);
  if(debug.enabled) experience.classList.add("debug-hotspots");
  bindCommon(experience); bindStage(experience); setStatus("idle"); instruct(firstInstructions[state.stage.id]);
}
function setStatus(status) {
  if (!state) return; state.status=status;
  const experience=el.experienceMount.querySelector(".experience-stage"); if(!experience)return;
  experience.dataset.state=status;
  ["idle","ritual","resolving","concealed","reveal","win","lose"].forEach(name=>experience.classList.toggle(`state-${name}`,name===status));
  const imageName=state.stage.images[status] || state.stage.images.idle;
  experience.querySelectorAll(".experience-bg,.experience-backdrop").forEach(image=>image.src=asset(imageName));
  updateDebug();
}
function recordTouch(event, experience) {
  const rect=experience.getBoundingClientRect();
  state.log.touchPoints.push({ x:(event.clientX-rect.left)/rect.width, y:(event.clientY-rect.top)/rect.height });
  state.log.taps += 1;
}
function bindCommon(experience) {
  experience.addEventListener("pointerdown", event=>{
    if(state.isRevealed){ if(state.stage.id==="exam" && event.target.closest('[data-action="curtain"]')) state.log.examRehideAttempts++; return; }
    recordTouch(event,experience); state.lastInputAt=performance.now();
    if(state.stage.id==="ball"&&state.status==="resolving"&&!event.target.closest(".handheld-controls"))state.log.screenTapsDuringCapture++;
    if(!event.target.closest("[data-action]")){ state.log.outsideTaps++; if(state.status==="concealed")state.log.hides++; }
    if(activeEcho==="escape" && !event.target.closest("[data-action]")){ experience.classList.add("echo-react"); later(()=>experience.classList.remove("echo-react"),260); }
    updateDebug();
  });
}
function pointerGesture(node, handlers={}) {
  if(!node)return;
  let pointerId=null, start=null, last=null;
  node.addEventListener("pointerdown", event=>{
    if(pointerId!==null)return; pointerId=event.pointerId; start=last={x:event.clientX,y:event.clientY,t:performance.now()};
    try{node.setPointerCapture(pointerId);}catch{}
    handlers.down?.(event,start);
  });
  node.addEventListener("pointermove", event=>{
    if(event.pointerId!==pointerId)return; const point={x:event.clientX,y:event.clientY,t:performance.now()}; handlers.move?.(event,{start,last,point}); last=point;
  });
  const finish=(event,cancelled)=>{ if(event.pointerId!==pointerId)return; const point={x:event.clientX,y:event.clientY,t:performance.now()}; handlers.up?.(event,{start,last,point,cancelled}); pointerId=null; start=last=null; };
  node.addEventListener("pointerup",event=>finish(event,false)); node.addEventListener("pointercancel",event=>finish(event,true));
}

function bindStage(experience) {
  ({slot:bindSlot,ball:bindBall,gacha:bindGacha,mail:bindMail,exam:bindExam})[state.stage.id](experience);
}
function bindSlot(root) {
  const lamp=root.querySelector('[data-action="lamp"]'), cover=root.querySelector(".finger-cover"); let strokeDistance=0, coverStarted=0;
  pointerGesture(lamp,{
    down:(event)=>{ state.log.lampTouches++; strokeDistance=0; if(state.status==="concealed"){coverStarted=performance.now();root.classList.add("lamp-covered");moveCover(event);} },
    move:(event,{last,point})=>{ const distance=Math.hypot(point.x-last.x,point.y-last.y);state.log.lampDistance+=distance;strokeDistance+=distance;if(strokeDistance>35){state.log.strokes++;strokeDistance=-9999;}if(state.status==="concealed")moveCover(event); },
    up:(event,{cancelled})=>{root.classList.remove("lamp-covered");if(state.status==="concealed"&&coverStarted&&!cancelled){state.log.lampCoverMs+=performance.now()-coverStarted;state.log.revealHesitationMs=performance.now()-state.resolvedAt;revealStage("lamp-release");}coverStarted=0;}
  });
  function moveCover(event){const rect=root.getBoundingClientRect();cover.style.left=`${event.clientX-rect.left}px`;cover.style.top=`${event.clientY-rect.top}px`;}
  let leverDone=false;
  const pullLever=()=>{if(leverDone||!["idle","ritual"].includes(state.status))return;leverDone=true;state.log.leverPulls++;state.log.leverPullDelayMs=performance.now()-state.startedAt;state.log.hesitationMs=state.log.leverPullDelayMs;state.resolvedAt=performance.now();setStatus("resolving");sound("pull");vibrate(18);feedback("リール回転");instruct("光っている停止ボタンを 1 → 2 → 3 の順に押す");};
  pointerGesture(root.querySelector('[data-action="lever"]'),{
    down:()=>{if(state.status==="idle")setStatus("ritual");},
    move:(event,{start,point})=>{if(point.y-start.y>38)pullLever();},
    up:(_,data)=>{if(data.cancelled&&!leverDone)setStatus("idle");else if(!data.cancelled)pullLever();}
  });
  const stopped=new Set(); root.querySelectorAll('[data-action="stop"]').forEach(button=>button.addEventListener("pointerdown",()=>{
    if(state.status!=="resolving")return; const number=Number(button.dataset.stop);state.log.stopButtonTaps++;state.log.stopOrder.push(number);stopped.add(number);button.classList.add("pressed");later(()=>button.classList.remove("pressed"),120);sound("stop");vibrate(8);feedback(`${number} 停止`);
    if(stopped.size===3){state.isResolved=true;state.resolvedAt=performance.now();setStatus("concealed");instruct("左側のランプを押して、指を離す");}
  }));
}
function bindBall(root) {
  let thrown=false;
  const throwCapsule=speed=>{if(thrown||state.status!=="idle")return;thrown=true;state.log.throwSpeed=Math.round(speed);state.log.hesitationMs=performance.now()-state.startedAt;state.resolvedAt=performance.now();setStatus("resolving");sound("throw");vibrate(12);feedback("捕獲開始");instruct("揺れている間は A・B・▼ を好きに押せる");[520,1180,1840].forEach((ms,index)=>later(()=>{if(state.status!=="resolving")return;root.classList.remove("shake-1","shake-2","shake-3");root.classList.add(`shake-${index+1}`);sound("shake");vibrate(7);feedback(`${index+1} 回目`);},ms));later(()=>{if(state.status!=="resolving")return;state.isResolved=true;state.resolvedAt=performance.now();setStatus("concealed");instruct("Aを押す、Bを離す、または中央のカプセルを押す");},2250);};
  pointerGesture(root.querySelector('[data-action="throw"]'),{
    move:(event,{start,point})=>{const dy=point.y-start.y,dt=Math.max(1,point.t-start.t);if(dy < -38)throwCapsule(Math.abs(dy)/dt*1000);},
    up:(_,data)=>{if(!thrown&&!data.cancelled)throwCapsule(0);}
  });
  const a=root.querySelector('[data-action="a"]'); a.addEventListener("pointerdown",()=>{if(!["resolving","concealed"].includes(state.status))return;state.log.aButtonTaps++;a.classList.add("pressed");root.classList.add("a-sync");later(()=>root.classList.remove("a-sync"),90);sound("click");if(state.status==="concealed")revealBall("Aボタン");});a.addEventListener("pointerup",()=>a.classList.remove("pressed"));
  let bStart=0; const b=root.querySelector('[data-action="b"]');pointerGesture(b,{down:()=>{if(["resolving","concealed"].includes(state.status)){bStart=performance.now();b.classList.add("pressed");root.classList.add("b-hold");}},up:(_,data)=>{if(!bStart)return;state.log.bButtonHolds+=performance.now()-bStart;bStart=0;b.classList.remove("pressed");root.classList.remove("b-hold");if(state.status==="concealed"&&!data.cancelled)revealBall("Bを離す");}});
  root.querySelector('[data-action="dpad-down"]').addEventListener("pointerdown",event=>{if(!["resolving","concealed"].includes(state.status))return;state.log.dpadDownTaps++;event.currentTarget.classList.add("pressed");root.classList.add("dpad-sink");later(()=>{event.currentTarget.classList.remove("pressed");root.classList.remove("dpad-sink");},130);});
  root.querySelector('[data-action="capsule"]').addEventListener("pointerdown",()=>{if(state.status==="concealed")revealBall("カプセルをタップ");else if(state.status==="resolving")state.log.screenTapsDuringCapture++;});
  function revealBall(action){state.log.revealAction=action;state.log.postShakeRevealMs=performance.now()-state.resolvedAt;revealStage(action);}
}
function bindGacha(root) {
  const button=root.querySelector('[data-action="gacha"]');let pressedAt=0,travel=0;
  const updateCharge=()=>{if(!pressedAt)return;const charge=Math.min(1,(performance.now()-pressedAt)/1800);root.style.setProperty("--charge-scale",String(.35+charge*.65));root.style.setProperty("--charge-brightness",String(.8+charge*.25));tone(115+charge*210,.13,"sine",.012);later(updateCharge,260);};
  pointerGesture(button,{down:()=>{if(state.status!=="idle")return;pressedAt=performance.now();setStatus("ritual");root.classList.add("charging");updateCharge();instruct("指を離すと召喚が始まる");},move:(event,{last,point})=>{if(!pressedAt)return;travel+=Math.hypot(point.x-last.x,point.y-last.y);if(travel>28){state.log.gachaStrokes++;travel=-9999;}},up:(_,data)=>{if(!pressedAt)return;const held=performance.now()-pressedAt;pressedAt=0;root.classList.remove("charging");if(data.cancelled){setStatus("idle");return;}state.log.gachaButtonHolds+=held;state.log.longPressMs+=held;state.log.gachaHesitationMs=performance.now()-state.startedAt;state.log.hesitationMs=state.log.gachaHesitationMs;state.resolvedAt=performance.now();setStatus("resolving");sound("summon");vibrate(16);instruct("召喚中…少し待つ");later(()=>{if(state.status!=="resolving")return;state.isResolved=true;state.resolvedAt=performance.now();state.phase="door";setStatus("concealed");instruct("扉を左右へ動かす（タップでも開く）");},1200);}});
  let doorBase=0;
  const openDoor=()=>{state.log.doorOpenMs=performance.now()-state.resolvedAt;state.phase="card";root.classList.add("door-open","card-ready");sound("door");vibrate(10);feedback("扉 解放");instruct("中央の裏向きカードをタップする");};
  pointerGesture(root.querySelector('[data-action="door"]'),{down:()=>{if(state.status==="concealed"&&state.phase==="door")doorBase=performance.now();},move:(event,{start,point})=>{if(state.phase!=="door")return;const progress=Math.min(1,Math.abs(point.x-start.x)/100);root.style.setProperty("--door-left",`${progress*-54}%`);root.style.setProperty("--door-right",`${progress*54}%`);},up:(_,data)=>{if(state.phase!=="door")return;const distance=Math.abs(data.point.x-data.start.x);if(data.cancelled){state.log.doorStops++;root.style.setProperty("--door-left","0%");root.style.setProperty("--door-right","0%");return;}if(distance<18||distance>=70)openDoor();else{state.log.doorStops++;root.style.setProperty("--door-left","0%");root.style.setProperty("--door-right","0%");instruct("扉を大きく左右へ動かす（タップでも開く）");}}});
  pointerGesture(root.querySelector('[data-action="card"]'),{down:()=>{if(state.phase==="card")state.log.cardTouches++;},up:(_,data)=>{if(state.phase!=="card"||data.cancelled)return;const dy=data.point.y-data.start.y,dt=data.point.t-data.start.t;if(dy < -35 || dt<420){state.log.cardRevealMs=performance.now()-(state.resolvedAt+state.log.doorOpenMs);sound("card");revealStage("カードをめくる");}}});
}
function bindMail(root) {
  let envelopeTravel=0;
  pointerGesture(root.querySelector('[data-action="envelope"]'),{down:()=>{if(state.status==="idle")state.log.envelopeTouches++;},move:(event,{last,point})=>{if(state.status!=="idle")return;const d=Math.hypot(point.x-last.x,point.y-last.y);state.log.envelopeDistance+=d;envelopeTravel+=d;if(envelopeTravel>35){state.log.strokes++;envelopeTravel=-9999;sound("paper");}}});
  const openFlap=()=>{state.log.flapOpenMs=performance.now()-state.startedAt;state.log.envelopeHesitationMs=state.log.flapOpenMs;state.log.hesitationMs=state.log.flapOpenMs;state.resolvedAt=performance.now();state.isResolved=true;state.phase="paper";setStatus("concealed");root.classList.add("flap-open");sound("paper");vibrate(9);feedback("封筒 開封");instruct("出てきた「紙を引き出す」を操作する");};
  pointerGesture(root.querySelector('[data-action="flap"]'),{down:()=>{if(state.status==="idle")setStatus("ritual");},move:(event,{start,point})=>{if(!["idle","ritual"].includes(state.status))return;const progress=Math.min(1,Math.max(0,(start.y-point.y)/70));root.style.setProperty("--flap-angle",`${progress*-72}deg`);},up:(_,data)=>{if(!["idle","ritual"].includes(state.status))return;const amount=data.start.y-data.point.y;if(data.cancelled){root.style.setProperty("--flap-angle","0deg");setStatus("idle");return;}if(amount<14||amount>=42)openFlap();else{root.style.setProperty("--flap-angle","0deg");setStatus("idle");instruct("「ふたを上へ」を大きく動かす（タップでも開く）");}}});
  let baseProgress=0,maxProgress=0,dragStartTime=0,textVisibleAt=0,lastPaperSound=0;
  pointerGesture(root.querySelector('[data-action="paper"]'),{down:()=>{if(state.phase==="paper")dragStartTime=performance.now();},move:(event,{start,point})=>{if(state.phase!=="paper")return;const progress=Math.min(1,Math.max(0,baseProgress+(start.y-point.y)/160));if(progress>.35&&!textVisibleAt)textVisibleAt=performance.now();if(progress<maxProgress-.08)state.log.paperReturned=1;maxProgress=Math.max(maxProgress,progress);root.style.setProperty("--paper-y",`${(1-progress)*70}%`);root.style.setProperty("--paper-cover",`${(1-progress)*100}%`);state.pointerState.paperProgress=progress;if(performance.now()-lastPaperSound>110){lastPaperSound=performance.now();sound("paper");}},up:(_,data)=>{if(state.phase!=="paper")return;const previous=baseProgress,progress=state.pointerState.paperProgress||baseProgress,elapsed=Math.max(1,performance.now()-dragStartTime),distance=Math.abs(data.point.y-data.start.y);state.log.paperSpeed=Math.round(Math.abs(progress-baseProgress)*160/elapsed*1000);if(data.cancelled){root.style.setProperty("--paper-y",`${(1-previous)*70}%`);root.style.setProperty("--paper-cover",`${(1-previous)*100}%`);state.log.paperStops++;return;}if(distance<12){root.style.setProperty("--paper-y","0%");root.style.setProperty("--paper-cover","0%");state.log.textRevealMs=0;revealStage("通知をタップして開く");return;}baseProgress=progress;if(progress<.78){state.log.paperStops++;instruct("紙をもっと上へ引く（タップでも開く）");return;}state.log.textRevealMs=textVisibleAt?performance.now()-textVisibleAt:0;revealStage("通知を最後まで引く");}});
}
function bindExam(root) {
  root.querySelector('[data-action="exam"]').addEventListener("pointerdown",()=>{
    if(state.status!=="idle")return;state.log.examHesitationMs=performance.now()-state.startedAt;state.log.hesitationMs=state.log.examHesitationMs;state.resolvedAt=performance.now();setStatus("resolving");sound("click");vibrate(8);instruct("照会中…そのまま待つ");later(()=>{if(state.status!=="resolving")return;state.isResolved=true;state.resolvedAt=performance.now();state.phase="curtain";setStatus("concealed");instruct("結果のカーテンを上へ動かす（タップでも開く）");},2100);
  });
  let base=0,max=0,started=0,returnedThisGesture=false;
  pointerGesture(root.querySelector('[data-action="curtain"]'),{down:()=>{if(state.phase==="curtain"){started=performance.now();returnedThisGesture=false;state.log.examCurtainMoves++;}},move:(event,{start,point})=>{if(state.phase!=="curtain")return;const progress=Math.min(1,Math.max(0,base+(start.y-point.y)/160));if(progress<max-.06&&!returnedThisGesture){returnedThisGesture=true;state.log.examCurtainReturns++;state.log.examPeeks++;state.log.hides++;}max=Math.max(max,progress);state.pointerState.curtainProgress=progress;root.style.setProperty("--curtain-y",`${progress*-92}%`);},up:(_,data)=>{if(state.phase!=="curtain")return;const previous=base,progress=state.pointerState.curtainProgress||base,distance=Math.abs(data.point.y-data.start.y);if(data.cancelled){root.style.setProperty("--curtain-y",`${previous*-92}%`);return;}if(distance<12){root.style.setProperty("--curtain-y","-92%");state.log.examRevealMs=performance.now()-state.resolvedAt;sound("reveal");revealStage("カーテンをタップして開く");return;}base=progress;if(progress>=.68){state.log.examRevealMs=performance.now()-state.resolvedAt;sound("reveal");revealStage("カーテンを開く");}else instruct("カーテンをもっと上へ動かす（タップでも開く）");}});
}

function revealStage(action) {
  if (!state || state.isRevealed || !state.isResolved) return;
  state.isRevealed=true;state.revealedAt=performance.now();state.log.waitNoInputMs=Math.max(0,state.revealedAt-Math.max(state.resolvedAt,state.lastInputAt));state.log.result=state.result?"成功":"失敗";
  setStatus("reveal"); el.stageWhisper.textContent=""; vibrate(state.stage.id===favoriteId?[22,35,28]:14);
  later(()=>{if(!state?.isRevealed)return;setStatus(state.result?"win":"lose");sound(state.result?"success":"fail");el.stageWhisper.textContent=state.result?"届いた。":"静かに、届かなかった。";el.nextBtn.textContent=playIndex===playOrder.length-1?"黒歴史を開示する":"次の記録へ";el.nextBtn.classList.remove("hidden");updateDebug(action);},180);
}
function nextStage() {
  if(!state?.isRevealed)return;
  stageLogs.push(state.log); clearTimers();
  if(playIndex>=playOrder.length-1){showResult();return;}
  playIndex++;loadStage();
}

function summarize(logs) {
  const totals={success:0,touchPoints:[]};
  logs.forEach(log=>Object.entries(log).forEach(([key,value])=>{
    if(typeof value==="number")totals[key]=(totals[key]||0)+value;
    if(key==="touchPoints")totals.touchPoints.push(...value);
  }));
  totals.success=logs.filter(log=>log.result==="成功").length;return totals;
}
function analyzeLogs(logs) {
  const t=summarize(logs),totalPresses=t.aButtonTaps+t.stopButtonTaps+t.dpadDownTaps;
  const scores={
    resonance:t.lampTouches*2+t.screenTapsDuringCapture*2+t.dpadDownTaps*2,
    mash:t.aButtonTaps*3+t.stopButtonTaps*3+t.taps*.2,
    hide:t.hides*6+t.examCurtainReturns*5+t.paperReturned*7+t.lampCoverMs/500,
    stroke:t.strokes*6+t.gachaStrokes*5+t.lampDistance/90+t.envelopeDistance/100,
    timing:t.hesitationMs/850+t.gachaButtonHolds/350+t.revealHesitationMs/600,
    stare:Math.max(3,t.waitNoInputMs/650-totalPresses),
    escape:t.outsideTaps*5
  };
  const [typeKey,topScore]=Object.entries(scores).sort((a,b)=>b[1]-a[1])[0];
  const sum=Math.max(1,Object.values(scores).reduce((a,b)=>a+b,0));
  const clamp=n=>Math.max(0,Math.min(100,Math.round(n)));
  return {totals:t,scores,typeKey,topScore,share:topScore/sum,faith:clamp(totalPresses*4+t.strokes*7),hesitation:clamp(t.hesitationMs/700+t.revealHesitationMs/350),avoidance:clamp(t.hides*12+t.outsideTaps*4+t.examCurtainReturns*7),human:clamp(48+(totalPresses+t.strokes+t.hides)*2)};
}
function diagnosticReason(analysis) {
  const t=analysis.totals,percent=Math.round(analysis.share*100),seconds=ms=>(ms/1000).toFixed(1);
  return ({
    resonance:`ランプへ${t.lampTouches}回触れ、捕獲中の画面入力を${t.screenTapsDuringCapture}回、十字キー下を${t.dpadDownTaps}回記録しました。演出へ合わせる入力が診断点の${percent}%を占めました。`,
    mash:`Aボタンを${t.aButtonTaps}回、停止ボタンを${t.stopButtonTaps}回押しました。連打系入力が診断点の${percent}%を占めました。`,
    hide:`隠す行動を${t.hides}回、カーテンを戻す動きを${t.examCurtainReturns}回記録しました。見えない状態を延長する行動が最も強く観測されました。`,
    stroke:`ランプ上を${Math.round(t.lampDistance)}px、封筒上を${Math.round(t.envelopeDistance)}px移動し、なで操作を${t.strokes+t.gachaStrokes}回記録しました。`,
    timing:`結果操作まで合計${seconds(t.hesitationMs)}秒、結果確定後も${seconds(t.revealHesitationMs)}秒待ちました。押せるのに押さない時間が最も強く観測されました。`,
    stare:`結果が決まったあと、合計${seconds(t.waitNoInputMs)}秒を無操作で見守りました。沈黙が他の操作を上回りました。`,
    escape:`結果欄ではない場所を${t.outsideTaps}回触りました。関係のない余白へ向かった入力が最も強く観測されました。`
  })[analysis.typeKey];
}
function replayLines(t) {
  const lines=[];
  if(t.aButtonTaps)lines.push(`Aボタンを <strong>${t.aButtonTaps}回</strong> 押し、`);
  if(t.bButtonHolds)lines.push(`Bボタンを <strong>${(t.bButtonHolds/1000).toFixed(1)}秒</strong> 握り、`);
  if(t.lampTouches||t.strokes)lines.push(`ランプや画面を <strong>${t.lampTouches+t.strokes}回</strong> なで、`);
  if(t.stopButtonTaps)lines.push(`停止ボタンを <strong>${t.stopButtonTaps}回</strong> 叩き、`);
  if(t.envelopeHesitationMs)lines.push(`封筒を開くまで <strong>${(t.envelopeHesitationMs/1000).toFixed(1)}秒</strong> ためらい、`);
  if(t.examCurtainReturns)lines.push(`合否のカーテンを <strong>${t.examCurtainReturns}回</strong> 戻し、`);
  if(t.outsideTaps)lines.push(`関係のない余白を <strong>${t.outsideTaps}回</strong> 触りました。`);
  if(!lines.length)lines.push(`あなたは余計なことをせず、ただ結果を見つめ続けました。`);
  lines[lines.length-1]=lines.at(-1).replace(/、$/,"。");return lines;
}
function getFortune(hits){return [
  ["逆神の日","今日は引くより、静かに寝た方がいい日。"],["低空飛行","運は渋め。でも、ひとつ拾えただけまだ人間。"],
  ["普通の日","良くも悪くも現実的。期待しすぎなければ悪くない。"],["なかなか持ってる","5回中3回当たり。今日はまだ信じていい日かもしれません。"],
  ["かなり強い","ここぞという場面で引けている。ちょっと調子に乗っていい。"],["豪運","全部当たり。今日だけは、儀式が効いたことにしていい。"]
][Math.max(0,Math.min(5,hits))];}
function favoriteCopy(log,otherWins){
  if(log.result==="成功"&&otherWins===0)return ["最後の一つが救った","連敗のあと、本命だけが応えました。"];if(log.result==="失敗"&&otherWins===stageLogs.length-1)return ["本命だけ届かず",`${otherWins}つの結果を引き寄せましたが、本命だけは沈黙しました。`];if(log.result==="成功")return ["本命成就","あなたが最も願った結果は、当たりでした。"];return ["本命沈黙","ほかの結果とは別に、本命だけは静かに閉じました。"];
}
function logSummary(log){
  if(log.stageId==="slot")return `なで ${log.lampTouches}回 / 移動 ${Math.round(log.lampDistance)}px / 停止順 ${log.stopOrder.join("→")||"なし"} / 隠した ${(log.lampCoverMs/1000).toFixed(1)}秒`;
  if(log.stageId==="ball")return `A ${log.aButtonTaps}回 / B ${(log.bButtonHolds/1000).toFixed(1)}秒 / 投擲 ${log.throwSpeed}px/秒 / 開示 ${log.revealAction||"なし"}`;
  if(log.stageId==="gacha")return `長押し ${(log.gachaButtonHolds/1000).toFixed(1)}秒 / 扉停止 ${log.doorStops}回 / カード接触 ${log.cardTouches}回`;
  if(log.stageId==="mail")return `封筒移動 ${Math.round(log.envelopeDistance)}px / 紙停止 ${log.paperStops}回 / 紙を戻した ${log.paperReturned?"はい":"いいえ"}`;
  return `押すまで ${(log.examHesitationMs/1000).toFixed(1)}秒 / カーテン ${log.examCurtainMoves}回 / 戻した ${log.examCurtainReturns}回 / 欄外 ${log.outsideTaps}回`;
}
function renderHeatmaps(){
  el.heatmapGrid.innerHTML=stageLogs.map((log,index)=>{const stage=stages.find(item=>item.id===log.stageId);return `<figure><div><img src="${asset(stage.image)}" alt="${stage.title}"><canvas data-heatmap="${index}" width="240" height="426"></canvas></div><figcaption>${stage.title}・${log.touchPoints.length}接触</figcaption></figure>`;}).join("");
  requestAnimationFrame(()=>el.heatmapGrid.querySelectorAll("canvas").forEach(canvas=>{const log=stageLogs[Number(canvas.dataset.heatmap)],ctx=canvas.getContext("2d");ctx.clearRect(0,0,canvas.width,canvas.height);log.touchPoints.forEach((point,index)=>{const nearby=log.touchPoints.filter(other=>Math.hypot(other.x-point.x,other.y-point.y)<.09).length,radius=Math.min(30,8+nearby*2);const gradient=ctx.createRadialGradient(point.x*240,point.y*426,0,point.x*240,point.y*426,radius);gradient.addColorStop(0,`rgba(255,39,112,${Math.min(.78,.25+nearby*.08)})`);gradient.addColorStop(1,"rgba(116,19,155,0)");ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(point.x*240,point.y*426,radius,0,Math.PI*2);ctx.fill();});}));
}
function showResult(){
  showScreen("result");const analysis=analyzeLogs(stageLogs),t=analysis.totals,type=typeDefs[analysis.typeKey];
  el.replayText.innerHTML=`<p>あなたは結果を待つ間に、</p>${replayLines(t).map(line=>`<p>${line}</p>`).join("")}`;
  el.strongestRitual.textContent=type.behavior;el.strongestEvidence.textContent=diagnosticReason(analysis);renderHeatmaps();
  el.resultIcon.src=asset(type.icon);el.resultIcon.alt=type.name;el.resultType.textContent=type.name;el.resultTitle.textContent=type.title;el.resultSummary.textContent=type.summary;el.resultBehavior.textContent=type.behavior;el.resultReason.textContent=diagnosticReason(analysis);
  const favoriteLog=stageLogs.find(log=>log.stageId===favoriteId)||stageLogs.at(-1),otherWins=stageLogs.filter(log=>log!==favoriteLog&&log.result==="成功").length,[favoriteOutcome,favoriteComment]=favoriteCopy(favoriteLog,otherWins);
  el.favoriteResultTitle.textContent=favoriteLog.stageTitle;el.favoriteResultOutcome.textContent=favoriteOutcome;el.favoriteResultComment.textContent=favoriteComment;
  el.scoreFaith.textContent=analysis.faith;el.scoreHesitation.textContent=analysis.hesitation;el.scoreAvoidance.textContent=analysis.avoidance;el.scoreHuman.textContent=analysis.human;
  const [rank,comment]=getFortune(t.success);el.fortuneHits.textContent=`${t.success} / ${stageLogs.length}`;el.fortuneRank.textContent=rank;el.fortuneComment.textContent=comment;
  el.finalLog.innerHTML=stageLogs.map(log=>`<article class="${log.stageId===favoriteId?"favorite-log":""}"><header><strong>${log.stageTitle}${log.stageId===favoriteId?"・本命":""}</strong><span>${log.result}</span></header><p>${logSummary(log)}</p></article>`).join("");
  el.shareCardType.textContent=type.name;el.shareCardTitle.textContent=type.title;el.shareCardRitual.textContent=`最強儀式：${type.behavior}`;el.shareCardFavorite.textContent=`本命：${favoriteLog.result}`;el.shareCardFortune.textContent=`運勢：${rank}`;
}
function buildShareText(){
  const favorite=stageLogs.find(log=>log.stageId===favoriteId)||stageLogs.at(-1);
  return [`私のMY儀式は「${el.resultType.textContent}」`,`称号：${el.resultTitle.textContent}`,"",`今回もっとも強い儀式：${el.strongestRitual.textContent}`,el.strongestEvidence.textContent,"",`本命：${favorite.result}`,`今日の運勢：${el.fortuneRank.textContent}（${el.fortuneHits.textContent}）`,"","見るまで確定じゃない。","#MY儀式"].join("\n");
}
async function shareResult(){
  const text=buildShareText(),data={title:"MY儀式",text,url:location.origin+location.pathname};el.copyStatus.textContent="";
  if(navigator.share){try{await navigator.share(data);return;}catch(error){if(error?.name==="AbortError")return;}}
  const popup=window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(data.url)}`,"_blank","noopener,noreferrer");if(popup)return;
  try{await navigator.clipboard.writeText(text);el.copyStatus.textContent="シェア画面を開けないため結果をコピーしました。";}catch{el.copyStatus.textContent="シェアできませんでした。";}
}
function updateDebug(action=""){
  if(!debug.enabled){el.debugPanel.classList.add("hidden");return;}el.debugPanel.classList.remove("hidden");
  el.debugPanel.textContent=`state=${state?.status||"-"} / stage=${state?.stage.id||"-"} / result=${state?.result?"win":"lose"} / echo=${activeEcho||"none"}${action?` / reveal=${action}`:""}\n${state?JSON.stringify(state.log,null,1):""}`;
}
function restart(){clearTimers();favoriteId="";playOrder=[];stageLogs=[];state=null;renderSetup();showScreen("setup");}

el.startBtn.addEventListener("click",()=>{renderSetup();if(debug.stage&&stages.some(stage=>stage.id===debug.stage)){favoriteId=debug.stage;beginSession();}else showScreen("setup");});
el.setupStartBtn.addEventListener("click",beginSession);
el.nextBtn.addEventListener("click",nextStage);
el.restartBtn.addEventListener("click",restart);
el.shareBtn.addEventListener("click",shareResult);
el.soundToggle.addEventListener("click",()=>{soundEnabled=!soundEnabled;saveSoundPreference();updateSoundButton();if(soundEnabled){ensureAudio();sound("click");}else if(navigator.vibrate)navigator.vibrate(0);});
updateSoundButton();
if(debug.stage&&stages.some(stage=>stage.id===debug.stage)){
  favoriteId=debug.stage; soundEnabled=false; renderSetup(); beginSession(); later(beginStage,80);
}
