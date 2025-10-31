// نظام تشغيل الأصوات
class SoundManager {
    constructor() {
        this.sounds = {
            correct: 'sounds/correct.mp3',
            wrong: 'sounds/wrong.mp3', 
            perfect: 'sounds/perfect.mp3',
            click: 'sounds/click.mp3',
            timer: 'sounds/timer.mp3'
        };
        this.enabled = true;
    }

    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
            const audio = new Audio(this.sounds[soundName]);
            audio.play().catch(e => console.log('Sound error:', e));
        } catch (error) {
            console.log('Sound play failed:', error);
        }
    }
}

// التطبيق الرئيسي - GeoLearn
class GeoLearnApp {
    constructor() {
        this.quizzes = [];
        this.currentLanguage = 'ar';
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.quizStartTime = null;
        this.timer = null;
        this.questionTimer = null;
        this.timeLeft = 15;
        this.isAnswerRevealed = false;
        this.dailyQuizPlayed = false;
        
        // نظام الأصوات
        this.soundManager = new SoundManager();
        
        this.init();
    }

    async init() {
        await this.loadQuizzes();
        this.renderQuizzes();
        this.setupEventListeners();
        this.loadUserProgress();
        this.loadUserPreferences();
        this.setupDailyQuiz();
        
        console.log('GeoLearn App Started! 🚀');
        console.log('Loaded quizzes:', this.quizzes.length);
    }

    // إعداد الكويز اليومي
    setupDailyQuiz() {
        const today = new Date().toDateString();
        const lastPlayed = localStorage.getItem('daily-quiz-date');
        
        if (lastPlayed !== today) {
            localStorage.setItem('daily-quiz-date', today);
            localStorage.setItem('daily-quiz-played', 'false');
        }
        
        this.dailyQuizPlayed = localStorage.getItem('daily-quiz-played') === 'true';
    }

    // تحميل بيانات الكويزات
    async loadQuizzes() {
        const quizIds = [
            'basic_geology', 'petrology', 'hydrogeology', 'geophysics', 'field_work',
            'structural_geo', 'historical_geo', 'environmental_geo', 'mining_geology', 'engineering_geo'
        ];

        for (const quizId of quizIds) {
            try {
                const quiz = await this.loadQuizData(quizId);
                if (quiz) {
                    this.quizzes.push(quiz);
                }
            } catch (error) {
                console.error(`Failed to load quiz: ${quizId}`, error);
            }
        }

        // إضافة كويز يومي
        this.addDailyQuiz();
    }

    async loadQuizData(quizId) {
        try {
            const response = await fetch(`quizzes/${quizId}.json`);
            const quiz = await response.json();
            console.log(`✅ Loaded quiz: ${quizId}`);
            return quiz;
        } catch (error) {
            console.error(`❌ Error loading quiz ${quizId}:`, error);
            return null;
        }
    }

    // إضافة كويز يومي
    addDailyQuiz() {
        const dailyQuiz = {
            id: 'daily_quiz',
            name: {
                ar: 'الكويز اليومي 🏆',
                en: 'Daily Quiz 🏆',
                fr: 'Quiz Quotidien 🏆'
            },
            description: {
                ar: 'اختبر معرفتك اليومية في الجيولوجيا - 10 أسئلة في 150 ثانية!',
                en: 'Test your daily geology knowledge - 10 questions in 150 seconds!',
                fr: 'Testez vos connaissances géologiques quotidiennes - 10 questions en 150 secondes!'
            },
            icon: '🏆',
            level: 'intermediate',
            questions: this.generateDailyQuestions(),
            isDaily: true,
            total_questions: 10,
            passing_score: 70
        };
        
        this.quizzes.unshift(dailyQuiz);
    }

