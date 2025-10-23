// إعدادات التطبيق - قابلة للتعديل
const APP_CONFIG = {
    DEFAULT_TIMER: 20,
    DEFAULT_QUESTION_COUNT_OPTIONS: [10, 20, 'all'],
    SOUND_ENABLED: true,
    STORAGE_KEY: 'GeoReady_scores',
    QUESTION_BANKS: [
        'BasicGeology.json',
        'Geochemistry.json',
        'Geophysics.json',
        'Hydrogeology.json',
        'Petrology.json',
        'Structuralgeology.json',
        'sedimentarygeology.json'
    ],
    RANK_THRESHOLDS: {
        EXPERT: 90,
        PROFESSIONAL: 70,
        EXPLORER: 50
    },
    RANK_TITLES: {
        EXPERT: 'جيولوجي فائق',
        PROFESSIONAL: 'جيولوجي ميداني محترف',
        EXPLORER: 'مستكشف الطبقات',
        BEGINNER: 'مبتدئ في الميدان'
    }
};

// حالة التطبيق
const AppState = {
    currentScreen: 'start-screen',
    language: 'ar',
    soundEnabled: APP_CONFIG.SOUND_ENABLED,
    questionBanks: {},
    currentQuiz: {
        category: null,
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        selectedOptions: [],
        timer: null,
        timeRemaining: APP_CONFIG.DEFAULT_TIMER,
        settings: {
            questionCount: 10,
            difficulty: 'all',
            shuffleOptions: true
        }
    },
    audioContext: null,
    sounds: {}
};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadBanks();
});

// تهيئة التطبيق
function initializeApp() {
    // تهيئة Web Audio API للأصوات الافتراضية
    try {
        AppState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('Web Audio API غير مدعوم:', e);
    }
    
    // تحميل أفضل النتائج من localStorage
    loadTopScores();
    
    // تعيين الشاشة النشطة
    showScreen('start-screen');
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار التنقل
    document.getElementById('start-btn').addEventListener('click', () => showScreen('category-screen'));
    document.getElementById('back-to-start').addEventListener('click', () => showScreen('start-screen'));
    document.getElementById('back-to-categories').addEventListener('click', () => showScreen('category-screen'));
    document.getElementById('back-to-results').addEventListener('click', () => showScreen('results-screen'));
    
    // أزرار التحكم العامة
    document.getElementById('language-toggle').addEventListener('click', toggleLanguage);
    document.getElementById('sound-toggle').addEventListener('click', toggleSound);
    
    // أزرار النتائج
    document.getElementById('play-again').addEventListener('click', () => showScreen('category-screen'));
    document.getElementById('review-mistakes').addEventListener('click', showReviewScreen);
    document.getElementById('share-results').addEventListener('click', shareResults);
    
    // زر التخطي
    document.getElementById('skip-btn').addEventListener('click', handleSkipQuestion);
    
    // مستمعي لوحة المفاتيح
    document.addEventListener('keydown', handleKeyPress);
}

// تحميل بنوك الأسئلة
async function loadBanks() {
    const categoriesGrid = document.querySelector('.categories-grid');
    
    try {
        // عرض حالة التحميل
        categoriesGrid.innerHTML = '<div class="loading">جاري تحميل الفئات...</div>';
        
        // تحميل كل بنك أسئلة
        for (const bankName of APP_CONFIG.QUESTION_BANKS) {
            try {
                const response = await fetch(bankName);
                if (!response.ok) throw new Error(`فشل تحميل ${bankName}`);
                
                const questions = await response.json();
                AppState.questionBanks[bankName] = questions;
                
                // تحديث الواجهة مع كل بنك يتم تحميله
                updateCategoriesGrid();
            } catch (error) {
                console.error(`خطأ في تحميل ${bankName}:`, error);
                // الاستمرار مع البنوك الأخرى
            }
        }
        
        // إضافة خيار عشوائي
        AppState.questionBanks['random'] = [];
        updateCategoriesGrid();
        
    } catch (error) {
        console.error('خطأ في تحميل بنوك الأسئلة:', error);
        categoriesGrid.innerHTML = `
            <div class="error-message">
                <p>فشل تحميل الأسئلة. تأكد من وجود ملفات JSON في المسار الصحيح.</p>
                <button onclick="loadBanks()" class="action-btn primary">إعادة المحاولة</button>
            </div>
        `;
    }
}

