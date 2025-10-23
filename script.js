// GeoReady Quiz Application - النسخة الاحترافية المبتكرة
class GeoReady {
    constructor() {
        // الإعدادات الأساسية
        this.settings = {
            defaultTimer: 20,
            maxQuestions: 25,
            storageKey: 'GeoReady_scores',
            sounds: {
                correct: 'sounds/correct.mp3',
                wrong: 'sounds/wrong.mp3',
                timeout: 'sounds/timeout.mp3'
            }
        };
        
        // حالة التطبيق
        this.state = {
            currentScreen: 'start-screen',
            language: 'ar',
            questionBanks: {},
            currentBank: null,
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            userAnswers: [],
            timer: null,
            timeLeft: this.settings.defaultTimer,
            totalTime: this.settings.defaultTimer,
            quizSession: null,
            soundEnabled: true,
            soundsLoaded: false
        };
        
        // تهيئة التطبيق
        this.initializeApp();
    }
    
    /**
     * تهيئة التطبيق وربط الأحداث
     */
    initializeApp() {
        this.createParticles();
        this.bindEvents();
        this.updateLanguageElements();
        this.loadQuestionBanks();
        this.loadTopScores();
        this.setupAccessibility();
        
        console.log('🚀 GeoReady Application Initialized');
    }
    
