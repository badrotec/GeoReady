// جميع أسئلة الجيولوجيا في ملف واحد
const geologyQuestions = {
    basic: [
        {
            question: "ما هي أكثر المعادن وفرة في القشرة الأرضية؟",
            options: ["الكوارتز", "الفلسبار", "المايكا", "الكالسيت"],
            correctAnswer: 1
        },
        {
            question: "أي من الصخور التالية هو صخور نارية؟",
            options: ["الجرانيت", "الحجر الجيري", "الرخام", "الأردواز"],
            correctAnswer: 0
        },
        {
            question: "ما هي العملية التي تتحول فيها الصخور إلى صخور متحولة؟",
            options: ["الترسيب", "الذوبان", "التحول", "التجوية"],
            correctAnswer: 2
        },
        {
            question: "ما هو المعدن الرئيسي في صخر البازلت؟",
            options: ["الكوارتز", "الفلسبار", "البيروكسين", "الكالسيت"],
            correctAnswer: 2
        },
        {
            question: "أي من العوامل التالية ليس من عوامل التجوية الميكانيكية؟",
            options: ["التجمد والذوبان", "النشاط النباتي", "الأكسدة", "تغيرات الحرارة"],
            correctAnswer: 2
        }
    ],
    
    geochemistry: [
        {
            question: "ما هو العنصر الأكثر وفرة في القشرة الأرضية؟",
            options: ["الأكسجين", "السيليكون", "الألومنيوم", "الحديد"],
            correctAnswer: 0
        },
        {
            question: "أي من المعادن التالية يعتبر من معادن الكربونات؟",
            options: ["الكالسيت", "الكوارتز", "الفلسبار", "المايكا"],
            correctAnswer: 0
        },
        {
            question: "ما هو الرقم الهيدروجيني للمحاليل المتعادلة؟",
            options: ["7", "0", "14", "10"],
            correctAnswer: 0
        },
        {
            question: "أي من العناصر التالية يعتبر من العناصر النزرة؟",
            options: ["الذهب", "الأكسجين", "السيليكون", "الكالسيوم"],
            correctAnswer: 0
        },
        {
            question: "ما هي العملية التي تتحول فيها الصخور إلى معادن؟",
            options: ["التبلور", "الذوبان", "التجوية", "الترسيب"],
            correctAnswer: 0
        }
    ],
    
    geophysics: [
        {
            question: "ما هي الطريقة الجيوفيزيائية المستخدمة للكشف عن النفط؟",
            options: ["الزلزالية", "المغناطيسية", "الجاذبية", "الكهربائية"],
            correctAnswer: 0
        },
        {
            question: "أي من القوى التالية تؤثر على حركة الصفائح التكتونية؟",
            options: ["قوى الحمل الحراري", "قوى الجاذبية", "قوى الاحتكاك", "جميع ما سبق"],
            correctAnswer: 3
        },
        {
            question: "ما هو عمق بؤرة الزلزال؟",
            options: ["المسافة من السطح إلى مركز الزلزال", "المسافة بين البؤرة والمحطة", "شدة الزلزال", "مقدار الطاقة المتحررة"],
            correctAnswer: 0
        },
        {
            question: "أي من الطرق التالية تستخدم لدراسة التركيب الداخلي للأرض؟",
            options: ["الموجات الزلزالية", "الموجات المغناطيسية", "الموجات الصوتية", "الموجات الضوئية"],
            correctAnswer: 0
        },
        {
            question: "ما هو الغرض من المسوحات الجيوفيزيائية؟",
            options: ["دراسة باطن الأرض", "قياس درجة الحرارة", "تحليل المياه", "دراسة الغلاف الجوي"],
            correctAnswer: 0
        }
    ],
    
    hydrogeology: [
        {
            question: "ما هي الطبقة الحاملة للمياه الجوفية؟",
            options: ["الأكويفر", "الأكواكلود", "الطبقة الغير منفذة", "الطبقة السطحية"],
            correctAnswer: 0
        },
        {
            question: "أي من العوامل التالية يؤثر على حركة المياه الجوفية؟",
            options: ["النفاذية", "المسامية", "الميل الهيدروليكي", "جميع ما سبق"],
            correctAnswer: 3
        },
        {
            question: "ما هو منسوب المياه الجوفية؟",
            options: ["السطح العلوي للماء الجوفي", "عمق البئر", "كمية المياه", "سرعة تدفق المياه"],
            correctAnswer: 0
        },
        {
            question: "أي من الصخور التالية تعتبر صخور خازنة للمياه؟",
            options: ["الحجر الرملي", "الجرانيت", "الطفلة", "البازلت"],
            correctAnswer: 0
        },
        {
            question: "ما هي عملية التغذية الاصطناعية؟",
            options: ["زيادة مخزون المياه الجوفية", "تنقية المياه", "تحلية المياه", "ضخ المياه"],
            correctAnswer: 0
        }
    ],
    
    petrology: [
        {
            question: "ما هي الصخور النارية؟",
            options: ["صخور تكونت من تصلب الصهارة", "صخور رسوبية", "صخور متحولة", "صخور بركانية فقط"],
            correctAnswer: 0
        },
        {
            question: "أي من الصخور التالية يعتبر من الصخور المتحولة؟",
            options: ["الرخام", "الجرانيت", "الحجر الجيري", "الحجر الرملي"],
            correctAnswer: 0
        },
        {
            question: "ما هو الفرق بين الصخور البركانية والجوفية؟",
            options: ["معدل التبريد", "التركيب الكيميائي", "اللون", "الكثافة"],
            correctAnswer: 0
        },
        {
            question: "أي من المعادن التالية يعتبر من المعادن الأساسية في الصخور النارية؟",
            options: ["الكوارتز", "الفلسبار", "المايكا", "جميع ما سبق"],
            correctAnswer: 3
        },
        {
            question: "ما هي عملية التحول الصخري؟",
            options: ["تغير في التركيب المعدني والنسيجي", "ذوبان الصخور", "تآكل الصخور", "ترسيب الصخور"],
            correctAnswer: 0
        }
    ],
    
    structural: [
        {
            question: "ما هو الطي الجيولوجي؟",
            options: ["انحناء في الطبقات الصخرية", "تصدع في الصخور", "تآكل الصخور", "ترسيب الصخور"],
            correctAnswer: 0
        },
        {
            question: "أي من التراكيب التالية يعتبر تركيباً تكتونياً؟",
            options: ["الطيات والصدوع", "الطبقات الأفقية", "الطبقات المائلة", "جميع ما سبق"],
            correctAnswer: 0
        },
        {
            question: "ما هو الصدع العادي؟",
            options: ["صدع يتحرك فيه الحائط العلوي للأسفل", "صدع يتحرك فيه الحائط العلوي للأعلى", "صدع أفقي", "صدع دائري"],
            correctAnswer: 0
        },
        {
            question: "أي من العوامل التالية تؤثر على تشوه الصخور؟",
            options: ["الضغط والحرارة", "الزمن", "نوع الصخر", "جميع ما سبق"],
            correctAnswer: 3
        },
        {
            question: "ما هو الغرض من دراسة الجيولوجيا التركيبية؟",
            options: ["فهم تاريخ القوى التكتونية", "اكتشاف المعادن", "دراسة الأحافير", "تحليل المياه"],
            correctAnswer: 0
        }
    ],
    
    sedimentary: [
        {
            question: "ما هي الصخور الرسوبية؟",
            options: ["صخور تكونت من ترسيب وتماسك الرواسب", "صخور نارية", "صخور متحولة", "صخور بركانية"],
            correctAnswer: 0
        },
        {
            question: "أي من العمليات التالية تساهم في تكون الصخور الرسوبية؟",
            options: ["التجوية والنقل والترسيب", "الذوبان والتبلور", "التحول والضغط", "البرودة والتصلب"],
            correctAnswer: 0
        },
        {
            question: "ما هو الحجر الجيري؟",
            options: ["صخر رسوبي يتكون mainly من كربونات الكالسيوم", "صخر ناري", "صخر متحول", "صخر بركاني"],
            correctAnswer: 0
        },
        {
            question: "أي من البيئات التالية تعتبر بيئة ترسيب قارية؟",
            options: ["الأنهار والبحيرات", "المحيطات", "البحار", "المضايق"],
            correctAnswer: 0
        },
        {
            question: "ما هي أهمية دراسة الصخور الرسوبية؟",
            options: ["لفهم التاريخ الجيولوجي والمناخ القديم", "لاكتشاف النفط", "لدراسة الأحافير", "جميع ما سبق"],
            correctAnswer: 3
        }
    ],
    
    petroleum: [
        {
            question: "البترول يتكون أساسًا من:",
            options: ["الكربون والهيدروجين", "الأكسجين والنيتروجين", "الكالسيوم والحديد", "الكبريت والسيليكا"],
            correctAnswer: 0
        },
        {
            question: "أصل النفط يعود إلى:",
            options: ["بقايا كائنات بحرية دقيقة", "الصخور النارية", "النشاط البركاني", "التفاعلات الكيميائية غير العضوية"],
            correctAnswer: 0
        },
        {
            question: "الصخور المصدرية (Source Rocks) هي:",
            options: ["التي يخزن فيها النفط", "التي يتكون فيها النفط", "التي تمنع هجرة النفط", "التي تغطي المكمن"],
            correctAnswer: 1
        },
        {
            question: "الصخور الخازنة (Reservoir Rocks) تتميز بـ:",
            options: ["قلة المسامية", "ارتفاع النفاذية والمسامية", "احتوائها على معادن ثقيلة", "طبيعتها النارية فقط"],
            correctAnswer: 1
        },
        {
            question: "الصخور الغطائية (Cap Rocks) تكون عادة:",
            options: ["مسامية", "غير منفذة", "جيرية", "رملية"],
            correctAnswer: 1
        }
    ],
    
    applied: [
        {
            question: "الجيولوجيا التطبيقية تُعنى بـ:",
            options: ["دراسة النظريات الجيولوجية فقط", "استخدام الجيولوجيا في حل المشكلات العملية", "دراسة الأحافير", "تحديد أعمار الصخور"],
            correctAnswer: 1
        },
        {
            question: "من أهم تطبيقات الجيولوجيا في الهندسة:",
            options: ["تصميم السدود والأنفاق", "اكتشاف النجوم", "قياس الضغط الجوي", "صناعة المعادن"],
            correctAnswer: 0
        },
        {
            question: "الجيولوجي الهندسي يشارك في:",
            options: ["اختيار مواقع البناء", "تحليل التربة فقط", "التعدين فقط", "الزراعة"],
            correctAnswer: 0
        },
        {
            question: "الاستشعار عن بعد يُستخدم في:",
            options: ["رسم الخرائط الجيولوجية", "تحديد النباتات فقط", "دراسة المناخ", "تحليل المعادن"],
            correctAnswer: 0
        },
        {
            question: "نظم المعلومات الجغرافية (GIS) تُساعد في:",
            options: ["إدارة وتحليل البيانات المكانية", "الحفر اليدوي", "التنبؤ بالزلازل فقط", "تحديد نوع الصخور بالمجهر"],
            correctAnswer: 0
        }
    ]
};

