// **=================================================**
// ** ملف: script.js (النظام المطور) - يحتاج Question.json **
// **=================================================**

// [1] المتغيرات العالمية والتحكم المتطورة
let geologicalData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval;
let quizStartTime;
let totalQuizTime = 0;
const TIME_LIMIT = 20;
const POINTS_CORRECT = 5;
const POINTS_WRONG = -3;
let currentLanguage = 'ar';
let userStats = {
    totalQuizzes: 0,
    totalScore: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    averageTime: 0,
    achievements: []
};

const translations = {
    'ar': {
        'start_quiz': 'ابدأ الاختبار',
        'choose_domain': 'اختر مجال الاختبار:',
        'question': 'السؤال',
        'submit': 'تأكيد الإجابة',
        'next': 'السؤال التالي',
        'review_errors': 'مراجعة الأخطاء المفاهيمية:',
        'your_answer': 'إجابتك:',
        'correct_answer': 'الصحيح:',
        'great_job': '🌟 أداء استثنائي! معرفة جيولوجية قوية.',
        'good_job': '✨ جيد جداً! أساس متين، لكن هناك مجال للمراجعة.',
        'needs_review': '⚠️ تحتاج إلى مراجعة مكثفة لهذه المفاهيم.',
        'new_quiz': 'اختبار جديد',
        'timer_text': 'ث',
        'difficulty_easy': 'سهل',
        'difficulty_medium': 'متوسط',
        'difficulty_hard': 'صعب'
    },
    'en': {
        'start_quiz': 'Start Quiz',
        'choose_domain': 'Choose Quiz Domain:',
        'question': 'Question',
        'submit': 'Submit Answer',
        'next': 'Next Question',
        'review_errors': 'Review Conceptual Errors:',
        'your_answer': 'Your Answer:',
        'correct_answer': 'Correct:',
        'great_job': '🌟 Exceptional performance! Strong geological knowledge.',
        'good_job': '✨ Very good! Solid foundation, but room for review.',
        'needs_review': '⚠️ Requires intensive review of these concepts.',
        'new_quiz': 'New Quiz',
        'timer_text': 's',
        'difficulty_easy': 'Easy',
        'difficulty_medium': 'Medium',
        'difficulty_hard': 'Hard'
    },
    'fr': {
        'start_quiz': 'Commencer le Quiz',
        'choose_domain': 'Choisissez un domaine de Quiz:',
        'question': 'Question',
        'submit': 'Soumettre la Réponse',
        'next': 'Question Suivante',
        'review_errors': 'Revue des Erreurs Conceptuelles:',
        'your_answer': 'Votre Réponse:',
        'correct_answer': 'La Bonne:',
        'great_job': '🌟 Performance exceptionnelle! Solides connaissances géologiques.',
        'good_job': '✨ Très bien! Base solide, mais il y a place à l\'amélioration.',
        'needs_review': '⚠️ Nécessite une révision intensive de ces concepts.',
        'new_quiz': 'Nouveau Quiz',
        'timer_text': 's',
        'difficulty_easy': 'Facile',
        'difficulty_medium': 'Moyen',
        'difficulty_hard': 'Difficile'
    }
};

// نظام الإنجازات
const achievements = [
    { id: 'first_quiz', name: 'المستكشف الجيولوجي', description: 'أكمل أول اختبار', icon: 'fas fa-compass', unlocked: false },
    { id: 'perfect_score', name: 'الخبير المطلق', description: 'احصل على نتيجة كاملة في اختبار', icon: 'fas fa-crown', unlocked: false },
    { id: 'fast_thinker', name: 'الذهن السريع', description: 'أجب على 5 أسئلة في أقل من دقيقة', icon: 'fas fa-bolt', unlocked: false },
    { id: 'persistent', name: 'المثابر', description: 'أكمل 10 اختبارات', icon: 'fas fa-trophy', unlocked: false },
    { id: 'quick_learner', name: 'المتعلم السريع', description: 'احصل على 90% في اختبار صعب', icon: 'fas fa-graduation-cap', unlocked: false }
];

// ---------------------- 2. دالة تحميل البيانات المطورة ----------------------

