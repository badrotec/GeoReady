// **=================================================**
// ** ملف: script.js (النظام المطور) - يحتاج Question.json **
// **=================================================**

// [1] المتغيرات العالمية والتحكم المحسنة
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
    averageTime: 0
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
        'score': 'النقاط',
        'time_spent': 'الوقت المستغرق',
        'accuracy': 'الدقة'
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
        'score': 'Score',
        'time_spent': 'Time Spent',
        'accuracy': 'Accuracy'
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
        'score': 'Score',
        'time_spent': 'Temps passé',
        'accuracy': 'Précision'
    }
};

// ---------------------- 2. دالة تحميل البيانات (محفوظة كما هي) ----------------------

async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    try {
        loadingMessage.textContent = '... جاري تحميل بيانات النظام';
        
        const response = await fetch('./Question.json'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        geologicalData = await response.json();
        
        initializeTopicSelection(geologicalData); 

    } catch (error) {
        console.error("فشل في تحميل بيانات الجيولوجيا:", error);
        loadingMessage.textContent = `[خطأ الاتصال] عذراً، لا يمكن تحميل البيانات.`;
        document.getElementById('start-quiz-btn').disabled = true;
    }
}

// ---------------------- 3. نظام المؤقت المحسن ----------------------

function startTimer() {
    clearInterval(timerInterval);
    let timeRemaining = TIME_LIMIT;
    const timerDisplay = document.getElementById('timer-display');
    const progressBar = document.getElementById('progress-bar-fill');
    const t = translations[currentLanguage];

    progressBar.style.width = '100%';
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

    score += POINTS_WRONG; 
    
    userAnswers[currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: `(انتهى الوقت)`,
        correctAnswer: currentQ.answer,
        isCorrect: false,
    };
    
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
    showNotification('انتهى الوقت!', 'warning');
    
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 1500);
}

// ---------------------- 4. نظام الترجمة المحسن ----------------------

function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar'];

    document.getElementById('start-quiz-btn').innerHTML = `${t.start_quiz} <i class="fas fa-rocket"></i>`;
    document.getElementById('submit-btn').innerHTML = `${t.submit} <i class="fas fa-paper-plane"></i>`;
    document.getElementById('next-btn').innerHTML = `<i class="fas fa-arrow-right"></i> ${t.next}`;
    document.querySelector('#topics-list-container h3').textContent = t.choose_domain;
    document.querySelector('#results-screen .large-btn').innerHTML = `${t.new_quiz} <i class="fas fa-redo"></i>`;
    
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
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
    }
}

// ---------------------- 6. نظام اختيار الموضوعات المحسن ----------------------

