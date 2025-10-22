// ====== نظام الصوت المحسن ======
class SoundSystem {
    constructor() {
        this.sounds = {
            correct: document.getElementById('sound-correct'),
            wrong: document.getElementById('sound-wrong'),
            click: document.getElementById('sound-click'),
            timeup: document.getElementById('sound-timeup'),
            finish: document.getElementById('sound-finish'),
            levelup: document.getElementById('sound-levelup')
        };
        this.volume = 0.7;
        this.enabled = true;
    }

    play(soundName) {
        if (!this.enabled) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            sound.volume = this.volume;
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.log('Sound play failed:', e);
            });
        }
    }

    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// ====== نظام الرسوم المتحركة ======
class AnimationSystem {
    static fadeIn(element, duration = 500) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity.toString();
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    static slideIn(element, from = 'right', duration = 500) {
        const transformMap = {
            'right': 'translateX(100%)',
            'left': 'translateX(-100%)',
            'top': 'translateY(-100%)',
            'bottom': 'translateY(100%)'
        };

        element.style.transform = transformMap[from];
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            
            element.style.transform = `translateX(${(1 - percentage) * 100}%)`;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.transform = 'translateX(0)';
            }
        };
        
        requestAnimationFrame(animate);
    }

    static pulse(element, scale = 1.1, duration = 300) {
        const originalTransform = element.style.transform;
        
        element.style.transform = `${originalTransform} scale(${scale})`;
        element.style.transition = `transform ${duration}ms ease-in-out`;
        
        setTimeout(() => {
            element.style.transform = originalTransform;
        }, duration);
    }
}

// ====== نظام الإنجازات ======
class AchievementSystem {
    constructor() {
        this.achievements = new Map();
        this.unlocked = new Set();
    }

    addAchievement(id, name, description, condition) {
        this.achievements.set(id, { name, description, condition });
    }

    checkAchievements(gameState) {
        const newAchievements = [];
        
        for (const [id, achievement] of this.achievements) {
            if (!this.unlocked.has(id) && achievement.condition(gameState)) {
                this.unlocked.add(id);
                newAchievements.push(achievement);
            }
        }
        
        return newAchievements;
    }

    showAchievement(achievement) {
        // تنفيذ عرض الإنجاز للمستخدم
        console.log(`إنجاز مفتوح: ${achievement.name} - ${achievement.description}`);
    }
}

// ====== المتغيرات الرئيسية ======
const soundSystem = new SoundSystem();
const achievementSystem = new AchievementSystem();

let allSectionsData = [];
let currentSectionQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeLeft = 20;
let quizStartTime = 0;
let userAnswers = [];
let currentSection = null;

