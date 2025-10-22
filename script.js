// بيانات الأسئلة
const questionsData = {
    "basic-geology": [
        {
            "id": 1,
            "question": "أي مما يلي يُعتبر من المعادن؟",
            "options": ["الكوارتز", "البازلت", "الجرانيت", "الحجر الجيري"],
            "answer": "الكوارتز",
            "explanation": "الكوارتز هو معدن مكون من ثاني أكسيد السيليكون، بينما البازلت والجرانيت والحجر الجيري هي صخور تتكون من مجموعة من المعادن."
        },
        {
            "id": 2,
            "question": "العنصر الأساسي في تركيب الكوارتز هو:",
            "options": ["الحديد", "السيليكون", "الكالسيوم", "الألومنيوم"],
            "answer": "السيليكون",
            "explanation": "الكوارتز يتكون أساسًا من ثاني أكسيد السيليكون (SiO₂)، حيث يشكل السيليكون العنصر الأساسي في تركيبه الكيميائي."
        },
        {
            "id": 3,
            "question": "الصخور النارية تتكون نتيجة:",
            "options": [
                "ترسيب المواد الذائبة في الماء",
                "تبخر مياه البحار",
                "تبرد وتصلب الصهارة",
                "ضغط المواد العضوية"
            ],
            "answer": "تبرد وتصلب الصهارة",
            "explanation": "تنشأ الصخور النارية من تبرد وتصلب الصهارة (الماغما) سواء في باطن الأرض (صخور جوفية) أو على سطحها (صخور بركانية)."
        },
        {
            "id": 4,
            "question": "من أمثلة الصخور الرسوبية الكيميائية:",
            "options": ["الجرانيت", "الحجر الجيري", "البازلت", "الرخام"],
            "answer": "الحجر الجيري",
            "explanation": "الحجر الجيري هو صخر رسوبي كيميائي يتكون من ترسب كربونات الكالسيوم من المحاليل المائية."
        },
        {
            "id": 5,
            "question": "التحول في الصخور يحدث بفعل:",
            "options": ["الحرارة والضغط", "الرياح", "التجوية", "المياه الجوفية فقط"],
            "answer": "الحرارة والضغط",
            "explanation": "تحدث عملية التحول في الصخور نتيجة تعرضها لدرجات حرارة وضغوط عالية، مما يؤدي إلى تغير في تركيبها المعدني ونسيجها."
        }
    ],
    "hydrogeology": [
        {
            "id": 1,
            "question": "الهيدروجيولوجيا تدرس:",
            "options": ["الصخور النارية فقط", "المياه الجوفية وحركتها", "التكتونيات", "المعادن"],
            "answer": "المياه الجوفية وحركتها",
            "explanation": "الهيدروجيولوجيا هي العلم الذي يدرس توزيع وحركة المياه الجوفية في التربة والصخور تحت سطح الأرض."
        },
        {
            "id": 2,
            "question": "الطبقة الحاملة للمياه الجوفية تُسمى:",
            "options": ["الطبقة غير المشبعة", "الطبقة الحاملة (Aquifer)", "الطبقة المعدنية", "الصخر المتحول"],
            "answer": "الطبقة الحاملة (Aquifer)",
            "explanation": "الطبقة الحاملة (Aquifer) هي طبقة صخرية مسامية ونفاذة قادرة على تخزين ونقل كميات كبيرة من المياه الجوفية."
        },
        {
            "id": 3,
            "question": "الطبقة غير المشبعة تعرف بـ:",
            "options": ["Zone of Saturation", "Zone of Aeration", "Aquifer", "Bedrock"],
            "answer": "Zone of Aeration",
            "explanation": "الطبقة غير المشبعة (Zone of Aeration) هي المنطقة الواقعة فوق مستوى الماء الجوفي حيث تكون المسام مليئة جزئيًا بالماء والهواء."
        },
        {
            "id": 4,
            "question": "معدل نفاذية الصخور يعني:",
            "options": ["صلابة الصخور", "قدرة الصخور على تمرير المياه", "كثافة المياه", "عمق الصخر"],
            "answer": "قدرة الصخور على تمرير المياه",
            "explanation": "النفاذية هي خاصية الصخور والتربة التي تسمح للمياه بالتدفق خلالها، وتقاس بكمية المياه التي يمكن أن تمر عبر مساحة معينة في زمن محدد."
        },
        {
            "id": 5,
            "question": "الصخور الرملية غالبًا ما تكون:",
            "options": ["طبقات حاملة للمياه", "طبقات غير حاملة", "صخور متحولة", "صخور نارية"],
            "answer": "طبقات حاملة للمياه",
            "explanation": "الصخور الرملية تتميز بمسامية ونفاذية عالية، مما يجعلها طبقات حاملة ممتازة للمياه الجوفية."
        }
    ],
    "petrology": [
        {
            "id": 1,
            "topic": "الجيولوجيا البترولية",
            "question": "البترول يتكون أساسًا من:",
            "options": ["الكربون والهيدروجين", "الأكسجين والنيتروجين", "الكالسيوم والحديد", "الكبريت والسيليكا"],
            "answer": "الكربون والهيدروجين",
            "explanation": "يتكون البترول أساسًا من مركبات الهيدروكربونات التي تتألف من ذرات الكربون والهيدروجين بنسب مختلفة."
        },
        {
            "id": 2,
            "topic": "الجيولوجيا البترولية",
            "question": "أصل النفط يعود إلى:",
            "options": ["بقايا كائنات بحرية دقيقة", "الصخور النارية", "النشاط البركاني", "التفاعلات الكيميائية غير العضوية"],
            "answer": "بقايا كائنات بحرية دقيقة",
            "explanation": "ينشأ النفط من تحلل الكائنات البحرية الدقيقة (العوالق) التي ترسبت في قيعان البحار والمحيطات وتحللت في ظروف خالية من الأكسجين."
        },
        {
            "id": 3,
            "topic": "الجيولوجيا البترولية",
            "question": "الصخور المصدرية (Source Rocks) هي:",
            "options": ["التي يخزن فيها النفط", "التي يتكون فيها النفط", "التي تمنع هجرة النفط", "التي تغطي المكمن"],
            "answer": "التي يتكون فيها النفط",
            "explanation": "الصخور المصدرية هي الصخور الغنية بالمواد العضوية التي تتحول بفعل الحرارة والضغط إلى النفط والغاز."
        },
        {
            "id": 4,
            "topic": "الجيولوجيا البترولية",
            "question": "الصخور الخازنة (Reservoir Rocks) تتميز بـ:",
            "options": ["قلة المسامية", "ارتفاع النفاذية والمسامية", "احتوائها على معادن ثقيلة", "طبيعتها النارية فقط"],
            "answer": "ارتفاع النفاذية والمسامية",
            "explanation": "الصخور الخازنة تتميز بمسامية عالية تسمح بتخزين النفط ونفاذية عالية تسمح له بالتدفق خلالها."
        },
        {
            "id": 5,
            "topic": "الجيولوجيا البترولية",
            "question": "الصخور الغطائية (Cap Rocks) تكون عادة:",
            "options": ["مسامية", "غير منفذة", "جيرية", "رملية"],
            "answer": "غير منفذة",
            "explanation": "الصخور الغطائية هي صخور غير منفذة تعلو المكمن النفطي وتمنع هجرة النفط والغاز إلى الأعلى."
        }
    ]
};

