// ====== المتغيرات الرئيسية والثوابت ======
let allSectionsData = []; // يخزن جميع الأقسام والأسئلة من JSON
let currentSectionQuestions = []; // أسئلة القسم الحالي
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
const TIME_LIMIT_PER_QUESTION = 20; // 20 ثانية لكل سؤال
let timeLeft = TIME_LIMIT_PER_QUESTION;
let quizStartTime = 0; // لحساب الوقت المستغرق

// ====== عناصر الـ DOM ======
const DOM = {
    screens: {
        select: document.getElementById('level-select-screen'),
        quiz: document.getElementById('quiz-screen'),
        results: document.getElementById('final-results-screen')
    },
    elements: {
        levelContainer: document.getElementById('level-buttons-container'),
        loadingMsg: document.getElementById('loading-msg'),
        sectionTitle: document.getElementById('current-section-title'),
        quizContent: document.getElementById('quiz-content'),
        timer: document.getElementById('timer'),
        nextButton: document.getElementById('next-question-btn'),
        finalScore: document.getElementById('final-score-display'),
        timeSpent: document.getElementById('time-spent-display'),
        progressBar: document.getElementById('progress-bar'),
        feedbackMsg: document.getElementById('feedback-message')
    },
    sounds: {
        // الروابط هنا محلية. تأكد من توفير الملفات أو ترك الـ src فارغاً في HTML
        correct: document.getElementById('sound-correct'),
        wrong: document.getElementById('sound-wrong'),
        click: document.getElementById('sound-click'),
        timeup: document.getElementById('sound-timeup'),
        finish: document.getElementById('sound-finish')
    }
};

// ====== دوال المساعدة والخدمة ======

// تشغيل الصوت (تم تعديلها للتعامل مع أخطاء التشغيل التلقائي)
function playSound(soundElement) {
    if (soundElement && soundElement.src) {
        soundElement.currentTime = 0;
        soundElement.play().catch(e => {
            // console.warn("Sound blocked or error:", e);
        });
    }
}

// تنسيق الوقت
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// تبديل الشاشات
function switchScreen(activeScreen) {
    Object.values(DOM.screens).forEach(screen => {
        screen.classList.remove('active');
    });
    activeScreen.classList.add('active');
}

// تحديث شريط التقدم
function updateProgress() {
    const progress = currentQuestionIndex / currentSectionQuestions.length;
    DOM.elements.progressBar.style.width = `${progress * 100}%`;
}

// إظهار رسالة فورية للمستخدم
function showFeedback(message, type) {
    DOM.elements.feedbackMsg.textContent = message;
    DOM.elements.feedbackMsg.style.display = 'block';
    DOM.elements.feedbackMsg.style.color = type === 'success' ? 'var(--success)' : 'var(--danger)';
}

// إخفاء الرسالة الفورية
function hideFeedback() {
    DOM.elements.feedbackMsg.style.display = 'none';
}


// ====== دوال المؤقت والتحكم في الاختبار ======

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_LIMIT_PER_QUESTION; // إعادة تعيين الوقت
    DOM.elements.timer.textContent = formatTime(timeLeft);
    DOM.elements.timer.classList.remove('danger');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        DOM.elements.timer.textContent = formatTime(timeLeft);

        if (timeLeft <= 5) {
            DOM.elements.timer.classList.add('danger'); 
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            checkAnswer(-1); // إشارة لانتهاء الوقت
        }
    }, 1000);
}

// دالة تحميل الأقسام
async function loadSections() {
    DOM.elements.loadingMsg.style.display = 'block';
    DOM.elements.levelContainer.innerHTML = '';
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to fetch JSON');
        allSectionsData = await response.json();
        renderLevelSelection();
        DOM.elements.loadingMsg.style.display = 'none';
    } catch (error) {
        console.error('JSON Load Error:', error);
        DOM.elements.loadingMsg.textContent = '❌ تعذر تحميل ملف الأسئلة. تأكد من وجود questions.json.';
        DOM.elements.loadingMsg.style.color = 'var(--danger)';
    }
}

// دالة عرض شاشة اختيار المستويات
function renderLevelSelection() {
    switchScreen(DOM.screens.select);
    DOM.elements.levelContainer.innerHTML = '';
    
    allSectionsData.forEach((section, index) => {
        const card = document.createElement('div');
        card.className = 'level-card';
        card.innerHTML = `
            <h3>${section.section}</h3>
            <p>عدد الأسئلة: ${section.questions.length}</p>
        `;
        card.onclick = () => startQuiz(index);
        DOM.elements.levelContainer.appendChild(card);
    });
}

// دالة بدء الاختبار
function startQuiz(sectionIndex) {
    playSound(DOM.sounds.click);
    const selectedSection = allSectionsData[sectionIndex];
    currentSectionQuestions = selectedSection.questions;
    currentQuestionIndex = 0;
    score = 0;
    quizStartTime = Date.now(); // بدء حساب الوقت
    
    switchScreen(DOM.screens.quiz);
    DOM.elements.sectionTitle.textContent = selectedSection.section;
    DOM.elements.nextButton.onclick = () => checkAnswer(parseInt(DOM.elements.nextButton.getAttribute('data-selected-index')));
    DOM.elements.nextButton.disabled = true;
    
    displayQuestion();
}