// ====== عناصر DOM ======
const DOM = {
    // الشاشات
    screens: {
        welcome: document.getElementById('welcome-screen'),
        quiz: document.getElementById('quiz-screen'),
        results: document.getElementById('final-results-screen'),
        menu: document.getElementById('sections-menu')
    },

    // الأزرار الرئيسية
    elements: {
        startBtn: document.getElementById('start-button'),
        menuToggle: document.getElementById('menu-toggle'),
        closeMenuBtn: document.getElementById('close-menu-btn'),
        backButton: document.getElementById('back-button'),
        sectionsGrid: document.getElementById('sections-grid'),
        nextButton: document.getElementById('next-question-btn'),
        restartBtn: document.getElementById('restart-btn'),
        shareBtn: document.getElementById('share-btn')
    },

    // عناصر الاختبار
    quiz: {
        progress: document.getElementById('quiz-progress'),
        progressText: document.getElementById('progress-text'),
        timer: document.getElementById('timer'),
        timerFill: document.querySelector('.timer-fill'),
        timerCircle: document.querySelector('.timer-circle'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        feedback: document.getElementById('feedback-message')
    },

    // عناصر النتائج
    results: {
        finalScore: document.getElementById('final-score-display'),
        correctAnswers: document.getElementById('correct-answers'),
        timeSpent: document.getElementById('time-spent-display'),
        performanceLevel: document.getElementById('performance-level'),
        achievementTitle: document.getElementById('achievement-title'),
        achievementMessage: document.getElementById('achievement-message')
    }
};

// ====== تهيئة الإنجازات ======
function initializeAchievements() {
    achievementSystem.addAchievement(
        'first_win',
        'الفائز الأول',
        'أكمل أول اختبار بنجاح',
        (state) => state.quizzesCompleted > 0
    );

    achievementSystem.addAchievement(
        'perfectionist',
        'المثالي',
        'احصل على 100% في أحد الاختبارات',
        (state) => state.perfectScores > 0
    );

    achievementSystem.addAchievement(
        'speed_demon',
        'سريع كالبرق',
        'أكمل اختباراً في أقل من دقيقة',
        (state) => state.fastestTime < 60
    );
}

// ====== دوال المساعدة ======
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function switchScreen(targetScreen) {
    // إخفاء جميع الشاشات
    Object.values(DOM.screens).forEach(screen => {
        screen.classList.remove('active');
    });

    // إظهار الشاشة المطلوبة
    targetScreen.classList.add('active');

    // إغلاق القائمة الجانبية
    DOM.screens.menu.classList.remove('open');

    // التحكم في ظهور زر الرجوع
    DOM.elements.backButton.style.display = 
        targetScreen === DOM.screens.welcome ? 'none' : 'flex';
}

function updateProgressBar(percentage) {
    DOM.quiz.progress.style.width = `${percentage}%`;
}

function updateTimerCircle(percentage) {
    const circumference = 226; // 2 * π * 36
    const offset = circumference - (percentage * circumference);
    DOM.quiz.timerFill.style.strokeDashoffset = offset;
}

// ====== نظام المؤقت ======
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 20;
    
    // تحديث واجهة المؤقت
    DOM.quiz.timer.textContent = timeLeft;
    updateTimerCircle(1);
    DOM.quiz.timerCircle.classList.remove('timer-danger', 'timer-warning');

    timerInterval = setInterval(() => {
        timeLeft--;
        
        // تحديث الواجهة
        DOM.quiz.timer.textContent = timeLeft;
        updateTimerCircle(timeLeft / 20);

        // تغيير اللون عند انخفاض الوقت
        if (timeLeft <= 5) {
            DOM.quiz.timerCircle.classList.add('timer-danger');
        } else if (timeLeft <= 10) {
            DOM.quiz.timerCircle.classList.add('timer-warning');
        }

        // انتهاء الوقت
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeUp();
        }
    }, 1000);
}

function handleTimeUp() {
    soundSystem.play('timeup');
    checkAnswer(-1); // -1 يعني انتهاء الوقت
}

// ====== إدارة القائمة الجانبية ======
function toggleMenu() {
    soundSystem.play('click');
    DOM.screens.menu.classList.toggle('open');
}

function renderSectionsMenu() {
    DOM.elements.sectionsGrid.innerHTML = '';
    
    allSectionsData.forEach((section, index) => {
        const button = document.createElement('button');
        button.className = 'sidebar-item';
        button.textContent = section.section.split(':')[1] || section.section;
        button.onclick = () => {
            startQuiz(index);
            toggleMenu();
        };
        DOM.elements.sectionsGrid.appendChild(button);
    });
}

