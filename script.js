// GeoReady - تطبيق اختبار الجيولوجيا
class GeoReady {
    constructor() {
        this.initializeApp();
        this.bindEvents();
        this.loadCategories();
        this.loadStats();
    }

    initializeApp() {
        // حالة التطبيق
        this.state = {
            currentScreen: 'main-screen',
            currentCategory: null,
            questions: [],
            currentQuestionIndex: 0,
            userAnswers: [],
            timer: null,
            timeLeft: 60,
            isTimerRunning: false,
            isMuted: false,
            sounds: {},
            score: 0
        };

        // قائمة الفئات المتاحة
        this.categories = [
            { id: 'BasicGeology', name: 'الجيولوجيا الأساسية' },
            { id: 'Geochemistry', name: 'الجيوكيمياء' },
            { id: 'Geophysics', name: 'الجيوفيزياء' },
            { id: 'Hydrogeology', name: 'الهيدروجيولوجيا' },
            { id: 'Petrology', name: 'علم الصخور' },
            { id: 'Structuralgeology', name: 'الجيولوجيا التركيبية' },
            { id: 'sedimentarygeology', name: 'جيولوجيا الرواسب' }
        ];

        // تهيئة الأصوات
        this.initializeSounds();
    }

    bindEvents() {
        // التنقل بين الشاشات
        document.getElementById('start-all').addEventListener('click', () => this.startQuiz('all'));
        document.getElementById('view-results').addEventListener('click', () => this.showResults());
        document.getElementById('view-mistakes').addEventListener('click', () => this.showMistakes());
        document.getElementById('back-to-main').addEventListener('click', () => this.showScreen('main-screen'));
        document.getElementById('back-from-results').addEventListener('click', () => this.showScreen('main-screen'));
        document.getElementById('back-from-mistakes').addEventListener('click', () => this.showScreen('main-screen'));
        document.getElementById('back-to-main-from-results').addEventListener('click', () => this.showScreen('main-screen'));
        document.getElementById('back-to-main-from-mistakes').addEventListener('click', () => this.showScreen('main-screen'));
        document.getElementById('restart-quiz').addEventListener('click', () => this.showScreen('main-screen'));

        // عناصر التحكم في الاختبار
        document.getElementById('timer-toggle').addEventListener('click', () => this.toggleTimer());
        document.getElementById('mute-toggle').addEventListener('click', () => this.toggleMute());
        document.getElementById('prev-btn').addEventListener('click', () => this.previousQuestion());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());

        // النافذة المنبثقة
        document.getElementById('close-modal').addEventListener('click', () => this.hideModal());
        document.getElementById('modal-cancel').addEventListener('click', () => this.hideModal());
        document.getElementById('modal-confirm').addEventListener('click', () => this.confirmModal());