// حالة التطبيق
const appState = {
    currentSubject: null,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    timer: null,
    timeLeft: 20,
    userAnswers: [],
    quizStarted: false,
    subjectIcons: {
        basic: "🪨",
        geochemistry: "🧪",
        geophysics: "📡",
        hydrogeology: "💧",
        petrology: "🔥",
        structural: "⛰️",
        sedimentary: "🏞️",
        petroleum: "🛢️",
        applied: "🏗️"
    },
    subjectNames: {
        basic: "الجيولوجيا الأساسية",
        geochemistry: "الجيوكيمياء",
        geophysics: "الجيوفيزياء",
        hydrogeology: "الهيدروجيولوجيا",
        petrology: "علم الصخور",
        structural: "الجيولوجيا التركيبية",
        sedimentary: "جيولوجيا الرواسب",
        petroleum: "الجيولوجيا البترولية",
        applied: "الجيولوجيا التطبيقية"
    }
};

// عناصر DOM
const elements = {
    // الشاشات
    startScreen: document.getElementById('start-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    resultsScreen: document.getElementById('results-screen'),
    reviewScreen: document.getElementById('review-screen'),
    
    // عناصر الشاشة الرئيسية
    subjectCards: document.querySelectorAll('.subject-card'),
    
    // عناصر شاشة الاختبار
    subjectBadge: document.getElementById('subject-badge'),
    subjectTitle: document.getElementById('subject-title'),
    questionCounter: document.getElementById('question-counter'),
    progressFill: document.getElementById('progress-fill'),
    currentQNumber: document.getElementById('current-q-number'),
    timer: document.getElementById('timer'),
    timerProgress: document.querySelector('.timer-progress'),
    question: document.getElementById('question'),
    options: document.getElementById('options'),
    nextBtn: document.getElementById('next-btn'),
    
    // عناصر شاشة النتائج
    resultSubjectBadge: document.getElementById('result-subject-badge'),
    resultSubjectName: document.getElementById('result-subject-name'),
    testDate: document.getElementById('test-date'),
    scorePercentage: document.getElementById('score-percentage'),
    scoreProgress: document.querySelector('.score-progress'),
    correctCount: document.getElementById('correct-count'),
    wrongCount: document.getElementById('wrong-count'),
    performanceMessage: document.getElementById('performance-message'),
    
    // أزرار
    restartBtn: document.getElementById('restart-btn'),
    newSubjectBtn: document.getElementById('new-subject-btn'),
    reviewBtn: document.getElementById('review-btn'),
    backToResults: document.getElementById('back-to-results'),
    
    // عناصر المراجعة
    reviewList: document.getElementById('review-list')
};

// الأصوات
const sounds = {
    correct: document.getElementById('correct-sound'),
    wrong: document.getElementById('wrong-sound'),
    timeout: document.getElementById('timeout-sound'),
    click: document.getElementById('click-sound')
};

// تهيئة التطبيق
function initApp() {
    // إضافة مستمعي الأحداث للبطاقات
    elements.subjectCards.forEach(card => {
        card.addEventListener('click', handleSubjectSelection);
    });
    
    // إضافة مستمعي الأحداث للأزرار
    elements.nextBtn.addEventListener('click', handleNextQuestion);
    elements.restartBtn.addEventListener('click', restartQuiz);
    elements.newSubjectBtn.addEventListener('click', changeSubject);
    elements.reviewBtn.addEventListener('click', showReview);
    elements.backToResults.addEventListener('click', backToResults);
    
    // تهيئة تاريخ الاختبار
    elements.testDate.textContent = new Date().toLocaleDateString('ar-SA');
}

// معالجة اختيار المادة
function handleSubjectSelection(event) {
    const subject = event.currentTarget.dataset.subject;
    appState.currentSubject = subject;
    
    // تحميل الأسئلة
    loadQuestions(subject);
    
    // تحديث واجهة المستخدم
    updateSubjectUI(subject);
    
    // الانتقال إلى شاشة الاختبار
    showScreen('quiz-screen');
    
    // بدء الاختبار
    startQuiz();
}

// تحميل الأسئلة
function loadQuestions(subject) {
    appState.questions = geologyQuestions[subject] || [];
    // إذا كان هناك أقل من 5 أسئلة، نكررها لملء الاختبار
    while (appState.questions.length < 25) {
        appState.questions = appState.questions.concat(geologyQuestions[subject] || []);
    }
    // نأخذ أول 25 سؤال فقط
    appState.questions = appState.questions.slice(0, 25);
}

// تحديث واجهة المادة
function updateSubjectUI(subject) {
    elements.subjectBadge.textContent = appState.subjectIcons[subject];
    elements.subjectTitle.textContent = appState.subjectNames[subject];
    elements.resultSubjectBadge.textContent = appState.subjectIcons[subject];
    elements.resultSubjectName.textContent = appState.subjectNames[subject];
}

// بدء الاختبار
function startQuiz() {
    appState.quizStarted = true;
    appState.currentQuestionIndex = 0;
    appState.score = 0;
    appState.userAnswers = [];
    displayQuestion();
}

// عرض السؤال الحالي
function displayQuestion() {
    const currentQuestion = appState.questions[appState.currentQuestionIndex];
    
    // تحديث العناوين والشريط
    updateProgress();
    
    // عرض السؤال
    elements.question.textContent = currentQuestion.question;
    elements.currentQNumber.textContent = appState.currentQuestionIndex + 1;
    
    // عرض الخيارات
    displayOptions(currentQuestion.options);
    
    // إعادة تعيين المؤقت
    resetTimer();
    
    // تعطيل زر التالي
    elements.nextBtn.disabled = true;
    
    // بدء المؤقت
    startTimer();
}

// عرض الخيارات
function displayOptions(options) {
    elements.options.innerHTML = '';
    
    options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.index = index;
        
        optionElement.addEventListener('click', handleOptionSelection);
        
        elements.options.appendChild(optionElement);
    });
}