// تحديث شبكة الفئات
function updateCategoriesGrid() {
    const categoriesGrid = document.querySelector('.categories-grid');
    const categoryNames = {
        'BasicGeology.json': 'الجيولوجيا الأساسية',
        'Geochemistry.json': 'الجيوكيمياء',
        'Geophysics.json': 'الجيوفيزياء',
        'Hydrogeology.json': 'الهيدروجيولوجيا',
        'Petrology.json': 'علم الصخور',
        'Structuralgeology.json': 'الجيولوجيا التركيبية',
        'sedimentarygeology.json': 'جيولوجيا الرواسب',
        'random': 'أسئلة عشوائية'
    };
    
    const icons = {
        'BasicGeology.json': 'fas fa-mountain',
        'Geochemistry.json': 'fas fa-flask',
        'Geophysics.json': 'fas fa-satellite',
        'Hydrogeology.json': 'fas fa-tint',
        'Petrology.json': 'fas fa-gem',
        'Structuralgeology.json': 'fas fa-layer-group',
        'sedimentarygeology.json': 'fas fa-hill-rockslide',
        'random': 'fas fa-random'
    };
    
    let html = '';
    
    for (const [bankName, questions] of Object.entries(AppState.questionBanks)) {
        const displayName = categoryNames[bankName] || bankName;
        const questionCount = bankName === 'random' ? '25 من كل فئة' : questions.length;
        const iconClass = icons[bankName] || 'fas fa-question';
        
        html += `
            <div class="category-card" data-bank="${bankName}">
                <i class="${iconClass} category-icon"></i>
                <h3 class="category-name">${displayName}</h3>
                <p class="category-count">${questionCount} سؤال</p>
            </div>
        `;
    }
    
    categoriesGrid.innerHTML = html;
    
    // إضافة مستمعي الأحداث للبطاقات
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const bankName = this.getAttribute('data-bank');
            selectBank(bankName);
        });
    });
}

// اختيار بنك الأسئلة
function selectBank(bankName) {
    AppState.currentQuiz.category = bankName;
    
    // جمع إعدادات المستخدم
    const questionCount = document.getElementById('question-count').value;
    const difficulty = document.getElementById('difficulty').value;
    const shuffleOptions = document.getElementById('shuffle-options').checked;
    
    AppState.currentQuiz.settings = {
        questionCount: questionCount === 'all' ? 'all' : parseInt(questionCount),
        difficulty,
        shuffleOptions
    };
    
    startQuiz(AppState.currentQuiz.settings);
}

// بدء الاختبار
function startQuiz(options) {
    let questions = [];
    
    if (AppState.currentQuiz.category === 'random') {
        // جمع أسئلة عشوائية من جميع البنوك
        for (const bankName of APP_CONFIG.QUESTION_BANKS) {
            if (AppState.questionBanks[bankName]) {
                questions = questions.concat(AppState.questionBanks[bankName]);
            }
        }
    } else {
        questions = AppState.questionBanks[AppState.currentQuiz.category] || [];
    }
    
    // تطبيق عامل التصفية حسب الصعوبة إذا كان محددًا
    if (options.difficulty !== 'all') {
        questions = questions.filter(q => q.difficulty === options.difficulty);
    }
    
    // تحديد عدد الأسئلة
    if (options.questionCount !== 'all' && questions.length > options.questionCount) {
        questions = shuffleQuestions(questions).slice(0, options.questionCount);
    } else {
        questions = shuffleQuestions(questions);
    }
    
    // تهيئة حالة الاختبار
    AppState.currentQuiz.questions = questions;
    AppState.currentQuiz.currentQuestionIndex = 0;
    AppState.currentQuiz.score = 0;
    AppState.currentQuiz.selectedOptions = [];
    AppState.currentQuiz.timeRemaining = APP_CONFIG.DEFAULT_TIMER;
    
    // تهيئة الأصوات
    initializeSounds();
    
    // الانتقال إلى شاشة الاختبار
    showScreen('quiz-screen');
    showQuestion();
}

