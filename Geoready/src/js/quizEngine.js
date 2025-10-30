// محرك الكويزات الرئيسي
class QuizEngine {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.startTime = null;
        this.timer = null;
        this.quizzes = {};
    }

    async loadQuiz(quizId) {
        try {
            const response = await fetch(`assets/data/quizzes/${quizId}.json`);
            this.currentQuiz = await response.json();
            this.quizzes[quizId] = this.currentQuiz;
            return this.currentQuiz;
        } catch (error) {
            console.error('Failed to load quiz:', error);
            throw error;
        }
    }

    async startQuiz(quizId) {
        await this.loadQuiz(quizId);
        this.currentQuestionIndex = 0;
        this.userAnswers = new Array(this.currentQuiz.questions.length).fill(null);
        this.score = 0;
        this.startTime = new Date();
        
        this.showQuizScreen();
        this.showQuestion();
        this.startTimer();
    }

    showQuizScreen() {
        // إخفاء الشاشة الرئيسية وإظهار شاشة الكويز
        document.querySelector('.main-container').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        
        this.renderQuizHeader();
    }

    renderQuizHeader() {
        const quizScreen = document.getElementById('quiz-screen');
        quizScreen.innerHTML = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <button class="back-btn" onclick="quizEngine.exitQuiz()">← رجوع</button>
                    <div class="quiz-info">
                        <h2>${this.currentQuiz.name[languageManager.currentLanguage]}</h2>
                        <p>${this.currentQuiz.description[languageManager.currentLanguage]}</p>
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
                    <button class="btn btn-secondary" id="prev-btn" onclick="quizEngine.previousQuestion()">السابق</button>
                    <button class="btn btn-primary" id="next-btn" onclick="quizEngine.nextQuestion()">التالي</button>
                    <button class="btn btn-success" id="submit-btn" onclick="quizEngine.finishQuiz()" style="display: none;">إنهاء الكويز</button>
                </div>
            </div>
        `;
    }

    showQuestion() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const container = document.getElementById('question-container');
        
        container.innerHTML = `
            <div class="question">
                <h3>${question.question[languageManager.currentLanguage]}</h3>
                ${question.image ? `<div class="question-image"><img src="${question.image}" alt="Question Image"></div>` : ''}
                
                <div class="options-container">
                    ${question.options.map(option => `
                        <div class="option" data-option-id="${option.id}" onclick="quizEngine.selectOption('${option.id}')">
                            <span class="option-id">${option.id}</span>
                            <span class="option-text">${option.text[languageManager.currentLanguage]}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${this.userAnswers[this.currentQuestionIndex] ? `
                    <div class="explanation" id="explanation" style="display: none;">
                        <h4>التفسير:</h4>
                        <p>${question.explanation[languageManager.currentLanguage]}</p>
                    </div>
                ` : ''}
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
        // إزالة التحديد من جميع الخيارات
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // تحديد الخيار الجديد
        const selectedOption = document.querySelector(`[data-option-id="${optionId}"]`);
        selectedOption.classList.add('selected');
        
        // حفظ الإجابة
        this.userAnswers[this.currentQuestionIndex] = optionId;
        
        // إظهار التفسير إذا كان متاحاً
        this.showExplanation();
        
        this.updateNavigation();
    }

    highlightSelectedOption(optionId) {
        const option = document.querySelector(`[data-option-id="${optionId}"]`);
        if (option) {
            option.classList.add('selected');
        }
    }

    showExplanation() {
        const explanation = document.getElementById('explanation');
        if (explanation) {
            explanation.style.display = 'block';
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
        
        prevBtn.style.display = this.currentQuestionIndex === 0 ? 'none' : 'block';
        nextBtn.style.display = this.currentQuestionIndex === this.currentQuiz.questions.length - 1 ? 'none' : 'block';
        submitBtn.style.display = this.currentQuestionIndex === this.currentQuiz.questions.length - 1 ? 'block' : 'none';
        
        // تحديث رقم السؤال الحالي
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.currentQuiz.questions.length) * 100;
        document.getElementById('quiz-progress').style.width = `${progress}%`;
    }

    startTimer() {
        this.timer = setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now - this.startTime) / 1000);
            const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
            const seconds = (diff % 60).toString().padStart(2, '0');
            document.getElementById('quiz-timer').textContent = `${minutes}:${seconds}`;
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
        this.stopTimer();
        const finalScore = this.calculateScore();
        const timeSpent = Math.floor((new Date() - this.startTime) / 1000);
        
        await this.showResults(finalScore, timeSpent);
        this.saveProgress(finalScore);
    }

    async showResults(score, timeSpent) {
        const percentage = (score / this.currentQuiz.questions.length) * 100;
        const passed = percentage >= this.currentQuiz.passing_score;
        
        document.getElementById('quiz-screen').innerHTML = `
            <div class="results-container">
                <div class="results-header ${passed ? 'passed' : 'failed'}">
                    <div class="result-icon">${passed ? '🎉' : '😔'}</div>
                    <h2>${passed ? 'مبروك! لقد نجحت' : 'حاول مرة أخرى'}</h2>
                    <p>${this.currentQuiz.name[languageManager.currentLanguage]}</p>
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
                    <button class="btn btn-primary" onclick="quizEngine.restartQuiz()">إعادة الكويز</button>
                    <button class="btn btn-secondary" onclick="quizEngine.exitQuiz()">العودة للرئيسية</button>
                </div>
            </div>
        `;
    }

    restartQuiz() {
        this.startQuiz(this.currentQuiz.id);
    }

    exitQuiz() {
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
            passed: (score / this.currentQuiz.questions.length) * 100 >= this.currentQuiz.passing_score
        };
        localStorage.setItem('quiz-progress', JSON.stringify(progress));
    }
}

// جعل المحرك متاحاً globally
window.quizEngine = new QuizEngine();