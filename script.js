// **=================================================**
// [1] المتغيرات العالمية والتحكم
// **=================================================**
let geologicalData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {}; // تخزين إجابات المستخدمين للمراجعة
let timerInterval;
let quizStartTime = 0; // جديد: لبدء احتساب الوقت الإجمالي
const TIME_LIMIT = 20; // ثانية لكل سؤال
const POINTS_CORRECT = 5;
const POINTS_WRONG = -3;
const DAILY_CHALLENGE_QUESTIONS = 7; 
let currentLanguage = 'ar';
let currentActiveUsers = Math.floor(Math.random() * (16 - 3 + 1)) + 3; 

// عناصر الصوت
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const perfectSound = document.getElementById('perfect-sound');

// قاموس الترجمة
const translations = {
    'ar': {
        'start_custom_quiz': 'بدء اختبار مخصص',
        'daily_challenge': 'التحدي اليومي',
        'daily_challenge_button': `التحدي اليومي (${DAILY_CHALLENGE_QUESTIONS} أسئلة)`,
        'choose_domain': 'اختر مجال الاختبار المخصص:',
        'choose_gis_domain': 'اختر اختبار فرعي:',
        'quiz_title_prefix': 'اختبار:',
        'question': 'السؤال',
        'submit': 'تأكيد الإجابة',
        'next': 'السؤال التالي',
        'skip': 'تخطي', // جديد: ترجمة زر التخطي
        'review_errors': 'فحص الأخطاء:',
        'your_answer': 'إجابتك:',
        'correct_answer': 'الصحيح:',
        'great_job': '🌟 أداء استثنائي! معرفة جيولوجية قوية.',
        'good_job': '✨ جيد جداً! أساس متين، لكن هناك مجال للمراجعة.',
        'needs_review': '⚠️ تحتاج إلى مراجعة مكثفة لهذه المفاهيم.',
        'new_quiz': 'إعادة تشغيل النظام',
        'share_results': 'مشاركة النتائج',
        'timer_text': 'ث',
        'loading_data': '... تحليل بيانات النظام',
        'loading_error': '[خطأ الاتصال] عذراً، لا يمكن تحميل البيانات. يرجى مراجعة ملف Question.json.',
        'timeout_answer': '(انتهى الوقت - لم يتم الإجابة)',
        'all_correct_message': '🎉 ممتاز! لا توجد أخطاء لمراجعتها.',
        'active_users_title': 'المتدربون النشطون الآن',
        'back_button': 'الرجوع للقائمة الرئيسية',
        'time_spent': 'الوقت المستغرق', // جديد: ترجمة الوقت
        'seconds': 'ثانية', // جديد: ترجمة ثانية
        'correct_feedback': 'إجابة صحيحة!',
        'incorrect_feedback': 'إجابة خاطئة. الصحيح:',
        'timeout_feedback': 'انتهى الوقت! الإجابة الصحيحة:',
        'total_trainees': 'إجمالي المتدربين المسجلين:'
    },
    'en': {
        'start_custom_quiz': 'Start Custom Quiz',
        'daily_challenge': 'Daily Challenge',
        'daily_challenge_button': `Daily Challenge (${DAILY_CHALLENGE_QUESTIONS} Questions)`,
        'choose_domain': 'Choose Custom Quiz Domain:',
        'choose_gis_domain': 'Choose Sub Quiz:',
        'quiz_title_prefix': 'Quiz:',
        'question': 'Question',
        'submit': 'Submit Answer',
        'next': 'Next Question',
        'skip': 'Skip',
        'review_errors': 'Review Conceptual Errors:',
        'your_answer': 'Your Answer:',
        'correct_answer': 'Correct:',
        'great_job': '🌟 Exceptional performance! Strong geological knowledge.',
        'good_job': '✨ Very good! Solid foundation, but room for review.',
        'needs_review': '⚠️ Requires intensive review of these concepts.',
        'new_quiz': 'Restart System',
        'share_results': 'Share Results',
        'timer_text': 's',
        'loading_data': '... Analyzing system data',
        'loading_error': '[Connection Error] Sorry, data could not be loaded. Please check Question.json file.',
        'timeout_answer': '(Timeout - No answer provided)',
        'all_correct_message': '🎉 Excellent! No errors to review.',
        'active_users_title': 'Active Trainees Now',
        'back_button': 'Back to Main Menu',
        'time_spent': 'Total Time',
        'seconds': 'seconds',
        'correct_feedback': 'Correct Answer!',
        'incorrect_feedback': 'Wrong Answer. Correct:',
        'timeout_feedback': 'Timeout! Correct Answer:',
        'total_trainees': 'Total Registered Trainees:'
    },
    'fr': {
        'start_custom_quiz': 'Commencer Quiz Personnalisé',
        'daily_challenge': 'Défi Quotidien',
        'daily_challenge_button': `Défi Quotidien (${DAILY_CHALLENGE_QUESTIONS} Questions)`,
        'choose_domain': 'Choisissez un domaine de Quiz Personnalisé:',
        'choose_gis_domain': 'Choisissez Sous-Quiz:',
        'quiz_title_prefix': 'Quiz:',
        'question': 'Question',
        'submit': 'Soumettre la Réponse',
        'next': 'Question Suivante',
        'skip': 'Sauter',
        'review_errors': 'Revue des Erreurs Conceptuelles:',
        'your_answer': 'Votre Réponse:',
        'correct_answer': 'La Bonne:',
        'great_job': '🌟 Performance exceptionnelle! Solides connaissances géologiques.',
        'good_job': '✨ Très bien! Base solide, mais il y a place à l\'amélioration.',
        'needs_review': '⚠️ Nécessite une révision intensive de ces concepts.',
        'new_quiz': 'Redémarrer le Système',
        'share_results': 'Partager les Résultats',
        'timer_text': 's',
        'loading_data': '... Analyse des données système',
        'loading_error': '[Erreur de Connexion] Désolé, les données n\'ont pas pu être chargées. Veuillez vérifier le fichier Question.json.',
        'timeout_answer': '(Temps écoulé - Aucune réponse fournie)',
        'all_correct_message': '🎉 Excellent! Aucune erreur à examiner.',
        'active_users_title': 'Apprenants Actifs Maintenant',
        'back_button': 'Retour au menu principal',
        'time_spent': 'Temps Total',
        'seconds': 'secondes',
        'correct_feedback': 'Réponse Correcte!',
        'incorrect_feedback': 'Mauvaise Réponse. Correct:',
        'timeout_feedback': 'Temps écoulé! Réponse Correcte:',
        'total_trainees': 'Apprenants Enregistrés Totaux:'
    }
};

