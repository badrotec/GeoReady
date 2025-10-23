/**
 * GeoReady - script.js
 * التزامات حرجة:
 *  - لا تعتمد أبداً على نص الإجابة للمقارنة/التلوين.
 *  - الحفاظ على مفتاح الخيار الأصلي ("أ","ب","ج","د") في data-key.
 *  - الصوتيات تُهيأ فقط بعد أول تفاعل (Start أو S).
 *  - التحقق من كل ملف JSON للتأكد من وجود 25 سؤالاً وبنية صحيحة.
 *
 * ملاحظة: لا تقبل أي سلوك يؤدي إلى تلوين خاطئ — التلوين يعتمد حصراً على مقارنة:
 *    chosenButton.dataset.key === currentQuestion.answer
 */

/* ============================
   تهيئة المتغيرات والتحكم UI
   ============================ */
const BANK_FILES = [
  "BasicGeology.json",
  "Geochemistry.json",
  "Geophysics.json",
  "Hydrogeology.json",
  "Petrology.json",
  "Structuralgeology.json",
  "sedimentarygeology.json"
];

const appState = {
  loadedBanks: {},    // filename -> array of 25 questions
  excludedBanks: new Set(),
  pool: [],           // final pool of questions for session
  currentIndex: 0,
  answers: [],        // {qId, bank, selectedKey, correctKey, timeTaken, status}
  timer: null,
  timeLeft: 0,
  timePerQuestion: 20,
  isTimerPaused: false,
  sounds: {correct:null, wrong:null, timeout:null},
  soundsReady: false,
  muted: false,
  devMode: false,
  shuffleOptions: true,
  skipBehavior: "unanswered"
};

/* ====== DOM ====== */
const $ = id => document.getElementById(id);
const startBtn = $("startBtn");
const loadBanksBtn = $("loadBanksBtn");
const bankSelect = $("bankSelect");
const countSelect = $("countSelect");
const timePerQuestionInput = $("timePerQuestion");
const shuffleOptionsCheckbox = $("shuffleOptions");
const skipBehaviorSelect = $("skipBehavior");
const setupLog = $("setupLog");
const quizSection = $("quiz");
const setupSection = $("setup");
const resultsSection = $("results");
const questionText = $("qText");
const optionsList = $("optionsList");
const progressText = $("progressText");
const timerText = $("timerText");
const timerBar = $("timerBar");
const prevBtn = $("prevBtn");
const nextBtn = $("nextBtn");
const skipBtn = $("skipBtn");
const toggleTimerBtn = $("toggleTimerBtn");
const muteBtn = $("muteBtn");
const devModeBtn = $("devModeBtn");
const resultsBtn = $("resultsBtn");
const backToMenuBtn = $("backToMenuBtn");
const exportBtn = $("exportBtn");
const reviewMistakesBtn = $("reviewMistakesBtn");
const scoresList = $("scoresList");
const summary = $("summary");
const mistakesList = $("mistakesList");
const modal = $("modal");
const modalBody = $("modalBody");
const modalPrimary = $("modalPrimary");
const modalSecondary = $("modalSecondary");
const modalTitle = $("modalTitle");
const homeBtn = $("homeBtn");
const forcePlayCheckbox = $("forcePlay");

/* ============================
   Utilities
   ============================ */
function logSetup(msg){
  setupLog.textContent = msg;
  console.debug("[GeoReady]", msg);
}
function showModal(title, html, primaryLabel="حسناً", secondaryLabel="إلغاء", primaryCb=null, secondaryCb=null){
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modalPrimary.textContent = primaryLabel;
  modalSecondary.textContent = secondaryLabel;
  modal.classList.remove("hidden");
  modalPrimary.onclick = () => { modal.classList.add("hidden"); if(primaryCb) primaryCb(); };
  modalSecondary.onclick = () => { modal.classList.add("hidden"); if(secondaryCb) secondaryCb(); };
}
function hideModal(){ modal.classList.add("hidden"); }

