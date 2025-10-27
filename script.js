// =======================================================
// 1. المتغيرات العالمية والإعدادات (المحدثة)
// =======================================================
let geologicalData = {}; 
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval;
let quizStartTime; // تمت إضافة متغير لتتبع وقت بدء الاختبار
let correctAnswersCount = 0; // تمت إضافة عداد للإجابات الصحيحة
let wrongAnswersCount = 0; // تمت إضافة عداد للإجابات الخاطئة
let totalTimeSeconds = 0; // تمت إضافة متغير لتتبع الوقت الكلي

const QUIZ_LENGTH = 25; // العدد المطلوب من الأسئلة
const TIME_LIMIT = 20;
const POINTS_CORRECT = 5;
const POINTS_WRONG = -3;
let currentLanguage = 'ar';

const translations = {
    'ar': {
        'start_quiz': 'بدء الاتصال بالنظام',
        'choose_domain': 'اختر مجال الاختبار:',
        'question': 'السؤال',
        'submit': 'تأكيد الإجابة',
        'next': 'السؤال التالي',
        'skip': 'تخطي',
        'review_errors': 'فحص الأخطاء:',
        'your_answer': 'إجابتك:',
        'correct_answer': 'الصحيح:',
        'great_job': '🌟 أداء استثنائي! معرفة جيولوجية قوية.',
        'good_job': '✨ جيد جداً! أساس متين، لكن هناك مجال للمراجعة.',
        'needs_review': '⚠️ تحتاج إلى مراجعة مكثفة لهذه المفاهيم.',
        'new_quiz': 'إعادة تشغيل النظام',
        'share_results': 'مشاركة النتائج',
        'timer_text': 'ث',
        'points': 'النقاط:',
        'correct_answers': 'إجابات صحيحة',
        'wrong_answers': 'إجابات خاطئة',
        'time_spent': 'الوقت المستغرق',
        'timeout_msg': '⏰ انتهى الوقت!',
        'loading': '... جاري تحميل بيانات النظام',
        'all_correct': '🎉 ممتاز! لا توجد أخطاء لمراجعتها.',
    },
    'en': {
        'start_quiz': 'Start System Connection',
        'choose_domain': 'Choose Quiz Domain:',
        'question': 'Question',
        'submit': 'Submit Answer',
        'next': 'Next Question',
        'skip': 'Skip',
        'review_errors': 'Review Errors:',
        'your_answer': 'Your Answer:',
        'correct_answer': 'Correct:',
        'great_job': '🌟 Exceptional performance! Strong geological knowledge.',
        'good_job': '✨ Very good! Solid foundation, but room for review.',
        'needs_review': '⚠️ Requires intensive review of these concepts.',
        'new_quiz': 'Restart System',
        'share_results': 'Share Results',
        'timer_text': 's',
        'points': 'Points:',
        'correct_answers': 'Correct Answers',
        'wrong_answers': 'Wrong Answers',
        'time_spent': 'Time Spent',
        'timeout_msg': '⏰ Time is up!',
        'loading': '... Loading system data',
        'all_correct': '🎉 Excellent! No errors to review.',
    },
    'fr': {
        'start_quiz': 'Démarrer la Connexion',
        'choose_domain': 'Choisissez un domaine:',
        'question': 'Question',
        'submit': 'Soumettre',
        'next': 'Question Suivante',
        'skip': 'Passer',
        'review_errors': 'Révision des Erreurs:',
        'your_answer': 'Votre Réponse:',
        'correct_answer': 'Correcte:',
        'great_job': '🌟 Performance exceptionnelle! Solides connaissances.',
        'good_job': '✨ Très bien! Base solide, mais place à l\'amélioration.',
        'needs_review': '⚠️ Nécessite une révision intensive.',
        'new_quiz': 'Redémarrer',
        'share_results': 'Partager les Résultats',
        'timer_text': 's',
        'points': 'Points:',
        'correct_answers': 'Bonnes Réponses',
        'wrong_answers': 'Mauvaises Réponses',
        'time_spent': 'Temps Passé',
        'timeout_msg': '⏰ Temps écoulé!',
        'loading': '... Analyse des données',
        'all_correct': '🎉 Excellent! Aucune erreur à réviser.',
    }
};

// =======================================================
// 2. دالة تحميل البيانات (المحدثة)
// =======================================================

