// =================================================================
// 1. تحديد العناصر الأساسية وحالة اللعبة
// =================================================================
const homeScreen = document.getElementById('home-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const loadingScreen = document.getElementById('loading-screen');
const settingsScreen = document.getElementById('settings-screen');

const categoryCards = document.querySelectorAll('.category-card');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');
const hintBtn = document.getElementById('hint-btn');
const hintContainer = document.getElementById('hint-container');
const hintText = document.getElementById('hint-text');

// الإحصائيات والمؤقت
const timerDisplay = document.getElementById('timer-display');
const currentQIndexDisplay = document.getElementById('current-question-index');
const totalQDisplay = document.getElementById('total-questions');
const progressBarFill = document.getElementById('progress-bar-fill');
const quizTitle = document.getElementById('quiz-title');
const scoreDisplay = document.getElementById('score-display');
const questionNumber = document.getElementById('question-number');
const questionDifficulty = document.getElementById('question-difficulty');

// النتائج
const resultCategory = document.getElementById('result-category');
const scoreCorrect = document.getElementById('score-correct');
const scorePercentage = document.getElementById('score-percentage');
const resultMessage = document.getElementById('result-message');
const resultTitle = document.getElementById('result-title');
const resultTime = document.getElementById('result-time');
const resultPoints = document.getElementById('result-points');
const circleFill = document.getElementById('circle-fill');
const homeBtn = document.getElementById('home-btn');
const retryBtn = document.getElementById('retry-btn');
const shareBtn = document.getElementById('share-btn');
const achievementsEarned = document.getElementById('achievements-earned');
const achievementsList = document.querySelector('.achievements-list');

// الإحصائيات العامة
const totalQuizzes = document.getElementById('total-quizzes');
const averageScore = document.getElementById('average-score');
const totalPoints = document.getElementById('total-points');

// الإعدادات
const settingsBtn = document.getElementById('settings-btn');
const backFromSettings = document.getElementById('back-from-settings');
const saveSettings = document.getElementById('save-settings');
const musicVolume = document.getElementById('music-volume');
const soundVolume = document.getElementById('sound-volume');
const musicVolumeValue = document.getElementById('music-volume-value');
const soundVolumeValue = document.getElementById('sound-volume-value');
const animationToggle = document.getElementById('animation-toggle');
const difficultySetting = document.getElementById('difficulty');

// تحكم الصوت
const musicToggle = document.getElementById('music-toggle');
const soundToggle = document.getElementById('sound-toggle');

// ملفات الصوت
const correctSound = document.getElementById('correctSound');
const incorrectSound = document.getElementById('incorrectSound');
const clickSound = document.getElementById('clickSound');
const pageSound = document.getElementById('pageSound');
const completeSound = document.getElementById('completeSound');
const backgroundMusic = document.getElementById('backgroundMusic');

let currentQuizData = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeElapsed = 0;
let selectedCategory = '';
let userData = {
    totalQuizzes: 0,
    totalPoints: 0,
    averageScore: 0,
    categoryProgress: {},
    settings: {
        musicVolume: 50,
        soundVolume: 70,
        animations: true,
        difficulty: 'medium'
    }
};

// =================================================================
// 2. تهيئة التطبيق
// =================================================================

document.addEventListener('DOMContentLoaded', function() {
    // تحميل بيانات المستخدم من localStorage
    loadUserData();
    
    // تهيئة إعدادات الصوت
    initAudioSettings();
    
    // تحديث واجهة المستخدم
    updateUI();
    
    // إضافة تأثيرات الظهور للبطاقات
    animateCategoryCards();
});

/**
 * تحميل بيانات المستخدم من localStorage
 */
function loadUserData() {
    const savedData = localStorage.getItem('geologyQuizUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
}

/**
 * حفظ بيانات المستخدم في localStorage
 */
function saveUserData() {
    localStorage.setItem('geologyQuizUserData', JSON.stringify(userData));
}

/**
 * تهيئة إعدادات الصوت
 */
function initAudioSettings() {
    // تعيين مستويات الصوت
    backgroundMusic.volume = userData.settings.musicVolume / 100;
    correctSound.volume = userData.settings.soundVolume / 100;
    incorrectSound.volume = userData.settings.soundVolume / 100;
    clickSound.volume = userData.settings.soundVolume / 100;
    pageSound.volume = userData.settings.soundVolume / 100;
    completeSound.volume = userData.settings.soundVolume / 100;
    
    // تعيين قيم عناصر التحكم
    musicVolume.value = userData.settings.musicVolume;
    soundVolume.value = userData.settings.soundVolume;
    musicVolumeValue.textContent = `${userData.settings.musicVolume}%`;
    soundVolumeValue.textContent = `${userData.settings.soundVolume}%`;
    
    // تعيين التبديلات
    animationToggle.checked = userData.settings.animations;
    difficultySetting.value = userData.settings.difficulty;
    
    // تشغيل الموسيقى الخلفية
    playBackgroundMusic();
}

/**
 * تحديث واجهة المستخدم بناءً على بيانات المستخدم
 */
function updateUI() {
    // تحديث الإحصائيات العامة
    totalQuizzes.textContent = userData.totalQuizzes;
    averageScore.textContent = `${userData.averageScore}%`;
    totalPoints.textContent = userData.totalPoints;
    
    // تحديث تقدم الفئات
    categoryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const progressFill = card.querySelector('.progress-fill');
        const progressText = card.querySelector('.progress-text');
        
        const progress = userData.categoryProgress[category] || 0;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
    });
}