// حالة التطبيق
let appState = {
    currentSubject: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    quizStarted: false,
    quizCompleted: false,
    score: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalPoints: 0,
    timeSpent: 0,
    timerInterval: null,
    userLevel: 'مبتدئ',
    progress: {
        'basic-geology': 0,
        'hydrogeology': 0,
        'petrology': 0
    }
};

// عناصر DOM
const elements = {
    loadingScreen: document.getElementById('loading-screen'),
    mainApp: document.getElementById('main-app'),
    subjectSelection: document.getElementById('subject-selection'),
    quizSection: document.getElementById('quiz-section'),
    resultsSection: document.getElementById('results-section'),
    confirmationModal: document.getElementById('confirmation-modal')
};

// تهيئة التطبيق
function initApp() {
    // محاكاة تحميل البيانات
    setTimeout(() => {
        elements.loadingScreen.classList.add('hidden');
        elements.mainApp.classList.remove('hidden');
        loadUserProgress();
        setupEventListeners();
        updateUI();
    }, 2000);
}

// تحميل تقدم المستخدم
function loadUserProgress() {
    const savedProgress = localStorage.getItem('geologyTrainingProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        appState.progress = progress.progress || appState.progress;
        appState.totalPoints = progress.totalPoints || 0;
        appState.bestStreak = progress.bestStreak || 0;
        appState.userLevel = progress.userLevel || 'مبتدئ';
    }
    updateProgressBars();
}