// معالجة اختيار الخيار
function handleOptionSelection(event) {
    if (appState.userAnswers[appState.currentQuestionIndex] !== undefined) {
        return; // تم الرد بالفعل
    }
    
    sounds.click.play();
    
    const selectedOptionIndex = parseInt(event.target.dataset.index);
    const currentQuestion = appState.questions[appState.currentQuestionIndex];
    
    // تخزين إجابة المستخدم
    appState.userAnswers[appState.currentQuestionIndex] = selectedOptionIndex;
    
    // تمييز الخيار المختار
    const options = elements.options.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // التحقق من الإجابة
    const isCorrect = selectedOptionIndex === currentQuestion.correctAnswer;
    
    if (isCorrect) {
        appState.score++;
        sounds.correct.play();
        event.target.classList.add('correct');
    } else {
        sounds.wrong.play();
        event.target.classList.add('wrong');
        
        // تمييز الإجابة الصحيحة
        options[currentQuestion.correctAnswer].classList.add('correct');
    }
    
    // إيقاف المؤقت
    clearInterval(appState.timer);
    
    // تمكين زر التالي
    elements.nextBtn.disabled = false;
}

// تحديث التقدم
function updateProgress() {
    const progress = ((appState.currentQuestionIndex + 1) / appState.questions.length) * 100;
    elements.progressFill.style.width = `${progress}%`;
    elements.questionCounter.textContent = `سؤال ${appState.currentQuestionIndex + 1} من ${appState.questions.length}`;
}

