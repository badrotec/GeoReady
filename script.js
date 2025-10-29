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
const ROCK_QUIZ_TITLE = "تحديد الصخور بالصور"; // عنوان ثابت لاختبار الصخور

// عناصر الصوت
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const perfectSound = document.getElementById('perfect-sound');

// 💡 بيانات الصخور الجديدة (تم دمجها في الجافاسكريبت مباشرةً)
const RockQuizData = {
    // 🧱 أولًا: الصخور النارية (Magmatiques / Igneous Rocks)
    "Magmatiques_Igneous_Rocks": [
        {
            name: "Granite",
            type: "نارية جوفية",
            features: "فاتح اللون، بلورات واضحة (كوارتز + فلسبار + ميكا)، صلب جدًا",
            location: "الكتل البلوتونية، الهضاب القديمة",
            image: "Granite.jpg"
        },
        {
            name: "Diorite",
            type: "نارية جوفية",
            features: "رمادي متوسط، يحتوي أمفيبول وفلسبار، دون كوارتز واضح",
            location: "سلاسل جبلية قديمة",
            image: "Diorite.jpg"
        },
        {
            name: "Gabbro",
            type: "نارية جوفية",
            features: "داكن جدًا، حبيبات خشنة، غني بالبيروكسين والفلسبار الكلسي",
            location: "الصخور القاعدية",
            image: "Gabbro.jpg"
        },
        {
            name: "Basalte",
            type: "نارية سطحية",
            features: "داكن، ناعم الحبيبات، يظهر في تدفقات بركانية",
            location: "الحقول البركانية والحمم",
            image: "Basalte.jpg"
        },
        {
            name: "Andésite",
            type: "نارية سطحية",
            features: "رمادي مائل للخضرة، متوسط التركيب، فقاقيع أحيانًا",
            location: "مناطق بركانية قوسية",
            image: "Andésite.jpg"
        },
        {
            name: "Rhyolite",
            type: "نارية سطحية",
            features: "فاتح اللون، زجاجي أحيانًا، مشابه للغرانيت لكن دقيق الحبيبات",
            location: "تدفقات حمم سيليسية",
            image: "Rhyolite.jpg"
        }
    ],
    // 🪨 ثانيًا: الصخور الرسوبية (Sédimentaires / Sedimentary Rocks)
    "Sédimentaires_Sedimentary_Rocks": [
        {
            name: "Grès",
            type: "فتاتية",
            features: "ملمس رملي، تتكون من حبيبات كوارتز ملتحمة",
            location: "الصحارى، الأحواض القارية",
            image: "grès.jpeg"
        },
        {
            name: "Calcaire",
            type: "كيميائية / بيولوجية",
            features: "يتفاعل مع HCl، يحتوي أحيانًا على بقايا عضوية",
            location: "البحار الضحلة، الجروف",
            image: "Calcaire.jpeg"
        },
        {
            name: "Argilite", // استخدمت Argilite/Shale هنا للتوافق مع الصور
            type: "فتاتية دقيقة",
            features: "بني رمادي، طبقي، هش",
            location: "أحواض هادئة، بيئات طينية",
            image: "argilite.jpeg"
        },
         {
            name: "Shale", // إضافة Shale منفصلة لزيادة التنوع
            type: "فتاتية دقيقة",
            features: "داكن، يتميز بالصفائحية والانشقاق الموازي للطبقات",
            location: "أحواض هادئة، بيئات طينية",
            image: "shale.jpeg"
        },
        {
            name: "Conglomérat",
            type: "فتاتية خشنة",
            features: "حبيبات كبيرة (حصى) ملتحمة بملاط",
            location: "رواسب أنهار قديمة",
            image: "Conglomérat.jpeg"
        },
        {
            name: "Marnes",
            type: "مختلط",
            features: "رمادي مزرق، طيني كلسي، ناعم جدًا",
            location: "انتقالات بحرية–قارية",
            image: "Marnes.jpeg"
        },
        {
            name: "Dolomie",
            type: "كيميائية",
            features: "مشابه للحجر الجيري لكن أفتح وأقل تفاعلًا مع HCl",
            location: "متبخرات قديمة",
            image: "Dolomie.jpeg"
        }
    ],
    // 🔥 ثالثًا: الصخور المتحولة (Métamorphiques / Metamorphic Rocks)
    "Métamorphiques_Metamorphic_Rocks": [
        {
            name: "Schiste",
            type: "متحولة متوسطة",
            features: "صفائحية، لامعة بالميكا، قابلة للانشقاق",
            location: "مناطق الطي والتحول الإقليمي",
            image: "Schiste.jpeg"
        },
        {
            name: "Gneiss",
            type: "متحولة عالية",
            features: "نطاقات فاتحة وغامقة متناوبة، خشنة الحبيبات",
            location: "تحت الجبال القديمة",
            image: "Gneiss.jpeg"
        },
        {
            name: "Quartzite",
            type: "متحولة من الرملية",
            features: "صلب جدًا، لامع، لا ينخدش بالظفر",
            location: "بقايا قديمة متحولة",
            image: "Quartzite.jpeg"
        },
        {
            name: "Marbre",
            type: "متحول من الكالسير",
            features: "أبيض لامع، ناعم، يتفاعل مع HCl",
            location: "مناطق التحول التماسي",
            image: "Marbre.jpeg"
        },
         {
            name: "Amphibolite",
            type: "متحول من البازلت أو الغابرو",
            features: "داكن، غني بالأمفيبول، نسيج متوازي",
            location: "مناطق الضغط العالي",
            image: "Gabbro.jpg" // افتراضي
        }
    ]
};

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
        'skip': 'تخطي', 
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
        'time_spent': 'الوقت المستغرق', 
        'seconds': 'ثانية', 
        'correct_feedback': 'إجابة صحيحة!',
        'incorrect_feedback': 'إجابة خاطئة. الصحيح:',
        'timeout_feedback': 'انتهى الوقت! الإجابة الصحيحة:',
        'total_trainees': 'إجمالي المتدربين المسجلين:',
        // 💡 جديد: ترجمة لأقسام الصخور الجديدة
        'rock_quiz_title': ROCK_QUIZ_TITLE,
        'Magmatiques_Igneous_Rocks': 'الصخور النارية (Igneous)',
        'Sédimentaires_Sedimentary_Rocks': 'الصخور الرسوبية (Sedimentary)',
        'Métamorphiques_Metamorphic_Rocks': 'الصخور المتحولة (Metamorphic)',
        'rock_info_title': 'معلومات تحليل الصخر:',
        'rock_type': 'النوع الجيولوجي:',
        'rock_features': 'المميزات الميدانية:',
        'rock_location': 'أماكن شائعة:',
        'go_to_next': 'السؤال التالي'
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
        'total_trainees': 'Total Registered Trainees:',
        'rock_quiz_title': 'Identify the Rocks by Image',
        'Magmatiques_Igneous_Rocks': 'Igneous Rocks',
        'Sédimentaires_Sedimentary_Rocks': 'Sedimentary Rocks',
        'Métamorphiques_Metamorphic_Rocks': 'Metamorphic Rocks',
        'rock_info_title': 'Rock Analysis Information:',
        'rock_type': 'Geological Type:',
        'rock_features': 'Field Features:',
        'rock_location': 'Common Locations:',
        'go_to_next': 'Next Question'
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
        'total_trainees': 'Apprenants Enregistrés Totaux:',
        'rock_quiz_title': 'Identifier les Roches par Image',
        'Magmatiques_Igneous_Rocks': 'Roches Magmatiques',
        'Sédimentaires_Sedimentary_Rocks': 'Roches Sédimentaires',
        'Métamorphiques_Metamorphic_Rocks': 'Roches Métamorphiques',
        'rock_info_title': 'Informations sur l\'analyse des roches:',
        'rock_type': 'Type Géologique:',
        'rock_features': 'Caractéristiques de Terrain:',
        'rock_location': 'Lieux Communs:',
        'go_to_next': 'Question Suivante'
    }
};