// حفظ تقدم المستخدم
function saveUserProgress() {
    const progressData = {
        progress: appState.progress,
        totalPoints: appState.totalPoints,
        bestStreak: appState.bestStreak,
        userLevel: appState.userLevel,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('geologyTrainingProgress', JSON.stringify(progressData));
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // أزرار بدء التدريب
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const subjectCard = e.target.closest('.subject-card');
            const subject = subjectCard.dataset.subject;
            startQuiz(subject);
        });
    });

    // أزرار التحكم في الاختبار
    document.getElementById('exit-quiz').addEventListener('click', showExitConfirmation);
    document.getElementById('prev-btn').addEventListener('click', prevQuestion);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('submit-btn').addEventListener('click', submitAnswer);

    // أزرار النتائج
    document.getElementById('review-btn').addEventListener('click', reviewAnswers);
    document.getElementById('new-quiz-btn').addEventListener('click', newQuiz);
    document.getElementById('share-btn').addEventListener('click', shareResults);

    // النافذة المنبثقة
    document.getElementById('cancel-exit').addEventListener('click', hideModal);
    document.getElementById('confirm-exit').addEventListener('click', exitQuiz);
    document.querySelector('.modal-close').addEventListener('click', hideModal);

    // إغلاق النافذة المنبثقة بالنقر خارجها
    elements.confirmationModal.addEventListener('click', (e) => {
        if (e.target === elements.confirmationModal) {
            hideModal();
        }
    });
}

// تحديث واجهة المستخدم
function updateUI() {
    // تحديث الإحصائيات
    document.getElementById('user-level').textContent = appState.userLevel;
    document.getElementById('total-points').textContent = appState.totalPoints;
    document.getElementById('total-streak').textContent = appState.bestStreak;

    // تحديث أشرطة التقدم
    updateProgressBars();
}

// تحديث أشرطة التقدم
function updateProgressBars() {
    const subjects = ['basic-geology', 'hydrogeology', 'petrology'];
    subjects.forEach(subject => {
        const progressFill = document.getElementById(`${subject.split('-')[0]}-progress`);
        if (progressFill) {
            progressFill.style.width = `${appState.progress[subject]}%`;
            progressFill.closest('.subject-progress').querySelector('.progress-text').textContent = 
                `${appState.progress[subject]}% مكتمل`;
        }
    });
}

// بدء الاختبار
function startQuiz(subject) {
    appState.currentSubject = subject;
    appState.currentQuestionIndex = 0;
    appState.userAnswers = {};
    appState.quizStarted = true;
    appState.quizCompleted = false;
    appState.score = 0;
    appState.currentStreak = 0;
    appState.timeSpent = 0;

    // تبديل الأقسام
    elements.subjectSelection.classList.add('hidden');
    elements.quizSection.classList.remove('hidden');
    elements.resultsSection.classList.add('hidden');

    // تحديث واجهة الاختبار
    updateQuizUI();
    startTimer();

    // تحميل السؤال الأول
    loadQuestion();
}

