// =======================================================
// 1. المتغيرات العالمية والإعدادات
// =======================================================
let geologicalData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval;
let quizStartTime;
let correctAnswersCount = 0;
let wrongAnswersCount = 0;

const TIME_LIMIT = 20;
const POINTS_CORRECT = 5;
const POINTS_WRONG = -3;
let currentLanguage = 'ar';

// إحصائيات محلية
let totalQuizzesCompleted = parseInt(localStorage.getItem('totalQuizzes')) || 0;
let totalScoresSum = parseInt(localStorage.getItem('totalScores')) || 0;

// =======================================================
// 2. نظام الترجمة المتعدد اللغات
// =======================================================
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
        'completed_quizzes': 'اختبارات مكتملة',
        'avg_success': 'متوسط النجاح',
        'timeout_msg': '⏰ انتهى الوقت!',
        'correct_feedback': '✓ إجابة صحيحة! ممتاز',
        'incorrect_feedback': '✗ إجابة خاطئة. حاول مرة أخرى',
        'all_correct': '🎉 ممتاز! لا توجد أخطاء لمراجعتها.',
        'loading': '... تحليل بيانات النظام'
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
        'completed_quizzes': 'Completed Quizzes',
        'avg_success': 'Average Success',
        'timeout_msg': '⏰ Time is up!',
        'correct_feedback': '✓ Correct answer! Excellent',
        'incorrect_feedback': '✗ Wrong answer. Try again',
        'all_correct': '🎉 Excellent! No errors to review.',
        'loading': '... Analyzing system data'
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
        'completed_quizzes': 'Quiz Complétés',
        'avg_success': 'Succès Moyen',
        'timeout_msg': '⏰ Temps écoulé!',
        'correct_feedback': '✓ Bonne réponse! Excellent',
        'incorrect_feedback': '✗ Mauvaise réponse. Réessayez',
        'all_correct': '🎉 Excellent! Aucune erreur à réviser.',
        'loading': '... Analyse des données'
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
        
        // يجب أن يكون لديك ملف باسم Question.json في نفس المجلد
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
    const messageEl = document.getElementById('notification-message');
    
    messageEl.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    // إضافة لون للتنبيه
    toast.style.background = (type === 'success') 
        ? 'linear-gradient(135deg, var(--correct-color), #00b371)' 
        : (type === 'error') 
        ? 'linear-gradient(135deg, var(--incorrect-color), #cc003d)' 
        : 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))';
        
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

    // Reset timer animation/color
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
    
    // تأكد من وجود سؤال
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

    showFeedback(false, t.timeout_msg);
    updateScoreDisplay();
    
    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    
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
    document.querySelector('.app-title .title-glitch').setAttribute('data-text', 'GEO-MASTER'); // تحديث للغليتش

    const startBtn = document.getElementById('start-quiz-btn');
    if (startBtn) {
        startBtn.querySelector('.btn-text').textContent = t.start_quiz;
    }
    
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.querySelector('.btn-text').textContent = t.submit;
    }
    
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.querySelector('.btn-text').textContent = t.next;
    }
    
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) {
        skipBtn.querySelector('.btn-text').textContent = t.skip;
    }
    
    const topicsHeader = document.querySelector('.topics-header');
    if (topicsHeader) {
        topicsHeader.innerHTML = `<i class="fas fa-folder-open"></i> ${t.choose_domain}`;
    }
    
    const restartBtn = document.querySelector('.action-buttons .primary .btn-text');
    if (restartBtn) {
        restartBtn.textContent = t.new_quiz;
    }
    
    const shareBtn = document.getElementById('share-results-btn');
    if (shareBtn) {
        shareBtn.querySelector('.btn-text').textContent = t.share_results;
    }
    
    // تحديث الإحصائيات في الشريط الجانبي
    updateSidebarStats();
    
    // تحديث شاشة الاختبار إذا كانت مفتوحة
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        const questionCounter = document.getElementById('question-counter');
        if (questionCounter) {
            questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        }
        
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
             scoreDisplay.innerHTML = `<i class="fas fa-star"></i> ${t.points} <span id="current-score">${score}</span>`;
        }
        
        const timerUnit = document.querySelector('.timer-unit');
        if (timerUnit) {
            timerUnit.textContent = t.timer_text;
        }
    }
}

function changeLanguage(langCode) {
    translateUI(langCode);
    showNotification('✓ تم تغيير اللغة بنجاح', 'success');
}

// =======================================================
// 8. تهيئة القائمة الجانبية والإحصائيات
// =======================================================
function updateSidebarStats() {
    const t = translations[currentLanguage];
    
    document.getElementById('total-quizzes').textContent = totalQuizzesCompleted;
    
    // Calculate average score percentage for display
    const avgScore = totalQuizzesCompleted > 0 
        ? Math.round((totalScoresSum / totalQuizzesCompleted)) 
        : 0;
    document.getElementById('avg-score').textContent = `${avgScore}%`;
    
    // تحديث العناوين
    const statItems = document.querySelectorAll('.stat-item p');
    if (statItems.length >= 2) {
        statItems[0].textContent = t.completed_quizzes;
        statItems[1].textContent = t.avg_success;
    }
}

