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
            // ملاحظة: بما أن هذه الصورة غير موجودة في المرفقات، سنستخدم صورة Gabbro مؤقتاً لتجنب خطأ تحميل الصورة
            // يجب استبدالها بصورة Amphibolite.jpeg إذا توفرت.
            image: "Gabbro.jpg" 
        }
    ]
};

// قاموس الترجمة
const translations = {
    'ar': {
        // ... (الترجمات القديمة كما هي)
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
        // ... (ترجمات إنجليزية)
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
        // ... (ترجمات فرنسية)
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
// [2] تحميل البيانات والتهيئة الأولية (تعديل لدمج بيانات الصخور)
// **=================================================**
async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    const startCustomBtn = document.getElementById('start-quiz-btn'); 
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
    const topicsListContainer = document.getElementById('topics-list-container');
    
    // دمج بيانات الصخور الثابتة مع البيانات الديناميكية المحملة من JSON
    let allData = {...RockQuizData};
    
    try {
        if (loadingMessage) {
            loadingMessage.textContent = translations[currentLanguage].loading_data;
            loadingMessage.classList.remove('hidden');
        }
        if (startCustomBtn) startCustomBtn.disabled = true;
        if (dailyChallengeBtn) dailyChallengeBtn.disabled = true;
        
        // محاولة تحميل البيانات من Question.json أولاً
        const response = await fetch('./Question.json'); 
        if (response.ok) {
            const dynamicData = await response.json();
            // دمج البيانات المحملة مع بيانات الصخور
            allData = {...dynamicData, ...RockQuizData};
        } else {
             // إذا لم يتم تحميل Question.json، نستخدم بيانات الصخور فقط
             console.warn("Question.json not loaded, using only static Rock Quiz Data.");
        }
        
        geologicalData = allData;

        if (loadingMessage) loadingMessage.classList.add('hidden'); 
        
        // تفعيل الأزرار بعد التحميل
        if (startCustomBtn) {
            startCustomBtn.disabled = false;
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
// [2.5] دالة ملء القوائم (تحديث أسماء الصخور المترجمة)
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
        if (startCustomBtn) startCustomBtn.classList.add('hidden');
        if (dailyChallengeContainer) dailyChallengeContainer.classList.add('hidden');
    }
    
    Object.keys(dataObject).forEach(key => {
        // 💡 جديد: استخدام الترجمة لاسم الموضوع
        let topicDisplayName = t[key] || key.replace(/_/g, ' ');
        
        const content = dataObject[key];
        let clickHandler;
        let isFolder = false;
        
        if (Array.isArray(content)) {
            // الموضوع هو قائمة أسئلة مباشرة
            clickHandler = () => {
                // 💡 جديد: إذا كان الموضوع هو أحد أقسام الصخور، نستخدم منطق Rock Quiz
                if (Object.keys(RockQuizData).includes(key)) {
                    startRockQuiz(topicDisplayName, content);
                } else {
                    startQuiz(topicDisplayName, content); 
                }
                
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('overlay').style.display = 'none';
            };
        } else if (typeof content === 'object' && content !== null) {
            // الموضوع يحتوي على فروع فرعية
            isFolder = true;
            clickHandler = () => {
                populateTopicLists(content, true); 
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('overlay').style.display = 'none';
            };
        }
        
        // إنشاء بطاقة الشاشة الرئيسية
        const gridCard = document.createElement('div');
        gridCard.className = `topic-card ${isFolder ? 'topic-folder' : 'topic-quiz'}`; 
        const icon = isFolder ? `<i class="fas fa-folder" style="color: var(--neon-cyan);"></i> ` : `<i class="fas fa-chalkboard-teacher" style="color: var(--neon-blue);"></i> `;
        gridCard.innerHTML = icon + topicDisplayName;
        if (clickHandler) gridCard.addEventListener('click', clickHandler);
        topicsList.appendChild(gridCard);

        // إنشاء رابط القائمة الجانبية
        const sidebarLink = document.createElement('a');
        sidebarLink.href = "#";
        sidebarLink.classList.add('sidebar-link-item');
        sidebarLink.innerHTML = icon + `<span>${topicDisplayName}</span>`;
        if (clickHandler) sidebarLink.addEventListener('click', clickHandler);
        sidebarList.appendChild(sidebarLink);
    });
}


// **=================================================**
// [3] منطق الاختبار (بدء، عرض، إجابة، نتائج)
// **=================================================**
// دالة بدء اختبار الصخور (جديدة)
function startRockQuiz(quizTitle, rockList) {
    clearInterval(timerInterval);
    // نستخدم قائمة الصخور مباشرة كسؤال، حيث كل صخرة تمثل السؤال
    currentQuestions = shuffleArray(rockList.map((q, index) => ({...q, id: q.name || index}))); 
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
    quizStartTime = Date.now(); 
    
    // تبديل الشاشات
    document.getElementById('topic-selection').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    
    const quizTitleElement = document.getElementById('quiz-title');
    if (quizTitleElement) {
        quizTitleElement.textContent = `${translations[currentLanguage].quiz_title_prefix} ${quizTitle}`;
    }

    // إظهار زر التخطي في اختبار الصخور
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) skipBtn.classList.remove('hidden');

    displayRockQuestion(); // استخدام دالة عرض مخصصة للصخور
}

// دالة عرض سؤال الصخور (مخصصة للصور)
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
    
    const currentQ = currentQuestions[currentQuestionIndex]; // الصخرة الصحيحة
    const t = translations[currentLanguage];
    
    startTimer(); 
    
    if (questionCounter) {
        questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    }
    if (currentScoreDisplay) {
        currentScoreDisplay.textContent = score;
    }
    
    // 💡 إنشاء خيارات عشوائية (4 خيارات)
    let allRockNames = [];
    Object.values(RockQuizData).forEach(arr => {
        allRockNames = allRockNames.concat(arr.map(r => r.name));
    });

    let wrongOptions = allRockNames.filter(name => name !== currentQ.name);
    // خلط واختيار 3 خيارات خاطئة عشوائية
    shuffleArray(wrongOptions);
    const options = shuffleArray([currentQ.name, ...wrongOptions.slice(0, 3)]);

    // إنشاء محتوى السؤال (الصورة + الخيارات)
    let htmlContent = `<img src="roch/${currentQ.image}" alt="صورة صخرة للاختبار" class="rock-image-quiz">`;
    htmlContent += '<p class="question-text">ما هو اسم هذه الصخرة؟</p>'; // سؤال ثابت
    
    // 💡 إضافة حاوية معلومات الصخرة (مخفية مبدئياً)
    htmlContent += `
        <div id="rock-info-display" class="rock-info-box hidden">
            <h3 class="rock-info-title"><i class="fas fa-microscope"></i> ${t.rock_info_title} ${currentQ.name}</h3>
            <p class="rock-info-item"><strong>${t.rock_type}</strong> ${currentQ.type}</p>
            <p class="rock-info-item"><strong>${t.rock_features}</strong> ${currentQ.features}</p>
            <p class="rock-info-item"><strong>${t.rock_location}</strong> ${currentQ.location}</p>
        </div>
    `;

    // 💡 حاوية الخيارات (2x2)
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
        // تغيير نص زر التالي ليصبح "السؤال التالي" بعد الإجابة
        nextBtn.querySelector('.btn-text').textContent = t.go_to_next;
    }

    // تفعيل زر التأكيد عند اختيار خيار وتطبيق كلاس التحديد
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input[type="radio"]');
        
        input.addEventListener('change', () => {
             document.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
             if(input.checked) {
                 label.classList.add('selected');
             }
             if (submitBtn) submitBtn.disabled = false;
        });

        // لضمان عمل النقر على الـ label بالكامل
        label.addEventListener('click', (e) => {
             if (e.target === input) return; // تجنب المعالجة المزدوجة
             input.checked = true;
             input.dispatchEvent(new Event('change')); // إطلاق حدث التغيير
        });
    });
    
    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) feedbackContainer.classList.add('hidden');
}