// إعادة تعيين المؤقت
function resetTimer() {
    appState.timeLeft = 20;
    elements.timer.textContent = appState.timeLeft;
    elements.timer.className = 'timer-text';
    updateTimerCircle(0);
}

// بدء المؤقت
function startTimer() {
    const totalTime = 20;
    const circumference = 2 * Math.PI * 36; // محيط الدائرة
    
    appState.timer = setInterval(() => {
        appState.timeLeft--;
        elements.timer.textContent = appState.timeLeft;
        
        // تحديث دائرة المؤقت
        const progress = 1 - (appState.timeLeft / totalTime);
        const offset = circumference - (progress * circumference);
        updateTimerCircle(offset);
        
        // تغيير لون المؤقت بناءً على الوقت المتبقي
        if (appState.timeLeft <= 10) {
            elements.timer.classList.add('warning');
        }
        
        if (appState.timeLeft <= 5) {
            elements.timer.classList.add('danger');
        }
        
        // انتهاء الوقت
        if (appState.timeLeft <= 0) {
            clearInterval(appState.timer);
            handleTimeout();
        }
    }, 1000);
}

// تحديث دائرة المؤقت
function updateTimerCircle(offset) {
    if (elements.timerProgress) {
        elements.timerProgress.style.strokeDashoffset = offset;
    }
}

