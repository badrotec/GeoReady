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
        'start_quiz': 'بدء الاتصال بالنظام', 'choose_domain': 'اختر مجال الاختبار:', 'question': 'السؤال',
        'submit': 'تأكيد الإجابة', 'next': 'السؤال التالي', 'skip': 'تخطي', 'review_errors': 'فحص الأخطاء:',
        'your_answer': 'إجابتك:', 'correct_answer': 'الصحيح:', 'great_job': '🌟 أداء استثنائي! معرفة جيولوجية قوية.',
        'good_job': '✨ جيد جداً! أساس متين، لكن هناك مجال للمراجعة.', 'needs_review': '⚠️ تحتاج إلى مراجعة مكثفة لهذه المفاهيم.',
        'new_quiz': 'إعادة تشغيل النظام', 'share_results': 'مشاركة النتائج', 'timer_text': 'ث', 'points': 'النقاط:',
        'correct_answers': 'إجابات صحيحة', 'wrong_answers': 'إجابات خاطئة', 'time_spent': 'الوقت المستغرق',
        'completed_quizzes': 'اختبارات مكتملة', 'avg_success': 'متوسط النجاح', 'timeout_msg': '⏰ انتهى الوقت!',
        'correct_feedback': '✓ إجابة صحيحة! ممتاز', 'incorrect_feedback': '✗ إجابة خاطئة. حاول مرة أخرى',
        'all_correct': '🎉 ممتاز! لا توجد أخطاء لمراجعتها.', 'loading': '... تحليل بيانات النظام', 'unit': 'وحدة'
    },
    'en': {
        'start_quiz': 'Start System Connection', 'choose_domain': 'Select Training Unit:', 'question': 'Question',
        'submit': 'Confirm Answer', 'next': 'Next Question', 'skip': 'Skip', 'review_errors': 'Review Errors:',
        'your_answer': 'Your Answer:', 'correct_answer': 'Correct:', 'great_job': '🌟 Exceptional performance! Strong geological knowledge.',
        'good_job': '✨ Very good! Solid foundation, but room for review.', 'needs_review': '⚠️ Requires intensive review of these concepts.',
        'new_quiz': 'Restart System', 'share_results': 'Share Results', 'timer_text': 's', 'points': 'Points:',
        'correct_answers': 'Correct Answers', 'wrong_answers': 'Wrong Answers', 'time_spent': 'Time Spent',
        'completed_quizzes': 'Completed Quizzes', 'avg_success': 'Average Success', 'timeout_msg': '⏰ Time is up!',
        'correct_feedback': '✓ Correct answer! Excellent', 'incorrect_feedback': '✗ Wrong answer. Try again',
        'all_correct': '🎉 Excellent! No errors to review.', 'loading': '... Analyzing system data', 'unit': 'Unit'
    },
    'fr': {
        'start_quiz': 'Connexion Système', 'choose_domain': 'Sélectionner Unité:', 'question': 'Question',
        'submit': 'Confirmer', 'next': 'Question Suivante', 'skip': 'Passer', 'review_errors': 'Analyse d\'Erreur:',
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
    const loadingMessage = document.getElementById('loading-message');
    try {
        const t = translations[currentLanguage];
        loadingMessage.querySelector('p').textContent = t.loading;
        
        const response = await fetch('./Question.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        geologicalData = await response.json();
        
        initializeTopicSelection(geologicalData);
        showNotification('✓ تم تحميل البيانات بنجاح', 'success');

    } catch (error) {
        console.error("فشل في تحميل بيانات الجيولوجيا:", error);
        loadingMessage.querySelector('p').textContent = `[خطأ الاتصال] عذراً، لا يمكن تحميل البيانات.`;
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
// 5. خلفية الجزيئات المتحركة (Particles Canvas)
// =======================================================
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 80;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = `rgba(0, 217, 255, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.strokeStyle = `rgba(0, 217, 255, ${0.2 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connectParticles();
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// =======================================================
// 6. نظام المؤقت المتقدم
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
    document.getElementById('skip-btn').classList.add('hidden'); // إخفاء زر التخطي

    
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 2000);
}

// =======================================================
// 7. نظام الترجمة وتحديث الواجهة
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
        document.querySelector('#question-counter').innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        document.querySelector('.timer-unit').textContent = t.timer_text;
        document.querySelector('.review-log h3').innerHTML = `<i class="fas fa-bug"></i> ${t.review_errors}`;
    }
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
// 8. تهيئة القائمة الجانبية والإحصائيات
// =======================================================
function updateSidebarStats() {
    const t = translations[currentLanguage];
    
    const totalQuizzes = parseInt(localStorage.getItem('totalQuizzes')) || 0;
    const totalScores = parseInt(localStorage.getItem('totalScores')) || 0;

    document.getElementById('total-quizzes').textContent = totalQuizzes;
    
    const avgScore = totalQuizzes > 0 
        ? Math.round((totalScores / totalQuizzes))
        : 0;
    document.getElementById('avg-score').textContent = `${avgScore}%`;
    
    // تحديث العناوين
    const completedQuizzesEl = document.querySelector('.stats-container .stat-item:nth-child(1) p');
    const avgSuccessEl = document.querySelector('.stats-container .stat-item:nth-child(2) p');
    if (completedQuizzesEl) completedQuizzesEl.textContent = t.completed_quizzes;
    if (avgSuccessEl) avgSuccessEl.textContent = t.avg_success;
}

// =======================================================
// 9. التحكم في القائمة الجانبية
// =======================================================
document.getElementById('open-sidebar-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
    clearInterval(timerInterval); // **إيقاف المؤقت**
});

document.getElementById('close-sidebar-btn').addEventListener('click', closeSidebar);

document.getElementById('overlay').addEventListener('click', closeSidebar);

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        startTimer(); // **استئناف المؤقت**
    }
}

