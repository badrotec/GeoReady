// =======================================================
// 1. المتغيرات العالمية والإعدادات
// =======================================================
let geologicalData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval;
let correctAnswersCount = 0;
let wrongAnswersCount = 0;
let quizStartTime;

const TIME_LIMIT = 20;
const POINTS_CORRECT = 5;
const POINTS_WRONG = -3;
let currentLanguage = 'ar';

// إحصائيات محلية
let totalQuizzesCompleted = parseInt(localStorage.getItem('totalQuizzes')) || 0;
let totalScoresSum = parseInt(localStorage.getItem('totalScores')) || 0;
let currentTheme = localStorage.getItem('theme') || 'dark';

// =======================================================
// 2. نظام الترجمة المتعدد اللغات
// =======================================================
const translations = {
    'ar': {
        // تم التعديل إلى "بدء التحدي"
        'start_quiz': 'بدء التحدي', 'choose_domain': 'اختر مجال الاختبار:', 'question': 'السؤال',
        'submit': 'تأكيد الإجابة', 'next': 'التالي', 'skip': 'تخطي', 'review_errors': 'فحص الأخطاء:',
        'your_answer': 'إجابتك:', 'correct_answer': 'الصحيح:', 'great_job': '🌟 أداء استثنائي! معرفة جيولوجية قوية.',
        'good_job': '✨ جيد جداً! أساس متين، لكن هناك مجال للمراجعة.', 'needs_review': '⚠️ تحتاج إلى مراجعة مكثفة لهذه المفاهيم.',
        'new_quiz': 'إعادة تشغيل النظام', 'share_results': 'مشاركة النتائج', 'timer_text': 'ث', 'points': 'النقاط:',
        'correct_answers': 'إجابات صحيحة', 'wrong_answers': 'إجابات خاطئة', 'time_spent': 'الوقت المستغرق',
        'completed_quizzes': 'اختبارات مكتملة', 'avg_success': 'متوسط النجاح', 'timeout_msg': '⏰ انتهى الوقت!',
        'correct_feedback': '✓ إجابة صحيحة! ممتاز', 'incorrect_feedback': '✗ إجابة خاطئة. حاول مرة أخرى',
        'all_correct': '🎉 ممتاز! لا توجد أخطاء لمراجعتها.', 'loading': '... تحليل بيانات النظام', 'unit': 'وحدة'
    },
    'en': {
        // تم التعديل إلى "Start Challenge"
        'start_quiz': 'Start Challenge', 'choose_domain': 'Select Training Unit:', 'question': 'Question',
        'submit': 'Confirm Answer', 'next': 'Next', 'skip': 'Skip', 'review_errors': 'Review Errors:',
        'your_answer': 'Your Answer:', 'correct_answer': 'Correct:', 'great_job': '🌟 Exceptional performance! Strong geological knowledge.',
        'good_job': '✨ Very good! Solid foundation, but room for review.', 'needs_review': '⚠️ Requires intensive review of these concepts.',
        'new_quiz': 'Restart System', 'share_results': 'Share Results', 'timer_text': 's', 'points': 'Points:',
        'correct_answers': 'Correct Answers', 'wrong_answers': 'Wrong Answers', 'time_spent': 'Time Spent',
        'completed_quizzes': 'Completed Quizzes', 'avg_success': 'Average Success', 'timeout_msg': '⏰ Time is up!',
        'correct_feedback': '✓ Correct answer! Excellent', 'incorrect_feedback': '✗ Wrong answer. Try again',
        'all_correct': '🎉 Excellent! No errors to review.', 'loading': '... Analyzing system data', 'unit': 'Unit'
    },
    'fr': {
        // تم التعديل إلى "Commencer le Défi"
        'start_quiz': 'Commencer le Défi', 'choose_domain': 'Sélectionner Unité:', 'question': 'Question',
        'submit': 'Confirmer', 'next': 'Suivant', 'skip': 'Passer', 'review_errors': 'Analyse d\'Erreur:',
        'your_answer': 'Votre Réponse:', 'correct_answer': 'Correcte:', 'great_job': '🌟 Performance exceptionnelle! Solides connaissances.',
        'good_job': '✨ Très bien! Base solide, mais il y a place à l\'amélioration.', 'needs_review': '⚠️ Nécessite une révision intensive.',
        'new_quiz': 'Redémarrer le Système', 'share_results': 'Partager les Résultats', 'timer_text': 's', 'points': 'Points:',
        'correct_answers': 'Bonnes Réponses', 'wrong_answers': 'Mauvaises Réponses', 'time_spent': 'Temps Passé',
        'completed_quizzes': 'Quiz Complétés', 'avg_success': 'Succès Moyen', 'timeout_msg': '⏰ Temps écoulé!',
        'correct_feedback': '✓ Bonne réponse! Excellent', 'incorrect_feedback': '✗ Mauvaise réponse. Réessayez',
        'all_correct': '🎉 Excellent! Aucune erreur à réviser.', 'loading': '... Analyse des données', 'unit': 'Unité'
    }
};