// ====== نظام الاختبار ======
function startQuiz(sectionIndex) {
    soundSystem.play('click');
    
    const selectedSection = allSectionsData[sectionIndex];
    currentSection = selectedSection;
    currentSectionQuestions = selectedSection.questions;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    quizStartTime = Date.now();
    
    switchScreen(DOM.screens.quiz);
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= currentSectionQuestions.length) {
        showResults();
        return;
    }

    // إعادة تعيين حالة الزر
    DOM.elements.nextButton.disabled = true;
    DOM.elements.nextButton.innerHTML = `
        <span class="button-text">تأكيد الإجابة</span>
        <span class="button-icon"><i class="fas fa-lock"></i></span>
    `;

    // تحديث شريط التقدم
    const progress = ((currentQuestionIndex) / currentSectionQuestions.length) * 100;
    updateProgressBar(progress);
    DOM.quiz.progressText.textContent = `${currentQuestionIndex + 1}/${currentSectionQuestions.length}`;

    // إخفاء رسالة التغذية الراجعة
    DOM.quiz.feedback.style.display = 'none';

    // الحصول على السؤال الحالي
    const question = currentSectionQuestions[currentQuestionIndex];
    DOM.quiz.questionText.textContent = question.question;

    // إنشاء الخيارات
    DOM.quiz.optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const label = document.createElement('label');
        label.className = 'option-label';
        label.innerHTML = `
            <input type="radio" name="answer" value="${index}">
            <span class="option-text">${option}</span>
        `;
        
        label.querySelector('input').onclick = () => selectAnswer(index);
        DOM.quiz.optionsContainer.appendChild(label);
    });

    // بدء المؤقت
    startTimer();
}

function selectAnswer(selectedIndex) {
    soundSystem.play('click');
    
    // إلغاء تحديد جميع الخيارات
    document.querySelectorAll('.option-label').forEach(label => {
        label.classList.remove('selected');
    });

    // تحديد الخيار المختار
    const selectedLabel = document.querySelectorAll('.option-label')[selectedIndex];
    selectedLabel.classList.add('selected');

    // تفعيل زر التأكيد
    DOM.elements.nextButton.disabled = false;
    DOM.elements.nextButton.innerHTML = `
        <span class="button-text">تأكيد الإجابة</span>
        <span class="button-icon"><i class="fas fa-rocket"></i></span>
    `;

    // حفظ الإجابة المحددة
    DOM.elements.nextButton.dataset.selectedIndex = selectedIndex;
}

function checkAnswer(selectedIndex = null) {
    clearInterval(timerInterval);
    
    const question = currentSectionQuestions[currentQuestionIndex];
    const correctIndex = question.correct;
    
    // إذا لم يتم تحديد إجابة (انتهاء الوقت)
    if (selectedIndex === null) {
        selectedIndex = parseInt(DOM.elements.nextButton.dataset.selectedIndex);
    }

    // تعطيل جميع الخيارات
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.disabled = true;
    });

    // عرض الإجابات الصحيحة والخاطئة
    document.querySelectorAll('.option-label').forEach((label, index) => {
        if (index === correctIndex) {
            label.classList.add('correct');
        } else if (index === selectedIndex && index !== correctIndex) {
            label.classList.add('wrong');
        }
    });

    // التحقق من صحة الإجابة
    const isCorrect = selectedIndex === correctIndex;
    
    // حفظ إجابة المستخدم
    userAnswers.push({
        question: question.question,
        userAnswer: selectedIndex !== -1 ? question.options[selectedIndex] : "لم يتم الإجابة",
        correctAnswer: question.options[correctIndex],
        isCorrect: isCorrect,
        timeSpent: 20 - timeLeft
    });

    // تحديث النتيجة
    if (isCorrect) {
        score++;
        soundSystem.play('correct');
        showFeedback('إجابة صحيحة! 🎉', 'correct');
    } else if (selectedIndex === -1) {
        soundSystem.play('timeup');
        showFeedback(`انتهى الوقت! الإجابة الصحيحة: ${question.options[correctIndex]}`, 'wrong');
    } else {
        soundSystem.play('wrong');
        showFeedback(`إجابة خاطئة. الإجابة الصحيحة: ${question.options[correctIndex]}`, 'wrong');
    }

    // تحديث زر الانتقال
    DOM.elements.nextButton.disabled = false;
    DOM.elements.nextButton.innerHTML = `
        <span class="button-text">${currentQuestionIndex < currentSectionQuestions.length - 1 ? 'السؤال التالي' : 'عرض النتائج'}</span>
        <span class="button-icon"><i class="fas fa-arrow-left"></i></span>
    `;
    DOM.elements.nextButton.onclick = nextQuestion;
}

