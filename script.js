// =================================================================
// 1. تهيئة الجزيئيات
// =================================================================
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#2c7873" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#2c7873",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
}

// =================================================================
// 2. تحديد العناصر الأساسية وحالة اللعبة
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
const progressPercentage = document.getElementById('progress-percentage');
const quizTitle = document.getElementById('quiz-title');
const scoreDisplay = document.getElementById('score-display');
const questionNumber = document.getElementById('question-number');
const questionCounter = document.getElementById('question-counter');
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

// الإحصائيات العامة
const totalQuizzes = document.getElementById('total-quizzes');
const averageScore = document.getElementById('average-score');
const totalPoints = document.getElementById('total-points');

// الإعدادات
const settingsBtn = document.getElementById('settings-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const backFromSettings = document.getElementById('back-from-settings');
const saveSettings = document.getElementById('save-settings');
const musicVolume = document.getElementById('music-volume');
const soundVolume = document.getElementById('sound-volume');
const musicVolumeValue = document.getElementById('music-volume-value');
const soundVolumeValue = document.getElementById('sound-volume-value');
const animationToggle = document.getElementById('animation-toggle');
const difficultySetting = document.getElementById('difficulty');

// السمات
const themeButtons = document.querySelectorAll('.theme-btn');

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
        difficulty: 'medium',
        theme: 'default'
    }
};

// =================================================================
// 3. تهيئة التطبيق
// =================================================================

document.addEventListener('DOMContentLoaded', function() {
    // تهيئة الجزيئيات
    initParticles();
    
    // تحميل بيانات المستخدم من localStorage
    loadUserData();
    
    // تهيئة إعدادات الصوت
    initAudioSettings();
    
    // تطبيق السمة
    applyTheme(userData.settings.theme);
    
    // تحديث واجهة المستخدم
    updateUI();
    
    // إخفاء شاشة التحميل بشكل صحيح
    loadingScreen.style.display = 'none';
    
    // إضافة تأثيرات للبطاقات
    animateElements();
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
    
    // تحديث أزرار السمات
    updateThemeButtons();
    
    // تشغيل الموسيقى الخلفية
    playBackgroundMusic();
}

/**
 * تطبيق السمة المختارة
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    userData.settings.theme = theme;
}

/**
 * تحديث أزرار السمات
 */
function updateThemeButtons() {
    themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === userData.settings.theme) {
            btn.classList.add('active');
        }
    });
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
 * إضافة تأثيرات للعناصر
 */
function animateElements() {
    // تأثيرات للبطاقات
    const cards = document.querySelectorAll('.category-card, .stat-item');
    cards.forEach((card, index) => {
        if (userData.settings.animations) {
            card.style.animationDelay = `${index * 0.1}s`;
            card.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }
    });
}

// =================================================================
// 4. دوال التحويل بين الشاشات
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
    
    // إضافة تأثيرات للشاشة الجديدة
    if (userData.settings.animations) {
        const targetScreen = document.getElementById(targetId);
        targetScreen.style.animation = 'fadeInUp 0.6s ease-out';
    }
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
// 5. نظام الصوتيات
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
// 6. دالة بدء الاختبار
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
    const difficultyMap = {
        'easy': 0.6,   // 60% من الأسئلة (الأسهل)
        'medium': 0.8, // 80% من الأسئلة
        'hard': 1      // 100% من الأسئلة (الأصعب)
    };
    
    const count = Math.floor(questions.length * difficultyMap[difficulty]);
    return questions.slice(0, count);
}

// =================================================================
// 7. دالة عرض السؤال
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
    hintBtn.style.display = 'block'; // إظهار زر التلميح
    hintBtn.disabled = false;

    // تحديث شريط التقدم والإحصائيات
    currentQIndexDisplay.textContent = currentQuestionIndex + 1;
    questionNumber.textContent = currentQuestionIndex + 1;
    questionCounter.textContent = `السؤال ${currentQuestionIndex + 1} من ${currentQuizData.length}`;
    updateProgressBar();
    
    // تحديث مستوى صعوبة السؤال
    updateQuestionDifficulty(question.difficulty);
    
    // إنشاء أزرار الخيارات
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-btn');
        
        // إضافة تأثيرات للخيارات
        if (userData.settings.animations) {
            button.style.animationDelay = `${index * 0.1}s`;
            button.style.animation = 'fadeInUp 0.5s ease-out forwards';
        }
        
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
    const difficultyElement = document.getElementById('question-difficulty');
    if (difficulty) {
        difficultyElement.innerHTML = `<i class="fas fa-signal"></i><span>${getDifficultyText(difficulty)}</span>`;
        difficultyElement.className = 'question-difficulty ' + difficulty;
        difficultyElement.style.display = 'flex';
    } else {
        difficultyElement.style.display = 'none';
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
// 8. دالة معالجة الإجابة - مصححة
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
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
    });

    if (isCorrect) {
        score++;
        scoreDisplay.textContent = score;
        
        // إضافة الكلاس الصحيح فقط للزر المحدد
        selectedButton.classList.add('correct');
        playSound(correctSound);
        
        // تأثير مرئي للإجابة الصحيحة
        if (userData.settings.animations) {
            selectedButton.style.animation = 'pulseCorrect 0.6s ease';
        }
    } else {
        // إضافة الكلاس الخاطئ للزر المحدد
        selectedButton.classList.add('incorrect');
        playSound(incorrectSound);
        
        // تأثير مرئي للإجابة الخاطئة
        if (userData.settings.animations) {
            selectedButton.style.animation = 'shake 0.5s ease';
        }
        
        // تمييز الإجابة الصحيحة - إصلاح المشكلة هنا
        Array.from(optionsContainer.children).forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct'); // إضافة correct فقط
            }
        });
    }

    nextBtn.disabled = false; // تفعيل زر التالي
}