// **=================================================**
// [2] دوال مساعدة أساسية
// **=================================================**

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function switchScreen(screenId) {
    const screens = ['topic-selection', 'quiz-screen', 'results-screen'];
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) {
            if (id === screenId) {
                screen.classList.remove('hidden');
            } else {
                screen.classList.add('hidden');
            }
        }
    });
}


// **=================================================**
// [3] منطق المؤقت والوقت
// **=================================================**

function startTimer() {
    clearInterval(timerInterval); 
    let timeRemaining = TIME_LIMIT;
    const timerDisplayElement = document.getElementById('timer-display'); 
    const timerValueElement = document.querySelector('#timer-display .timer-value'); 
    const timerUnitElement = document.querySelector('#timer-display .timer-unit'); 
    const t = translations[currentLanguage];

    if (timerValueElement) timerValueElement.textContent = timeRemaining;
    if (timerUnitElement) timerUnitElement.textContent = t.timer_text; 
    if (timerDisplayElement) {
        timerDisplayElement.removeAttribute('data-critical'); 
        timerDisplayElement.style.color = 'var(--neon-blue)'; 
    }

    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timerValueElement) timerValueElement.textContent = timeRemaining;

        if (timeRemaining <= 5) {
            if (timerDisplayElement) {
                timerDisplayElement.setAttribute('data-critical', 'true'); 
            }
        } else {
            if (timerDisplayElement) {
                 timerDisplayElement.removeAttribute('data-critical'); 
            }
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

function handleTimeout() {
    // نستخدم دالة processAnswer مع معلمة التخطي/التايم آوت
    processAnswer(true); 
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.classList.remove('hidden');
}


// **=================================================**
// [4] دالة تحميل البيانات وتهيئة الأزرار (تصحيح العرض)
// **=================================================**

async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    const startCustomBtn = document.getElementById('start-quiz-btn'); 
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
    const topicsListContainer = document.getElementById('topics-list-container');
    const dailyChallengeContainer = document.querySelector('.daily-challenge-section');
    
    let allData = {...RockQuizData};
    
    try {
        if (loadingMessage) {
            loadingMessage.textContent = translations[currentLanguage].loading_data;
            loadingMessage.classList.remove('hidden');
        }
        
        // محاولة تحميل البيانات من Question.json
        const response = await fetch('./Question.json'); 
        if (response.ok) {
            const dynamicData = await response.json();
            allData = {...dynamicData, ...RockQuizData};
        } else {
             console.warn("Question.json not loaded, using only static Rock Quiz Data.");
        }
        
        geologicalData = allData;
        if (loadingMessage) loadingMessage.classList.add('hidden'); 
        
        // تفعيل الأزرار بعد التحميل
        if (startCustomBtn) {
            startCustomBtn.disabled = false;
            startCustomBtn.addEventListener('click', () => {
                 // إخفاء أزرار البداية وإظهار قائمة المواضيع
                 if (startCustomBtn) startCustomBtn.classList.add('hidden');
                 if (dailyChallengeContainer) dailyChallengeContainer.classList.add('hidden'); 
                 if (topicsListContainer) topicsListContainer.classList.remove('hidden');
                 populateTopicLists(geologicalData, false); 
            });
        }
        if (dailyChallengeBtn) {
            dailyChallengeBtn.disabled = false;
            // يجب أن يكون الزر نفسه مرئياً، فقط الحاوية يتم التحكم بها لاحقاً
            if (dailyChallengeContainer) dailyChallengeContainer.classList.remove('hidden'); 
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
// [5] دالة ملء القوائم (لتحديث أسماء الصخور المترجمة)
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
    
    if (isSubMenu) {
        if (backBtn) backBtn.classList.remove('hidden');
        if (headerTitle) headerTitle.innerHTML = `<i class="fas fa-globe-americas"></i> ${t.choose_gis_domain}`; 
    } else {
        if (backBtn) backBtn.classList.add('hidden');
        if (headerTitle) headerTitle.innerHTML = `<i class="fas fa-folder-open"></i> ${t.choose_domain}`; 
        // لا نحتاج لإخفاء الأزرار هنا، فقط في دالة event listener للزر "بدء اختبار مخصص"
    }
    
    Object.keys(dataObject).forEach(key => {
        let topicDisplayName = t[key] || key.replace(/_/g, ' ');
        
        const content = dataObject[key];
        let clickHandler;
        let isFolder = false;
        
        if (Array.isArray(content)) {
            clickHandler = () => {
                if (Object.keys(RockQuizData).includes(key)) {
                    startRockQuiz(topicDisplayName, content);
                } else {
                    startQuiz(topicDisplayName, content); 
                }
                
                document.getElementById('sidebar').classList.remove('open');
                const overlay = document.getElementById('overlay');
                if (overlay) overlay.style.display = 'none';
            };
        } else if (typeof content === 'object' && content !== null) {
            isFolder = true;
            clickHandler = () => {
                populateTopicLists(content, true); 
                document.getElementById('sidebar').classList.remove('open');
                const overlay = document.getElementById('overlay');
                if (overlay) overlay.style.display = 'none';
            };
        }
        
        const gridCard = document.createElement('div');
        gridCard.className = `topic-card ${isFolder ? 'topic-folder' : 'topic-quiz'}`; 
        const icon = isFolder ? `<i class="fas fa-folder" style="color: var(--neon-cyan);"></i> ` : `<i class="fas fa-chalkboard-teacher" style="color: var(--neon-blue);"></i> `;
        gridCard.innerHTML = icon + topicDisplayName;
        if (clickHandler) gridCard.addEventListener('click', clickHandler);
        topicsList.appendChild(gridCard);

        const sidebarLink = document.createElement('a');
        sidebarLink.href = "#";
        sidebarLink.classList.add('sidebar-link-item');
        sidebarLink.innerHTML = icon + `<span>${topicDisplayName}</span>`;
        if (clickHandler) sidebarLink.addEventListener('click', clickHandler);
        sidebarList.appendChild(sidebarLink);
    });
}


// **=================================================**
// [6] منطق الاختبار (بدء، عرض، إجابة، نتائج)
// **=================================================**

function startDailyChallenge() {
    const t = translations[currentLanguage];
    let allQuestions = [];
    
    function collectQuestions(dataObject) {
        Object.values(dataObject).forEach(content => {
            if (Array.isArray(content)) {
                // نضمن عدم إضافة أسئلة الصخور (التي هي كائنات وليست تنسيق سؤال تقليدي) إلى التحدي اليومي العشوائي
                if (!content.some(item => item.hasOwnProperty('image'))) { 
                    allQuestions = allQuestions.concat(content);
                }
            } else if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
                collectQuestions(content);
            }
        });
    }
    
    collectQuestions(geologicalData); 
    const shuffledQuestions = shuffleArray(allQuestions);
    const dailyQuestions = shuffledQuestions.slice(0, DAILY_CHALLENGE_QUESTIONS);
    
    if (dailyQuestions.length === 0) {
        showNotification("لا تتوفر أسئلة كافية لهذا التحدي.", 5000);
        return;
    }
    
    startQuiz(t.daily_challenge, dailyQuestions);
}

function startQuiz(quizTitle, questions) { 
    clearInterval(timerInterval);
    currentQuestions = shuffleArray(questions.map((q, index) => ({...q, id: q.id || index}))); 
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
    quizStartTime = Date.now(); 
    
    switchScreen('quiz-screen');
    
    const quizTitleElement = document.getElementById('quiz-title');
    if (quizTitleElement) {
        quizTitleElement.textContent = `${translations[currentLanguage].quiz_title_prefix} ${quizTitle}`;
    }
    
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) {
         if (quizTitle === translations['ar'].daily_challenge) {
             skipBtn.classList.add('hidden');
         } else {
             skipBtn.classList.remove('hidden');
         }
    }

    displayQuestion();
}

