// البيانات والمتغيرات العامة
let currentCategory = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let quizScore = 0;
let quizTimer;
let rockTimer;
let rockScore = 0;
let currentRockIndex = 0;
let rockQuestions = [];

// عناصر DOM
const quizSection = document.getElementById('quiz-section');
const rocksSection = document.getElementById('rocks-section');
const questionsSection = document.getElementById('questions-section');
const resultsSection = document.getElementById('results-section');

const quizBtn = document.getElementById('quiz-btn');
const rocksBtn = document.getElementById('rocks-btn');

const categoriesGrid = document.getElementById('categories-container');
const quizTitle = document.getElementById('quiz-title');
const questionText = document.getElementById('question-text');
const options = document.querySelectorAll('.option');
const rockOptions = document.querySelectorAll('.rock-option');

const quizTimerElement = document.getElementById('quiz-timer');
const rockTimerElement = document.getElementById('rock-timer');
const quizProgress = document.getElementById('quiz-progress');
const quizScoreElement = document.getElementById('quiz-score');
const rockScoreElement = document.getElementById('rock-score');

const prevQuestionBtn = document.getElementById('prev-question');
const nextQuestionBtn = document.getElementById('next-question');
const finishQuizBtn = document.getElementById('finish-quiz');
const nextRockBtn = document.getElementById('next-rock');

const finalScoreElement = document.getElementById('final-score');
const correctCountElement = document.getElementById('correct-count');
const wrongCountElement = document.getElementById('wrong-count');
const restartQuizBtn = document.getElementById('restart-quiz');
const backToCategoriesBtn = document.getElementById('back-to-categories');

const activeUsersCount = document.getElementById('active-users-count');
const rockImage = document.getElementById('rock-image');
const rockName = document.getElementById('rock-name');

// الأصوات
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const perfectSound = document.getElementById('perfect-sound');

// بيانات الأسئلة (سيتم تحميلها من ملف JSON)
let questionsData = {};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    setupEventListeners();
    updateActiveUsers();
});

// تهيئة التطبيق
async function initApp() {
    await loadQuestionsData();
    loadCategories();
    generateRockQuestions();
    showSection('quiz-section');
}

// تحميل بيانات الأسئلة من ملف JSON
async function loadQuestionsData() {
    try {
        const response = await fetch('Question.json');
        questionsData = await response.json();
    } catch (error) {
        console.error('خطأ في تحميل بيانات الأسئلة:', error);
        // استخدام بيانات افتراضية في حالة الخطأ
        questionsData = getDefaultQuestions();
    }
}

// بيانات افتراضية للأسئلة
function getDefaultQuestions() {
    return {
        "الجيولوجيا_الأساسية": [
            { "id": 1, "question": "أي مما يلي يُعتبر من المعادن؟", "options": ["الكوارتز", "البازلت", "الجرانيت", "الحجر الجيري"], "answer": "الكوارتز" }
        ],
        "الجيوكيمياء": [
            { "id": 1, "question": "الجيوكيمياء تدرس؟", "options": ["شكل الصخور", "التركيب الكيميائي للعناصر والمعادن", "الكثافة والسرعة", "درجة الحرارة فقط"], "answer": "التركيب الكيميائي للعناصر والمعادن" }
        ]
    };
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // التنقل بين الأقسام
    quizBtn.addEventListener('click', () => {
        setActiveNav(quizBtn);
        showSection('quiz-section');
    });
    
    rocksBtn.addEventListener('click', () => {
        setActiveNav(rocksBtn);
        showSection('rocks-section');
        startRockQuiz();
    });
    
    // عناصر التحكم في الاختبار
    prevQuestionBtn.addEventListener('click', showPreviousQuestion);
    nextQuestionBtn.addEventListener('click', showNextQuestion);
    finishQuizBtn.addEventListener('click', finishQuiz);
    
    // عناصر التحكم في قسم الصخور
    nextRockBtn.addEventListener('click', showNextRock);
    
    // خيارات الأسئلة
    options.forEach(option => {
        option.addEventListener('click', () => selectOption(option));
    });
    
    // خيارات الصخور
    rockOptions.forEach(option => {
        option.addEventListener('click', () => selectRockOption(option));
    });
    
    // نتائج الاختبار
    restartQuizBtn.addEventListener('click', restartQuiz);
    backToCategoriesBtn.addEventListener('click', () => {
        showSection('quiz-section');
        setActiveNav(quizBtn);
    });
}

// تحميل التصنيفات وعرضها
function loadCategories() {
    categoriesGrid.innerHTML = '';
    
    for (const category in questionsData) {
        if (category === 'نظم_المعلومات_الجغرافية_GIS') {
            // معالجة فئات GIS بشكل خاص
            for (const subCategory in questionsData[category]) {
                const questions = questionsData[category][subCategory];
                createCategoryCard(subCategory, questions.length, category);
            }
        } else {
            const questions = questionsData[category];
            createCategoryCard(category, questions.length);
        }
    }
}