// تحديث واجهة الاختبار
function updateQuizUI() {
    const subjectNames = {
        'basic-geology': 'الجيولوجيا الأساسية',
        'hydrogeology': 'الهيدروجيولوجيا',
        'petrology': 'البترولوجيا'
    };

    document.getElementById('current-subject').textContent = subjectNames[appState.currentSubject];
    document.getElementById('streak-counter').textContent = `${appState.currentStreak} تتابع`;
}

// تحميل السؤال
function loadQuestion() {
    const questions = questionsData[appState.currentSubject];
    const currentQuestion = questions[appState.currentQuestionIndex];

    if (!currentQuestion) return;

    // تحديث العداد
    document.getElementById('current-q-number').textContent = appState.currentQuestionIndex + 1;
    document.getElementById('question-counter').textContent = 
        `${appState.currentQuestionIndex + 1}/${questions.length}`;

    // تحديث نص السؤال
    document.getElementById('question-text').textContent = currentQuestion.question;

    // تحديث الخيارات
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    const optionLetters = ['أ', 'ب', 'ج', 'د'];
    currentQuestion.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        if (appState.userAnswers[appState.currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }

        optionElement.innerHTML = `
            <div class="option-letter">${optionLetters[index]}</div>
            <div class="option-text">${option}</div>
        `;

        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
    });

    // تحديث أزرار التحكم
    updateQuizControls();
    updateProgressBar();
}

// اختيار خيار
function selectOption(optionIndex) {
    // إزالة التحديد من جميع الخيارات
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
    });

    // تحديد الخيار المختار
    const selectedOption = document.querySelectorAll('.option')[optionIndex];
    selectedOption.classList.add('selected');

    // حفظ الإجابة
    appState.userAnswers[appState.currentQuestionIndex] = optionIndex;

    // إظهار زر التأكيد
    document.getElementById('submit-btn').classList.remove('hidden');
}

// تحديث أزرار التحكم
function updateQuizControls() {
    const questions = questionsData[appState.currentSubject];
    
    // زر السابق
    const prevBtn = document.getElementById('prev-btn');
    prevBtn.disabled = appState.currentQuestionIndex === 0;

    // زر التالي
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (appState.currentQuestionIndex === questions.length - 1) {
        nextBtn.classList.add('hidden');
        if (appState.userAnswers[appState.currentQuestionIndex] !== undefined) {
            submitBtn.classList.remove('hidden');
            submitBtn.innerHTML = '<i class="fas fa-flag-checkered"></i> إنهاء الاختبار';
        }
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }

    // إخفاء الشرح
    document.getElementById('explanation-box').classList.add('hidden');
}

// تحديث شريط التقدم
function updateProgressBar() {
    const questions = questionsData[appState.currentSubject];
    const progress = ((appState.currentQuestionIndex + 1) / questions.length) * 100;
    
    document.getElementById('quiz-progress').style.width = `${progress}%`;
    document.getElementById('progress-percent').textContent = `${Math.round(progress)}%`;
}

// السؤال السابق
function prevQuestion() {
    if (appState.currentQuestionIndex > 0) {
        appState.currentQuestionIndex--;
        loadQuestion();
    }
}

// السؤال التالي
function nextQuestion() {
    const questions = questionsData[appState.currentSubject];
    if (appState.currentQuestionIndex < questions.length - 1) {
        appState.currentQuestionIndex++;
        loadQuestion();
    }
}