function displayQuestion() {
    clearInterval(timerInterval); 
    const qContainer = document.getElementById('question-container');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const questionCounter = document.getElementById('question-counter');
    const currentScoreDisplay = document.getElementById('current-score'); 
    const rockInfoBox = document.getElementById('rock-info-display'); // جديد

    if (currentQuestionIndex >= currentQuestions.length) {
        return showResults(); 
    }
    
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];
    
    startTimer(); 
    
    if (questionCounter) {
        questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    }
    if (currentScoreDisplay) {
        currentScoreDisplay.textContent = score;
    }
    
    // إخفاء صندوق معلومات الصخرة (للتأكد من عدم ظهوره في الاختبارات التقليدية)
    if (rockInfoBox) rockInfoBox.classList.add('hidden');

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
        submitBtn.disabled = true;
    }
    if (nextBtn) {
        nextBtn.classList.add('hidden');
        nextBtn.querySelector('.btn-text').textContent = t.next; // إعادة النص للوضع العادي
    }
    
    // تفعيل زر التأكيد وتظليل الخيار (منطق زر الراديو المخفي)
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input[type="radio"]');
        
        input.addEventListener('change', () => {
             document.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
             if(input.checked) {
                 label.classList.add('selected');
             }
             if (submitBtn) submitBtn.disabled = false;
        });

        label.addEventListener('click', (e) => {
             if (e.target === input) return; 
             input.checked = true;
             input.dispatchEvent(new Event('change')); 
        });
    });
    
    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) feedbackContainer.classList.add('hidden');
}