// =======================================================
// 3. تحميل البيانات من JSON
// =======================================================
async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message').querySelector('.loading-text');
    try {
        const t = translations[currentLanguage];
        loadingMessage.textContent = t.loading;
        
        const response = await fetch('./Question.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        geologicalData = await response.json();
        
        initializeTopicSelection(geologicalData);
        showNotification('✓ تم تحميل البيانات بنجاح', 'success');

    } catch (error) {
        console.error("فشل في تحميل بيانات الجيولوجيا:", error);
        loadingMessage.textContent = `[خطأ الاتصال] عذراً، لا يمكن تحميل البيانات.`;
        document.getElementById('start-quiz-btn').disabled = true;
        showNotification('✗ فشل تحميل البيانات', 'error');
    }
}

// =======================================================
// 4. نظام الإشعارات (Notifications)
// =======================================================
function showNotification(message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    if (!toast) return;

    const messageEl = document.getElementById('notification-message');
    
    messageEl.textContent = message;
    toast.className = 'notification-toast show';
    
    if (type === 'success') {
        toast.style.background = 'linear-gradient(135deg, var(--correct-color), #4CAF50)';
    } else if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, var(--incorrect-color), #dc3545)';
    } else {
        toast.style.background = 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))';
    }

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 400);
    }, 3000);
}


// =======================================================
// 5. نظام المؤقت المتقدم
// =======================================================
function startTimer() {
    clearInterval(timerInterval);
    let timeRemaining = TIME_LIMIT;
    const timerDisplay = document.querySelector('.timer-value');
    const progressBar = document.getElementById('progress-bar-fill');
    const t = translations[currentLanguage];

    progressBar.style.width = '100%';
    timerDisplay.textContent = timeRemaining;

    timerInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;
        
        const progressPercentage = (timeRemaining / TIME_LIMIT) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        if (timeRemaining <= 5) {
            document.querySelector('.timer-display').style.color = 'var(--incorrect-color)';
            document.querySelector('.timer-display').style.animation = 'shake 0.5s infinite';
        } else {
            document.querySelector('.timer-display').style.color = 'var(--neon-blue)';
            document.querySelector('.timer-display').style.animation = 'none';
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

    score = Math.max(0, score + POINTS_WRONG);
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

    showFeedback(false, t.timeout_msg);
    updateScoreDisplay();
    
    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('skip-btn').classList.add('hidden'); 

    
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 2000);
}