// **=================================================**
// [2] تحميل البيانات والتهيئة الأولية
// **=================================================**
async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    const startCustomBtn = document.getElementById('start-quiz-btn'); 
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
    const topicsListContainer = document.getElementById('topics-list-container');
    
    try {
        if (loadingMessage) {
            loadingMessage.textContent = translations[currentLanguage].loading_data;
            loadingMessage.classList.remove('hidden');
        }
        if (startCustomBtn) startCustomBtn.disabled = true;
        if (dailyChallengeBtn) dailyChallengeBtn.disabled = true;
        
        // التحميل من Question.json (بناءً على الصورة المرفقة)
        const response = await fetch('./Question.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        geologicalData = await response.json();
        
        if (loadingMessage) loadingMessage.classList.add('hidden'); 
        
        // تفعيل الأزرار بعد التحميل
        if (startCustomBtn) {
            startCustomBtn.disabled = false;
            startCustomBtn.addEventListener('click', () => {
                 if (startCustomBtn) startCustomBtn.classList.add('hidden');
                 if (dailyChallengeBtn) dailyChallengeBtn.parentElement.classList.add('hidden'); 
                 if (topicsListContainer) topicsListContainer.classList.remove('hidden');
                 populateTopicLists(geologicalData, false); 
            });
        }
        if (dailyChallengeBtn) {
            dailyChallengeBtn.disabled = false;
            dailyChallengeBtn.parentElement.classList.remove('hidden'); 
            dailyChallengeBtn.addEventListener('click', startDailyChallenge);
        }
        
    } catch (error) {
        console.error("فشل في تحميل بيانات الجيولوجيا:", error);
        if (loadingMessage) {
            loadingMessage.textContent = translations[currentLanguage].loading_error;
            loadingMessage.classList.remove('hidden');
        }
        if (startCustomBtn) startCustomBtn.disabled = true;
        if (dailyChallengeBtn) dailyChallengeBtn.disabled = true;
    }
}

