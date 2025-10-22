// ====== المتغيرات الرئيسية والثوابت ======
let allSectionsData = []; 
let currentSectionQuestions = []; 
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
const TIME_LIMIT_PER_QUESTION = 20;
let timeLeft = TIME_LIMIT_PER_QUESTION;
let quizStartTime = 0; 
let userAnswers = [];

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
        userLevel: document.getElementById('user-level'),

        progressLevel: document.getElementById('progress-level'),
        progressText: document.getElementById('progress-text'),

        sectionTitle: document.getElementById('current-section-title'),
        questionCounter: document.getElementById('question-counter'),
        quizContent: document.getElementById('quiz-content'),
        timer: document.getElementById('timer'),
        nextButton: document.getElementById('next-question-btn'),
        finalScore: document.getElementById('final-score-display'),
        timeSpent: document.getElementById('time-spent-display'),
        correctAnswers: document.getElementById('correct-answers'),
        performanceLevel: document.getElementById('performance-level'),
        feedbackMsg: document.getElementById('feedback-message'),
        achievementMsg: document.getElementById('achievement-msg'),
        restartBtn: document.getElementById('restart-btn'),
        reviewBtn: document.getElementById('review-btn')
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
            console.warn("Sound blocked:", e); 
        });
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
    DOM.screens.menu.classList.remove('open');
}

function updateProgress(percentage) {
    DOM.elements.progressLevel.style.width = `${percentage}%`;
    DOM.elements.progressText.textContent = `استقرار النظام الكلي: ${percentage.toFixed(0)}%`;
    
    // تحديث شريط XP في الرأس
    const xpProgress = document.querySelector('.xp-progress');
    if (xpProgress) {
        xpProgress.style.width = `${percentage}%`;
    }
}

function showFeedback(message, type) {
    DOM.elements.feedbackMsg.textContent = message;
    DOM.elements.feedbackMsg.style.display = 'block';
    DOM.elements.feedbackMsg.style.background = type === 'success' 
        ? 'rgba(0, 255, 194, 0.2)' 
        : 'rgba(255, 51, 153, 0.2)';
    DOM.elements.feedbackMsg.style.border = type === 'success' 
        ? '1px solid var(--success)' 
        : '1px solid var(--danger)';
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

function updateScoreRing(percentage) {
    const circle = document.querySelector('.progress-ring-circle');
    if (circle) {
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
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
        button.innerHTML = `
            <span class="section-name">${section.section.split(':')[1] || section.section}</span>
            <span class="section-count">${section.questions.length} سؤال</span>
        `;
        button.onclick = () => {
            startQuiz(index);
            toggleMenu(true);
        };
        DOM.elements.sectionsGrid.appendChild(button);
    });
}

async function loadSections() {
    try {
        // محاكاة تحميل البيانات مع شريط تقدم
        let progress = 50;
        updateProgress(progress);
        
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
            }
            updateProgress(progress);
        }, 200);

        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to fetch JSON');
        allSectionsData = await response.json();
        
        clearInterval(progressInterval);
        updateProgress(100);
        
        renderSectionsForMenu();
        DOM.elements.progressText.textContent = 'النظام جاهز. اضغط [ابدأ]';
        
    } catch (error) {
        console.error('JSON Load Error:', error);
        updateProgress(10);
        DOM.elements.progressText.textContent = '❌ فشل تحميل البيانات. تأكد من وجود ملف questions.json.';
        
        // بيانات تجريبية للاختبار
        allSectionsData = [
            {
                section: "الجغرافيا العامة: أساسيات الجغرافيا",
                questions: [
                    {
                        question: "ما هو أكبر محيط في العالم؟",
                        options: ["المحيط الهادئ", "المحيط الأطلسي", "المحيط الهندي", "المحيط المتجمد الشمالي"],
                        correct: 0
                    },
                    {
                        question: "أي من هذه الدول لا تقع في أمريكا الجنوبية؟",
                        options: ["البرازيل", "الأرجنتين", "نيجيريا", "تشيلي"],
                        correct: 2
                    }
                ]
            }
        ];
        renderSectionsForMenu();
    }
}

// ====== دوال الاختبار الأساسية ======

