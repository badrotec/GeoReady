// ====== المتغيرات الرئيسية ======
let allSectionsData = []; // يخزن جميع الأقسام والأسئلة من JSON
let currentSectionQuestions = []; // أسئلة القسم الحالي فقط
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
const TIME_LIMIT_PER_QUESTION = 20; // 20 ثانية لكل سؤال
let timeLeft = TIME_LIMIT_PER_QUESTION;

// ====== عناصر الـ DOM ======
const screens = {
    select: document.getElementById('section-select-screen'),
    quiz: document.getElementById('quiz-screen'),
    results: document.getElementById('final-results-screen')
};

const elements = {
    sectionButtons: document.getElementById('section-select-screen'),
    sectionTitle: document.getElementById('current-section-title'),
    quizContent: document.getElementById('quiz-content'),
    timer: document.getElementById('timer'),
    nextButton: document.getElementById('next-question-btn'),
    finalScore: document.getElementById('final-score-display'),
    timeSpent: document.getElementById('time-spent-display'),
    soundCorrect: document.getElementById('sound-correct'),
    soundWrong: document
        .getElementById('sound-wrong'),
    soundClick: document.getElementById('sound-click'),
    soundTimeup: document.getElementById('sound-timeup')
};

// ====== دوال الصوت ======
function playSound(soundElement) {
    if (soundElement) {
        soundElement.currentTime = 0; // إعادة التشغيل من البداية
        soundElement.play().catch(e => console.log("Sound playback blocked:", e)); // التعامل مع حظر التشغيل التلقائي
    }
}

// ====== دوال المؤقت (Timer) ======
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    clearInterval(timerInterval);
    elements.timer.textContent = formatTime(timeLeft);
    elements.timer.style.color = '#ecf0f1';
    
    timerInterval = setInterval(() => {
        timeLeft--;
        elements.timer.textContent = formatTime(timeLeft);

        if (timeLeft <= 5) {
            elements.timer.style.color = 'var(--danger-color)'; // لون أحمر عند قرب الانتهاء
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playSound(elements.soundTimeup);
            // معالجة السؤال كإجابة خاطئة
            checkAnswer(-1); // إرسال -1 للإشارة إلى انتهاء الوقت
        }
    }, 1000);
}

// ====== دوال إدارة الواجهة ======

// دالة تحميل الأسئلة
async function loadSections() {
    try {
        const response = await fetch('questions.json');
        allSectionsData = await response.json();
        renderSectionSelection();
    } catch (error) {
        console.error('خطأ في تحميل ملف الأسئلة:', error);
        elements.sectionButtons.innerHTML = '<p style="color:var(--danger-color); text-align:center;">تعذر تحميل الأقسام. تأكد من وجود ملف questions.json</p>';
    }
}

// دالة عرض شاشة اختيار الأقسام
function renderSectionSelection() {
    screens.select.style.display = 'block';
    screens.quiz.style.display = 'none';
    screens.results.style.display = 'none';
    
    elements.sectionButtons.innerHTML = '<h2>اختر القسم لتبدأ التحدي 🔥</h2>';
    
    allSectionsData.forEach((section, index) => {
        const button = document.createElement('button');
        button.className = 'section-button';
        button.textContent = `${section.section} (${section.questions.length} أسئلة)`;
        button.onclick = () => startQuiz(index);
        elements.sectionButtons.appendChild(button);
    });
}

// دالة بدء الاختبار
function startQuiz(sectionIndex) {
    playSound(elements.soundClick);
    const selectedSection = allSectionsData[sectionIndex];
    currentSectionQuestions = selectedSection.questions;
    currentQuestionIndex = 0;
    score = 0;
    
    // إظهار شاشة الاختبار وإخفاء الباقي
    screens.select.style.display = 'none';
    screens.quiz.style.display = 'block';
    screens.results.style.display = 'none';
    
    elements.sectionTitle.textContent = selectedSection.section;
    elements.nextButton.onclick = nextQuestion;
    elements.nextButton.disabled = true;
    
    displayQuestion();
}

