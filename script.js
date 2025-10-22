// ====== المتغيرات الرئيسية والثوابت ======
let allSectionsData = []; 
let currentSectionQuestions = []; 
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
const TIME_LIMIT_PER_QUESTION = 20;
let timeLeft = TIME_LIMIT_PER_QUESTION;
let quizStartTime = 0; 
let totalQuestionsCount = 0; // لحساب الإجمالي الكلي للأسئلة

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
        startBtn: document.getElementById('start-btn'), 
        selectTitle: document.getElementById('select-level-title'), 
        sectionTitle: document.getElementById('current-section-title'),
        quizContent: document.getElementById('quiz-content'),
        timer: document.getElementById('timer'),
        nextButton: document.getElementById('next-question-btn'),
        finalScore: document.getElementById('final-score-display'),
        timeSpent: document.getElementById('time-spent-display'),
        progressBar: document.getElementById('progress-bar'),
        feedbackMsg: document.getElementById('feedback-message'),
        achievementMsg: document.getElementById('achievement-msg')
    },
    sounds: {
        correct: document.getElementById('sound-correct'),
        wrong: document.getElementById('sound-wrong'),
        click: document.getElementById('sound-click'),
        timeup: document.getElementById('sound-timeup'),
        finish: document.getElementById('sound-finish')
    }
};

// ====== دوال المساعدة والخدمة ======

function playSound(soundElement) {
    if (soundElement && soundElement.src) {
        soundElement.currentTime = 0;
        soundElement.play().catch(e => {
            // console.warn("Sound blocked:", e);
        });
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function switchScreen(activeScreen) {
    Object.values(DOM.screens).forEach(screen => {
        screen.classList.remove('active');
    });
    activeScreen.classList.add('active');
}

function updateProgress() {
    const progress = currentQuestionIndex / currentSectionQuestions.length;
    DOM.elements.progressBar.style.width = `${progress * 100}%`;
}

function showFeedback(message, type) {
    DOM.elements.feedbackMsg.textContent = message;
    DOM.elements.feedbackMsg.style.display = 'block';
    DOM.elements.feedbackMsg.style.color = type === 'success' ? 'var(--success)' : 'var(--danger)';
    DOM.elements.feedbackMsg.style.borderColor = type === 'success' ? 'var(--success)' : 'var(--danger)';
}

function hideFeedback() {
    DOM.elements.feedbackMsg.style.display = 'none';
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_LIMIT_PER_QUESTION; 
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
            checkAnswer(-1); 
        }
    }, 1000);
}

// دالة تحميل الأقسام
async function loadSections() {
    // ربط زر البدء بعرض القائمة بعد تحميل البيانات
    DOM.elements.startBtn.onclick = showLevelsGrid; 
    
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to fetch JSON');
        allSectionsData = await response.json();

        // حساب العدد الإجمالي للأسئلة
        totalQuestionsCount = allSectionsData.reduce((sum, section) => sum + section.questions.length, 0);

        // إخفاء رسالة التحميل (التي تظهر بعد النقر على زر البدء)
        DOM.elements.loadingMsg.style.display = 'none';
        
    } catch (error) {
        console.error('JSON Load Error:', error);
        DOM.elements.loadingMsg.textContent = '❌ تعذر تحميل ملف الأسئلة.';
        DOM.elements.loadingMsg.style.color = 'var(--danger)';
    }
}

// دالة جديدة: تعرض شبكة المستويات بعد النقر على زر "ابدأ"
function showLevelsGrid() {
    if (allSectionsData.length === 0) {
        // إذا لم يتم التحميل بعد، نعرض رسالة التحميل
        DOM.elements.loadingMsg.style.display = 'block';
        return;
    }
    
    playSound(DOM.sounds.click);

    // إخفاء عنصر الترحيب الكبير
    DOM.elements.startBtn.style.display = 'none';
    document.querySelector('.intro-text').style.display = 'none'; 
    document.querySelector('.tagline').style.display = 'block'; 

    // إظهار عنوان القسم
    DOM.elements.selectTitle.style.display = 'block';
    
    // إنشاء وعرض بطاقات المستويات
    allSectionsData.forEach((section, index) => {
        const card = document.createElement('div');
        card.className = 'level-card';
        card.innerHTML = `
            <h3>${section.section}</h3>
            <p>عدد الأسئلة: ${section.questions.length} سؤال</p>
        `;
        card.onclick = () => startQuiz(index);
        DOM.elements.levelContainer.appendChild(card);
    });
}


