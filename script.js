// حالة التطبيق
const AppState = {
    currentScreen: 'main-screen',
    currentCategory: null,
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    timer: null,
    timeLeft: 20,
    timerRunning: false,
    sounds: {},
    muted: false,
    settings: {
        soundEnabled: true,
        timerEnabled: true,
        shuffleEnabled: true
    },
    scores: JSON.parse(localStorage.getItem('GeoReady_scores')) || []
};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// تهيئة التطبيق
function initializeApp() {
    // تحميل الإعدادات
    const savedSettings = localStorage.getItem('GeoReady_settings');
    if (savedSettings) {
        AppState.settings = { ...AppState.settings, ...JSON.parse(savedSettings) };
        updateSettingsUI();
    }
    
    // تحديث واجهة الإعدادات
    updateSettingsUI();
    
    // عرض الشاشة الرئيسية
    showScreen('main-screen');
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // التنقل بين الشاشات
    document.getElementById('home-btn').addEventListener('click', confirmExit);
    document.getElementById('view-results-btn').addEventListener('click', showResultsScreen);
    document.getElementById('settings-btn').addEventListener('click', showSettingsModal);
    document.getElementById('new-quiz-btn').addEventListener('click', showMainScreen);
    document.getElementById('review-mistakes-btn').addEventListener('click', showReviewScreen);
    document.getElementById('back-to-results-btn').addEventListener('click', showResultsScreen);
    
    // اختيار الفئة
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            startQuiz(category);
        });
    });
    
    // التنقل في الاختبار
    document.getElementById('prev-btn').addEventListener('click', showPreviousQuestion);
    document.getElementById('next-btn').addEventListener('click', showNextQuestion);
    document.getElementById('skip-btn').addEventListener('click', skipQuestion);
    
    // التحكم في المؤقت والصوت
    document.getElementById('timer-toggle').addEventListener('click', toggleTimer);
    document.getElementById('mute-btn').addEventListener('click', toggleMute);
    
    // الإعدادات
    document.getElementById('close-settings').addEventListener('click', hideSettingsModal);
    document.getElementById('sound-toggle').addEventListener('change', function() {
        AppState.settings.soundEnabled = this.checked;
        saveSettings();
    });
    document.getElementById('timer-toggle-setting').addEventListener('change', function() {
        AppState.settings.timerEnabled = this.checked;
        saveSettings();
    });
    document.getElementById('shuffle-toggle').addEventListener('change', function() {
        AppState.settings.shuffleEnabled = this.checked;
        saveSettings();
    });
    
    // تأكيد الخروج
    document.getElementById('confirm-exit').addEventListener('click', function() {
        hideModal('exit-confirm-modal');
        showMainScreen();
    });
    document.getElementById('cancel-exit').addEventListener('click', function() {
        hideModal('exit-confirm-modal');
    });
    
    // التنقل بلوحة المفاتيح
    document.addEventListener('keydown', handleKeyPress);
    
    // منع إعادة تحميل الصفحة عن طريق الخطأ
    window.addEventListener('beforeunload', function(e) {
        if (AppState.currentScreen === 'quiz-screen') {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// إظهار شاشة معينة
function showScreen(screenId) {
    // إخفاء جميع الشاشات
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // إظهار الشاشة المطلوبة
    document.getElementById(screenId).classList.add('active');
    AppState.currentScreen = screenId;
    
    // إجراءات خاصة بكل شاشة
    if (screenId === 'main-screen') {
        resetQuizState();
    } else if (screenId === 'results-screen') {
        displaySessionResults();
        displayHighScores();
    }
}

// إظهار الشاشة الرئيسية
function showMainScreen() {
    showScreen('main-screen');
}

// إظهار شاشة النتائج
function showResultsScreen() {
    showScreen('results-screen');
}

// إظهار شاشة المراجعة
function showReviewScreen() {
    showScreen('review-screen');
    displayMistakes();
}

// بدء الاختبار
async function startQuiz(category) {
    try {
        AppState.currentCategory = category;
        AppState.currentQuestionIndex = 0;
        AppState.userAnswers = [];
        
        // تحميل الأسئلة
        await loadQuestions(category);
        
        // تهيئة الأصوات بعد التفاعل الأول
        initializeSounds();
        
        // الانتقال لشاشة الاختبار
        showScreen('quiz-screen');
        
        // تحديث معلومات الاختبار
        updateQuizInfo();
        
        // عرض السؤال الأول
        displayCurrentQuestion();
        
        // بدء المؤقت
        if (AppState.settings.timerEnabled) {
            startTimer();
        }
        
    } catch (error) {
        console.error('فشل في تحميل الأسئلة:', error);
        alert('عذرًا، حدث خطأ في تحميل الأسئلة. يرجى المحاولة مرة أخرى.');
        showMainScreen();
    }
}

// تحميل الأسئلة من ملف JSON
async function loadQuestions(category) {
    const response = await fetch(`${category}.json`);
    if (!response.ok) {
        throw new Error(`فشل في تحميل ${category}.json`);
    }
    
    const questions = await response.json();
    
    // التحقق من صحة البيانات
    if (!Array.isArray(questions) || questions.length !== 25) {
        throw new Error(`ملف ${category}.json لا يحتوي على 25 سؤالًا`);
    }
    
    // التحقق من كل سؤال
    questions.forEach((q, index) => {
        if (!q.id || !q.question || !q.options || !q.answer) {
            throw new Error(`سؤال ${index + 1} في ${category}.json غير مكتمل`);
        }
        
        // التأكد من أن answer هو أحد مفاتيح options
        if (!(q.answer in q.options)) {
            throw new Error(`الإجابة ${q.answer} غير موجودة في خيارات السؤال ${index + 1}`);
        }
    });
    
    AppState.questions = questions;
}

// عرض السؤال الحالي
function displayCurrentQuestion() {
    const question = AppState.questions[AppState.currentQuestionIndex];
    const optionsContainer = document.getElementById('options-container');
    
    // تحديث نص السؤال
    document.getElementById('question-text').textContent = question.question;
    
    // مسح الخيارات السابقة
    optionsContainer.innerHTML = '';
    
    // إعداد الخيارات
    let options = Object.entries(question.options).map(([key, text]) => ({ key, text }));
    
    // خلط الخيارات إذا كان مفعل
    if (AppState.settings.shuffleEnabled) {
        shuffleArray(options);
    }
    
    // إنشاء أزرار الخيارات
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.text;
        button.setAttribute('data-key', option.key);
        button.setAttribute('aria-label', `الخيار ${index + 1}: ${option.text}`);
        
        button.addEventListener('click', function() {
            handleAnswerSelection(option.key);
        });
        
        optionsContainer.appendChild(button);
    });
    
    // تحديث أزرار التنقل
    updateNavigationButtons();
    
    // تحديث شريط التقدم
    updateProgress();
}

// معالجة اختيار الإجابة
function handleAnswerSelection(selectedKey) {
    // منع اختيارات إضافية
    disableOptions();
    
    // إيقاف المؤقت
    stopTimer();
    
    const question = AppState.questions[AppState.currentQuestionIndex];
    const isCorrect = selectedKey === question.answer;
    
    // حفظ إجابة المستخدم
    AppState.userAnswers.push({
        questionIndex: AppState.currentQuestionIndex,
        selectedKey,
        isCorrect,
        timeSpent: 20 - AppState.timeLeft
    });
    
    // تلوين الخيارات
    colorOptions(selectedKey, question.answer);
    
    // تشغيل الصوت المناسب
    playSound(isCorrect ? 'correct' : 'wrong');
    
    // الانتقال للسؤال التالي بعد تأخير
    setTimeout(() => {
        if (AppState.currentQuestionIndex < AppState.questions.length - 1) {
            AppState.currentQuestionIndex++;
            resetTimer();
            displayCurrentQuestion();
            
            if (AppState.settings.timerEnabled) {
                startTimer();
            }
        } else {
            // انتهاء الاختبار
            finishQuiz();
        }
    }, 2000);
}

// تلوين الخيارات بناءً على الإجابة
function colorOptions(selectedKey, correctKey) {
    const options = document.querySelectorAll('.option-btn');
    
    options.forEach(option => {
        const optionKey = option.getAttribute('data-key');
        
        // إزالة أي فئات سابقة
        option.classList.remove('correct', 'wrong');
        
        // تطبيق الفئة المناسبة
        if (optionKey === correctKey) {
            option.classList.add('correct');
            option.setAttribute('aria-label', `${option.textContent} - الإجابة الصحيحة`);
        } else if (optionKey === selectedKey && selectedKey !== correctKey) {
            option.classList.add('wrong');
            option.setAttribute('aria-label', `${option.textContent} - إجابة خاطئة`);
        }
    });
}

// تعطيل الخيارات بعد الاختيار
function disableOptions() {
    const options = document.querySelectorAll('.option-btn');
    options.forEach(option => {
        option.classList.add('disabled');
        option.style.pointerEvents = 'none';
    });
}

// تهيئة الأصوات
function initializeSounds() {
    // إنشاء كائنات الصوت
    AppState.sounds = {
        correct: new Audio('sounds/correct.mp3'),
        wrong: new Audio('sounds/wrong.mp3'),
        timeout: new Audio('sounds/timeout.mp3')
    };
    
    // معالجة الأخطاء في تحميل الملفات
    Object.values(AppState.sounds).forEach(sound => {
        sound.addEventListener('error', function() {
            console.warn('تعذر تحميل ملف الصوت، سيتم استخدام البديل');
            // سيتم استخدام Web Audio API كبديل في playSound
        });
    });
}

// تشغيل الصوت
function playSound(type) {
    if (!AppState.settings.soundEnabled || AppState.muted) return;
    
    try {
        if (AppState.sounds[type]) {
            AppState.sounds[type].currentTime = 0;
            AppState.sounds[type].play().catch(e => {
                console.warn(`تعذر تشغيل صوت ${type}:`, e);
                playFallbackSound(type);
            });
        } else {
            playFallbackSound(type);
        }
    } catch (error) {
        console.warn(`خطأ في تشغيل صوت ${type}:`, error);
        playFallbackSound(type);
    }
}

// تشغيل صوت بديل باستخدام Web Audio API
function playFallbackSound(type) {
    if (!AppState.settings.soundEnabled || AppState.muted) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // ترددات مختلفة لأنواع الصوت المختلفة
        if (type === 'correct') {
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        } else if (type === 'wrong') {
            oscillator.frequency.setValueAtTime(349.23, audioContext.currentTime); // F4
        } else if (type === 'timeout') {
            oscillator.frequency.setValueAtTime(220.00, audioContext.currentTime); // A3
        }
        
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.warn('تعذر تشغيل الصوت البديل:', error);
    }
}

