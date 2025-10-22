// ====== المتغيرات الرئيسية والثوابت ======
let allSectionsData = []; 
let currentSectionQuestions = []; 
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
const TIME_LIMIT_PER_QUESTION = 20;
let timeLeft = TIME_LIMIT_PER_QUESTION;
let quizStartTime = 0; 

// ====== عناصر الـ DOM ======
const DOM = {
    screens: {
        welcome: document.getElementById('welcome-screen'),
        quiz: document.getElementById('quiz-screen'),
        results: document.getElementById('final-results-screen'),
        menu: document.getElementById('sections-menu')
    },
    elements: {
        startBtn: document.getElementById('start-button'), 
        menuToggle: document.getElementById('menu-toggle'),
        closeMenuBtn: document.getElementById('close-menu-btn'),
        sectionsGrid: document.getElementById('sections-grid'),

        progressLevel: document.getElementById('progress-level'),
        progressText: document.getElementById('progress-text'),

        sectionTitle: document.getElementById('current-section-title'),
        quizContent: document.getElementById('quiz-content'),
        timer: document.getElementById('timer'),
        nextButton: document.getElementById('next-question-btn'),
        finalScore: document.getElementById('final-score-display'),
        timeSpent: document.getElementById('time-spent-display'),
        feedbackMsg: document.getElementById('feedback-message'),
        achievementMsg: document.getElementById('achievement-msg')
    },
    sounds: {
        // يمكنك إرجاع الروابط الصحيحة هنا أو تركها فارغة مؤقتاً
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
        soundElement.play().catch(e => { /* console.warn("Sound blocked:", e); */ });
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function switchScreen(activeScreen) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    activeScreen.classList.add('active');
    DOM.screens.menu.classList.remove('open'); // إغلاق القائمة عند التبديل
}

function updateProgress(percentage) {
    DOM.elements.progressLevel.style.width = `${percentage}%`;
    DOM.elements.progressText.textContent = `استقرار النظام الكلي: ${percentage.toFixed(0)}%`;
}

function showFeedback(message, type) {
    DOM.elements.feedbackMsg.textContent = message;
    DOM.elements.feedbackMsg.style.display = 'block';
    DOM.elements.feedbackMsg.style.color = type === 'success' ? 'var(--success)' : 'var(--danger)';
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

// ====== وظائف القائمة الجانبية والتحميل ======

function toggleMenu(forceClose = false) {
    playSound(DOM.sounds.click);
    if (DOM.screens.menu.classList.contains('open') || forceClose) {
        DOM.screens.menu.classList.remove('open');
    } else {
        DOM.screens.menu.classList.add('open');
    }
}

function renderSectionsForMenu() {
    DOM.elements.sectionsGrid.innerHTML = '';
    allSectionsData.forEach((section, index) => {
        const button = document.createElement('button');
        button.className = 'section-item';
        button.textContent = `${section.section.split(':')[1] || section.section} (${section.questions.length} سؤال)`;
        button.onclick = () => {
            startQuiz(index);
            toggleMenu(true); 
        };
        DOM.elements.sectionsGrid.appendChild(button);
    });
}

async function loadSections() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to fetch JSON');
        allSectionsData = await response.json();
        renderSectionsForMenu(); 
        updateProgress(100); 
        DOM.elements.progressText.textContent = 'النظام جاهز. اضغط [ابدأ]';
        
    } catch (error) {
        console.error('JSON Load Error:', error);
        updateProgress(10);
        DOM.elements.progressText.textContent = '❌ فشل تحميل البيانات. تأكد من وجود ملف questions.json.';
    }
}

// ====== دوال الاختبار الأساسية ======

function startQuiz(sectionIndex) {
    playSound(DOM.sounds.click);
    const selectedSection = allSectionsData[sectionIndex];
    currentSectionQuestions = selectedSection.questions;
    currentQuestionIndex = 0;
    score = 0;
    quizStartTime = Date.now(); 
    
    switchScreen(DOM.screens.quiz);
    DOM.elements.sectionTitle.textContent = selectedSection.section.split(':')[0]; // عرض الجزء الرئيسي فقط
    DOM.elements.nextButton.onclick = () => checkAnswer(parseInt(DOM.elements.nextButton.getAttribute('data-selected-index')));
    DOM.elements.nextButton.disabled = true;
    
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= currentSectionQuestions.length) {
        return showResults();
    }
    
    hideFeedback();
    startTimer();
    
    const q = currentSectionQuestions[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;
    
    let optionsHTML = '';
    q.options.forEach((option, optionIndex) => {
        const inputId = `opt-${questionNumber}${optionIndex}`;
        optionsHTML += `
            <label for="${inputId}" class="option-label">
                <input type="radio" id="${inputId}" name="current-q" value="${optionIndex}" onclick="selectAnswer(${optionIndex})">
                <span class="option-text">${option}</span>
            </label>
        `;
    });

    DOM.elements.quizContent.innerHTML = `
        <p class="question-text">سؤال ${questionNumber}/${currentSectionQuestions.length}: ${q.question}</p>
        <div id="options-container" class="options-grid">
            ${optionsHTML}
        </div>
    `;

    DOM.elements.nextButton.textContent = "تأكيد الإدخال 🔒";
    DOM.elements.nextButton.disabled = true;
    DOM.elements.nextButton.removeAttribute('data-selected-index');
}

window.selectAnswer = function(selectedIndex) {
    playSound(DOM.sounds.click);
    
    DOM.elements.nextButton.disabled = false;
    DOM.elements.nextButton.textContent = "تأكيد الإدخال 🚀";
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
        showFeedback("إدخال صحيح! ✅", 'success');
    } else if (selectedIndex === -1) {
        playSound(DOM.sounds.timeup);
        showFeedback(`انتهاء الزمن! الإجابة الصحيحة كانت: ${q.options[correctIndex]} ⌛`, 'danger');
    } else {
        playSound(DOM.sounds.wrong);
        showFeedback(`إدخال خاطئ. الصحيح هو: ${q.options[correctIndex]} ❌`, 'danger');
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
    if (percentage >= 90) { achievementMessage = "GeoMaster مطلق. 🥇"; } 
    else if (percentage >= 70) { achievementMessage = "خبير متقدم. 🥈"; } 
    else if (percentage >= 50) { achievementMessage = "محلل متوسط. 🥉"; } 
    else { achievementMessage = "تحسين مطلوب. 📚"; }
    
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
    
    updateProgress(100); // تعيين التقدم إلى 100% بعد إعادة التشغيل
    switchScreen(DOM.screens.welcome);
}

// ====== ربط الأحداث ======
DOM.elements.startBtn.addEventListener('click', () => {
    if (allSectionsData.length > 0) {
        toggleMenu(); // يفتح القائمة ليختار المستخدم القسم
    }
});

DOM.elements.menuToggle.addEventListener('click', toggleMenu);
DOM.elements.closeMenuBtn.addEventListener('click', () => toggleMenu(true));

// تشغيل دالة التحميل عند بداية النظام
window.onload = () => {
    switchScreen(DOM.screens.welcome);
    updateProgress(50); // إظهار أن النظام بدأ العمل
    loadSections();
};