/* Shuffle Fisher-Yates */
function shuffleArray(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Validate JSON structure strictly */
function validateBankData(filename, arr){
  const problems = [];
  if(!Array.isArray(arr)){
    problems.push("الملف ليس مصفوفة.");
    return problems;
  }
  if(arr.length !== 25){
    problems.push(`العدد الفعلي للأسئلة = ${arr.length} (مطلوب 25).`);
  }
  arr.forEach((q, idx) => {
    const context = `سؤال index ${idx} (id=${q && q.id})`;
    if(!q || typeof q !== 'object'){
      problems.push(`${context} ليس كائنًا.`);
      return;
    }
    if(!("id" in q)) problems.push(`${context}: مفقود 'id'.`);
    if(!("question" in q)) problems.push(`${context}: مفقود 'question'.`);
    if(!("options" in q)) problems.push(`${context}: مفقود 'options'.`);
    else {
      const opts = q.options;
      const keys = ["أ","ب","ج","د"];
      for(const k of keys){
        if(!(k in opts)) problems.push(`${context}: مفقود مفتاح الخيار '${k}'.`);
      }
    }
    if(!("answer" in q)) problems.push(`${context}: مفقود 'answer'.`);
    else {
      if(!["أ","ب","ج","د"].includes(q.answer)) problems.push(`${context}: قيمة 'answer' غير صالحة (${q.answer}).`);
    }
  });
  return problems;
}

/* Fetch and validate a single JSON file */
async function fetchBank(filename){
  try{
    const res = await fetch(filename, {cache: "no-store"});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const problems = validateBankData(filename, data);
    return {filename, ok: problems.length===0, problems, data};
  }catch(err){
    return {filename, ok:false, problems:[`فشل التحميل: ${err.message}`], data:null};
  }
}

/* Load selected banks (used also at start) */
async function loadBanksFiles(selected = null){
  const toLoad = (selected && selected.length)? selected : BANK_FILES.slice();
  setupLog.textContent = "جارٍ تحميل الكتب/الملفات...";
  const results = [];
  for(const f of toLoad){
    if(appState.excludedBanks.has(f)) {
      logSetup(`تم استبعاد ${f}`);
      continue;
    }
    const r = await fetchBank(f);
    results.push(r);
    if(r.ok){
      appState.loadedBanks[f] = r.data;
      logSetup(`تم تحميل ${f} بنجاح (${r.data.length} سؤال).`);
    } else {
      console.warn("Validation issues for", f, r.problems);
    }
  }
  // Report problems
  const invalid = results.filter(r => !r.ok);
  if(invalid.length){
    let html = `<p>وجدت مشاكل في الملفات التالية:</p><ul>`;
    invalid.forEach(r=>{
      html += `<li><strong>${r.filename}:</strong><ul>${r.problems.map(p=>`<li>${p}</li>`).join("")}</ul></li>`;
    });
    html += `</ul><p>هل تريد إعادة المحاولة أم استبعاد الملفات المعطوبة؟</p>`;
    showModal("ملفات JSON غير صحيحة/ناقصة", html, "إعادة المحاولة", "استبعاد", async ()=>{
      // Primary: retry
      hideModal();
      await loadBanksFiles(invalid.map(i=>i.filename));
    }, ()=>{
      // Secondary: exclude and continue
      invalid.forEach(i => appState.excludedBanks.add(i.filename));
      hideModal();
      logSetup("تم استبعاد الملفات المعطوبة. يمكنك البدء بالموجود.");
    });
  } else {
    setupLog.textContent = "تم تحميل جميع الملفات بنجاح وصالحة.";
  }
}

/* Initialize audio resources after first user interaction */
function initSoundsIfNeeded(){
  if(appState.soundsReady) return;
  const tryCreateAudio = (src) => {
    try{
      const a = new Audio(src);
      a.preload = "auto";
      return a;
    }catch(e){
      return null;
    }
  };

  const c = tryCreateAudio("sounds/correct.mp3");
  const w = tryCreateAudio("sounds/wrong.mp3");
  const t = tryCreateAudio("sounds/timeout.mp3");

  // Fallbacks: if any missing, create simple beep via Web Audio API wrappers
  const createBeep = (freq=440, duration=0.12) => {
    return function playBeep(){
      try{
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.value = 0.0001;
        o.connect(g);
        g.connect(ctx.destination);
        const now = ctx.currentTime;
        g.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
        o.start(now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        o.stop(now + duration + 0.02);
      }catch(e){
        console.warn("WebAudio unavailable", e);
      }
    };
  };

  appState.sounds.correct = c ? (() => { c.currentTime = 0; c.play().catch(()=>{}); c.pause(); return c; })() : null;
  appState.sounds.wrong = w ? (() => { w.currentTime = 0; w.play().catch(()=>{}); w.pause(); return w; })() : null;
  appState.sounds.timeout = t ? (() => { t.currentTime = 0; t.play().catch(()=>{}); t.pause(); return t; })() : null;

  // If any missing, replace with function wrappers
  if(!appState.sounds.correct) appState.sounds.correct = { play: createBeep(880,0.15) };
  if(!appState.sounds.wrong)   appState.sounds.wrong   = { play: createBeep(220,0.3) };
  if(!appState.sounds.timeout) appState.sounds.timeout = { play: createBeep(440,0.4) };

  // But we won't actually call play until needed.
  appState.soundsReady = true;
}

/* Play sound unless muted; expects object with play() */
function playSound(soundObj){
  if(appState.muted) return;
  if(!soundObj) return;
  try{
    if(typeof soundObj.play === "function"){
      // If it's an <audio> element, call play(). If wrapper, it's already function.
      soundObj.play().catch(()=>{/* ignore */});
    }
  }catch(e){
    console.warn("خطأ عند تشغيل الصوت", e);
  }
}

/* ============================
   Session assembly and start
   ============================ */
function preparePoolFromSelection(){
  const selectedBank = bankSelect.value;
  const countSel = countSelect.value;
  appState.pool = [];
  if(selectedBank === "ALL"){
    // gather all loaded banks except excluded
    for(const f of BANK_FILES){
      if(appState.excludedBanks.has(f)) continue;
      const data = appState.loadedBanks[f];
      if(data) appState.pool.push(...data.map(q => ({...q, _bank: f})));
    }
  } else {
    const data = appState.loadedBanks[selectedBank];
    if(!data){
      throw new Error(`لم يتم تحميل البنك ${selectedBank}`);
    }
    appState.pool = data.map(q => ({...q, _bank: selectedBank}));
  }

  if(appState.pool.length === 0){
    throw new Error("قاعدة الأسئلة فارغة. تأكد من تحميل الملفات أو عدم استبعادها كلها.");
  }

  // number selection
  let finalCount;
  if(countSel === "ALL") finalCount = appState.pool.length;
  else finalCount = Math.min(Number(countSel), appState.pool.length);

  // shuffle pool then slice
  appState.pool = shuffleArray(appState.pool.slice());
  if(finalCount < appState.pool.length){
    appState.pool = appState.pool.slice(0, finalCount);
  }
  // Reset session state
  appState.currentIndex = 0;
  appState.answers = [];
}

/* Start quiz */
async function startQuiz(){
  try{
    // ensure banks loaded
    const selected = bankSelect.value;
    if(selected === "ALL"){
      // load all if not loaded
      const need = BANK_FILES.filter(f => !(f in appState.loadedBanks) && !appState.excludedBanks.has(f));
      if(need.length) await loadBanksFiles(need);
    } else {
      if(!(selected in appState.loadedBanks) && !appState.excludedBanks.has(selected)){
        await loadBanksFiles([selected]);
      }
    }

    preparePoolFromSelection();
  }catch(err){
    showModal("خطأ أثناء التجهيز", `<p>${err.message}</p>`, "حسناً");
    return;
  }

  // Initialize sounds now (user-initiated)
  initSoundsIfNeeded();
  if(forcePlayCheckbox.checked){
    appState.devMode = true;
    // attempt to unlock autoplay by playing silent or short beep
    try{ appState.sounds.correct.play().catch(()=>{}); }catch(e){}
  }

  // apply UI state
  setupSection.classList.add("hidden");
  resultsSection.classList.add("hidden");
  quizSection.classList.remove("hidden");
  renderQuestion();
  updateProgressText();
}

/* ============================
   Rendering/questions flow
   ============================ */
function updateProgressText(){
  const total = appState.pool.length;
  const idx = appState.currentIndex + 1;
  progressText.textContent = `السؤال ${idx} من ${total}`;
}

/* Render a question to DOM */
function renderQuestion(){
  const q = appState.pool[appState.currentIndex];
  if(!q) return;
  // set time per question
  appState.timePerQuestion = Math.max(5, Number(timePerQuestionInput.value) || 20);

  // Build options array keeping original key
  const optionsArr = Object.entries(q.options).map(([key, text]) => ({ key, text }));
  if(shuffleOptionsCheckbox.checked) shuffleArray(optionsArr);

  // Render
  questionText.textContent = q.question;
  optionsList.innerHTML = "";
  optionsArr.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.setAttribute("role","listitem");
    btn.setAttribute("data-key", opt.key); // CRITICAL: keep original key here
    btn.setAttribute("data-pos", idx); // ordinal (1..4) for keyboard mapping
    btn.type = "button";
    btn.innerHTML = `<span class="option-text">${opt.text}</span><span class="option-key" aria-hidden="true">${opt.key}</span><span class="option-icon" aria-hidden="true"></span>`;
    btn.addEventListener("click", onOptionSelected);
    optionsList.appendChild(btn);
  });

  // Reset answered status for this question
  appState.answered = false;
  // Reset timer
  startTimer();
  // Focus first option for keyboard users
  const firstBtn = optionsList.querySelector(".option-btn");
  if(firstBtn) firstBtn.focus();
  updateProgressText();
}