// خلط الأسئلة
function shuffleQuestions(questions) {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// عرض السؤال الحالي
function showQuestion() {
    const currentQuestion = AppState.currentQuiz.questions[AppState.currentQuiz.currentQuestionIndex];
    if (!currentQuestion) return;
    
    // تحديث معلومات التقدم
    document.getElementById('current-question').textContent = AppState.currentQuiz.currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = AppState.currentQuiz.questions.length;
    document.getElementById('current-score').textContent = AppState.currentQuiz.score;
    
    // عرض نص السؤال
    document.getElementById('question-text').textContent = currentQuestion.question;
    
    // تهيئة الخيارات
    const optionsContainer = document.querySelector('.options-container');
    optionsContainer.innerHTML = '';
    
    // تحضير الخيارات للعرض
    let options = Object.entries(currentQuestion.options).map(([key, value]) => ({
        key,
        text: value
    }));
    
    // خلط الخيارات إذا كان الإعداد مفعلًا
    if (AppState.currentQuiz.settings.shuffleOptions) {
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
    }
    
    // إنشاء أزرار الخيارات
    options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'option-btn';
        optionBtn.setAttribute('data-key', option.key);
        optionBtn.innerHTML = `
            <span class="option-label">${option.key}</span>
            <span class="option-text">${option.text}</span>
        `;
        
        optionBtn.addEventListener('click', () => selectAnswer(option.key));
        optionsContainer.appendChild(optionBtn);
    });
    
    // بدء المؤقت
    startTimer();
}

// بدء المؤقت
function startTimer() {
    // إعادة تعيين المؤقت
    AppState.currentQuiz.timeRemaining = APP_CONFIG.DEFAULT_TIMER;
    updateTimerDisplay();
    
    // إيقاف أي مؤقت سابق
    if (AppState.currentQuiz.timer) {
        clearInterval(AppState.currentQuiz.timer);
    }
    
    // بدء المؤقت الجديد
    AppState.currentQuiz.timer = setInterval(() => {
        AppState.currentQuiz.timeRemaining--;
        updateTimerDisplay();
        
        if (AppState.currentQuiz.timeRemaining <= 0) {
            handleTimeout();
        }
    }, 1000);
}

// تحديث عرض المؤقت
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    const timerPath = document.getElementById('timer-path');
    
    if (timerElement) {
        timerElement.textContent = AppState.currentQuiz.timeRemaining;
    }
    
    if (timerPath) {
        const circumference = 2 * Math.PI * 15.9155;
        const offset = circumference - (AppState.currentQuiz.timeRemaining / APP_CONFIG.DEFAULT_TIMER) * circumference;
        timerPath.style.strokeDasharray = `${circumference} ${circumference}`;
        timerPath.style.strokeDashoffset = offset;
        
        // تغيير اللون بناءً على الوقت المتبقي
        if (AppState.currentQuiz.timeRemaining <= 5) {
            timerPath.style.stroke = AppState.currentQuiz.timeRemaining <= 3 ? 'var(--error-color)' : 'var(--warning-color)';
        } else {
            timerPath.style.stroke = 'var(--secondary-color)';
        }
    }
}

// التعامل مع انتهاء الوقت
function handleTimeout() {
    // إيقاف المؤقت
    if (AppState.currentQuiz.timer) {
        clearInterval(AppState.currentQuiz.timer);
        AppState.currentQuiz.timer = null;
    }
    
    // تشغيل صوت انتهاء الوقت
    playSound('timeout');
    
    // عرض رسالة انتهاء الوقت
    showNotification('انتهى الوقت! ⏰', 'warning');
    
    // تسجيل الإجابة كخاطئة
    const currentQuestion = AppState.currentQuiz.questions[AppState.currentQuiz.currentQuestionIndex];
    AppState.currentQuiz.selectedOptions.push({
        questionId: currentQuestion.id,
        selectedKey: null,
        correctKey: currentQuestion.answer,
        isCorrect: false,
        timeTaken: APP_CONFIG.DEFAULT_TIMER
    });
    
    // عرض الإجابة الصحيحة
    highlightCorrectAnswer(currentQuestion.answer);
    
    // الانتقال للسؤال التالي بعد تأخير
    setTimeout(nextQuestion, 1500);
}