// **=================================================**
// [2.5] دالة ملء القوائم (دعم التفرعات)
// **=================================================**
function populateTopicLists(dataObject, isSubMenu = false) {
    const topicsList = document.getElementById('topics-list');
    const sidebarList = document.getElementById('sidebar-topics-list');
    const loadingMessage = document.getElementById('loading-message');
    const backBtn = document.getElementById('back-to-main-menu-btn');
    const startCustomBtn = document.getElementById('start-quiz-btn'); 
    const dailyChallengeContainer = document.querySelector('.daily-challenge-section');
    const headerTitle = document.getElementById('topics-header-title');
    const t = translations[currentLanguage];
    
    if (!topicsList || !sidebarList) return;
    if (loadingMessage) loadingMessage.classList.add('hidden'); 
    
    topicsList.innerHTML = ''; 
    sidebarList.innerHTML = ''; 
    
    // إخفاء/إظهار زر الرجوع والعنوان
    if (isSubMenu) {
        if (backBtn) backBtn.classList.remove('hidden');
        if (headerTitle) headerTitle.innerHTML = `<i class="fas fa-globe-americas"></i> ${t.choose_gis_domain}`; 
    } else {
        if (backBtn) backBtn.classList.add('hidden');
        if (headerTitle) headerTitle.innerHTML = `<i class="fas fa-folder-open"></i> ${t.choose_domain}`; 
        // إعادة إظهار الأزرار الرئيسية في القائمة الرئيسية
        if (startCustomBtn) startCustomBtn.classList.add('hidden');
        if (dailyChallengeContainer) dailyChallengeContainer.classList.add('hidden');
    }
    
    Object.keys(dataObject).forEach(key => {
        const topicDisplayName = key.replace(/_/g, ' ');
        const content = dataObject[key];
        let clickHandler;
        let isFolder = false;
        
        if (Array.isArray(content)) {
            // الموضوع هو قائمة أسئلة مباشرة
            clickHandler = () => {
                startQuiz(topicDisplayName, content); 
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('overlay').style.display = 'none';
            };
        } else if (typeof content === 'object' && content !== null) {
            // الموضوع يحتوي على فروع فرعية
            isFolder = true;
            clickHandler = () => {
                populateTopicLists(content, true); 
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('overlay').style.display = 'none';
            };
        }
        
        // إنشاء بطاقة الشاشة الرئيسية
        const gridCard = document.createElement('div');
        gridCard.className = `topic-card ${isFolder ? 'topic-folder' : 'topic-quiz'}`; // إضافة كلاس لتفريق المظهر
        const icon = isFolder ? `<i class="fas fa-folder" style="color: var(--neon-cyan);"></i> ` : `<i class="fas fa-chalkboard-teacher" style="color: var(--neon-blue);"></i> `;
        gridCard.innerHTML = icon + topicDisplayName;
        if (clickHandler) gridCard.addEventListener('click', clickHandler);
        topicsList.appendChild(gridCard);

        // إنشاء رابط القائمة الجانبية
        const sidebarLink = document.createElement('a');
        sidebarLink.href = "#";
        sidebarLink.classList.add('sidebar-link-item');
        sidebarLink.innerHTML = icon + `<span>${topicDisplayName}</span>`;
        if (clickHandler) sidebarLink.addEventListener('click', clickHandler);
        sidebarList.appendChild(sidebarLink);
    });
}