function showFeedback(message, type) {
    DOM.quiz.feedback.textContent = message;
    DOM.quiz.feedback.className = `feedback-message feedback-${type}`;
    DOM.quiz.feedback.style.display = 'block';
    AnimationSystem.fadeIn(DOM.quiz.feedback);
}

function nextQuestion() {
    currentQuestionIndex++;
    DOM.elements.nextButton.onclick = null;
    displayQuestion();
}

// ====== شاشة النتائج ======
function showResults() {
    clearInterval(timerInterval);
    soundSystem.play('finish');
    
    const totalTime = Math.floor((Date.now() - quizStartTime) / 1000);
    const totalQuestions = currentSectionQuestions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    switchScreen(DOM.screens.results);
    
    // تحديث النتائج
    DOM.results.finalScore.textContent = `${percentage}%`;
    DOM.results.correctAnswers.textContent = `${score}/${totalQuestions}`;
    DOM.results.timeSpent.textContent = formatTime(totalTime);
    
    // تحديث حلقة النتيجة
    setTimeout(() => {
        updateScoreRing(percentage);
    }, 500);
    
    // تحديد مستوى الأداء والرسالة
    let performance, title, message;
    
    if (percentage >= 90) {
        performance = 'متميز';
        title = 'أداء استثنائي! 🏆';
        message = 'أنت خبير جغرافي حقيقي! معرفتك مذهلة وتستحق الإشادة.';
        soundSystem.play('levelup');
    } else if (percentage >= 70) {
        performance = 'متقدم';
        title = 'أداء رائع! 💫';
        message = 'معرفتك الجغرافية قوية ومتطورة. استمر في التقدم!';
    } else if (percentage >= 50) {
        performance = 'متوسط';
        title = 'أداء جيد! 👍';
        message = 'لديك معرفة جيدة ولكن هناك مجال للتحسين. استمر في التعلم!';
    } else {
        performance = 'مبتدئ';
        title = 'حاول مرة أخرى! 📚';
        message = 'لا تيأس! كل رحلة تبدأ بخطوة. استمر في التعلم والتحدي.';
    }
    
    DOM.results.performanceLevel.textContent = performance;
    DOM.results.achievementTitle.textContent = title;
    DOM.results.achievementMessage.textContent = message;
    
    // تحديث لون النتيجة
    const scoreColor = percentage >= 70 ? 'var(--success)' : 
                      percentage >= 50 ? 'var(--warning)' : 'var(--danger)';
    DOM.results.finalScore.style.color = scoreColor;
}

