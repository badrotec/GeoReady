// =========================
// GeoReady Script.js
// =========================

const app = {
  state: {
    currentIndex: 0,
    questions: [],
    currentQuestion: null,
    correctCount: 0,
    timer: null,
    timeLeft: 20,
    sounds: {},
    isMuted: false,
    initializedAudio: false,
  },

  categories: [
    { id: "BasicGeology", name: "الجيولوجيا الأساسية" },
    { id: "Geochemistry", name: "الجيولوجيا الكيميائية" },
    { id: "Geophysics", name: "الفيزياء الجيولوجية" },
    { id: "Hydrogeology", name: "الهيدروجيولوجيا" },
    { id: "Petrology", name: "علم الصخور" },
    { id: "Structuralgeology", name: "الجيولوجيا التركيبية" },
    { id: "sedimentarygeology", name: "الجيولوجيا الرسوبية" },
  ],

  // -------------------------
  // INITIALIZATION
  // -------------------------
  init() {
    this.bindUI();
    console.log("GeoReady initialized");
  },

  bindUI() {
    document.getElementById("startBtn")?.addEventListener("click", () => {
      this.startQuiz("all");
    });

    document.getElementById("muteBtn")?.addEventListener("click", () => {
      this.toggleMute();
    });

    document.addEventListener("keydown", (e) => this.handleKeyboard(e));
  },

  handleKeyboard(e) {
    if (["1", "2", "3", "4"].includes(e.key)) {
      const idx = parseInt(e.key) - 1;
      const opts = document.querySelectorAll(".option");
      if (opts[idx]) opts[idx].click();
    }
  },

  // -------------------------
  // QUIZ FLOW
  // -------------------------
  async startQuiz(categoryId) {
    this.state.correctCount = 0;
    this.state.currentIndex = 0;
    this.state.questions = [];

    await this.prepareAudio();

    if (categoryId === "all") {
      await this.loadAllQuestions();
    } else {
      await this.loadQuestions(categoryId);
    }

    this.renderQuestion();
  },

  async loadQuestions(categoryId) {
    try {
      const response = await fetch(`${categoryId}.json`);
      if (!response.ok) throw new Error("تعذر تحميل الملف");

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("صيغة غير صحيحة");

      if (data.length !== 25) {
        alert(`ملف ${categoryId}.json غير مكتمل — يجب أن يحتوي على 25 سؤالًا`);
      }

      // ✅ فقط أول 25 سؤالًا
      this.state.questions = data.slice(0, 25);
      console.log(`${categoryId}: Loaded ${this.state.questions.length} questions`);
    } catch (err) {
      console.error(`فشل تحميل ${categoryId}.json:`, err);
    }
  },

  // ✅ نسخة مصححة — تضمن أن كل ملف (خصوصًا Petrology و Structuralgeology) يتم تحميله بشكل صحيح بـ25 سؤال فقط
  async loadAllQuestions() {
    const allQuestions = [];

    for (const category of this.categories) {
      try {
        const response = await fetch(`${category.id}.json`);
        if (response.ok) {
          const questions = await response.json();

          if (Array.isArray(questions)) {
            if (questions.length !== 25) {
              console.warn(`تحذير: ${category.id}.json لا يحتوي على 25 سؤال (فعليًا ${questions.length})`);
            }

            const normalized = questions
              .slice(0, 25)
              .map(q => this.normalizeQuestion(q));

            allQuestions.push(...normalized);
          } else {
            console.warn(`ملف ${category.id}.json غير صالح`);
          }
        } else {
          console.warn(`تعذر تحميل الملف: ${category.id}.json`);
        }
      } catch (err) {
        console.warn(`خطأ أثناء تحميل ${category.id}.json:`, err);
      }
    }

    if (allQuestions.length === 0) {
      throw new Error("لا توجد أسئلة متاحة من أي ملف");
    }

    // ✅ حفظ كل الأسئلة بشكل موحد
    this.state.questions = allQuestions;
    this.shuffle(this.state.questions);
    console.log(`تم تحميل ${this.state.questions.length} سؤالًا من جميع الفئات.`);
  },

  normalizeQuestion(q) {
    if (!q.id || !q.question || !q.options || !q.answer) {
      console.warn("سؤال غير صالح:", q);
    }
    return q;
  },

  // -------------------------
  // RENDERING
  // -------------------------
  renderQuestion() {
    const q = this.state.questions[this.state.currentIndex];
    if (!q) {
      this.endQuiz();
      return;
    }

    this.state.currentQuestion = q;

    const container = document.getElementById("quizContainer");
    if (!container) return;

    container.innerHTML = `
      <div class="question-header">
        السؤال ${this.state.currentIndex + 1} من ${this.state.questions.length}
      </div>
      <div class="question-text">${q.question}</div>
      <div class="options"></div>
      <div class="timer" id="timerBar"></div>
    `;

    const optsDiv = container.querySelector(".options");

    // ✅ نحافظ على المفتاح الأصلي
    const options = Object.entries(q.options).map(([key, text]) => ({ key, text }));
    this.shuffle(options);

    options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.dataset.key = opt.key;
      btn.innerHTML = `${opt.key}) ${opt.text}`;
      btn.addEventListener("click", (e) => this.selectOption(e));
      optsDiv.appendChild(btn);
    });

    this.startTimer();
  },

  // -------------------------
  // TIMER
  // -------------------------
  startTimer() {
    clearInterval(this.state.timer);
    this.state.timeLeft = 20;
    const bar = document.getElementById("timerBar");

    this.state.timer = setInterval(() => {
      this.state.timeLeft -= 1;
      if (bar) bar.style.width = `${(this.state.timeLeft / 20) * 100}%`;

      if (this.state.timeLeft <= 0) {
        clearInterval(this.state.timer);
        this.playSound("timeout");
        this.showAnswer(null);
      }
    }, 1000);
  },

  // -------------------------
  // OPTION SELECTION
  // -------------------------
  selectOption(e) {
    const selectedKey = e.target.dataset.key;
    clearInterval(this.state.timer);
    this.showAnswer(selectedKey);
  },

  showAnswer(selectedKey) {
    const correctKey = this.state.currentQuestion.answer;
    const options = document.querySelectorAll(".option");

    options.forEach(opt => {
      opt.classList.remove("correct", "wrong");
      const key = opt.dataset.key;
      if (key === correctKey) {
        opt.classList.add("correct");
        opt.setAttribute("aria-label", "صحيح");
      } else if (selectedKey && key === selectedKey && key !== correctKey) {
        opt.classList.add("wrong");
      }
      opt.disabled = true;
    });

    if (selectedKey === correctKey) {
      this.state.correctCount++;
      this.playSound("correct");
    } else if (selectedKey !== null) {
      this.playSound("wrong");
    }

    setTimeout(() => this.nextQuestion(), 2000);
  },

  nextQuestion() {
    this.state.currentIndex++;
    if (this.state.currentIndex < this.state.questions.length) {
      this.renderQuestion();
    } else {
      this.endQuiz();
    }
  },

  endQuiz() {
    clearInterval(this.state.timer);
    const score = this.state.correctCount;
    const total = this.state.questions.length;
    const percent = ((score / total) * 100).toFixed(1);

    const container = document.getElementById("quizContainer");
    if (container) {
      container.innerHTML = `
        <h2>انتهى الاختبار 🎉</h2>
        <p>النتيجة: ${score} من ${total} (${percent}%)</p>
        <button id="restartBtn">إعادة</button>
      `;
      document.getElementById("restartBtn").addEventListener("click", () => {
        this.startQuiz("all");
      });
    }

    this.saveResult(percent);
  },

  // -------------------------
  // SOUND HANDLING
  // -------------------------
  async prepareAudio() {
    if (this.state.initializedAudio) return;
    this.state.initializedAudio = true;

    try {
      this.state.sounds.correct = new Audio("sounds/correct.mp3");
      this.state.sounds.wrong = new Audio("sounds/wrong.mp3");
      this.state.sounds.timeout = new Audio("sounds/timeout.mp3");
    } catch {
      console.warn("لم يتم العثور على ملفات الصوت، سيتم استخدام Web Audio API كبديل.");
    }
  },

  playSound(type) {
    if (this.state.isMuted) return;
    const snd = this.state.sounds[type];
    if (snd) snd.play().catch(() => {});

    // Web Audio API fallback
    if (!snd) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";

      if (type === "correct") osc.frequency.value = 800;
      else if (type === "wrong") osc.frequency.value = 200;
      else osc.frequency.value = 400;

      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    }
  },

  toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    document.getElementById("muteBtn").innerText = this.state.isMuted ? "🔇" : "🔊";
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  },

  saveResult(percent) {
    const prev = JSON.parse(localStorage.getItem("GeoReady_scores") || "[]");
    const newScore = {
      date: new Date().toLocaleString(),
      totalQuestions: this.state.questions.length,
      correctCount: this.state.correctCount,
      percent,
    };
    prev.unshift(newScore);
    localStorage.setItem("GeoReady_scores", JSON.stringify(prev.slice(0, 5)));
  },
};

document.addEventListener("DOMContentLoaded", () => app.init());