// اختيار إجابة
function selectAnswer(selectedKey) {
    // إيقاف المؤقت
    if (AppState.currentQuiz.timer) {
        clearInterval(AppState.currentQuiz.timer);
        AppState.currentQuiz.timer = null;
    }
    
    const currentQuestion = AppState.currentQuiz.questions[AppState.currentQuiz.currentQuestionIndex];
    const isCorrect = selectedKey === currentQuestion.answer;
    const timeTaken = APP_CONFIG.DEFAULT_TIMER - AppState.currentQuiz.timeRemaining;
    
    // تسجيل الإجابة
    AppState.currentQuiz.selectedOptions.push({
        questionId: currentQuestion.id,
        selectedKey,
        correctKey: currentQuestion.answer,
        isCorrect,
        timeTaken
    });
    
    // تحديث النتيجة إذا كانت الإجابة صحيحة
    if (isCorrect) {
        AppState.currentQuiz.score++;
        playSound('correct');
        showNotification('إجابة صحيحة! 🎉', 'success');
    } else {
        playSound('wrong');
        showNotification('إجابة خاطئة! ❌', 'error');
    }
    
    // تلوين الإجابات
    highlightAnswers(selectedKey, currentQuestion.answer);
    
    // الانتقال للسؤال التالي بعد تأخير
    setTimeout(nextQuestion, 1500);
}

// تلوين الإجابات
function highlightAnswers(selectedKey, correctKey) {
    const optionButtons = document.querySelectorAll('.option-btn');
    
    optionButtons.forEach(btn => {
        const key = btn.getAttribute('data-key');
        btn.classList.add('disabled');
        
        if (key === correctKey) {
            btn.classList.add('correct');
        } else if (key === selectedKey && selectedKey !== correctKey) {
            btn.classList.add('incorrect');
        }
    });
}

// تلوين الإجابة الصحيحة فقط
function highlightCorrectAnswer(correctKey) {
    const optionButtons = document.querySelectorAll('.option-btn');
    
    optionButtons.forEach(btn => {
        const key = btn.getAttribute('data-key');
        btn.classList.add('disabled');
        
        if (key === correctKey) {
            btn.classList.add('correct');
        }
    });
}

// الانتقال للسؤال التالي
function nextQuestion() {
    AppState.currentQuiz.currentQuestionIndex++;
    
    if (AppState.currentQuiz.currentQuestionIndex < AppState.currentQuiz.questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

// عرض النتائج
function showResult() {
    const totalQuestions = AppState.currentQuiz.questions.length;
    const correctAnswers = AppState.currentQuiz.score;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    // تحديث عناصر النتائج
    document.getElementById('final-score').textContent = `${correctAnswers}/${totalQuestions}`;
    document.getElementById('correct-answers').textContent = correctAnswers;
    document.getElementById('percentage').textContent = `${percentage}%`;
    
    // تحديد اللقب
    let rankTitle = APP_CONFIG.RANK_TITLES.BEGINNER;
    if (percentage >= APP_CONFIG.RANK_THRESHOLDS.EXPERT) {
        rankTitle = APP_CONFIG.RANK_TITLES.EXPERT;
    } else if (percentage >= APP_CONFIG.RANK_THRESHOLDS.PROFESSIONAL) {
        rankTitle = APP_CONFIG.RANK_TITLES.PROFESSIONAL;
    } else if (percentage >= APP_CONFIG.RANK_THRESHOLDS.EXPLORER) {
        rankTitle = APP_CONFIG.RANK_TITLES.EXPLORER;
    }
    
    document.getElementById('rank-title').textContent = rankTitle;
    
    // حفظ النتيجة
    saveScore({
        category: AppState.currentQuiz.category,
        score: correctAnswers,
        total: totalQuestions,
        percentage: percentage,
        date: new Date().toISOString(),
        rank: rankTitle
    });
    
    // عرض أفضل النتائج
    displayTopScores();
    
    // الانتقال لشاشة النتائج
    showScreen('results-screen');
}

// حفظ النتيجة
function saveScore(scoreData) {
    let scores = JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEY)) || [];
    
    // إضافة النتيجة الجديدة
    scores.push(scoreData);
    
    // ترتيب النتائج تنازلياً حسب النسبة المئوية
    scores.sort((a, b) => b.percentage - a.percentage);
    
    // الاحتفاظ بأفضل 10 نتائج فقط
    scores = scores.slice(0, 10);
    
    // حفظ في localStorage
    localStorage.setItem(APP_CONFIG.STORAGE_KEY, JSON.stringify(scores));
}

