// **=================================================**
// ** ملف: script.js (الإصلاح النهائي والمتقدم)     **
// **=================================================**

// [1] المتغيرات العالمية والبيانات
let geologicalData = {}; 
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval;
let timeLeft = 0;
const TIME_LIMIT = 20;
const POINTS_CORRECT = 5;
const POINTS_WRONG = -3; 
let currentLanguage = 'ar';
let isSidebarOpen = false;
let currentDomainKey = '';

// قاموس الترجمة
const translations = {
    'ar': {
        'start_quiz': 'ابدأ الاختبار', 'choose_domain': 'اختر مجال الاختبار:', 'question': 'السؤال',
        'submit': 'تأكيد الإجابة', 'next': 'السؤال التالي', 'review_errors': 'مراجعة الأخطاء المفاهيمية:',
        'your_answer': 'إجابتك:', 'correct_answer': 'الصحيح:', 'great_job': '🌟 أداء استثنائي! معرفة جيولوجية قوية.',
        'good_job': '✨ جيد جداً! أساس متين، لكن هناك مجال للمراجعة.', 'needs_review': '⚠️ تحتاج إلى مراجعة مكثفة لهذه المفاهيم.',
        'new_quiz': 'إعادة تشغيل النظام', 'timer_text': ' ث',
        'loading_text': 'جاري تهيئة نظام Geo-Master...', 'best_score': 'أفضل أداء:'
    },
    'en': {
        // ... (الترجمات الإنجليزية)
        'start_quiz': 'Start Quiz', 'choose_domain': 'Choose Quiz Domain:', 'question': 'Question', 'submit': 'Submit Answer',
        'next': 'Next Question', 'review_errors': 'Review Conceptual Errors:', 'your_answer': 'Your Answer:',
        'correct_answer': 'Correct:', 'great_job': '🌟 Exceptional performance! Strong geological knowledge.',
        'good_job': '✨ Very good! Solid foundation, but room for review.', 'needs_review': '⚠️ Requires intensive review of these concepts.',
        'new_quiz': 'Restart System', 'timer_text': ' s', 'loading_text': 'Initializing Geo-Master System...',
        'best_score': 'Best Score:'
    },
    'fr': {
        // ... (الترجمات الفرنسية)
        'start_quiz': 'Commencer le Quiz', 'choose_domain': 'Choisissez un domaine de Quiz:', 'question': 'Question',
        'submit': 'Soumettre la Réponse', 'next': 'Question Suivante', 'review_errors': 'Revue des Erreurs Conceptuelles:',
        'your_answer': 'Votre Réponse:', 'correct_answer': 'La Bonne:', 'great_job': '🌟 Performance exceptionnelle! Solides connaissances géologiques.',
        'good_job': '✨ Très bien! Base solide, mais il y a place à l\'amélioration.',
        'needs_review': '⚠️ Nécessite une révision intensive de ces concepts.', 'new_quiz': 'Redémarrer le Système',
        'timer_text': ' s', 'loading_text': 'Initialisation du système Geo-Master...', 'best_score': 'Meilleur Score:'
    }
};