// دالة خلط الأسئلة عشوائياً
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    const t = translations[currentLanguage];
    
    try {
        loadingMessage.querySelector('p').textContent = t.loading;
        
        const response = await fetch('./Question.json'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        geologicalData = await response.json();
        
        initializeTopicSelection(geologicalData); 

    } catch (error) {
        console.error("فشل في تحميل بيانات الجيولوجيا:", error);
        loadingMessage.querySelector('p').textContent = `[خطأ الاتصال] عذراً، لا يمكن تحميل البيانات.`;
        document.getElementById('start-quiz-btn').disabled = true;
    }
}

// =======================================================
// 3. منطق المؤقت والتحكم
// =======================================================

function startTimer() {
    clearInterval(timerInterval);
    let timeRemaining = TIME_LIMIT;
    const timerDisplay = document.querySelector('.timer-value');
    const progressBar = document.getElementById('progress-bar-fill');
    
    progressBar.style.width = '100%';
    timerDisplay.textContent = timeRemaining;
    
    const timerElement = document.querySelector('.timer-display');
    timerElement.style.color = 'var(--neon-blue)';
    timerElement.style.animation = 'pulseGlow 2s ease-in-out infinite';

    timerInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;
        
        const progressPercentage = (timeRemaining / TIME_LIMIT) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        if (timeRemaining <= 5) {
            timerElement.style.color = 'var(--incorrect-color)';
            timerElement.style.animation = 'shake 0.5s infinite';
        } else {
            timerElement.style.color = 'var(--neon-blue)';
            timerElement.style.animation = 'pulseGlow 2s ease-in-out infinite';
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

    if (!currentQ) {
        currentQuestionIndex++;
        return displayQuestion(); 
    }

    score += POINTS_WRONG; 
    wrongAnswersCount++;
    
    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: t.timeout_msg,
        correctAnswer: currentQ.answer,
        isCorrect: false,
    };
    
    document.querySelectorAll('.option-label').forEach(label => {
        label.querySelector('input').disabled = true;
        if (label.querySelector('input').value === currentQ.answer) {
            label.classList.add('correct'); 
        }
    });

    // تحديث عرض النقاط (مطلوبة من الدالة الأصلية)
    updateScoreDisplay(); 

    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    
    // تأخير بسيط قبل الانتقال للسؤال التالي
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 2000);
}

// دالة الترجمة وتحديث الواجهة (تم دمجها مع الكود الأصلي)
function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar'];

    // تحديث النصوص الرئيسية
    document.getElementById('start-quiz-btn').querySelector('.btn-text').textContent = t.start_quiz;
    document.getElementById('submit-btn').querySelector('.btn-text').textContent = t.submit;
    document.getElementById('next-btn').querySelector('.btn-text').textContent = t.next;
    document.getElementById('skip-btn').querySelector('.btn-text').textContent = t.skip;
    
    const topicsHeader = document.querySelector('.topics-header');
    if (topicsHeader) {
        topicsHeader.innerHTML = `<i class="fas fa-folder-open"></i> ${t.choose_domain}`;
    }
    
    // تحديث نصوص شاشة النتائج
    const restartBtn = document.querySelector('.action-buttons .primary .btn-text');
    if (restartBtn) {
        restartBtn.textContent = t.new_quiz;
    }
    const shareBtn = document.getElementById('share-results-btn');
    if (shareBtn) {
        shareBtn.querySelector('.btn-text').textContent = t.share_results;
    }

    // تحديث نصوص شاشة الاختبار
    const timerUnit = document.querySelector('.timer-unit');
    if (timerUnit) {
        timerUnit.textContent = t.timer_text;
    }
    
    // تحديث عداد النقاط
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
         scoreDisplay.innerHTML = `<i class="fas fa-star"></i> ${t.points} <span id="current-score">${score}</span>`;
    }
    
    // تحديث عداد الأسئلة
    const questionCounter = document.getElementById('question-counter');
    if (questionCounter) {
        questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    }
}

function changeLanguage(langCode) {
    translateUI(langCode);
}

// =======================================================
// 4. التهيئة ومنطق بدء التشغيل
// =======================================================

// التحكم في القائمة الجانبية (من الكود الأصلي)
document.getElementById('open-sidebar-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
});
document.getElementById('close-sidebar-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
});
document.getElementById('overlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
});


// إضافة حدث زر "ابدأ" (من الكود الأصلي)
document.getElementById('start-quiz-btn').addEventListener('click', () => {
    document.getElementById('start-quiz-btn').classList.add('hidden');
    document.getElementById('topics-list-container').classList.remove('hidden');
});