// **=================================================**
// [7] منطق اختبار الصخور (جديد)
// **=================================================**

function startRockQuiz(quizTitle, rockList) {
    clearInterval(timerInterval);
    currentQuestions = shuffleArray(rockList.map((q, index) => ({...q, id: q.name || index}))); 
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
    quizStartTime = Date.now(); 
    
    switchScreen('quiz-screen');
    
    const quizTitleElement = document.getElementById('quiz-title');
    if (quizTitleElement) {
        quizTitleElement.textContent = `${translations[currentLanguage].quiz_title_prefix} ${quizTitle}`;
    }

    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) skipBtn.classList.remove('hidden');

    displayRockQuestion(); 
}

function displayRockQuestion() {
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
    
    startTimer(); 
    
    if (questionCounter) {
        questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    }
    if (currentScoreDisplay) {
        currentScoreDisplay.textContent = score;
    }
    
    // إنشاء خيارات عشوائية (4 خيارات)
    let allRockNames = [];
    Object.values(RockQuizData).forEach(arr => {
        allRockNames = allRockNames.concat(arr.map(r => r.name));
    });

    let wrongOptions = allRockNames.filter(name => name !== currentQ.name);
    shuffleArray(wrongOptions);
    const options = shuffleArray([currentQ.name, ...wrongOptions.slice(0, 3)]);

    // إنشاء محتوى السؤال (الصورة + الخيارات)
    let htmlContent = `<img src="roch/${currentQ.image}" alt="صورة صخرة للاختبار" class="rock-image-quiz">`;
    htmlContent += '<p class="question-text">ما هو اسم هذه الصخرة؟</p>'; 
    
    // إضافة حاوية معلومات الصخرة (مخفية مبدئياً)
    htmlContent += `
        <div id="rock-info-display" class="rock-info-box hidden">
            <h3 class="rock-info-title"><i class="fas fa-microscope"></i> ${t.rock_info_title} ${currentQ.name}</h3>
            <p class="rock-info-item"><strong>${t.rock_type}</strong> ${currentQ.type}</p>
            <p class="rock-info-item"><strong>${t.rock_features}</strong> ${currentQ.features}</p>
            <p class="rock-info-item"><strong>${t.rock_location}</strong> ${currentQ.location}</p>
        </div>
    `;

    // حاوية الخيارات (2x2)
    htmlContent += '<div class="options-container">';
    
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
        nextBtn.querySelector('.btn-text').textContent = t.go_to_next;
    }

    // تفعيل زر التأكيد وتظليل الخيار (منطق زر الراديو المخفي)
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input[type="radio"]');
        
        input.addEventListener('change', () => {
             document.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
             if(input.checked) {
                 label.classList.add('selected');
             }
             if (submitBtn) submitBtn.disabled = false;
        });

        label.addEventListener('click', (e) => {
             if (e.target === input) return; 
             input.checked = true;
             input.dispatchEvent(new Event('change')); 
        });
    });
    
    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) feedbackContainer.classList.add('hidden');
}


