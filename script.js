// **=================================================**
// ** ملف: script.js (المصحح) - يحتاج Question.json **
// **=================================================**

// [1] المتغيرات العالمية والتحكم
let geologicalData = {}; 
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval;
const TIME_LIMIT = 20;
const POINTS_CORRECT = 5;
const POINTS_WRONG = -3;
let currentLanguage = 'ar';

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
        'current_lang': 'العربية'
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
        'current_lang': 'English'
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
        'current_lang': 'Français'
    }
};

// ---------------------- 2. دالة تحميل البيانات ----------------------

async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    try {
        loadingMessage.textContent = '... جاري تحميل بيانات النظام';
        
        // محاكاة تحميل البيانات (يمكن إزالتها لاحقاً)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch('./Question.json'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        geologicalData = await response.json();
        
        console.log('تم تحميل البيانات:', geologicalData); // للتdebug
        
        initializeTopicSelection(geologicalData); 

    } catch (error) {
        console.error("فشل في تحميل بيانات الجيولوجيا:", error);
        loadingMessage.innerHTML = `
            <div style="color: var(--incorrect-color); margin-bottom: 15px;">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <p>[خطأ الاتصال] عذراً، لا يمكن تحميل البيانات.</p>
            <button onclick="loadGeologyData()" class="large-btn" style="margin-top: 15px;">
                إعادة المحاولة
            </button>
        `;
    }
}

// ---------------------- 3. نظام المؤقت ----------------------

function startTimer() {
    clearInterval(timerInterval);
    let timeRemaining = TIME_LIMIT;
    const timerDisplay = document.getElementById('timer-display');
    const progressBar = document.getElementById('progress-bar-fill');
    const t = translations[currentLanguage];

    progressBar.style.width = '100%';
    timerDisplay.textContent = `${timeRemaining}${t.timer_text}`;

    timerInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = `${timeRemaining}${t.timer_text}`;
        
        const progressPercentage = (timeRemaining / TIME_LIMIT) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // تغيير لون المؤقت كإنذار
        if (timeRemaining <= 5) {
            timerDisplay.style.color = 'var(--incorrect-color)';
        } else {
            timerDisplay.style.color = 'var(--neon-blue)';
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
        userAnswer: `(انتهى الوقت)`,
        correctAnswer: currentQ.answer,
        isCorrect: false,
    };
    
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true;
        if (input.value === currentQ.answer) {
            label.classList.add('correct'); 
        }
    });

    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 1500);
}

// ---------------------- 4. نظام اللغات المحسن ----------------------