// [2] دوال مساعدة وتحكم في المؤقت (Timer & Sidebar)

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = TIME_LIMIT;
    document.getElementById('timer').textContent = timeLeft + translations[currentLanguage].timer_text;

    timerInterval = setInterval(() => {
        if (!isSidebarOpen) { // لا ينقص الوقت والقائمة مفتوحة (إصلاح العيب)
            timeLeft--;
            document.getElementById('timer').textContent = timeLeft + translations[currentLanguage].timer_text;

            if (timeLeft <= 5) {
                document.getElementById('timer').classList.add('low-time');
            } else {
                document.getElementById('timer').classList.remove('low-time');
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                document.getElementById('timer').textContent = '0' + translations[currentLanguage].timer_text;
                submitAnswer(true); // تأكيد الإجابة تلقائيًا
            }
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

// دالة إصلاح عيب "التوقف المؤقت"
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const appContainer = document.getElementById('app-container');
    isSidebarOpen = !isSidebarOpen;
    
    if (isSidebarOpen) {
        sidebar.classList.add('open');
        appContainer.classList.add('sidebar-open');
        stopTimer();
    } else {
        sidebar.classList.remove('open');
        appContainer.classList.remove('sidebar-open');
        if (document.getElementById('quiz-screen').classList.contains('active')) {
            startTimer();
        }
    }
}


// [3] إدارة حالة واجهة المستخدم والترجمة

function applyTranslation() {
    const t = translations[currentLanguage];
    document.getElementById('choose-domain').textContent = t.choose_domain;
    document.getElementById('submit-btn').textContent = t.submit;
    document.getElementById('next-btn').textContent = t.next;
    document.getElementById('review-errors').textContent = t.review_errors;
    document.getElementById('new-quiz-btn').textContent = t.new_quiz;
    document.querySelector('.loading-text').textContent = t.loading_text;
    document.getElementById('best-score-title').textContent = t.best_score;
    
    // تحديث أسماء المجالات في الشاشة الافتتاحية
    if (geologicalData && Object.keys(geologicalData).length > 0) {
        renderDomainButtons(geologicalData);
    }
}

function changeLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.dir = (lang === 'ar' ? 'rtl' : 'ltr');
    applyTranslation();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    // إخفاء الأزرار أثناء الانتقال
    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('timer').classList.remove('low-time');
    
    if (screenId !== 'quiz-screen') {
        stopTimer();
    }
}

// [4] التحميل الأولي للبيانات (إصلاح فشل البدء)
async function loadGeologyData() {
    try {
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.style.display = 'flex';

        // استخدام Fetch لتحميل ملف JSON الخارجي
        const response = await fetch('Question.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        geologicalData = await response.json();
        
        // التحميل ناجح
        loadingOverlay.style.display = 'none';
        initializeUI();

    } catch (error) {
        console.error("Error loading or parsing JSON data:", error);
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.innerHTML = `<p style="color:red; font-size:1.5rem;">
            **خطأ فادح في تحميل البيانات!** <br> 
            تأكد أن ملف **Question.json** موجود وصيغته (JSON Syntax) صحيحة.<br>
            الخطأ: ${error.message}
        </p>`;
    }
}

function initializeUI() {
    // عرض الأزرار وتحميل اللغة
    renderDomainButtons(geologicalData);
    showScreen('intro-screen');
    applyTranslation();
    document.getElementById('app-container').style.display = 'block';
    // عرض أفضل نتيجة سابقة (إصلاح عيب الحفظ)
    updateBestScoreDisplay();
}

// [5] دوال إدارة الاختبار (Quiz Logic)

function renderDomainButtons(data) {
    const container = document.getElementById('domain-buttons');
    container.innerHTML = '';
    Object.keys(data).forEach(domain => {
        const button = document.createElement('button');
        button.textContent = domain;
        button.className = 'domain-btn';
        button.onclick = () => startQuiz(domain);
        container.appendChild(button);
    });
}

function startQuiz(domain) {
    currentDomainKey = domain;
    currentQuestions = [...geologicalData[domain]].sort(() => 0.5 - Math.random()); // أسئلة عشوائية
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
    document.getElementById('score').textContent = `النقاط: 0`;
    showScreen('quiz-screen');
    displayQuestion();
}

function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    if (!question) {
        return showResults();
    }

    // إعداد واجهة السؤال
    document.getElementById('question-text').textContent = `${translations[currentLanguage].question} ${currentQuestionIndex + 1}: ${question.question}`;
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // إنشاء خيارات الإجابة
    question.options.forEach(option => {
        const label = document.createElement('label');
        label.className = 'option-label';
        label.innerHTML = `<input type="radio" name="answer" value="${option}" onclick="selectOption(this)"> ${option}`;
        optionsContainer.appendChild(label);
    });

    document.getElementById('submit-btn').classList.remove('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    startTimer();
}

function selectOption(selectedInput) {
    // تفعيل زر التأكيد
    document.getElementById('submit-btn').disabled = false;
    document.querySelectorAll('.option-label').forEach(label => label.classList.remove('selected'));
    selectedInput.closest('.option-label').classList.add('selected');
}


function submitAnswer(isTimeout = false) {
    stopTimer();
    const question = currentQuestions[currentQuestionIndex];
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    let isCorrect = false;
    
    if (selectedOption || isTimeout) {
        const userAnswer = selectedOption ? selectedOption.value : (isTimeout ? 'لم يُجب' : null);
        userAnswers[currentQuestionIndex] = {
            question: question.question,
            correct: question.answer,
            user: userAnswer,
            isCorrect: false
        };

        if (userAnswer === question.answer) {
            score += POINTS_CORRECT;
            isCorrect = true;
        } else {
            // تطبيق Score Floor: النقاط لا تنخفض أبداً عن الصفر
            score = Math.max(0, score + POINTS_WRONG); 
        }

        userAnswers[currentQuestionIndex].isCorrect = isCorrect;
    } 
    
    // تحديث النتيجة
    document.getElementById('score').textContent = `النقاط: ${score}`;
    
    // تلوين الخيارات (التغذية الراجعة)
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true; // منع التعديل
        if (input.value === question.answer) {
            label.classList.add('correct');
        } else if (selectedOption && input.value === selectedOption.value) {
            label.classList.add('wrong');
        }
    });

    // إظهار زر التالي
    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
}