// معالجة انتهاء الوقت
function handleTimeout() {
    sounds.timeout.play();
    
    // تخزين إجابة فارغة
    appState.userAnswers[appState.currentQuestionIndex] = null;
    
    // تمييز الإجابة الصحيحة
    const currentQuestion = appState.questions[appState.currentQuestionIndex];
    const options = elements.options.querySelectorAll('.option');
    options[currentQuestion.correctAnswer].classList.add('correct');
    
    // تمكين زر التالي
    elements.nextBtn.disabled = false;
}

// معالجة الانتقال للسؤال التالي
function handleNextQuestion() {
    sounds.click.play();
    appState.currentQuestionIndex++;
    
    if (appState.currentQuestionIndex < appState.questions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }
}

// إنهاء الاختبار وعرض النتائج
function endQuiz() {
    showScreen('results-screen');
    displayResults();
}

// عرض النتائج
function displayResults() {
    const scorePercentage = Math.round((appState.score / appState.questions.length) * 100);
    
    // تحديث النسبة المئوية
    elements.scorePercentage.textContent = `${scorePercentage}%`;
    
    // تحديث دائرة النتائج
    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (scorePercentage / 100) * circumference;
    elements.scoreProgress.style.strokeDashoffset = offset;
    
    // تحديث الإحصائيات
    elements.correctCount.textContent = appState.score;
    elements.wrongCount.textContent = appState.questions.length - appState.score;
    
    // عرض رسالة الأداء
    let performanceMessage = "";
    if (scorePercentage >= 90) {
        performanceMessage = "🎉 أداء متميز! أنت خبير في هذا المجال";
    } else if (scorePercentage >= 70) {
        performanceMessage = "👍 أداء جيد جداً، استمر في التعلم";
    } else if (scorePercentage >= 50) {
        performanceMessage = "💪 مستوى مقبول، يمكنك التحسين بالمزيد من الدراسة";
    } else {
        performanceMessage = "📚 تحتاج للمزيد من الدراسة والمراجعة في هذا المجال";
    }
    
    elements.performanceMessage.textContent = performanceMessage;
}