// تأكيد الإجابة
function submitAnswer() {
    const questions = questionsData[appState.currentSubject];
    const currentQuestion = questions[appState.currentQuestionIndex];
    const userAnswerIndex = appState.userAnswers[appState.currentQuestionIndex];

    if (userAnswerIndex === undefined) return;

    const userAnswer = currentQuestion.options[userAnswerIndex];
    const isCorrect = userAnswer === currentQuestion.answer;

    // تحديث النتيجة
    if (isCorrect) {
        appState.score++;
        appState.currentStreak++;
        appState.totalPoints += 10;
        
        if (appState.currentStreak > appState.bestStreak) {
            appState.bestStreak = appState.currentStreak;
        }
    } else {
        appState.currentStreak = 0;
    }

    // عرض التغذية الراجعة
    showAnswerFeedback(isCorrect, currentQuestion.explanation);

    // تحديث العداد
    document.getElementById('streak-counter').textContent = `${appState.currentStreak} تتابع`;

    // الانتقال التلقائي أو إنهاء الاختبار
    setTimeout(() => {
        if (appState.currentQuestionIndex < questions.length - 1) {
            appState.currentQuestionIndex++;
            loadQuestion();
        } else {
            finishQuiz();
        }
    }, 3000);
}

// عرض التغذية الراجعة
function showAnswerFeedback(isCorrect, explanation) {
    const options = document.querySelectorAll('.option');
    const currentQuestion = questionsData[appState.currentSubject][appState.currentQuestionIndex];
    
    options.forEach((option, index) => {
        const optionText = option.querySelector('.option-text').textContent;
        
        if (optionText === currentQuestion.answer) {
            option.classList.add('correct');
        } else if (index === appState.userAnswers[appState.currentQuestionIndex] && !isCorrect) {
            option.classList.add('incorrect');
        }
        
        option.style.pointerEvents = 'none';
    });

    // عرض الشرح
    const explanationBox = document.getElementById('explanation-box');
    const explanationText = document.getElementById('explanation-text');
    
    explanationText.textContent = explanation;
    explanationBox.classList.remove('hidden');

    // تعطيل الأزرار مؤقتًا
    document.getElementById('prev-btn').disabled = true;
    document.getElementById('next-btn').disabled = true;
    document.getElementById('submit-btn').disabled = true;
}

// إنهاء الاختبار
function finishQuiz() {
    clearInterval(appState.timerInterval);
    appState.quizCompleted = true;

    // تحديث التقدم
    const questions = questionsData[appState.currentSubject];
    const scorePercentage = (appState.score / questions.length) * 100;
    appState.progress[appState.currentSubject] = Math.max(
        appState.progress[appState.currentSubject],
        scorePercentage
    );

    // تحديث مستوى المستخدم
    updateUserLevel();

    // حفظ التقدم
    saveUserProgress();

    // عرض النتائج
    showResults();
}

// عرض النتائج
function showResults() {
    elements.quizSection.classList.add('hidden');
    elements.resultsSection.classList.remove('hidden');

    const questions = questionsData[appState.currentSubject];
    const scorePercentage = Math.round((appState.score / questions.length) * 100);

    // تحديث النتائج
    document.getElementById('results-subject').textContent = 
        document.getElementById('current-subject').textContent;
    
    document.getElementById('score-percentage').textContent = `${scorePercentage}%`;
    document.getElementById('correct-answers').textContent = appState.score;
    document.getElementById('total-questions').textContent = questions.length;
    document.getElementById('best-streak').textContent = appState.bestStreak;
    document.getElementById('time-taken').textContent = formatTime(appState.timeSpent);

    // تحديث دائرة النتيجة
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.setProperty('--p', `${scorePercentage}%`);

    // تحديث الإنجازات
    updateAchievements(scorePercentage);
}

