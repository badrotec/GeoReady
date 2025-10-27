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
        'loading': 'جاري تحميل البيانات...',
        'error_loading': 'خطأ في تحميل البيانات',
        'no_questions': 'لا توجد أسئلة في هذا الموضوع',
        'select_answer': 'يرجى اختيار إجابة',
        'time_up': 'انتهى الوقت!'
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
        'loading': 'Loading data...',
        'error_loading': 'Error loading data',
        'no_questions': 'No questions in this topic',
        'select_answer': 'Please select an answer',
        'time_up': 'Time is up!'
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
        'loading': 'Chargement des données...',
        'error_loading': 'Erreur de chargement',
        'no_questions': 'Aucune question dans ce sujet',
        'select_answer': 'Veuillez sélectionner une réponse',
        'time_up': 'Le temps est écoulé!'
    }
};

// ---------------------- 2. دالة تحميل البيانات المحسنة ----------------------

async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    const t = translations[currentLanguage];
    
    try {
        loadingMessage.innerHTML = `
            <div class="spinner"></div>
            <p>${t.loading}</p>
        `;
        loadingMessage.classList.remove('hidden');
        
        // إضافة تأخير بسيط لمحاكاة التحميل (يمكن إزالته)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = await fetch('./Question.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // التحقق من صحة البيانات
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid data format');
        }
        
        geologicalData = data;
        
        // إخفاء رسالة التحميل بعد نجاح التحميل
        setTimeout(() => {
            loadingMessage.style.opacity = '0';
            setTimeout(() => {
                loadingMessage.classList.add('hidden');
                initializeTopicSelection(geologicalData);
            }, 500);
        }, 500);
        
    } catch (error) {
        console.error("فشل في تحميل بيانات الجيولوجيا:", error);
        loadingMessage.innerHTML = `
            <div style="color: var(--incorrect-color); font-size: 2rem; margin-bottom: 15px;">⚠️</div>
            <p style="color: var(--incorrect-color); margin-bottom: 10px;">${t.error_loading}</p>
            <p style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 20px;">${error.message}</p>
            <button onclick="retryLoading()" class="large-btn" style="background: var(--neon-blue);">
                <i class="fas fa-redo"></i> إعادة المحاولة
            </button>
        `;
        document.getElementById('start-quiz-btn').disabled = true;
    }
}

function retryLoading() {
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.innerHTML = `
        <div class="spinner"></div>
        <p>جاري إعادة تحميل البيانات...</p>
    `;
    setTimeout(() => {
        loadGeologyData();
    }, 1000);
}

// ---------------------- 3. نظام المؤقت المحسن ----------------------

function startTimer() {
    clearInterval(timerInterval);
    let timeRemaining = TIME_LIMIT;
    const timerDisplay = document.getElementById('timer-display');
    const progressBar = document.getElementById('progress-bar-fill');
    const t = translations[currentLanguage];

    // إعادة تعيين المؤقت
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
        } else {
            timerDisplay.style.color = 'var(--neon-blue)';
            progressBar.style.background = 'linear-gradient(to right, var(--neon-blue), var(--neon-purple))';
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

    if (!currentQ) return;

    score += POINTS_WRONG; 
    
    userAnswers[currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: `(${t.time_up})`,
        correctAnswer: currentQ.answer,
        isCorrect: false,
    };
    
    // عرض الإجابة الصحيحة
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true;
        if (input.value === currentQ.answer) {
            label.classList.add('correct');
            label.style.animation = 'pulse 0.5s ease-in-out 2';
        }
    });

    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    
    // عرض رسالة انتهاء الوقت
    showTempMessage(t.time_up, 'warning');
    
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 2000);
}

// ---------------------- 4. نظام الترجمة المحسن ----------------------

