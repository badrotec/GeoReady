// بيانات الاختبارات (سيتم تحميلها من ملف JSON)
let quizData = {};

// متغيرات التطبيق
let currentCategory = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
let language = 'ar';

// عناصر DOM
const categoriesSection = document.getElementById('categoriesSection');
const quizSection = document.getElementById('quizSection');
const resultsSection = document.getElementById('resultsSection');
const categoriesGrid = document.getElementById('categoriesGrid');
const quizCategoryTitle = document.getElementById('quizCategoryTitle');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const currentQuestionElement = document.getElementById('currentQuestion');
const totalQuestionsElement = document.getElementById('totalQuestions');
const quizProgress = document.getElementById('quizProgress');
const prevQuestionButton = document.getElementById('prevQuestion');
const nextQuestionButton = document.getElementById('nextQuestion');
const submitQuizButton = document.getElementById('submitQuiz');
const finalScoreElement = document.getElementById('finalScore');
const resultsMessageElement = document.getElementById('resultsMessage');
const resultsCard = document.getElementById('resultsCard');
const reviewAnswersButton = document.getElementById('reviewAnswers');
const newQuizButton = document.getElementById('newQuiz');
const startTrainingButton = document.getElementById('startTraining');
const langButtons = document.querySelectorAll('.lang-btn');
const suggestionsSection = document.getElementById('suggestionsSection');
const suggestionsContent = document.getElementById('suggestionsContent');
const performanceChart = document.getElementById('performanceChart');

// أصوات التفاعل
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const clickSound = document.getElementById('clickSound');
const completeSound = document.getElementById('completeSound');

// قاعدة بيانات الاقتراحات الذكية
const suggestionsDatabase = {
    "الجيولوجيا_الأساسية": {
        1: [
            {
                title: "تعريف المعدن",
                content: "المعدن هو مادة صلبة طبيعية متجانسة لها تركيب كيميائي محدد وترتيب ذري منتظم. الكوارتز يمتلك هذه الخصائص بينما البازلت والجرانيت صخور والحجر الجيري صخر رسوبي.",
                type: "تعريف"
            },
            {
                title: "خصائص المعادن",
                content: "المعادن تتميز بتركيب كيميائي ثابت وبناء بلوري منتظم. الكوارتز (SiO₂) هو معدن بينما البازلت والجرانيت صخور نارية مكونة من عدة معادن.",
                type: "معلومة"
            }
        ],
        2: [
            {
                title: "تركيب الكوارتز",
                content: "الكوارتز يتكون أساساً من ثاني أكسيد السيليكون (SiO₂) حيث يشكل السيليكون والأكسجين المكونات الأساسية لهذا المعدن.",
                type: "تركيب كيميائي"
            },
            {
                title: "مجموعة السيليكات",
                content: "الكوارتز ينتمي إلى مجموعة معادن السيليكات التي تشكل حوالي 90% من القشرة الأرضية، حيث يعتبر السيليكون العنصر الأساسي في تركيبها.",
                type: "تصنيف"
            }
        ]
    },
    "الجيوكيمياء": {
        1: [
            {
                title: "مجال الجيوكيمياء",
                content: "الجيوكيمياء تدرس التوزيع والسلوك الكيميائي للعناصر في الأرض، بما في ذلك الصخور والمعادن والمياه والتربة.",
                type: "تعريف"
            }
        ]
    }
};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    loadQuizData();
    initializeApp();
});

// تحميل بيانات الأسئلة من ملف JSON
async function loadQuizData() {
    try {
        const response = await fetch('questions.json');
        quizData = await response.json();
        console.log('تم تحميل بيانات الأسئلة بنجاح');
    } catch (error) {
        console.error('خطأ في تحميل بيانات الأسئلة:', error);
        // استخدام بيانات افتراضية في حالة الخطأ
        quizData = await loadDefaultQuestions();
    }
}

// بيانات افتراضية للأسئلة
async function loadDefaultQuestions() {
    return {
        "الجيولوجيا_الأساسية": [
            { "id": 1, "question": "أي مما يلي يُعتبر من المعادن؟", "options": ["الكوارتز", "البازلت", "الجرانيت", "الحجر الجيري"], "answer": "الكوارتز" },
            { "id": 2, "question": "العنصر الأساسي في تركيب الكوارتز هو:", "options": ["الحديد", "السيليكون", "الكالسيوم", "الألومنيوم"], "answer": "السيليكون" }
        ],
        "الجيوكيمياء": [
            { "id": 1, "topic": "الجيوكيمياء", "question": "الجيوكيمياء تدرس؟", "options": ["شكل الصخور", "التركيب الكيميائي للعناصر والمعادن", "الكثافة والسرعة", "درجة الحرارة فقط"], "answer": "التركيب الكيميائي للعناصر والمعادن" }
        ]
    };
}