function startQuiz(sectionIndex) {
    playSound(DOM.sounds.click);
    const selectedSection = allSectionsData[sectionIndex];
    currentSectionQuestions = selectedSection.questions;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    quizStartTime = Date.now(); 
    
    switchScreen(DOM.screens.quiz);
    DOM.elements.sectionTitle.textContent = selectedSection.section.split(':')[0];
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
    
    // تحديث عداد الأسئلة
    DOM.elements.questionCounter.textContent = `سؤال ${questionNumber}/${currentSectionQuestions.length}`;
    
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
        <div class="question-header">
            <span class="difficulty-indicator">${getDifficultyLevel(currentQuestionIndex)}</span>
        </div>
        <p class="question-text">${q.question}</p>
        <div id="options-container" class="options-grid">
            ${optionsHTML}
        </div>
    `;

    DOM.elements.nextButton.innerHTML = `
        <span class="btn-text">تأكيد الإدخال</span>
        <span class="btn-icon">🔒</span>
    `;
    DOM.elements.nextButton.disabled = true;
    DOM.elements.nextButton.removeAttribute('data-selected-index');
}

function getDifficultyLevel(index) {
    const levels = ['سهل', 'متوسط', 'صعب', 'متقدم'];
    return levels[Math.min(index, levels.length - 1)];
}

window.selectAnswer = function(selectedIndex) {
    playSound(DOM.sounds.click);
    
    DOM.elements.nextButton.disabled = false;
    DOM.elements.nextButton.innerHTML = `
        <span class="btn-text">تأكيد الإدخال</span>
        <span class="btn-icon">🚀</span>
    `;
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
    
    // حفظ إجابة المستخدم
    userAnswers.push({
        question: q.question,
        userAnswer: selectedIndex !== -1 ? q.options[selectedIndex] : "لم يتم الإجابة",
        correctAnswer: q.options[correctIndex],
        isCorrect: isCorrect
    });

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
        showFeedback("إجابة صحيحة! ✅", 'success');
    } else if (selectedIndex === -1) {
        playSound(DOM.sounds.timeup);
        showFeedback(`انتهاء الزمن! الإجابة الصحيحة: ${q.options[correctIndex]} ⌛`, 'danger');
    } else {
        playSound(DOM.sounds.wrong);
        showFeedback(`إجابة خاطئة. الإجابة الصحيحة: ${q.options[correctIndex]} ❌`, 'danger');
    }
    
    DOM.elements.nextButton.innerHTML = `
        <span class="btn-text">السؤال التالي</span>
        <span class="btn-icon">➡️</span>
    `;
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
    const percentage = Math.round((score / totalQuestionsInCurrentSection) * 100);
    
    // تحديث النتائج
    DOM.elements.finalScore.textContent = `${percentage}%`;
    DOM.elements.correctAnswers.textContent = `${score}/${totalQuestionsInCurrentSection}`;
    DOM.elements.timeSpent.textContent = formatTime(totalTimeSeconds);
    
    // تحديث حلقة النتيجة
    updateScoreRing(percentage);
    
    // تحديد مستوى الأداء
    let performanceLevel, achievementMessage;
    if (percentage >= 90) { 
        performanceLevel = "متميز"; 
        achievementMessage = "GeoMaster مطلق! 🥇 أداء استثنائي في اختبار الجغرافيا."; 
    } 
    else if (percentage >= 70) { 
        performanceLevel = "متقدم"; 
        achievementMessage = "خبير متقدم في الجغرافيا! 🥈 أداء رائع."; 
    } 
    else if (percentage >= 50) { 
        performanceLevel = "متوسط"; 
        achievementMessage = "محلل جغرافي متوسط. 🥉 استمر في التعلم والتطوير."; 
    } 
    else { 
        performanceLevel = "مبتدئ"; 
        achievementMessage = "تحسين مطلوب. 📚 راجع المواد وحاول مرة أخرى!"; 
    }
    
    DOM.elements.performanceLevel.textContent = performanceLevel;
    DOM.elements.achievementMsg.textContent = achievementMessage;

    // تحديث لون النتيجة بناءً على الأداء
    DOM.elements.finalScore.style.color = percentage >= 70 ? 'var(--success)' : 
                                         percentage >= 50 ? 'var(--warning)' : 'var(--danger)';
}

function reviewAnswers() {
    // تنفيذ وظيفة مراجعة الإجابات
    alert("وظيفة مراجعة الإجابات قيد التطوير. ستكون متاحة قريباً!");
}

window.resetQuiz = function() {
    clearInterval(timerInterval);
    score = 0;
    currentQuestionIndex = 0;
    timeLeft = TIME_LIMIT_PER_QUESTION;
    currentSectionQuestions = [];
    userAnswers = [];
    hideFeedback();
    
    updateProgress(100);
    switchScreen(DOM.screens.welcome);
}

// ====== ربط الأحداث ======
DOM.elements.startBtn.addEventListener('click', () => {
    if (allSectionsData.length > 0) {
        toggleMenu();
    } else {
        alert('جاري تحميل البيانات، يرجى الانتظار...');
    }
});

DOM.elements.menuToggle.addEventListener('click', toggleMenu);
DOM.elements.closeMenuBtn.addEventListener('click', () => toggleMenu(true));
DOM.elements.restartBtn.addEventListener('click', resetQuiz);
DOM.elements.reviewBtn.addEventListener('click', reviewAnswers);

// إضافة تأثيرات إضافية عند التمرير
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    document.body.style.backgroundPosition = `calc(50% + ${rate}px) calc(20% + ${rate*0.5}px)`;
});

// تشغيل دالة التحميل عند بداية النظام
window.onload = () => {
    switchScreen(DOM.screens.welcome);
    updateProgress(50);
    loadSections();
    
    // إضافة تأثيرات دخول للعناصر
    setTimeout(() => {
        document.querySelectorAll('.feature-card').forEach((card, index) => {
            card.style.animation = `fadeIn 0.5s ease-out ${index * 0.2}s both`;
        });
    }, 500);
};