function initializeTopicSelection(data) {
    const topicsList = document.getElementById('topics-list'); 
    const sidebarList = document.getElementById('sidebar-topics-list');
    const loadingMessage = document.getElementById('loading-message');

    if (loadingMessage) loadingMessage.classList.add('hidden');
    topicsList.innerHTML = '';
    sidebarList.innerHTML = '';

    Object.keys(data).forEach(topic => {
        const topicDisplayName = topic.replace(/_/g, ' ');
        const questionCount = Array.isArray(data[topic]) ? data[topic].length : 0;

        // إنشاء بطاقة الموضوع للشاشة الرئيسية
        const gridCard = document.createElement('div');
        gridCard.className = 'topic-card';
        gridCard.innerHTML = `
            <h3>${topicDisplayName}</h3>
            <p>${questionCount} سؤال متاح</p>
            <div class="topic-meta">
                <span class="topic-difficulty">${getRandomDifficulty()}</span>
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
            startQuiz(topicDisplayName, data[topic]);
            document.getElementById('sidebar').classList.remove('open'); 
            document.getElementById('overlay').style.display = 'none';
        };
        
        gridCard.addEventListener('click', startQuizHandler);
        sidebarLink.addEventListener('click', startQuizHandler);
        
        topicsList.appendChild(gridCard);
        sidebarList.appendChild(sidebarLink); 
    });
    
    translateUI(currentLanguage);
}

function getRandomDifficulty() {
    const difficulties = ['سهل', 'متوسط', 'صعب'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
}

// ---------------------- 7. نظام الاختبار المحسن ----------------------

function startQuiz(topicTitle, questions) {
    clearInterval(timerInterval);
    
    // الحفاظ على آلية التحميل الأصلية
    currentQuestions = questions;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};

    // تسجيل وقت بدء الاختبار
    quizStartTime = new Date();

    document.getElementById('topic-selection').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('quiz-title').textContent = `اختبار: ${topicTitle}`;

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
    
    document.getElementById('question-counter').textContent = 
        `${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    // تحديث النقاط الحالية
    document.getElementById('current-score').textContent = `${score} ${t.score}`;

    let htmlContent = `<div class="question-text">${currentQ.question}</div>`;
    htmlContent += '<div class="options-container">';

    // إضافة تأثيرات بصرية للخيارات
    currentQ.options.forEach((option, index) => {
        htmlContent += `
            <label class="option-label">
                <input type="radio" name="option" value="${option}">
                <span class="option-text">${String.fromCharCode(65 + index)}. ${option}</span>
            </label>
        `;
    });
    htmlContent += '</div>';
    qContainer.innerHTML = htmlContent;
    
    document.getElementById('submit-btn').classList.remove('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('submit-btn').disabled = true;

    // تمكين زر الإرسال عند اختيار خيار
    document.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => {
            document.getElementById('submit-btn').disabled = false;
            // تأثير عند اختيار إجابة
            input.parentElement.style.transform = 'scale(1.02)';
            setTimeout(() => {
                input.parentElement.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// ---------------------- 8. معالجة الإجابات المحسنة ----------------------

function handleAnswerSubmission() {
    clearInterval(timerInterval); 
    
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) {
        showNotification('يرجى اختيار إجابة أولاً', 'warning');
        return;
    }

    const currentQ = currentQuestions[currentQuestionIndex];
    const userAnswer = selectedOption.value;
    const isCorrect = (userAnswer === currentQ.answer);
    
    if (isCorrect) {
        score += POINTS_CORRECT;
        showNotification(`إجابة صحيحة! +${POINTS_CORRECT} نقطة`, 'success');
    } else {
        score += POINTS_WRONG;
        showNotification(`إجابة خاطئة! ${POINTS_WRONG} نقطة`, 'error');
    }

    userAnswers[currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: userAnswer,
        correctAnswer: currentQ.answer,
        isCorrect: isCorrect,
    };

    // تأثيرات بصرية محسنة للإجابات
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
    
    // تحديث إحصائيات المستخدم
    updateUserStats();

    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');

    document.getElementById('final-score').textContent = score;

    const correctAnswers = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const totalQuestions = currentQuestions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const percentage = (score / (totalQuestions * POINTS_CORRECT)) * 100;
    const gradeMessage = document.getElementById('grade-message');
    const t = translations[currentLanguage];
    
    if (percentage >= 90) {
        gradeMessage.innerHTML = t.great_job;
        gradeMessage.style.color = 'var(--correct-color)';
    } else if (percentage >= 70) {
        gradeMessage.innerHTML = t.good_job;
        gradeMessage.style.color = 'var(--neon-blue)';
    } else {
        gradeMessage.innerHTML = t.needs_review;
        gradeMessage.style.color = 'var(--incorrect-color)';
    }

    // تحديث الإحصائيات التفصيلية
    updateResultsDetails(correctAnswers, totalQuestions, totalQuizTime, accuracy);
    
    displayErrorReview();
}

function updateResultsDetails(correct, total, time, accuracy) {
    const t = translations[currentLanguage];
    
    document.getElementById('correct-count').textContent = `${correct}/${total}`;
    document.getElementById('time-taken').textContent = `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`;
    document.getElementById('efficiency-rate').textContent = `${accuracy}%`;
}

function updateUserStats() {
    userStats.totalQuizzes++;
    userStats.totalScore += Math.max(0, score);
    userStats.totalQuestions += currentQuestions.length;
    userStats.correctAnswers += Object.values(userAnswers).filter(a => a.isCorrect).length;
    
    // حفظ الإحصائيات في localStorage
    localStorage.setItem('geologyQuizStats', JSON.stringify(userStats));
}

function displayErrorReview() {
    const reviewArea = document.getElementById('review-area');
    const t = translations[currentLanguage];
    
    reviewArea.innerHTML = `<h3>${t.review_errors}</h3>`;
    let errorsFound = false;
    
    Object.values(userAnswers).forEach(answer => {
        if (!answer.isCorrect) {
            errorsFound = true;
            reviewArea.innerHTML += `
                <div class="review-item">
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
                </div>
            `;
        }
    });
    
    if (!errorsFound) {
        reviewArea.innerHTML = `
            <div class="all-correct">
                <i class="fas fa-trophy"></i>
                <h3>🎉 ممتاز! لا توجد أخطاء لمراجعتها.</h3>
                <p>أداء رائع في اختبار الجيولوجيا!</p>
            </div>
        `;
    }
}

// ---------------------- 10. نظام الإشعارات المحسن ----------------------

function showNotification(message, type = 'info') {
    // إزالة أي إشعار سابق
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // إنشاء إشعار جديد
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
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
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ---------------------- 11. إعداد مستمعي الأحداث المحسن ----------------------

document.addEventListener('DOMContentLoaded', function() {
    // التحكم في القائمة الجانبية
    document.getElementById('open-sidebar-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('overlay').style.display = 'block';
    });
    
    document.getElementById('close-sidebar-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').style.display = 'none';
    });

    // زر البدء
    document.getElementById('start-quiz-btn').addEventListener('click', () => {
        showScreen('topic-selection');
    });

    // معالجة الإجابات
    document.getElementById('submit-btn').addEventListener('click', handleAnswerSubmission);

    // الزر التالي
    document.getElementById('next-btn').addEventListener('click', () => {
        currentQuestionIndex++;
        displayQuestion();
    });

    // زر اختبار جديد
    document.getElementById('new-quiz-btn').addEventListener('click', () => {
        resetQuiz();
        showScreen('topic-selection');
    });

    // تحميل الإحصائيات السابقة
    loadUserStats();
    
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

function loadUserStats() {
    const savedStats = localStorage.getItem('geologyQuizStats');
    if (savedStats) {
        userStats = JSON.parse(savedStats);
    }
}

function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { 
                transform: translateX(-50%) translateY(-100%); 
                opacity: 0; 
            }
            to { 
                transform: translateX(-50%) translateY(0); 
                opacity: 1; 
            }
        }
        
        @keyframes slideOut {
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
        
        .option-label {
            transition: all 0.2s ease;
        }
        
        .topic-card {
            transition: all 0.3s ease;
        }
        
        .topic-card:hover {
            transform: translateY(-5px);
        }
    `;
    document.head.appendChild(style);
}

// تشغيل التهيئة: يبدأ بتحميل البيانات من Question.json
loadGeologyData();