// **=================================================**
// [3] منطق الاختبار (بدء، عرض، إجابة، نتائج)
// **=================================================**
// دالة خلط عشوائي للمصفوفة
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; 
    }
    return array;
}

// دالة بدء التحدي اليومي
function startDailyChallenge() {
    const t = translations[currentLanguage];
    let allQuestions = [];
    
    function collectQuestions(dataObject) {
        Object.values(dataObject).forEach(content => {
            if (Array.isArray(content)) {
                allQuestions = allQuestions.concat(content);
            } else if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
                collectQuestions(content);
            }
        });
    }
    
    collectQuestions(geologicalData); 
    const shuffledQuestions = shuffleArray(allQuestions);
    const dailyQuestions = shuffledQuestions.slice(0, DAILY_CHALLENGE_QUESTIONS);
    
    if (dailyQuestions.length === 0) {
        showNotification("لا توجد أسئلة متاحة لبدء التحدي اليومي.", 5000);
        return;
    }
    
    startQuiz(t.daily_challenge, dailyQuestions);
}

// دالة بدء الاختبار
function startQuiz(quizTitle, questions) { 
    clearInterval(timerInterval);
    currentQuestions = shuffleArray(questions.map((q, index) => ({...q, id: q.id || index}))); // ضمان وجود ID وخلط
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
    quizStartTime = Date.now(); // تسجيل وقت بدء الاختبار
    
    // تبديل الشاشات
    document.getElementById('topic-selection').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    
    const quizTitleElement = document.getElementById('quiz-title');
    if (quizTitleElement) {
        quizTitleElement.textContent = `${translations[currentLanguage].quiz_title_prefix} ${quizTitle}`;
    }
    
    // إخفاء زر التخطي في التحدي اليومي، وإظهاره في الاختبار المخصص
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) {
         if (quizTitle === translations['ar'].daily_challenge) { // مقارنة بالترجمة العربية الثابتة
             skipBtn.classList.add('hidden');
         } else {
             skipBtn.classList.remove('hidden');
         }
    }

    displayQuestion();
}

// دالة عرض السؤال
function displayQuestion() {
    clearInterval(timerInterval); 
    const qContainer = document.getElementById('question-container');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const questionCounter = document.getElementById('question-counter');
    const currentScoreDisplay = document.getElementById('current-score'); 
    
    if (currentQuestionIndex >= currentQuestions.length) {
        return showResults(); 
    }
    
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];
    
    // إعادة تعيين شريط المؤقت والتحذير
    startTimer(); 
    
    if (questionCounter) {
        questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    }
    if (currentScoreDisplay) {
        currentScoreDisplay.textContent = score;
    }
    
    let htmlContent = `<p class="question-text">${currentQ.question}</p>`;
    htmlContent += '<div class="options-container">';
    const options = currentQ.options ? shuffleArray([...currentQ.options]) : []; 
    
    options.forEach((option, index) => {
        const optionId = `q${currentQuestionIndex}-opt${index}`;
        htmlContent += `
            <label class="option-label" for="${optionId}">
                <input type="radio" name="option" id="${optionId}" value="${option}">
                <span class="option-text">${option}</span>
            </label>
        `;
    });
    htmlContent += '</div>';
    qContainer.innerHTML = htmlContent;
    
    if (submitBtn) {
        submitBtn.classList.remove('hidden');
        submitBtn.disabled = true; // يتم التفعيل عند اختيار خيار
    }
    if (nextBtn) {
        nextBtn.classList.add('hidden');
    }
    
    // تفعيل زر التأكيد عند اختيار خيار
    document.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => {
            if (submitBtn) submitBtn.disabled = false;
        });
    });
    
    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) feedbackContainer.classList.add('hidden');
}

// ------ معالجة الإجابة (Submit) ------
const submitBtn = document.getElementById('submit-btn');
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        processAnswer(false);
    });
}