function initializeApp() {
    renderCategories();
    setupEventListeners();
}

function renderCategories() {
    categoriesGrid.innerHTML = '';
    
    const categories = [
        {
            id: 'الجيولوجيا_الأساسية',
            name: 'الجيولوجيا الأساسية',
            icon: 'fas fa-gem',
            description: 'أساسيات علم الجيولوجيا والصخور والمعادن',
            count: quizData['الجيولوجيا_الأساسية'] ? quizData['الجيولوجيا_الأساسية'].length : 25
        },
        {
            id: 'الجيوكيمياء',
            name: 'الجيوكيمياء',
            icon: 'fas fa-flask',
            description: 'التركيب الكيميائي للصخور والمعادن',
            count: quizData['الجيوكيمياء'] ? quizData['الجيوكيمياء'].length : 25
        },
        {
            id: 'الجيوفيزياء',
            name: 'الجيوفيزياء',
            icon: 'fas fa-satellite-dish',
            description: 'الخصائص الفيزيائية للصخور والطبقات الأرضية',
            count: quizData['الجيوفيزياء'] ? quizData['الجيوفيزياء'].length : 25
        },
        {
            id: 'الهيدروجيولوجيا',
            name: 'الهيدروجيولوجيا',
            icon: 'fas fa-tint',
            description: 'علم المياه الجوفية وحركتها وتوزيعها',
            count: quizData['الهيدروجيولوجيا'] ? quizData['الهيدروجيولوجيا'].length : 25
        },
        {
            id: 'الجيولوجيا_البترولية_والتطبيقية',
            name: 'الجيولوجيا البترولية',
            icon: 'fas fa-oil-well',
            description: 'جيولوجيا النفط والغاز والتطبيقات العملية',
            count: quizData['الجيولوجيا_البترولية_والتطبيقية'] ? quizData['الجيولوجيا_البترولية_والتطبيقية'].length : 25
        },
        {
            id: 'الجيولوجيا_التركيبية',
            name: 'الجيولوجيا التركيبية',
            icon: 'fas fa-mountain',
            description: 'التراكيب الجيولوجية والتصدعات والطيات',
            count: quizData['الجيولوجيا_التركيبية'] ? quizData['الجيولوجيا_التركيبية'].length : 25
        },
        {
            id: 'جيولوجيا_الترسيب',
            name: 'جيولوجيا الترسيب',
            icon: 'fas fa-layer-group',
            description: 'عمليات الترسيب والطبقات والصخور الرسوبية',
            count: quizData['جيولوجيا_الترسيب'] ? quizData['جيولوجيا_الترسيب'].length : 25
        }
    ];

    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div class="category-icon">
                <i class="${category.icon}"></i>
            </div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
            <div class="questions-count">${category.count} سؤال</div>
        `;
        categoryCard.addEventListener('click', () => startQuiz(category.id));
        categoriesGrid.appendChild(categoryCard);
    });
}

function setupEventListeners() {
    // أزرار التنقل بين الأسئلة
    prevQuestionButton.addEventListener('click', goToPreviousQuestion);
    nextQuestionButton.addEventListener('click', goToNextQuestion);
    submitQuizButton.addEventListener('click', submitQuiz);
    
    // أزرار النتائج
    reviewAnswersButton.addEventListener('click', reviewAnswers);
    newQuizButton.addEventListener('click', startNewQuiz);
    
    // زر البدء
    startTrainingButton.addEventListener('click', () => {
        categoriesSection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // أزرار تغيير اللغة
    langButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            langButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            language = this.getAttribute('data-lang');
            changeLanguage(language);
        });
    });
}

function startQuiz(categoryId) {
    if (!quizData[categoryId] || quizData[categoryId].length === 0) {
        alert('لا توجد أسئلة متاحة لهذا التصنيف حالياً');
        return;
    }

    currentCategory = categoryId;
    currentQuestions = [...quizData[categoryId]];
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(null);
    score = 0;
    
    // تحديث واجهة الاختبار
    quizCategoryTitle.textContent = getCategoryName(categoryId);
    totalQuestionsElement.textContent = currentQuestions.length;
    
    // إظهار قسم الاختبار وإخفاء الأقسام الأخرى
    categoriesSection.style.display = 'none';
    quizSection.style.display = 'block';
    resultsSection.style.display = 'none';
    
    // تحميل السؤال الأول
    loadQuestion();
}

function loadQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // تحديث نص السؤال
    questionText.textContent = question.question;
    
    // تحديث شريط التقدم
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    quizProgress.style.width = `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;
    
    // إعداد الخيارات
    optionsContainer.innerHTML = '';
    const optionLetters = ['أ', 'ب', 'ج', 'د'];
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        if (userAnswers[currentQuestionIndex] === option) {
            optionElement.classList.add('selected');
        }
        
        optionElement.innerHTML = `
            <div class="option-letter">${optionLetters[index]}</div>
            <div class="option-text">${option}</div>
        `;
        
        optionElement.addEventListener('click', () => selectOption(option, optionElement));
        optionsContainer.appendChild(optionElement);
    });
    
    // تحميل الاقتراحات الذكية
    loadSuggestions(question.id);
    
    // تحديث حالة الأزرار
    prevQuestionButton.disabled = currentQuestionIndex === 0;
    nextQuestionButton.style.display = currentQuestionIndex < currentQuestions.length - 1 ? 'inline-flex' : 'none';
    submitQuizButton.style.display = currentQuestionIndex === currentQuestions.length - 1 ? 'inline-flex' : 'none';
    
    // تشغيل صوت النقر
    playSound(clickSound);
}

