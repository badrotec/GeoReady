/* script.js — احترافي ومتوافق مع الأسماء الحالية للملفات */
const SUBJECT_FILES = [
  { file: "Basic Geology.json", title: "Basic Geology" },
  { file: "Hydrogeology.json", title: "Hydrogeology" },
  { file: "Petrology.json", title: "Petrology" }
];

// DOM
const subjectScreen = document.getElementById("subject-screen");
const subjectsContainer = document.getElementById("subjects");

const quizScreen = document.getElementById("quiz-screen");
const subjectTitle = document.getElementById("subject-title");
const timerEl = document.getElementById("timer");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const currentSpan = document.getElementById("current");
const totalSpan = document.getElementById("total");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const feedback = document.getElementById("feedback");

const resultScreen = document.getElementById("result-screen");
const correctCountEl = document.getElementById("correct-count");
const totalCountEl = document.getElementById("total-count");
const percentageEl = document.getElementById("percentage");
const levelText = document.getElementById("level-text");
const reviewList = document.getElementById("review");

const restartBtn = document.getElementById("restart-btn");
const retryBtn = document.getElementById("retry-btn");

const soundCorrect = document.getElementById("sound-correct");
const soundWrong = document.getElementById("sound-wrong");
const soundTimeup = document.getElementById("sound-timeup");

// State
let questions = [];
let currentIndex = 0;
let selectedSubjectFile = null;
let answers = []; // store selected index per question
let score = 0;
let timerInterval = null;
const TIME_PER_QUESTION = 20; // seconds per question (يمكن تعديلها)

/* Utility: clear screens */
function showScreen(screenEl){
  [subjectScreen, quizScreen, resultScreen].forEach(s => s.classList.remove("active"));
  screenEl.classList.add("active");
}

/* 1) generate subject cards */
function renderSubjects(){
  subjectsContainer.innerHTML = "";
  SUBJECT_FILES.forEach(s => {
    const card = document.createElement("div");
    card.className = "subject-card";
    card.innerHTML = `<h3>${s.title}</h3><p>${s.file}</p>`;
    card.addEventListener("click", () => startSubject(s));
    subjectsContainer.appendChild(card);
  });
}

/* 2) start subject: load JSON then start quiz */
async function startSubject(subject){
  selectedSubjectFile = subject;
  subjectTitle.textContent = subject.title;
  showScreen(quizScreen);
  try {
    // encodeURI to handle spaces in filename
    const res = await fetch(encodeURI(subject.file));
    if(!res.ok) throw new Error("Failed to fetch file: " + subject.file);
    const data = await res.json();
    // Expecting data as array of { question, options:[...], correct: index }
    questions = Array.isArray(data) ? data : [];
    if(questions.length === 0) {
      feedback.textContent = "لا توجد أسئلة في هذا الملف.";
      return;
    }
    answers = new Array(questions.length).fill(null);
    currentIndex = 0;
    score = 0;
    totalSpan.textContent = questions.length;
    renderQuestion();
  } catch(err){
    console.error(err);
    showScreen(subjectScreen);
    alert("حدث خطأ في تحميل ملف الأسئلة: " + subject.file + "\nتحقق من وجود الملف في نفس المجلد.");
  }
}

/* 3) render question */
function renderQuestion(){
  clearInterval(timerInterval);
  const q = questions[currentIndex];
  questionText.textContent = q.question || "نص السؤال مفقود";
  optionsContainer.innerHTML = "";
  feedback.textContent = "";

  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = opt;
    // restore previous selection style
    if(answers[currentIndex] !== null){
      btn.classList.add("disabled");
      if(answers[currentIndex] === idx){
        if(idx === q.correct) btn.classList.add("correct");
        else btn.classList.add("wrong");
      }
    } else {
      btn.addEventListener("click", () => chooseOption(idx, btn));
    }
    optionsContainer.appendChild(btn);
  });

  currentSpan.textContent = currentIndex + 1;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = answers[currentIndex] === null;
  // start per-question timer
  startTimer(TIME_PER_QUESTION);
}