function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar'];

    // تحديث النصوص الأساسية
    const startBtn = document.getElementById('start-quiz-btn');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const newQuizBtn = document.querySelector('#results-screen .large-btn');
    
    if (startBtn) startBtn.innerHTML = `${t.start_quiz} <i class="fas fa-rocket"></i>`;
    if (submitBtn) submitBtn.innerHTML = `${t.submit} <i class="fas fa-paper-plane"></i>`;
    if (nextBtn) nextBtn.innerHTML = `<i class="fas fa-arrow-right"></i> ${t.next}`;
    if (newQuizBtn) newQuizBtn.innerHTML = `${t.new_quiz} <i class="fas fa-redo"></i>`;
    
    const topicsTitle = document.querySelector('#topics-list-container h3');
    if (topicsTitle) topicsTitle.textContent = t.choose_domain;
    
    // تحديث النصوص الديناميكية إذا كانت شاشة الاختبار نشطة
    const quizScreen = document.getElementById('quiz-screen');
    if (quizScreen && !quizScreen.classList.contains('hidden')) {
        const questionCounter = document.getElementById('question-counter');
        const timerDisplay = document.getElementById('timer-display');
        const reviewTitle = document.querySelector('.review-log h3');
        
        if (questionCounter) {
            questionCounter.textContent = `${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        }
        if (timerDisplay) {
            timerDisplay.textContent = `${TIME_LIMIT}${t.timer_text}`;
        }
        if (reviewTitle) {
            reviewTitle.textContent = t.review_errors;
        }
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

// ---------------------- 5. نظام إدارة الشاشات المحسن ----------------------

function showScreen(screenId) {
    // إخفاء جميع الشاشات
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // إظهار الشاشة المطلوبة
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        // إضافة تأثير ظهور
        targetScreen.style.opacity = '0';
        targetScreen.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            targetScreen.style.opacity = '1';
            targetScreen.style.transform = 'translateY(0)';
            targetScreen.style.transition = 'all 0.5s ease';
        }, 50);
    }
}

// ---------------------- 6. نظام اختيار الموضوعات المحسن ----------------------

function initializeTopicSelection(data) {
    const topicsList = document.getElementById('topics-list'); 
    const sidebarList = document.getElementById('sidebar-topics-list');
    const topicsContainer = document.getElementById('topics-list-container');

    if (!topicsList || !sidebarList || !topicsContainer) {
        console.error('عناصر واجهة المستخدم غير موجودة');
        return;
    }

    topicsList.innerHTML = '';
    sidebarList.innerHTML = '';

    // التحقق من وجود بيانات
    if (!data || Object.keys(data).length === 0) {
        topicsList.innerHTML = `
            <div class="no-topics-message">
                <i class="fas fa-inbox" style="font-size: 3rem; color: var(--text-light); margin-bottom: 20px;"></i>
                <p>لا توجد مواضيع متاحة حالياً</p>
            </div>
        `;
        topicsContainer.classList.remove('hidden');
        return;
    }

    Object.keys(data).forEach(topic => {
        const topicDisplayName = topic.replace(/_/g, ' ');
        const questions = data[topic];
        const questionCount = Array.isArray(questions) ? questions.length : 0;

        // إنشاء بطاقة الموضوع للشاشة الرئيسية
        const gridCard = document.createElement('div');
        gridCard.className = 'topic-card';
        gridCard.innerHTML = `
            <h3>${topicDisplayName}</h3>
            <p>${questionCount} سؤال متاح</p>
            <div class="topic-meta">
                <span class="topic-difficulty">${getDifficultyText(questions)}</span>
                <span class="topic-questions">${questionCount} أسئلة</span>
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
                startQuiz(topicDisplayName, questions);
                closeSidebar();
            } else {
                showTempMessage(translations[currentLanguage].no_questions, 'warning');
            }
        };
        
        gridCard.addEventListener('click', startQuizHandler);
        sidebarLink.addEventListener('click', startQuizHandler);
        
        topicsList.appendChild(gridCard);
        sidebarList.appendChild(sidebarLink); 
    });
    
    topicsContainer.classList.remove('hidden');
    translateUI(currentLanguage);
}

