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

        // عناصر شريط التقدم
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

// ====== دوال المساعدة والخدمة (كما في السابق) ======

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
    DOM.screens.menu.classList.remove('open'); // إغلاق القائمة الجانبية عند التبديل
}

function updateProgress(totalProgress = 0) {
    // تحديث شريط التقدم (الأنبوب) في شاشة الترحيب
    DOM.elements.progressLevel.style.width = `${totalProgress}%`;
    DOM.elements.progressText.textContent = `التقدم الكلي: ${totalProgress.toFixed(1)}%`;
}

// ====== وظائف القائمة الجانبية ======

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
        button.textContent = `${section.section} (${section.questions.length} أسئلة)`;
        button.onclick = () => {
            // يبدأ التحدي من هذا القسم ويغلق القائمة
            startQuiz(index);
            toggleMenu(true); 
        };
        DOM.elements.sectionsGrid.appendChild(button);
    });
}

// ====== دالة تحميل الأقسام (كما في السابق) ======

async function loadSections() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to fetch JSON');
        allSectionsData = await response.json();
        renderSectionsForMenu(); // تجهيز الأقسام للقائمة الجانبية فور التحميل
        updateProgress(50); // إشارة إلى تحميل البيانات
        
    } catch (error) {
        console.error('JSON Load Error:', error);
        DOM.elements.progressText.textContent = '❌ تعذر تحميل البيانات.';
    }
}

// ====== دالة بدء التحدي (توجه لفتح القائمة الجانبية) ======

DOM.elements.startBtn.addEventListener('click', () => {
    if (allSectionsData.length === 0) {
        DOM.elements.progressText.textContent = 'البيانات قيد التحميل... انتظر لحظة.';
        return;
    }
    toggleMenu(); // عند الضغط على ابدأ، نفتح القائمة ليختار القسم
});

// ربط زر القائمة بفتح القائمة
DOM.elements.menuToggle.addEventListener('click', toggleMenu);
DOM.elements.closeMenuBtn.addEventListener('click', () => toggleMenu(true));

// ... (بقية دوال الاختبار: startQuiz, displayQuestion, checkAnswer, nextQuestion, showResults تبقى كما هي) ...

function startQuiz(sectionIndex) {
    playSound(DOM.sounds.click);
    // ... (منطق تهيئة الاختبار)
    switchScreen(DOM.screens.quiz); // التبديل لشاشة الاختبار
    // ...
}

// عند تحميل الصفحة، ابدأ بعرض شاشة الترحيب وتحميل الأقسام
window.onload = () => {
    switchScreen(DOM.screens.welcome);
    loadSections();
};
