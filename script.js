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
        if (!response.ok) {
            throw new Error('فشل في تحميل ملف الأسئلة');
        }
        questionsData = await response.json();
        console.log('تم تحميل بيانات الأسئلة بنجاح');
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
            { "id": 1, "question": "أي مما يلي يُعتبر من المعادن؟", "options": ["الكوارتز", "البازلت", "الجرانيت", "الحجر الجيري"], "answer": "الكوارتز" },
            { "id": 2, "question": "العنصر الأساسي في تركيب الكوارتز هو:", "options": ["الحديد", "السيليكون", "الكالسيوم", "الألومنيوم"], "answer": "السيليكون" }
        ],
        "الجيوكيمياء": [
            { "id": 1, "question": "الجيوكيمياء تدرس؟", "options": ["شكل الصخور", "التركيب الكيميائي للعناصر والمعادن", "الكثافة والسرعة", "درجة الحرارة فقط"], "answer": "التركيب الكيميائي للعناصر والمعادن" },
            { "id": 2, "question": "العنصر الأكثر وفرة في القشرة الأرضية؟", "options": ["الحديد", "السيليكون", "الأكسجين", "الألمنيوم"], "answer": "الأكسجين" }
        ],
        "الجيوفيزياء": [
            { "id": 1, "question": "الجيوفيزياء تدرس؟", "options": ["الخصائص الكيميائية", "الخصائص الفيزيائية للصخور", "الحفريات", "التركيب البلوري"], "answer": "الخصائص الفيزيائية للصخور" }
        ],
        "الهيدروجيولوجيا": [
            { "id": 1, "question": "الهيدروجيولوجيا تدرس:", "options": ["الصخور النارية فقط", "المياه الجوفية وحركتها", "التكتونيات", "المعادن"], "answer": "المياه الجوفية وحركتها" }
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
                const questionCount = Math.min(questions.length, 25);
                createCategoryCard(subCategory, questionCount, category);
            }
        } else {
            const questions = questionsData[category];
            const questionCount = Math.min(questions.length, 25);
            createCategoryCard(category, questionCount);
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
    const nameMap = {
        'GIS_الأساسيات': 'أساسيات GIS',
        'أدوات_وعمليات_GIS': 'أدوات وعمليات GIS',
        'GIS_في_الهيدروجيولوجيا': 'GIS في الهيدروجيولوجيا',
        'GIS_في_فروع_الجيولوجيا_الأخرى': 'GIS في فروع الجيولوجيا الأخرى'
    };
    
    let formattedName = name.replace(/_/g, ' ').replace(/GIS/g, 'GIS');
    return nameMap[name] || formattedName;
}

// تحديد مستوى الصعوبة
function getDifficultyLevel(count) {
    if (count <= 10) return 'سهل';
    if (count <= 20) return 'متوسط';
    return 'صعب';
}

// بدء الاختبار
function startQuiz(category, parentCategory = null) {
    currentCategory = category;
    
    let questions = [];
    if (parentCategory) {
        questions = questionsData[parentCategory][category];
    } else {
        questions = questionsData[category];
    }
    
    // أخذ أول 25 سؤال فقط وخلطهم
    currentQuestions = questions.slice(0, 25);
    shuffleArray(currentQuestions);
    
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
    finishQuizBtn.style.display = currentQuestionIndex === currentQuestions.length - 1 ? 'block' : 'none';
    nextQuestionBtn.style.display = currentQuestionIndex === currentQuestions.length - 1 ? 'none' : 'block';
    
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
                userAnswers[currentQuestionIndex] = -1;
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
    playSound(quizScore, currentQuestions.length);
    
    // إظهار قسم النتائج
    showSection('results-section');
}

// تشغيل الصوت المناسب
function playSound(score, total) {
    const percentage = (score / total) * 100;
    
    try {
        if (percentage === 100) {
            perfectSound.play();
        } else if (percentage >= 70) {
            correctSound.play();
        } else {
            wrongSound.play();
        }
    } catch (error) {
        console.log('خطأ في تشغيل الصوت:', error);
    }
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
        { name: 'Rhyolite', displayName: 'الريولايت', image: 'Rhyolite.jpg' },
        { name: 'Schiste', displayName: 'الشيست', image: 'Schiste.jpg' },
        { name: 'Argilite', displayName: 'الأرجيليت', image: 'Argilite.jpeg' },
        { name: 'Grès', displayName: 'الحجر الرملي', image: 'Grès.jpeg' },
        { name: 'Shale', displayName: 'الطفل', image: 'Shale.jpeg' },
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
    const imagePath = `roch/${rockQuestion.image}`;
    rockImage.src = imagePath;
    rockImage.alt = rockQuestion.displayName;
    rockImage.onerror = function() {
        console.log('خطأ في تحميل الصورة:', imagePath);
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS4reWHu+Wkp+W3peS9nDwvdGV4dD48L3N2Zz4=';
    };
    
    rockName.textContent = 'ما اسم هذه الصخرة؟';
    rockName.style.color = '#2c3e50';
    
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
        playRockSound(true);
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
        
        playRockSound(false);
        rockName.textContent = `✗ ${rockQuestions[currentRockIndex].displayName}`;
        rockName.style.color = '#e74c3c';
    }
    
    // إظهار زر التالي
    nextRockBtn.style.display = 'block';
    
    // إيقاف المؤقت
    clearInterval(rockTimer);
}

// تشغيل صوت قسم الصخور
function playRockSound(isCorrect) {
    try {
        if (isCorrect) {
            correctSound.play();
        } else {
            wrongSound.play();
        }
    } catch (error) {
        console.log('خطأ في تشغيل الصوت:', error);
    }
}

// عرض الصخرة التالية
function showNextRock() {
    if (currentRockIndex < rockQuestions.length - 1) {
        currentRockIndex++;
        showRockQuestion();
    } else {
        showRockResults();
    }
}

// عرض نتائج قسم الصخور
function showRockResults() {
    const percentage = (rockScore / rockQuestions.length) * 100;
    let message = `🏆 انتهى اختبار الصخور!\n\n`;
    message += `لقد حصلت على ${rockScore} من ${rockQuestions.length}\n`;
    message += `النسبة: ${percentage.toFixed(1)}%\n\n`;
    
    if (percentage >= 90) {
        message += `🎉 إنجاز رائع! أنت خبير في الصخور!`;
    } else if (percentage >= 70) {
        message += `👏 أداء ممتاز! مستواك جيد جداً`;
    } else if (percentage >= 50) {
        message += `👍 جيد، لكن يمكنك التحسن أكثر`;
    } else {
        message += `💪 حاول مرة أخرى، ستتحسن مع الممارسة`;
    }
    
    alert(message);
    startRockQuiz();
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
            handleTimeUp();
        }
    }, 1000);
}

// التعامل مع انتهاء الوقت
function handleTimeUp() {
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
    
    playRockSound(false);
    rockName.textContent = `⏰ ${rockQuestions[currentRockIndex].displayName}`;
    rockName.style.color = '#e74c3c';
}

// إظهار قسم معين وإخفاء الآخرين
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
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
    const activeCount = Math.floor(Math.random() * 9) + 3;
    activeUsersCount.textContent = activeCount;
    
    setTimeout(updateActiveUsers, 30000);
}

// دالة لخلط المصفوفات
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}