// دالة عرض السؤال الحالي
function displayQuestion() {
    if (currentQuestionIndex >= currentSectionQuestions.length) {
        return showResults();
    }

    const q = currentSectionQuestions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;
    
    // إعادة تعيين المؤقت
    timeLeft = TIME_LIMIT_PER_QUESTION;
    startTimer();

    let questionHTML = `
        <div class="question-card" id="q-card">
            <p class="question-text">سؤال ${questionNumber}/${currentSectionQuestions.length}: ${q.question}</p>
            <div class="options-container">
    `;

    q.options.forEach((option, optionIndex) => {
        const inputId = `opt-${questionIndex}`;
        questionHTML += `
            <label for="${inputId}${optionIndex}" class="option-label" data-index="${optionIndex}">
                <input type="radio" id="${inputId}${optionIndex}" name="current-q" value="${optionIndex}" onclick="selectAnswer(${optionIndex})">
                ${option}
            </label>
        `;
    });

    questionHTML += `
            </div>
        </div>
    `;
    elements.quizContent.innerHTML = questionHTML;
    elements.nextButton.textContent = "تأكيد الإجابة والمتابعة ➡️";
    elements.nextButton.disabled = true;
}

// دالة اختيار الإجابة
window.selectAnswer = function(selectedIndex) {
    playSound(elements.soundClick);
    
    // تفعيل زر المتابعة
    elements.nextButton.disabled = false;
    elements.nextButton.setAttribute('data-selected-index', selectedIndex);
}

// دالة فحص الإجابة
function checkAnswer() {
    // تعطيل المؤقت فوراً
    clearInterval(timerInterval);
    
    const selectedIndex = parseInt(elements.nextButton.getAttribute('data-selected-index'));
    const q = currentSectionQuestions[currentQuestionIndex];
    const correctIndex = q.correct;
    const card = document.getElementById('q-card');
    const optionsLabels = card.querySelectorAll('.option-label');
    
    // تعطيل جميع الخيارات بعد الإجابة
    card.querySelectorAll('input[type="radio"]').forEach(input => input.disabled = true);
    
    let isCorrect = false;

    if (selectedIndex === correctIndex) {
        // حالة الإجابة الصحيحة
        score++;
        isCorrect = true;
        playSound(elements.soundCorrect);
    } else {
        // حالة الإجابة الخاطئة أو انتهاء الوقت (-1)
        playSound(elements.soundWrong);
    }
    
    // عرض التصحيح على الواجهة
    optionsLabels.forEach((label, index) => {
        if (index === correctIndex) {
            label.classList.add('correct-answer');
        } else if (index === selectedIndex && index !== correctIndex) {
            label.classList.add('wrong-answer');
        }
    });
    
    // تغيير زر المتابعة لـ "السؤال التالي"
    elements.nextButton.textContent = "السؤال التالي >>";
    elements.nextButton.onclick = nextQuestion;
    elements.nextButton.disabled = false;
}

// دالة الانتقال للسؤال التالي
function nextQuestion() {
    currentQuestionIndex++;
    elements.nextButton.disabled = true;
    displayQuestion();
}

// دالة عرض النتائج النهائية
function showResults() {
    clearInterval(timerInterval);
    screens.quiz.style.display = 'none';
    screens.results.style.display = 'block';

    const timeSpentSeconds = (currentSectionQuestions.length * TIME_LIMIT_PER_QUESTION) - timeLeft;
    const timeSpent = formatTime(timeSpentSeconds);

    elements.finalScore.textContent = `${score} / ${currentSectionQuestions.length}`;
    elements.timeSpent.textContent = timeSpent;
}

// دالة إعادة تعيين الاختبار
window.resetQuiz = function() {
    clearInterval(timerInterval);
    score = 0;
    currentQuestionIndex = 0;
    currentSectionQuestions = [];
    renderSectionSelection();
}

// ربط زر المتابعة بدالة فحص الإجابة أولاً
elements.nextButton.onclick = checkAnswer;

// تشغيل دالة تحميل الأقسام عند تحميل الصفحة
window.onload = loadSections;