// دالة عرض السؤال الحالي
function displayQuestion() {
    if (currentQuestionIndex >= currentSectionQuestions.length) {
        return showResults();
    }
    
    hideFeedback();
    updateProgress();
    
    const q = currentSectionQuestions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;
    
    startTimer();
    
    let questionHTML = `
        <div class="question-title">
            <p class="question-text">سؤال ${questionNumber}/${currentSectionQuestions.length}: ${q.question}</p>
        </div>
        <div class="options-container">
    `;

    q.options.forEach((option, optionIndex) => {
        const inputId = `opt-${questionNumber}${optionIndex}`;
        questionHTML += `
            <label for="${inputId}" class="option-label">
                <input type="radio" id="${inputId}" name="current-q" value="${optionIndex}" onclick="selectAnswer(${optionIndex})">
                <span class="option-text">${option}</span>
            </label>
        `;
    });

    questionHTML += `
            </div>
    `;
    DOM.elements.quizContent.innerHTML = questionHTML;
    DOM.elements.nextButton.textContent = "تأكيد الإجابة 🔒";
    DOM.elements.nextButton.disabled = true;
    DOM.elements.nextButton.removeAttribute('data-selected-index');
}

// دالة اختيار الإجابة
window.selectAnswer = function(selectedIndex) {
    playSound(DOM.sounds.click);
    
    DOM.elements.nextButton.disabled = false;
    DOM.elements.nextButton.textContent = "تأكيد الإجابة 🚀";
    DOM.elements.nextButton.setAttribute('data-selected-index', selectedIndex);
}

// دالة فحص الإجابة
function checkAnswer(selectedIndex) {
    if (selectedIndex === -1 && timeLeft > 0) return; // منع تنفيذ الدالة بدون اختيار إلا عند انتهاء الوقت

    clearInterval(timerInterval);
    
    const q = currentSectionQuestions[currentQuestionIndex];
    const correctIndex = q.correct;
    const card = DOM.elements.quizContent;
    const optionsLabels = card.querySelectorAll('.option-label');
    
    // تعطيل جميع الخيارات
    card.querySelectorAll('input[type="radio"]').forEach(input => input.disabled = true);
    DOM.elements.nextButton.disabled = true;
    
    let isCorrect = (selectedIndex === correctIndex);

    // عرض التصحيح
    optionsLabels.forEach((label, index) => {
        if (index === correctIndex) {
            label.classList.add('correct-answer');
        } else if (index === selectedIndex && index !== correctIndex) {
            label.classList.add('wrong-answer');
        }
    });

    if (isCorrect) {
        score++;
        playSound(DOM.sounds.correct);
        showFeedback("إجابة صحيحة! أحسنت الاختيار. ✅", 'success');
    } else if (selectedIndex === -1) {
        playSound(DOM.sounds.timeup);
        showFeedback(`انتهى الوقت! الإجابة الصحيحة كانت: ${q.options[correctIndex]} ⌛`, 'danger');
    } else {
        playSound(DOM.sounds.wrong);
        showFeedback(`إجابة خاطئة. الصحيح هو: ${q.options[correctIndex]} ❌`, 'danger');
    }
    
    // إعداد زر المتابعة
    DOM.elements.nextButton.textContent = "السؤال التالي >>";
    DOM.elements.nextButton.disabled = false;
    DOM.elements.nextButton.onclick = nextQuestion;
}

// دالة الانتقال للسؤال التالي
function nextQuestion() {
    currentQuestionIndex++;
    DOM.elements.nextButton.disabled = true;
    // إعادة تعيين دالة النقر للتحقق من الإجابة التالية
    DOM.elements.nextButton.onclick = () => checkAnswer(parseInt(DOM.elements.nextButton.getAttribute('data-selected-index'))); 
    displayQuestion();
}

// دالة عرض النتائج النهائية
function showResults() {
    clearInterval(timerInterval);
    playSound(DOM.sounds.finish);
    
    const timeEnd = Date.now();
    const totalTimeSeconds = Math.floor((timeEnd - quizStartTime) / 1000);
    
    switchScreen(DOM.screens.results);

    DOM.elements.finalScore.textContent = `${score} / ${currentSectionQuestions.length}`;
    DOM.elements.timeSpent.textContent = formatTime(totalTimeSeconds);
    
    const percentage = (score / currentSectionQuestions.length) * 100;
    DOM.elements.finalScore.style.color = percentage >= 80 ? 'var(--success)' : percentage >= 50 ? 'var(--secondary-color)' : 'var(--danger)';
}

// دالة إعادة تعيين الاختبار
window.resetQuiz = function() {
    clearInterval(timerInterval);
    score = 0;
    currentQuestionIndex = 0;
    timeLeft = TIME_LIMIT_PER_QUESTION;
    currentSectionQuestions = [];
    hideFeedback();
    updateProgress(); // إعادة شريط التقدم للصفر
    renderLevelSelection();
}

// تشغيل دالة تحميل الأقسام عند تحميل الصفحة
window.onload = loadSections;