async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    try {
        loadingMessage.innerHTML = `
            <div class="spinner"></div>
            <p>جاري تحميل البيانات الجيولوجية...</p>
            <p class="loading-sub">إعداد النظام الذكي للاختبارات</p>
        `;
        
        // محاكاة تحميل البيانات مع تأثير مرئي
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = await fetch('./Question.json'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        geologicalData = await response.json();
        
        // تحميل إحصائيات المستخدم من localStorage
        loadUserStats();
        
        initializeTopicSelection(geologicalData);
        
        // إخفاء رسالة التحميل بسلاسة
        loadingMessage.style.opacity = '0';
        setTimeout(() => {
            loadingMessage.classList.add('hidden');
        }, 500);

    } catch (error) {
        console.error("فشل في تحميل بيانات الجيولوجيا:", error);
        loadingMessage.innerHTML = `
            <div style="color: var(--incorrect-color); font-size: 3rem; margin-bottom: 20px;">⚠️</div>
            <p style="color: var(--incorrect-color); font-size: 1.2rem; margin-bottom: 10px;">خطأ في الاتصال</p>
            <p style="color: var(--text-light);">عذراً، لا يمكن تحميل البيانات. يرجى التحقق من اتصال الإنترنت.</p>
            <button onclick="loadGeologyData()" class="large-btn" style="margin-top: 20px;">
                <i class="fas fa-redo"></i> إعادة المحاولة
            </button>
        `;
    }
}

// ---------------------- 3. نظام التقدم والإحصائيات ----------------------

function loadUserStats() {
    const savedStats = localStorage.getItem('geologyQuizStats');
    if (savedStats) {
        userStats = JSON.parse(savedStats);
        updateProgressUI();
    }
}

function saveUserStats() {
    localStorage.setItem('geologyQuizStats', JSON.stringify(userStats));
}

function updateProgressUI() {
    // تحديث شريط التقدم العام
    const totalProgress = calculateOverallProgress();
    document.getElementById('global-progress').style.width = `${totalProgress}%`;
    document.getElementById('progress-percent').textContent = `${Math.round(totalProgress)}%`;
    
    // تحديث الإحصائيات في القائمة الجانبية
    document.getElementById('user-level').textContent = getUserLevel();
    document.getElementById('user-points').textContent = userStats.totalScore;
    
    // تحديث شاشة التقدم
    updateProgressScreen();
}

function calculateOverallProgress() {
    const maxPossibleProgress = 100;
    const quizProgress = Math.min((userStats.totalQuizzes / 10) * 100, 30);
    const scoreProgress = Math.min((userStats.totalScore / 500) * 100, 40);
    const accuracyProgress = userStats.totalQuestions > 0 ? 
        (userStats.correctAnswers / userStats.totalQuestions) * 30 : 0;
    
    return quizProgress + scoreProgress + accuracyProgress;
}

function getUserLevel() {
    const totalScore = userStats.totalScore;
    if (totalScore >= 1000) return 'خبير';
    if (totalScore >= 500) return 'متقدم';
    if (totalScore >= 200) return 'متوسط';
    return 'مبتدئ';
}

function updateProgressScreen() {
    document.getElementById('total-score').textContent = userStats.totalScore;
    document.getElementById('correct-answers').textContent = userStats.correctAnswers;
    document.getElementById('avg-time').textContent = userStats.averageTime > 0 ? 
        `${Math.round(userStats.averageTime)}s` : '0s';
    document.getElementById('user-rank').textContent = `#${calculateUserRank()}`;
    
    // تحديث الرسم البياني
    updateProgressChart();
}

function calculateUserRank() {
    return Math.max(1, Math.floor(1000 / (userStats.totalScore + 1)));
}

function updateProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // بيانات نموذجية للتقدم الأسبوعي
    const weeklyData = {
        labels: ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
        datasets: [{
            label: 'النقاط اليومية',
            data: [45, 60, 75, 50, 85, 40, 95],
            borderColor: '#00b4d8',
            backgroundColor: 'rgba(0, 180, 216, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: weeklyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

// ---------------------- 4. نظام المؤقت المحسن ----------------------

function startTimer() {
    clearInterval(timerInterval);
    let timeRemaining = TIME_LIMIT;
    const timerDisplay = document.getElementById('timer-display');
    const progressBar = document.getElementById('progress-bar-fill');
    const t = translations[currentLanguage];

    progressBar.style.width = '100%';
    progressBar.style.background = 'linear-gradient(to right, var(--neon-blue), var(--neon-purple))';
    timerDisplay.textContent = `${timeRemaining}${t.timer_text}`;
    timerDisplay.style.color = 'var(--neon-blue)';

    timerInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = `${timeRemaining}${t.timer_text}`;
        
        const progressPercentage = (timeRemaining / TIME_LIMIT) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // تأثيرات مرئية متقدمة للمؤقت
        if (timeRemaining <= 5) {
            timerDisplay.style.color = 'var(--incorrect-color)';
            progressBar.style.background = 'linear-gradient(to right, var(--incorrect-color), var(--neon-pink))';
            timerDisplay.classList.add('pulse');
        } else if (timeRemaining <= 10) {
            timerDisplay.style.color = 'var(--warning-color)';
            progressBar.style.background = 'linear-gradient(to right, var(--warning-color), var(--incorrect-color))';
            timerDisplay.classList.remove('pulse');
        } else {
            timerDisplay.style.color = 'var(--neon-blue)';
            progressBar.style.background = 'linear-gradient(to right, var(--neon-blue), var(--neon-purple))';
            timerDisplay.classList.remove('pulse');
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

function handleTimeout() {
    const t = translations[currentLanguage];
    const currentQ = currentQuestions[currentQuestionIndex];

    score += POINTS_WRONG; 
    
    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: `(انتهى الوقت - ${t.correct_answer}: ${currentQ.answer})`,
        correctAnswer: currentQ.answer,
        isCorrect: false,
    };
    
    // تأثير مرئي لانتهاء الوقت
    document.querySelectorAll('.option-label').forEach(label => {
        label.querySelector('input').disabled = true;
        if (label.querySelector('input').value === currentQ.answer) {
            label.classList.add('correct'); 
            label.style.animation = 'pulse 0.5s ease-in-out 2';
        }
    });

    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    
    // عرض رسالة انتهاء الوقت
    showTempMessage('انتهى الوقت! انتقل إلى السؤال التالي', 'warning');
    
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 2000);
}

// ---------------------- 5. نظام الترجمة المتقدم ----------------------

function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar'];

    // تحديث النصوص الأساسية
    document.getElementById('start-quiz-btn').innerHTML = `<i class="fas fa-rocket"></i> ${t.start_quiz}`;
    document.getElementById('submit-btn').innerHTML = `<i class="fas fa-paper-plane"></i> ${t.submit}`;
    document.getElementById('next-btn').innerHTML = `<i class="fas fa-arrow-right"></i> ${t.next}`;
    document.querySelector('#topics-list-container h3').textContent = t.choose_domain;
    document.querySelector('#results-screen .primary-btn').innerHTML = `<i class="fas fa-redo"></i> ${t.new_quiz}`;
    
    // تحديث النصوص الديناميكية
    if (document.getElementById('quiz-screen').classList.contains('active')) {
        document.getElementById('timer-display').textContent = `${TIME_LIMIT}${t.timer_text}`;
        document.getElementById('question-counter').textContent = `${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        document.querySelector('.review-log h3').textContent = t.review_errors;
    }
}

function changeLanguage(langCode) {
    // تحديث حالة أزرار اللغة
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    translateUI(langCode);
}

// ---------------------- 6. نظام التنقل المحسن ----------------------

function showScreen(screenId) {
    // إخفاء جميع الشاشات
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // إظهار الشاشة المطلوبة
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // إغلاق القائمة الجانبية
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
}

// إعداد مستمعي الأحداث للتنقل
document.addEventListener('DOMContentLoaded', function() {
    // التنقل عبر القائمة الجانبية
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showScreen(section);
        });
    });
    
    // زر فتح القائمة الجانبية
    document.getElementById('open-sidebar-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('overlay').style.display = 'block';
    });
    
    // زر إغلاق القائمة الجانبية
    document.getElementById('close-sidebar-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').style.display = 'none';
    });
    
    // النقر على overlay يغلق القائمة
    document.getElementById('overlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').style.display = 'none';
    });
});

// ---------------------- 7. نظام اختيار الموضوعات المتطور ----------------------

function initializeTopicSelection(data) {
    const topicsList = document.getElementById('topics-list'); 
    const sidebarList = document.getElementById('sidebar-topics-list');
    const topicsContainer = document.getElementById('topics-list-container');

    topicsList.innerHTML = '';
    sidebarList.innerHTML = '';

    Object.keys(data).forEach(topic => {
        const topicDisplayName = topic.replace(/_/g, ' ');
        const questions = data[topic];
        const questionCount = Array.isArray(questions) ? questions.length : 0;
        
        // حساب صعوبة الموضوع
        const difficulty = calculateTopicDifficulty(questions);
        const difficultyStars = getDifficultyStars(difficulty);

        // إنشاء بطاقة الموضوع للشاشة الرئيسية
        const gridCard = document.createElement('div');
        gridCard.className = 'topic-card';
        gridCard.innerHTML = `
            <h3>${topicDisplayName}</h3>
            <p>${getRandomTopicDescription()}</p>
            <div class="topic-meta">
                <div class="topic-difficulty">
                    ${difficultyStars}
                </div>
                <div class="topic-stats">
                    <span>${questionCount} أسئلة</span>
                </div>
            </div>
        `;
        
        // إنشاء رابط الموضوع للقائمة الجانبية
        const sidebarLink = document.createElement('a');
        sidebarLink.href = "#";
        sidebarLink.innerHTML = `
            ${topicDisplayName}
            <span class="topic-count">${questionCount}</span>
        `;
        
        const startQuizHandler = () => {
            if (questionCount > 0) {
                startQuiz(topicDisplayName, questions, difficulty);
            } else {
                showTempMessage('لا توجد أسئلة في هذا الموضوع حالياً.', 'error');
            }
        };
        
        gridCard.addEventListener('click', startQuizHandler);
        sidebarLink.addEventListener('click', startQuizHandler);
        
        topicsList.appendChild(gridCard);
        sidebarList.appendChild(sidebarLink); 
    });
    
    topicsContainer.classList.remove('hidden');
    
    // إعداد البحث
    setupTopicSearch();
    
    translateUI(currentLanguage);
}

function calculateTopicDifficulty(questions) {
    if (!Array.isArray(questions)) return 'medium';
    
    const difficultyLevels = {
        easy: 0,
        medium: 0,
        hard: 0
    };
    
    questions.forEach(q => {
        if (q.difficulty) {
            difficultyLevels[q.difficulty] = (difficultyLevels[q.difficulty] || 0) + 1;
        }
    });
    
    const total = questions.length;
    if (difficultyLevels.hard / total > 0.6) return 'hard';
    if (difficultyLevels.easy / total > 0.6) return 'easy';
    return 'medium';
}

function getDifficultyStars(difficulty) {
    const stars = {
        easy: '●●○',
        medium: '●●●',
        hard: '●●●◆'
    };
    
    const colors = {
        easy: 'var(--correct-color)',
        medium: 'var(--warning-color)',
        hard: 'var(--incorrect-color)'
    };
    
    return `<span style="color: ${colors[difficulty]}">${stars[difficulty]}</span>`;
}

function getRandomTopicDescription() {
    const descriptions = [
        'استكشف الأسرار الجيولوجية العميقة',
        'افهم تكوينات الأرض والعمليات الطبيعية',
        'تعمق في دراسة الصخور والمعادن',
        'اكتشف ديناميكية الأرض وتغيراتها'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function setupTopicSearch() {
    const searchInput = document.getElementById('topic-search');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const topicCards = document.querySelectorAll('.topic-card');
        
        topicCards.forEach(card => {
            const topicName = card.querySelector('h3').textContent.toLowerCase();
            if (topicName.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'slideIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// ---------------------- 8. نظام الاختبار المحسن ----------------------

function startQuiz(topicTitle, questions, difficulty) {
    clearInterval(timerInterval);
    
    // التحقق من صحة بيانات الأسئلة
    if (!Array.isArray(questions) || questions.length === 0) {
        showTempMessage('عذراً، لا توجد أسئلة متاحة في هذا الموضوع.', 'error');
        return;
    }
    
    currentQuestions = questions.filter(q => 
        q && q.question && q.options && Array.isArray(q.options) && q.answer
    );
    
    if (currentQuestions.length === 0) {
        showTempMessage('عذراً، توجد مشكلة في تنسيق الأسئلة.', 'error');
        return;
    }
    
    // تسجيل وقت بدء الاختبار
    quizStartTime = new Date();
    
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};

    // تحديث واجهة الاختبار
    document.getElementById('quiz-title').textContent = `اختبار: ${topicTitle}`;
    document.getElementById('difficulty-badge').textContent = 
        translations[currentLanguage][`difficulty_${difficulty}`];
    document.getElementById('questions-count').textContent = `${currentQuestions.length} أسئلة`;
    
    showScreen('quiz-screen');
    displayQuestion();
}

function displayQuestion() {
    clearInterval(timerInterval); 
    const qContainer = document.getElementById('question-container');
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];

    if (!currentQ) {
        return showResults();
    }
    
    startTimer();
    
    // تحديث معلومات السؤال
    document.getElementById('question-counter').textContent = 
        `${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    document.getElementById('current-score').textContent = `${score} نقطة`;

    let htmlContent = `<div class="question-text">${currentQ.question}</div>`;
    htmlContent += '<div class="options-container">';

    // خلط الخيارات عشوائياً
    const shuffledOptions = [...currentQ.options].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach((option) => {
        htmlContent += `
            <label class="option-label">
                <input type="radio" name="option" value="${option}">
                <span class="option-text">${option}</span>
            </label>
        `;
    });
    htmlContent += '</div>';
    qContainer.innerHTML = htmlContent;
    
    // إعادة تعيين حالة الأزرار
    document.getElementById('submit-btn').classList.remove('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('quiz-hint').classList.add('hidden');

    // تمكين زر الإرسال عند اختيار خيار
    document.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => {
            document.getElementById('submit-btn').disabled = false;
        });
    });
    
    // إعداد زر التلميح
    setupHintButton(currentQ);
}

function setupHintButton(question) {
    const hintBtn = document.getElementById('hint-btn');
    const hintBox = document.getElementById('quiz-hint');
    
    hintBtn.onclick = function() {
        if (question.hint) {
            document.getElementById('hint-text').textContent = question.hint;
            hintBox.classList.remove('hidden');
            hintBtn.disabled = true;
            
            // خصم نقطة لاستخدام التلميح
            score = Math.max(0, score - 1);
            document.getElementById('current-score').textContent = `${score} نقطة`;
        } else {
            showTempMessage('لا يوجد تلميح متاح لهذا السؤال', 'info');
        }
    };
}

// ---------------------- 9. معالجة الإجابات المحسنة ----------------------

document.getElementById('submit-btn').addEventListener('click', handleAnswerSubmission);

function handleAnswerSubmission() {
    clearInterval(timerInterval); 
    
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) return;

    const currentQ = currentQuestions[currentQuestionIndex];
    const userAnswer = selectedOption.value;
    const isCorrect = (userAnswer === currentQ.answer);
    
    // حساب الوقت المستغرق للإجابة
    const timeTaken = (TIME_LIMIT - parseInt(document.getElementById('timer-display').textContent)) || 1;
    
    if (isCorrect) {
        // مكافأة إضافية للإجابات السريعة
        const timeBonus = timeTaken <= 5 ? 2 : timeTaken <= 10 ? 1 : 0;
        score += POINTS_CORRECT + timeBonus;
        
        showTempMessage(`إجابة صحيحة! +${POINTS_CORRECT} نقطة${timeBonus ? ` +${timeBonus} مكافأة سرعة` : ''}`, 'success');
    } else {
        score += POINTS_WRONG;
        showTempMessage(`إجابة خاطئة! ${POINTS_WRONG} نقطة`, 'error');
    }

    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: userAnswer,
        correctAnswer: currentQ.answer,
        isCorrect: isCorrect,
        timeTaken: timeTaken
    };

    // عرض الإجابات الصحيحة والخاطئة بتأثيرات
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true; 

        if (input.value === currentQ.answer) {
            label.classList.add('correct');
            label.style.animation = 'pulse 0.5s ease-in-out 2';
        } else if (input.value === userAnswer && !isCorrect) {
            label.classList.add('incorrect');
            label.style.animation = 'shake 0.5s ease-in-out';
        }
    });

    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('hint-btn').disabled = true;
}

