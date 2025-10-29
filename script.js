// **=================================================**
// [1] المتغيرات العالمية والتحكم
let geologicalData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval;
const TIME_LIMIT = 20; // ثانية لكل سؤال
const POINTS_CORRECT = 5;
const POINTS_WRONG = -3;
const DAILY_CHALLENGE_QUESTIONS = 7; // عدد أسئلة التحدي اليومي
let currentLanguage = 'ar';
let currentActiveUsers = Math.floor(Math.random() * (16 - 3 + 1)) + 3; // *** جديد: عدد المستخدمين الابتدائي ***
// *** عناصر الصوت ***
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
        'choose_gis_domain': 'اختر اختبار GIS:',
        'quiz_title_prefix': 'اختبار:',
        'question': 'السؤال',
        'submit': 'تأكيد الإجابة',
        'next': 'السؤال التالي',
        'review_errors': 'مراجعة الأخطاء المفاهيمية:',
        'your_answer': 'إجابتك:',
        'correct_answer': 'الصحيح:',
        'great_job': '🌟 أداء استثنائي! معرفة جيولوجية قوية.',
        'good_job': '✨ جيد جداً! أساس متين، لكن هناك مجال للمراجعة.',
        'needs_review': '⚠️ تحتاج إلى مراجعة مكثفة لهذه المفاهيم.',
        'new_quiz': 'إعادة تشغيل النظام',
        'timer_text': 'ث',
        'loading_data': '... جاري تحميل بيانات النظام',
        'loading_error': '[خطأ الاتصال] عذراً، لا يمكن تحميل البيانات. يرجى مراجعة ملف Question.json.',
        'timeout_answer': '(Timeout - لم يتم الإجابة)',
        'all_correct_message': '🎉 ممتاز! لا توجد أخطاء لمراجعتها.',
        'active_users_title': 'المتدربون النشطون الآن',
        'back_button': 'الرجوع للقائمة الرئيسية'
    },
    'en': {
        'start_custom_quiz': 'Start Custom Quiz',
        'daily_challenge': 'Daily Challenge',
        'daily_challenge_button': `Daily Challenge (${DAILY_CHALLENGE_QUESTIONS} Questions)`,
        'choose_domain': 'Choose Custom Quiz Domain:',
        'choose_gis_domain': 'Choose GIS Quiz:',
        'quiz_title_prefix': 'Quiz:',
        'question': 'Question',
        'submit': 'Submit Answer',
        'next': 'Next Question',
        'review_errors': 'Review Conceptual Errors:',
        'your_answer': 'Your Answer:',
        'correct_answer': 'Correct:',
        'great_job': '🌟 Exceptional performance! Strong geological knowledge.',
        'good_job': '✨ Very good! Solid foundation, but room for review.',
        'needs_review': '⚠️ Requires intensive review of these concepts.',
        'new_quiz': 'Restart System',
        'timer_text': 's',
        'loading_data': '... Loading system data',
        'loading_error': '[Connection Error] Sorry, data could not be loaded. Please check Question.json file.',
        'timeout_answer': '(Timeout - No answer provided)',
        'all_correct_message': '🎉 Excellent! No errors to review.',
        'active_users_title': 'Active Trainees Now',
        'back_button': 'Back to Main Menu'
    },
    'fr': {
        'start_custom_quiz': 'Commencer Quiz Personnalisé',
        'daily_challenge': 'Défi Quotidien',
        'daily_challenge_button': `Défi Quotidien (${DAILY_CHALLENGE_QUESTIONS} Questions)`,
        'choose_domain': 'Choisissez un domaine de Quiz Personnalisé:',
        'choose_gis_domain': 'Choisissez un Quiz GIS:',
        'quiz_title_prefix': 'Quiz:',
        'question': 'Question',
        'submit': 'Soumettre la Réponse',
        'next': 'Question Suivante',
        'review_errors': 'Revue des Erreurs Conceptuelles:',
        'your_answer': 'Votre Réponse:',
        'correct_answer': 'La Bonne:',
        'great_job': '🌟 Performance exceptionnelle! Solides connaissances géologiques.',
        'good_job': '✨ Très bien! Base solide, mais il y a place à l\'amélioration.',
        'needs_review': '⚠️ Nécessite une révision intensive de ces concepts.',
        'new_quiz': 'Redémarrer le Système',
        'timer_text': 's',
        'loading_data': '... Chargement des données système',
        'loading_error': '[Erreur de Connexion] Désolé, les données n\'ont pas pu être chargées. Veuillez vérifier le fichier Question.json.',
        'timeout_answer': '(Timeout - Aucune réponse fournie)',
        'all_correct_message': '🎉 Excellent! Aucune erreur à examiner.',
        'active_users_title': 'Apprenants Actifs Maintenant',
        'back_button': 'Retour au menu principal'
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
        const response = await fetch('./Question.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        geologicalData = await response.json();
        if (loadingMessage) loadingMessage.classList.add('hidden'); 
        if (startCustomBtn) {
            startCustomBtn.disabled = false;
            startCustomBtn.classList.remove('hidden'); 
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
// [2.5] دالة ملء القوائم 
// **=================================================**
function populateTopicLists(dataObject, isSubMenu = false) {
    const topicsList = document.getElementById('topics-list');
    const sidebarList = document.getElementById('sidebar-topics-list');
    const loadingMessage = document.getElementById('loading-message');
    const backBtn = document.getElementById('back-to-main-menu-btn');
    const headerTitle = document.getElementById('topics-header-title');
    const t = translations[currentLanguage];
    if (!topicsList || !sidebarList) return;
    if (loadingMessage) loadingMessage.classList.add('hidden'); 
    
    topicsList.innerHTML = ''; 
    sidebarList.innerHTML = ''; 
    if (isSubMenu) {
        if (backBtn) backBtn.classList.remove('hidden');
        if (headerTitle) headerTitle.innerHTML = `<i class="fas fa-globe-americas"></i> ${t.choose_gis_domain}`; 
    } else {
        if (backBtn) backBtn.classList.add('hidden');
        if (headerTitle) headerTitle.innerHTML = `<i class="fas fa-folder-open"></i> ${t.choose_domain}`; 
    }
    Object.keys(dataObject).forEach(key => {
        const topicDisplayName = key.replace(/_/g, ' ');
        const content = dataObject[key];
        let clickHandler;
        let isFolder = false;
        if (Array.isArray(content)) {
            clickHandler = () => {
                startQuiz(topicDisplayName, content); 
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('overlay').style.display = 'none';
            };
        } else if (typeof content === 'object' && content !== null) {
            isFolder = true;
            clickHandler = () => {
                populateTopicLists(content, true); 
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('overlay').style.display = 'none';
            };
        }
        const gridCard = document.createElement('div');
        gridCard.className = 'topic-card';
        if (isFolder) {
            gridCard.innerHTML = `<i class="fas fa-folder" style="margin-right: 10px; color: var(--neon-cyan);"></i> ${topicDisplayName}`;
        } else {
            gridCard.textContent = topicDisplayName;
        }
        gridCard.addEventListener('click', clickHandler);
        topicsList.appendChild(gridCard);
        const sidebarLink = document.createElement('a');
        sidebarLink.href = "#";
        if (isFolder) {
            sidebarLink.innerHTML = `<i class="fas fa-folder" style="margin-right: 10px; color: var(--neon-cyan);"></i> ${topicDisplayName}`;
        } else {
            sidebarLink.textContent = topicDisplayName;
        }
        const listItem = document.createElement('li'); 
        sidebarLink.addEventListener('click', clickHandler);
        listItem.appendChild(sidebarLink);
        sidebarList.appendChild(listItem);
    });
}
// **=================================================**
// [3] منطق الاختبار (بدء، عرض، إجابة، نتائج)
// **=================================================**
// ------ دالة خلط عشوائي للمصفوفة ------
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; 
    }
    return array;
}
// ------ دالة بدء التحدي اليومي 
function startDailyChallenge() {
    const t = translations[currentLanguage];
    if (!geologicalData || Object.keys(geologicalData).length === 0) {
        console.error("Geological data not loaded yet.");
        showNotification("Data not ready, please wait."); 
        return;
    }
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
    if (dailyQuestions.length < DAILY_CHALLENGE_QUESTIONS) {
        console.warn(`Not enough questions for daily challenge. Found ${dailyQuestions.length}`);
    }
    startQuiz(t.daily_challenge, dailyQuestions);
}
// ------ دالة بدء الاختبار ------
function startQuiz(quizTitle, questions) { 
    clearInterval(timerInterval);
    currentQuestions = questions;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
    const topicSelection = document.getElementById('topic-selection');
    const topicsListContainer = document.getElementById('topics-list-container');
    const resultsScreen = document.getElementById('results-screen');
    const quizScreen = document.getElementById('quiz-screen');
    if (topicSelection) topicSelection.classList.add('hidden');
    if (topicsListContainer) topicsListContainer.classList.add('hidden'); 
    if (resultsScreen) resultsScreen.classList.add('hidden');
    if (quizScreen) quizScreen.classList.remove('hidden');
    const quizTitleElement = document.getElementById('quiz-title');
    if (quizTitleElement) {
        quizTitleElement.textContent = `${translations[currentLanguage].quiz_title_prefix} ${quizTitle}`;
    }
    displayQuestion();
}
// ------ دالة عرض السؤال ------
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
    if (!currentQ) {
        console.error("Invalid question data at index:", currentQuestionIndex);
        return showResults(); 
    }
    startTimer(); 
    if (questionCounter) {
        questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    }
     if (currentScoreDisplay) {
         currentScoreDisplay.textContent = score;
     }
    let htmlContent = `<p class="question-text">${currentQ.question}</p>`;
    htmlContent += '<div class="options-container">';
    const options = currentQ.options ? [...currentQ.options] : []; 
    // shuffleArray(options); 
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
        submitBtn.disabled = true; 
    }
    if (nextBtn) {
        nextBtn.classList.add('hidden');
    }
    document.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => {
            if (submitBtn) submitBtn.disabled = false;
        });
    });
     const feedbackContainer = document.getElementById('feedback-container');
     if (feedbackContainer) feedbackContainer.classList.add('hidden');
}
// ------ معالجة الإجابة (Submit) (*** تم تصحيح الأصوات ***) ------
const submitBtn = document.getElementById('submit-btn');
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        clearInterval(timerInterval); 
        const selectedOptionInput = document.querySelector('input[name="option"]:checked');
        if (!selectedOptionInput) return; 
        const userAnswer = selectedOptionInput.value;
        const currentQ = currentQuestions[currentQuestionIndex];
        const correctAnswer = currentQ.answer;
        const isCorrect = (userAnswer === correctAnswer);
        // Update score and play sound
        if (isCorrect) {
            score += POINTS_CORRECT;
            // *** تشغيل صوت الإجابة الصحيحة ***
            if (correctSound) {
                correctSound.currentTime = 0; // إعادة للبداية
                // استخدام catch للتعامل مع قيود التشغيل التلقائي
                correctSound.play().catch(e => console.warn("Error playing correct sound:", e)); 
            }
        } else {
            score += POINTS_WRONG;
            // *** تشغيل صوت الإجابة الخاطئة ***
            if (wrongSound) {
                wrongSound.currentTime = 0;
                wrongSound.play().catch(e => console.warn("Error playing wrong sound:", e));
            }
        }
        userAnswers[currentQ.id || currentQuestionIndex] = {
            question: currentQ.question,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect,
        };
        // *** إضافة فئات التلوين التي تم تفعيلها في CSS ***
        document.querySelectorAll('.option-label').forEach(label => {
            const input = label.querySelector('input');
            input.disabled = true; 
            if (input.value === correctAnswer) {
                label.classList.add('correct'); 
            } else if (input.checked && !isCorrect) {
                label.classList.add('incorrect'); 
            }
        });
        // *** تحديث رسالة التغذية الراجعة مع الأيقونات ***
         const feedbackContainer = document.getElementById('feedback-container');
         if (feedbackContainer) {
             feedbackContainer.textContent = isCorrect ? "✅ إجابة صحيحة!" : `❌ إجابة خاطئة. الصحيح: ${correctAnswer}`;
             feedbackContainer.className = `feedback-message ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`; 
             feedbackContainer.classList.remove('hidden');
         }
         const currentScoreDisplay = document.getElementById('current-score');
         if (currentScoreDisplay) {
             currentScoreDisplay.textContent = score;
         }
        if (submitBtn) submitBtn.classList.add('hidden');
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.classList.remove('hidden');
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
// ------ التعامل مع انتهاء الوقت (*** تم تصحيح الأصوات ***) ------
function handleTimeout() {
    clearInterval(timerInterval);
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];
    score += POINTS_WRONG;
    // *** تشغيل صوت الإجابة الخاطئة (لانتهاء الوقت) ***
    if (wrongSound) {
        wrongSound.currentTime = 0;
        wrongSound.play().catch(e => console.warn("Error playing wrong sound on timeout:", e));
    }
    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: t.timeout_answer, 
        correctAnswer: currentQ.answer,
        isCorrect: false,
    };
    // *** تطبيق تلوين الإجابات ***
    document.querySelectorAll('.option-label').forEach(label => {
        label.querySelector('input').disabled = true;
        if (label.querySelector('input').value === currentQ.answer) {
            label.classList.add('correct');
        } else {
            // تلوين الخيارات الأخرى بالأحمر لبيان أن الوقت انتهى
            label.classList.add('incorrect');
        }
    });
     const feedbackContainer = document.getElementById('feedback-container');
     if (feedbackContainer) {
         feedbackContainer.textContent = `🚨 انتهى الوقت! الإجابة الصحيحة: ${currentQ.answer}`;
         feedbackContainer.className = 'feedback-message incorrect-feedback'; 
         feedbackContainer.classList.remove('hidden');
     }
     const currentScoreDisplay = document.getElementById('current-score');
     if (currentScoreDisplay) {
         currentScoreDisplay.textContent = score;
     }
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.classList.add('hidden');
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.classList.remove('hidden');
}
// ------ عرض النتائج النهائية (*** تم تصحيح الأصوات ***) ------
function showResults() {
    clearInterval(timerInterval);
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    // ... (بقية العناصر) ...
    if (quizScreen) quizScreen.classList.add('hidden');
    if (resultsScreen) resultsScreen.classList.remove('hidden');
    let correctCount = 0;
    Object.values(userAnswers).forEach(answer => {
        if (answer.isCorrect) {
            correctCount++;
        }
    });
    const totalQuestions = currentQuestions.length;
    const wrongCount = totalQuestions - correctCount;
    // *** تشغيل صوت الإنجاز المثالي ***
    if (wrongCount === 0 && totalQuestions > 0) { 
        if (perfectSound) {
            perfectSound.currentTime = 0;
            perfectSound.play().catch(e => console.warn("Error playing perfect sound:", e));
        }
    }
    // *** نهاية تصحيح الصوت ***
    if (finalScoreElement) finalScoreElement.textContent = score;
    if (totalQuestionsCountElement) totalQuestionsCountElement.textContent = totalQuestions;
    if (correctCountElement) correctCountElement.textContent = correctCount;
    if (wrongCountElement) wrongCountElement.textContent = wrongCount;
    // ... (بقية منطق النتائج) ...
    const progressRingFill = document.querySelector('.progress-ring-fill');
    if (progressRingFill) {
        const radius = progressRingFill.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        progressRingFill.style.strokeDashoffset = offset;
    }
    // ... (بقية منطق منطقة المراجعة) ...
}
// **=================================================**
// [4] وظائف مساعدة 
// **=================================================**
// ------ دالة المؤقت (*** معدلة لإضافة data-critical ***) ------
function startTimer() {
    clearInterval(timerInterval); 
    let timeRemaining = TIME_LIMIT;
    const timerValueElement = document.querySelector('#timer-display .timer-value'); 
    const timerUnitElement = document.querySelector('#timer-display .timer-unit'); 
    const progressBar = document.getElementById('progress-bar-fill');
    const timerDisplayElement = document.getElementById('timer-display'); 
    const t = translations[currentLanguage];
    // Reset styles and text
    if (timerValueElement) timerValueElement.textContent = timeRemaining;
    if (timerUnitElement) timerUnitElement.textContent = t.timer_text; 
    if (progressBar) progressBar.style.width = '100%';
    // *** جديد: إعادة المؤقت للوضع الطبيعي ***
    if (timerDisplayElement) {
        timerDisplayElement.style.color = 'var(--neon-blue)'; 
        timerDisplayElement.removeAttribute('data-critical'); 
    }
    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timerValueElement) timerValueElement.textContent = timeRemaining;
        const progressPercentage = (timeRemaining / TIME_LIMIT) * 100;
        if (progressBar) progressBar.style.width = `${progressPercentage}%`;
        // Change timer color as warning & add data attribute
        if (timeRemaining <= 5) {
            if (timerDisplayElement) {
                timerDisplayElement.style.color = 'var(--incorrect-color)'; // تغيير مباشر للون
                timerDisplayElement.setAttribute('data-critical', 'true'); // إضافة للمساعدة في CSS
            }
        } else {
             if (timerDisplayElement) {
                 timerDisplayElement.style.color = 'var(--neon-blue)'; // إعادة اللون
                 timerDisplayElement.removeAttribute('data-critical'); // إزالة للمساعدة في CSS
             }
        }
        // Handle timeout
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}
// ------ دالة الترجمة (TranslateUI) ------
function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar']; 
    document.documentElement.lang = langCode; 
    document.documentElement.dir = (langCode === 'ar') ? 'rtl' : 'ltr'; 
    const updateText = (selector, key) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = t[key];
    };
     const updateHTML = (selector, key, iconClass = '') => {
        const element = document.querySelector(selector);
        if (element) {
             const iconHTML = iconClass ? `<span class="btn-icon"><i class="${iconClass}"></i></span>` : '';
             if (element.classList.contains('control-btn')) {
                  const existingIcon = element.querySelector('.btn-icon');
                  const iconToUse = existingIcon ? existingIcon.outerHTML : (iconHTML ? iconHTML : ''); 
                  element.innerHTML = `${iconToUse}<span class="btn-text">${t[key]}</span>${element.querySelector('.btn-glow') ? '<span class="btn-glow"></span>' : ''}`;
             } else {
                  element.innerHTML = t[key] + (iconHTML ? ` ${iconHTML}` : ''); 
             }
        }
    };
    updateHTML('#start-quiz-btn .btn-text', 'start_custom_quiz'); 
    updateHTML('#daily-challenge-btn .btn-text', 'daily_challenge_button'); 
    
    const headerTitle = document.getElementById('topics-header-title');
    if (headerTitle) {
        const backBtn = document.getElementById('back-to-main-menu-btn');
        const backBtnVisible = backBtn && !backBtn.classList.contains('hidden');
        if (backBtnVisible) {
            headerTitle.innerHTML = `<i class="fas fa-globe-americas"></i> ${t.choose_gis_domain}`;
        } else {
            headerTitle.innerHTML = `<i class="fas fa-folder-open"></i> ${t.choose_domain}`;
        }
    }
    updateHTML('#back-to-main-menu-btn .btn-text', 'back_button');
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        updateText('#quiz-title', 'quiz_title_prefix'); 
        updateHTML('#submit-btn .btn-text', 'submit');
        updateHTML('#next-btn .btn-text', 'next');
        const timerUnitElement = document.querySelector('#timer-display .timer-unit');
         if (timerUnitElement) timerUnitElement.textContent = t.timer_text;
          const questionCounterElement = document.getElementById('question-counter');
        if (questionCounterElement) {
            questionCounterElement.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        }
    }
     if (!document.getElementById('results-screen').classList.contains('hidden')) {
        updateHTML('#results-screen button[onclick*="reload"] .btn-text', 'new_quiz');
         const reviewTitle = document.querySelector('#review-area h3');
         if (reviewTitle) reviewTitle.innerHTML = `<i class="fas fa-bug"></i> ${t.review_errors}`;
          document.querySelectorAll('.review-item').forEach(item => {
              const yourAnswerP = item.querySelector('.error-a:first-of-type');
              const correctAnswerP = item.querySelector('.error-a:last-of-type');
              const wrongSpan = item.querySelector('.wrong');
              const rightSpan = item.querySelector('.right');
              if (yourAnswerP && wrongSpan) {
                  yourAnswerP.innerHTML = `${t.your_answer} <span class="wrong">${wrongSpan.textContent}</span>`;
              }
              if (correctAnswerP && rightSpan) {
                  correctAnswerP.innerHTML = `${t.correct_answer} <span class="right">${rightSpan.textContent}</span>`;
              }
          });
         const allCorrectMsg = document.querySelector('.all-correct');
         if(allCorrectMsg) allCorrectMsg.textContent = t.all_correct_message;
    }
     const activeUsersIndicator = document.querySelector('.active-users-indicator');
     if (activeUsersIndicator) activeUsersIndicator.title = t.active_users_title;
    const langSelect = document.getElementById('lang-select');
    if (langSelect) langSelect.value = langCode;
}
function changeLanguage(langCode) {
    translateUI(langCode);
}
// ------ تبديل السمة (Theme Toggle) ------
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const body = document.body;
        let currentTheme = body.getAttribute('data-theme');
        const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggleBtn.innerHTML = (newTheme === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
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
    messageElement.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');
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
    // --- التحكم في القائمة الجانبية ---
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    if (openSidebarBtn && sidebar && overlay) {
        openSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.style.display = 'block';
        });
    }
    if (closeSidebarBtn && sidebar && overlay) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
        });
    }
     if (overlay && sidebar) {
          overlay.addEventListener('click', () => {
               sidebar.classList.remove('open');
               overlay.style.display = 'none';
          });
     }
    // --- زر الرجوع من قائمة المواضيع ---
    const backBtn = document.getElementById('back-to-main-menu-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            populateTopicLists(geologicalData, false); // العودة للقائمة الرئيسية
        });
    }
    // --- زر العودة من شاشة الاختبار (Home) ---
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.reload(); // إعادة تحميل الصفحة للعودة للقائمة الرئيسية
        });
    }
    // --- Active users count update ---
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
     // --- تحميل بيانات الاختبار ---
    loadGeologyData(); // Load data after DOM is ready
});
// Load initial language (could be from storage or default)
translateUI(currentLanguage);
