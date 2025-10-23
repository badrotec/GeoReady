// GeoReady Quiz Application
class GeoReady {
    constructor() {
        this.currentScreen = 'start-screen';
        this.language = 'ar';
        this.questionBanks = {};
        this.currentBank = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.timer = null;
        this.timeLeft = 20;
        this.totalTime = 20;
        this.quizSession = null;
        this.soundEnabled = true;
        
        this.initializeApp();
    }
    
    // تهيئة التطبيق
    initializeApp() {
        this.bindEvents();
        this.updateLanguageElements();
        this.loadQuestionBanks();
        this.loadTopScores();
    }
    
    // ربط الأحداث
    bindEvents() {
        // أزرار التنقل بين الشاشات
        document.getElementById('start-btn').addEventListener('click', () => this.showScreen('category-screen'));
        document.getElementById('back-to-start').addEventListener('click', () => this.showScreen('start-screen'));
        document.getElementById('back-to-categories').addEventListener('click', () => this.showScreen('category-screen'));
        document.getElementById('back-to-results').addEventListener('click', () => this.showScreen('results-screen'));
        document.getElementById('new-quiz').addEventListener('click', () => this.showScreen('category-screen'));
        document.getElementById('finish-review').addEventListener('click', () => this.showScreen('results-screen'));
        
        // أزرار تبديل اللغة
        document.getElementById('language-toggle').addEventListener('click', () => this.toggleLanguage());
        document.getElementById('language-toggle-2').addEventListener('click', () => this.toggleLanguage());
        document.getElementById('language-toggle-3').addEventListener('click', () => this.toggleLanguage());
        
        // أحداث النتائج
        document.getElementById('review-mistakes').addEventListener('click', () => this.showReviewScreen());
        document.getElementById('share-results').addEventListener('click', () => this.shareResults());
        
        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }
    
    // تبديل اللغة
    toggleLanguage() {
        this.language = this.language === 'ar' ? 'en' : 'ar';
        document.documentElement.dir = this.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.language;
        this.updateLanguageElements();
    }
    
    // تحديث العناصر حسب اللغة
    updateLanguageElements() {
        const elements = document.querySelectorAll('[data-ar], [data-en]');
        elements.forEach(element => {
            const text = this.language === 'ar' ? 
                element.getAttribute('data-ar') : 
                element.getAttribute('data-en');
            if (text) {
                element.textContent = text;
            }
        });
    }
    
    // تحميل بنوك الأسئلة
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
        categoryGrid.innerHTML = '<div class="loading" data-ar="جاري تحميل الأسئلة..." data-en="Loading questions...">جاري تحميل الأسئلة...</div>';
        
        let loadedCount = 0;
        
        for (const file of bankFiles) {
            try {
                const response = await fetch(file);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const questions = await response.json();
                
                // التحقق من صحة هيكل JSON
                if (!Array.isArray(questions)) {
                    throw new Error('ملف JSON يجب أن يكون مصفوفة');
                }
                
                this.questionBanks[file] = questions;
                loadedCount++;
                
            } catch (error) {
                console.error(`خطأ في تحميل ${file}:`, error);
                // إنشاء بيانات تجريبية إذا فشل التحميل
                this.createSampleBank(file);
            }
        }
        