function loadSuggestions(questionId) {
    const categorySuggestions = suggestionsDatabase[currentCategory];
    
    if (categorySuggestions && categorySuggestions[questionId]) {
        suggestionsSection.style.display = 'block';
        suggestionsContent.innerHTML = '';
        
        categorySuggestions[questionId].forEach((suggestion, index) => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.style.animationDelay = `${index * 0.1}s`;
            
            const icon = getSuggestionIcon(suggestion.type);
            
            suggestionItem.innerHTML = `
                <h4><i class="${icon}"></i> ${suggestion.title}</h4>
                <p>${suggestion.content}</p>
            `;
            
            suggestionsContent.appendChild(suggestionItem);
        });
    } else {
        // اقتراحات عامة إذا لم توجد اقتراحات محددة
        suggestionsSection.style.display = 'block';
        suggestionsContent.innerHTML = `
            <div class="suggestion-item">
                <h4><i class="fas fa-lightbulb"></i> نصيحة عامة</h4>
                <p>اقرأ السؤال بعناية وتأكد من فهمك للمطلوب قبل اختيار الإجابة. استخدم المعرفة الأساسية في الجيولوجيا للتمييز بين الخيارات.</p>
            </div>
        `;
    }
}

function getSuggestionIcon(type) {
    const icons = {
        'تعريف': 'fas fa-book',
        'معلومة': 'fas fa-info-circle',
        'تركيب كيميائي': 'fas fa-flask',
        'تصنيف': 'fas fa-layer-group',
        'نصيحة': 'fas fa-tips'
    };
    
    return icons[type] || 'fas fa-lightbulb';
}

function selectOption(selectedOption, optionElement) {
    // إزالة التحديد من جميع الخيارات
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // تحديد الخيار المختار
    optionElement.classList.add('selected');
    userAnswers[currentQuestionIndex] = selectedOption;
    
    // تشغيل صوت النقر
    playSound(clickSound);
}

function goToPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function goToNextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function submitQuiz() {
    // حساب النتيجة
    score = 0;
    currentQuestions.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            score++;
        }
    });
    
    // عرض النتائج
    showResults();
}

function showResults() {
    // تحديث النتيجة والرسالة
    finalScoreElement.textContent = `${score}/${currentQuestions.length}`;
    
    // تحديد مستوى الأداء
    const percentage = (score / currentQuestions.length) * 100;
    let message = '';
    let resultClass = '';
    
    if (percentage >= 80) {
        message = 'ممتاز! لديك معرفة شاملة في هذا المجال.';
        resultClass = 'success';
    } else if (percentage >= 60) {
        message = 'جيد جداً! لديك فهم قوي للموضوع مع بعض النقاط التي تحتاج إلى تحسين.';
        resultClass = 'average';
    } else {
        message = 'حاول مرة أخرى! ننصحك بمراجعة المواد التعليمية قبل إعادة الاختبار.';
        resultClass = 'poor';
    }
    
    resultsMessageElement.textContent = message;
    resultsCard.className = `results-card ${resultClass}`;
    
    // إنشاء مخطط الأداء
    createPerformanceChart(percentage);
    
    // إظهار قسم النتائج وإخفاء الأقسام الأخرى
    categoriesSection.style.display = 'none';
    quizSection.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // تشغيل صوت الانتهاء
    playSound(completeSound);
}