// تحميل أفضل النتائج
function loadTopScores() {
    return JSON.parse(localStorage.getItem(APP_CONFIG.STORAGE_KEY)) || [];
}

// عرض أفضل النتائج
function displayTopScores() {
    const scores = loadTopScores();
    const scoresList = document.getElementById('scores-list');
    
    if (scores.length === 0) {
        scoresList.innerHTML = '<p class="no-scores">لا توجد نتائج سابقة</p>';
        return;
    }
    
    let html = '';
    scores.slice(0, 5).forEach((score, index) => {
        const categoryNames = {
            'BasicGeology.json': 'الجيولوجيا الأساسية',
            'Geochemistry.json': 'الجيوكيمياء',
            'Geophysics.json': 'الجيوفيزياء',
            'Hydrogeology.json': 'الهيدروجيولوجيا',
            'Petrology.json': 'علم الصخور',
            'Structuralgeology.json': 'الجيولوجيا التركيبية',
            'sedimentarygeology.json': 'جيولوجيا الرواسب',
            'random': 'عشوائي'
        };
        
        const date = new Date(score.date).toLocaleDateString('ar-EG');
        const displayCategory = categoryNames[score.category] || score.category;
        
        html += `
            <div class="score-item">
                <span class="score-rank">${index + 1}</span>
                <span class="score-category">${displayCategory}</span>
                <span class="score-value">${score.percentage}%</span>
                <span class="score-date">${date}</span>
            </div>
        `;
    });
    
    scoresList.innerHTML = html;
}

