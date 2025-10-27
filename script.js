// ✅ GeoReady Script.js — مصحح ومتكامل 2025
document.addEventListener("DOMContentLoaded", async () => {
  const loadingText = document.getElementById("loading-text");
  const quizContainer = document.getElementById("quiz-container");
  const startButton = document.getElementById("start-btn");
  const questionBox = document.getElementById("question-box");
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options-container");
  const nextButton = document.getElementById("next-btn");
  const resultBox = document.getElementById("result-box");
  const resultText = document.getElementById("result-text");

  let allQuestions = [];
  let currentQuestion = 0;
  let score = 0;

  // 🧠 ملفات البيانات (ضعها في نفس المجلد)
  const jsonFiles = [
    "data/geo_basics.json",
    "data/hydrogeology.json",
    "data/field_geology.json"
  ];

  // ✅ تحميل كل الملفات ودمجها
  async function loadAllData() {
    try {
      const promises = jsonFiles.map(file =>
        fetch(file).then(res => {
          if (!res.ok) throw new Error(`فشل تحميل ${file}`);
          return res.json();
        })
      );

      const results = await Promise.all(promises);

      // دمج جميع الأسئلة
      allQuestions = results.flatMap(obj =>
        Object.values(obj).flat()
      );

      if (!allQuestions.length) throw new Error("لم يتم العثور على أي أسئلة");

      loadingText.style.display = "none";
      startButton.style.display = "block";
    } catch (error) {
      loadingText.textContent = "⚠️ فشل تحميل البيانات: " + error.message;
      console.error(error);
    }
  }

  // ✅ بدء الاختبار
  startButton.addEventListener("click", () => {
    startButton.style.display = "none";
    quizContainer.style.display = "block";
    currentQuestion = 0;
    score = 0;
    showQuestion();
  });

  // ✅ عرض السؤال الحالي
  function showQuestion() {
    const q = allQuestions[currentQuestion];
    if (!q) {
      showResult();
      return;
    }

    questionText.textContent = `${currentQuestion + 1}. ${q.question}`;
    optionsContainer.innerHTML = "";

    q.options.forEach(option => {
      const btn = document.createElement("button");
      btn.textContent = option;
      btn.classList.add("option-btn");
      btn.onclick = () => selectAnswer(btn, q.answer);
      optionsContainer.appendChild(btn);
    });
  }

  // ✅ عند اختيار إجابة
  function selectAnswer(button, correctAnswer) {
    const buttons = document.querySelectorAll(".option-btn");
    buttons.forEach(btn => btn.disabled = true);

    if (button.textContent === correctAnswer) {
      button.classList.add("correct");
      score++;
    } else {
      button.classList.add("wrong");
      const correctBtn = [...buttons].find(
        b => b.textContent === correctAnswer
      );
      if (correctBtn) correctBtn.classList.add("correct");
    }

    nextButton.style.display = "block";
  }

  // ✅ السؤال التالي
  nextButton.addEventListener("click", () => {
    currentQuestion++;
    nextButton.style.display = "none";
    if (currentQuestion < allQuestions.length) {
      showQuestion();
    } else {
      showResult();
    }
  });

  // ✅ النتيجة النهائية
  function showResult() {
    quizContainer.style.display = "none";
    resultBox.style.display = "block";
    resultText.textContent = `نتيجتك: ${score} من ${allQuestions.length}`;
  }

  // بدء تحميل البيانات
  await loadAllData();
});