// =======================================================
// 6. نظام الترجمة وتحديث الواجهة
// =======================================================
function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar'];

    // تحديث النصوص الرئيسية
    document.getElementById('start-quiz-btn').querySelector('.btn-text').textContent = t.start_quiz;
    document.getElementById('submit-btn').querySelector('.btn-text').textContent = t.submit;
    document.getElementById('next-btn').querySelector('.btn-text').textContent = t.next;
    document.getElementById('skip-btn').querySelector('.btn-text').textContent = t.skip;
    
    document.querySelector('.topics-header').innerHTML = `<i class="fas fa-folder-open"></i> ${t.choose_domain}`;
    document.querySelector('.action-buttons .primary .btn-text').textContent = t.new_quiz;
    document.getElementById('share-results-btn').querySelector('.btn-text').textContent = t.share_results;
    
    // تحديث الإحصائيات في الشريط الجانبي
    updateSidebarStats();
    
    // تحديث شاشة الاختبار إذا كانت مفتوحة
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        document.querySelector('#question-counter').innerHTML = `<i class="fas fa-list-ol"></i> ${t.unit} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        document.querySelector('.timer-unit').textContent = t.timer_text;
        document.querySelector('.review-log-header').innerHTML = `<i class="fas fa-bug"></i> ${t.review_errors}`;
    }
    
    // تحديث نص التحميل
    document.querySelector('#loading-message .loading-text').textContent = t.loading;
}

function changeLanguage(langCode) {
    currentLanguage = langCode;
    document.documentElement.dir = (langCode === 'ar' ? 'rtl' : 'ltr');
    applyTranslation();
    showNotification('✓ تم تغيير اللغة', 'success');
}

function applyTranslation() {
    translateUI(currentLanguage);
}

// =======================================================
// 7. تهيئة القائمة الجانبية والإحصائيات
// =======================================================
function updateSidebarStats() {
    const t = translations[currentLanguage];
    
    const totalQuizzes = parseInt(localStorage.getItem('totalQuizzes')) || 0;
    const totalScores = parseInt(localStorage.getItem('totalScores')) || 0;
    
    // هذه العناصر ليست موجودة في التصميم الحالي، ولكن نترك الدالة جاهزة
    
    // تحديث العناوين
    // لا توجد عناصر إحصائيات في الشريط الجانبي في هذا الإصدار، تم إزالتها للتبسيط.
}

// =======================================================
// 8. التحكم في القائمة الجانبية
// =======================================================
document.getElementById('open-sidebar-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        clearInterval(timerInterval); // إيقاف المؤقت عند فتح القائمة
    }
});

document.getElementById('close-sidebar-btn').addEventListener('click', closeSidebar);
document.getElementById('overlay').addEventListener('click', closeSidebar);

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        startTimer(); // استئناف المؤقت
    }
}


// =======================================================
// 9. تبديل السمة (Theme Toggle) - تم إزالتها من HTML لتبسيط الطلب
// =======================================================
document.body.setAttribute('data-theme', currentTheme);


// =======================================================
// 10. بدء الاختبار وإضافة المواضيع
// =======================================================
document.getElementById('start-quiz-btn').addEventListener('click', () => {
    document.getElementById('start-quiz-btn').classList.add('hidden');
    document.getElementById('topics-list-container').classList.remove('hidden');
    
    const topicCards = document.querySelectorAll('.topic-card');
    topicCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
});

function initializeTopicSelection(data) {
    const topicsList = document.getElementById('topics-list');
    const sidebarList = document.getElementById('sidebar-topics-list');
    const loadingMessage = document.getElementById('loading-message');

    if (loadingMessage) loadingMessage.classList.add('hidden');
    topicsList.innerHTML = '';
    sidebarList.innerHTML = '';

    Object.keys(data).forEach((topic, index) => {
        const topicDisplayName = topic.replace(/_/g, ' ');

        // بطاقة الموضوع في الشبكة الرئيسية
        const gridCard = document.createElement('div');
        gridCard.className = 'topic-card animated-fade';
        gridCard.style.animationDelay = `${index * 0.1}s`;
        gridCard.innerHTML = `
            <i class="fas fa-layer-group" style="font-size: 2em; color: var(--neon-cyan); margin-bottom: 15px; display: block;"></i>
            ${topicDisplayName}
        `;
        
        // رابط في القائمة الجانبية
        const sidebarLink = document.createElement('a');
        sidebarLink.href = "#";
        sidebarLink.innerHTML = `<i class="fas fa-chevron-left" style="margin-left: 10px;"></i> ${topicDisplayName}`;
        
        const startQuizHandler = (e) => {
            e.preventDefault();
            startQuiz(topicDisplayName, data[topic]);
            closeSidebar();
        };
        
        gridCard.addEventListener('click', startQuizHandler);
        sidebarLink.addEventListener('click', startQuizHandler);
        
        topicsList.appendChild(gridCard);
        sidebarList.appendChild(sidebarLink);
    });
    
    applyTranslation();
}

// =======================================================
// 11. بدء الاختبار (تحميل الـ 25 سؤال بالكامل)
// =======================================================
function startQuiz(topicTitle, questions) {
    clearInterval(timerInterval);
    
    // **ضمان تحميل الـ 25 سؤال بالكامل**
    currentQuestions = shuffleArray([...questions]);
    
    currentQuestionIndex = 0;
    score = 0;
    correctAnswersCount = 0;
    wrongAnswersCount = 0;
    userAnswers = {};
    quizStartTime = Date.now();

    document.getElementById('topic-selection').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('quiz-title').innerHTML = `<i class="fas fa-vials"></i> اختبار: ${topicTitle}`;
    
    document.body.dataset.quizStart = quizStartTime; // حفظ وقت بداية الاختبار

    updateScoreDisplay();
    displayQuestion();
    
    showNotification('✓ بدأ التحدي!', 'success');
}

// دالة خلط الأسئلة عشوائياً
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// =======================================================
// 12. عرض السؤال
// =======================================================
function displayQuestion() {
    clearInterval(timerInterval);
    const qContainer = document.getElementById('question-container');
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];

    if (!currentQ) {
        return showResults();
    }
    
    startTimer();
    
    // تحديث عداد الأسئلة
    document.getElementById('question-counter').innerHTML = 
        `<i class="fas fa-list-ol"></i> ${t.unit} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;

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
    
    // تطبيق تأثير الظهور
    qContainer.style.animation = 'none'; // Reset animation
    void qContainer.offsetWidth; // Trigger reflow
    qContainer.style.animation = 'fadeInUp 0.6s ease-out';
    
    document.getElementById('submit-btn').classList.remove('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('skip-btn').classList.remove('hidden');
    document.getElementById('submit-btn').disabled = true;

    // تمكين زر الإرسال عند اختيار خيار
    document.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => {
            document.getElementById('submit-btn').disabled = false;
        });
    });
}