// =================================================================
// 9. دالة المضي إلى السؤال التالي
// =================================================================

function nextQuestion() {
    playClickSound();
    currentQuestionIndex++;
    displayQuestion();
}

// =================================================================
// 10. دالة عرض النتائج
// =================================================================

function showResults() {
    clearInterval(timerInterval); // إوقف المؤقت
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
    
    // إنشاء تأثيرات الكونفيتي
    createConfetti();
    
    switchScreen('results-screen');
}

/**
 * إنشاء تأثير الكونفيتي
 */
function createConfetti() {
    const confettiContainer = document.querySelector('.confetti');
    if (!confettiContainer) return;
    
    confettiContainer.innerHTML = '';
    const colors = ['#2c7873', '#ffb74d', '#10b981', '#3b82f6', '#8b5cf6'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 5 + 's';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = Math.random() * 10 + 5 + 'px';
        confettiContainer.appendChild(confetti);
    }
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

// =================================================================
// 11. دوال الأدوات الإضافية (المؤقت، التقدم)
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
    progressPercentage.textContent = `${Math.round(progress)}%`;
}

// =================================================================
// 12. الاستماع للأحداث (EventListeners)
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
    const message = `🎯 حصلت على ${percentage} في اختبار ${category} على منصة الجيولوجي المحترف!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'نتيجة اختبار الجيولوجيا',
            text: message,
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
            fallbackShare(message);
        });
    } else {
        fallbackShare(message);
    }
});

/**
 * طريقة بديلة للمشاركة إذا لم يكن Web Share API مدعوماً
 */
function fallbackShare(message) {
    navigator.clipboard.writeText(message).then(() => {
        alert('✅ تم نسخ النتيجة إلى الحافظة! يمكنك مشاركتها الآن.');
    }).catch(err => {
        console.log('Failed to copy: ', err);
        alert(`📋 يمكنك مشاركة نتيجتك يدوياً:\n\n${message}`);
    });
}

// 7. إعدادات الصوت
musicToggle.addEventListener('click', () => {
    playClickSound();
    if (backgroundMusic.paused) {
        playBackgroundMusic();
        musicToggle.classList.remove('muted');
        musicToggle.innerHTML = '<i class="fas fa-music"></i><span class="sound-tooltip">الموسيقى</span>';
    } else {
        pauseBackgroundMusic();
        musicToggle.classList.add('muted');
        musicToggle.innerHTML = '<i class="fas fa-music-slash"></i><span class="sound-tooltip">الموسيقى</span>';
    }
});

soundToggle.addEventListener('click', () => {
    playClickSound();
    if (userData.settings.soundVolume > 0) {
        userData.settings.soundVolume = 0;
        soundToggle.classList.add('muted');
        soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i><span class="sound-tooltip">المؤثرات</span>';
    } else {
        userData.settings.soundVolume = 70;
        soundToggle.classList.remove('muted');
        soundToggle.innerHTML = '<i class="fas fa-volume-up"></i><span class="sound-tooltip">المؤثرات</span>';
    }
    
    // تحديث مستوى الصوت
    initAudioSettings();
    saveUserData();
});

// 8. شاشة الإعدادات
settingsBtn.addEventListener('click', () => {
    playClickSound();
    switchScreen('settings-screen');
});

leaderboardBtn.addEventListener('click', () => {
    playClickSound();
    alert('🚧 هذه الميزة قيد التطوير!');
});

backFromSettings.addEventListener('click', () => {
    playClickSound();
    switchScreen('home-screen');
});

saveSettings.addEventListener('click', () => {
    playClickSound();
    
    // حفظ الإعدادات
    userData.settings.musicVolume = parseInt(musicVolume.value);
    userData.settings.soundVolume = parseInt(soundVolume.value);
    userData.settings.animations = animationToggle.checked;
    userData.settings.difficulty = difficultySetting.value;
    
    // تطبيق الإعدادات
    initAudioSettings();
    saveUserData();
    
    // إظهار رسالة نجاح
    showNotification('تم حفظ الإعدادات بنجاح!', 'success');
    setTimeout(() => switchScreen('home-screen'), 1000);
});

/**
 * عرض إشعار
 */
function showNotification(message, type = 'info') {
    // يمكن تطوير هذه الدالة لعرض إشعارات جميلة
    alert(message);
}

// 9. تحديث قيم عناصر التحكم في الوقت الحقيقي
musicVolume.addEventListener('input', () => {
    musicVolumeValue.textContent = `${musicVolume.value}%`;
    backgroundMusic.volume = musicVolume.value / 100;
    userData.settings.musicVolume = parseInt(musicVolume.value);
});

soundVolume.addEventListener('input', () => {
    soundVolumeValue.textContent = `${soundVolume.value}%`;
    const volume = soundVolume.value / 100;
    correctSound.volume = volume;
    incorrectSound.volume = volume;
    clickSound.volume = volume;
    pageSound.volume = volume;
    completeSound.volume = volume;
    userData.settings.soundVolume = parseInt(soundVolume.value);
});

// 10. منتقي السمات
themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        playClickSound();
        const theme = btn.getAttribute('data-theme');
        applyTheme(theme);
        updateThemeButtons();
        userData.settings.theme = theme;
        saveUserData();
    });
});

// 11. إضافة أصوات النقر لجميع الأزرار
document.querySelectorAll('button').forEach(button => {
    if (!button.id.includes('music-toggle') && !button.id.includes('sound-toggle')) {
        button.addEventListener('click', () => {
            playClickSound();
        });
    }
});

// 12. تحسين تجربة المستخدم على الهواتف
document.addEventListener('touchstart', function() {}, {passive: true});

// منع التكبير على الهواتف عند النقر المزدوج
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);