/**
 * إضافة تأثيرات الظهور لبطاقات الفئات
 */
function animateCategoryCards() {
    const cards = document.querySelectorAll('.category-card');
    cards.forEach((card, index) => {
        if (userData.settings.animations) {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in-up');
        }
    });
}

// =================================================================
// 3. دوال التحويل بين الشاشات
// =================================================================

/**
 * تبديل الشاشة النشطة
 * @param {string} targetId - معرف الشاشة الهدف
 */
function switchScreen(targetId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(targetId).classList.add('active');
    
    // تشغيل صوت الانتقال بين الصفحات
    playSound(pageSound);
}

/**
 * إظهار شاشة التحميل
 */
function showLoadingScreen() {
    switchScreen('loading-screen');
    
    // محاكاة شريط التقدم
    const loadingProgress = document.querySelector('.loading-progress');
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width += Math.random() * 15;
            if (width > 100) width = 100;
            loadingProgress.style.width = `${width}%`;
        }
    }, 200);
}

// =================================================================
// 4. نظام الصوتيات
// =================================================================

/**
 * تشغيل الموسيقى الخلفية
 */
function playBackgroundMusic() {
    if (userData.settings.musicVolume > 0) {
        backgroundMusic.play().catch(e => {
            console.log("تعذر تشغيل الموسيقى الخلفية:", e);
        });
    }
}

/**
 * إيقاف الموسيقى الخلفية
 */
function pauseBackgroundMusic() {
    backgroundMusic.pause();
}

/**
 * تشغيل صوت معين
 * @param {HTMLAudioElement} audioElement - عنصر الصوت المراد تشغيله
 */
function playSound(audioElement) {
    if (userData.settings.soundVolume > 0) {
        try {
            audioElement.currentTime = 0;
            audioElement.play().catch(e => {
                console.log("تعذر تشغيل الصوت:", e);
            });
        } catch (error) {
            console.log("خطأ في تشغيل الصوت:", error);
        }
    }
}

/**
 * تشغيل صوت النقر
 */
function playClickSound() {
    playSound(clickSound);
}

// =================================================================
// 5. دالة بدء الاختبار
// =================================================================

/**
 * يبدأ الاختبار بناءً على الفئة المختارة (اسم ملف JSON)
 * @param {string} filename - اسم ملف JSON (مثل 'Basic Geology.json')
 * @param {string} categoryName - اسم الفئة للعرض
 */