// =======================================================
// 10. تبديل السمة (Theme Toggle)
// =======================================================
document.body.setAttribute('data-theme', currentTheme);
updateThemeIcon();

document.getElementById('theme-toggle').addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
    showNotification('✓ تم تغيير السمة', 'success');
});

function updateThemeIcon() {
    const icon = document.getElementById('theme-toggle').querySelector('i');
    icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// =======================================================
// 11. بدء الاختبار وإضافة المواضيع
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
// 12. بدء الاختبار
// =======================================================
function startQuiz(topicTitle, questions) {
    clearInterval(timerInterval);
    
    // **التعديل هنا:** إزالة .slice(0, 10) للاحتفاظ بجميع الأسئلة (25 سؤالاً)
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
    
    showNotification('✓ بدأ الاختبار!', 'success');
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
// 13. عرض السؤال
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
// 14. تحديث عرض النقاط
// =======================================================
function updateScoreDisplay() {
    document.getElementById('current-score').textContent = score;
}

// =======================================================
// 15. عرض التغذية الراجعة
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
// 16. معالجة الإجابة
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

    updateScoreDisplay();
    
    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    document.getElementById('skip-btn').classList.add('hidden'); // إخفاء زر التخطي بعد الإجابة
});

// =======================================================
// 17. الانتقال للسؤال التالي
// =======================================================
document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
});

// =======================================================
// 18. تخطي السؤال
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
// 19. عرض النتائج مع التأثيرات المتقدمة
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
    document.getElementById('final-score').textContent = score;
    document.getElementById('total-questions-count').textContent = currentQuestions.length;
    document.getElementById('correct-count').textContent = correctAnswersCount;
    document.getElementById('wrong-count').textContent = wrongAnswersCount;
    document.getElementById('total-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}${t.timer_text}`;

    // حساب النسبة المئوية
    const maxPossibleScore = currentQuestions.length * POINTS_CORRECT;
    const percentage = Math.max(0, Math.round((score / maxPossibleScore) * 100));
    
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
    updateSidebarStats();
    
    showNotification('✓ اكتمل الاختبار!', 'success');
}

// =======================================================
// 20. رسم الدائرة المتحركة للنقاط
// =======================================================
function animateScoreCircle(percentage) {
    const circle = document.querySelector('.progress-ring-fill');
    if (!circle) return;
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;
    
    if (!document.querySelector('#scoreGradient')) {
        const svg = document.querySelector('.progress-ring');
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'scoreGradient');
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
// 21. مشاركة النتائج
// =======================================================
document.getElementById('share-results-btn').addEventListener('click', () => {
    const t = translations[currentLanguage];
    const scoreValue = document.getElementById('final-score').textContent;
    const totalValue = document.getElementById('total-questions-count').textContent;
    const correctValue = document.getElementById('correct-count').textContent;
    const wrongValue = document.getElementById('wrong-count').textContent;
    
    const shareText = `🎯 GEO-MASTER Results:\nScore: ${scoreValue} Points\nTotal Questions: ${totalValue}\nCorrect: ${correctValue}\nWrong: ${wrongValue}\n\n🌍 Test your geology knowledge with Geo-Master!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'GEO-MASTER V2.0',
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
// 22. تهيئة التطبيق عند التحميل
// =======================================================
window.addEventListener('DOMContentLoaded', () => {
    initParticles();
    loadGeologyData();
    updateSidebarStats();
    
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
