class GeoReady {
    constructor() {
        this.initializeApp();
        this.bindEvents();
    }

    initializeApp() {
        // الحالة الرئيسية للتطبيق
        this.state = {
            currentScreen: 'main',
            selectedCategory: 'all',
            questionCount: 10,
            timePerQuestion: 30,
            questions: [],
            currentQuestionIndex: 0,
            userAnswers: [],
            timer: null,
            timeLeft: 0,
            isPaused: false,
            isSoundEnabled: true,
            audioContext: null,
            sounds: {},
            audioInitialized: false
        };

        // عناصر DOM الرئيسية
        this.elements = {
            screens: {
                main: document.getElementById('main-screen'),
                quiz: document.getElementById('quiz-screen'),
                results: document.getElementById('results-screen')
            },
            categorySelect: document.getElementById('category-select'),
            startBtn: document.getElementById('start-btn'),
            homeBtn: document.getElementById('home-btn'),
            soundBtn: document.getElementById('sound-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            skipBtn: document.getElementById('skip-btn'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            questionText: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            progressText: document.getElementById('progress-text'),
            timer: document.getElementById('timer'),
            finalScore: document.getElementById('final-score'),
            scorePercent: document.getElementById('score-percent'),
            scoreDetails: document.getElementById('score-details'),
            scoresList: document.getElementById('scores-list'),
            pastResultsList: document.getElementById('past-results-list'),
            mistakesList: document.getElementById('mistakes-list')
        };

        this.initializeCategories();
        this.loadHighScores();
    }

    initializeCategories() {
        const categories = [
            { id: 'BasicGeology', name: 'الجيولوجيا الأساسية' },
            { id: 'Geochemistry', name: 'الجيوكيمياء' },
            { id: 'Geophysics', name: 'الجيوفيزياء' },
            { id: 'Hydrogeology', name: 'الهيدروجيولوجيا' },
            { id: 'Petrology', name: 'علم الصخور' },
            { id: 'Structuralgeology', name: 'الجيولوجيا التركيبية' },
            { id: 'sedimentarygeology', name: 'الجيولوجيا الرسوبية' },
            { id: 'all', name: 'كل الفئات' }
        ];

        this.elements.categorySelect.innerHTML = categories.map(cat => `
            <button class="category-btn" data-category="${cat.id}">
                ${cat.name}
            </button>
        `).join('');

        // اختيار أول فئة افتراضيًا
        const firstBtn = this.elements.categorySelect.querySelector('.category-btn');
        if (firstBtn) {
            firstBtn.classList.add('active');
            this.state.selectedCategory = firstBtn.dataset.category;
        }
    }

    bindEvents() {
        // أحداث القائمة الرئيسية
        this.elements.categorySelect.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.selectCategory(e.target);
            }
        });

        document.querySelectorAll('.number-btn, .time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectSetting(e.target);
            });
        });

        this.elements.startBtn.addEventListener('click', () => this.startQuiz());

        // أحداث شاشة الاختبار
        this.elements.homeBtn.addEventListener('click', () => this.showExitModal());
        this.elements.soundBtn.addEventListener('click', () => this.toggleSound());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.skipBtn.addEventListener('click', () => this.skipQuestion());
        this.elements.prevBtn.addEventListener('click', () => this.previousQuestion());
        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());

        // أحداث المودالات
        document.getElementById('confirm-exit').addEventListener('click', () => this.exitToMain());
        document.getElementById('cancel-exit').addEventListener('click', () => this.hideModals());
        document.getElementById('results-btn').addEventListener('click', () => this.showResultsModal());
        document.getElementById('close-results').addEventListener('click', () => this.hideModals());
        document.getElementById('mistakes-btn').addEventListener('click', () => this.showMistakesModal());
        document.getElementById('close-mistakes').addEventListener('click', () => this.hideModals());

        // أحداث شاشة النتائج
        document.getElementById('restart-btn').addEventListener('click', () => this.restartQuiz());
        document.getElementById('review-btn').addEventListener('click', () => this.reviewMistakes());
        document.getElementById('main-menu-btn').addEventListener('click', () => this.showScreen('main'));

        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // منع إعادة تحميل الصفحة عن طريق الخطأ
        window.addEventListener('beforeunload', (e) => {
            if (this.state.currentScreen === 'quiz') {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    selectCategory(button) {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.state.selectedCategory = button.dataset.category;
    }

    selectSetting(button) {
        const parent = button.parentElement;
        parent.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        if (parent.classList.contains('number-select')) {
            this.state.questionCount = button.dataset.count;
        } else if (parent.classList.contains('time-select')) {
            this.state.timePerQuestion = parseInt(button.dataset.time);
        }
    }

    async startQuiz() {
        try {
            this.elements.startBtn.disabled = true;
            this.elements.startBtn.textContent = 'جاري التحميل...';

            await this.loadQuestions();
            
            if (this.state.questions.length === 0) {
                throw new Error('لا توجد أسئلة متاحة');
            }

            this.state.currentQuestionIndex = 0;
            this.state.userAnswers = [];
            this.state.isPaused = false;
            
            this.initializeAudio();
            this.showScreen('quiz');
            this.displayQuestion();

        } catch (error) {
            alert(`خطأ في تحميل الأسئلة: ${error.message}`);
            console.error('Error loading questions:', error);
        } finally {
            this.elements.startBtn.disabled = false;
            this.elements.startBtn.textContent = 'ابدأ الاختبار';
        }
    }

    async loadQuestions() {
        this.state.questions = [];

        if (this.state.selectedCategory === 'all') {
            // تحميل جميع الفئات
            const categories = [
                'BasicGeology', 'Geochemistry', 'Geophysics', 
                'Hydrogeology', 'Petrology', 'Structuralgeology', 
                'sedimentarygeology'
            ];

            for (const category of categories) {
                const questions = await this.loadCategoryQuestions(category);
                if (questions && questions.length > 0) {
                    this.state.questions.push(...questions);
                }
            }
        } else {
            // تحميل فئة محددة
            const questions = await this.loadCategoryQuestions(this.state.selectedCategory);
            if (questions && questions.length > 0) {
                this.state.questions = questions;
            }
        }

        // تحديد العدد النهائي للأسئلة
        if (this.state.questionCount !== 'all') {
            const count = parseInt(this.state.questionCount);
            if (this.state.questions.length > count) {
                this.shuffleArray(this.state.questions);
                this.state.questions = this.state.questions.slice(0, count);
            }
        }

        // خلط الأسئلة
        this.shuffleArray(this.state.questions);
    }

    async loadCategoryQuestions(category) {
        try {
            const response = await fetch(`${category}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const questions = await response.json();
            
            // التحقق من صحة البيانات
            if (!Array.isArray(questions)) {
                console.warn(`ملف ${category}.json ليس مصفوفة`);
                return null;
            }

            if (questions.length !== 25) {
                console.warn(`ملف ${category}.json غير مكتمل - مطلوب 25 سؤال، الملف يحتوي على ${questions.length}`);
                return null;
            }

            // التحقق من كل سؤال
            const validQuestions = questions.filter((q, index) => {
                const isValid = q.id && 
                    q.question && 
                    q.options && 
                    typeof q.options === 'object' &&
                    q.options.أ && q.options.ب && q.options.ج && q.options.د &&
                    ['أ', 'ب', 'ج', 'د'].includes(q.answer);

                if (!isValid) {
                    console.warn(`سؤال غير صالح في ملف ${category}.json عند الفهرس ${index}`);
                }
                return isValid;
            });

            if (validQuestions.length !== 25) {
                console.warn(`ملف ${category}.json يحتوي على أسئلة غير صالحة`);
                return null;
            }

            return validQuestions;

        } catch (error) {
            console.error(`Error loading ${category}:`, error);
            return null;
        }
    }

    displayQuestion() {
        const question = this.state.questions[this.state.currentQuestionIndex];
        
        if (!question) return;

        // تحديث شريط التقدم
        this.elements.progressText.textContent = 
            `السؤال ${this.state.currentQuestionIndex + 1} من ${this.state.questions.length}`;

        // عرض نص السؤال
        this.elements.questionText.textContent = question.question;

        // تحضير وعرض الخيارات
        this.displayOptions(question);

        // إعادة تعيين الأزرار
        this.elements.prevBtn.disabled = this.state.currentQuestionIndex === 0;
        this.elements.nextBtn.disabled = false;

        // بدء المؤقت
        this.startTimer();
    }

    displayOptions(question) {
        this.elements.optionsContainer.innerHTML = '';

        // تحويل الخيارات إلى مصفوفة مع الحفاظ على المفاتيح الأصلية
        const optionsArray = Object.entries(question.options).map(([key, text]) => ({
            key,
            text
        }));

        // خلط ترتيب العرض مع الحفاظ على المفاتيح الأصلية
        this.shuffleArray(optionsArray);

        // إنشاء أزرار الخيارات
        optionsArray.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.dataset.key = option.key;
            button.innerHTML = `
                <span class="option-label">${option.key}</span>
                ${option.text}
            `;
            
            button.addEventListener('click', () => this.selectAnswer(option.key));
            
            this.elements.optionsContainer.appendChild(button);
        });
    }

    selectAnswer(selectedKey) {
        if (this.state.isPaused) return;

        const question = this.state.questions[this.state.currentQuestionIndex];
        const isCorrect = selectedKey === question.answer;

        // حفظ إجابة المستخدم
        this.state.userAnswers[this.state.currentQuestionIndex] = {
            selected: selectedKey,
            correct: question.answer,
            isCorrect: isCorrect,
            question: question.question,
            options: question.options
        };

        // إيقاف المؤقت
        this.stopTimer();

        // تعطيل جميع الخيارات
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.add('disabled');
            btn.removeEventListener('click', this.selectAnswer);
        });

        // تلوين الإجابات بناءً على المفاتيح الأصلية فقط
        document.querySelectorAll('.option-btn').forEach(btn => {
            const key = btn.dataset.key;
            
            // إزالة أي فئات سابقة
            btn.classList.remove('correct', 'wrong');
            
            if (key === question.answer) {
                btn.classList.add('correct');
                btn.setAttribute('aria-label', 'إجابة صحيحة');
            } else if (key === selectedKey && !isCorrect) {
                btn.classList.add('wrong');
                btn.setAttribute('aria-label', 'إجابة خاطئة');
            }
        });

        // تشغيل الصوت المناسب
        this.playSound(isCorrect ? 'correct' : 'wrong');

        // الانتقال للسؤال التالي بعد تأخير
        setTimeout(() => {
            if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
                this.state.currentQuestionIndex++;
                this.displayQuestion();
            } else {
                this.finishQuiz();
            }
        }, 2000);
    }

    startTimer() {
        this.stopTimer();
        this.state.timeLeft = this.state.timePerQuestion;
        this.updateTimerDisplay();

        this.state.timer = setInterval(() => {
            if (!this.state.isPaused) {
                this.state.timeLeft--;
                this.updateTimerDisplay();

                if (this.state.timeLeft <= 0) {
                    this.handleTimeout();
                }
            }
        }, 1000);
    }

    stopTimer() {
        if (this.state.timer) {
            clearInterval(this.state.timer);
            this.state.timer = null;
        }
    }

    updateTimerDisplay() {
        this.elements.timer.textContent = this.state.timeLeft;
        
        // تغيير اللون بناءً على الوقت المتبقي
        this.elements.timer.className = 'timer';
        if (this.state.timeLeft <= 10) {
            this.elements.timer.classList.add('danger');
        } else if (this.state.timeLeft <= this.state.timePerQuestion * 0.3) {
            this.elements.timer.classList.add('warning');
        }
    }

    handleTimeout() {
        this.stopTimer();
        
        const question = this.state.questions[this.state.currentQuestionIndex];
        
        // حفظ كإجابة خاطئة
        this.state.userAnswers[this.state.currentQuestionIndex] = {
            selected: null,
            correct: question.answer,
            isCorrect: false,
            question: question.question,
            options: question.options
        };

        // تلوين الإجابة الصحيحة فقط
        document.querySelectorAll('.option-btn').forEach(btn => {
            const key = btn.dataset.key;
            btn.classList.add('disabled');
            btn.removeEventListener('click', this.selectAnswer);
            
            // إزالة أي فئات سابقة
            btn.classList.remove('correct', 'wrong');
            
            if (key === question.answer) {
                btn.classList.add('correct');
            }
        });

        // تشغيل صوت الوقت انتهى
        this.playSound('timeout');

        // الانتقال التلقائي
        setTimeout(() => {
            if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
                this.state.currentQuestionIndex++;
                this.displayQuestion();
            } else {
                this.finishQuiz();
            }
        }, 2000);
    }

    skipQuestion() {
        this.handleTimeout(); // نفس سلوك انتهاء الوقت
    }

    previousQuestion() {
        if (this.state.currentQuestionIndex > 0) {
            this.stopTimer();
            this.state.currentQuestionIndex--;
            this.displayQuestion();
        }
    }

    nextQuestion() {
        if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
            this.stopTimer();
            this.state.currentQuestionIndex++;
            this.displayQuestion();
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        this.stopTimer();
        this.calculateResults();
        this.saveResults();
        this.showScreen('results');
    }

    calculateResults() {
        const total = this.state.questions.length;
        const correct = this.state.userAnswers.filter(answer => answer && answer.isCorrect).length;
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

        this.elements.scorePercent.textContent = `${percentage}%`;
        this.elements.scoreDetails.textContent = 
            `${correct} إجابة صحيحة من ${total}`;

        // تحديث دائرة النتيجة
        const scoreCircle = document.querySelector('.score-circle');
        const degrees = (percentage / 100) * 360;
        scoreCircle.style.background = 
            `conic-gradient(var(--primary-color) 0deg ${degrees}deg, var(--border) ${degrees}deg 360deg)`;
    }

    saveResults() {
        const results = {
            date: new Date().toISOString(),
            category: this.state.selectedCategory,
            totalQuestions: this.state.questions.length,
            correctCount: this.state.userAnswers.filter(a => a.isCorrect).length,
            percent: Math.round((this.state.userAnswers.filter(a => a.isCorrect).length / this.state.questions.length) * 100),
            userAnswers: this.state.userAnswers
        };

        let savedScores = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        savedScores.push(results);
        
        // حفظ فقط آخر 50 نتيجة
        if (savedScores.length > 50) {
            savedScores = savedScores.slice(-50);
        }
        
        localStorage.setItem('GeoReady_scores', JSON.stringify(savedScores));
        this.displayHighScores();
    }

    loadHighScores() {
        this.displayHighScores();
    }

    displayHighScores() {
        const savedScores = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        const topScores = savedScores
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 5);

        this.elements.scoresList.innerHTML = topScores.length > 0 ? 
            topScores.map(score => `
                <div class="score-item">
                    <div class="score-info">
                        <div>${new Date(score.date).toLocaleDateString('ar-EG')}</div>
                        <div>${score.category === 'all' ? 'كل الفئات' : score.category}</div>
                    </div>
                    <div class="score-value">${score.percent}%</div>
                </div>
            `).join('') :
            '<p>لا توجد نتائج سابقة</p>';
    }

    showResultsModal() {
        const savedScores = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        const recentScores = savedScores.slice(-10).reverse();

        this.elements.pastResultsList.innerHTML = recentScores.length > 0 ? 
            recentScores.map(score => `
                <div class="score-item">
                    <div class="score-info">
                        <div>${new Date(score.date).toLocaleDateString('ar-EG')}</div>
                        <div>${score.category === 'all' ? 'كل الفئات' : score.category}</div>
                        <div>${score.correctCount}/${score.totalQuestions}</div>
                    </div>
                    <div class="score-value">${score.percent}%</div>
                </div>
            `).join('') :
            '<p>لا توجد نتائج سابقة</p>';

        this.showModal('results-modal');
    }

    showMistakesModal() {
        const savedScores = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        if (savedScores.length === 0) {
            this.elements.mistakesList.innerHTML = '<p>لا توجد نتائج سابقة</p>';
            this.showModal('mistakes-modal');
            return;
        }

        const lastResult = savedScores[savedScores.length - 1];
        const mistakes = lastResult.userAnswers.filter(answer => !answer.isCorrect);

        this.elements.mistakesList.innerHTML = mistakes.length > 0 ? 
            mistakes.map((mistake, index) => `
                <div class="mistake-item">
                    <div class="mistake-question">${index + 1}. ${mistake.question}</div>
                    <div class="mistake-options">
                        ${Object.entries(mistake.options).map(([key, text]) => `
                            <div class="mistake-option ${key === mistake.correct ? 'correct' : key === mistake.selected ? 'wrong' : ''}">
                                ${key}. ${text}
                            </div>
                        `).join('')}
                    </div>
                    <div class="mistake-answer">الإجابة الصحيحة: ${mistake.correct}</div>
                </div>
            `).join('') :
            '<p>لا توجد أخطاء في آخر اختبار</p>';

        this.showModal('mistakes-modal');
    }

    reviewMistakes() {
        const mistakes = this.state.userAnswers.filter(answer => !answer.isCorrect);
        
        this.elements.mistakesList.innerHTML = mistakes.length > 0 ? 
            mistakes.map((mistake, index) => `
                <div class="mistake-item">
                    <div class="mistake-question">${index + 1}. ${mistake.question}</div>
                    <div class="mistake-options">
                        ${Object.entries(mistake.options).map(([key, text]) => `
                            <div class="mistake-option ${key === mistake.correct ? 'correct' : key === mistake.selected ? 'wrong' : ''}">
                                ${key}. ${text}
                            </div>
                        `).join('')}
                    </div>
                    <div class="mistake-answer">الإجابة الصحيحة: ${mistake.correct}</div>
                </div>
            `).join('') :
            '<p>لا توجد أخطاء في هذا الاختبار</p>';

        this.showModal('mistakes-modal');
    }

    initializeAudio() {
        if (this.state.audioInitialized) return;

        try {
            // محاولة تحميل ملفات الصوت
            this.state.sounds = {
                correct: new Audio('sounds/correct.mp3'),
                wrong: new Audio('sounds/wrong.mp3'),
                timeout: new Audio('sounds/timeout.mp3')
            };

            // إعداد Web Audio API كبديل
            this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.state.audioInitialized = true;
        } catch (error) {
            console.warn('تعذر تحميل ملفات الصوت، سيتم استخدام الأصوات البديلة');
        }
    }

    playSound(type) {
        if (!this.state.isSoundEnabled || !this.state.audioInitialized) return;

        try {
            if (this.state.sounds[type]) {
                this.state.sounds[type].currentTime = 0;
                this.state.sounds[type].play().catch(e => {
                    console.warn(`تعذر تشغيل الصوت ${type}:`, e);
                    this.playFallbackSound(type);
                });
            } else {
                this.playFallbackSound(type);
            }
        } catch (error) {
            this.playFallbackSound(type);
        }
    }

    playFallbackSound(type) {
        if (!this.state.audioContext) return;

        const oscillator = this.state.audioContext.createOscillator();
        const gainNode = this.state.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.state.audioContext.destination);

        let frequency = 800;
        let duration = 0.3;

        switch (type) {
            case 'correct':
                frequency = 1000;
                break;
            case 'wrong':
                frequency = 400;
                break;
            case 'timeout':
                frequency = 300;
                duration = 0.5;
                break;
        }

        oscillator.frequency.setValueAtTime(frequency, this.state.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.state.audioContext.currentTime);
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.state.audioContext.currentTime + duration);
        oscillator.stop(this.state.audioContext.currentTime + duration);
    }

    toggleSound() {
        this.state.isSoundEnabled = !this.state.isSoundEnabled;
        this.elements.soundBtn.textContent = this.state.isSoundEnabled ? '🔊' : '🔇';
        this.elements.soundBtn.setAttribute('title', this.state.isSoundEnabled ? 'كتم الصوت' : 'تشغيل الصوت');
    }

    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        this.elements.pauseBtn.textContent = this.state.isPaused ? '▶️' : '⏸️';
        this.elements.pauseBtn.setAttribute('title', this.state.isPaused ? 'استئناف' : 'إيقاف');
    }

    showScreen(screenName) {
        Object.values(this.elements.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.elements.screens[screenName].classList.add('active');
        this.state.currentScreen = screenName;
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.getElementById('modal-overlay').classList.add('active');
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.getElementById('modal-overlay').classList.remove('active');
    }

    showExitModal() {
        this.showModal('exit-modal');
    }

    exitToMain() {
        this.stopTimer();
        this.hideModals();
        this.showScreen('main');
    }

    restartQuiz() {
        this.startQuiz();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    handleKeyboard(e) {
        if (this.state.currentScreen === 'quiz' && !this.state.isPaused) {
            // اختيار الخيارات بالأرقام 1-4
            if (e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1;
                const buttons = document.querySelectorAll('.option-btn');
                if (buttons[index] && !buttons[index].classList.contains('disabled')) {
                    buttons[index].click();
                }
            }
            
            // التنقل بين الأسئلة
            else if (e.key === 'ArrowRight' && !this.elements.prevBtn.disabled) {
                this.previousQuestion();
            } else if (e.key === 'ArrowLeft' && !this.elements.nextBtn.disabled) {
                this.nextQuestion();
            } else if (e.key === 's' || e.key === 'S') {
                this.skipQuestion();
            } else if (e.key === 'Escape') {
                this.showExitModal();
            }
        }
        
        // بدء الاختبار من الشاشة الرئيسية
        else if (this.state.currentScreen === 'main' && (e.key === 'Enter' || e.key === ' ')) {
            this.startQuiz();
        }
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new GeoReady();
});

// اختبار صحة ملفات JSON (للوضع التطويري)
if (window.location.search.includes('dev=true')) {
    console.log('✅ GeoReady - وضع التطوير مفعل');
    
    // اختبار تحميل جميع ملفات JSON
    const testJSONFiles = async () => {
        const categories = [
            'BasicGeology', 'Geochemistry', 'Geophysics', 
            'Hydrogeology', 'Petrology', 'Structuralgeology', 
            'sedimentarygeology'
        ];

        for (const category of categories) {
            try {
                const response = await fetch(`${category}.json`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const questions = await response.json();
                
                if (!Array.isArray(questions) || questions.length !== 25) {
                    console.error(`❌ JSON validation failed: ${category} - Expected 25 questions, got ${questions.length}`);
                    continue;
                }

                const validQuestions = questions.filter(q => 
                    q.id && 
                    q.question && 
                    q.options && 
                    typeof q.options === 'object' &&
                    q.options.أ && q.options.ب && q.options.ج && q.options.د &&
                    ['أ', 'ب', 'ج', 'د'].includes(q.answer)
                );

                if (validQuestions.length !== 25) {
                    console.error(`❌ JSON validation failed: ${category} - ${25 - validQuestions.length} invalid questions`);
                } else {
                    console.log(`✅ ${category}: جميع الأسئلة صالحة`);
                }

            } catch (error) {
                console.error(`❌ Failed to load ${category}:`, error);
            }
        }
    };

    // تشغيل الاختبار بعد تحميل الصفحة
    setTimeout(testJSONFiles, 1000);
}