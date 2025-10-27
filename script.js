let questions = {};
let selectedCategory = "";
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 20;

const homeSection = document.getElementById("home");
const quizSection = document.getElementById("quiz");
const resultSection = document.getElementById("result");
const categoryList = document.getElementById("categories");
const startBtn = document.getElementById("start-btn");
const scoreDisplay = document.getElementById("score");
const questionText = document.getElementById("question-text");
const optionsBox = document.getElementById("options");
const timerBar = document.getElementById("timer-bar");
const timeRemaining = document.getElementById("time-remaining");
const finalScore = document.getElementById("final-score");
const retryBtn = document.getElementById("retry-btn");

// تحميل الأسئلة
fetch("./Question.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    showCategories();
  })
  .catch(err => console.error("❌ خطأ في تحميل الأسئلة:", err));

function showCategories() {
  categoryList.innerHTML = "";
  for (let cat in questions) {
    const btn = document.createElement("button");
    btn.textContent = cat.replace(/_/g, " ");
    btn.addEventListener("click", () => {
      document.querySelectorAll(".category-list button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectedCategory = cat;
      startBtn.disabled = false;
    });
    categoryList.appendChild(btn);
  }
}

// بدء الاختبار
startBtn.addEventListener("click", () => {
  if (!selectedCategory) return;
  currentIndex = 0;
  score = 0;
  homeSection.classList.add("hidden");
  quizSection.classList.remove("hidden");
  loadQuestion();
});

function loadQuestion() {
  const data = questions[selectedCategory];
  if (currentIndex >= data.length) return endQuiz();

  const q = data[currentIndex];
  questionText.textContent = q.question;
  optionsBox.innerHTML = "";
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.addEventListener("click", () => checkAnswer(opt, q.answer));
    optionsBox.appendChild(btn);
  });
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 20;
  updateTimerBar();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerBar();
    if (timeLeft <= 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);
}

function updateTimerBar() {
  timerBar.style.width = (timeLeft / 20) * 100 + "%";
  timeRemaining.textContent = timeLeft + "s";
}

function checkAnswer(selected, correct) {
  clearInterval(timer);
  if (selected === correct) score += 5;
  else score = Math.max(0, score - 3);
  scoreDisplay.textContent = score;
  nextQuestion();
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < questions[selectedCategory].length) loadQuestion();
  else endQuiz();
}

function endQuiz() {
  clearInterval(timer);
  quizSection.classList.add("hidden");
  resultSection.classList.remove("hidden");
  finalScore.textContent = `نتيجتك: ${score}`;
}

retryBtn.addEventListener("click", () => {
  resultSection.classList.add("hidden");
  homeSection.classList.remove("hidden");
  score = 0;
  scoreDisplay.textContent = "0";
  startBtn.disabled = true;
});

// تبديل اللغة (واجهة فقط)
document.querySelectorAll(".lang-switch button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".lang-switch button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.body.dir = btn.dataset.lang === "ar" ? "rtl" : "ltr";
  });
});