// إدارة المؤقت
function startTimer() {
    if (!AppState.settings.timerEnabled) return;
    
    AppState.timerRunning = true;
    AppState.timeLeft = 20;
    updateTimerDisplay();
    
    AppState.timer = setInterval(() => {
        AppState.timeLeft--;
        updateTimerDisplay();
        
        if (AppState.timeLeft <= 0) {
            handleTimeout();
        }
    }, 1000);
}

function stopTimer() {
    AppState.timerRunning = false;
    if (AppState.timer) {
        clearInterval(AppState.timer);
        AppState.timer = null;
    }
}

function resetTimer() {
    stopTimer();
    AppState.timeLeft = 20;
    updateTimerDisplay();
}

function handleTimeout() {
    stopTimer();
    disableOptions();
    
    // تسجيل الإجابة كخاطئة
    AppState.userAnswers.push({
        questionIndex: AppState.currentQuestionIndex,
        selectedKey: null,
        isCorrect: false,
        timeSpent: 20
    });
    
    // تشغيل صوت الوقت انتهى
    playSound('timeout');
    
    // تلوين الإجابة الصحيحة
    const question = AppState.questions[AppState.currentQuestionIndex];
    const options = document.querySelectorAll('.option-btn');
    
    options.forEach(option => {
        const optionKey = option.getAttribute('data-key');
        if (optionKey === question.answer) {
            option.classList.add('correct');
        }
    });
    
    // الانتقال للسؤال التالي بعد تأخير
    setTimeout(() => {
        if (AppState.currentQuestionIndex < AppState.questions.length - 1) {
            AppState.currentQuestionIndex++;
            resetTimer();
            displayCurrentQuestion();
            
            if (AppState.settings.timerEnabled) {
                startTimer();
            }
        } else {
            finishQuiz();
        }
    }, 2000);
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = AppState.timeLeft;
    
    // تغيير اللون بناءً على الوقت المتبقي
    timerElement.classList.remove('warning', 'danger');
    if (AppState.timeLeft <= 10) {
        timerElement.classList.add('warning');
    }
    if (AppState.timeLeft <= 5) {
        timerElement.classList.add('danger');
    }
}

