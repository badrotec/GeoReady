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
        this.timeLeft = 60;
        this.totalTime = 60;
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
        document.getElementById('language-toggle-4').addEventListener('click', () => this.toggleLanguage());
        
        // أحداث شاشة الإختبار
        document.getElementById('pause-quiz').addEventListener('click', () => this.pauseQuiz());
        document.getElementById('resume-quiz').addEventListener('click', () => this.resumeQuiz());
        document.getElementById('quit-quiz').addEventListener('click', () => this.quitQuiz());
        document.getElementById('next-question').addEventListener('click', () => this.nextQuestion());
        
        // أحداث النتائج
        document.getElementById('review-mistakes').addEventListener('click', () => this.showReviewScreen());
        document.getElementById('share-results').addEventListener('click', () => this.shareResults());
        
        // أحداث الإعدادات
        document.getElementById('sound-enabled').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });
        
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
                if (element.tagName === 'INPUT' && element.type === 'button') {
                    element.value = text;
                } else {
                    element.textContent = text;
                }
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
        categoryGrid.innerHTML = '';
        
        for (const file of bankFiles) {
            try {
                const response = await fetch(file);
                if (!response.ok) throw new Error(`Failed to load ${file}`);
                
                const questions = await response.json();
                this.questionBanks[file] = questions;
                
                // إنشاء بطاقة الفئة
                const categoryCard = document.createElement('div');
                categoryCard.className = 'category-card';
                categoryCard.addEventListener('click', () => this.selectBank(file));
                
                const categoryName = file.replace('.json', '').replace(/([A-Z])/g, ' $1').trim();
                const questionCount = questions.length;
                
                categoryCard.innerHTML = `
                    <h3>${categoryName}</h3>
                    <p>${questionCount} ${this.language === 'ar' ? 'سؤال' : 'questions'}</p>
                `;
                
                categoryGrid.appendChild(categoryCard);
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
                // عرض رسالة خطأ للمستخدم
                const errorCard = document.createElement('div');
                errorCard.className = 'category-card';
                errorCard.style.borderColor = 'var(--error-color)';
                errorCard.innerHTML = `
                    <h3>${file.replace('.json', '')}</h3>
                    <p>${this.language === 'ar' ? 'فشل في تحميل الأسئلة' : 'Failed to load questions'}</p>
                `;
                categoryGrid.appendChild(errorCard);
            }
        }
        
        // إضافة خيار عشوائي
        const randomCard = document.createElement('div');
        randomCard.className = 'category-card';
        randomCard.addEventListener('click', () => this.selectRandomBank());
        randomCard.innerHTML = `
            <h3>${this.language === 'ar' ? 'عشوائي' : 'Random'}</h3>
            <p>${this.language === 'ar' ? 'أسئلة من جميع الفئات' : 'Questions from all categories'}</p>
        `;
        categoryGrid.appendChild(randomCard);
    }
    
    // اختيار بنك أسئلة
    selectBank(bankName) {
        this.currentBank = bankName;
        const questions = this.questionBanks[bankName];
        this.startSession({
            questions: questions,
            category: bankName.replace('.json', '')
        });
    }
    
    // اختيار عشوائي
    selectRandomBank() {
        const allQuestions = Object.values(this.questionBanks).flat();
        this.startSession({
            questions: this.shuffleQuestions([...allQuestions]),
            category: 'Random'
        });
    }
    
    // بدء جلسة الاختبار
    startSession(options) {
        this.quizSession = {
            id: Date.now(),
            category: options.category,
            date: new Date().toISOString(),
            settings: {
                questionCount: document.getElementById('question-count').value,
                difficulty: document.getElementById('difficulty').value,
                timePerQuestion: parseInt(document.getElementById('time-per-question').value),
                shuffleOptions: document.getElementById('shuffle-options').checked
            }
        };
        
        // تصفية الأسئلة حسب الصعوبة إذا تم تحديدها
        let filteredQuestions = options.questions;
        if (this.quizSession.settings.difficulty !== 'all') {
            filteredQuestions = options.questions.filter(q => 
                q.difficulty === this.quizSession.settings.difficulty
            );
        }
        
        // تحديد عدد الأسئلة
        if (this.quizSession.settings.questionCount === 'all') {
            this.questions = filteredQuestions;
        } else {
            const count = parseInt(this.quizSession.settings.questionCount);
            this.questions = this.shuffleQuestions([...filteredQuestions]).slice(0, count);
        }
        
        // إعادة تعيين المتغيرات
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.totalTime = this.quizSession.settings.timePerQuestion;
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
    
    // تحميل السؤال الحالي
    loadQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResults();
            return;
        }
        
        const question = this.questions[this.currentQuestionIndex];
        const optionsContainer = document.getElementById('options-container');
        const questionText = document.getElementById('question-text');
        const nextButton = document.getElementById('next-question');
        
        // تعطيل زر التالي
        nextButton.disabled = true;
        
        // عرض السؤال
        questionText.textContent = question.question;
        
        // إعداد الخيارات
        optionsContainer.innerHTML = '';
        const optionKeys = ['أ', 'ب', 'ج', 'د'];
        let options = [];
        
        // تحويل الخيارات إلى مصفوفة
        for (const key of optionKeys) {
            if (question.options[key]) {
                options.push({ key, text: question.options[key] });
            }
        }
        
        // خلط الخيارات إذا كان مفعلاً
        if (this.quizSession.settings.shuffleOptions) {
            options = this.shuffleOptions(options);
        }
        
        // إنشاء عناصر الخيارات
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.dataset.key = option.key;
            optionElement.innerHTML = `
                <span class="option-text">${option.text}</span>
                <span class="option-key">${option.key}</span>
            `;
            
            optionElement.addEventListener('click', () => this.selectAnswer(option.key));
            optionsContainer.appendChild(optionElement);
        });
        
        // تحديث شريط التقدم
        this.updateProgressBar();
        
        // بدء المؤقت
        this.startTimer();
    }
    
    // خلط الخيارات
    shuffleOptions(options) {
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        return options;
    }
    
    // اختيار الإجابة
    selectAnswer(selectedKey) {
        // إيقاف المؤقت
        this.stopTimer();
        
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedKey === question.answer;
        const options = document.querySelectorAll('.option');
        const nextButton = document.getElementById('next-question');
        
        // تمكين زر التالي
        nextButton.disabled = false;
        
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
        
        // إضافة حدث للزر التالي
        nextButton.onclick = () => this.nextQuestion();
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
        if (this.timeLeft <= 10) {
            timerElement.classList.add('danger');
        } else if (this.timeLeft <= 20) {
            timerElement.classList.add('warning');
        }
    }
    
    // التعامل مع انتهاء الوقت
    handleTimeout() {
        this.stopTimer();
        this.playSound('timeout');
        
        // اعتبار انتهاء الوقت إجابة خاطئة
        const options = document.querySelectorAll('.option');
        const question = this.questions[this.currentQuestionIndex];
        const nextButton = document.getElementById('next-question');
        
        // تمكين زر التالي
        nextButton.disabled = false;
        
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
        
        // إضافة حدث للزر التالي
        nextButton.onclick = () => this.nextQuestion();
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
        const categoryName = this.quizSession.category.replace(/([A-Z])/g, ' $1').trim();
        categoryElement.textContent = categoryName;
        
        // تحديث بيانات اللغة
        this.updateLanguageElements();
    }
    
    // إيقاف الاختبار مؤقتاً
    pauseQuiz() {
        this.stopTimer();
        document.getElementById('pause-modal').classList.add('active');
    }
    
    // متابعة الاختبار
    resumeQuiz() {
        document.getElementById('pause-modal').classList.remove('active');
        this.startTimer();
    }
    
    // إنهاء الاختبار
    quitQuiz() {
        this.stopTimer();
        document.getElementById('pause-modal').classList.remove('active');
        this.showScreen('category-screen');
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
        
        // تحديد اللقب بناءً على النسبة
        let title = '';
        if (percentage >= 90) title = this.language === 'ar' ? 'خبير جيولوجيا متميز' : 'Distinguished Geology Expert';
        else if (percentage >= 80) title = this.language === 'ar' ? 'خبير جيولوجيا' : 'Geology Expert';
        else if (percentage >= 70) title = this.language === 'ar' ? 'عالم جيولوجيا واعد' : 'Promising Geologist';
        else if (percentage >= 60) title = this.language === 'ar' ? 'متعلم جيولوجيا' : 'Geology Learner';
        else title = this.language === 'ar' ? 'مبتدئ في الجيولوجيا' : 'Geology Beginner';
        
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
            scoresList.innerHTML = `<p>${this.language === 'ar' ? 'لا توجد نتائج سابقة' : 'No previous scores'}</p>`;
            return;
        }
        
        scores.forEach((score, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'score-item';
            
            const date = new Date(score.date).toLocaleDateString(this.language === 'ar' ? 'ar-SA' : 'en-US');
            const category = score.category.replace(/([A-Z])/g, ' $1').trim();
            
            scoreItem.innerHTML = `
                <span>${index + 1}. ${category}</span>
                <span class="score-value">${score.percentage}%</span>
                <span>${date}</span>
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
            const optionKeys = ['أ', 'ب', 'ج', 'د'];
            
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
            
            mistakeItem.innerHTML = `
                <div class="mistake-question">
                    <strong>${index + 1}.</strong> ${question.question}
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
        if (this.currentScreen !== 'quiz-screen') return;
        
        switch (e.key) {
            case '1':
            case '2':
            case '3':
            case '4':
                // اختيار الإجابة باستخدام الأرقام 1-4
                const optionKeys = ['أ', 'ب', 'ج', 'د'];
                const selectedKey = optionKeys[parseInt(e.key) - 1];
                this.selectAnswer(selectedKey);
                break;
                
            case 'Enter':
                // تأكيد الانتقال للسؤال التالي
                const nextButton = document.getElementById('next-question');
                if (!nextButton.disabled) {
                    this.nextQuestion();
                }
                break;
                
            case 's':
            case 'S':
                // بدء الاختبار (من شاشة البداية)
                if (this.currentScreen === 'start-screen') {
                    this.showScreen('category-screen');
                }
                break;
                
            case 'ArrowLeft':
                // السؤال السابق (غير مدعوم حالياً)
                break;
                
            case 'ArrowRight':
                // السؤال التالي
                if (!document.getElementById('next-question').disabled) {
                    this.nextQuestion();
                }
                break;
                
            case 'Escape':
                // إغلاق النافذة المنبثقة أو إيقاف الاختبار
                if (document.getElementById('pause-modal').classList.contains('active')) {
                    this.resumeQuiz();
                } else {
                    this.pauseQuiz();
                }
                break;
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
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new GeoReady();
});