function startQuiz(sectionIndex) {
    // ... (بقية منطق بدء الاختبار يبقى كما هو) ...
    playSound(DOM.sounds.click);
    const selectedSection = allSectionsData[sectionIndex];
    currentSectionQuestions = selectedSection.questions;
    currentQuestionIndex = 0;
    score = 0;
    quizStartTime = Date.now(); 
    
    switchScreen(DOM.screens.quiz);
    DOM.elements.sectionTitle.textContent = selectedSection.section;
    DOM.elements.nextButton.onclick = () => checkAnswer(parseInt(DOM.elements.nextButton.getAttribute('data-selected-index')));
    DOM.elements.nextButton.disabled = true;
    
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= currentSectionQuestions.length) {
        return showResults();
    }
    
    // ... (بقية منطق عرض السؤال يبقى كما هو) ...
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

window.selectAnswer = function(selectedIndex) {
    playSound(DOM.sounds.click);
    
    DOM.elements.nextButton.disabled = false;
    DOM.elements.nextButton.textContent = "تأكيد الإجابة 🚀";
    DOM.elements.nextButton.setAttribute('data-selected-index', selectedIndex);
}

function checkAnswer(selectedIndex) {
    if (selectedIndex === -1 && timeLeft > 0) return; 

    clearInterval(timerInterval);
    
    const q = currentSectionQuestions[currentQuestionIndex];
    const correctIndex = q.correct;
    const card = DOM.elements.quizContent;
    const optionsLabels = card.querySelectorAll('.option-label');
    
    card.querySelectorAll('input[type="radio"]').forEach(input => input.disabled = true);
    DOM.elements.nextButton.disabled = true;
    
    let isCorrect = (selectedIndex === correctIndex);

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
        showFeedback("إجابة صحيحة! تحليل ناجح. ✅", 'success');
    } else if (selectedIndex === -1) {
        playSound(DOM.sounds.timeup);
        showFeedback(`انتهى زمن التحليل! الإجابة الصحيحة كانت: ${q.options[correctIndex]} ⌛`, 'danger');
    } else {
        playSound(DOM.sounds.wrong);
        showFeedback(`بيانات خاطئة. الإجابة الصحيحة هي: ${q.options[correctIndex]} ❌`, 'danger');
    }
    
    DOM.elements.nextButton.textContent = "السؤال التالي >>";
    DOM.elements.nextButton.disabled = false;
    DOM.elements.nextButton.onclick = nextQuestion;
}

function nextQuestion() {
    currentQuestionIndex++;
    DOM.elements.nextButton.disabled = true;
    DOM.elements.nextButton.onclick = () => checkAnswer(parseInt(DOM.elements.nextButton.getAttribute('data-selected-index')));
    displayQuestion();
}

function showResults() {
    clearInterval(timerInterval);
    playSound(DOM.sounds.finish);
    
    const timeEnd = Date.now();
    const totalTimeSeconds = Math.floor((timeEnd - quizStartTime) / 1000);
    
    switchScreen(DOM.screens.results);

    const totalQuestionsInCurrentSection = currentSectionQuestions.length;
    const percentage = ((score / totalQuestionsInCurrentSection) * 100).toFixed(1);
    
    DOM.elements.finalScore.textContent = `${percentage}% (${score}/${totalQuestionsInCurrentSection})`;
    DOM.elements.timeSpent.textContent = formatTime(totalTimeSeconds);

    let achievementMessage = '';
    if (percentage >= 90) {
        achievementMessage = "لقب GeoMaster مطلق! أداء استثنائي. 🥇";
    } else if (percentage >= 70) {
        achievementMessage = "خبير جيولوجي متقدم. تحليل قوي. 🥈";
    } else if (percentage >= 50) {
        achievementMessage = "محلل متوسط. تحتاج لبعض المراجعة. 🥉";
    } else {
        achievementMessage = "نتائج تحتاج إلى تحسين. ابدأ بتحدٍ جديد! 📚";
    }
    
    DOM.elements.achievementMsg.textContent = achievementMessage;

    DOM.elements.finalScore.style.color = percentage >= 70 ? 'var(--success)' : 'var(--danger)';
    DOM.elements.finalScore.style.textShadow = `0 0 20px ${percentage >= 70 ? 'var(--success)' : 'var(--danger)'}`;
}

window.resetQuiz = function() {
    clearInterval(timerInterval);
    score = 0;
    currentQuestionIndex = 0;
    timeLeft = TIME_LIMIT_PER_QUESTION;
    currentSectionQuestions = [];
    hideFeedback();
    updateProgress(); 
    
    // إعادة تعيين واجهة الصفحة الرئيسية
    DOM.elements.startBtn.style.display = 'block';
    document.querySelector('.intro-text').style.display = 'block'; 
    document.querySelector('.tagline').style.display = 'none'; 
    DOM.elements.selectTitle.style.display = 'none';
    DOM.elements.levelContainer.innerHTML = '';
    
    switchScreen(DOM.screens.select);
}

window.onload = loadSections;