// التنقل بين الأسئلة
function showPreviousQuestion() {
    if (AppState.currentQuestionIndex > 0) {
        stopTimer();
        AppState.currentQuestionIndex--;
        resetTimer();
        displayCurrentQuestion();
    }
}

function showNextQuestion() {
    if (AppState.currentQuestionIndex < AppState.questions.length - 1) {
        stopTimer();
        AppState.currentQuestionIndex++;
        resetTimer();
        displayCurrentQuestion();
        
        if (AppState.settings.timerEnabled && !AppState.userAnswers[AppState.currentQuestionIndex]) {
            startTimer();
        }
    }
}

function skipQuestion() {
    // معالجة تخطي السؤال
    AppState.userAnswers.push({
        questionIndex: AppState.currentQuestionIndex,
        selectedKey: null,
        isCorrect: false,
        timeSpent: 20 - AppState.timeLeft
    });
    
    stopTimer();
    
    if (AppState.currentQuestionIndex < AppState.questions.length - 1) {
        AppState.currentQuestionIndex++;
        resetTimer();
        displayCurrentQuestion();
        
        if (AppState.settings.timerEnabled) {
            startTimer();
        }
    } else {
        finishQuiz();
    }
}

// تحديث أزرار التنقل
function updateNavigationButtons() {
    document.getElementById('prev-btn').disabled = AppState.currentQuestionIndex === 0;
    
    const hasAnswered = AppState.userAnswers[AppState.currentQuestionIndex];
    document.getElementById('next-btn').disabled = !hasAnswered && 
        AppState.currentQuestionIndex < AppState.questions.length - 1;
}