/* 4) choose option */
function chooseOption(idx, btn){
  const q = questions[currentIndex];
  // disable all
  const allBtns = optionsContainer.querySelectorAll(".option");
  allBtns.forEach(b => b.classList.add("disabled"));
  // mark chosen
  answers[currentIndex] = idx;
  if(idx === q.correct){
    btn.classList.add("correct");
    feedback.textContent = "إجابة صحيحة 🎉";
    try { soundCorrect.play(); } catch(e){}
  } else {
    btn.classList.add("wrong");
    // highlight correct one
    const correctBtn = allBtns[q.correct];
    if(correctBtn) correctBtn.classList.add("correct");
    feedback.textContent = "إجابة خاطئة ❌";
    try { soundWrong.play(); } catch(e){}
  }
  // enable next
  nextBtn.disabled = false;
  clearInterval(timerInterval);
}

/* 5) next & prev handlers */
prevBtn.addEventListener("click", () => {
  if(currentIndex > 0){
    currentIndex--;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  // if on last question, finish
  if(currentIndex < questions.length - 1){
    currentIndex++;
    renderQuestion();
  } else {
    finishQuiz();
  }
});

/* 6) timer */
function startTimer(seconds){
  let time = seconds;
  updateTimerUI(time);
  timerInterval = setInterval(() => {
    time--;
    updateTimerUI(time);
    if(time <= 0){
      clearInterval(timerInterval);
      // mark unanswered as timed out (null stays) but show correct
      handleTimeUp();
    }
  },1000);
}
function updateTimerUI(t){
  const mm = String(Math.floor(t / 60)).padStart(2,"0");
  const ss = String(t % 60).padStart(2,"0");
  timerEl.textContent = `${mm}:${ss}`;
  if(t <= 5) timerEl.style.boxShadow = "0 6px 20px rgba(255,87,34,0.2)";
  else timerEl.style.boxShadow = "";
}
function handleTimeUp(){
  const q = questions[currentIndex];
  // disable options and show correct
  const allBtns = optionsContainer.querySelectorAll(".option");
  allBtns.forEach((b, i) => {
    b.classList.add("disabled");
    if(i === q.correct) b.classList.add("correct");
  });
  feedback.textContent = "انتهى الوقت ⏰";
  try { soundTimeup.play(); } catch(e){}
  // allow next
  nextBtn.disabled = false;
}

/* 7) finish quiz */
function finishQuiz(){
  clearInterval(timerInterval);
  // calculate score
  score = 0;
  questions.forEach((q, i) => {
    if(answers[i] === q.correct) score++;
  });

  correctCountEl.textContent = score;
  totalCountEl.textContent = questions.length;
  const perc = Math.round((score / questions.length) * 100);
  percentageEl.textContent = perc + "%";
  // level logic (مثال)
  let level = "مبتدئ";
  if(perc >= 85) level = "خبير";
  else if(perc >= 65) level = "متقدم";
  else if(perc >= 45) level = "متوسط";
  levelText.textContent = level;

  // review
  reviewList.innerHTML = "";
  questions.forEach((q, i) => {
    const item = document.createElement("div");
    item.className = "review-item";
    const userAnsText = answers[i] !== null && answers[i] !== undefined ? q.options[answers[i]] : "لم تُجب";
    const correctText = q.options[q.correct];
    const status = (answers[i] === q.correct) ? "✓ صحيح" : "✗ خاطئ";
    item.innerHTML = `<p><strong>س${i+1}:</strong> ${q.question}</p>
      <p>إجابتك: <span class="${answers[i]===q.correct ? 'correct' : 'wrong'}">${userAnsText}</span> — ${status}</p>
      <p>الإجابة الصحيحة: <strong>${correctText}</strong></p>`;
    reviewList.appendChild(item);
  });

  showScreen(resultScreen);
}

/* 8) restart / retry */
restartBtn && restartBtn.addEventListener("click", () => {
  showScreen(subjectScreen);
  questions = []; answers = []; score = 0;
  subjectTitle.textContent = "";
});
retryBtn && retryBtn.addEventListener("click", () => {
  // restart same subject
  if(selectedSubjectFile) startSubject(selectedSubjectFile);
});

/* init */
renderSubjects();
showScreen(subjectScreen);