// ------ الانتقال للسؤال التالي (Next) ------
const nextBtn = document.getElementById('next-btn');
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        displayQuestion();
    });
}

// ------ تخطي السؤال (Skip) ------
const skipBtn = document.getElementById('skip-btn');
if (skipBtn) {
    skipBtn.addEventListener('click', () => {
        // يتم تسجيل السؤال كـ "لم يتم الإجابة" ثم الانتقال
        processAnswer(true); 
    });
}

// ------ دالة معالجة الإجابة الموحدة (للإرسال أو التخطي/Timeout) ------
function processAnswer(isSkippedOrTimeout = false) {
    clearInterval(timerInterval); 
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];
    
    const selectedOptionInput = document.querySelector('input[name="option"]:checked');
    let userAnswer = selectedOptionInput ? selectedOptionInput.value : t.timeout_answer;
    const correctAnswer = currentQ.answer;
    let isCorrect = false;
    let isAnswered = false;

    if (isSkippedOrTimeout) {
        isCorrect = false;
        isAnswered = false; // لم تتم الإجابة فعلياً
        score += POINTS_WRONG; // خصم نقاط للتخطي أو انتهاء الوقت
        if (wrongSound) { wrongSound.currentTime = 0; wrongSound.play().catch(e => console.error("Error playing sound:", e)); }
    } else {
        isAnswered = true;
        isCorrect = (userAnswer === correctAnswer);
        if (isCorrect) {
            score += POINTS_CORRECT;
            if (correctSound) { correctSound.currentTime = 0; correctSound.play().catch(e => console.error("Error playing sound:", e)); }
        } else {
            score += POINTS_WRONG;
            if (wrongSound) { wrongSound.currentTime = 0; wrongSound.play().catch(e => console.error("Error playing sound:", e)); }
        }
    }

    // تسجيل الإجابة
    userAnswers[currentQ.id] = {
        question: currentQ.question,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
    };

    // تحديث الواجهة لعرض الإجابة الصحيحة/الخاطئة
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true; // تعطيل الخيارات
        if (input.value === correctAnswer) {
            label.classList.add('correct'); 
        } else if (input.checked && !isCorrect && isAnswered) { // إذا اختارها وكانت خاطئة
            label.classList.add('incorrect'); 
        }
        if (!isAnswered && input.value !== correctAnswer) { // في حالة التخطي/التايم آوت
             label.classList.add('incorrect');
        }
    });
    
    // عرض رسالة التغذية الراجعة
    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) {
        if (isSkippedOrTimeout) {
            feedbackContainer.textContent = `${t.timeout_feedback} ${correctAnswer}`;
            feedbackContainer.className = 'feedback-message incorrect-feedback';
        } else {
             feedbackContainer.textContent = isCorrect ? t.correct_feedback : `${t.incorrect_feedback} ${correctAnswer}`;
             feedbackContainer.className = `feedback-message ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`; 
        }
        feedbackContainer.classList.remove('hidden');
    }

    const currentScoreDisplay = document.getElementById('current-score');
    if (currentScoreDisplay) currentScoreDisplay.textContent = score;
    
    if (submitBtn) submitBtn.classList.add('hidden');
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.classList.remove('hidden');
    // إخفاء زر التخطي بعد الإجابة/التخطي
    if (skipBtn) skipBtn.classList.add('hidden');
}


// ------ التعامل مع انتهاء الوقت ------
function handleTimeout() {
    // نستخدم دالة processAnswer مع معلمة التخطي/التايم آوت
    processAnswer(true); 
    // يجب إظهار زر التالي هنا
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.classList.remove('hidden');
}