function createPerformanceChart(percentage) {
    performanceChart.innerHTML = `
        <h4>مستوى أدائك</h4>
        <div class="chart-bar">
            <div class="chart-fill" style="width: ${percentage}%"></div>
        </div>
        <p>${percentage.toFixed(1)}% - ${getPerformanceLevel(percentage)}</p>
    `;
}

function getPerformanceLevel(percentage) {
    if (percentage >= 90) return 'متميز';
    if (percentage >= 80) return 'ممتاز';
    if (percentage >= 70) return 'جيد جداً';
    if (percentage >= 60) return 'جيد';
    if (percentage >= 50) return 'مقبول';
    return 'بحاجة للتحسين';
}

function reviewAnswers() {
    currentQuestionIndex = 0;
    loadQuestion();
    
    // إظهار قسم الاختبار وإخفاء الأقسام الأخرى
    categoriesSection.style.display = 'none';
    quizSection.style.display = 'block';
    resultsSection.style.display = 'none';
}

function startNewQuiz() {
    // العودة إلى قسم التصنيفات
    categoriesSection.style.display = 'block';
    quizSection.style.display = 'none';
    resultsSection.style.display = 'none';
    
    // التمرير إلى قسم التصنيفات
    categoriesSection.scrollIntoView({ behavior: 'smooth' });
}

function getCategoryName(categoryId) {
    const categoryNames = {
        'الجيولوجيا_الأساسية': 'الجيولوجيا الأساسية',
        'الجيوكيمياء': 'الجيوكيمياء',
        'الجيوفيزياء': 'الجيوفيزياء',
        'الهيدروجيولوجيا': 'الهيدروجيولوجيا',
        'الجيولوجيا_البترولية_والتطبيقية': 'الجيولوجيا البترولية والتطبيقية',
        'الجيولوجيا_التركيبية': 'الجيولوجيا التركيبية',
        'جيولوجيا_الترسيب': 'جيولوجيا الترسيب'
    };
    
    return categoryNames[categoryId] || categoryId;
}

function changeLanguage(lang) {
    // في التطبيق الحقيقي، سيتم تحميل النصوص من ملفات اللغة
    const translations = {
        ar: {
            title: 'جيولوجي - منصة تدريب الجيولوجيين',
            startTraining: 'ابدأ التدريب الآن',
            categoriesTitle: 'التخصصات الجيولوجية',
            resultsTitle: 'تهانينا! لقد أكملت الاختبار',
            suggestionsTitle: 'اقتراحات ذكية'
        },
        en: {
            title: 'Geology - Geology Training Platform',
            startTraining: 'Start Training Now',
            categoriesTitle: 'Geological Specializations',
            resultsTitle: 'Congratulations! You have completed the test',
            suggestionsTitle: 'Smart Suggestions'
        },
        fr: {
            title: 'Géologie - Plateforme de Formation en Géologie',
            startTraining: 'Commencer la Formation',
            categoriesTitle: 'Spécialisations Géologiques',
            resultsTitle: 'Félicitations! Vous avez terminé le test',
            suggestionsTitle: 'Suggestions Intelligentes'
        }
    };
    
    const translation = translations[lang] || translations.ar;
    document.title = translation.title;
    document.querySelector('h1').textContent = translation.title;
    document.querySelector('.hero p').textContent = lang === 'ar' 
        ? 'طور مهاراتك في الجيولوجيا من خلال اختبارات تفاعلية تغطي جميع التخصصات الجيولوجية مع نظام متعدد اللغات'
        : 'Develop your geology skills through interactive tests covering all geological specializations with a multilingual system';
    
    startTrainingButton.innerHTML = `<i class="fas fa-play-circle"></i> ${translation.startTraining}`;
    document.querySelector('.section-title').textContent = translation.categoriesTitle;
    document.querySelector('#resultsCard h2').textContent = translation.resultsTitle;
    document.querySelector('.suggestions-header h3').textContent = translation.suggestionsTitle;
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log('لا يمكن تشغيل الصوت:', e));
}