        // بعد تحميل جميع الملفات، عرض الفئات
        this.displayCategories();
        console.log(`تم تحميل ${loadedCount} من ${bankFiles.length} ملف بنجاح`);
    }
    
    // إنشاء بيانات تجريبية للفئة
    createSampleBank(fileName) {
        const sampleQuestions = [
            {
                id: 1,
                question: this.language === 'ar' ? 'ما هي الصخور النارية؟' : 'What are igneous rocks?',
                options: {
                    "أ": this.language === 'ar' ? 'صخور تكونت من تصلب الصهارة' : 'Rocks formed from solidified magma',
                    "ب": this.language === 'ar' ? 'صخور تكونت من ترسب الرواسب' : 'Rocks formed from sediment deposition',
                    "ج": this.language === 'ar' ? 'صخور تغيرت بفعل الحرارة والضغط' : 'Rocks changed by heat and pressure',
                    "د": this.language === 'ar' ? 'صخور تحتوي على معادن ثمينة' : 'Rocks containing precious minerals'
                },
                answer: "أ",
                explain: this.language === 'ar' ? 'الصخور النارية تتشكل عندما تبرد الصهارة وتتصلب' : 'Igneous rocks form when magma cools and solidifies'
            },
            {
                id: 2,
                question: this.language === 'ar' ? 'ما هو المعدن الأكثر وفرة في القشرة الأرضية؟' : 'What is the most abundant mineral in Earth\'s crust?',
                options: {
                    "أ": this.language === 'ar' ? 'الكوارتز' : 'Quartz',
                    "ب": this.language === 'ar' ? 'الفلسبار' : 'Feldspar',
                    "ج": this.language === 'ar' ? 'المايكا' : 'Mica',
                    "د": this.language === 'ar' ? 'الكالسيت' : 'Calcite'
                },
                answer: "ب",
                explain: this.language === 'ar' ? 'الفلسبار يشكل حوالي 60% من القشرة الأرضية' : 'Feldspar makes up about 60% of Earth\'s crust'
            }
        ];
        
        this.questionBanks[fileName] = sampleQuestions;
    }
    
    // عرض الفئات في الواجهة
    displayCategories() {
        const categoryGrid = document.getElementById('category-grid');
        categoryGrid.innerHTML = '';
        
        Object.keys(this.questionBanks).forEach(file => {
            const questions = this.questionBanks[file];
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.addEventListener('click', () => this.selectBank(file));
            
            const categoryName = this.getCategoryName(file);
            const questionCount = questions.length;
            
            categoryCard.innerHTML = `
                <h3>${categoryName}</h3>
                <p>${this.language === 'ar' ? 'مجال في علوم الأرض' : 'Field in Earth sciences'}</p>
                <div class="question-count">${questionCount} ${this.language === 'ar' ? 'سؤال' : 'questions'}</div>
            `;
            
            categoryGrid.appendChild(categoryCard);
        });
        
        // إضافة خيار عشوائي
        const randomCard = document.createElement('div');
        randomCard.className = 'category-card random-card';
        randomCard.addEventListener('click', () => this.selectRandomBank());
        randomCard.innerHTML = `
            <h3>${this.language === 'ar' ? 'عشوائي' : 'Random'}</h3>
            <p>${this.language === 'ar' ? 'أسئلة من جميع الفئات' : 'Questions from all categories'}</p>
            <div class="question-count">${this.language === 'ar' ? 'مختلط' : 'Mixed'}</div>
        `;
        categoryGrid.appendChild(randomCard);
    }
    
    // الحصول على اسم الفئة من اسم الملف
    getCategoryName(fileName) {
        const name = fileName.replace('.json', '');
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    
    // اختيار بنك أسئلة
    selectBank(bankName) {
        this.currentBank = bankName;
        const questions = this.questionBanks[bankName];
        this.startSession({
            questions: questions,
            category: this.getCategoryName(bankName)
        });
    }
    
    // اختيار عشوائي
    selectRandomBank() {
        const allQuestions = Object.values(this.questionBanks).flat();
        this.startSession({
            questions: this.shuffleQuestions([...allQuestions]),
            category: this.language === 'ar' ? 'عشوائي' : 'Random'
        });
    }
    
    // بدء جلسة الاختبار
    startSession(options) {
        this.quizSession = {
            id: Date.now(),
            category: options.category,
            date: new Date().toISOString(),
            settings: {
                totalQuestions: options.questions.length
            }
        };
        
        // استخدام جميع الأسئلة المتاحة (بحد أقصى 25 سؤال)
        this.questions = options.questions.slice(0, 25);
        
        // إعادة تعيين المتغيرات
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.totalTime = 20; // 20 ثانية ثابتة لكل سؤال
        this.timeLeft = this.totalTime;
        
        // عرض شاشة الاختبار
        this.showScreen('quiz-screen');
        this.updateQuizHeader();
        this.loadQuestion();
    }
    
    // خلط الأسئلة
    shuffleQuestions(questions) {
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        return questions;
    }
    
    // خلط الخيارات
    shuffleOptions(options) {
        const entries = Object.entries(options);
        for (let i = entries.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [entries[i], entries[j]] = [entries[j], entries[i]];
        }
        return Object.fromEntries(entries);
    }
    
    // تحميل السؤال الحالي
    loadQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResults();
            return;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        const optionsContainer = document.getElementById('options-container');
        const questionText = document.getElementById('question-text');
        
        // عرض السؤال
        questionText.textContent = question.question;
        
        // إعداد الخيارات
        optionsContainer.innerHTML = '';
        
        // خلط الخيارات مع الحفاظ على المفاتيح العربية
        const shuffledOptions = this.shuffleOptions(question.options);
        const optionKeys = Object.keys(shuffledOptions);
        
        // إنشاء عناصر الخيارات
        optionKeys.forEach(key => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.dataset.key = key;
            optionElement.innerHTML = `
                <span class="option-text">${shuffledOptions[key]}</span>
                <span class="option-key">${key}</span>
            `;
            
            optionElement.addEventListener('click', () => this.selectAnswer(key));
            optionsContainer.appendChild(optionElement);
        });
        
        // تحديث شريط التقدم
        this.updateProgressBar();
        
        // بدء المؤقت
        this.startTimer();
    }
    
    // اختيار الإجابة
    selectAnswer(selectedKey) {
        // إيقاف المؤقت
        this.stopTimer();
        
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedKey === question.answer;
        const options = document.querySelectorAll('.option');
        
        // تسجيل إجابة المستخدم
        this.userAnswers.push({
            questionIndex: this.currentQuestionIndex,
            selectedKey,
            isCorrect,
            question: question
        });
        
        // تحديث النتيجة
        if (isCorrect) {
            this.score++;
            this.playSound('correct');
        } else {
            this.playSound('wrong');
        }
        
        // عرض الإجابة الصحيحة والخاطئة
        options.forEach(option => {
            const optionKey = option.dataset.key;
            option.classList.remove('selected');
            
            if (optionKey === question.answer) {
                option.classList.add('correct');
            } else if (optionKey === selectedKey && !isCorrect) {
                option.classList.add('incorrect');
            }
            
            // تعطيل النقر على الخيارات
            option.style.pointerEvents = 'none';
        });
        
        // الانتقال للسؤال التالي بعد تأخير قصير
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    // الانتقال للسؤال التالي
    nextQuestion() {
        this.currentQuestionIndex++;
        this.loadQuestion();
    }
    
    // بدء المؤقت
    startTimer() {
        this.timeLeft = this.totalTime;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }
    
    // إيقاف المؤقت
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    // تحديث عرض المؤقت
    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        timerElement.textContent = this.timeLeft;
        
        // تغيير اللون حسب الوقت المتبقي
        timerElement.classList.remove('warning', 'danger');
        if (this.timeLeft <= 5) {
            timerElement.classList.add('danger');
        } else if (this.timeLeft <= 10) {
            timerElement.classList.add('warning');
        }
    }
    
    // التعامل مع انتهاء الوقت
    handleTimeout() {
        this.stopTimer();
        this.playSound('timeout');
        
        // اعتبار انتهاء الوقت إجابة خاطئة
        const question = this.questions[this.currentQuestionIndex];
        const options = document.querySelectorAll('.option');
        
        // تسجيل إجابة خاطئة
        this.userAnswers.push({
            questionIndex: this.currentQuestionIndex,
            selectedKey: null,
            isCorrect: false,
            question: question,
            timeout: true
        });
        
        // عرض الإجابة الصحيحة
        options.forEach(option => {
            const optionKey = option.dataset.key;
            
            if (optionKey === question.answer) {
                option.classList.add('correct');
            }
            
            // تعطيل النقر على الخيارات
            option.style.pointerEvents = 'none';
        });
        
        // الانتقال للسؤال التالي بعد تأخير قصير
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    // تحديث شريط التقدم
    updateProgressBar() {
        const progress = (this.currentQuestionIndex / this.questions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        // تحديث نص التقدم
        const progressText = this.language === 'ar' ? 
            `السؤال ${this.currentQuestionIndex + 1} من ${this.questions.length}` :
            `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        document.getElementById('quiz-progress').textContent = progressText;
    }
    
    // تحديث رأس الاختبار
    updateQuizHeader() {
        const categoryElement = document.getElementById('quiz-category');
        categoryElement.textContent = this.quizSession.category;
    }
    
    // عرض النتائج
    showResults() {
        this.quizSession.score = this.score;
        this.quizSession.totalQuestions = this.questions.length;
        this.quizSession.percentage = Math.round((this.score / this.questions.length) * 100);
        
        // حفظ النتيجة
        this.saveScore();
        
        // تحديث عرض النتائج
        this.updateResultsDisplay();
        
        // عرض شاشة النتائج
        this.showScreen('results-screen');
    }
    
    // تحديث عرض النتائج
    updateResultsDisplay() {
        const percentage = this.quizSession.percentage;
        const scoreText = this.language === 'ar' ? 
            `لقد أجبت بشكل صحيح على ${this.score} من ${this.questions.length} سؤالاً` :
            `You answered ${this.score} out of ${this.questions.length} questions correctly`;
        
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        document.getElementById('score-text').textContent = scoreText;
        
        // تحديث دائرة النتيجة
        const scoreCircle = document.querySelector('.score-circle');
        scoreCircle.style.background = `conic-gradient(var(--primary-color) 0% ${percentage}%, #e2e8f0 ${percentage}% 100%)`;
        
        // تحديد اللقب بناءً على النسبة
        let title = '';
        if (percentage >= 90) {
            title = this.language === 'ar' ? 'جيولوجي فائق' : 'Super Geologist';
        } else if (percentage >= 70) {
            title = this.language === 'ar' ? 'جيولوجي ميداني محترف' : 'Professional Field Geologist';
        } else if (percentage >= 50) {
            title = this.language === 'ar' ? 'مستكشف الطبقات' : 'Layer Explorer';
        } else {
            title = this.language === 'ar' ? 'مبتدئ في الميدان' : 'Field Beginner';
        }
        
        document.getElementById('score-title').textContent = title;
        
        // تحديث أفضل النتائج
        this.displayTopScores();
    }
    
    // حفظ النتيجة
    saveScore() {
        const scores = this.getTopScores();
        scores.push(this.quizSession);
        
        // ترتيب النتائج تنازلياً
        scores.sort((a, b) => b.percentage - a.percentage);
        
        // الاحتفاظ بأفضل 5 نتائج فقط
        const topScores = scores.slice(0, 5);
        
        // حفظ في localStorage
        localStorage.setItem('GeoReady_scores', JSON.stringify(topScores));
    }
    
    // الحصول على أفضل النتائج
    getTopScores() {
        const stored = localStorage.getItem('GeoReady_scores');
        return stored ? JSON.parse(stored) : [];
    }
    
    // عرض أفضل النتائج
    displayTopScores() {
        const scores = this.getTopScores();
        const scoresList = document.getElementById('top-scores-list');
        
        scoresList.innerHTML = '';
        
        if (scores.length === 0) {
            scoresList.innerHTML = `<div class="score-item">${this.language === 'ar' ? 'لا توجد نتائج سابقة' : 'No previous scores'}</div>`;
            return;
        }
        
        scores.forEach((score, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            
            const date = new Date(score.date).toLocaleDateString(this.language === 'ar' ? 'ar-SA' : 'en-US');
            const category = score.category;
            
            scoreItem.innerHTML = `
                <div>
                    <strong>${index + 1}. ${category}</strong>
                    <div class="score-date">${date}</div>
                </div>
                <div class="score-value">${score.percentage}%</div>
            `;
            
            scoresList.appendChild(scoreItem);
        });
    }
    
    // تحميل أفضل النتائج
    loadTopScores() {
        this.displayTopScores();
    }
    
    // عرض شاشة مراجعة الأخطاء
    showReviewScreen() {
        const mistakesContainer = document.getElementById('mistakes-container');
        mistakesContainer.innerHTML = '';
        
        // تصفية الأسئلة الخاطئة
        const wrongAnswers = this.userAnswers.filter(answer => !answer.isCorrect);
        
        if (wrongAnswers.length === 0) {
            mistakesContainer.innerHTML = `
                <div class="mistake-item">
                    <p>${this.language === 'ar' ? 'لا توجد أخطاء لمراجعتها!' : 'No mistakes to review!'}</p>
                </div>
            `;
            return;
        }
        
        // عرض كل سؤال خاطئ
        wrongAnswers.forEach((answer, index) => {
            const question = answer.question;
            const mistakeItem = document.createElement('div');
            mistakeItem.className = 'mistake-item';
            
            let optionsHtml = '';
            const optionKeys = Object.keys(question.options);
            
            for (const key of optionKeys) {
                if (question.options[key]) {
                    let optionClass = '';
                    if (key === question.answer) {
                        optionClass = 'correct';
                    } else if (key === answer.selectedKey) {
                        optionClass = 'incorrect';
                    }
                    
                    optionsHtml += `
                        <div class="mistake-option ${optionClass}">
                            <strong>${key}.</strong> ${question.options[key]}
                        </div>
                    `;
                }
            }
            
            const explanation = question.explain || 
                (this.language === 'ar' ? 'لا يوجد شرح متاح لهذا السؤال.' : 'No explanation available for this question.');
            
            const timeoutText = answer.timeout ? 
                (this.language === 'ar' ? ' (انتهى الوقت)' : ' (Time out)') : '';
            
            mistakeItem.innerHTML = `
                <div class="mistake-question">
                    <strong>${index + 1}.</strong> ${question.question}${timeoutText}
                </div>
                <div class="mistake-options">
                    ${optionsHtml}
                </div>
                <div class="mistake-explanation">
                    <strong>${this.language === 'ar' ? 'الشرح:' : 'Explanation:'}</strong> ${explanation}
                </div>
            `;
            
            mistakesContainer.appendChild(mistakeItem);
        });
        
        this.showScreen('review-screen');
    }
    
    // مشاركة النتائج
    shareResults() {
        const shareData = {
            title: this.language === 'ar' ? 'نتيجة تحدى GeoReady' : 'GeoReady Challenge Result',
            text: this.language === 'ar' ? 
                `حصلت على ${this.quizSession.percentage}% في تحدى ${this.quizSession.category} على GeoReady!` :
                `I scored ${this.quizSession.percentage}% in the ${this.quizSession.category} challenge on GeoReady!`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData)
                .catch(err => console.log('Error sharing:', err));
        } else {
            // نسخ النص إلى الحافظة
            const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
            navigator.clipboard.writeText(text)
                .then(() => {
                    alert(this.language === 'ar' ? 'تم نسخ النتائج إلى الحافظة!' : 'Results copied to clipboard!');
                })
                .catch(err => {
                    console.log('Error copying to clipboard:', err);
                    // طريقة بديلة
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert(this.language === 'ar' ? 'تم نسخ النتائج إلى الحافظة!' : 'Results copied to clipboard!');
                });
        }
    }
    
    // تشغيل الصوت
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const sound = document.getElementById(`${type}-sound`);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Error playing sound:', e));
        }
    }
    
    // التعامل مع أحداث لوحة المفاتيح
    handleKeydown(e) {
        // فقط في شاشة الاختبار
        if (this.currentScreen === 'quiz-screen') {
            const options = document.querySelectorAll('.option');
            
            switch (e.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                    // اختيار الإجابة باستخدام الأرقام 1-4
                    const index = parseInt(e.key) - 1;
                    if (options[index]) {
                        const selectedKey = options[index].dataset.key;
                        this.selectAnswer(selectedKey);
                    }
                    break;
                    
                case 'Enter':
                    // تأكيد الانتقال للسؤال التالي (لا حاجة له في هذا التصميم)
                    break;
            }
        }
        
        // في شاشة البداية
        if (this.currentScreen === 'start-screen' && (e.key === 's' || e.key === 'S')) {
            this.showScreen('category-screen');
        }
    }
    
    // تبديل الشاشات
    showScreen(screenId) {
        // إخفاء جميع الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // إظهار الشاشة المطلوبة
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
        
        // إيقاف المؤقت إذا لم نكن في شاشة الاختبار
        if (screenId !== 'quiz-screen') {
            this.stopTimer();
        }
        
        // تحديث بيانات اللغة
        this.updateLanguageElements();
        
        // تحميل أفضل النتائج إذا كنا في شاشة النتائج
        if (screenId === 'results-screen') {
            this.loadTopScores();
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new GeoReady();
});