/* Disable/enable options */
function setOptionsDisabled(state){
  const opts = optionsList.querySelectorAll(".option-btn");
  opts.forEach(b => b.setAttribute("aria-disabled", state ? "true" : "false"));
}

/* Remove color classes from options to avoid conflicts */
function clearOptionClasses(){
  const opts = optionsList.querySelectorAll(".option-btn");
  opts.forEach(b => {
    b.classList.remove("correct","wrong");
    const icon = b.querySelector(".option-icon");
    if(icon){
      icon.classList.remove("correct-icon","wrong-icon");
    }
  });
}

/* Find button by data-key */
function findButtonByKey(key){
  return optionsList.querySelector(`.option-btn[data-key="${key}"]`);
}

/* Option selection handler */
function onOptionSelected(e){
  if(appState.answered) return; // prevent multiple selections until next
  const btn = e.currentTarget;
  const selectedKey = btn.dataset.key;
  processAnswer(selectedKey);
}

/* Process answer (central decision point)
   STRICT RULE: only compare selectedKey === currentQuestion.answer
*/
function processAnswer(selectedKey, meta = {viaSkip:false}){
  const currentQuestion = appState.pool[appState.currentIndex];
  if(!currentQuestion) return;
  appState.answered = true;
  stopTimer();

  // remove conflicting classes first (strict)
  clearOptionClasses();

  // find correct button by original key (data-key)
  const correctKey = currentQuestion.answer;
  const correctBtn = findButtonByKey(correctKey);

  // mark correct
  if(correctBtn){
    correctBtn.classList.add("correct");
    const icon = correctBtn.querySelector(".option-icon");
    if(icon){ icon.classList.add("correct-icon"); icon.setAttribute("aria-label","صحيح"); }
    correctBtn.setAttribute("aria-label","صحيح");
  }

  // if user selected, mark wrong if necessary
  const selectedBtn = selectedKey ? findButtonByKey(selectedKey) : null;
  if(selectedBtn && selectedKey !== correctKey){
    selectedBtn.classList.add("wrong");
    const icon = selectedBtn.querySelector(".option-icon");
    if(icon){ icon.classList.add("wrong-icon"); icon.setAttribute("aria-label","خاطئ"); }
    selectedBtn.setAttribute("aria-label","خاطئ");
  }

  // Play appropriate sound (and only one)
  if(meta.viaSkip){
    if(appState.skipBehavior === "timeout_sound"){
      playSound(appState.sounds.timeout);
    }
  } else {
    if(selectedKey === correctKey){
      playSound(appState.sounds.correct);
    } else {
      playSound(appState.sounds.wrong);
    }
  }

  // record answer
  const status = meta.viaSkip ? "skipped" : (selectedKey === correctKey ? "correct" : "wrong");
  appState.answers.push({
    qId: currentQuestion.id,
    bank: currentQuestion._bank,
    question: currentQuestion.question,
    options: currentQuestion.options,
    selectedKey: selectedKey || null,
    correctKey,
    status,
    timeUsed: appState.timePerQuestion - appState.timeLeft
  });

  // disable further clicks until moving on
  setOptionsDisabled(true);

  // after 2s move to next (or if last, show results)
  setTimeout(()=>{
    // enable for potential review navigation
    setOptionsDisabled(false);
    if(appState.currentIndex < appState.pool.length - 1){
      appState.currentIndex++;
      renderQuestion();
    } else {
      finishSession();
    }
  }, 2000);
}

