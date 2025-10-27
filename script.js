// script.js — Geo-Master (مرن، متوافق مع Question.json الذي لديك)
// يعتمد على بنية JSON: { "الجيولوجيا_الأساسية": [ {id, question, options:[], answer}, ... ], ... }

'use strict';

/* -------------------- إعدادات عامة -------------------- */
let geologicalData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval = null;

const TIME_LIMIT = 20;
const POINTS_CORRECT = 5;
const POINTS_WRONG = -3;
let currentLanguage = 'ar';

// ترجمة الواجهة
const translations = {
    'ar': {
        'start_quiz': 'ابدأ الاختبار',
        'choose_domain': 'اختر مجال الاختبار:',
        'question': 'السؤال',
        'submit': 'تأكيد الإجابة',
        'next': 'السؤال التالي',
        'review_errors': 'مراجعة الأخطاء المفاهيمية:',
        'your_answer': 'إجابتك:',
        'correct_answer': 'الصحيح:',
        'great_job': '🌟 أداء استثنائي! معرفة جيولوجية قوية.',
        'good_job': '✨ جيد جداً! أساس متين، لكن هناك مجال للمراجعة.',
        'needs_review': '⚠️ تحتاج إلى مراجعة مكثفة لهذه المفاهيم.',
        'new_quiz': 'إعادة تشغيل النظام',
        'timer_text': 'ث'
    },
    'en': {
        'start_quiz': 'Start Quiz',
        'choose_domain': 'Choose Quiz Domain:',
        'question': 'Question',
        'submit': 'Submit Answer',
        'next': 'Next Question',
        'review_errors': 'Review Conceptual Errors:',
        'your_answer': 'Your Answer:',
        'correct_answer': 'Correct:',
        'great_job': '🌟 Exceptional performance! Strong geological knowledge.',
        'good_job': '✨ Very good! Solid foundation, but room for review.',
        'needs_review': '⚠️ Requires intensive review of these concepts.',
        'new_quiz': 'Restart System',
        'timer_text': 's'
    },
    'fr': {
        'start_quiz': 'Commencer le Quiz',
        'choose_domain': 'Choisissez un domaine de Quiz:',
        'question': 'Question',
        'submit': 'Soumettre la Réponse',
        'next': 'Question Suivante',
        'review_errors': 'Revue des Erreurs Conceptuelles:',
        'your_answer': 'Votre Réponse:',
        'correct_answer': 'La Bonne:',
        'great_job': '🌟 Performance exceptionnelle! Solides connaissances géologiques.',
        'good_job': '✨ Très bien! Base solide, mais il y a place à l\'amélioration.',
        'needs_review': '⚠️ Nécessite une révision intensive de ces concepts.',
        'new_quiz': 'Redémarrer le Système',
        'timer_text': 's'
    }
};

/* -------------------- عناصر DOM -------------------- */
const loadingMessage = document.getElementById('loading-message');
const startBtn = document.getElementById('start-quiz-btn');
const topicsContainer = document.getElementById('topics-list');
const sidebarTopicsList = document.getElementById('sidebar-topics-list');
const topicsListContainer = document.getElementById('topics-list-container');