    // توليد أسئلة يومية
    generateDailyQuestions() {
        return [
            {
                id: 1,
                question: {
                    ar: "ما هي الصخرة النارية التي تبرد ببطء تحت سطح الأرض؟",
                    en: "Which igneous rock cools slowly beneath Earth's surface?",
                    fr: "Quelle roche ignée refroidit lentement sous la surface de la Terre?"
                },
                options: [
                    {
                        id: "A",
                        text: { ar: "البازلت", en: "Basalt", fr: "Basalte" },
                        correct: false
                    },
                    {
                        id: "B", 
                        text: { ar: "الجرانيت", en: "Granite", fr: "Granite" },
                        correct: true
                    },
                    {
                        id: "C",
                        text: { ar: "الريوليت", en: "Rhyolite", fr: "Rhyolite" },
                        correct: false
                    }
                ],
                explanation: {
                    ar: "الجرانيت هو صخرة نارية تتكون من تبريد بطيء للصهارة تحت سطح الأرض",
                    en: "Granite is an igneous rock formed by slow cooling of magma beneath Earth's surface",
                    fr: "Le granite est une roche ignée formée par le refroidissement lent du magma sous la surface de la Terre"
                }
            },
            {
                id: 2,
                question: {
                    ar: "أي من هذه الصخور يعتبر صخرة متحولة؟",
                    en: "Which of these rocks is a metamorphic rock?",
                    fr: "Laquelle de ces roches est une roche métamorphique?"
                },
                options: [
                    {
                        id: "A",
                        text: { ar: "الحجر الجيري", en: "Limestone", fr: "Calcaire" },
                        correct: false
                    },
                    {
                        id: "B", 
                        text: { ar: "الرخام", en: "Marble", fr: "Marbre" },
                        correct: true
                    },
                    {
                        id: "C",
                        text: { ar: "البازلت", en: "Basalt", fr: "Basalte" },
                        correct: false
                    }
                ],
                explanation: {
                    ar: "الرخام هو صخرة متحولة تتكون من تحول الحجر الجيري",
                    en: "Marble is a metamorphic rock formed from the transformation of limestone",
                    fr: "Le marbre est une roche métamorphique formée à partir de la transformation du calcaire"
                }
            },
            {
                id: 3,
                type: "true_false",
                question: {
                    ar: "الصخور الرسوبية تتكون من ضغط وتماسك الرواسب",
                    en: "Sedimentary rocks form from compaction and cementation of sediments",
                    fr: "Les roches sédimentaires se forment par compaction et cimentation des sédiments"
                },
                options: [
                    {
                        id: "A",
                        text: { ar: "صح", en: "True", fr: "Vrai" },
                        correct: true
                    },
                    {
                        id: "B", 
                        text: { ar: "خطأ", en: "False", fr: "Faux" },
                        correct: false
                    }
                ],
                explanation: {
                    ar: "نعم، الصخور الرسوبية تتكون من ترسب وتماسك الرواسب بفعل الضغط",
                    en: "Yes, sedimentary rocks form from deposition and cementation of sediments under pressure",
                    fr: "Oui, les roches sédimentaires se forment par dépôt et cimentation des sédiments sous pression"
                }
            },
            {
                id: 4,
                question: {
                    ar: "ما هو المعدن الأكثر وفرة في قشرة الأرض؟",
                    en: "What is the most abundant mineral in Earth's crust?",
                    fr: "Quel est le minéral le plus abondant dans la croûte terrestre?"
                },
                options: [
                    {
                        id: "A",
                        text: { ar: "الكوارتز", en: "Quartz", fr: "Quartz" },
                        correct: false
                    },
                    {
                        id: "B", 
                        text: { ar: "الفلدسبار", en: "Feldspar", fr: "Feldspath" },
                        correct: true
                    },
                    {
                        id: "C",
                        text: { ar: "المايكا", en: "Mica", fr: "Mica" },
                        correct: false
                    }
                ],
                explanation: {
                    ar: "الفلدسبار يشكل حوالي 60% من قشرة الأرض",
                    en: "Feldspar makes up about 60% of Earth's crust",
                    fr: "Le feldspath constitue environ 60% de la croûte terrestre"
                }
            },
            {
                id: 5,
                question: {
                    ar: "أي نوع من الصدوع ينتج عن قوى الشد؟",
                    en: "Which type of fault results from tensional forces?",
                    fr: "Quel type de faille résulte des forces de tension?"
                },
                options: [
                    {
                        id: "A",
                        text: { ar: "الصدع العكسي", en: "Reverse fault", fr: "Faille inverse" },
                        correct: false
                    },
                    {
                        id: "B", 
                        text: { ar: "الصدع العادي", en: "Normal fault", fr: "Faille normale" },
                        correct: true
                    },
                    {
                        id: "C",
                        text: { ar: "الصدع الانزلاقي", en: "Strike-slip fault", fr: "Faille décrochante" },
                        correct: false
                    }
                ],
                explanation: {
                    ar: "الصدع العادي ينتج عن قوى الشد حيث تتحرك الكتلة العلوية للأسفل",
                    en: "Normal fault results from tensional forces where the hanging wall moves downward",
                    fr: "La faille normale résulte des forces de tension où le mur suspendu se déplace vers le bas"
                }
            },
            {
                id: 6,
                type: "true_false",
                question: {
                    ar: "الزلازل تحدث فقط عند حدود الصفائح التكتونية",
                    en: "Earthquakes occur only at tectonic plate boundaries",
                    fr: "Les tremblements de terre se produisent uniquement aux limites des plaques tectoniques"
                },
                options: [
                    {
                        id: "A",
                        text: { ar: "صح", en: "True", fr: "Vrai" },
                        correct: false
                    },
                    {
                        id: "B", 
                        text: { ar: "خطأ", en: "False", fr: "Faux" },
                        correct: true
                    }
                ],
                explanation: {
                    ar: "الزلازل يمكن أن تحدث داخل الصفائح أيضاً وليس فقط عند الحدود",
                    en: "Earthquakes can also occur within plates, not only at boundaries",
                    fr: "Les tremblements de terre peuvent également se produire à l'intérieur des plaques, pas seulement aux limites"
                }
            },
            {
                id: 7,
                question: {
                    ar: "ما هو العصر الجيولوجي الحالي؟",
                    en: "What is the current geological era?",
                    fr: "Quelle est l'ère géologique actuelle?"
                },
                options: [
                    {
                        id: "A",
                        text: { ar: "السينوزوي", en: "Cenozoic", fr: "Cénozoïque" },
                        correct: true
                    },
                    {
                        id: "B", 
                        text: { ar: "الميزوزوي", en: "Mesozoic", fr: "Mésozoïque" },
                        correct: false
                    },
                    {
                        id: "C",
                        text: { ar: "الباليوزوي", en: "Paleozoic", fr: "Paléozoïque" },
                        correct: false
                    }
                ],
                explanation: {
                    ar: "نحن نعيش في حقبة السينوزوي التي بدأت منذ 66 مليون سنة",
                    en: "We live in the Cenozoic era which began 66 million years ago",
                    fr: "Nous vivons dans l'ère Cénozoïque qui a commencé il y a 66 millions d'années"
                }
            },
            {
                id: 8,
                question: {
                    ar: "أي من هذه الطرق تستخدم للكشف عن المياه الجوفية؟",
                    en: "Which of these methods is used for groundwater detection?",
                    fr: "Laquelle de ces méthodes est utilisée pour la détection des eaux souterraines?"
                },
                options: [
                    {
                        id: "A",
                        text: { ar: "المسح المغناطيسي", en: "Magnetic survey", fr: "Étude magnétique" },
                        correct: false
                    },
                    {
                        id: "B", 
                        text: { ar: "المسح الكهربائي", en: "Electrical resistivity", fr: "Résistivité électrique" },
                        correct: true
                    },
                    {
                        id: "C",
                        text: { ar: "المسح الجذبي", en: "Gravity survey", fr: "Étude gravimétrique" },
                        correct: false
                    }
                ],
                explanation: {
                    ar: "المسح الكهربائي يقيس مقاومة التربة والصخور للموصلية الكهربائية، حيث تختلف مقاومة المناطق المشبعة بالمياه",
                    en: "Electrical resistivity measures soil and rock resistance to electrical conductivity, as water-saturated areas have different resistivity",
                    fr: "La résistivité électrique mesure la résistance du sol et des roches à la conductivité électrique, car les zones saturées en eau ont une résistivité différente"
                }
            },
            {
                id: 9,
                type: "true_false",
                question: {
                    ar: "جميع البراكين تثور بشكل متفجر",
                    en: "All volcanoes erupt explosively",
                    fr: "Tous les volcans entrent en éruption de manière explosive"
                },
                options: [
                    {
                        id: "A",
                        text: { ar: "صح", en: "True", fr: "Vrai" },
                        correct: false
                    },
                    {
                        id: "B", 
                        text: { ar: "خطأ", en: "False", fr: "Faux" },
                        correct: true
                    }
                ],
                explanation: {
                    ar: "بعض البراكين تثور بهدوء وتتدفق منها الحمم بشكل سلمي",
                    en: "Some volcanoes erupt quietly with lava flowing peacefully",
                    fr: "Certains volcans entrent en éruption calmement avec de la lave coulant paisiblement"
                }
            },
            {
                id: 10,
                question: {
                    ar: "ما هو الغرض الرئيسي من البوصلة الجيولوجية؟",
                    en: "What is the main purpose of a geological compass?",
                    fr: "Quel est le but principal d'une boussole géologique?"
                },
                options: [
                    {
                        id: "A",
                        text: { ar: "تحديد الشمال فقط", en: "Determining north only", fr: "Déterminer seulement le nord" },
                        correct: false
                    },
                    {
                        id: "B", 
                        text: { ar: "قياس اتجاه وميول الطبقات", en: "Measuring strike and dip of layers", fr: "Mesurer la direction et l'inclinaison des couches" },
                        correct: true
                    },
                    {
                        id: "C",
                        text: { ar: "قياس عمق الآبار", en: "Measuring well depth", fr: "Mesurer la profondeur des puits" },
                        correct: false
                    }
                ],
                explanation: {
                    ar: "البوصلة الجيولوجية مصممة خصيصاً لقياس اتجاه الطبقات (Strike) وميولها (Dip) بدقة",
                    en: "The geological compass is specifically designed to accurately measure the strike (direction) and dip (inclination) of rock layers",
                    fr: "La boussole géologique est spécialement conçue pour mesurer avec précision la direction (strike) et l'inclinaison (dip) des couches rocheuses"
                }
            }
        ];
    }