/* Timer management */
function startTimer(){
  appState.timeLeft = appState.timePerQuestion;
  appState.isTimerPaused = false;
  updateTimerUI();
  if(appState.timer) clearInterval(appState.timer);
  appState.timer = setInterval(()=>{
    if(appState.isTimerPaused) return;
    appState.timeLeft--;
    if(appState.timeLeft <= 0){
      clearInterval(appState.timer);
      appState.timeLeft = 0;
      updateTimerUI();
      // treat as timeout
      processAnswer(null, {viaSkip:true});
      playSound(appState.sounds.timeout);
    } else {
      updateTimerUI();
    }
  }, 1000);
}
function stopTimer(){
  if(appState.timer) { clearInterval(appState.timer); appState.timer = null; }
}
function toggleTimer(){
  appState.isTimerPaused = !appState.isTimerPaused;
  toggleTimerBtn.setAttribute("aria-pressed", String(appState.isTimerPaused));
}
function updateTimerUI(){
  const total = appState.timePerQuestion;
  const left = appState.timeLeft;
  const percent = Math.round((left / total) * 100);
  timerText.textContent = `${left}s`;
  timerBar.value = percent;
}

/* Finish and compute results */
function finishSession(){
  stopTimer();
  quizSection.classList.add("hidden");
  resultsSection.classList.remove("hidden");

  const total = appState.pool.length;
  const correctCount = appState.answers.filter(a => a.status === "correct").length;
  const percent = Math.round((correctCount / total) * 100);
  summary.innerHTML = `<p>النتيجة: ${correctCount} / ${total} — ${percent}%</p>`;

  // save to localStorage
  const scores = JSON.parse(localStorage.getItem("GeoReady_scores") || "[]");
  const entry = {
    date: new Date().toISOString(),
    banks: Array.from(new Set(appState.pool.map(q => q._bank))),
    totalQuestions: total,
    correctCount,
    percent,
    answers: appState.answers
  };
  scores.push(entry);
  // keep latest 50
  while(scores.length > 50) scores.shift();
  localStorage.setItem("GeoReady_scores", JSON.stringify(scores));
  renderTopScores();
}