async function startQuiz(filename, categoryName) {
    try {
        showLoadingScreen();
        selectedCategory = filename;
        
        // تحميل ملف الأسئلة
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        let questions = await response.json();
        
        // تصفية الأسئلة حسب مستوى الصعوبة
        if (userData.settings.difficulty !== 'medium') {
            questions = filterQuestionsByDifficulty(questions, userData.settings.difficulty);
        }
        
        currentQuizData = questions;

        // إعداد حالة الاختبار
        currentQuestionIndex = 0;
        score = 0;
        timeElapsed = 0;
        
        quizTitle.textContent = categoryName;
        totalQDisplay.textContent = currentQuizData.length;
        scoreDisplay.textContent = '0';

        // بدء المؤقت وعرض السؤال الأول
        startTimer();
        switchScreen('quiz-screen');
        displayQuestion();

    } catch (error) {
        console.error('Error starting quiz:', error);
        alert('حدث خطأ في تحميل الأسئلة. تأكد من وجود ملف JSON الصحيح.');
        switchScreen('home-screen');
    }
}

/**
 * تصفية الأسئلة حسب مستوى الصعوبة
 * @param {Array} questions - مصفوفة الأسئلة
 * @param {string} difficulty - مستوى الصعوبة (easy, medium, hard)
 * @returns {Array} - الأسئلة المصفاة
 */
function filterQuestionsByDifficulty(questions, difficulty) {
    // هذا مثال بسيط - يمكنك تطويره بناءً على هيكل بياناتك
    const difficultyMap = {
        'easy': 0.3,   // 30% من الأسئلة
        'medium': 0.6, // 60% من الأسئلة
        'hard': 0.9    // 90% من الأسئلة
    };
    
    const count = Math.floor(questions.length * difficultyMap[difficulty]);
    return questions.slice(0, count);
}

// =================================================================
// 6. دالة عرض السؤال
// =================================================================

function displayQuestion() {
    // التأكد من وجود أسئلة
    if (currentQuestionIndex >= currentQuizData.length) {
        showResults();
        return;
    }

    const question = currentQuizData[currentQuestionIndex];
    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';
    nextBtn.disabled = true; // تعطيل زر التالي حتى تتم الإجابة
    hintContainer.classList.remove('show'); // إخفاء التلميح

    // تحديث شريط التقدم والإحصائيات
    currentQIndexDisplay.textContent = currentQuestionIndex + 1;
    questionNumber.textContent = currentQuestionIndex + 1;
    updateProgressBar();
    
    // تحديث مستوى صعوبة السؤال
    updateQuestionDifficulty(question.difficulty);
    
    // إنشاء أزرار الخيارات
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-btn');
        button.onclick = () => handleAnswer(button, option, question.answer);
        optionsContainer.appendChild(button);
    });
    
    // إعداد التلميح إذا كان متوفراً
    setupHint(question.hint);
}

/**
 * تحديث عرض مستوى صعوبة السؤال
 * @param {string} difficulty - مستوى الصعوبة
 */
function updateQuestionDifficulty(difficulty) {
    if (difficulty) {
        questionDifficulty.textContent = getDifficultyText(difficulty);
        questionDifficulty.className = 'question-difficulty ' + difficulty;
        questionDifficulty.style.display = 'inline-block';
    } else {
        questionDifficulty.style.display = 'none';
    }
}

/**
 * الحصول على النص المعروض لمستوى الصعوبة
 * @param {string} difficulty - مستوى الصعوبة
 * @returns {string} - النص المعروض
 */
function getDifficultyText(difficulty) {
    const difficultyMap = {
        'easy': 'سهل',
        'medium': 'متوسط',
        'hard': 'صعب'
    };
    return difficultyMap[difficulty] || 'متوسط';
}

/**
 * إعداد التلميح للسؤال الحالي
 * @param {string} hint - نص التلميح
 */
function setupHint(hint) {
    if (hint) {
        hintText.textContent = hint;
        hintBtn.onclick = () => {
            hintContainer.classList.add('show');
            hintBtn.disabled = true;
            playClickSound();
        };
    } else {
        hintBtn.style.display = 'none';
    }
}

// =================================================================
// 7. دالة معالجة الإجابة
// =================================================================

/**
 * معالجة الإجابة عند الضغط على زر الخيار
 * @param {HTMLElement} selectedButton - زر الخيار الذي تم الضغط عليه
 * @param {string} selectedOption - نص الخيار الذي تم اختياره
 * @param {string} correctAnswer - الإجابة الصحيحة
 */