function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        displayQuestion();
    } else {
        showResults();
    }
}


function showResults() {
    // [إصلاح عيب حفظ النتيجة]
    updateBestScore(currentDomainKey, score);
    updateBestScoreDisplay();

    showScreen('result-screen');
    const finalScoreElement = document.getElementById('final-score');
    const gradingMessageElement = document.getElementById('grading-message');
    const t = translations[currentLanguage];

    finalScoreElement.textContent = `النتيجة النهائية: ${score} من ${currentQuestions.length * POINTS_CORRECT}`;

    // رسالة التقييم
    const maxScore = currentQuestions.length * POINTS_CORRECT;
    const percentage = (score / maxScore) * 100;

    if (percentage >= 80) {
        gradingMessageElement.textContent = t.great_job;
    } else if (percentage >= 50) {
        gradingMessageElement.textContent = t.good_job;
    } else {
        gradingMessageElement.textContent = t.needs_review;
    }

    // مراجعة الأخطاء
    const reviewContainer = document.getElementById('review-container');
    reviewContainer.innerHTML = '';
    
    Object.values(userAnswers).forEach(answer => {
        if (!answer.isCorrect) {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.innerHTML = `
                <p class="review-question">${t.question}: ${answer.question}</p>
                <p class="review-user">${t.your_answer} <span>${answer.user}</span></p>
                <p class="review-correct">${t.correct_answer} <span>${answer.correct}</span></p>
                <hr>
            `;
            reviewContainer.appendChild(reviewItem);
        }
    });
    if (reviewContainer.innerHTML === '') {
        reviewContainer.innerHTML = `<p style="color:#2ecc71;">لا توجد أخطاء لمراجعتها! 🥳</p>`;
    }
}

// [6] دوال حفظ الأداء (Local Storage)
function updateBestScore(domainKey, newScore) {
    const savedScores = JSON.parse(localStorage.getItem('geoQuizBestScores') || '{}');
    const currentBest = savedScores[domainKey] || 0;
    
    if (newScore > currentBest) {
        savedScores[domainKey] = newScore;
        localStorage.setItem('geoQuizBestScores', JSON.stringify(savedScores));
        alert(`سجل جديد في ${domainKey}! ${newScore} نقطة!`);
    }
}

function updateBestScoreDisplay() {
    const savedScores = JSON.parse(localStorage.getItem('geoQuizBestScores') || '{}');
    const scoresHtml = Object.keys(savedScores).map(domain => 
        `<li>${domain}: ${savedScores[domain]}</li>`
    ).join('');
    
    document.getElementById('best-score-value').innerHTML = 
        scoresHtml ? `<ul>${scoresHtml}</ul>` : 'لا يوجد سجلات سابقة.';
}


function restartQuiz() {
    stopTimer();
    showScreen('intro-screen');
    document.getElementById('score').textContent = `النقاط: 0`;
}


// بدء تحميل البيانات عند تشغيل الصفحة
window.onload = loadGeologyData;