// ------ عرض النتائج النهائية ------
function showResults() {
    clearInterval(timerInterval);
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const finalScoreElement = document.getElementById('final-score');
    const totalQuestionsCountElement = document.getElementById('total-questions-count');
    const gradeMessage = document.getElementById('grade-message');
    const reviewArea = document.getElementById('review-area');
    const correctCountElement = document.getElementById('correct-count');
    const wrongCountElement = document.getElementById('wrong-count');
    const totalTimeElement = document.getElementById('total-time');
    
    if (quizScreen) quizScreen.classList.add('hidden');
    if (resultsScreen) resultsScreen.classList.remove('hidden');

    const totalQuestions = currentQuestions.length;
    let correctCount = Object.values(userAnswers).filter(answer => answer.isCorrect).length;
    let wrongCount = totalQuestions - correctCount;

    // حساب الوقت المستغرق
    const totalTimeSeconds = Math.round((Date.now() - quizStartTime) / 1000);
    if (totalTimeElement) totalTimeElement.textContent = `${totalTimeSeconds} ${translations[currentLanguage].seconds}`;
    
    // تشغيل صوت الإنجاز المثالي
    if (wrongCount === 0 && totalQuestions > 0) { 
        if (perfectSound) { perfectSound.currentTime = 0; perfectSound.play().catch(e => console.error("Error playing perfect sound:", e)); }
    }
    
    if (finalScoreElement) finalScoreElement.textContent = score;
    if (totalQuestionsCountElement) totalQuestionsCountElement.textContent = totalQuestions;
    if (correctCountElement) correctCountElement.textContent = correctCount;
    if (wrongCountElement) wrongCountElement.textContent = wrongCount;
    
    // حساب النسبة المئوية
    const percentage = Math.round((correctCount / (totalQuestions || 1)) * 100);
    const t = translations[currentLanguage];
    
    // تحديد الرسالة واللون
    if (gradeMessage) {
        if (percentage >= 90) { gradeMessage.innerHTML = t.great_job; gradeMessage.style.color = 'var(--correct-color)'; } 
        else if (percentage >= 70) { gradeMessage.innerHTML = t.good_job; gradeMessage.style.color = 'var(--neon-blue)'; } 
        else { gradeMessage.innerHTML = t.needs_review; gradeMessage.style.color = 'var(--incorrect-color)'; }
    }
    
    // تحديث دائرة التقدم (Progress Ring)
    const progressRingFill = document.querySelector('.progress-ring-fill');
    if (progressRingFill) {
        const radius = progressRingFill.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        progressRingFill.style.strokeDashoffset = offset;
    }
    
    // مراجعة الأخطاء
    if (reviewArea) {
        let reviewContentHTML = `<h3><i class="fas fa-bug"></i> ${t.review_errors}</h3><div id="review-content">`; 
        let errorsFound = false;
        
        Object.values(userAnswers).forEach(answer => {
            if (!answer.isCorrect) {
                errorsFound = true;
                reviewContentHTML += `
                    <div class="review-item">
                        <p class="error-q">${answer.question}</p>
                        <p class="error-a">${t.your_answer} <span class="wrong">${answer.userAnswer}</span></p>
                        <p class="error-a">${t.correct_answer} <span class="right">${answer.correctAnswer}</span></p>
                    </div>
                `;
            }
        });
        
        reviewContentHTML += `</div>`;
        
        if (!errorsFound) {
            reviewContentHTML += `<p class="all-correct">${t.all_correct_message}</p>`;
        }
        
        reviewArea.innerHTML = reviewContentHTML;
    }
    
    // إخفاء زر التخطي في حال العودة لشاشة النتائج
    if (skipBtn) skipBtn.classList.add('hidden');
}