// =======================================================
// 13. تحديث عرض النقاط
// =======================================================
function updateScoreDisplay() {
    // لا يوجد عرض للنقاط أثناء الاختبار في هذا الإصدار لتبسيط الواجهة
}

// =======================================================
// 14. عرض التغذية الراجعة
// =======================================================
function showFeedback(isCorrect, message) {
    const feedbackContainer = document.getElementById('feedback-container');
    feedbackContainer.className = 'feedback-message';
    feedbackContainer.classList.add(isCorrect ? 'correct-feedback' : 'incorrect-feedback');
    feedbackContainer.innerHTML = `<i class="fas fa-${isCorrect ? 'check-circle' : 'times-circle'}"></i> ${message}`;
    feedbackContainer.classList.remove('hidden');
    feedbackContainer.style.animation = 'fadeInUp 0.5s ease-out';
}

// =======================================================
// 15. معالجة الإجابة
// =======================================================
document.getElementById('submit-btn').addEventListener('click', () => {
    clearInterval(timerInterval); // إيقاف المؤقت عند الإجابة
    
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) return;

    const currentQ = currentQuestions[currentQuestionIndex];
    const userAnswer = selectedOption.value;
    const isCorrect = (userAnswer === currentQ.answer);
    const t = translations[currentLanguage];
    
    if (isCorrect) {
        score += POINTS_CORRECT;
        correctAnswersCount++;
        showFeedback(true, t.correct_feedback);
    } else {
        score = Math.max(0, score + POINTS_WRONG);
        wrongAnswersCount++;
        showFeedback(false, t.incorrect_feedback);
    }

    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: userAnswer,
        correctAnswer: currentQ.answer,
        isCorrect: isCorrect,
    };

    // تعطيل جميع الخيارات وإظهار الإجابة الصحيحة
    document.querySelectorAll('input[name="option"]').forEach(input => {
        input.disabled = true;
        const label = input.closest('.option-label');

        if (input.value === currentQ.answer) {
            label.classList.add('correct');
        } else if (input.value === userAnswer) {
            label.classList.add('incorrect');
        }
    });

    
    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('skip-btn').classList.add('hidden'); // إخفاء زر التخطي بعد الإجابة
});

// =======================================================
// 16. الانتقال للسؤال التالي
// =======================================================
document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
});

// =======================================================
// 17. تخطي السؤال
// =======================================================
document.getElementById('skip-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    const t = translations[currentLanguage];
    
    const currentQ = currentQuestions[currentQuestionIndex];
    score = Math.max(0, score + POINTS_WRONG);
    wrongAnswersCount++;
    
    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: `(${t.skip})`,
        correctAnswer: currentQ.answer,
        isCorrect: false,
    };
    
    showNotification(`⏭ تم تخطي السؤال`, 'info');
    
    currentQuestionIndex++;
    displayQuestion();
});

