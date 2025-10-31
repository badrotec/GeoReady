// نظام تشغيل الأصوات
class SoundManager {
    constructor() {
        this.sounds = {
            correct: 'sounds/correct.mp3',
            wrong: 'sounds/wrong.mp3', 
            perfect: 'sounds/perfect.mp3',
            click: 'sounds/click.mp3'
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
        
        console.log('GeoLearn App Started! 🚀');
        console.log('Loaded quizzes:', this.quizzes.length);
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

    // عرض الكويزات في الشبكة
    renderQuizzes() {
        const container = document.getElementById('quizzes-container');
        if (!container) {
            console.error('❌ quizzes-container element not found!');
            return;
        }

        console.log('🎯 Rendering quizzes:', this.quizzes.length);
        
        container.innerHTML = this.quizzes.map(quiz => `
            <div class="quiz-card" onclick="app.startQuiz('${quiz.id}')">
                <div class="quiz-icon">${quiz.icon}</div>
                <h3 class="quiz-title">${quiz.name[this.currentLanguage] || quiz.name.ar}</h3>
                <p class="quiz-description">${quiz.description[this.currentLanguage] || quiz.description.ar}</p>
                <div class="quiz-meta">
                    <span>${quiz.questions?.length || 0} أسئلة</span>
                    <span class="quiz-level level-${quiz.level}">${this.getLevelText(quiz.level)}</span>
                </div>
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

        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.currentQuiz.questions.length).fill(null);
        this.score = 0;
        this.quizStartTime = new Date();
        
        this.showQuizScreen();
        this.showQuestion();
        this.startTimer();
    }

    showQuizScreen() {
        document.querySelector('.main-container').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        
        this.renderQuizHeader();
    }

    renderQuizHeader() {
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
                        <div class="stat">السؤال <span id="current-question">1</span> من ${this.currentQuiz.questions.length}</div>
                        <div class="stat">النقاط: <span id="current-score">0</span></div>
                        <div class="stat">الوقت: <span id="quiz-timer">00:00</span></div>
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

    showQuestion() {
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
        
        // تحديد الخيار المختار مسبقاً إن وجد
        const selectedOptionId = this.userAnswers[this.currentQuestionIndex];
        if (selectedOptionId) {
            this.highlightSelectedOption(selectedOptionId);
        }
    }

    selectOption(optionId) {
        this.soundManager.play('click');
        
        // إزالة التحديد من جميع الخيارات
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // تحديد الخيار الجديد
        const selectedOption = document.querySelector(`[data-option-id="${optionId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
        
        // حفظ الإجابة
        this.userAnswers[this.currentQuestionIndex] = optionId;
        
        // تشغيل صوت الإجابة
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const selectedOptionData = question.options.find(opt => opt.id === optionId);
        
        if (selectedOptionData) {
            if (selectedOptionData.correct) {
                this.soundManager.play('correct');
            } else {
                this.soundManager.play('wrong');
            }
        }
        
        this.updateNavigation();
    }

    highlightSelectedOption(optionId) {
        const option = document.querySelector(`[data-option-id="${optionId}"]`);
        if (option) {
            option.classList.add('selected');
        }
    }

    nextQuestion() {
        this.soundManager.play('click');
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
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

    startTimer() {
        this.timer = setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now - this.quizStartTime) / 1000);
            const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
            const seconds = (diff % 60).toString().padStart(2, '0');
            const timerElement = document.getElementById('quiz-timer');
            if (timerElement) {
                timerElement.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
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
        this.soundManager.play('click');
        this.stopTimer();
        const finalScore = this.calculateScore();
        const timeSpent = Math.floor((new Date() - this.quizStartTime) / 1000);
        
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
        this.stopTimer();
        document.getElementById('quiz-screen').classList.add('hidden');
        document.querySelector('.main-container').classList.remove('hidden');
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