        // اختصارات لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    initializeSounds() {
        // إنشاء أصوات بديلة باستخدام Web Audio API
        this.state.sounds = {
            correct: this.createSound(523.25, 0.3),  // C5
            wrong: this.createSound(349.23, 0.3),    // F4
            timeout: this.createSound(220.00, 0.5)   // A3
        };
    }

    createSound(frequency, duration) {
        return () => {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.error('خطأ في إنشاء الصوت:', error);
            }
        };
    }

    playSound(soundType) {
        if (this.state.isMuted) return;
        
        if (this.state.sounds[soundType]) {
            this.state.sounds[soundType]();
        }
    }

    loadCategories() {
        const container = document.getElementById('category-list');
        container.innerHTML = '';
        
        this.categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            button.textContent = category.name;
            button.addEventListener('click', () => this.startQuiz(category.id));
            container.appendChild(button);
        });
    }

    async startQuiz(categoryId) {
        try {
            this.state.currentCategory = categoryId;
            this.state.questions = [];
            this.state.currentQuestionIndex = 0;
            this.state.userAnswers = [];
            this.state.score = 0;

            // تحميل الأسئلة
            if (categoryId === 'all') {
                await this.loadAllQuestions();
            } else {
                await this.loadCategoryQuestions(categoryId);
            }

            // التحقق من عدد الأسئلة
            if (this.state.questions.length === 0) {
                this.showModal('خطأ', 'لا توجد أسئلة متاحة لهذه الفئة');
                return;
            }

            // بدء الاختبار
            this.showScreen('quiz-screen');
            this.displayQuestion();
            this.startTimer();
            
            // تحديث اسم الفئة وشريط التقدم
            const categoryName = categoryId === 'all' ? 'جميع الفئات' : 
                this.categories.find(c => c.id === categoryId)?.name || categoryId;
            document.getElementById('category-name').textContent = categoryName;
            this.updateProgress();
            
        } catch (error) {
            console.error('خطأ في تحميل الأسئلة:', error);
            this.showModal('خطأ', `تعذر تحميل الأسئلة: ${error.message}`);
        }
    }

    async loadCategoryQuestions(categoryId) {
        const response = await fetch(`${categoryId}.json`);
        if (!response.ok) {
            throw new Error(`ملف ${categoryId}.json غير موجود`);
        }
        
        const questions = await response.json();
        
        // التحقق من صحة البيانات
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('ملف JSON غير صالح أو فارغ');
        }
        
        // التحقق من عدد الأسئلة
        if (questions.length !== 25) {
            this.showModal('تحذير', `ملف JSON غير مكتمل - مطلوب 25 سؤال في ${categoryId}.json`);
        }
        
        // تحويل الصيغة إذا لزم الأمر
        this.state.questions = questions.map(q => this.normalizeQuestion(q));
        
        // خلط الأسئلة
        this.shuffleQuestions();
    }

    async loadAllQuestions() {
        const allQuestions = [];
        
        for (const category of this.categories) {
            try {
                const response = await fetch(`${category.id}.json`);
                if (response.ok) {
                    const questions = await response.json();
                    if (Array.isArray(questions)) {
                        const normalizedQuestions = questions.map(q => this.normalizeQuestion(q));
                        allQuestions.push(...normalizedQuestions);
                    }
                }
            } catch (error) {
                console.warn(`تعذر تحميل ${category.id}.json:`, error);
            }
        }
        
        if (allQuestions.length === 0) {
            throw new Error('لا توجد أسئلة متاحة في أي فئة');
        }
        
        this.state.questions = allQuestions;
        this.shuffleQuestions();
    }

    normalizeQuestion(question) {
        // تحويل السؤال إلى الصيغة الموحدة
        if (Array.isArray(question.options)) {
            // الصيغة B: تحويل إلى الصيغة A
            const optionsMap = {};
            const keys = ['أ', 'ب', 'ج', 'د'];
            
            question.options.forEach((option, index) => {
                optionsMap[keys[index]] = option;
            });
            
            // البحث عن الإجابة الصحيحة
            let correctKey = null;
            keys.forEach(key => {
                if (optionsMap[key] === question.answer) {
                    correctKey = key;
                }
            });
            
            return {
                id: question.id || Math.random(),
                question: question.question,
                options: optionsMap,
                answer: correctKey || 'أ',
                topic: question.topic,
                explanation: question.explanation
            };
        } else {
            // الصيغة A: التأكد من أن الإجابة صحيحة
            return {
                id: question.id || Math.random(),
                question: question.question,
                options: question.options,
                answer: question.answer,
                topic: question.topic,
                explanation: question.explanation
            };
        }
    }

    shuffleQuestions() {
        // خلط الأسئلة باستخدام خوارزمية Fisher-Yates
        for (let i = this.state.questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.state.questions[i], this.state.questions[j]] = [this.state.questions[j], this.state.questions[i]];
        }
    }

    displayQuestion() {
        const question = this.state.questions[this.state.currentQuestionIndex];
        const optionsContainer = document.getElementById('options-container');
        
        // عرض نص السؤال
        document.getElementById('question-text').textContent = question.question;
        
        // إعداد الخيارات
        optionsContainer.innerHTML = '';
        
        // تحويل الخيارات إلى مصفوفة وخلطها
        const optionsArray = Object.entries(question.options)
            .map(([key, text]) => ({ key, text }));
        
        this.shuffleOptions(optionsArray);
        
        // إنشاء أزرار الخيارات
        optionsArray.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.setAttribute('data-key', option.key);
            optionElement.setAttribute('tabindex', '0');
            optionElement.setAttribute('role', 'button');
            optionElement.setAttribute('aria-label', `الخيار ${option.key}: ${option.text}`);
            
            optionElement.innerHTML = `
                <div class="option-key">${option.key}</div>
                <div class="option-text">${option.text}</div>
                <div class="option-icon"></div>
            `;
            
            optionElement.addEventListener('click', () => this.selectOption(option.key));
            optionElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectOption(option.key);
                }
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // تحديث حالة أزرار التنقل
        this.updateNavigationButtons();
    }

    shuffleOptions(optionsArray) {
        // خلط الخيارات مع الحفاظ على المفاتيح الأصلية
        for (let i = optionsArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
        }
    }

    selectOption(selectedKey) {
        if (this.state.userAnswers[this.state.currentQuestionIndex] !== undefined) return;
        
        const question = this.state.questions[this.state.currentQuestionIndex];
        const isCorrect = selectedKey === question.answer;
        
        // حفظ الإجابة
        this.state.userAnswers[this.state.currentQuestionIndex] = {
            selected: selectedKey,
            correct: isCorrect,
            timeSpent: 60 - this.state.timeLeft
        };
        
        // تحديث النتيجة
        if (isCorrect) {
            this.state.score++;
        }
        
        // إيقاف المؤقت
        this.stopTimer();
        
        // تلوين الإجابات
        this.colorAnswers(selectedKey, question.answer);
        
        // تشغيل الصوت المناسب
        if (isCorrect) {
            this.playSound('correct');
        } else {
            this.playSound('wrong');
        }
        
        // الانتقال التلقائي بعد تأخير
        setTimeout(() => {
            if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
                this.nextQuestion();
            } else {
                this.finishQuiz();
            }
        }, 1000);
    }

    colorAnswers(selectedKey, correctKey) {
        const options = document.querySelectorAll('.option');
        
        options.forEach(option => {
            const optionKey = option.getAttribute('data-key');
            option.classList.remove('correct', 'wrong');
            
            if (optionKey === correctKey) {
                option.classList.add('correct');
                const icon = option.querySelector('.option-icon');
                icon.innerHTML = '<i class="fas fa-check"></i>';
                option.setAttribute('aria-label', 'إجابة صحيحة');
            } else if (optionKey === selectedKey && selectedKey !== correctKey) {
                option.classList.add('wrong');
                const icon = option.querySelector('.option-icon');
                icon.innerHTML = '<i class="fas fa-times"></i>';
                option.setAttribute('aria-label', 'إجابة خاطئة');
            }
            
            // تعطيل التفاعل مع الخيارات
            option.style.pointerEvents = 'none';
        });
    }

    skipQuestion() {
        this.state.userAnswers[this.state.currentQuestionIndex] = {
            selected: null,
            correct: false,
            timeSpent: 60 - this.state.timeLeft,
            skipped: true
        };
        
        if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
            this.nextQuestion();
        } else {
            this.finishQuiz();
        }
    }

    previousQuestion() {
        if (this.state.currentQuestionIndex > 0) {
            this.state.currentQuestionIndex--;
            this.displayQuestion();
            this.updateProgress();
            this.resetTimer();
        }
    }

    nextQuestion() {
        if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
            this.state.currentQuestionIndex++;
            this.displayQuestion();
            this.updateProgress();
            this.resetTimer();
        } else {
            this.finishQuiz();
        }
    }

    updateProgress() {
        const progress = document.getElementById('progress');
        progress.textContent = `السؤال ${this.state.currentQuestionIndex + 1} من ${this.state.questions.length}`;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        prevBtn.disabled = this.state.currentQuestionIndex === 0;
        nextBtn.disabled = this.state.currentQuestionIndex === this.state.questions.length - 1;
    }

    startTimer() {
        this.state.isTimerRunning = true;
        this.state.timeLeft = 60;
        this.updateTimerDisplay();
        
        this.state.timer = setInterval(() => {
            if (this.state.isTimerRunning) {
                this.state.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.state.timeLeft <= 0) {
                    this.handleTimeout();
                }
            }
        }, 1000);
    }

    stopTimer() {
        this.state.isTimerRunning = false;
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.startTimer();
    }

    toggleTimer() {
        this.state.isTimerRunning = !this.state.isTimerRunning;
        const icon = document.querySelector('#timer-toggle i');
        icon.className = this.state.isTimerRunning ? 'fas fa-pause' : 'fas fa-play';
    }

    toggleMute() {
        this.state.isMuted = !this.state.isMuted;
        const icon = document.querySelector('#mute-toggle i');
        icon.className = this.state.isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }

    updateTimerDisplay() {
        document.getElementById('timer').textContent = this.state.timeLeft;
        
        // تغيير اللون عند انخفاض الوقت
        const timerElement = document.getElementById('timer');
        timerElement.classList.remove('warning', 'danger');
        
        if (this.state.timeLeft <= 10) {
            timerElement.classList.add('danger');
        } else if (this.state.timeLeft <= 30) {
            timerElement.classList.add('warning');
        }
    }

    handleTimeout() {
        this.stopTimer();
        this.playSound('timeout');
        
        // تعامل مع انتهاء الوقت كإجابة خاطئة
        const question = this.state.questions[this.state.currentQuestionIndex];
        this.state.userAnswers[this.state.currentQuestionIndex] = {
            selected: null,
            correct: false,
            timeSpent: 60,
            timeout: true
        };
        
        // عرض الإجابة الصحيحة
        this.colorAnswers(null, question.answer);
        
        // الانتقال التلقائي بعد تأخير
        setTimeout(() => {
            if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
                this.nextQuestion();
            } else {
                this.finishQuiz();
            }
        }, 1000);
    }

    finishQuiz() {
        this.stopTimer();
        this.saveResults();
        this.showResults();
    }

    saveResults() {
        const results = {
            date: new Date().toISOString(),
            category: this.state.currentCategory,
            totalQuestions: this.state.questions.length,
            correctCount: this.state.score,
            percent: Math.round((this.state.score / this.state.questions.length) * 100),
            answers: this.state.userAnswers
        };
        
        // تحميل النتائج السابقة
        let savedResults = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        savedResults.push(results);
        
        // حفظ فقط آخر 50 نتيجة
        if (savedResults.length > 50) {
            savedResults = savedResults.slice(-50);
        }
        
        localStorage.setItem('GeoReady_scores', JSON.stringify(savedResults));
        
        // تحديث الإحصائيات
        this.loadStats();
    }

    loadStats() {
        const savedResults = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        const statsElement = document.getElementById('stats');
        
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="stat-item">
                    <span class="stat-value">${savedResults.length}</span>
                    <span class="stat-label">النتائج المحفوظة</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.getAverageScore(savedResults)}%</span>
                    <span class="stat-label">متوسط النتائج</span>
                </div>
            `;
        }
    }

    getAverageScore(results) {
        if (results.length === 0) return 0;
        const total = results.reduce((sum, result) => sum + result.percent, 0);
        return Math.round(total / results.length);
    }

    showResults() {
        this.showScreen('results-screen');
        this.displayCurrentResults();
        this.displayTopResults();
    }

    displayCurrentResults() {
        const container = document.getElementById('current-results');
        const percent = Math.round((this.state.score / this.state.questions.length) * 100);
        
        container.innerHTML = `
            <div class="results-header">
                <h2>نتيجة الاختبار</h2>
                <div class="score-circle" style="--p: ${percent}%">
                    <div class="score-value">${percent}%</div>
                </div>
                <p>${this.getResultMessage(percent)}</p>
            </div>
            <div class="score-details">
                <div class="score-detail">
                    <span class="detail-value">${this.state.score}</span>
                    <span class="detail-label">إجابة صحيحة</span>
                </div>
                <div class="score-detail">
                    <span class="detail-value">${this.state.questions.length - this.state.score}</span>
                    <span class="detail-label">إجابة خاطئة</span>
                </div>
                <div class="score-detail">
                    <span class="detail-value">${this.state.questions.length}</span>
                    <span class="detail-label">إجمالي الأسئلة</span>
                </div>
            </div>
        `;
    }

    getResultMessage(percent) {
        if (percent >= 90) return 'ممتاز! أداء رائع';
        if (percent >= 80) return 'جيد جداً! أحسنت';
        if (percent >= 70) return 'جيد! يمكنك التحسين';
        if (percent >= 60) return 'مقبول! تحتاج للمزيد من المذاكرة';
        return 'ضعيف! راجع المواد الدراسية';
    }

    displayTopResults() {
        const container = document.getElementById('top-results');
        const savedResults = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        
        // ترتيب النتائج تنازلياً
        const topResults = savedResults
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 5);
        
        if (topResults.length === 0) {
            container.innerHTML = '<p>لا توجد نتائج سابقة</p>';
            return;
        }
        
        container.innerHTML = topResults.map((result, index) => `
            <div class="top-result">
                <div class="result-rank">${index + 1}</div>
                <div class="result-info">
                    <div>${new Date(result.date).toLocaleDateString('ar-EG')}</div>
                    <div>${this.getCategoryName(result.category)}</div>
                </div>
                <div class="result-score">${result.percent}%</div>
            </div>
        `).join('');
    }

    getCategoryName(categoryId) {
        if (categoryId === 'all') return 'جميع الفئات';
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    showMistakes() {
        const savedResults = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        if (savedResults.length === 0) {
            this.showModal('معلومات', 'لا توجد نتائج سابقة لعرض الأخطاء');
            return;
        }
        
        this.showScreen('mistakes-screen');
        this.displayMistakes();
    }

    displayMistakes() {
        const container = document.getElementById('mistakes-list');
        const savedResults = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        
        // جمع جميع الأخطاء من النتائج السابقة
        const allMistakes = [];
        savedResults.forEach(result => {
            if (result.answers) {
                result.answers.forEach((answer, index) => {
                    if (!answer.correct && !answer.skipped && !answer.timeout) {
                        allMistakes.push({
                            question: this.state.questions?.[index]?.question || `سؤال ${index + 1}`,
                            userAnswer: answer.selected,
                            correctAnswer: this.state.questions?.[index]?.answer,
                            options: this.state.questions?.[index]?.options,
                            explanation: this.state.questions?.[index]?.explanation
                        });
                    }
                });
            }
        });
        
        if (allMistakes.length === 0) {
            container.innerHTML = '<p>لا توجد أخطاء في النتائج السابقة</p>';
            return;
        }
        
        container.innerHTML = allMistakes.map((mistake, index) => `
            <div class="mistake-item">
                <div class="mistake-question">${index + 1}. ${mistake.question}</div>
                <div class="mistake-options">
                    ${Object.entries(mistake.options).map(([key, text]) => `
                        <div class="mistake-option ${key === mistake.correctAnswer ? 'correct' : key === mistake.userAnswer ? 'wrong' : ''}">
                            <div class="option-key">${key}</div>
                            <div class="option-text">${text}</div>
                        </div>
                    `).join('')}
                </div>
                ${mistake.explanation ? `
                    <div class="mistake-explanation">
                        <div class="explanation-title">شرح الإجابة:</div>
                        <div>${mistake.explanation}</div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    showScreen(screenId) {
        // إخفاء جميع الشاشات
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // إظهار الشاشة المطلوبة
        document.getElementById(screenId).classList.add('active');
        this.state.currentScreen = screenId;
        
        // إيقاف المؤقت إذا لم نكن في شاشة الاختبار
        if (screenId !== 'quiz-screen') {
            this.stopTimer();
        }
    }

    showModal(title, message, confirmCallback = null) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        document.getElementById('modal-overlay').classList.remove('hidden');
        
        if (confirmCallback) {
            this.modalConfirmCallback = confirmCallback;
            document.getElementById('modal-cancel').classList.remove('hidden');
        } else {
            document.getElementById('modal-cancel').classList.add('hidden');
        }
    }

    hideModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
        this.modalConfirmCallback = null;
    }

    confirmModal() {
        if (this.modalConfirmCallback) {
            this.modalConfirmCallback();
        }
        this.hideModal();
    }

    handleKeyboard(event) {
        // منع اختصارات لوحة المفاتيح في النافذة المنبثقة
        if (!document.getElementById('modal-overlay').classList.contains('hidden')) {
            if (event.key === 'Escape') {
                this.hideModal();
            }
            return;
        }
        
        // اختصارات لوحة المفاتيح العامة
        switch (event.key) {
            case 'Escape':
                if (this.state.currentScreen === 'quiz-screen') {
                    this.showScreen('main-screen');
                }
                break;
            case 's':
            case 'S':
                if (this.state.currentScreen === 'main-screen') {
                    this.startQuiz('all');
                }
                break;
            case 'Enter':
                // يتم التعامل مع Enter في الخيارات بشكل منفصل
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                if (this.state.currentScreen === 'quiz-screen') {
                    const options = document.querySelectorAll('.option');
                    const index = parseInt(event.key) - 1;
                    if (options[index]) {
                        const key = options[index].getAttribute('data-key');
                        this.selectOption(key);
                    }
                }
                break;
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.geoReadyApp = new GeoReady();
});