document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
});

// ---------------------- 10. نظام النتائج المتطور ----------------------

function showResults() {
    clearInterval(timerInterval); 
    
    // حساب الوقت الإجمالي للاختبار
    const endTime = new Date();
    totalQuizTime = Math.round((endTime - quizStartTime) / 1000);
    
    // تحديث إحصائيات المستخدم
    updateUserStats();
    
    showScreen('results-screen');

    // عرض النتيجة النهائية
    document.getElementById('final-score').textContent = score;
    
    // حساب الإحصائيات
    const correctAnswers = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const totalQuestions = currentQuestions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const averageTime = totalQuestions > 0 ? Math.round(totalQuizTime / totalQuestions) : 0;
    
    // تحديث تفاصيل النتيجة
    document.getElementById('correct-count').textContent = `${correctAnswers}/${totalQuestions}`;
    document.getElementById('time-taken').textContent = formatTime(totalQuizTime);
    document.getElementById('efficiency-rate').textContent = `${accuracy}%`;
    
    // تحديد رسالة التقدير
    const gradeMessage = document.getElementById('grade-message');
    const t = translations[currentLanguage];
    
    let message, badgeIcon, badgeColor;
    if (accuracy >= 90) {
        message = t.great_job;
        badgeIcon = 'fas fa-crown';
        badgeColor = 'var(--correct-color)';
    } else if (accuracy >= 70) {
        message = t.good_job;
        badgeIcon = 'fas fa-star';
        badgeColor = 'var(--neon-blue)';
    } else {
        message = t.needs_review;
        badgeIcon = 'fas fa-lightbulb';
        badgeColor = 'var(--incorrect-color)';
    }
    
    gradeMessage.innerHTML = message;
    gradeMessage.style.color = badgeColor;
    document.getElementById('results-badge').innerHTML = `<i class="${badgeIcon}"></i>`;
    document.getElementById('results-subtitle').textContent = getRandomCongratsMessage(accuracy);
    
    // عرض الإنجازات
    displayAchievements();
    
    // عرض مراجعة الأخطاء
    displayErrorReview();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getRandomCongratsMessage(accuracy) {
    const messages = {
        high: [
            'مستوى معرفي متميز في الجيولوجيا!',
            'أنت على طريق becoming a geology expert!',
            'معرفة عميقة تستحق الإشادة!'
        ],
        medium: [
            'أداء جيد مع إمكانية التحسين!',
            'أسس قوية تحتاج إلى بعض الصقل!',
            'مسار تعلم واعد في الجيولوجيا!'
        ],
        low: [
            'بداية رحلة التعلم تحتاج إلى المزيد من الجهد!',
            'كل خبير كان مبتدئاً يوماً ما!',
            'الاستمرارية مفتاح النجاح في الجيولوجيا!'
        ]
    };
    
    const category = accuracy >= 80 ? 'high' : accuracy >= 60 ? 'medium' : 'low';
    const categoryMessages = messages[category];
    return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
}

function updateUserStats() {
    userStats.totalQuizzes++;
    userStats.totalScore += Math.max(0, score);
    userStats.totalQuestions += currentQuestions.length;
    userStats.correctAnswers += Object.values(userAnswers).filter(a => a.isCorrect).length;
    
    // حساب متوسط الوقت
    const totalTime = Object.values(userAnswers).reduce((sum, a) => sum + a.timeTaken, 0);
    const currentAvg = userStats.averageTime;
    const newAvg = (currentAvg * (userStats.totalQuizzes - 1) + totalTime) / userStats.totalQuizzes;
    userStats.averageTime = Math.round(newAvg);
    
    // فحص الإنجازات
    checkAchievements();
    
    saveUserStats();
    updateProgressUI();
}

function checkAchievements() {
    let newAchievements = [];
    
    // الإنجاز: أول اختبار
    if (userStats.totalQuizzes === 1 && !achievements[0].unlocked) {
        achievements[0].unlocked = true;
        newAchievements.push(achievements[0]);
    }
    
    // الإنجاز: نتيجة كاملة
    const perfectScore = Object.values(userAnswers).every(a => a.isCorrect);
    if (perfectScore && !achievements[1].unlocked) {
        achievements[1].unlocked = true;
        newAchievements.push(achievements[1]);
    }
    
    // عرض الإنجازات الجديدة
    if (newAchievements.length > 0) {
        showNewAchievements(newAchievements);
    }
}

function displayAchievements() {
    const grid = document.getElementById('achievements-grid');
    grid.innerHTML = '';
    
    achievements.forEach(achievement => {
        const achievementEl = document.createElement('div');
        achievementEl.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
        achievementEl.innerHTML = `
            <i class="${achievement.icon}"></i>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
        `;
        grid.appendChild(achievementEl);
    });
}

function displayErrorReview() {
    const reviewArea = document.getElementById('review-area');
    const t = translations[currentLanguage];
    
    reviewArea.innerHTML = '';
    let errorsFound = false;
    
    Object.values(userAnswers).forEach((answer, index) => {
        if (!answer.isCorrect) {
            errorsFound = true;
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="review-question">${answer.question}</div>
                <div class="review-answer">
                    <div class="user-answer">${t.your_answer} ${answer.userAnswer}</div>
                    <div class="correct-answer">${t.correct_answer} ${answer.correctAnswer}</div>
                </div>
            `;
            reviewArea.appendChild(reviewItem);
        }
    });
    
    if (!errorsFound) {
        reviewArea.innerHTML = `
            <div class="all-correct">
                <i class="fas fa-trophy" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>أداء متميز!</h3>
                <p>لم ترتكب أي أخطاء في هذا الاختبار. استمر في التميز!</p>
            </div>
        `;
    }
}

// ---------------------- 11. نظام الرسائل المؤقتة ----------------------

function showTempMessage(message, type = 'info') {
    // إزالة أي رسالة سابقة
    const existingMessage = document.querySelector('.temp-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // إنشاء رسالة جديدة
    const messageEl = document.createElement('div');
    messageEl.className = `temp-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? 'var(--incorrect-color)' : 
                     type === 'success' ? 'var(--correct-color)' : 
                     type === 'warning' ? 'var(--warning-color)' : 'var(--neon-blue)'};
        color: white;
        padding: 15px 25px;
        border-radius: 25px;
        box-shadow: var(--box-shadow);
        z-index: 3000;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    // إزالة الرسالة بعد 3 ثوان
    setTimeout(() => {
        messageEl.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

// ---------------------- 12. إدارة أحداث النظام ----------------------

document.addEventListener('DOMContentLoaded', function() {
    // زر البدء
    document.getElementById('start-quiz-btn').addEventListener('click', () => {
        showScreen('topic-selection');
    });
    
    // زر اختبار جديد
    document.getElementById('new-quiz-btn').addEventListener('click', () => {
        showScreen('topic-selection');
    });
    
    // زر مشاركة النتائج
    document.getElementById('share-results-btn').addEventListener('click', () => {
        shareResults();
    });
    
    // إدارة زر الخروج من الاختبار
    document.getElementById('quit-btn').addEventListener('click', () => {
        document.getElementById('quit-modal').classList.add('active');
    });
    
    document.getElementById('close-quit-modal').addEventListener('click', () => {
        document.getElementById('quit-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-quit').addEventListener('click', () => {
        document.getElementById('quit-modal').classList.remove('active');
    });
    
    document.getElementById('confirm-quit').addEventListener('click', () => {
        document.getElementById('quit-modal').classList.remove('active');
        showScreen('welcome-screen');
        resetQuiz();
    });
    
    // إخفاء النموذج عند النقر خارج المحتوى
    document.getElementById('quit-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

function resetQuiz() {
    clearInterval(timerInterval);
    currentQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
    totalQuizTime = 0;
}

function shareResults() {
    const finalScore = document.getElementById('final-score').textContent;
    const correctCount = document.getElementById('correct-count').textContent;
    
    const shareText = `🎯 حصلت على ${finalScore} نقطة في اختبار الجيولوجيا مع ${correctCount} إجابات صحيحة! جرب النظام على: ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'نتيجة اختبار الجيولوجيا',
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showTempMessage('تم نسخ النتيجة إلى الحافظة!', 'success');
        });
    }
}

function showNewAchievements(achievements) {
    achievements.forEach((achievement, index) => {
        setTimeout(() => {
            showTempMessage(`🎉 إنجاز جديد: ${achievement.name} - ${achievement.description}`, 'success');
        }, index * 2000);
    });
}

// إضافة أنماط CSS للرسوم المتحركة الإضافية
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .temp-message {
        font-weight: bold;
    }
    
    .loading-sub {
        font-size: 0.9rem;
        color: var(--text-light);
        margin-top: 10px;
    }
`;
document.head.appendChild(additionalStyles);

// بدء تحميل النظام
loadGeologyData();