// **=================================================**
// [4] وظائف مساعدة (مؤقت، ترجمة، تبديل السمة، إلخ)
// **=================================================**
// ------ دالة المؤقت (مُحسنة) ------
function startTimer() {
    clearInterval(timerInterval); 
    let timeRemaining = TIME_LIMIT;
    const timerDisplayElement = document.getElementById('timer-display'); 
    const timerValueElement = document.querySelector('#timer-display .timer-value'); 
    const timerUnitElement = document.querySelector('#timer-display .timer-unit'); 
    const t = translations[currentLanguage];

    // إعادة تعيين المؤقت للوضع الطبيعي
    if (timerValueElement) timerValueElement.textContent = timeRemaining;
    if (timerUnitElement) timerUnitElement.textContent = t.timer_text; 
    if (timerDisplayElement) {
        timerDisplayElement.removeAttribute('data-critical'); 
        timerDisplayElement.style.color = 'var(--neon-blue)'; // لإلغاء التعديل المباشر
    }

    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timerValueElement) timerValueElement.textContent = timeRemaining;

        // تغيير المؤقت إلى وضع حرج (آخر 5 ثواني)
        if (timeRemaining <= 5) {
            if (timerDisplayElement) {
                timerDisplayElement.setAttribute('data-critical', 'true'); 
            }
        } else {
            if (timerDisplayElement) {
                 timerDisplayElement.removeAttribute('data-critical'); 
            }
        }
        
        // التعامل مع انتهاء الوقت
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

// ------ دالة الترجمة الموحدة ------
function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar']; 
    
    document.documentElement.lang = langCode; 
    document.documentElement.dir = (langCode === 'ar') ? 'rtl' : 'ltr'; 
    
    const updateText = (selector, key) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = t[key];
    };
    
    const updateHTML = (selector, key) => {
        const element = document.querySelector(selector);
        if (element) {
            const btnText = element.querySelector('.btn-text');
            const btnGlow = element.querySelector('.btn-glow') ? '<span class="btn-glow"></span>' : '';
            if (btnText) {
                btnText.textContent = t[key];
            } else {
                 // حالة الأزرار التي تحتوي فقط على نص (مثل زر الرجوع)
                 const icon = element.querySelector('.btn-icon') ? element.querySelector('.btn-icon').outerHTML : '';
                 element.innerHTML = `${icon}<span class="btn-text">${t[key]}</span>${btnGlow}`;
            }
        }
    };
    
    // الشاشة الرئيسية
    updateHTML('#start-quiz-btn', 'start_custom_quiz'); 
    updateHTML('#daily-challenge-btn', 'daily_challenge_button'); 
    updateHTML('#back-to-main-menu-btn', 'back_button');
    
    // شاشة الاختبار
    updateHTML('#submit-btn', 'submit');
    updateHTML('#next-btn', 'next');
    updateHTML('#skip-btn', 'skip');
    updateText('#timer-display .timer-unit', 'timer_text');
    
    // شاشة النتائج
    updateHTML('#results-screen button[onclick*="reload"]', 'new_quiz');
    updateHTML('#share-results-btn', 'share_results');
    const reviewTitle = document.querySelector('#review-area h3');
    if (reviewTitle) reviewTitle.innerHTML = `<i class="fas fa-bug"></i> ${t.review_errors}`;
    
    // نصوص إحصائيات النتائج
    updateText('#total-time + p', 'time_spent');
    updateText('#correct-count + p', 'إجابات صحيحة');
    updateText('#wrong-count + p', 'إجابات خاطئة');
    
    // الفوتر والإحصائيات العلوية
    const activeUsersIndicator = document.querySelector('.active-users-indicator');
    if (activeUsersIndicator) activeUsersIndicator.title = t.active_users_title;
    
    const traineesSection = document.querySelector('.total-trainees-section');
    if (traineesSection) {
        traineesSection.childNodes[1].textContent = `${t.total_trainees} `;
    }
    
    // تحديث العناوين الديناميكية (مثل قائمة المواضيع)
    const headerTitle = document.getElementById('topics-header-title');
    if (headerTitle) {
        const backBtnVisible = document.getElementById('back-to-main-menu-btn') && !document.getElementById('back-to-main-menu-btn').classList.contains('hidden');
        if (backBtnVisible) {
            headerTitle.innerHTML = `<i class="fas fa-globe-americas"></i> ${t.choose_gis_domain}`;
        } else {
            headerTitle.innerHTML = `<i class="fas fa-folder-open"></i> ${t.choose_domain}`;
        }
    }
}

function changeLanguage(langCode) {
    translateUI(langCode);
}