function handleAnswer(selectedButton, selectedOption, correctAnswer) {
    const isCorrect = (selectedOption === correctAnswer);

    // تعطيل جميع الأزرار بعد الإجابة لمنع التغيير
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

    if (isCorrect) {
        score++;
        scoreDisplay.textContent = score;
        selectedButton.classList.add('correct');
        playSound(correctSound);
        
        // تأثير مرئي للإجابة الصحيحة
        if (userData.settings.animations) {
            selectedButton.style.animation = 'pulse 0.5s';
        }
    } else {
        selectedButton.classList.add('incorrect');
        playSound(incorrectSound);
        
        // تأثير مرئي للإجابة الخاطئة
        if (userData.settings.animations) {
            selectedButton.style.animation = 'shake 0.5s';
        }
        
        // تمييز الإجابة الصحيحة
        Array.from(optionsContainer.children).forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }

    nextBtn.disabled = false; // تفعيل زر التالي
}

// =================================================================
// 8. دالة المضي إلى السؤال التالي
// =================================================================

function nextQuestion() {
    playClickSound();
    currentQuestionIndex++;
    displayQuestion();
}

// =================================================================
// 9. دالة عرض النتائج
// =================================================================

function showResults() {
    clearInterval(timerInterval); // إيقاف المؤقت
    playSound(completeSound); // تشغيل صوت إكمال الاختبار

    const totalQuestions = currentQuizData.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // تحديث دائرة النتيجة
    circleFill.style.background = `conic-gradient(var(--primary-color) ${percentage}%, transparent ${percentage}%)`;
    
    // عرض النتائج
    resultCategory.textContent = quizTitle.textContent;
    scoreCorrect.textContent = `${score} من ${totalQuestions}`;
    scorePercentage.textContent = `${percentage}%`;
    
    // حساب الوقت المستغرق
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    resultTime.textContent = formattedTime;
    
    // حساب النقاط (النقاط = (الإجابات الصحيحة * 10) + مكافأة الوقت)
    const timeBonus = Math.max(0, 100 - timeElapsed);
    const points = score * 10 + timeBonus;
    resultPoints.textContent = points;
    
    // تحديث العناوين والرسائل بناءً على الأداء
    updateResultMessages(percentage);
    
    // تحديث بيانات المستخدم
    updateUserData(percentage, points);
    
    // عرض الإنجازات المكتسبة
    showEarnedAchievements(percentage);
    
    switchScreen('results-screen');
}

/**
 * تحديث الرسائل والعناوين بناءً على النتيجة
 * @param {number} percentage - النسبة المئوية للنتيجة
 */
function updateResultMessages(percentage) {
    if (percentage >= 95) {
        resultTitle.textContent = 'مستوى استثنائي! 🏆';
        resultMessage.textContent = 'أداء رائع! أنت خبير في هذا المجال الجيولوجي.';
    } else if (percentage >= 85) {
        resultTitle.textContent = 'مستوى ممتاز! 🌟';
        resultMessage.textContent = 'أداء متميز! أنت جاهز للانطلاق في المجال الجيولوجي.';
    } else if (percentage >= 75) {
        resultTitle.textContent = 'مستوى جيد جداً! 👍';
        resultMessage.textContent = 'معلوماتك قوية في هذا التخصص. استمر في التعلم!';
    } else if (percentage >= 60) {
        resultTitle.textContent = 'مستوى مقبول 💪';
        resultMessage.textContent = 'أداء جيد، لكن تحتاج لمراجعة بعض النقاط لتعزيز معلوماتك.';
    } else if (percentage >= 50) {
        resultTitle.textContent = 'مستوى تحت المتوسط 📚';
        resultMessage.textContent = 'تحتاج لمزيد من المراجعة والتدريب في هذا المجال.';
    } else {
        resultTitle.textContent = 'يحتاج تحسين 🎯';
        resultMessage.textContent = 'لا تستسلم! راجع المواد التعليمية وحاول مرة أخرى.';
    }
}

/**
 * تحديث بيانات المستخدم بعد الانتهاء من الاختبار
 * @param {number} percentage - النسبة المئوية للنتيجة
 * @param {number} points - النقاط المحصلة
 */
