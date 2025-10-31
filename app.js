// نظام تشغيل الأصوات المصحح - بدون صوت النقر
class SoundManager {
    constructor() {
        this.sounds = {
            correct: 'sounds/correct.mp3',
            wrong: 'sounds/wrong.mp3', 
            perfect: 'sounds/perfect.mp3',
            timer: 'sounds/timer.mp3'
        };
        this.enabled = true;
        this.audioElements = {};
        this.preloadSounds();
    }

    preloadSounds() {
        Object.keys(this.sounds).forEach(soundName => {
            const audio = new Audio(this.sounds[soundName]);
            audio.preload = 'auto';
            audio.load();
            audio.loop = false;
            audio.volume = 0.7;
            this.audioElements[soundName] = audio;
        });
    }

    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
            const audio = this.audioElements[soundName];
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => {
                    console.log(`🔇 ${soundName} error:`, e);
                });
            }
        } catch (error) {
            console.log(`🔇 ${soundName} failed:`, error);
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('sound-enabled', enabled.toString());
    }

    isEnabled() {
        return this.enabled;
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
        this.questionTimer = null;
        this.timeLeft = 15;
        this.isAnswerRevealed = false;
        this.dailyQuizPlayed = false;
        this.isProcessingSelection = false;
        this.lastTimerSound = 0;
        
        this.soundManager = new SoundManager();
        
        this.init();
    }

    async init() {
        await this.preloadAssets();
        await this.loadQuizzes();
        this.renderQuizzes();
        this.setupEventListeners();
        this.loadUserProgress();
        this.loadUserPreferences();
        this.setupDailyQuiz();
        this.setupSettingsModal();
        
        console.log('GeoLearn App Started! 🚀');
    }

    async preloadAssets() {
        console.log('🔄 جاري تحميل الأصوات...');
        return new Promise(resolve => {
            setTimeout(resolve, 300);
        });
    }

    setupSettingsModal() {
        const soundEnabled = localStorage.getItem('sound-enabled');
        if (soundEnabled !== null) {
            this.soundManager.setEnabled(soundEnabled === 'true');
        }
    }

    showSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            const soundToggle = modal.querySelector('#sound-toggle');
            if (soundToggle) {
                soundToggle.checked = this.soundManager.isEnabled();
            }
            modal.style.display = 'flex';
        }
    }

    saveSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            const soundToggle = modal.querySelector('#sound-toggle');
            if (soundToggle) {
                this.soundManager.setEnabled(soundToggle.checked);
            }
            modal.style.display = 'none';
        }
    }

    setupDailyQuiz() {
        const today = new Date().toDateString();
        const lastPlayed = localStorage.getItem('daily-quiz-date');
        
        if (lastPlayed !== today) {
            localStorage.setItem('daily-quiz-date', today);
            localStorage.setItem('daily-quiz-played', 'false');
        }
        
        this.dailyQuizPlayed = localStorage.getItem('daily-quiz-played') === 'true';
    }

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
            }
        ];
    }

    renderQuizzes() {
        const container = document.getElementById('quizzes-container');
        if (!container) return;

        container.innerHTML = this.quizzes.map(quiz => `
            <div class="quiz-card ${quiz.isDaily ? 'daily-quiz' : ''}" 
                 data-quiz-id="${quiz.id}">
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

        this.setupQuizClickHandlers();
    }

    setupQuizClickHandlers() {
        const quizCards = document.querySelectorAll('.quiz-card');
        
        quizCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // لا يوجد صوت نقر - تنفيذ مباشر
                const quizId = card.getAttribute('data-quiz-id');
                this.startQuiz(quizId);
            });
        });
    }

    getLevelText(level) {
        const levels = {
            'beginner': 'مبتدئ',
            'intermediate': 'متوسط', 
            'advanced': 'متقدم'
        };
        return levels[level] || level;
    }

    async startQuiz(quizId) {
        this.currentQuiz = this.quizzes.find(q => q.id === quizId);
        
        if (!this.currentQuiz) {
            alert('الكويز غير موجود');
            return;
        }

        if (this.currentQuiz.isDaily && this.dailyQuizPlayed) {
            alert('لقد لعبت الكويز اليومي بالفعل! عد غداً 🎯');
            return;
        }

        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.currentQuiz.questions.length).fill(null);
        this.score = 0;
        this.quizStartTime = new Date();
        this.isAnswerRevealed = false;
        this.isProcessingSelection = false;
        
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
                    <button class="settings-btn" onclick="app.showSettings()">⚙️</button>
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

    startQuestionTimer() {
        this.stopQuestionTimer();
        
        this.timeLeft = 15;
        this.updateQuestionTimer();
        this.lastTimerSound = 0;
        
        this.questionTimer = setInterval(() => {
            this.timeLeft--;
            this.updateQuestionTimer();
            
            // تشغيل صوت المؤقت فقط عند الثانية 5 بالضبط
            if (this.timeLeft === 5) {
                this.soundManager.play('timer');
                this.lastTimerSound = Date.now();
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
        
        this.revealCorrectAnswer();
        
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
        this.stopQuestionTimer();
        this.isAnswerRevealed = false;
        this.isProcessingSelection = false;
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
        if (this.isAnswerRevealed || this.isProcessingSelection) return;
        
        this.isProcessingSelection = true;
        
        // لا يوجد صوت نقر - تنفيذ مباشر
        this.stopQuestionTimer();
        this.isAnswerRevealed = true;
        
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const selectedOption = question.options.find(opt => opt.id === optionId);
        const correctOption = question.options.find(opt => opt.correct);
        
        document.querySelectorAll('.option').forEach(opt => {
            const optId = opt.getAttribute('data-option-id');
            if (optId === correctOption.id) {
                opt.classList.add('correct');
            } else if (optId === optionId && !selectedOption.correct) {
                opt.classList.add('wrong');
            }
        });
        
        this.userAnswers[this.currentQuestionIndex] = optionId;
        
        // تشغيل الصوت المناسب فقط
        setTimeout(() => {
            if (selectedOption.correct) {
                this.soundManager.play('correct');
                this.score++;
                this.updateScore();
            } else {
                this.soundManager.play('wrong');
            }
            
            this.isProcessingSelection = false;
        }, 300);
        
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
        // لا يوجد صوت نقر - تنفيذ مباشر
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        } else {
            this.finishQuiz();
        }
    }

    previousQuestion() {
        // لا يوجد صوت نقر - تنفيذ مباشر
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
        const finalScore = this.calculateScore();
        const timeSpent = Math.floor((new Date() - this.quizStartTime) / 1000);
        
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
        // لا يوجد صوت نقر - تنفيذ مباشر
        this.startQuiz(this.currentQuiz.id);
    }

    exitQuiz() {
        // لا يوجد صوت نقر - تنفيذ مباشر
        this.stopQuestionTimer();
        document.getElementById('quiz-screen').classList.add('hidden');
        document.querySelector('.main-container').classList.remove('hidden');
        this.renderQuizzes();
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
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                // لا يوجد صوت نقر - تنفيذ مباشر
                this.currentLanguage = e.target.value;
                this.renderQuizzes();
            });
        }

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                // لا يوجد صوت نقر - تنفيذ مباشر
                this.toggleTheme();
            });
        }

        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                // لا يوجد صوت نقر - تنفيذ مباشر
                this.showSettings();
            });
        }

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // لا يوجد صوت نقر - تنفيذ مباشر
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
        const savedTheme = localStorage.getItem('preferred-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const savedLanguage = localStorage.getItem('preferred-language') || 'ar';
        this.currentLanguage = savedLanguage;
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = savedLanguage;
        }
    }
}

// تهيئة التطبيق
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new GeoLearnApp();
    window.app = app;
});

function startQuiz(quizId) {
    if (window.app) {
        window.app.startQuiz(quizId);
    }
}

// إغلاق نافذة الإعدادات عند النقر خارجها
document.addEventListener('click', function(e) {
    const modal = document.getElementById('settings-modal');
    if (modal && e.target === modal) {
        modal.style.display = 'none';
    }
});