// تحديث معلومات الاختبار
function updateQuizInfo() {
    const categoryName = document.querySelector(`[data-category="${AppState.currentCategory}"] span`).textContent;
    document.getElementById('category-name').textContent = categoryName;
    updateProgress();
}

function updateProgress() {
    const progressElement = document.getElementById('progress');
    progressElement.textContent = `السؤال ${AppState.currentQuestionIndex + 1} من ${AppState.questions.length}`;
}

// إنهاء الاختبار وعرض النتائج
function finishQuiz() {
    stopTimer();
    
    // حساب النتيجة
    const correctCount = AppState.userAnswers.filter(answer => answer.isCorrect).length;
    const totalTime = AppState.userAnswers.reduce((total, answer) => total + answer.timeSpent, 0);
    const scorePercent = Math.round((correctCount / AppState.questions.length) * 100);
    
    // حفظ النتيجة
    const scoreData = {
        date: new Date().toISOString(),
        category: AppState.currentCategory,
        totalQuestions: AppState.questions.length,
        correctCount,
        percent: scorePercent,
        timeSpent: totalTime
    };
    
    AppState.scores.push(scoreData);
    
    // حفظ في localStorage
    localStorage.setItem('GeoReady_scores', JSON.stringify(AppState.scores));
    
    // الانتقال لشاشة النتائج
    showResultsScreen();
}

// عرض نتائج الجلسة الحالية
function displaySessionResults() {
    const lastScore = AppState.scores[AppState.scores.length - 1];
    
    if (!lastScore) return;
    
    document.getElementById('score-percent').textContent = `${lastScore.percent}%`;
    document.getElementById('correct-count').textContent = lastScore.correctCount;
    document.getElementById('total-questions').textContent = lastScore.totalQuestions;
    document.getElementById('time-taken').textContent = `${lastScore.timeSpent} ثانية`;
    
    // تحديث دائرة النتيجة
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.background = `conic-gradient(var(--primary-color) ${lastScore.percent}%, #e0e0e0 ${lastScore.percent}%)`;
}

// عرض أفضل النتائج
function displayHighScores() {
    const highScoresList = document.getElementById('high-scores-list');
    highScoresList.innerHTML = '';
    
    // ترتيب النتائج تنازليًا
    const sortedScores = [...AppState.scores]
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 5);
    
    if (sortedScores.length === 0) {
        highScoresList.innerHTML = '<p>لا توجد نتائج مسجلة بعد</p>';
        return;
    }
    
    sortedScores.forEach((score, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'high-score-item';
        
        const categoryName = document.querySelector(`[data-category="${score.category}"] span`).textContent;
        const date = new Date(score.date).toLocaleDateString('ar-SA');
        
        scoreItem.innerHTML = `
            <div class="high-score-rank">${index + 1}</div>
            <div class="high-score-details">
                <div>${categoryName}</div>
                <div class="high-score-date">${date}</div>
            </div>
            <div class="high-score-percent">${score.percent}%</div>
        `;
        
        highScoresList.appendChild(scoreItem);
    });
}