// **=================================================**
// [8] دالة معالجة الإجابة الموحدة
// **=================================================**

function processAnswer(isSkippedOrTimeout = false) {
    clearInterval(timerInterval); 
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];
    
    const selectedOptionInput = document.querySelector('input[name="option"]:checked');
    let userAnswer = selectedOptionInput ? selectedOptionInput.value : t.timeout_answer;
    
    // التحقق مما إذا كان الاختبار الحالي هو اختبار صخور أو اختبار تقليدي
    const isRockQuiz = currentQ.hasOwnProperty('image');
    const correctAnswer = currentQ.name || currentQ.answer; 
    
    let isCorrect = false;
    let isAnswered = false;

    if (isSkippedOrTimeout) {
        isCorrect = false;
        isAnswered = false; 
        score += POINTS_WRONG; 
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
        question: currentQ.question || `تحديد الصخرة: ${currentQ.name}`,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect,
    };

    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true; 
        label.style.cursor = 'default'; 

        label.classList.remove('selected'); 

        if (input.value === correctAnswer) {
            label.classList.add('correct'); 
        } else if (input.checked && !isCorrect && isAnswered) { 
            label.classList.add('incorrect'); 
        }
        if (!isAnswered && input.value !== correctAnswer) { 
             if (input.value !== correctAnswer) label.classList.add('incorrect');
        }
    });
    
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
    
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.classList.add('hidden');
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.classList.remove('hidden');
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) skipBtn.classList.add('hidden');

    // إظهار معلومات الصخرة فقط في اختبار الصخور
    if (isRockQuiz) {
        const rockInfoBox = document.getElementById('rock-info-display');
        if (rockInfoBox) {
            rockInfoBox.classList.remove('hidden');
            const optionsContainer = rockInfoBox.nextElementSibling; 
            if (optionsContainer && optionsContainer.classList.contains('options-container')) {
                optionsContainer.classList.add('hidden');
            }
        }
    }
}