function getDifficultyText(questions) {
    if (!Array.isArray(questions)) return 'متوسط';
    
    const difficultyCount = {
        easy: 0,
        medium: 0,
        hard: 0
    };
    
    questions.forEach(q => {
        if (q.difficulty && difficultyCount.hasOwnProperty(q.difficulty)) {
            difficultyCount[q.difficulty]++;
        } else {
            difficultyCount.medium++; // القيمة الافتراضية
        }
    });
    
    const total = questions.length;
    if (difficultyCount.hard / total > 0.6) return 'صعب';
    if (difficultyCount.easy / total > 0.6) return 'سهل';
    return 'متوسط';
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
}

// ---------------------- 7. نظام الاختبار المحسن ----------------------

function startQuiz(topicTitle, questions) {
    clearInterval(timerInterval);
    
    // التحقق من صحة بيانات الأسئلة
    if (!Array.isArray(questions) || questions.length === 0) {
        showTempMessage(translations[currentLanguage].no_questions, 'error');
        return;
    }
    
    // تصفية الأسئلة غير الصالحة
    currentQuestions = questions.filter(q => 
        q && 
        q.question && 
        typeof q.question === 'string' &&
        q.options && 
        Array.isArray(q.options) && 
        q.options.length >= 2 &&
        q.answer &&
        typeof q.answer === 'string'
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

    // خلط الخيارات عشوائياً لتجنب نمطية الإجابات
    const shuffledOptions = [...currentQ.options].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach((option, index) => {
        htmlContent += `
            <label class="option-label">
                <input type="radio" name="option" value="${option}">
                <span class="option-text">${String.fromCharCode(65 + index)}. ${option}</span>
            </label>
        `;
    });
    htmlContent += '</div>';
    qContainer.innerHTML = htmlContent;
    
    // إعادة تعيين حالة الأزرار
    document.getElementById('submit-btn').classList.remove('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('submit-btn').disabled = true;

    // تمكين زر الإرسال عند اختيار خيار
    document.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => {
            document.getElementById('submit-btn').disabled = false;
        });
    });
}

// ---------------------- 8. معالجة الإجابات المحسنة ----------------------

function handleAnswerSubmission() {
    clearInterval(timerInterval); 
    
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) {
        showTempMessage(translations[currentLanguage].select_answer, 'warning');
        return;
    }

    const currentQ = currentQuestions[currentQuestionIndex];
    const userAnswer = selectedOption.value;
    const isCorrect = (userAnswer === currentQ.answer);
    
    if (isCorrect) {
        score += POINTS_CORRECT;
        showTempMessage(`إجابة صحيحة! +${POINTS_CORRECT} نقطة`, 'success');
    } else {
        score += POINTS_WRONG;
        showTempMessage(`إجابة خاطئة! ${POINTS_WRONG} نقطة`, 'error');
    }

    userAnswers[currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: userAnswer,
        correctAnswer: currentQ.answer,
        isCorrect: isCorrect,
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
}

// ---------------------- 9. نظام النتائج المحسن ----------------------