// عرض الأخطاء
function displayMistakes() {
    const mistakesList = document.getElementById('mistakes-list');
    mistakesList.innerHTML = '';
    
    const mistakes = AppState.userAnswers.filter(answer => !answer.isCorrect);
    
    if (mistakes.length === 0) {
        mistakesList.innerHTML = '<p>لا توجد أخطاء في هذه الجلسة!</p>';
        return;
    }
    
    mistakes.forEach(mistake => {
        const question = AppState.questions[mistake.questionIndex];
        const mistakeItem = document.createElement('div');
        mistakeItem.className = 'mistake-item';
        
        let optionsHtml = '';
        Object.entries(question.options).forEach(([key, text]) => {
            let className = '';
            if (key === question.answer) {
                className = 'correct';
            } else if (key === mistake.selectedKey) {
                className = 'incorrect';
            }
            
            optionsHtml += `<div class="mistake-option ${className}">${text}</div>`;
        });
        
        mistakeItem.innerHTML = `
            <div class="mistake-question">${question.question}</div>
            <div class="mistake-options">${optionsHtml}</div>
            ${question.explanation ? `<div class="mistake-explanation">${question.explanation}</div>` : ''}
        `;
        
        mistakesList.appendChild(mistakeItem);
    });
}

// التحكم في المؤقت والصوت
function toggleTimer() {
    if (AppState.timerRunning) {
        stopTimer();
        document.getElementById('timer-toggle').innerHTML = '<i class="fas fa-play"></i>';
    } else {
        startTimer();
        document.getElementById('timer-toggle').innerHTML = '<i class="fas fa-pause"></i>';
    }
}

function toggleMute() {
    AppState.muted = !AppState.muted;
    const muteBtn = document.getElementById('mute-btn');
    
    if (AppState.muted) {
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        muteBtn.setAttribute('aria-label', 'تشغيل الصوت');
    } else {
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        muteBtn.setAttribute('aria-label', 'كتم الصوت');
    }
}

// الإعدادات
function showSettingsModal() {
    showModal('settings-modal');
}

function hideSettingsModal() {
    hideModal('settings-modal');
}

function updateSettingsUI() {
    document.getElementById('sound-toggle').checked = AppState.settings.soundEnabled;
    document.getElementById('timer-toggle-setting').checked = AppState.settings.timerEnabled;
    document.getElementById('shuffle-toggle').checked = AppState.settings.shuffleEnabled;
}

function saveSettings() {
    localStorage.setItem('GeoReady_settings', JSON.stringify(AppState.settings));
}

// تأكيد الخروج
function confirmExit() {
    if (AppState.userAnswers.length > 0) {
        showModal('exit-confirm-modal');
    } else {
        showMainScreen();
    }
}

// إدارة المودالات
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// معالجة ضغطات المفاتيح
function handleKeyPress(e) {
    if (AppState.currentScreen !== 'quiz-screen') return;
    
    // اختيار الخيارات بالأرقام 1-4
    if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        const options = document.querySelectorAll('.option-btn');
        
        if (index < options.length && !options[index].classList.contains('disabled')) {
            options[index].click();
        }
    }
    
    // التنقل بالسهمين
    else if (e.key === 'ArrowRight' && !document.getElementById('prev-btn').disabled) {
        document.getElementById('prev-btn').click();
    } else if (e.key === 'ArrowLeft' && !document.getElementById('next-btn').disabled) {
        document.getElementById('next-btn').click();
    }
    
    // تخطي بالسهم لأسفل
    else if (e.key === 'ArrowDown') {
        document.getElementById('skip-btn').click();
    }
    
    // إيقاف/تشغيل المؤقت بمسافة
    else if (e.key === ' ') {
        e.preventDefault();
        document.getElementById('timer-toggle').click();
    }
    
    // كتم/تشغيل الصوت بـ M
    else if (e.key === 'm' || e.key === 'M') {
        document.getElementById('mute-btn').click();
    }
    
    // الخروج بـ Escape
    else if (e.key === 'Escape') {
        document.getElementById('home-btn').click();
    }
}

// وظائف مساعدة
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function resetQuizState() {
    stopTimer();
    AppState.currentCategory = null;
    AppState.questions = [];
    AppState.currentQuestionIndex = 0;
    AppState.userAnswers = [];
    AppState.timeLeft = 20;
}

// تهيئة التطبيق عند التحميل
window.addEventListener('load', function() {
    // تحديث واجهة المستخدم بناءً على الإعدادات
    if (AppState.settings.soundEnabled) {
        document.getElementById('mute-btn').innerHTML = '<i class="fas fa-volume-up"></i>';
    }
});