function initializeTopicSelection(data) {
    const topicsList = document.getElementById('topics-list'); 
    const sidebarList = document.getElementById('sidebar-topics-list');
    const loadingMessage = document.getElementById('loading-message');

    if (loadingMessage) loadingMessage.classList.add('hidden');
    topicsList.innerHTML = '';
    sidebarList.innerHTML = '';

    Object.keys(data).forEach(topic => {
        const topicDisplayName = topic.replace(/_/g, ' ');

        const gridCard = document.createElement('div');
        gridCard.className = 'topic-card animated-fade';
        gridCard.innerHTML = `<i class="fas fa-layer-group" style="font-size: 2em; color: var(--neon-cyan); margin-bottom: 15px; display: block;"></i> ${topicDisplayName}`;
        
        const sidebarLink = document.createElement('a');
        sidebarLink.href = "#";
        sidebarLink.innerHTML = `<i class="fas fa-chevron-left" style="margin-left: 10px;"></i> ${topicDisplayName}`;
        
        const startQuizHandler = (e) => {
            e.preventDefault();
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

// =======================================================
// 5. منطق الاختبار (محدثة لاختيار 25 سؤال)
// =======================================================

function startQuiz(topicTitle, questions) {
    clearInterval(timerInterval);
    
    // **التعديل هنا:** اختيار 25 سؤال عشوائي
    currentQuestions = shuffleArray([...questions]).slice(0, QUIZ_LENGTH);
    
    currentQuestionIndex = 0;
    score = 0;
    correctAnswersCount = 0;
    wrongAnswersCount = 0;
    userAnswers = {};
    quizStartTime = Date.now(); // بدء تسجيل الوقت

    document.getElementById('topic-selection').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('quiz-title').innerHTML = `<i class="fas fa-vials"></i> اختبار: ${topicTitle}`;

    updateScoreDisplay(); // تحديث النقاط (التي تبدأ من 0)
    displayQuestion();
}

function displayQuestion() {
    clearInterval(timerInterval); 
    const qContainer = document.getElementById('question-container');
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];

    if (!currentQ) {
        // إذا لم يعد هناك أسئلة، اعرض النتائج
        return showResults();
    }
    
    startTimer();
    
    // تحديث عداد الأسئلة
    document.getElementById('question-counter').innerHTML = 
        `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    // إخفاء رسالة التغذية الراجعة
    document.getElementById('feedback-container').classList.add('hidden');

    let htmlContent = `<p class="question-text">${currentQ.question}</p>`;
    htmlContent += '<div class="options-container">';

    // خلط الخيارات عشوائياً
    const shuffledOptions = shuffleArray([...currentQ.options]);

    shuffledOptions.forEach((option, index) => {
        htmlContent += `
            <label class="option-label" style="animation-delay: ${index * 0.1}s">
                <input type="radio" name="option" value="${option}">
                <span class="option-text">${option}</span>
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
        });
    });
}

// دالة تحديث عرض النقاط
function updateScoreDisplay() {
    document.getElementById('current-score').textContent = score;
}

// =======================================================
// 6. معالجة الإجابة
// =======================================================

document.getElementById('submit-btn').addEventListener('click', () => {
    clearInterval(timerInterval); 
    
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) return;

    const currentQ = currentQuestions[currentQuestionIndex];
    const userAnswer = selectedOption.value;
    const isCorrect = (userAnswer === currentQ.answer);
    const t = translations[currentLanguage];
    
    // تحديد النقاط وتحديث العدادات
    if (isCorrect) {
        score += POINTS_CORRECT;
        correctAnswersCount++;
        showFeedback(true, t.correct_feedback || '✓ إجابة صحيحة! ممتاز');
    } else {
        score += POINTS_WRONG;
        wrongAnswersCount++;
        showFeedback(false, t.incorrect_feedback || '✗ إجابة خاطئة. حاول مرة أخرى');
    }

    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: userAnswer,
        correctAnswer: currentQ.answer,
        isCorrect: isCorrect,
    };

    // تعطيل جميع الخيارات وإظهار الإجابة الصحيحة
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true; 

        if (input.value === currentQ.answer) {
            label.classList.add('correct'); 
        } else if (input.value === userAnswer && !isCorrect) {
            label.classList.add('incorrect'); 
        }
    });
    
    updateScoreDisplay();

    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
});