function updateScoreRing(percentage) {
    const circle = document.querySelector('.progress-ring-fill');
    if (circle) {
        const circumference = 628; // 2 * π * 100
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
}

// ====== دوال المساعدة العامة ======
function goBack() {
    soundSystem.play('click');
    
    if (DOM.screens.quiz.classList.contains('active')) {
        if (confirm('هل تريد حقاً العودة؟ سيتم فقدان تقدمك الحالي.')) {
            switchScreen(DOM.screens.welcome);
        }
    } else if (DOM.screens.results.classList.contains('active')) {
        switchScreen(DOM.screens.welcome);
    }
}

function resetQuiz() {
    soundSystem.play('click');
    switchScreen(DOM.screens.welcome);
}

function shareResults() {
    soundSystem.play('click');
    
    const score = DOM.results.finalScore.textContent;
    const message = `حصلت على ${score} في اختبار الجغرافي على GeoQuest! جرب التحدي بنفسك.`;
    
    if (navigator.share) {
        navigator.share({
            title: 'نتيجة اختبار GeoQuest',
            text: message,
            url: window.location.href
        });
    } else {
        // نسخ النتيجة إلى الحافظة
        navigator.clipboard.writeText(message).then(() => {
            alert('تم نسخ النتيجة إلى الحافظة! 🎉');
        });
    }
}

// ====== تحميل البيانات ======
async function loadQuizData() {
    try {
        // محاكاة تحميل البيانات
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // بيانات تجريبية شاملة
        allSectionsData = [
            {
                section: "الجغرافيا العامة: أساسيات المعرفة الجغرافية",
                questions: [
                    {
                        question: "ما هو أكبر محيط في العالم من حيث المساحة؟",
                        options: ["المحيط الهادئ", "المحيط الأطلسي", "المحيط الهندي", "المحيط المتجمد الشمالي"],
                        correct: 0
                    },
                    {
                        question: "أي من هذه الدول لا تقع في قارة أمريكا الجنوبية؟",
                        options: ["البرازيل", "الأرجنتين", "نيجيريا", "تشيلي"],
                        correct: 2
                    },
                    {
                        question: "ما هي أعلى قمة جبل في العالم؟",
                        options: ["جبل كليمنجارو", "جبل إفرست", "جبل الألب", "جبل K2"],
                        correct: 1
                    },
                    {
                        question: "أي من هذه البحيرات هي الأكبر في أفريقيا؟",
                        options: ["بحيرة فيكتوريا", "بحيرة تنجانيقا", "بحيرة ملاوي", "بحيرة تشاد"],
                        correct: 0
                    }
                ]
            },
            {
                section: "الجغرافيا السياسية: الدول والحدود",
                questions: [
                    {
                        question: "ما هي أكبر دولة في العالم من حيث المساحة؟",
                        options: ["كندا", "الولايات المتحدة", "روسيا", "الصين"],
                        correct: 2
                    },
                    {
                        question: "أي من هذه الدول تقع في قارة أوروبا؟",
                        options: ["مصر", "تركيا", "فرنسا", "اليابان"],
                        correct: 2
                    },
                    {
                        question: "ما هي عاصمة أستراليا؟",
                        options: ["سيدني", "ملبورن", "كانبرا", "بريزبان"],
                        correct: 2
                    }
                ]
            },
            {
                section: "الجغرافيا المناخية: الأنماط المناخية",
                questions: [
                    {
                        question: "أي من هذه المناطق تتميز بمناخ البحر المتوسط؟",
                        options: ["شمال أفريقيا", "أمريكا الجنوبية", "أستراليا", "كل ما سبق"],
                        correct: 3
                    },
                    {
                        question: "ما هو أعلى معدل لدرجات الحرارة سجل على سطح الأرض؟",
                        options: ["48°م", "56.7°م", "62°م", "70°م"],
                        correct: 1
                    }
                ]
            }
        ];
        
        renderSectionsMenu();
        
    } catch (error) {
        console.error('Error loading quiz data:', error);
        // عرض رسالة خطأ للمستخدم
        alert('حدث خطأ في تحميل البيانات. يرجى تحديث الصفحة.');
    }
}

// ====== تهيئة التطبيق ======
function initializeApp() {
    // إعداد نظام الإنجازات
    initializeAchievements();
    
    // ربط الأحداث
    DOM.elements.startBtn.addEventListener('click', () => {
        if (allSectionsData.length > 0) {
            toggleMenu();
        }
    });
    
    DOM.elements.menuToggle.addEventListener('click', toggleMenu);
    DOM.elements.closeMenuBtn.addEventListener('click', toggleMenu);
    DOM.elements.backButton.addEventListener('click', goBack);
    DOM.elements.restartBtn.addEventListener('click', resetQuiz);
    DOM.elements.shareBtn.addEventListener('click', shareResults);
    
    // إعداد زر التأكيد الافتراضي
    DOM.elements.nextButton.addEventListener('click', () => {
        const selectedIndex = parseInt(DOM.elements.nextButton.dataset.selectedIndex);
        if (!isNaN(selectedIndex)) {
            checkAnswer(selectedIndex);
        }
    });
    
    // تحميل البيانات
    loadQuizData();
    
    // إخفاء زر الرجوع في البداية
    DOM.elements.backButton.style.display = 'none';
    
    // تأثيرات دخول أولية
    setTimeout(() => {
        document.querySelectorAll('.feature-card').forEach((card, index) => {
            card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.2}s both`;
        });
    }, 500);
}

// بدء التطبيق عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', initializeApp);

// تصدير الدوال للاستخدام العام
window.AnimationSystem = AnimationSystem;
window.soundSystem = soundSystem;