/* Render top 5 from localStorage */
function renderTopScores(){
  const scores = JSON.parse(localStorage.getItem("GeoReady_scores") || "[]");
  const sorted = scores.slice().sort((a,b) => b.percent - a.percent).slice(0,5);
  scoresList.innerHTML = "";
  sorted.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${new Date(s.date).toLocaleString()} — ${s.percent}% (${s.correctCount}/${s.totalQuestions})`;
    scoresList.appendChild(li);
  });
}

/* Review mistakes */
function renderMistakes(){
  mistakesList.innerHTML = "";
  const wrongs = appState.answers.filter(a => a.status !== "correct");
  if(wrongs.length === 0){
    mistakesList.innerHTML = "<p>لا أخطاء لتعلّمها — أداء ممتاز!</p>";
  } else {
    wrongs.forEach(w => {
      const div = document.createElement("div");
      div.className = "mistake-item";
      const html = `<h4>${w.question}</h4>
        <ul>
          ${Object.entries(w.options).map(([k,t]) => `<li><strong>${k}</strong>: ${t} ${k === w.correctKey ? ' <em>(الإجابة الصحيحة)</em>' : ''} ${k === w.selectedKey ? ' <strong>(اخترت)</strong>' : ''}</li>`).join("")}
        </ul>
        <p>مصدر: ${w.bank}</p>`;
      div.innerHTML = html;
      mistakesList.appendChild(div);
    });
  }
  mistakesList.classList.remove("hidden");
}

/* Export session */
function exportSession(){
  const blob = new Blob([JSON.stringify({meta:{date:new Date().toISOString()}, answers: appState.answers}, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `GeoReady_session_${new Date().toISOString().slice(0,19)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ============================
   UI events and keyboard
   ============================ */
startBtn.addEventListener("click", async ()=> {
  try {
    await startQuiz();
  } catch(err){
    showModal("خطأ", `<p>${err.message}</p>`);
  }
});

loadBanksBtn.addEventListener("click", async ()=>{
  await loadBanksFiles();
});

prevBtn.addEventListener("click", ()=>{
  if(appState.currentIndex > 0){
    appState.currentIndex--;
    renderQuestion();
  }
});
nextBtn.addEventListener("click", ()=>{
  if(appState.currentIndex < appState.pool.length - 1){
    appState.currentIndex++;
    renderQuestion();
  } else {
    finishSession();
  }
});
skipBtn.addEventListener("click", ()=>{
  // skip counts as unanswered — behavior per setting
  processAnswer(null, {viaSkip:true});
});
toggleTimerBtn.addEventListener("click", toggleTimer);

muteBtn.addEventListener("click", ()=>{
  appState.muted = !appState.muted;
  muteBtn.textContent = appState.muted ? "🔇" : "🔊";
});

devModeBtn.addEventListener("click", ()=>{
  appState.devMode = !appState.devMode;
  devModeBtn.setAttribute("aria-pressed", String(appState.devMode));
});

/* Results controls */
backToMenuBtn.addEventListener("click", ()=>{
  resultsSection.classList.add("hidden");
  setupSection.classList.remove("hidden");
});
exportBtn.addEventListener("click", exportSession);
reviewMistakesBtn.addEventListener("click", renderMistakes);
resultsBtn.addEventListener("click", ()=>{
  // load last results if any
  renderTopScores();
  setupSection.classList.add("hidden");
  quizSection.classList.add("hidden");
  resultsSection.classList.remove("hidden");
});

/* Keyboard handling:
   1-4 to choose displayed options (order-dependent)
   Enter to move next if already answered
   S to start
   Esc to open exit confirmation modal
*/
document.addEventListener("keydown", (e)=>{
  if(document.activeElement && document.activeElement.tagName === "INPUT") return;
  const key = e.key;
  if(key === "s" || key === "S"){
    if(setupSection.classList.contains("hidden")) return;
    startBtn.click();
  }
  if(key === "Escape"){
    // confirm exit
    if(!modal.classList.contains("hidden")) { modal.classList.add("hidden"); return; }
    showModal("تأكيد الخروج", "<p>هل تريد الخروج من الجلسة الحالية؟ سيتم فقد التقدم غير المحفوظ.</p>", "نعم", "لا", ()=>{
      // Primary: exit to menu
      appState.pool = [];
      stopTimer();
      quizSection.classList.add("hidden");
      setupSection.classList.remove("hidden");
      hideModal();
    }, ()=>{
      hideModal();
    });
  }
  // If in quiz view, handle 1-4
  if(!quizSection.classList.contains("hidden")){
    if(["1","2","3","4"].includes(key)){
      const pos = Number(key) - 1;
      const btn = optionsList.querySelector(`.option-btn[data-pos="${pos}"]`);
      if(btn) btn.click();
    } else if(key === "Enter"){
      // If answered, go to next
      if(appState.answered){
        if(appState.currentIndex < appState.pool.length - 1){
          appState.currentIndex++;
          renderQuestion();
        } else {
          finishSession();
        }
      }
    }
  }
});

/* Accessibility: Manage focus when modal opens/closes */
modal.addEventListener("transitionend", ()=>{
  if(!modal.classList.contains("hidden")) modalPrimary.focus();
});

/* Initial render of top scores on load */
renderTopScores();

/* Dev-mode quick test: verify all banks loaded and validated (console) */
async function devValidateAllBanks(){
  const results = [];
  for(const f of BANK_FILES){
    const r = await fetchBank(f);
    if(!r.ok) console.error("JSON validation failed:", r.filename, r.problems);
    results.push(r);
  }
  return results;
}

// Optional: Expose to window for dev testing
window.GeoReady = {
  state: appState,
  loadBanksFiles,
  devValidateAllBanks
};

/* End of script */