function updateUserData(percentage, points) {
    // تحديث الإحصائيات العامة
    userData.totalQuizzes++;
    userData.totalPoints += points;
    
    // تحديث متوسط النتائج
    const totalScore = userData.averageScore * (userData.totalQuizzes - 1) + percentage;
    userData.averageScore = Math.round(totalScore / userData.totalQuizzes);
    
    // تحديث تقدم الفئة
    if (!userData.categoryProgress[selectedCategory]) {
        userData.categoryProgress[selectedCategory] = 0;
    }
    userData.categoryProgress[selectedCategory] = Math.max(
        userData.categoryProgress[selectedCategory],
        percentage
    );
    
    // حفظ البيانات
    saveUserData();
    
    // تحديث واجهة المستخدم
    updateUI();
}

/**
 * عرض الإنجازات المكتسبة
 * @param {number} percentage - النسبة المئوية للنتيجة
 */
function showEarnedAchievements(percentage) {
    achievementsList.innerHTML = '';
    const earnedAchievements = [];
    
    // فحص الإنجازات المكتسبة
    if (percentage >= 90) {
        earnedAchievements.push({
            icon: 'fas fa-gem',
            tooltip: 'خبير الجيولوجيا - تحقيق 90% أو أكثر'
        });
    }
    
    if (percentage === 100) {
        earnedAchievements.push({
            icon: 'fas fa-crown',
            tooltip: 'الكمال - تحقيق 100% في الاختبار'
        });
    }
    
    if (timeElapsed < 60) {
        earnedAchievements.push({
            icon: 'fas fa-bolt',
            tooltip: 'سريع - إنهاء الاختبار في أقل من دقيقة'
        });
    }
    
    if (userData.totalQuizzes === 1) {
        earnedAchievements.push({
            icon: 'fas fa-star',
            tooltip: 'البداية - إكمال أول اختبار'
        });
    }
    
    // عرض الإنجازات المكتسبة
    if (earnedAchievements.length > 0) {
        achievementsEarned.style.display = 'block';
        earnedAchievements.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = 'achievement-badge';
            badge.innerHTML = `<i class="${achievement.icon}"></i>`;
            badge.setAttribute('data-tooltip', achievement.tooltip);
            achievementsList.appendChild(badge);
        });
    } else {
        achievementsEarned.style.display = 'none';
    }
}

// =================================================================
// 10. دوال الأدوات الإضافية (المؤقت، التقدم)
// =================================================================

function startTimer() {
    timeElapsed = 0;
    // تحديث المؤقت كل ثانية
    timerInterval = setInterval(() => {
        timeElapsed++;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        
        // تنسيق الوقت (00:00)
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerDisplay.textContent = formattedTime;
    }, 1000);
}

function updateProgressBar() {
    const total = currentQuizData.length;
    const progress = (currentQuestionIndex / total) * 100;
    progressBarFill.style.width = progress + '%';
}

// =================================================================
// 11. الاستماع للأحداث (EventListeners)
// =================================================================

// 1. اختيار الفئة
categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        playClickSound();
        const filename = card.getAttribute('data-category');
        const categoryName = card.querySelector('h3').textContent;
        startQuiz(filename, categoryName);
    });
});

// 2. زر السؤال التالي
nextBtn.addEventListener('click', nextQuestion);

// 3. زر العودة للرئيسية
backBtn.addEventListener('click', () => {
    playClickSound();
    if (confirm('هل تريد العودة إلى الصفحة الرئيسية؟ سيتم فقدان تقدمك الحالي.')) {
        clearInterval(timerInterval);
        switchScreen('home-screen');
    }
});

// 4. زر العودة للرئيسية من شاشة النتائج
homeBtn.addEventListener('click', () => {
    playClickSound();
    switchScreen('home-screen');
});

// 5. زر إعادة الاختبار
retryBtn.addEventListener('click', () => {
    playClickSound();
    const categoryName = quizTitle.textContent;
    startQuiz(selectedCategory, categoryName);
});

// 6. زر مشاركة النتيجة
shareBtn.addEventListener('click', () => {
    playClickSound();
    const percentage = scorePercentage.textContent;
    const category = resultCategory.textContent;
    const message = `لقد حصلت على ${percentage} في اختبار ${category} على منصة الجيولوجي المحترف!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'نتيجة اختبار الجيولوجيا',
            text: message,
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
            fall