// =======================================================
// 9. التحكم في القائمة الجانبية
// =======================================================
document.getElementById('open-sidebar-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
});

document.getElementById('close-sidebar-btn').addEventListener('click', closeSidebar);

document.getElementById('overlay').addEventListener('click', closeSidebar);

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
}

// =======================================================
// 10. تبديل السمة (Theme Toggle)
// =======================================================
const themeToggle = document.getElementById('theme-toggle');
let currentTheme = localStorage.getItem('theme') || 'dark';

document.body.setAttribute('data-theme', currentTheme);
updateThemeIcon();

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
    showNotification('✓ تم تغيير السمة', 'info');
});

function updateThemeIcon() {
    const icon = themeToggle.querySelector('i');
    icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// =======================================================
// 11. بدء الاختبار وإضافة المواضيع
// =======================================================
document.getElementById('start-quiz-btn').addEventListener('click', () => {
    document.getElementById('start-quiz-btn').classList.add('hidden');
    document.getElementById('topics-list-container').classList.remove('hidden');
    
    // تأثير الظهور التدريجي
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
    
    translateUI(currentLanguage);
}

// =======================================================
// 12. بدء الاختبار
// =======================================================
function startQuiz(topicTitle, questions) {
    clearInterval(timerInterval);
    
    currentQuestions = shuffleArray([...questions]).slice(0, 10); // 10 أسئلة عشوائية
    currentQuestionIndex = 0;
    score = 0;
    correctAnswersCount = 0;
    wrongAnswersCount = 0;
    userAnswers = {};
    quizStartTime = Date.now();

    document.getElementById('topic-selection').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('quiz-title').innerHTML = `<i class="fas fa-vials"></i> اختبار: ${topicTitle}`;
    
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
    
    // تطبيق تأثير الظهور
    qContainer.style.animation = 'fadeInUp 0.6s ease-out';
    
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
}

// =======================================================
// 16. معالجة الإجابة
// =======================================================
document.getElementById('submit-btn').addEventListener('click', () => {
    clearInterval(timerInterval);
    
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
        score += POINTS_WRONG;
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
    
    // تأكد من وجود سؤال
    if (!currentQ) {
        currentQuestionIndex++;
        return displayQuestion(); 
    }
    
    score += POINTS_WRONG;
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
    const totalTimeSeconds = Math.floor((quizEndTime - quizStartTime) / 1000);
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

    // حساب النسبة المئوية للأسئلة الصحيحة
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
    
    // حفظ الإحصائيات (نحفظ متوسط النسبة المئوية)
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
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    
    // تعيين Offset البدئي (مخفي)
    circle.style.strokeDashoffset = circumference;
    
    // إضافة Gradient SVG (تم إضافته في HTML مسبقاً)
    
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
    const totalQuestions = currentQuestions.length;
    const shareText = `🎯 GEO-MASTER Results:\nScore: ${correctAnswersCount}/${totalQuestions}\n✓ Correct: ${correctAnswersCount}\n✗ Wrong: ${wrongAnswersCount}\n\n🌍 Test your geology knowledge!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'GEO-MASTER', // تم حذف V2.0
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
    // Language and Stats will be updated inside loadGeologyData after topics are loaded,
    // but we can call it here for initial sidebar text rendering
    translateUI(currentLanguage);
    updateSidebarStats();
    
    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out both';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.data-module, .topic-card').forEach(el => {
        observer.observe(el);
    });
});

// =======================================================
// 23. منع التمرير الأفقي
// =======================================================
document.addEventListener('touchmove', (e) => {
    // Only prevents multi-touch scrolling (pinch-zoom), safe to keep.
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// =======================================================
// 24. Keyboard Shortcuts
// =======================================================
document.addEventListener('keydown', (e) => {
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        // Enter للتأكيد
        if (e.key === 'Enter' && !document.getElementById('submit-btn').disabled && !document.getElementById('submit-btn').classList.contains('hidden')) {
            document.getElementById('submit-btn').click();
        } 
        // Space للتالي
        else if (e.key === ' ' && !document.getElementById('next-btn').classList.contains('hidden')) {
            e.preventDefault();
            document.getElementById('next-btn').click();
        }
        // أرقام 1-4 لاختيار الخيارات
        else if (['1', '2', '3', '4'].includes(e.key)) {
            const options = document.querySelectorAll('input[name="option"]');
            const index = parseInt(e.key) - 1;
            if (options[index] && !options[index].disabled) {
                options[index].checked = true;
                // قم بتشغيل حدث 'change' لتمكين زر الإرسال
                const changeEvent = new Event('change');
                options[index].dispatchEvent(changeEvent);
            }
        }
    }
});

console.log('%c🌍 GEO-MASTER Loaded Successfully! ', 'background: linear-gradient(135deg, #00d9ff, #b026ff); color: white; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 10px;');
