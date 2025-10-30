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

// قسم التعرف على الصخور
function generateRockQuestions() {
    rockQuestions = [];
    
    // قائمة بأسماء الصخور من المجلدات مع ترجماتها
    const rockData = [
        { name: 'Gneiss', displayName: 'النيس', image: 'Gneiss.jpeg' },
        { name: 'Granite', displayName: 'الجرانيت', image: 'Granite.jpg' },
        { name: 'Marbre', displayName: 'الرخام', image: 'Marbre.jpeg' },
        { name: 'Marnes', displayName: 'المارل', image: 'Marnes.jpg' },
        { name: 'Quartzite', displayName: 'الكوارتزيت', image: 'Quartzite.jpeg' },
        { name: 'Rhyclite', displayName: 'الريولايت', image: 'Rhyclite.jpg' },
        { name: 'Schiste', displayName: 'الشيست', image: 'Schiste.jpg' },
        { name: 'argilite', displayName: 'الأرجيليت', image: 'argilite.jpeg' },
        { name: 'grès', displayName: 'الحجر الرملي', image: 'grès.jpeg' },
        { name: 'shale', displayName: 'الطفل', image: 'shale.jpeg' },
        { name: 'Andésite', displayName: 'الأنديزيت', image: 'Andésite.jpeg' },
        { name: 'Basalte', displayName: 'البازلت', image: 'Basalte.jpg' },
        { name: 'Calcaire', displayName: 'الحجر الجيري', image: 'Calcaire.jpeg' },
        { name: 'Conglomérat', displayName: 'المدملكات', image: 'Conglomérat.jpeg' },
        { name: 'Diorite', displayName: 'الديوريت', image: 'Diorite.jpg' },
        { name: 'Dolomie', displayName: 'الدولوميت', image: 'Dolomie.jpeg' },
        { name: 'Gabbro', displayName: 'الجابرو', image: 'Gabbro.jpg' }
    ];
    
    // إنشاء أسئلة للصخور
    rockData.forEach(rock => {
        // إنشاء خيارات عشوائية
        const otherRocks = rockData.filter(r => r.name !== rock.name);
        shuffleArray(otherRocks);
        const selectedOptions = otherRocks.slice(0, 3).map(r => r.displayName);
        selectedOptions.push(rock.displayName);
        shuffleArray(selectedOptions);
        
        rockQuestions.push({
            rock: rock.name,
            displayName: rock.displayName,
            image: rock.image,
            options: selectedOptions,
            answer: rock.displayName
        });
    });
}

// بدء اختبار الصخور
function startRockQuiz() {
    currentRockIndex = 0;
    rockScore = 0;
    rockScoreElement.textContent = '0';
    shuffleArray(rockQuestions);
    showRockQuestion();
}

// عرض سؤال الصخور
function showRockQuestion() {
    const rockQuestion = rockQuestions[currentRockIndex];
    
    // تحديث صورة الصخرة
    rockImage.src = `roch/${rockQuestion.image}`;
    rockImage.alt = rockQuestion.displayName;
    rockName.textContent = 'ما اسم هذه الصخرة؟';
    
    // تحديث خيارات الإجابة
    rockOptions.forEach((option, index) => {
        option.textContent = rockQuestion.options[index];
        option.className = 'rock-option';
        option.disabled = false;
    });
    
    // إعادة تعيين المؤقت
    startRockTimer();
    
    // إخفاء زر التالي
    nextRockBtn.style.display = 'none';
}

// اختيار إجابة في قسم الصخور
function selectRockOption(option) {
    // تعطيل جميع الخيارات
    rockOptions.forEach(opt => {
        opt.disabled = true;
    });
    
    const selectedAnswer = option.textContent;
    const correctAnswer = rockQuestions[currentRockIndex].answer;
    
    // التحقق من الإجابة
    if (selectedAnswer === correctAnswer) {
        option.classList.add('correct');
        rockScore++;
        rockScoreElement.textContent = rockScore;
        correctSound.play().catch(e => console.log('خطأ في تشغيل الصوت:', e));
        rockName.textContent = `✓ ${rockQuestions[currentRockIndex].displayName}`;
        rockName.style.color = '#2ecc71';
    } else {
        option.classList.add('wrong');
        
        // إظهار الإجابة الصحيحة
        rockOptions.forEach(opt => {
            if (opt.textContent === correctAnswer) {
                opt.classList.add('correct');
            }
        });
        
        wrongSound.play().catch(e => console.log('خطأ في تشغيل الصوت:', e));
        rockName.textContent = `✗ ${rockQuestions[currentRockIndex].displayName}`;
        rockName.style.color = '#e74c3c';
    }
    
    // إظهار زر التالي
    nextRockBtn.style.display = 'block';
    
    // إيقاف المؤقت
    clearInterval(rockTimer);
}

// عرض الصخرة التالية
function showNextRock() {
    if (currentRockIndex < rockQuestions.length - 1) {
        currentRockIndex++;
        showRockQuestion();
    } else {
        // نهاية اختبار الصخور
        alert(`🏆 انتهى اختبار الصخور!\n\nلقد حصلت على ${rockScore} من ${rockQuestions.length}\n\n${rockScore >= rockQuestions.length * 0.7 ? 'أداء رائع! 👏' : 'حاول مرة أخرى! 💪'}`);
        startRockQuiz(); // إعادة البدء
    }
}

// بدء مؤقت الصخور
function startRockTimer() {
    let timeLeft = 20;
    rockTimerElement.textContent = timeLeft;
    rockTimerElement.className = 'timer';
    
    clearInterval(rockTimer);
    rockTimer = setInterval(() => {
        timeLeft--;
        rockTimerElement.textContent = timeLeft;
        
        // تغيير لون المؤقت عند اقتراب النهاية
        if (timeLeft <= 5) {
            rockTimerElement.classList.add('danger');
        } else if (timeLeft <= 10) {
            rockTimerElement.classList.add('warning');
        }
        
        // انتهاء الوقت
        if (timeLeft <= 0) {
            clearInterval(rockTimer);
            // تعطيل الخيارات تلقائيًا
            rockOptions.forEach(opt => {
                opt.disabled = true;
            });
            
            // إظهار الإجابة الصحيحة
            const correctAnswer = rockQuestions[currentRockIndex].answer;
            rockOptions.forEach(opt => {
                if (opt.textContent === correctAnswer) {
                    opt.classList.add('correct');
                }
            });
            
            // إظهار زر التالي
            nextRockBtn.style.display = 'block';
            
            wrongSound.play().catch(e => console.log('خطأ في تشغيل الصوت:', e));
            rockName.textContent = `⏰ ${rockQuestions[currentRockIndex].displayName}`;
            rockName.style.color = '#e74c3c';
        }
    }, 1000);
}

// إظهار قسم معين وإخفاء الآخرين
function showSection(sectionId) {
    // إخفاء جميع الأقسام
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إظهار القسم المطلوب
    document.getElementById(sectionId).classList.add('active');
}

// تعيين زر التنقل النشط
function setActiveNav(activeBtn) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
}

// تحديث عدد المستخدمين النشطين
function updateActiveUsers() {
    // عدد عشوائي بين 3 و 11
    const activeCount = Math.floor(Math.random() * 9) + 3;
    activeUsersCount.textContent = activeCount;
    
    // تحديث كل 30 ثانية
    setTimeout(updateActiveUsers, 30000);
}

// دالة لخلط المصفوفات (لخلط الأسئلة والخيارات)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}