// دالة عرض التغذية الراجعة
function showFeedback(isCorrect, message) {
    const feedbackContainer = document.getElementById('feedback-container');
    feedbackContainer.className = 'feedback-message';
    feedbackContainer.classList.add(isCorrect ? 'correct-feedback' : 'incorrect-feedback');
    feedbackContainer.innerHTML = `<i class="fas fa-${isCorrect ? 'check-circle' : 'times-circle'}"></i> ${message}`;
    feedbackContainer.classList.remove('hidden');
}


document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
});

// دالة التخطي (محدثة)
document.getElementById('skip-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    const t = translations[currentLanguage];
    
    const currentQ = currentQuestions[currentQuestionIndex];
    
    if (!currentQ) {
        currentQuestionIndex++;
        return displayQuestion(); 
    }
    
    // يتم احتساب التخطي كإجابة خاطئة
    score += POINTS_WRONG;
    wrongAnswersCount++;
    
    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: `(${t.skip})`,
        correctAnswer: currentQ.answer,
        isCorrect: false,
    };
    
    currentQuestionIndex++;
    displayQuestion();
});

// =======================================================
// 7. عرض النتائج (محدثة)
// =======================================================

function showResults() {
    clearInterval(timerInterval); 
    
    const quizEndTime = Date.now();
    totalTimeSeconds = Math.floor((quizEndTime - quizStartTime) / 1000);
    const minutes = Math.floor(totalTimeSeconds / 60);
    const seconds = totalTimeSeconds % 60;
    
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');

    const t = translations[currentLanguage];
    
    // تحديث النتائج
    document.getElementById('final-score').textContent = correctAnswersCount;
    document.getElementById('total-questions-count').textContent = currentQuestions.length;
    document.getElementById('correct-count').textContent = correctAnswersCount;
    document.getElementById('wrong-count').textContent = wrongAnswersCount;
    document.getElementById('total-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // حساب النسبة المئوية للإجابات الصحيحة
    const percentage = Math.round((correctAnswersCount / currentQuestions.length) * 100) || 0;
    
    // رسالة التقييم
    const gradeMessage = document.getElementById('grade-message');
    
    if (percentage >= 90) {
        gradeMessage.innerHTML = t.great_job;
        gradeMessage.style.color = 'var(--correct-color)';
        gradeMessage.style.borderColor = 'var(--correct-color)';
    } else if (percentage >= 70) {
        gradeMessage.innerHTML = t.good_job;
        gradeMessage.style.color = 'var(--neon-blue)';
        gradeMessage.style.borderColor = 'var(--neon-blue)';
    } else {
        gradeMessage.innerHTML = t.needs_review;
        gradeMessage.style.color = 'var(--incorrect-color)';
        gradeMessage.style.borderColor = 'var(--incorrect-color)';
    }

    // رسم الدائرة المتقدمة
    animateScoreCircle(percentage);

    // مراجعة الأخطاء
    const reviewContent = document.getElementById('review-content');
    reviewContent.innerHTML = '';
    let errorsFound = false;
    
    Object.values(userAnswers).forEach((answer, index) => {
        if (!answer.isCorrect) {
            errorsFound = true;
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.style.animationDelay = `${index * 0.1}s`;
            reviewItem.innerHTML = `
                <p class="error-q"><i class="fas fa-question-circle"></i> ${answer.question}</p>
                <p class="error-a">${t.your_answer} <span class="wrong">${answer.userAnswer}</span></p>
                <p class="error-a">${t.correct_answer} <span class="right">${answer.correctAnswer}</span></p>
            `;
            reviewContent.appendChild(reviewItem);
        }
    });
    
    if (!errorsFound) {
        reviewContent.innerHTML = `<p class="all-correct">${t.all_correct}</p>`;
    }
}

// دالة رسم الدائرة المتحركة للنقاط (من الكود الأصلي)
function animateScoreCircle(percentage) {
    const circle = document.querySelector('.progress-ring-fill');
    if (!circle) return; // تأكد من وجود العنصر

    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;
    
    setTimeout(() => {
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }, 100);
}


// =======================================================
// 8. تشغيل التهيئة
// =======================================================

// تشغيل التهيئة: يبدأ بتحميل البيانات من Question.json
window.addEventListener('DOMContentLoaded', () => {
    // يمكنك هنا إضافة استدعاء لـ initParticles() إذا كانت موجودة في مكان آخر
    loadGeologyData();
});