function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar'];

    // تحديث النصوص الأساسية
    document.getElementById('start-quiz-btn').textContent = t.start_quiz;
    document.getElementById('submit-btn').textContent = t.submit;
    document.getElementById('next-btn').textContent = t.next;
    document.querySelector('#topics-list-container h3').textContent = t.choose_domain;
    document.querySelector('#results-screen .large-btn').textContent = t.new_quiz;
    document.getElementById('current-lang').textContent = t.current_lang;
    
    // تحديث النصوص الديناميكية
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        document.getElementById('timer-display').textContent = `${TIME_LIMIT}${t.timer_text}`;
        document.getElementById('question-counter').textContent = `${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        document.querySelector('.review-log h3').textContent = t.review_errors;
    }
}

function setupLanguageSwitcher() {
    const langBtn = document.getElementById('language-btn');
    const langDropdown = document.getElementById('language-dropdown');
    
    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('hidden');
    });
    
    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', () => {
        langDropdown.classList.add('hidden');
    });
    
    // منع إغلاق القائمة عند النقر داخلها
    langDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // تغيير اللغة
    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            changeLanguage(lang);
            langDropdown.classList.add('hidden');
        });
    });
}

function changeLanguage(langCode) {
    currentLanguage = langCode;
    translateUI(langCode);
}

// ---------------------- 5. إدارة الشاشات ----------------------

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

// ---------------------- 6. نظام اختيار الموضوعات ----------------------

function initializeTopicSelection(data) {
    const topicsList = document.getElementById('topics-list'); 
    const sidebarList = document.getElementById('sidebar-topics-list');
    const loadingMessage = document.getElementById('loading-message');
    const topicsContainer = document.getElementById('topics-list-container');

    if (loadingMessage) loadingMessage.classList.add('hidden');
    topicsList.innerHTML = '';
    sidebarList.innerHTML = '';

    // التحقق من وجود بيانات
    if (!data || Object.keys(data).length === 0) {
        topicsList.innerHTML = '<p>لا توجد مواضيع متاحة حالياً</p>';
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
        `;
        
        // إنشاء رابط الموضوع للقائمة الجانبية
        const sidebarLink = document.createElement('a');
        sidebarLink.href = "#";
        sidebarLink.textContent = topicDisplayName;
        
        const startQuizHandler = () => {
            if (questionCount > 0) {
                startQuiz(topicDisplayName, questions);
                closeSidebar();
            } else {
                alert('لا توجد أسئلة في هذا الموضوع');
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

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
}

// ---------------------- 7. نظام الاختبار ----------------------

function startQuiz(topicTitle, questions) {
    clearInterval(timerInterval);
    
    // التحقق من صحة البيانات
    if (!Array.isArray(questions) || questions.length === 0) {
        alert('لا توجد أسئلة في هذا الموضوع');
        return;
    }
    
    currentQuestions = questions;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};

    showScreen('quiz-screen');
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

    let htmlContent = `<div class="question-text">${currentQ.question}</div>`;
    htmlContent += '<div class="options-container">';

    currentQ.options.forEach((option, index) => {
        htmlContent += `
            <label class="option-label">
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

// ---------------------- 8. معالجة الإجابة ----------------------

function handleAnswerSubmission() {
    clearInterval(timerInterval); 
    
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) {
        alert('يرجى اختيار إجابة أولاً');
        return;
    }

    const currentQ = currentQuestions[currentQuestionIndex];
    const userAnswer = selectedOption.value;
    const isCorrect = (userAnswer === currentQ.answer);
    
    if (isCorrect) {
        score += POINTS_CORRECT;
    } else {
        score += POINTS_WRONG;
    }

    userAnswers[currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: userAnswer,
        correctAnswer: currentQ.answer,
        isCorrect: isCorrect,
    };

    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true; 

        if (input.value === currentQ.answer) {
            label.classList.add('correct'); 
        } else if (input.value === userAnswer && !isCorrect) {
            label.classList.add('incorrect'); 
        }
    });

    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
}

// ---------------------- 9. عرض النتائج ----------------------

function showResults() {
    clearInterval(timerInterval); 
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');

    document.getElementById('final-score').textContent = score;

    const correctAnswers = Object.values(userAnswers).filter(a => a.isCorrect).length;
    const totalQuestions = currentQuestions.length;
    const percentage = (correctAnswers / totalQuestions) * 100;
    
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

    const reviewArea = document.getElementById('review-area');
    reviewArea.innerHTML = `<h3>${t.review_errors}</h3>`;
    let errorsFound = false;
    
    Object.values(userAnswers).forEach(answer => {
        if (!answer.isCorrect) {
            errorsFound = true;
            reviewArea.innerHTML += `
                <div class="review-item">
                    <div class="review-question">${answer.question}</div>
                    <div class="review-answer">
                        <div class="user-answer">${t.your_answer} ${answer.userAnswer}</div>
                        <div class="correct-answer">${t.correct_answer} ${answer.correctAnswer}</div>
                    </div>
                </div>
            `;
        }
    });
    
    if (!errorsFound) {
        reviewArea.innerHTML += '<p class="all-correct">🎉 ممتاز! لا توجد أخطاء لمراجعتها.</p>';
    }
}

// ---------------------- 10. إعداد الأحداث ----------------------

document.addEventListener('DOMContentLoaded', function() {
    // التحكم في القائمة الجانبية
    document.getElementById('open-sidebar-btn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('overlay').style.display = 'block';
    });
    
    document.getElementById('close-sidebar-btn').addEventListener('click', closeSidebar);
    
    document.getElementById('overlay').addEventListener('click', closeSidebar);

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
        showScreen('welcome-screen');
    });

    // إعداد نظام اللغات
    setupLanguageSwitcher();
});

function resetQuiz() {
    clearInterval(timerInterval);
    currentQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
}

// بدء تحميل البيانات
loadGeologyData();