// إنشاء بطاقة تصنيف
function createCategoryCard(name, questionCount, parentCategory = null) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
        <h3>${formatCategoryName(name)}</h3>
        <p>${questionCount} سؤال</p>
        <div class="category-stats">
            <span>مستوى: ${getDifficultyLevel(questionCount)}</span>
            <span>وقت: ${Math.ceil(questionCount * 20 / 60)} دقيقة</span>
        </div>
    `;
    
    card.addEventListener('click', () => {
        startQuiz(name, parentCategory);
    });
    
    categoriesGrid.appendChild(card);
}

// تنسيق اسم التصنيف
function formatCategoryName(name) {
    return name.replace(/_/g, ' ').replace(/GIS/g, 'GIS');
}

// تحديد مستوى الصعوبة
function getDifficultyLevel(count) {
    if (count <= 15) return 'سهل';
    if (count <= 25) return 'متوسط';
    return 'صعب';
}

// بدء الاختبار
function startQuiz(category, parentCategory = null) {
    currentCategory = category;
    
    if (parentCategory) {
        currentQuestions = questionsData[parentCategory][category];
    } else {
        currentQuestions = questionsData[category];
    }
    
    // خلط الأسئلة
    shuffleArray(currentQuestions);
    
    // تحديد عدد الأسئلة (10 كحد أقصى)
    if (currentQuestions.length > 10) {
        currentQuestions = currentQuestions.slice(0, 10);
    }
    
    // إعادة تعيين المتغيرات
    currentQuestionIndex = 0;
    userAnswers = [];
    quizScore = 0;
    
    // تحديث واجهة الاختبار
    quizTitle.textContent = formatCategoryName(category);
    quizScoreElement.textContent = '0';
    
    // إظهار قسم الأسئلة
    showSection('questions-section');
    
    // بدء المؤقت
    startQuizTimer();
    
    // عرض السؤال الأول
    showQuestion();
}

// عرض السؤال الحالي
function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // تحديث نص السؤال
    questionText.textContent = question.question;
    
    // تحديث خيارات الإجابة
    options.forEach((option, index) => {
        option.textContent = question.options[index];
        option.className = 'option';
        option.disabled = false;
    });
    
    // تحديث تقدم الاختبار
    quizProgress.textContent = `${currentQuestionIndex + 1}/${currentQuestions.length}`;
    
    // تحديث حالة أزرار التنقل
    prevQuestionBtn.disabled = currentQuestionIndex === 0;
    nextQuestionBtn.disabled = userAnswers[currentQuestionIndex] === undefined;
    
    // إظهار الإجابة المحددة مسبقًا إن وجدت
    if (userAnswers[currentQuestionIndex] !== undefined) {
        const selectedOption = document.querySelector(`.option[data-option="${userAnswers[currentQuestionIndex] + 1}"]`);
        selectedOption.classList.add('selected');
    }
}

// اختيار إجابة
function selectOption(option) {
    // إزالة التحديد من جميع الخيارات
    options.forEach(opt => {
        opt.classList.remove('selected', 'correct', 'wrong');
    });
    
    // تحديد الخيار المختار
    option.classList.add('selected');
    
    // حفظ الإجابة
    const selectedIndex = parseInt(option.dataset.option) - 1;
    userAnswers[currentQuestionIndex] = selectedIndex;
    
    // تمكين زر التالي
    nextQuestionBtn.disabled = false;
}

// عرض السؤال التالي
function showNextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
        startQuizTimer();
    } else {
        finishQuiz();
    }
}

// عرض السؤال السابق
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
        startQuizTimer();
    }
}

// بدء مؤقت الاختبار
function startQuizTimer() {
    let timeLeft = 20;
    quizTimerElement.textContent = timeLeft;
    quizTimerElement.className = 'timer';
    
    clearInterval(quizTimer);
    quizTimer = setInterval(() => {
        timeLeft--;
        quizTimerElement.textContent = timeLeft;
        
        // تغيير لون المؤقت عند اقتراب النهاية
        if (timeLeft <= 5) {
            quizTimerElement.classList.add('danger');
        } else if (timeLeft <= 10) {
            quizTimerElement.classList.add('warning');
        }
        
        // انتهاء الوقت
        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            if (userAnswers[currentQuestionIndex] === undefined) {
                userAnswers[currentQuestionIndex] = -1; // إجابة فارغة
            }
            showNextQuestion();
        }
    }, 1000);
}

// إنهاء الاختبار وعرض النتائج
function finishQuiz() {
    clearInterval(quizTimer);
    
    // حساب النتيجة
    let correctCount = 0;
    let wrongCount = 0;
    
    currentQuestions.forEach((question, index) => {
        if (userAnswers[index] !== undefined && userAnswers[index] !== -1) {
            if (question.answer === question.options[userAnswers[index]]) {
                correctCount++;
            } else {
                wrongCount++;
            }
        } else {
            wrongCount++;
        }
    });
    
    quizScore = correctCount;
    
    // تحديث واجهة النتائج
    finalScoreElement.textContent = `${quizScore}/${currentQuestions.length}`;
    correctCountElement.textContent = correctCount;
    wrongCountElement.textContent = wrongCount;
    
    // تشغيل الصوت المناسب
    if (quizScore === currentQuestions.length) {
        perfectSound.play().catch(e => console.log('خطأ في تشغيل الصوت:', e));
    } else if (quizScore >= currentQuestions.length * 0.7) {
        correctSound.play().catch(e => console.log('خطأ في تشغيل الصوت:', e));
    } else {
        wrongSound.play().catch(e => console.log('خطأ في تشغيل الصوت:', e));
    }
    
    // إظهار قسم النتائج
    showSection('results-section');
}

// إعادة بدء الاختبار
function restartQuiz() {
    startQuiz(currentCategory);
}

// قسم التعرف على الص