    // عرض الكويزات في الشبكة
    renderQuizzes() {
        const container = document.getElementById('quizzes-container');
        if (!container) {
            console.error('❌ quizzes-container element not found!');
            return;
        }

        console.log('🎯 Rendering quizzes:', this.quizzes.length);
        
        container.innerHTML = this.quizzes.map(quiz => `
            <div class="quiz-card ${quiz.isDaily ? 'daily-quiz' : ''}" onclick="app.startQuiz('${quiz.id}')">
                ${quiz.isDaily ? '<div class="daily-badge">اليومي</div>' : ''}
                <div class="quiz-icon">${quiz.icon}</div>
                <h3 class="quiz-title">${quiz.name[this.currentLanguage] || quiz.name.ar}</h3>
                <p class="quiz-description">${quiz.description[this.currentLanguage] || quiz.description.ar}</p>
                <div class="quiz-meta">
                    <span>${quiz.total_questions || quiz.questions?.length || 0} أسئلة</span>
                    <span class="quiz-level level-${quiz.level}">${this.getLevelText(quiz.level)}</span>
                </div>
                ${quiz.isDaily && this.dailyQuizPlayed ? '<div style="color: var(--accent-color); margin-top: 10px;">✔️ تم اللعب اليوم</div>' : ''}
            </div>
        `).join('');
    }