    /**
     * إنشاء تأثير الجسيمات في الخلفية
     */
    createParticles() {
        const container = document.getElementById('particles');
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // إعدادات عشوائية للجسيمات
            const size = Math.random() * 6 + 2;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const delay = Math.random() * 6;
            const duration = Math.random() * 4 + 4;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            container.appendChild(particle);
        }
    }
    
    /**
     * ربط جميع أحداث التطبيق
     */
    bindEvents() {
        // أزرار التنقل بين الشاشات
        document.getElementById('start-btn').addEventListener('click', () => {
            this.initializeSounds();
            this.showScreen('category-screen');
        });
        
        document.getElementById('back-to-start').addEventListener('click', () => this.showScreen('start-screen'));
        document.getElementById('back-to-categories').addEventListener('click', () => this.showScreen('category-screen'));
        document.getElementById('back-to-categories-from-results').addEventListener('click', () => this.showScreen('category-screen'));
        document.getElementById('back-to-results').addEventListener('click', () => this.showScreen('results-screen'));
        document.getElementById('new-quiz').addEventListener('click', () => this.showScreen('category-screen'));
        document.getElementById('finish-review').addEventListener('click', () => this.showScreen('results-screen'));
        
        // أزرار تبديل اللغة
        document.getElementById('language-toggle').addEventListener('click', () => this.toggleLanguage());
        document.getElementById('language-toggle-2').addEventListener('click', () => this.toggleLanguage());
        document.getElementById('language-toggle-3').addEventListener('click', () => this.toggleLanguage());
        
        // التحكم في الصوت
        document.getElementById('sound-toggle').addEventListener('click', () => this.toggleSound());
        
        // أحداث النتائج
        document.getElementById('review-mistakes').addEventListener('click', () => this.showReviewScreen());
        document.getElementById('share-results').addEventListener('click', () => this.shareResults());
        
        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        console.log('✅ جميع الأحداث مربوطة بنجاح');
    }
    
    /**
     * إعداد إمكانية الوصول
     */
    setupAccessibility() {
        // إضافة ARIA labels للعناصر المهمة
        const elements = [
            { id: 'start-btn', label: 'بدء التحدي' },
            { id: 'sound-toggle', label: 'تشغيل أو كتم الصوت' },
            { id: 'back-to-start', label: 'العودة إلى الصفحة الرئيسية' }
        ];
        
        elements.forEach(({ id, label }) => {
            const element = document.getElementById(id);
            if (element) {
                element.setAttribute('aria-label', label);
            }
        });
    }
    
    /**
     * تهيئة ملفات الصوت بعد التفاعل الأول
     */
    initializeSounds() {
        if (this.state.soundsLoaded) return;
        
        try {
            const correctSound = document.getElementById('correct-sound');
            const wrongSound = document.getElementById('wrong-sound');
            const timeoutSound = document.getElementById('timeout-sound');
            
            correctSound.src = this.settings.sounds.correct;
            wrongSound.src = this.settings.sounds.wrong;
            timeoutSound.src = this.settings.sounds.timeout;
            
            // تحميل الصوت مسبقاً
            correctSound.load();
            wrongSound.load();
            timeoutSound.load();
            
            this.state.soundsLoaded = true;
            console.log('🔊 تم تحميل ملفات الصوت بنجاح');
        } catch (error) {
            console.warn('⚠️ تعذر تحميل ملفات الصوت:', error);
        }
    }
    
    /**
     * تبديل اللغة بين العربية والإنجليزية
     */
    toggleLanguage() {
        this.state.language = this.state.language === 'ar' ? 'en' : 'ar';
        document.documentElement.dir = this.state.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.state.language;
        this.updateLanguageElements();
        
        console.log(`🌐 تم تبديل اللغة إلى: ${this.state.language}`);
    }
    
    /**
     * تبديل حالة الصوت
     */
    toggleSound() {
        this.state.soundEnabled = !this.state.soundEnabled;
        const soundButton = document.getElementById('sound-toggle');
        const icon = soundButton.querySelector('i');
        
        if (this.state.soundEnabled) {
            icon.className = 'fas fa-volume-up';
            soundButton.setAttribute('aria-label', 'كتم الصوت');
        } else {
            icon.className = 'fas fa-volume-mute';
            soundButton.setAttribute('aria-label', 'تشغيل الصوت');
        }
        
        console.log(`🔊 حالة الصوت: ${this.state.soundEnabled ? 'مفعل' : 'مكتوم'}`);
    }
    
    /**
     * تحديث جميع العناصر حسب اللغة المحددة
     */
    updateLanguageElements() {
        const elements = document.querySelectorAll('[data-ar], [data-en]');
        
        elements.forEach(element => {
            const text = this.state.language === 'ar' ? 
                element.getAttribute('data-ar') : 
                element.getAttribute('data-en');
            
            if (text) {
                if (element.tagName === 'INPUT' && element.type === 'button') {
                    element.value = text;
                } else {
                    element.textContent = text;
                }
            }
        });
        
        // تحديث أزرار اللغة
        const langButtons = document.querySelectorAll('.btn-lang');
        langButtons.forEach(btn => {
            btn.textContent = this.state.language === 'ar' ? 'EN' : 'AR';
        });
    }
    
    /**
     * تحميل بنوك الأسئلة من ملفات JSON
     */
    async loadQuestionBanks() {
        const bankFiles = [
            'BasicGeology.json',
            'Geochemistry.json',
            'Geophysics.json',
            'Hydrogeology.json',
            'Petrology.json',
            'Structuralgeology.json',
            'sedimentarygeology.json'
        ];
        
        const categoryGrid = document.getElementById('category-grid');
        categoryGrid.innerHTML = this.createLoadingElement();
        
        let loadedCount = 0;
        const totalBanks = bankFiles.length;
        
        for (const file of bankFiles) {
            try {
                console.log(`📥 جاري تحميل ${file}...`);
                
                const response = await fetch(file);
                if (!response.ok) {
                    throw new Error(`خطأ HTTP! الحالة: ${response.status}`);
                }
                
                const questions = await response.json();
                
                // التحقق من صحة هيكل JSON
                if (!Array.isArray(questions)) {
                    throw new Error('ملف JSON يجب أن يكون مصفوفة');
                }
                
                // التحقق من وجود الأسئلة والخيارات
                const validQuestions = questions.filter(q => 
                    q.question && 
                    q.options && 
                    typeof q.options === 'object' &&
                    q.answer && 
                    ['أ', 'ب', 'ج', 'د'].includes(q.answer)
                );
                
                if (validQuestions.length === 0) {
                    throw new Error('لا توجد أسئلة صالحة في الملف');
                }
                
                this.state.questionBanks[file] = validQuestions;
                loadedCount++;
                
                console.log(`✅ تم تحميل ${file} بنجاح (${validQuestions.length} سؤال)`);
                
            } catch (error) {
                console.error(`❌ خطأ في تحميل ${file}:`, error);
                this.state.questionBanks[file] = this.createSampleQuestions(file);
            }
        }
        
        // عرض الفئات بعد تحميل جميع الملفات
        this.displayCategories();
        console.log(`🎉 تم تحميل ${loadedCount} من ${totalBanks} ملف بنجاح`);
    }
    
    /**
     * إنشاء عنصر التحميل
     */
    createLoadingElement() {
        return `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span data-ar="جاري تحميل الأسئلة..." data-en="Loading questions...">جاري تحميل الأسئلة...</span>
            </div>
        `;
    }
    
    /**
     * إنشاء أسئلة تجريبية في حالة فشل التحميل
     */
    createSampleQuestions(fileName) {
        const categoryName = this.getCategoryName(fileName);
        
        return [
            {
                id: 1,
                question: this.state.language === 'ar' ? 
                    `ما هي الخصائص الرئيسية للصخور في مجال ${categoryName}؟` :
                    `What are the main characteristics of rocks in ${categoryName} field?`,
                options: {
                    "أ": this.state.language === 'ar' ? 'التركيب الكيميائي والنسيج' : 'Chemical composition and texture',
                    "ب": this.state.language === 'ar' ? 'اللون والوزن فقط' : 'Color and weight only',
                    "ج": this.state.language === 'ar' ? 'درجة الحرارة والضغط' : 'Temperature and pressure',
                    "د": this.state.language === 'ar' ? 'العمر والموقع' : 'Age and location'
                },
                answer: "أ",
                explain: this.state.language === 'ar' ? 
                    'التركيب الكيميائي والنسيج هما من أهم خصائص الصخور التي تحدد تصنيفها وسلوكها' :
                    'Chemical composition and texture are among the most important rock characteristics that determine their classification and behavior'
            },
            {
                id: 2,
                question: this.state.language === 'ar' ? 
                    `كيف تتشكل المعادن في بيئة ${categoryName}؟` :
                    `How do minerals form in ${categoryName} environment?`,
                options: {
                    "أ": this.state.language === 'ar' ? 'عن طريق التبلور من الصهارة أو المحاليل' : 'By crystallization from magma or solutions',
                    "ب": this.state.language === 'ar' ? 'عن طريق الترسيب المباشر من الهواء' : 'By direct precipitation from air',
                    "ج": this.state.language === 'ar' ? 'عن طريق التحول الكهربائي' : 'By electrical transformation',
                    "د": this.state.language === 'ar' ? 'عن طريق التكثيف الكيميائي' : 'By chemical condensation'
                },
                answer: "أ",
                explain: this.state.language === 'ar' ? 
                    'تتشكل المعادن primarily through crystallization from molten magma or from aqueous solutions' :
                    'Minerals form primarily through crystallization from molten magma or from aqueous solutions'
            }
        ];
    }
    
    /**
     * عرض الفئات في الواجهة
     */
    displayCategories() {
        const categoryGrid = document.getElementById('category-grid');
        categoryGrid.innerHTML = '';
        
        Object.keys(this.state.questionBanks).forEach(file => {
            const questions = this.state.questionBanks[file];
            const categoryCard = this.createCategoryCard(file, questions);
            categoryGrid.appendChild(categoryCard);
        });
        
        // إضافة خيار عشوائي
        const randomCard = this.createRandomCategoryCard();
        categoryGrid.appendChild(randomCard);
    }
    
    /**
     * إنشاء بطاقة الفئة
     */
    createCategoryCard(fileName, questions) {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.addEventListener('click', () => this.selectBank(fileName));
        categoryCard.setAttribute('role', 'button');
        categoryCard.setAttribute('tabindex', '0');
        
        const categoryName = this.getCategoryName(fileName);
        const questionCount = questions.length;
        
        categoryCard.innerHTML = `
            <h3>${categoryName}</h3>
            <p data-ar="مجال متخصص في علوم الأرض" data-en="Specialized field in Earth sciences">
                ${this.state.language === 'ar' ? 'مجال متخصص في علوم الأرض' : 'Specialized field in Earth sciences'}
            </p>
            <div class="category-badge">${questionCount} ${this.state.language === 'ar' ? 'سؤال' : 'questions'}</div>
        `;
        
        // إضافة حدث Enter للوصول بلوحة المفاتيح
        categoryCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                this.selectBank(fileName);
            }
        });
        
        return categoryCard;
    }
    
    /**
     * إنشاء بطاقة الفئة العشوائية
     */
    createRandomCategoryCard() {
        const randomCard = document.createElement('div');
        randomCard.className = 'category-card random-card';
        randomCard.addEventListener('click', () => this.selectRandomBank());
        randomCard.setAttribute('role', 'button');
        randomCard.setAttribute('tabindex', '0');
        
        randomCard.innerHTML = `
            <h3>${this.state.language === 'ar' ? 'عشوائي' : 'Random'}</h3>
            <p data-ar="مزيج من الأسئلة من جميع المجالات" data-en="Mix of questions from all fields">
                ${this.state.language === 'ar' ? 'مزيج من الأسئلة من جميع المجالات' : 'Mix of questions from all fields'}
            </p>
            <div class="category-badge">${this.state.language === 'ar' ? 'مختلط' : 'Mixed'}</div>
        `;
        
        randomCard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                this.selectRandomBank();
            }
        });
        
        return randomCard;
    }
    
    /**
     * الحصول على اسم الفئة من اسم الملف
     */
    getCategoryName(fileName) {
        const name = fileName.replace('.json', '');
        // تحويل camelCase إلى مسافات وإضافة فواصل
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
    
    /**
     * اختيار بنك أسئلة محدد
     */
    selectBank(bankName) {
        this.state.currentBank = bankName;
        const questions = this.state.questionBanks[bankName];
        
        this.startSession({
            questions: questions,
            category: this.getCategoryName(bankName)
        });
        
        console.log(`🎯 تم اختيار الفئة: ${this.getCategoryName(bankName)}`);
    }
    
    /**
     * اختيار أسئلة عشوائية من جميع الفئات
     */
    selectRandomBank() {
        const allQuestions = Object.values(this.state.questionBanks).flat();
        const shuffledQuestions = this.shuffleQuestions([...allQuestions]);
        
        this.startSession({
            questions: shuffledQuestions,
            category: this.state.language === 'ar' ? 'عشوائي' : 'Random'
        });
        
        console.log('🎲 تم اختيار الوضع العشوائي');
    }
    
    /**
     * بدء جلسة اختبار جديدة
     */
    startSession(options) {
        // إعداد جلسة الاختبار
        this.state.quizSession = {
            id: Date.now(),
            category: options.category,
            date: new Date().toISOString(),
            settings: {
                totalQuestions: options.questions.length,
                questionCount: document.getElementById('question-count').value,
                shuffleOptions: document.getElementById('shuffle-options').checked
            }
        };
        
        // تحديد عدد الأسئلة
        let selectedQuestions = options.questions;
        if (this.state.quizSession.settings.questionCount !== 'all') {
            const count = parseInt(this.state.quizSession.settings.questionCount);
            selectedQuestions = options.questions.slice(0, Math.min(count, this.settings.maxQuestions));
        }
        
        // إعادة تعيين حالة الاختبار
        this.state.questions = selectedQuestions;
        this.state.currentQuestionIndex = 0;
        this.state.score = 0;
        this.state.userAnswers = [];
        this.state.totalTime = this.settings.defaultTimer;
        this.state.timeLeft = this.state.totalTime;
        
        // الانتقال إلى شاشة الاختبار
        this.showScreen('quiz-screen');
        this.updateQuizHeader();
        this.loadQuestion();
        
        console.log(`🚀 بدء جلسة جديدة: ${options.category} (${selectedQuestions.length} سؤال)`);
    }
    
    /**
     * خلط الأسئلة
     */
    shuffleQuestions(questions) {
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        return questions;
    }
    
    /**
     * خلط خيارات السؤال
     */
    shuffleOptions(options) {
        const entries = Object.entries(options);
        for (let i = entries.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [entries[i], entries[j]] = [entries[j], entries[i]];
        }
        return Object.fromEntries(entries);
    }
    
    /**
     * تحميل السؤال الحالي
     */
    loadQuestion() {
        // التحقق من انتهاء الأسئلة
        if (this.state.currentQuestionIndex >= this.state.questions.length) {
            this.showResults();
            return;
        }
        
        const question = this.state.questions[this.state.currentQuestionIndex];
        const optionsContainer = document.getElementById('options-container');
        const questionText = document.getElementById('question-text');
        
        // عرض السؤال
        questionText.textContent = question.question;
        
        // إعداد الخيارات
        optionsContainer.innerHTML = '';
        
        // خلط الخيارات إذا كان مفعلاً
        let displayOptions = question.options;
        if (this.state.quizSession.settings.shuffleOptions) {
            displayOptions = this.shuffleOptions(question.options);
        }
        
        // إنشاء عناصر الخيارات
        Object.entries(displayOptions).forEach(([key, text], index) => {
            const optionElement = this.createOptionElement(key, text, index + 1);
            optionsContainer.appendChild(optionElement);
        });
        
        // تحديث واجهة الاختبار
        this.updateProgressBar();
        this.updateScoreDisplay();
        
        // بدء المؤقت
        this.startTimer();
        
        console.log(`📝 تحميل السؤال ${this.state.currentQuestionIndex + 1} من ${this.state.questions.length}`);
    }
    
    /**
     * إنشاء عنصر الخيار
     */
    createOptionElement(key, text, number) {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.dataset.key = key;
        optionElement.setAttribute('role', 'button');
        optionElement.setAttribute('tabindex', '0');
        optionElement.setAttribute('aria-label', `${key}: ${text}`);
        
        optionElement.innerHTML = `
            <span class="option-text">${text}</span>
            <span class="option-key">${key}</span>
        `;
        
        optionElement.addEventListener('click', () => this.selectAnswer(key));
        optionElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                this.selectAnswer(key);
            }
        });
        
        return optionElement;
    }
    
    /**
     * اختيار إجابة
     */
    selectAnswer(selectedKey) {
        // إيقاف المؤقت
        this.stopTimer();
        
        const question = this.state.questions[this.state.currentQuestionIndex];
        const isCorrect = selectedKey === question.answer;
        const options = document.querySelectorAll('.option');
        
        // تسجيل إجابة المستخدم
        this.state.userAnswers.push({
            questionIndex: this.state.currentQuestionIndex,
            selectedKey,
            isCorrect,
            question: question,
            timestamp: new Date().toISOString()
        });
        
        // تحديث النتيجة
        if (isCorrect) {
            this.state.score++;
            this.playSound('correct');
        } else {
            this.playSound('wrong');
        }
        
        // تحديث واجهة الخيارات
        this.highlightAnswer(options, question.answer, selectedKey, isCorrect);
        
        // الانتقال للسؤال التالي بعد تأخير
        setTimeout(() => {
            this.nextQuestion();
        }, 1500);
        
        console.log(`🎯 إجابة: ${selectedKey} | ${isCorrect ? 'صحيح' : 'خطأ'} | السؤال: ${this.state.currentQuestionIndex + 1}`);
    }
    
    /**
     * تلوين الإجابة الصحيحة والخاطئة - الإصدار المصحح
     */
    highlightAnswer(options, correctKey, selectedKey, isCorrect) {
        options.forEach(option => {
            const optionKey = option.dataset.key;
            option.style.pointerEvents = 'none';
            
            // إزالة أي ألوان سابقة
            option.classList.remove('correct', 'incorrect');
            
            // تلوين الإجابة الصحيحة دائماً بالأخضر
            if (optionKey === correctKey) {
                option.classList.add('correct');
            }
            
            // تلوين الإجابة المختارة الخاطئة بالأحمر
            if (optionKey === selectedKey && !isCorrect) {
                option.classList.add('incorrect');
            }
        });
    }
    
    /**
     * الانتقال للسؤال التالي
     */
    nextQuestion() {
        this.state.currentQuestionIndex++;
        this.loadQuestion();
    }
    
    /**
     * بدء المؤقت
     */
    startTimer() {
        this.state.timeLeft = this.state.totalTime;
        this.updateTimerDisplay();
        
        this.state.timer = setInterval(() => {
            this.state.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.state.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }
    
    /**
     * إيقاف المؤقت
     */
    stopTimer() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
    }
    
    /**
     * تحديث عرض المؤقت
     */
    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        const timerFill = document.querySelector('.timer-fill');
        
        if (timerElement && timerFill) {
            timerElement.textContent = this.state.timeLeft;
            
            // حساب نسبة المؤقت
            const percentage = (this.state.timeLeft / this.state.totalTime) * 100;
            const circumference = 2 * Math.PI * 27;
            const offset = circumference - (percentage / 100) * circumference;
            
            timerFill.style.strokeDashoffset = offset;
            
            // تغيير اللون حسب الوقت المتبقي
            timerElement.className = 'timer-text';
            timerFill.className = 'timer-fill';
            
            if (this.state.timeLeft <= 5) {
                timerElement.classList.add('danger');
                timerFill.classList.add('danger');
            } else if (this.state.timeLeft <= 10) {
                timerElement.classList.add('warning');
                timerFill.classList.add('warning');
            }
        }
    }
    
    /**
     * التعامل مع انتهاء الوقت
     */
    handleTimeout() {
        this.stopTimer();
        this.playSound('timeout');
        
        const question = this.state.questions[this.state.currentQuestionIndex];
        const options = document.querySelectorAll('.option');
        
        // تسجيل إجابة خاطئة بسبب انتهاء الوقت
        this.state.userAnswers.push({
            questionIndex: this.state.currentQuestionIndex,
            selectedKey: null,
            isCorrect: false,
            question: question,
            timeout: true,
            timestamp: new Date().toISOString()
        });
        
        // عرض الإجابة الصحيحة فقط
        options.forEach(option => {
            const optionKey = option.dataset.key;
            option.style.pointerEvents = 'none';
            
            // إزالة أي ألوان سابقة
            option.classList.remove('correct', 'incorrect');
            
            // تلوين الإجابة الصحيحة بالأخضر
            if (optionKey === question.answer) {
                option.classList.add('correct');
            }
        });
        
        // الانتقال للسؤال التالي بعد تأخير
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
        
        console.log(`⏰ انتهى الوقت للسؤال ${this.state.currentQuestionIndex + 1}`);
    }
    
    /**
     * تحديث شريط التقدم
     */
    updateProgressBar() {
        const progress = (this.state.currentQuestionIndex / this.state.questions.length) * 100;
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('quiz-progress');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            const text = this.state.language === 'ar' ? 
                `السؤال ${this.state.currentQuestionIndex + 1} من ${this.state.questions.length}` :
                `Question ${this.state.currentQuestionIndex + 1} of ${this.state.questions.length}`;
            progressText.textContent = text;
        }
    }
    
    /**
     * تحديث عرض النتيجة
     */
    updateScoreDisplay() {
        const scoreElement = document.getElementById('current-score');
        if (scoreElement) {
            scoreElement.textContent = this.state.score;
        }
    }
    
    /**
     * تحديث رأس الاختبار
     */
    updateQuizHeader() {
        const categoryElement = document.getElementById('quiz-category');
        if (categoryElement && this.state.quizSession) {
            categoryElement.textContent = this.state.quizSession.category;
        }
    }
    
    /**
     * عرض النتائج النهائية
     */
    showResults() {
        // حساب النتائج
        const totalQuestions = this.state.questions.length;
        const percentage = Math.round((this.state.score / totalQuestions) * 100);
        
        // تحديث جلسة الاختبار
        this.state.quizSession.score = this.state.score;
        this.state.quizSession.totalQuestions = totalQuestions;
        this.state.quizSession.percentage = percentage;
        
        // حفظ النتيجة
        this.saveScore();
        
        // تحديث واجهة النتائج
        this.updateResultsDisplay();
        
        // الانتقال لشاشة النتائج
        this.showScreen('results-screen');
        
        console.log(`🏁 انتهى الاختبار | النتيجة: ${this.state.score}/${totalQuestions} (${percentage}%)`);
    }
    
    /**
     * تحديث عرض النتائج
     */
    updateResultsDisplay() {
        const percentage = this.state.quizSession.percentage;
        const totalQuestions = this.state.quizSession.totalQuestions;
        
        // تحديث النسبة المئوية
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        document.getElementById('score-percentage-text').textContent = `${percentage}%`;
        
        // تحديث الإحصائيات
        document.getElementById('correct-answers').textContent = this.state.score;
        document.getElementById('total-questions').textContent = totalQuestions;
        
        // تحديث دائرة النتيجة
        this.updateScoreRing(percentage);
        
        // تحديث اللقب
        this.updateScoreTitle(percentage);
        
        // تحديث أفضل النتائج
        this.displayTopScores();
    }
    
    /**
     * تحديث الدائرة البيانية للنتيجة
     */
    updateScoreRing(percentage) {
        const scoreRing = document.getElementById('score-ring');
        if (scoreRing) {
            const circumference = 2 * Math.PI * 65;
            const offset = circumference - (percentage / 100) * circumference;
            
            scoreRing.style.strokeDasharray = circumference;
            scoreRing.style.strokeDashoffset = offset;
            
            // إضافة انتقال سلس
            setTimeout(() => {
                scoreRing.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
            }, 100);
        }
    }
    
    /**
     * تحديث اللقب بناءً على النسبة
     */
    updateScoreTitle(percentage) {
        const titleElement = document.getElementById('score-title');
        let title = '';
        
        if (percentage >= 90) {
            title = this.state.language === 'ar' ? 'جيولوجي فائق' : 'Super Geologist';
        } else if (percentage >= 70) {
            title = this.state.language === 'ar' ? 'جيولوجي ميداني محترف' : 'Professional Field Geologist';
        } else if (percentage >= 50) {
            title = this.state.language === 'ar' ? 'مستكشف الطبقات' : 'Layer Explorer';
        } else {
            title = this.state.language === 'ar' ? 'مبتدئ في الميدان' : 'Field Beginner';
        }
        
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
    
    /**
     * حفظ النتيجة في localStorage
     */
    saveScore() {
        try {
            const scores = this.getTopScores();
            scores.push(this.state.quizSession);
            
            // ترتيب النتائج تنازلياً
            scores.sort((a, b) => b.percentage - a.percentage);
            
            // الاحتفاظ بأفضل 5 نتائج فقط
            const topScores = scores.slice(0, 5);
            
            // الحفظ في localStorage
            localStorage.setItem(this.settings.storageKey, JSON.stringify(topScores));
            
            console.log('💾 تم حفظ النتيجة بنجاح');
        } catch (error) {
            console.error('❌ خطأ في حفظ النتيجة:', error);
        }
    }
    
    /**
     * الحصول على أفضل النتائج من localStorage
     */
    getTopScores() {
        try {
            const stored = localStorage.getItem(this.settings.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('❌ خطأ في تحميل النتائج:', error);
            return [];
        }
    }
    
    /**
     * عرض أفضل النتائج
     */
    displayTopScores() {
        const scores = this.getTopScores();
        const scoresList = document.getElementById('top-scores-list');
        
        if (!scoresList) return;
        
        scoresList.innerHTML = '';
        
        if (scores.length === 0) {
            scoresList.innerHTML = `
                <div class="score-item">
                    <span data-ar="لا توجد نتائج سابقة" data-en="No previous scores">
                        ${this.state.language === 'ar' ? 'لا توجد نتائج سابقة' : 'No previous scores'}
                    </span>
                </div>
            `;
            return;
        }
        
        scores.forEach((score, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            
            const date = new Date(score.date).toLocaleDateString(
                this.state.language === 'ar' ? 'ar-SA' : 'en-US'
            );
            
            scoreItem.innerHTML = `
                <div class="score-item-info">
                    <span class="score-item-category">${score.category}</span>
                    <span class="score-item-date">${date}</span>
                </div>
                <div class="score-item-value">${score.percentage}%</div>
            `;
            
            scoresList.appendChild(scoreItem);
        });
    }
    
    /**
     * تحميل أفضل النتائج
     */
    loadTopScores() {
        this.displayTopScores();
    }
    
    /**
     * عرض شاشة مراجعة الأخطاء
     */
    showReviewScreen() {
        const mistakesContainer = document.getElementById('mistakes-container');
        if (!mistakesContainer) return;
        
        mistakesContainer.innerHTML = '';
        
        // تصفية الأسئلة الخاطئة
        const wrongAnswers = this.state.userAnswers.filter(answer => !answer.isCorrect);
        
        if (wrongAnswers.length === 0) {
            mistakesContainer.innerHTML = `
                <div class="mistake-item">
                    <p data-ar="🎉 لا توجد أخطاء لمراجعتها! لقد أديت بشكل ممتاز." data-en="🎉 No mistakes to review! You did excellent.">
                        ${this.state.language === 'ar' ? '🎉 لا توجد أخطاء لمراجعتها! لقد أديت بشكل ممتاز.' : '🎉 No mistakes to review! You did excellent.'}
                    </p>
                </div>
            `;
            return;
        }
        
        // عرض كل سؤال خاطئ
        wrongAnswers.forEach((answer, index) => {
            const mistakeItem = this.createMistakeItem(answer, index);
            mistakesContainer.appendChild(mistakeItem);
        });
        
        this.showScreen('review-screen');
        
        console.log(`📖 عرض ${wrongAnswers.length} سؤال خاطئ للمراجعة`);
    }
    
    /**
     * إنشاء عنصر الخطأ للمراجعة
     */
    createMistakeItem(answer, index) {
        const question = answer.question;
        const mistakeItem = document.createElement('div');
        mistakeItem.className = 'mistake-item';
        
        let optionsHtml = '';
        Object.entries(question.options).forEach(([key, text]) => {
            let optionClass = '';
            if (key === question.answer) {
                optionClass = 'correct';
            } else if (key === answer.selectedKey) {
                optionClass = 'incorrect';
            }
            
            optionsHtml += `
                <div class="mistake-option ${optionClass}">
                    <strong>${key}.</strong> ${text}
                </div>
            `;
        });
        
        const explanation = question.explain || 
            (this.state.language === 'ar' ? 
                'لا يوجد شرح متاح لهذا السؤال.' : 
                'No explanation available for this question.');
        
        const timeoutText = answer.timeout ? 
            (this.state.language === 'ar' ? ' ⏰ (انتهى الوقت)' : ' ⏰ (Time out)') : '';
        
        mistakeItem.innerHTML = `
            <div class="mistake-question">
                <strong>${index + 1}.</strong> ${question.question}${timeoutText}
            </div>
            <div class="mistake-options">
                ${optionsHtml}
            </div>
            <div class="mistake-explanation">
                <strong>${this.state.language === 'ar' ? 'الشرح:' : 'Explanation:'}</strong> 
                ${explanation}
            </div>
        `;
        
        return mistakeItem;
    }
    
    /**
     * مشاركة النتائج
     */
    async shareResults() {
        const shareData = {
            title: this.state.language === 'ar' ? 'نتيجة تحدى GeoReady' : 'GeoReady Challenge Result',
            text: this.state.language === 'ar' ? 
                `حصلت على ${this.state.quizSession.percentage}% في تحدى ${this.state.quizSession.category} على GeoReady!` :
                `I scored ${this.state.quizSession.percentage}% in the ${this.state.quizSession.category} challenge on GeoReady!`,
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                console.log('📤 تم مشاركة النتائج بنجاح');
            } else {
                await this.copyToClipboard(shareData);
            }
        } catch (error) {
            console.log('❌ تم إلغاء المشاركة أو حدث خطأ:', error);
        }
    }
    
    /**
     * نسخ النتائج إلى الحافظة
     */
    async copyToClipboard(shareData) {
        const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        
        try {
            await navigator.clipboard.writeText(text);
            
            // عرض رسالة نجاح
            alert(this.state.language === 'ar' ? 
                '✅ تم نسخ النتائج إلى الحافظة!' : 
                '✅ Results copied to clipboard!');
                
            console.log('📋 تم نسخ النتائج إلى الحافظة');
        } catch (error) {
            // طريقة بديلة للمتصفحات القديمة
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            alert(this.state.language === 'ar' ? 
                '✅ تم نسخ النتائج إلى الحافظة!' : 
                '✅ Results copied to clipboard!');
        }
    }
    
    /**
     * تشغيل الصوت
     */
    playSound(type) {
        if (!this.state.soundEnabled || !this.state.soundsLoaded) return;
        
        try {
            const sound = document.getElementById(`${type}-sound`);
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(error => {
                    console.warn('⚠️ تعذر تشغيل الصوت:', error);
                });
            }
        } catch (error) {
            console.warn('⚠️ خطأ في تشغيل الصوت:', error);
        }
    }
    
    /**
     * التعامل مع أحداث لوحة المفاتيح
     */
    handleKeydown(e) {
        // منع السلوك الافتراضي للأزرار المهمة
        if (['1', '2', '3', '4', 'Enter', 's', 'S', 'Escape'].includes(e.key)) {
            e.preventDefault();
        }
        
        // شاشة الاختبار
        if (this.state.currentScreen === 'quiz-screen') {
            this.handleQuizKeyboard(e);
        }
        
        // شاشة البداية
        if (this.state.currentScreen === 'start-screen' && (e.key === 's' || e.key === 'S')) {
            this.initializeSounds();
            this.showScreen('category-screen');
        }
        
        // زر الخروج
        if (e.key === 'Escape') {
            this.handleEscapeKey();
        }
    }
    
    /**
     * التعامل مع أزرار لوحة المفاتيح في شاشة الاختبار
     */
    handleQuizKeyboard(e) {
        const options = document.querySelectorAll('.option');
        
        switch (e.key) {
            case '1':
            case '2':
            case '3':
            case '4':
                const index = parseInt(e.key) - 1;
                if (options[index]) {
                    const selectedKey = options[index].dataset.key;
                    this.selectAnswer(selectedKey);
                }
                break;
                
            case 'Enter':
                // يمكن استخدام Enter للانتقال إذا كان هناك زر تأكيد
                break;
        }
    }
    
    /**
     * التعامل مع زر Escape
     */
    handleEscapeKey() {
        switch (this.state.currentScreen) {
            case 'quiz-screen':
                this.showScreen('category-screen');
                break;
            case 'category-screen':
                this.showScreen('start-screen');
                break;
            case 'results-screen':
            case 'review-screen':
                this.showScreen('category-screen');
                break;
        }
    }
    
    /**
     * تبديل الشاشات
     */
    showScreen(screenId) {
        // إيقاف المؤقت إذا كان نشطاً
        this.stopTimer();
        
        // إخفاء جميع الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // إظهار الشاشة المطلوبة
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.state.currentScreen = screenId;
            
            // التركيز على العنصر الأول للوصول
            this.focusFirstElement(targetScreen);
        }
        
        // تحديث بيانات اللغة
        this.updateLanguageElements();
        
        // إجراءات خاصة بكل شاشة
        this.handleScreenChange(screenId);
        
        console.log(`🔄 الانتقال إلى الشاشة: ${screenId}`);
    }
    
    /**
     * التركيز على العنصر الأول للوصول
     */
    focusFirstElement(screen) {
        const focusableElements = screen.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }
    
    /**
     * إجراءات خاصة بتغيير الشاشة
     */
    handleScreenChange(screenId) {
        switch (screenId) {
            case 'results-screen':
                this.loadTopScores();
                break;
            case 'start-screen':
                // إعادة تعيين حالة التطبيق
                this.state.currentBank = null;
                this.state.questions = [];
                this.state.currentQuestionIndex = 0;
                this.state.score = 0;
                this.state.userAnswers = [];
                this.state.quizSession = null;
                break;
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تأخير بسيط لضمان تحميل جميع العناصر
    setTimeout(() => {
        window.geoReadyApp = new GeoReady();
    }, 100);
});

// التعامل مع أخطاء التحميل
window.addEventListener('error', (event) => {
    console.error('❌ خطأ في التطبيق:', event.error);
});