// =======================================================
// 18. عرض النتائج مع التأثيرات المتقدمة
// =======================================================
function showResults() {
    clearInterval(timerInterval);
    
    const quizEndTime = Date.now();
    const quizStartTime = parseFloat(document.body.dataset.quizStart) || Date.now();
    const totalTimeSeconds = Math.floor((quizEndTime - quizStartTime) / 1000);
    const minutes = Math.floor(totalTimeSeconds / 60);
    const seconds = totalTimeSeconds % 60;
    
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');

    const t = translations[currentLanguage];
    
    // تحديث النتائج
    document.getElementById('total-questions-count').textContent = currentQuestions.length;
    document.getElementById('correct-count').textContent = correctAnswersCount;
    document.getElementById('wrong-count').textContent = wrongAnswersCount;
    document.getElementById('total-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}${t.timer_text}`;

    // حساب النسبة المئوية
    const maxPossibleScore = currentQuestions.length * POINTS_CORRECT;
    const percentage = Math.max(0, Math.round((score / maxPossibleScore) * 100));
    
    document.getElementById('final-score').textContent = `${percentage}%`; // عرض النسبة المئوية كدرجة نهائية
    
    // رسالة التقييم
    const gradeMessage = document.getElementById('grade-message');
    
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
    
    // حفظ الإحصائيات (Local Storage)
    totalQuizzesCompleted++;
    totalScoresSum += percentage;
    localStorage.setItem('totalQuizzes', totalQuizzesCompleted);
    localStorage.setItem('totalScores', totalScoresSum);
    // updateSidebarStats(); // تم إزالة الإحصائيات من الشريط الجانبي
    
    showNotification('✓ اكتمل التحدي!', 'success');
}

// =======================================================
// 19. رسم الدائرة المتحركة للنقاط
// =======================================================
function animateScoreCircle(percentage) {
    const svg = document.querySelector('.progress-ring');
    const circle = document.querySelector('.progress-ring-fill');
    if (!circle) return;
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;
    
    // إنشاء التدرج اللوني إذا لم يكن موجوداً
    if (!document.querySelector('#scoreGradient')) {
        const svg = document.querySelector('.progress-ring');
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'scoreGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        gradient.innerHTML = `
            <stop offset="0%" style="stop-color: var(--neon-blue); stop-opacity: 1" />
            <stop offset="100%" style="stop-color: var(--neon-purple); stop-opacity: 1" />
        `;
        defs.appendChild(gradient);
        svg.insertBefore(defs, svg.firstChild);
    }
    
    setTimeout(() => {
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }, 100);
}

// =======================================================
// 20. مشاركة النتائج
// =======================================================
document.getElementById('share-results-btn').addEventListener('click', () => {
    const t = translations[currentLanguage];
    const scoreValue = document.getElementById('final-score').textContent;
    const totalValue = document.getElementById('total-questions-count').textContent;
    const correctValue = document.getElementById('correct-count').textContent;
    const wrongValue = document.getElementById('wrong-count').textContent;
    
    const shareText = `🎯 GEO-MASTER - تقرير التحدي:\nالنتيجة: ${scoreValue}\nصحيحة: ${correctValue}\nخاطئة: ${wrongValue}\n\n🌍 اختبر معلوماتك الجيولوجية مع Geo-Master!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'GEO-MASTER | تقرير التحدي',
            text: shareText,
        }).then(() => {
            showNotification('✓ تمت المشاركة بنجاح', 'success');
        }).catch(() => {
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('✓ تم نسخ النتائج', 'success');
    }).catch(() => {
        showNotification('✗ فشل النسخ', 'error');
    });
}

// =======================================================
// 21. تهيئة التطبيق عند التحميل
// =======================================================
window.addEventListener('DOMContentLoaded', () => {
    // initParticles(); // تم إزالة تأثير الجزيئات لتبسيط الكود والتركيز على الطلب
    loadGeologyData();
    // updateSidebarStats(); // تم إزالة الإحصائيات من الشريط الجانبي
    applyTranslation(); // تطبيق الترجمة عند التحميل الأولي
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
            // Enter للتأكيد
            if (e.key === 'Enter' && !document.getElementById('submit-btn').disabled) {
                document.getElementById('submit-btn').click();
            }
            // Space للتالي
            if (e.key === ' ' && !document.getElementById('next-btn').classList.contains('hidden')) {
                e.preventDefault();
                document.getElementById('next-btn').click();
            }
        }
    });
    
    // Add event listeners for options (for keyboard selection display)
    document.addEventListener('change', (e) => {
        if (e.target.name === 'option') {
            document.querySelectorAll('.option-label').forEach(label => label.classList.remove('selected'));
            e.target.closest('.option-label').classList.add('selected');
        }
    });
});