// عرض شاشة المراجعة
function showReviewScreen() {
    const reviewContainer = document.getElementById('review-questions');
    let html = '';
    
    AppState.currentQuiz.selectedOptions.forEach((answer, index) => {
        const question = AppState.currentQuiz.questions[index];
        if (!question) return;
        
        const userAnswer = answer.selectedKey ? question.options[answer.selectedKey] : 'لم يتم الإجابة';
        const correctAnswer = question.options[answer.correctKey];
        const isCorrect = answer.isCorrect;
        
        html += `
            <div class="review-item">
                <div class="review-question">${index + 1}. ${question.question}</div>
                <div class="review-options">
                    <div class="review-option ${isCorrect ? 'correct' : 'incorrect'}">
                        <span class="option-label">إجابتك:</span>
                        <span class="option-text">${userAnswer}</span>
                    </div>
                    <div class="review-option correct">
                        <span class="option-label">الإجابة الصحيحة:</span>
                        <span class="option-text">${correctAnswer}</span>
                    </div>
                </div>
                ${question.explain ? `
                    <div class="review-explanation">
                        <strong>شرح:</strong> ${question.explain}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    reviewContainer.innerHTML = html;
    showScreen('review-screen');
}

// مشاركة النتائج
function shareResults() {
    const totalQuestions = AppState.currentQuiz.questions.length;
    const correctAnswers = AppState.currentQuiz.score;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    const shareText = `حصلت على ${correctAnswers}/${totalQuestions} (${percentage}%) في تحدّي GeoReady! هل يمكنك التغلب على نتيجتي؟`;
    
    if (navigator.share) {
        navigator.share({
            title: 'نتيجة GeoReady',
            text: shareText,
            url: window.location.href
        }).catch(err => {
            console.log('خطأ في المشاركة:', err);
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

// نسخ النص للحافظة
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('تم نسخ النتيجة إلى الحافظة!', 'success');
    }).catch(err => {
        console.error('فشل نسخ النص:', err);
        showNotification('فشل نسخ النتيجة', 'error');
    });
}

// تهيئة الأصوات
function initializeSounds() {
    // إنشاء أصوات افتراضية باستخدام Web Audio API
    if (AppState.audioContext) {
        AppState.sounds.correct = createBeepSound(800, 0.3);
        AppState.sounds.wrong = createBeepSound(300, 0.3);
        AppState.sounds.timeout = createBeepSound(200, 0.5);
    }
    
    // محاولة تحميل ملفات الصوت الحقيقية
    const soundFiles = {
        correct: 'sounds/correct.mp3',
        wrong: 'sounds/wrong.mp3',
        timeout: 'sounds/timeout.mp3'
    };
    
    Object.entries(soundFiles).forEach(([key, path]) => {
        const audio = new Audio();
        audio.src = path;
        audio.preload = 'auto';
        
        audio.addEventListener('canplaythrough', () => {
            AppState.sounds[key] = audio;
        });
        
        audio.addEventListener('error', () => {
            console.warn(`فشل تحميل ملف الصوت: ${path}`);
            // سيتم استخدام الصوت الافتراضي
        });
    });
}

// إنشاء صوت بيب افتراضي
function createBeepSound(frequency, duration) {
    return function() {
        if (!AppState.audioContext || !AppState.soundEnabled) return;
        
        const oscillator = AppState.audioContext.createOscillator();
        const gainNode = AppState.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(AppState.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, AppState.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, AppState.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, AppState.audioContext.currentTime + duration);
        
        oscillator.start(AppState.audioContext.currentTime);
        oscillator.stop(AppState.audioContext.currentTime + duration);
    };
}

// تشغيل الصوت
function playSound(type) {
    if (!AppState.soundEnabled) return;
    
    const sound = AppState.sounds[type];
    if (sound) {
        if (typeof sound === 'function') {
            sound(); // الصوت الافتراضي
        } else {
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.warn(`فشل تشغيل الصوت ${type}:`, e);
            });
        }
    }
}

// تبديل اللغة
function toggleLanguage() {
    AppState.language = AppState.language === 'ar' ? 'en' : 'ar';
    document.documentElement.dir = AppState.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = AppState.language;
    
    // تحديث نص زر التبديل
    document.querySelector('.lang-text').textContent = AppState.language === 'ar' ? 'EN' : 'AR';
    
    // في تطبيق حقيقي، هنا سيتم تحديث جميع النصوص في الواجهة
    showNotification(`تم التبديل إلى ${AppState.language === 'ar' ? 'العربية' : 'English'}`, 'info');
}

// تبديل الصوت
function toggleSound() {
    AppState.soundEnabled = !AppState.soundEnabled;
    const soundIcon = document.querySelector('#sound-toggle i');
    
    if (AppState.soundEnabled) {
        soundIcon.className = 'fas fa-volume-up';
        showNotification('تم تشغيل الصوت', 'success');
    } else {
        soundIcon.className = 'fas fa-volume-mute';
        showNotification('تم كتم الصوت', 'info');
    }
}

// التعامل مع ضغطات المفاتيح
function handleKeyPress(event) {
    if (AppState.currentScreen === 'quiz-screen') {
        // مفاتيح الإجابة (1-4)
        if (event.key >= '1' && event.key <= '4') {
            const keyIndex = parseInt(event.key) - 1;
            const optionButtons = document.querySelectorAll('.option-btn');
            if (optionButtons[keyIndex] && !optionButtons[keyIndex].classList.contains('disabled')) {
                const selectedKey = optionButtons[keyIndex].getAttribute('data-key');
                selectAnswer(selectedKey);
            }
        }
        
        // مفتاح المسافة أو Enter للتخطي
        if (event.key === ' ' || event.key === 'Enter') {
            handleSkipQuestion();
        }
        
        // مفتاح Esc للعودة
        if (event.key === 'Escape') {
            showScreen('category-screen');
        }
    }
    
    // مفتاح S لبدء التحدي من الشاشة الرئيسية
    if (AppState.currentScreen === 'start-screen' && event.key.toLowerCase() === 's') {
        showScreen('category-screen');
    }
}

// التعامل مع تخطي السؤال
function handleSkipQuestion() {
    if (AppState.currentQuiz.timer) {
        clearInterval(AppState.currentQuiz.timer);
        AppState.currentQuiz.timer = null;
    }
    
    // تسجيل الإجابة كخاطئة
    const currentQuestion = AppState.currentQuiz.questions[AppState.currentQuiz.currentQuestionIndex];
    AppState.currentQuiz.selectedOptions.push({
        questionId: currentQuestion.id,
        selectedKey: null,
        correctKey: currentQuestion.answer,
        isCorrect: false,
        timeTaken: APP_CONFIG.DEFAULT_TIMER - AppState.currentQuiz.timeRemaining
    });
    
    // الانتقال للسؤال التالي
    nextQuestion();
}

// عرض شاشة محددة
function showScreen(screenId) {
    // إخفاء جميع الشاشات
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // إظهار الشاشة المطلوبة
    document.getElementById(screenId).classList.add('active');
    AppState.currentScreen = screenId;
    
    // إيقاف أي مؤقت نشط عند مغادرة شاشة الاختبار
    if (screenId !== 'quiz-screen' && AppState.currentQuiz.timer) {
        clearInterval(AppState.currentQuiz.timer);
        AppState.currentQuiz.timer = null;
    }
}

// عرض الإشعارات
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    if (!notification || !notificationText) return;
    
    // تعيين النص واللون بناءً على النوع
    notificationText.textContent = message;
    notification.className = 'notification';
    
    switch (type) {
        case 'success':
            notification.style.borderLeftColor = 'var(--success-color)';
            break;
        case 'error':
            notification.style.borderLeftColor = 'var(--error-color)';
            break;
        case 'warning':
            notification.style.borderLeftColor = 'var(--warning-color)';
            break;
        default:
            notification.style.borderLeftColor = 'var(--info-color)';
    }
    
    // إظهار الإشعار
    notification.classList.remove('hidden');
    
    // إخفاء الإشعار بعد 3 ثوانٍ
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// تصدير جلسة اللعب (للاستخدام المستقبلي)
function exportSession() {
    const sessionData = {
        quiz: AppState.currentQuiz,
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(sessionData);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `GeoReady_session_${new Date().getTime()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// استيراد جلسة لعب (للاستخدام المستقبلي)
function importSession(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const sessionData = JSON.parse(e.target.result);
            // استعادة حالة التطبيق من البيانات المستوردة
            AppState.currentQuiz = sessionData.quiz;
            showNotification('تم استيراد الجلسة بنجاح', 'success');
        } catch (error) {
            console.error('خطأ في استيراد الجلسة:', error);
            showNotification('فشل استيراد الجلسة', 'error');
        }
    };
    
    reader.readAsText(file);
}

// إضافة تأثيرات جزيئية للخلفية (تحسين إضافي)
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.position = 'fixed';
    particlesContainer.style.top = '0';
    particlesContainer.style.left = '0';
    particlesContainer.style.width = '100%';
    particlesContainer.style.height = '100%';
    particlesContainer.style.pointerEvents = 'none';
    particlesContainer.style.zIndex = '-1';
    
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
        particle.style.position = 'absolute';
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.top = `${Math.random() * 100}vh`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        particlesContainer.appendChild(particle);
    }
}

// تهيئة الجزيئات عند تحميل الصفحة
createParticles();