// ------ تبديل السمة (مُحسنة) ------
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const body = document.body;
        let currentTheme = body.getAttribute('data-theme');
        const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggleBtn.innerHTML = (newTheme === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeToggleBtn.title = (newTheme === 'dark') ? 'تبديل إلى السمة الفاتحة' : 'تبديل إلى السمة الداكنة';
    });
    const savedTheme = localStorage.getItem('theme') || 'dark'; 
    document.body.setAttribute('data-theme', savedTheme);
    themeToggleBtn.innerHTML = (savedTheme === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// ------ إظهار إشعار مؤقت (Toast) ------
function showNotification(message, duration = 3000) {
    const toast = document.getElementById('notification-toast');
    const messageElement = document.getElementById('notification-message');
    if (!toast || !messageElement) return;
    
    // التأكد من أن التوغل مخفي قبل البدء
    toast.classList.remove('show');
    toast.classList.add('hidden');
    
    messageElement.textContent = message;
    
    // إظهار
    setTimeout(() => {
        toast.classList.remove('hidden');
        toast.classList.add('show');
    }, 50); // تأخير بسيط لضمان إعادة تشغيل الـ CSS transition

    // إخفاء
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
             toast.classList.add('hidden');
        }, 500); 
    }, duration);
}

// **=================================================**
// [5] تشغيل الكود عند تحميل الصفحة
// **=================================================**
document.addEventListener('DOMContentLoaded', () => {
    // --- التحكم في القائمة الجانبية (Sidebar) ---
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    
    if (openSidebarBtn && sidebar && overlay) {
        openSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.style.display = 'block';
            openSidebarBtn.setAttribute('aria-expanded', 'true');
        });
    }
    if (closeSidebarBtn && sidebar && overlay) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
            openSidebarBtn.setAttribute('aria-expanded', 'false');
        });
    }
    if (overlay && sidebar) {
        overlay.addEventListener('click', () => {
              sidebar.classList.remove('open');
              overlay.style.display = 'none';
              openSidebarBtn.setAttribute('aria-expanded', 'false');
         });
     }
    
    // --- زر الرجوع من قائمة المواضيع الفرعية ---
    const backBtn = document.getElementById('back-to-main-menu-btn');
    const startCustomBtn = document.getElementById('start-quiz-btn'); 
    const dailyChallengeContainer = document.querySelector('.daily-challenge-section');
    const topicsListContainer = document.getElementById('topics-list-container');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            populateTopicLists(geologicalData, false); // العودة للقائمة الرئيسية
            // إعادة إظهار الأزرار الرئيسية
            if (startCustomBtn) startCustomBtn.classList.remove('hidden');
            if (dailyChallengeContainer) dailyChallengeContainer.classList.remove('hidden'); 
            if (topicsListContainer) topicsListContainer.classList.add('hidden');
        });
    }

    // --- زر العودة للقائمة الرئيسية من شاشة الاختبار ---
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.reload(); // إعادة تحميل الصفحة للعودة للقائمة الرئيسية
        });
    }
    
    // --- تحديث عداد المستخدمين النشطين (Active users count) ---
    const activeUsersCountElement = document.getElementById('active-users-count');
    function updateActiveUsersGradually() {
        let change = Math.floor(Math.random() * 3) - 1; 
        currentActiveUsers += change;
        currentActiveUsers = Math.max(3, Math.min(16, currentActiveUsers));
        if (activeUsersCountElement) {
             activeUsersCountElement.textContent = currentActiveUsers;
        }
    }
    function scheduleNextUserUpdate() {
        const randomInterval = Math.random() * 4000 + 3000; 
        setTimeout(() => {
             updateActiveUsersGradually();
             scheduleNextUserUpdate(); 
        }, randomInterval);
    }
    if (activeUsersCountElement) activeUsersCountElement.textContent = currentActiveUsers; 
    scheduleNextUserUpdate(); 
    
    // --- تحميل بيانات الاختبار وتطبيق الترجمة الأولية ---
    loadGeologyData(); 
    translateUI(currentLanguage); // تطبيق الترجمة الأولية
});