// **=================================================**
// [9] عرض النتائج
// **=================================================**

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

    const totalTimeSeconds = Math.round((Date.now() - quizStartTime) / 1000);
    if (totalTimeElement) totalTimeElement.textContent = `${totalTimeSeconds} ${translations[currentLanguage].seconds}`;
    
    if (wrongCount === 0 && totalQuestions > 0) { 
        if (perfectSound) { perfectSound.currentTime = 0; perfectSound.play().catch(e => console.error("Error playing perfect sound:", e)); }
    }
    
    if (finalScoreElement) finalScoreElement.textContent = score;
    if (totalQuestionsCountElement) totalQuestionsCountElement.textContent = totalQuestions;
    if (correctCountElement) correctCountElement.textContent = correctCount;
    if (wrongCountElement) wrongCountElement.textContent = wrongCount;
    
    const percentage = Math.round((correctCount / (totalQuestions || 1)) * 100);
    const t = translations[currentLanguage];
    
    if (gradeMessage) {
        if (percentage >= 90) { gradeMessage.innerHTML = t.great_job; gradeMessage.style.color = 'var(--correct-color)'; } 
        else if (percentage >= 70) { gradeMessage.innerHTML = t.good_job; gradeMessage.style.color = 'var(--neon-blue)'; } 
        else { gradeMessage.innerHTML = t.needs_review; gradeMessage.style.color = 'var(--incorrect-color)'; }
    }
    
    const progressRingFill = document.querySelector('.progress-ring-fill');
    if (progressRingFill) {
        const radius = progressRingFill.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        progressRingFill.style.strokeDashoffset = offset;
    }
    
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
    
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) skipBtn.classList.add('hidden');
}


// **=================================================**
// [10] تشغيل الكود عند تحميل الصفحة
// **=================================================**

document.addEventListener('DOMContentLoaded', () => {
    // ربط الأزرار بمنطقها
    const nextBtn = document.getElementById('next-btn');
    const skipBtn = document.getElementById('skip-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (submitBtn) {
        submitBtn.addEventListener('click', () => processAnswer(false));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            // التحقق مما إذا كان الاختبار الحالي هو اختبار صخور
            if (currentQuestions.length > 0 && currentQuestions[0].hasOwnProperty('image')) {
                displayRockQuestion();
            } else {
                displayQuestion();
            }
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            const selectedOptionInput = document.querySelector('input[name="option"]:checked');
            // إذا كان هناك اختيار، يتم احتسابه كإجابة
            if (selectedOptionInput) {
                processAnswer(false);
            } else {
                // إذا لم يكن هناك اختيار، يتم احتسابه كتخطي/وقت مستقطع
                processAnswer(true); 
            }
        });
    }
    
    // --- منطق القائمة الجانبية وزر العودة ---
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const homeBtn = document.getElementById('home-btn');
    const backBtn = document.getElementById('back-to-main-menu-btn');
    const startCustomBtn = document.getElementById('start-quiz-btn'); 
    const dailyChallengeContainer = document.querySelector('.daily-challenge-section');
    const topicsListContainer = document.getElementById('topics-list-container');
    
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

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            populateTopicLists(geologicalData, false); 
            if (startCustomBtn) startCustomBtn.classList.remove('hidden');
            if (dailyChallengeContainer) dailyChallengeContainer.classList.remove('hidden'); 
            if (topicsListContainer) topicsListContainer.classList.add('hidden');
        });
    }

    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.reload(); 
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
    translateUI(currentLanguage); 
});