// تحديث الإنجازات
function updateAchievements(scorePercentage) {
    const achievementsContainer = document.getElementById('achievements-container');
    achievementsContainer.innerHTML = '';

    const achievements = [];

    if (scorePercentage >= 90) {
        achievements.push({
            icon: 'fas fa-crown',
            title: 'خبير الجيولوجيا',
            description: 'تفوق متميز!'
        });
    }

    if (scorePercentage >= 80) {
        achievements.push({
            icon: 'fas fa-medal',
            title: 'متفوق',
            description: 'أداء رائع!'
        });
    }

    if (scorePercentage >= 70) {
        achievements.push({
            icon: 'fas fa-award',
            title: 'متميز',
            description: 'أداء جيد جدًا'
        });
    }

    if (appState.currentStreak >= 5) {
        achievements.push({
            icon: 'fas fa-bolt',
            title: 'متسلسل',
            description: `${appState.currentStreak} إجابات صحيحة متتالية`
        });
    }

    if (appState.totalPoints >= 100) {
        achievements.push({
            icon: 'fas fa-star',
            title: 'نقاط مئوية',
            description: '100+ نقطة مكتسبة'
        });
    }

    // إذا لم تكن هناك إنجازات، إضافة إنجاز تشجيعي
    if (achievements.length === 0) {
        achievements.push({
            icon: 'fas fa-seedling',
            title: 'مبتدئ واعد',
            description: 'استمر في التعلم!'
        });
    }

    achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement unlocked';
        achievementElement.innerHTML = `
            <i class="${achievement.icon}"></i>
            <h4>${achievement.title}</h4>
            <p>${achievement.description}</p>
        `;
        achievementsContainer.appendChild(achievementElement);
    });
}

// تحديث مستوى المستخدم
function updateUserLevel() {
    const totalProgress = Object.values(appState.progress).reduce((a, b) => a + b, 0);
    
    if (totalProgress >= 240) { // 80% في كل مادة
        appState.userLevel = 'خبير';
    } else if (totalProgress >= 180) { // 60% في كل مادة
        appState.userLevel = 'متقدم';
    } else if (totalProgress >= 120) { // 40% في كل مادة
        appState.userLevel = 'متوسط';
    } else {
        appState.userLevel = 'مبتدئ';
    }

    document.getElementById('user-level').textContent = appState.userLevel;
}

// المؤقت
function startTimer() {
    appState.timeSpent = 0;
    updateTimerDisplay();
    
    appState.timerInterval = setInterval(() => {
        appState.timeSpent++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = formatTime(appState.timeSpent);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// النافذة المنبثقة للخروج
function showExitConfirmation() {
    elements.confirmationModal.classList.remove('hidden');
}

function hideModal() {
    elements.confirmationModal.classList.add('hidden');
}

function exitQuiz() {
    clearInterval(appState.timerInterval);
    hideModal();
    
    elements.quizSection.classList.add('hidden');
    elements.subjectSelection.classList.remove('hidden');
    
    appState.quizStarted = false;
    updateUI();
}

// وظائف النتائج
function reviewAnswers() {
    // العودة إلى السؤال الأول مع إظهار الإجابات
    appState.currentQuestionIndex = 0;
    elements.resultsSection.classList.add('hidden');
    elements.quizSection.classList.remove('hidden');
    loadQuestion();
    
    // تعطيل الإجابة على الأسئلة في وضع المراجعة
    document.querySelectorAll('.option').forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
}

function newQuiz() {
    elements.resultsSection.classList.add('hidden');
    elements.subjectSelection.classList.remove('hidden');
    updateUI();
}

function shareResults() {
    const subject = document.getElementById('current-subject').textContent;
    const score = document.getElementById('score-percentage').textContent;
    
    const shareText = `لقد حصلت على ${score} في اختبار ${subject} في نظام تدريب الجيولوجيا المتقدم!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'نتيجة اختبار الجيولوجيا',
            text: shareText,
            url: window.location.href
        });
    } else {
        // نسخ إلى الحافظة
        navigator.clipboard.writeText(shareText).then(() => {
            alert('تم نسخ النتيجة إلى الحافظة!');
        });
    }
}

// بدء التطبيق
document.addEventListener('DOMContentLoaded', initApp);