const openSidebarBtn = document.getElementById('open-sidebar-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const overlay = document.getElementById('overlay');
const sidebar = document.getElementById('sidebar');

const topicSelectionScreen = document.getElementById('topic-selection');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

const quizTitle = document.getElementById('quiz-title');
const questionCounter = document.getElementById('question-counter');
const questionContainer = document.getElementById('question-container');

const timerDisplay = document.getElementById('timer-display');
const progressBarFill = document.getElementById('progress-bar-fill');

const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');

const finalScoreEl = document.getElementById('final-score');
const totalQuestionsCountEl = document.getElementById('total-questions-count');
const gradeMessageEl = document.getElementById('grade-message');
const reviewArea = document.getElementById('review-area');

const miniScore = document.getElementById('mini-score');
const ringPath = document.getElementById('ring');

const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');

/* -------------------- تحميل JSON -------------------- */
async function loadGeologyData() {
    try {
        loadingMessage.textContent = '... جاري تحميل بيانات النظام';
        startBtn.disabled = true;

        const res = await fetch('./Question.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('فشل تحميل Question.json — تحقق من المسار.');

        geologicalData = await res.json();
        initializeTopicSelection(geologicalData);

        loadingMessage.textContent = 'جاهز ✅ اختر المجال الذي تريد اختباره';
        startBtn.disabled = false;
    } catch (err) {
        console.error(err);
        loadingMessage.textContent = '[خطأ] لا يمكن تحميل بيانات الأسئلة. تأكد من وجود Question.json';
        startBtn.disabled = true;
    }
}

/* -------------------- تهيئة الواجهة للمجالات -------------------- */
function initializeTopicSelection(data) {
    topicsContainer.innerHTML = '';
    sidebarTopicsList.innerHTML = '';

    Object.keys(data).forEach(key => {
        const display = key.replace(/_/g, ' ');
        // بطاقة الشبكة
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.textContent = display;
        card.tabIndex = 0;
        card.addEventListener('click', () => startQuiz(display, data[key], key));
        card.addEventListener('keypress', (e) => { if (e.key === 'Enter') startQuiz(display, data[key], key); });
        topicsContainer.appendChild(card);
        // رابط الشريط الجانبي
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = display;
        a.addEventListener('click', (ev) => { ev.preventDefault(); startQuiz(display, data[key], key); closeSidebar(); });
        sidebarTopicsList.appendChild(a);
    });

    topicsListContainer.classList.remove('hidden');
    localizeUI();
}

/* -------------------- اللغة / الترجمة -------------------- */
function localizeUI() {
    const t = translations[currentLanguage] || translations.ar;
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.dataset?.lang === currentLanguage);
    });
    // if on selection screen
    document.getElementById('start-quiz-btn').innerHTML = `${t.start_quiz} <i class="fas fa-rocket"></i>`;
    document.getElementById('topics-title') && (document.getElementById('topics-title').textContent = t.choose_domain);
    // if quiz visible, update live texts
    if (!quizScreen.classList.contains('hidden')) {
        questionCounter.textContent = `${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        timerDisplay.textContent = `${TIME_LIMIT}${t.timer_text}`;
        document.querySelector('.review-log h3') && (document.querySelector('.review-log h3').textContent = t.review_errors);
    }
    // update rtl/ltr
    if (currentLanguage === 'ar') {
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
    } else {
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = 'ltr';
    }
}

/* يستطيع المستخدم تغيير اللغة */
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLanguage = btn.dataset.lang || 'ar';
        localizeUI();
    });
});

/* -------------------- فتح / إغلاق الشريط الجانبي -------------------- */
openSidebarBtn.addEventListener('click', openSidebar);
closeSidebarBtn.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

function openSidebar() {
    sidebar.classList.add('open');
    sidebar.setAttribute('aria-hidden', 'false');
    overlay.hidden = false;
    overlay.style.display = 'block';
}
function closeSidebar() {
    sidebar.classList.remove('open');
    sidebar.setAttribute('aria-hidden', 'true');
    overlay.hidden = true;
    overlay.style.display = 'none';
}

/* -------------------- بدء الاختبار -------------------- */
startBtn.addEventListener('click', () => {
    // انشر قائمة المجالات اذا لم تكن ظاهرة
    topicsListContainer.classList.remove('hidden');
    startBtn.classList.add('hidden');
});

/**
 * startQuiz(displayName, questionsArray, key)
 * - displayName: string لعرض العنوان
 * - questionsArray: المصفوفة الخاصة بالمجال
 * - key: اسم المفتاح الأصلي من JSON (مفيد للتمييز إن رغبت)
 */
function startQuiz(displayName, questionsArray, keyName) {
    clearInterval(timerInterval);
    currentQuestions = Array.isArray(questionsArray) ? questionsArray.slice() : [];
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};

    // shuffle الأسئلة (خفيف)
    for (let i = currentQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [currentQuestions[i], currentQuestions[j]] = [currentQuestions[j], currentQuestions[i]];
    }

    // واجهة
    topicSelectionScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    resultsScreen.classList.add('hidden');

    quizTitle.textContent = `اختبار: ${displayName}`;
    updateMiniScore();
    displayQuestion();
    localizeUI();
}

/* -------------------- المؤقت وواجهة التقدم -------------------- */
function startTimer() {
    clearInterval(timerInterval);
    let timeRemaining = TIME_LIMIT;
    const t = translations[currentLanguage];

    progressBarFill.style.width = '100%';
    timerDisplay.textContent = `${timeRemaining}${t.timer_text}`;
    setRing(1);

    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining < 0) timeRemaining = 0;
        const pct = Math.max(0, (timeRemaining / TIME_LIMIT) * 100);
        progressBarFill.style.width = pct + '%';
        timerDisplay.textContent = `${timeRemaining}${t.timer_text}`;
        // ring update
        setRing(timeRemaining / TIME_LIMIT);

        if (timeRemaining <= 5) {
            timerDisplay.style.color = 'var(--danger)';
        } else {
            timerDisplay.style.color = '';
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

function setRing(pct) {
    if (!ringPath) return;
    const radius = 15.91549430918954;
    const length = 2 * Math.PI * radius;
    const dash = length * Math.max(0, Math.min(1, pct));
    ringPath.setAttribute('d', `M18 2a16 16 0 1 0 0 32a16 16 0 1 0 0-32`);
    ringPath.style.strokeDasharray = `${dash} ${length}`;
}

/* -------------------- عرض سؤال -------------------- */
function displayQuestion() {
    clearInterval(timerInterval);
    const t = translations[currentLanguage];

    if (!currentQuestions || currentQuestionIndex >= currentQuestions.length) {
        return showResults();
    }

    const q = currentQuestions[currentQuestionIndex];
    questionCounter.textContent = `${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    // بناء HTML للسؤال (آمن)
    let html = `<div class="question-text">${escapeHtml(q.question)}</div>`;
    html += `<div class="options-container">`;
    q.options.forEach(opt => {
        html += `
          <label class="option-label">
            <input type="radio" name="option" value="${escapeHtml(opt)}">
            <span class="option-text">${escapeHtml(opt)}</span>
          </label>
        `;
    });
    html += `</div>`;
    questionContainer.innerHTML = html;

    // أزرار
    submitBtn.classList.remove('hidden');
    submitBtn.disabled = true;
    nextBtn.classList.add('hidden');

    // تفعيل زر الإرسال عند اختيار خيار
    document.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => {
            submitBtn.disabled = false;
        });
    });

    // بدء المؤقت
    startTimer();
}