    getLevelText(level) {
        const levels = {
            'beginner': 'مبتدئ',
            'intermediate': 'متوسط', 
            'advanced': 'متقدم'
        };
        return levels[level] || level;
    }

    // بدء كويز
    async startQuiz(quizId) {
        this.soundManager.play('click');
        this.currentQuiz = this.quizzes.find(q => q.id === quizId);
        
        if (!this.currentQuiz) {
            alert('الكويز غير موجود');
            return;
        }

        // التحقق من الكويز اليومي
        if (this.currentQuiz.isDaily && this.dailyQuizPlayed) {
            alert('لقد لعبت الكويز اليومي بالفعل! عد غداً 🎯');
            return;
        }

        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.currentQuiz.questions.length).fill(null);
        this.score = 0;
        this.quizStartTime = new Date();
        this.isAnswerRevealed = false;
        
        this.showQuizScreen();
        this.showQuestion();
        this.startQuestionTimer();
    }

    showQuizScreen() {
        document.querySelector('.main-container').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        
        this.renderQuizHeader();
    }

    renderQuizHeader() {
        const totalQuestions = this.currentQuiz.questions.length;
        const quizScreen = document.getElementById('quiz-screen');
        quizScreen.innerHTML = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <button class="back-btn" onclick="app.exitQuiz()">← رجوع</button>
                    <div class="quiz-info">
                        <h2>${this.currentQuiz.name[this.currentLanguage] || this.currentQuiz.name.ar}</h2>
                        <p>${this.currentQuiz.description[this.currentLanguage] || this.currentQuiz.description.ar}</p>
                    </div>
                    <div class="quiz-stats">
                        <div class="stat">السؤال <span id="current-question">1</span> من ${totalQuestions}</div>
                        <div class="stat">النقاط: <span id="current-score">0</span></div>
                        <div class="stat">الوقت المتبقي: <span id="question-timer">15</span> ثانية</div>
                    </div>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" id="quiz-progress"></div>
                </div>
                
                <div class="question-container" id="question-container">
                    <!-- سيتم ملؤها ديناميكياً -->
                </div>
                
                <div class="quiz-navigation">
                    <button class="btn btn-secondary" id="prev-btn" onclick="app.previousQuestion()">السابق</button>
                    <button class="btn btn-primary" id="next-btn" onclick="app.nextQuestion()">التالي</button>
                    <button class="btn btn-success" id="submit-btn" onclick="app.finishQuiz()" style="display: none;">إنهاء الكويز</button>
                </div>
            </div>
        `;
    }

    // مؤقت السؤال (15 ثانية) - الكود المصحح
    startQuestionTimer() {
        // ⬇️⬇️⬇️ التصحيح: إيقاف أي مؤقت سابق أولاً
        this.stopQuestionTimer();
        
        this.timeLeft = 15;
        this.updateQuestionTimer();
        
        this.questionTimer = setInterval(() => {
            this.timeLeft--;
            this.updateQuestionTimer();
            
            if (this.timeLeft <= 5) {
                this.soundManager.play('timer');
            }
            
            if (this.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    updateQuestionTimer() {
        const timerElement = document.getElementById('question-timer');
        if (timerElement) {
            timerElement.textContent = this.timeLeft;
            timerElement.className = `timer ${this.timeLeft <= 5 ? 'warning' : ''}`;
        }
    }

    handleTimeUp() {
        this.stopQuestionTimer();
        this.isAnswerRevealed = true;
        
        // إظهار الإجابة الصحيحة
        this.revealCorrectAnswer();
        
        // الانتقال للسؤال التالي بعد 2 ثانية
        setTimeout(() => {
            if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
                this.nextQuestion();
            } else {
                this.finishQuiz();
            }
        }, 2000);
    }

    stopQuestionTimer() {
        if (this.questionTimer) {
            clearInterval(this.questionTimer);
            this.questionTimer = null;
        }
    }

    revealCorrectAnswer() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const correctOption = question.options.find(opt => opt.correct);
        
        if (correctOption) {
            const correctElement = document.querySelector(`[data-option-id="${correctOption.id}"]`);
            if (correctElement) {
                correctElement.classList.add('correct');
            }
        }
    }

    showQuestion() {
        // ⬇️⬇️⬇️ التصحيح: إيقاف المؤقت قبل عرض السؤال الجديد
        this.stopQuestionTimer();
        this.isAnswerRevealed = false;
        this.timeLeft = 15;
        
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const container = document.getElementById('question-container');
        
        container.innerHTML = `
            <div class="question">
                <h3>${question.question[this.currentLanguage] || question.question.ar}</h3>
                ${question.image ? `<div class="question-image"><img src="${question.image}" alt="Question Image" onerror="this.style.display='none'"></div>` : ''}
                
                <div class="options-container">
                    ${question.options.map(option => `
                        <div class="option" data-option-id="${option.id}" onclick="app.selectOption('${option.id}')">
                            <span class="option-id">${option.id}</span>
                            <span class="option-text">${option.text[this.currentLanguage] || option.text.ar}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.updateNavigation();
        this.updateProgress();
        this.startQuestionTimer();
    }

    selectOption(optionId) {
        if (this.isAnswerRevealed) return;
        
        this.soundManager.play('click');
        // ⬇️⬇️⬇️ التصحيح: إيقاف المؤقت فور اختيار الإجابة
        this.stopQuestionTimer();
        this.isAnswerRevealed = true;
        
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const selectedOption = question.options.find(opt => opt.id === optionId);
        const correctOption = question.options.find(opt => opt.correct);
        
        // تلوين جميع الخيارات
        document.querySelectorAll('.option').forEach(opt => {
            const optId = opt.getAttribute('data-option-id');
            if (optId === correctOption.id) {
                opt.classList.add('correct');
            } else if (optId === optionId && !selectedOption.correct) {
                opt.classList.add('wrong');
            }
        });
        
        // حفظ الإجابة
        this.userAnswers[this.currentQuestionIndex] = optionId;
        
        // تحديث النقاط
        if (selectedOption.correct) {
            this.soundManager.play('correct');
            this.score++;
            this.updateScore();
        } else {
            this.soundManager.play('wrong');
        }
        
        // الانتقال التلقائي بعد 2 ثانية
        setTimeout(() => {
            if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
                this.nextQuestion();
            } else {
                this.finishQuiz();
            }
        }, 2000);
    }

    updateScore() {
        const scoreElement = document.getElementById('current-score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    nextQuestion() {
        this.soundManager.play('click');
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        } else {
            this.finishQuiz();
        }
    }

    previousQuestion() {
        this.soundManager.play('click');
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
        
        if (prevBtn) prevBtn.style.display = this.currentQuestionIndex === 0 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = this.currentQuestionIndex === this.currentQuiz.questions.length - 1 ? 'none' : 'block';
        if (submitBtn) submitBtn.style.display = this.currentQuestionIndex === this.currentQuiz.questions.length - 1 ? 'block' : 'none';
        
        // تحديث رقم السؤال الحالي
        const currentQuestionElement = document.getElementById('current-question');
        if (currentQuestionElement) {
            currentQuestionElement.textContent = this.currentQuestionIndex + 1;
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
        const progressFill = document.getElementById('quiz-progress');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    calculateScore() {
        this.score = 0;
        this.userAnswers.forEach((answer, index) => {
            if (answer) {
                const question = this.currentQuiz.questions[index];
                const selectedOption = question.options.find(opt => opt.id === answer);
                if (selectedOption && selectedOption.correct) {
                    this.score++;
                }
            }
        });
        return this.score;
    }

    async finishQuiz() {
        this.stopQuestionTimer();
        this.soundManager.play('click');
        const finalScore = this.calculateScore();
        const timeSpent = Math.floor((new Date() - this.quizStartTime) / 1000);
        
        // تحديث الكويز اليومي إذا كان daily
        if (this.currentQuiz.isDaily) {
            this.dailyQuizPlayed = true;
            localStorage.setItem('daily-quiz-played', 'true');
        }
        
        await this.showResults(finalScore, timeSpent);
        this.saveProgress(finalScore);
    }

    async showResults(score, timeSpent) {
        const percentage = (score / this.currentQuiz.questions.length) * 100;
        const passingScore = this.currentQuiz.passing_score || 70;
        const passed = percentage >= passingScore;
        
        // تشغيل صوت النجاح
        if (passed) {
            this.soundManager.play('perfect');
        }
        
        document.getElementById('quiz-screen').innerHTML = `
            <div class="results-container">
                <div class="results-header ${passed ? 'passed' : 'failed'}">
                    <div class="result-icon">${passed ? '🎉' : '😔'}</div>
                    <h2>${passed ? 'مبروك! لقد نجحت' : 'حاول مرة أخرى'}</h2>
                    <p>${this.currentQuiz.name[this.currentLanguage] || this.currentQuiz.name.ar}</p>
                </div>
                
                <div class="results-stats">
                    <div class="result-stat">
                        <span class="stat-value">${percentage.toFixed(1)}%</span>
                        <span class="stat-label">النسبة المئوية</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-value">${score}/${this.currentQuiz.questions.length}</span>
                        <span class="stat-label">الإجابات الصحيحة</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-value">${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}</span>
                        <span class="stat-label">الوقت المستغرق</span>
                    </div>
                </div>
                
                <div class="results-actions">
                    <button class="btn btn-primary" onclick="app.restartQuiz()">إعادة الكويز</button>
                    <button class="btn btn-secondary" onclick="app.exitQuiz()">العودة للرئيسية</button>
                </div>
            </div>
        `;
    }

    restartQuiz() {
        this.soundManager.play('click');
        this.startQuiz(this.currentQuiz.id);
    }

    exitQuiz() {
        this.soundManager.play('click');
        this.stopQuestionTimer();
        document.getElementById('quiz-screen').classList.add('hidden');
        document.querySelector('.main-container').classList.remove('hidden');
        this.renderQuizzes(); // تحديث العرض بعد الخروج
        this.currentQuiz = null;
    }

    saveProgress(score) {
        const progress = JSON.parse(localStorage.getItem('quiz-progress') || '{}');
        progress[this.currentQuiz.id] = {
            score: score,
            total: this.currentQuiz.questions.length,
            percentage: (score / this.currentQuiz.questions.length) * 100,
            timestamp: new Date().toISOString(),
            passed: (score / this.currentQuiz.questions.length) * 100 >= (this.currentQuiz.passing_score || 70)
        };
        localStorage.setItem('quiz-progress', JSON.stringify(progress));
        this.loadUserProgress();
    }

    setupEventListeners() {
        // تبديل اللغة
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.soundManager.play('click');
                this.currentLanguage = e.target.value;
                this.renderQuizzes();
            });
        }

        // تبديل الثيم
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.soundManager.play('click');
                this.toggleTheme();
            });
        }

        // التنقل بين الصفحات
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.soundManager.play('click');
                const page = e.currentTarget.getAttribute('data-page');
                this.navigateTo(page);
            });
        });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('preferred-theme', newTheme);
    }

    navigateTo(page) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
    }

    loadUserProgress() {
        const progress = JSON.parse(localStorage.getItem('quiz-progress') || '{}');
        const completed = Object.keys(progress).length;
        const totalScore = Object.values(progress).reduce((sum, p) => sum + p.score, 0);
        const successRate = completed > 0 ? (Object.values(progress).filter(p => p.passed).length / completed * 100) : 0;

        const completedElement = document.getElementById('completed-quizzes');
        const totalScoreElement = document.getElementById('total-score');
        const successRateElement = document.getElementById('success-rate');

        if (completedElement) completedElement.textContent = completed;
        if (totalScoreElement) totalScoreElement.textContent = totalScore;
        if (successRateElement) successRateElement.textContent = `${successRate.toFixed(1)}%`;
    }

    loadUserPreferences() {
        // تحميل الثيم
        const savedTheme = localStorage.getItem('preferred-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // تحميل اللغة
        const savedLanguage = localStorage.getItem('preferred-language') || 'ar';
        this.currentLanguage = savedLanguage;
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = savedLanguage;
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GeoLearnApp();
    window.app = app;
});

// وظائف مساعدة global
function startQuiz(quizId) {
    if (window.app) {
        window.app.startQuiz(quizId);
    }
}