// ------ دالة معالجة الإجابة الموحدة (لإضافة منطق Rock Info) ------
function processAnswer(isSkippedOrTimeout = false) {
    clearInterval(timerInterval); 
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];
    
    const selectedOptionInput = document.querySelector('input[name="option"]:checked');
    let userAnswer = selectedOptionInput ? selectedOptionInput.value : t.timeout_answer;
    const correctAnswer = currentQ.name || currentQ.answer; // اسم الصخرة أو الإجابة التقليدية
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

    // تحديث الواجهة لعرض الإجابة الصحيحة/الخاطئة
    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true; 
        label.style.cursor = 'default'; 

        // إزالة كلاس التحديد المخصص قبل تطبيق كلاسات التصحيح
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
    
    // عرض رسالة التغذية الراجعة
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
    
    if (submitBtn) submitBtn.classList.add('hidden');
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.classList.remove('hidden');
    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) skipBtn.classList.add('hidden');

    // 💡 جديد: إظهار حاوية معلومات الصخرة بعد الإجابة
    const rockInfoBox = document.getElementById('rock-info-display');
    if (rockInfoBox) {
        rockInfoBox.classList.remove('hidden');
    }
}


// ------ الانتقال للسؤال التالي (Next) ------
const nextBtn = document.getElementById('next-btn');
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        // 💡 جديد: إذا كنا في اختبار صخور، نستخدم دالة عرض الصخور
        if (currentQuestions.length > 0 && currentQuestions[0].hasOwnProperty('image')) {
            displayRockQuestion();
        } else {
            displayQuestion();
        }
    });
}

// ------ تخطي السؤال (Skip) ------
const skipBtn = document.getElementById('skip-btn');
if (skipBtn) {
    skipBtn.addEventListener('click', () => {
        // نتحقق مما إذا كان الخيار قد تم اختياره قبل التخطي
        const selectedOptionInput = document.querySelector('input[name="option"]:checked');
        if (selectedOptionInput) {
            // إذا كان هناك اختيار، تتم معالجته كإجابة
            processAnswer(false);
        } else {
            // إذا لم يكن هناك اختيار، يعتبر تخطياً (نفس منطق التايم آوت)
            processAnswer(true); 
        }
    });
}

// ... (بقية الدوال لا تحتاج تغيير جوهري)

// **=================================================**
// [5] تشغيل الكود عند تحميل الصفحة
// **=================================================**
document.addEventListener('DOMContentLoaded', () => {
    // --- التحكم في القائمة الجانبية (Sidebar) ---
    // ... (كود القائمة الجانبية كما هو)
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    
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
    
    // --- زر الرجوع من قائمة المواضيع الفرعية ---
    const backBtn = document.getElementById('back-to-main-menu-btn');
    const startCustomBtn = document.getElementById('start-quiz-btn'); 
    const dailyChallengeContainer = document.querySelector('.daily-challenge-section');
    const topicsListContainer = document.getElementById('topics-list-container');

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            populateTopicLists(geologicalData, false); 
            if (startCustomBtn) startCustomBtn.classList.remove('hidden');
            if (dailyChallengeContainer) dailyChallengeContainer.classList.remove('hidden'); 
            if (topicsListContainer) topicsListContainer.classList.add('hidden');
        });
    }

    // --- زر العودة للقائمة الرئيسية من شاشة الاختبار ---
    const homeBtn = document.getElementById('home-btn');
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
    translateUI(currentLanguage); // تطبيق الترجمة الأولية
});