/* -------------------- عند انتهاء الوقت (Timeout) -------------------- */
function handleTimeout() {
    const t = translations[currentLanguage];
    const currentQ = currentQuestions[currentQuestionIndex];

    // احتساب عقوبة
    score += POINTS_WRONG;
    if (score < 0) score = 0;

    // سجل إجابة المستخدم كخاطئة (Timeout)
    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: `(Timeout)`,
        correctAnswer: currentQ.answer,
        isCorrect: false
    };

    // إظهار الإجابة الصحيحة
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true;
        if (input.value === currentQ.answer) label.classList.add('correct');
    });

    submitBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');

    updateMiniScore();

    // تقدم للسؤال التالي بعد تأخير قصير
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 900);
}

/* -------------------- إرسال إجابة المستخدم -------------------- */
submitBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    const selected = document.querySelector('input[name="option"]:checked');
    if (!selected) return;

    const currentQ = currentQuestions[currentQuestionIndex];
    const userAnswer = selected.value;
    const isCorrect = (userAnswer === currentQ.answer);

    if (isCorrect) score += POINTS_CORRECT;
    else score += POINTS_WRONG;

    if (score < 0) score = 0;

    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: userAnswer,
        correctAnswer: currentQ.answer,
        isCorrect: isCorrect
    };

    // تعيين ستايلات صواب/خطأ
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true;
        if (input.value === currentQ.answer) label.classList.add('correct');
        else if (input.checked && !isCorrect) label.classList.add('incorrect');
    });

    submitBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');

    updateMiniScore();
});

/* التالي */
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
});

/* -------------------- إظهار النتائج -------------------- */
function showResults() {
    clearInterval(timerInterval);
    quizScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    finalScoreEl.textContent = score;
    totalQuestionsCountEl.textContent = currentQuestions.length;

    // حساب نسبة بناء على أقصى نقاط ممكنة
    const maxPoints = currentQuestions.length * POINTS_CORRECT;
    const pct = maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0;

    if (pct >= 90) {
        gradeMessageEl.textContent = translations[currentLanguage].great_job;
        gradeMessageEl.style.color = 'var(--accent-b)';
    } else if (pct >= 70) {
        gradeMessageEl.textContent = translations[currentLanguage].good_job;
        gradeMessageEl.style.color = 'var(--accent-a)';
    } else {
        gradeMessageEl.textContent = translations[currentLanguage].needs_review;
        gradeMessageEl.style.color = 'var(--danger)';
    }

    // بناء مراجعة الأخطاء
    reviewArea.innerHTML = `<h3>${translations[currentLanguage].review_errors}</h3>`;
    let errorsFound = false;
    Object.values(userAnswers).forEach(ans => {
        if (!ans.isCorrect) {
            errorsFound = true;
            const item = document.createElement('div');
            item.className = 'review-item';
            item.innerHTML = `
              <div class="error-q">${escapeHtml(ans.question)}</div>
              <div class="error-a">${translations[currentLanguage].your_answer} <span class="wrong">${escapeHtml(ans.userAnswer)}</span></div>
              <div class="error-a">${translations[currentLanguage].correct_answer} <span class="right">${escapeHtml(ans.correctAnswer)}</span></div>
            `;
            reviewArea.appendChild(item);
        }
    });

    if (!errorsFound) {
        const ok = document.createElement('div');
        ok.className = 'review-item';
        ok.innerHTML = `<div class="all-correct">🎉 ممتاز! لا توجد أخطاء لمراجعتها.</div>`;
        reviewArea.appendChild(ok);
    }

    // حفظ موجز النتائج محلياً (اختياري)
    try {
        localStorage.setItem('geo_last_result', JSON.stringify({ score, date: new Date().toISOString(), total: currentQuestions.length }));
    } catch (e) { /* ignore */ }

    updateMiniScore();
}

/* -------------------- أزرار إعادة التشغيل والعودة للصفحة الرئيسية -------------------- */
restartBtn.addEventListener('click', () => {
    // إعادة نفس المجموعة
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
    resultsScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    displayQuestion();
});
homeBtn.addEventListener('click', () => {
    // ارجع للاختيار
    resultsScreen.classList.add('hidden');
    quizScreen.classList.add('hidden');
    topicSelectionScreen.classList.remove('hidden');
    startBtn.classList.remove('hidden');
    topicsListContainer.classList.remove('hidden');
});

/* -------------------- تحديث عرض النقاط المصغّر -------------------- */
function updateMiniScore() {
    miniScore.textContent = String(score);
}

/* -------------------- أدوات مساعدة -------------------- */
function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/* -------------------- تهيئة التشغيل -------------------- */
loadGeologyData();