function showResults() {
    clearInterval(timerInterval); 
    
    // حساب الوقت الإجمالي للاختبار
    const endTime = new Date();
    totalQuizTime = Math.round((endTime - quizStartTime) / 1000);
    
    showScreen('results-screen');

    // عرض النتيجة النهائية
    document.getElementById('final-score').textContent = score;
    
    // حساب الإحصائيات
    const correctAnswers = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const totalQuestions = currentQuestions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    // تحديث تفاصيل النتيجة
    document.getElementById('correct-count').textContent = `${correctAnswers}/${totalQuestions}`;
    document.getElementById('time-taken').textContent = formatTime(totalQuizTime);
    document.getElementById('efficiency-rate').textContent = `${accuracy}%`;
    
    // تحديد رسالة التقدير
    const gradeMessage = document.getElementById('grade-message');
    const t = translations[currentLanguage];
    
    if (accuracy >= 90) {
        gradeMessage.innerHTML = t.great_job;
        gradeMessage.style.color = 'var(--correct-color)';
    } else if (accuracy >= 70) {
        gradeMessage.innerHTML = t.good_job;
        gradeMessage.style.color = 'var(--neon-blue)';
    } else {
        gradeMessage.innerHTML = t.needs_review;
        gradeMessage.style.color = 'var(--incorrect-color)';
    }
    
    // عرض مراجعة الأخطاء
    displayErrorReview();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function displayErrorReview() {
    const reviewArea = document.getElementById('review-area');
    const t = translations[currentLanguage];
    
    reviewArea.innerHTML = `<h3>${t.review_errors}</h3>`;
    let errorsFound = false;
    
    Object.values(userAnswers).forEach((answer, index) => {
        if (!answer.isCorrect) {
            errorsFound = true;
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <div class="review-question">${answer.question}</div>
                <div class="review-answer">
                    <div class="user-answer">
                        <i class="fas fa-times"></i>
                        ${t.your_answer} ${answer.userAnswer}
                    </div>
                    <div class="correct-answer">
                        <i class="fas fa-check"></i>
                        ${t.correct_answer} ${answer.correctAnswer}
                    </div>
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

// ---------------------- 10. نظام الرسائل المؤقتة ----------------------

function showTempMessage(message, type = 'info') {
    // إزالة أي رسالة سابقة
    const existingMessage = document.querySelector('.temp-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // إنشاء رسالة جديدة
    const messageEl = document.createElement('div');
    messageEl.className = `temp-message ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    messageEl.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
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
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: bold;
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

// ---------------------- 11. إعداد مستمعي الأحداث ----------------------

document.addEventListener('DOMContentLoaded', function() {
    // التحكم في القائمة الجانبية
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const overlay = document.getElementById('overlay');
    
    if (openSidebarBtn) {
        openSidebarBtn.addEventListener('click', () => {
            document.getElementById('sidebar').classList.add('open');
            overlay.style.display = 'block';
        });
    }
    
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    // زر البدء
    const startBtn = document.getElementById('start-quiz-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            showScreen('topic-selection');
        });
    }
    
    // معالجة الإجابات
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleAnswerSubmission);
    }
    
    // الزر التالي
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            displayQuestion();
        });
    }
    
    // زر اختبار جديد
    const newQuizBtn = document.getElementById('new-quiz-btn');
    if (newQuizBtn) {
        newQuizBtn.addEventListener('click', () => {
            showScreen('topic-selection');
            resetQuiz();
        });
    }
    
    // إضافة أنماط CSS للرسوم المتحركة
    addAnimationStyles();
});

function resetQuiz() {
    clearInterval(timerInterval);
    currentQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
    totalQuizTime = 0;
}

function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { 
                transform: translateX(-50%) translateY(-100%); 
                opacity: 0; 
            }
            to { 
                transform: translateX(-50%) translateY(0); 
                opacity: 1; 
            }
        }
        
        @keyframes slideUp {
            from { 
                transform: translateX(-50%) translateY(0); 
                opacity: 1; 
            }
            to { 
                transform: translateX(-50%) translateY(-100%); 
                opacity: 0; 
            }
        }
        
        @keyframes pulse {
            0%, 100% { 
                transform: scale(1); 
            }
            50% { 
                transform: scale(1.05); 
            }
        }
        
        @keyframes shake {
            0%, 100% { 
                transform: translateX(0); 
            }
            25% { 
                transform: translateX(-5px); 
            }
            75% { 
                transform: translateX(5px); 
            }
        }
        
        .pulse {
            animation: pulse 0.5s ease-in-out infinite;
        }
        
        .no-topics-message {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-light);
        }
        
        .screen {
            transition: all 0.5s ease;
        }
    `;
    document.head.appendChild(style);
}

// بدء تحميل النظام عند اكتمال تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGeologyData);
} else {
    loadGeologyData();
}