// إعادة بدء الاختبار
function restartQuiz() {
    sounds.click.play();
    showScreen('quiz-screen');
    startQuiz();
}

// تغيير المادة
function changeSubject() {
    sounds.click.play();
    showScreen('start-screen');
}

// عرض المراجعة
function showReview() {
    sounds.click.play();
    showScreen('review-screen');
    displayReview();
}

// العودة للنتائج
function backToResults() {
    sounds.click.play();
    showScreen('results-screen');
}

// عرض مراجعة الإجابات
function displayReview() {
    elements.reviewList.innerHTML = '';
    
    appState.questions.forEach((question, index) => {
        const userAnswerIndex = appState.userAnswers[index];
        const isCorrect = userAnswerIndex === question.correctAnswer;
        
        const reviewItem = document.createElement('div');
        reviewItem.className = `review-item ${isCorrect ? 'correct' : 'wrong'}`;
        
        const userAnswer = userAnswerIndex !== null ? question.options[userAnswerIndex] : 'لم يتم الإجابة';
        const correctAnswer = question.options[question.correctAnswer];
        
        reviewItem.innerHTML = `
            <div class="review-question">سؤال ${index + 1}: ${question.question}</div>
            <div class="review-answer">
                <span class="answer-label ${isCorrect ? 'correct' : 'wrong'}">إجابتك:</span>
                <span>${userAnswer}</span>
            </div>
            ${!isCorrect ? `
            <div class="review-answer">
                <span class="answer-label correct">الإجابة الصحيحة:</span>
                <span>${correctAnswer}</span>
            </div>
            ` : ''}
        `;
        
        elements.reviewList.appendChild(reviewItem);
    });
}

// عرض شاشة محددة
function showScreen(screenId) {
    // إخفاء جميع الشاشات
    elements.startScreen.classList.remove('active');
    elements.quizScreen.classList.remove('active');
    elements.resultsScreen.classList.remove('active');
    elements.reviewScreen.classList.remove('active');
    
    // عرض الشاشة المطلوبة
    document.getElementById(screenId).classList.add('active');
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);