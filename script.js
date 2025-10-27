// **=================================================**
// ** ملف: script.js (المنطق النهائي المحسن) **
// **=================================================**

// [1] المتغيرات العالمية والتحكم
class GeoMasterApp {
    constructor() {
        this.geologicalData = {};
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = {};
        this.quizStartTime = null;
        this.quizEndTime = null;
        this.questionTimes = [];
        this.timerInterval = null;
        
        // الإعدادات القابلة للتخصيص
        this.settings = {
            timeLimit: 20,
            pointsCorrect: 5,
            pointsWrong: -3,
            soundEffects: true,
            animations: true,
            language: 'ar'
        };
        
        this.currentLanguage = 'ar';
        this.userStats = {
            totalQuizzes: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            averageScore: 0,
            bestScore: 0
        };
        
        this.translations = {
            'ar': {
                'start_quiz': 'ابدأ الاختبار',
                'choose_domain': 'اختر مجال الاختبار:',
                'question': 'السؤال',
                'submit': 'تأكيد الإجابة',
                'next': 'التالي',
                'review_errors': 'مراجعة الأخطاء المفاهيمية:',
                'your_answer': 'إجابتك:',
                'correct_answer': 'الإجابة الصحيحة:',
                'great_job': '🌟 أداء استثنائي! معرفة جيولوجية قوية.',
                'good_job': '✨ جيد جداً! أساس متين، لكن هناك مجال للمراجعة.',
                'needs_review': '⚠️ تحتاج إلى مراجعة مكثفة لهذه المفاهيم.',
                'new_quiz': 'إعادة تشغيل النظام',
                'timer_text': 'ث',
                'time_up': '⏰ انتهى الوقت!',
                'hint': 'تلميح',
                'search_placeholder': 'ابحث عن موضوع...',
                'loading': 'جاري تحميل البيانات...',
                'error_loading': 'فشل في تحميل البيانات',
                'total_quizzes': 'اختبار مكتمل',
                'avg_score': 'متوسط النقاط',
                'performance_report': 'تقرير الأداء',
                'time_taken': 'الوقت المستغرق:',
                'avg_time': 'متوسط الوقت للسؤال:',
                'correct_answers': 'الإجابات الصحيحة:',
                'incorrect_answers': 'الإجابات الخاطئة:',
                'share_results': 'مشاركة النتائج',
                'download_report': 'تحميل التقرير',
                'settings': 'الإعدادات',
                'sound_effects': 'تأثيرات صوتية',
                'animations': 'التحريك والانتقالات'
            },
            'en': {
                'start_quiz': 'Start Quiz',
                'choose_domain': 'Choose Quiz Domain:',
                'question': 'Question',
                'submit': 'Submit Answer',
                'next': 'Next',
                'review_errors': 'Review Conceptual Errors:',
                'your_answer': 'Your Answer:',
                'correct_answer': 'Correct Answer:',
                'great_job': '🌟 Exceptional performance! Strong geological knowledge.',
                'good_job': '✨ Very good! Solid foundation, but room for review.',
                'needs_review': '⚠️ Requires intensive review of these concepts.',
                'new_quiz': 'Restart System',
                'timer_text': 's',
                'time_up': '⏰ Time\'s up!',
                'hint': 'Hint',
                'search_placeholder': 'Search for a topic...',
                'loading': 'Loading data...',
                'error_loading': 'Failed to load data',
                'total_quizzes': 'Completed Quizzes',
                'avg_score': 'Average Score',
                'performance_report': 'Performance Report',
                'time_taken': 'Time Taken:',
                'avg_time': 'Average Time per Question:',
                'correct_answers': 'Correct Answers:',
                'incorrect_answers': 'Incorrect Answers:',
                'share_results': 'Share Results',
                'download_report': 'Download Report',
                'settings': 'Settings',
                'sound_effects': 'Sound Effects',
                'animations': 'Animations & Transitions'
            },
            'fr': {
                'start_quiz': 'Commencer le Quiz',
                'choose_domain': 'Choisissez un domaine de Quiz:',
                'question': 'Question',
                'submit': 'Soumettre la Réponse',
                'next': 'Suivant',
                'review_errors': 'Revue des Erreurs Conceptuelles:',
                'your_answer': 'Votre Réponse:',
                'correct_answer': 'Bonne Réponse:',
                'great_job': '🌟 Performance exceptionnelle! Solides connaissances géologiques.',
                'good_job': '✨ Très bien! Base solide, mais il y a place à l\'amélioration.',
                'needs_review': '⚠️ Nécessite une révision intensive de ces concepts.',
                'new_quiz': 'Redémarrer le Système',
                'timer_text': 's',
                'time_up': '⏰ Temps écoulé!',
                'hint': 'Indice',
                'search_placeholder': 'Rechercher un sujet...',
                'loading': 'Chargement des données...',
                'error_loading': 'Échec du chargement des données',
                'total_quizzes': 'Quiz Terminés',
                'avg_score': 'Score Moyen',
                'performance_report': 'Rapport de Performance',
                'time_taken': 'Temps Pris:',
                'avg_time': 'Temps Moyen par Question:',
                'correct_answers': 'Réponses Correctes:',
                'incorrect_answers': 'Réponses Incorrectes:',
                'share_results': 'Partager les Résultats',
                'download_report': 'Télécharger le Rapport',
                'settings': 'Paramètres',
                'sound_effects': 'Effets Sonores',
                'animations': 'Animations & Transitions'
            }
        };
        
        this.init();
    }

    // [2] التهيئة
    async init() {
        try {
            this.showLoadingScreen();
            await this.loadSettings();
            await this.loadGeologyData();
            this.setupEventListeners();
            this.hideLoadingScreen();
            this.updateUI();
        } catch (error) {
            console.error('خطأ في تهيئة التطبيق:', error);
            this.handleInitError(error);
        }
    }

    showLoadingScreen() {
        document.getElementById('loading-screen').classList.remove('hidden');
    }

    hideLoadingScreen() {
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 500);
    }

    handleInitError(error) {
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.textContent = this.translate('error_loading');
            loadingMessage.style.color = 'var(--incorrect-color)';
        }
        console.error('فشل تهيئة التطبيق:', error);
    }

    // [3] تحميل البيانات والإعدادات
    async loadSettings() {
        try {
            const savedSettings = localStorage.getItem('geoMasterSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
            this.currentLanguage = this.settings.language;
        } catch (error) {
            console.warn('تعذر تحميل الإعدادات:', error);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('geoMasterSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('تعذر حفظ الإعدادات:', error);
        }
    }

    async loadGeologyData() {
        const loadingMessage = document.getElementById('loading-message');
        try {
            loadingMessage.textContent = this.translate('loading');
            
            const response = await fetch('./Question.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.geologicalData = await response.json();
            this.initializeTopicSelection();
            this.updateStatsDisplay();

        } catch (error) {
            console.error("فشل في تحميل بيانات الجيولوجيا:", error);
            loadingMessage.textContent = this.translate('error_loading');
            document.getElementById('start-quiz-btn').disabled = true;
            throw error;
        }
    }

    // [4] إدارة الواجهة والترجمة
    translate(key) {
        return this.translations[this.currentLanguage]?.[key] || this.translations['ar'][key] || key;
    }

    updateUI() {
        this.translateUI(this.currentLanguage);
        this.updateSettingsForm();
    }

    translateUI(langCode) {
        this.currentLanguage = langCode;
        const t = this.translations[langCode] || this.translations['ar'];

        // تحديث النصوص الرئيسية
        document.getElementById('start-quiz-btn').innerHTML = `${t.start_quiz} <i class="fas fa-satellite-dish"></i>`;
        document.getElementById('submit-btn').innerHTML = `${t.submit} <i class="fas fa-terminal"></i>`;
        document.getElementById('next-btn').innerHTML = `<i class="fas fa-arrow-right"></i> ${t.next}`;
        document.querySelector('#topics-list-container h3').textContent = t.choose_domain;
        document.querySelector('#results-screen .large-btn').innerHTML = `${t.new_quiz} <i class="fas fa-redo-alt"></i>`;
        document.querySelector('.review-log h3').textContent = t.review_errors;
        document.getElementById('topic-search').placeholder = t.search_placeholder;
        document.getElementById('hint-btn').innerHTML = `<i class="fas fa-lightbulb"></i> ${t.hint}`;
        document.getElementById('share-results').innerHTML = `<i class="fas fa-share-alt"></i> ${t.share_results}`;
        document.getElementById('download-report').innerHTML = `<i class="fas fa-download"></i> ${t.download_report}`;

        // تحديث شاشة النتائج
        if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
            document.getElementById('timer-display').textContent = `${this.settings.timeLimit}${t.timer_text}`;
            document.getElementById('question-counter').textContent = 
                `${t.question} ${this.currentQuestionIndex + 1} / ${this.currentQuestions.length}`;
        }

        // تحديث الإحصائيات
        document.querySelector('.user-stats h4').textContent = 'إحصائياتك';
        document.querySelectorAll('.stat-label')[0].textContent = t.total_quizzes;
        document.querySelectorAll('.stat-label')[1].textContent = t.avg_score;
    }

    // [5] إدارة الأحداث
    setupEventListeners() {
        // القائمة الجانبية
        document.getElementById('open-sidebar-btn').addEventListener('click', () => this.toggleSidebar(true));
        document.getElementById('close-sidebar-btn').addEventListener('click', () => this.toggleSidebar(false));
        document.getElementById('overlay').addEventListener('click', () => this.toggleSidebar(false));

        // محدد اللغة
        document.getElementById('lang-select').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // زر البدء
        document.getElementById('start-quiz-btn').addEventListener('click', () => {
            document.getElementById('start-quiz-btn').classList.add('hidden');
            document.getElementById('topics-list-container').classList.remove('hidden');
        });

        // البحث
        document.getElementById('topic-search').addEventListener('input', (e) => {
            this.filterTopics(e.target.value);
        });

        // أزرار التحكم في الاختبار
        document.getElementById('submit-btn').addEventListener('click', () => this.handleAnswerSubmission());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('close-hint').addEventListener('click', () => this.closeHint());

        // الإعدادات
        document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
        document.getElementById('close-settings').addEventListener('click', () => this.closeSettings());
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettingsChanges());
        document.getElementById('reset-settings').addEventListener('click', () => this.resetSettings());

        // مشاركة النتائج
        document.getElementById('share-results').addEventListener('click', () => this.shareResults());
        document.getElementById('download-report').addEventListener('click', () => this.downloadReport());

        // إدارة الضغط على المفاتيح
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // منع إعادة تحميل الصفحة عن طريق الخطأ
        window.addEventListener('beforeunload', (e) => {
            if (this.currentQuestions.length > 0 && this.currentQuestionIndex < this.currentQuestions.length) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    // [6] إدارة القائمة الجانبية
    toggleSidebar(open) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        if (open) {
            sidebar.classList.add('open');
            overlay.style.display = 'block';
            this.updateUserStats();
        } else {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
        }
    }

    // [7] إدارة اللغة
    changeLanguage(langCode) {
        this.settings.language = langCode;
        this.currentLanguage = langCode;
        this.translateUI(langCode);
        this.saveSettings();
    }

    // [8] إدارة المواضيع والبحث
    initializeTopicSelection() {
        const topicsList = document.getElementById('topics-list'); 
        const sidebarList = document.getElementById('sidebar-topics-list');
        const loadingMessage = document.getElementById('loading-message');

        if (loadingMessage) loadingMessage.classList.add('hidden');
        topicsList.innerHTML = '';
        sidebarList.innerHTML = '';

        // تحديث الإحصائيات
        const totalTopics = Object.keys(this.geologicalData).length;
        const totalQuestions = Object.values(this.geologicalData).reduce((sum, questions) => sum + questions.length, 0);
        
        document.getElementById('topics-count').textContent = totalTopics;
        document.getElementById('questions-count').textContent = totalQuestions;

        Object.keys(this.geologicalData).forEach(topic => {
            const topicDisplayName = topic.replace(/_/g, ' ');
            const questionCount = this.geologicalData[topic].length;

            const gridCard = this.createTopicCard(topicDisplayName, questionCount);
            const sidebarLink = this.createSidebarLink(topicDisplayName, questionCount);
            
            const startQuizHandler = () => {
                this.startQuiz(topicDisplayName, this.geologicalData[topic]);
                this.toggleSidebar(false);
            };
            
            gridCard.addEventListener('click', startQuizHandler);
            sidebarLink.addEventListener('click', startQuizHandler);
            
            topicsList.appendChild(gridCard);
            sidebarList.appendChild(sidebarLink);
        });
        
        this.translateUI(this.currentLanguage);
    }

    createTopicCard(topicName, questionCount) {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.innerHTML = `
            <div class="topic-name">${topicName}</div>
            <div class="topic-meta">${questionCount} سؤال</div>
        `;
        return card;
    }

    createSidebarLink(topicName, questionCount) {
        const link = document.createElement('a');
        link.href = "#";
        link.innerHTML = `
            <span class="topic-name">${topicName}</span>
            <span class="question-count">${questionCount}</span>
        `;
        return link;
    }

    filterTopics(searchTerm) {
        const topics = document.querySelectorAll('.topic-card');
        const searchLower = searchTerm.toLowerCase();
        
        topics.forEach(topic => {
            const topicName = topic.querySelector('.topic-name').textContent.toLowerCase();
            if (topicName.includes(searchLower)) {
                topic.style.display = 'block';
            } else {
                topic.style.display = 'none';
            }
        });
    }

    // [9] إدارة الاختبار
    startQuiz(topicTitle, questions) {
        this.clearTimer();
        
        this.currentQuestions = this.shuffleArray([...questions]);
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = {};
        this.questionTimes = [];
        this.quizStartTime = Date.now();

        document.getElementById('topic-selection').classList.add('hidden');
        document.getElementById('quiz-screen').classList.remove('hidden');
        document.getElementById('quiz-title').textContent = `اختبار: ${topicTitle}`;

        this.displayQuestion();
        this.updateScoreDisplay();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    displayQuestion() {
        this.clearTimer();
        const qContainer = document.getElementById('question-container');
        const currentQ = this.currentQuestions[this.currentQuestionIndex];
        const t = this.translate;

        if (!currentQ) {
            return this.showResults();
        }

        const questionStartTime = Date.now();
        
        this.startTimer();
        
        document.getElementById('question-counter').textContent = 
            `${t('question')} ${this.currentQuestionIndex + 1} / ${this.currentQuestions.length}`;

        let htmlContent = `
            <div class="question-header">
                <p class="question-text">${currentQ.question}</p>
                ${currentQ.explanation ? `<button class="explanation-toggle" onclick="app.toggleExplanation(this)">
                    <i class="fas fa-info-circle"></i> شرح
                </button>` : ''}
            </div>
            ${currentQ.explanation ? `<div class="question-explanation hidden">${currentQ.explanation}</div>` : ''}
            <div class="options-container">
        `;

        // خلط الخيارات عشوائياً
        const shuffledOptions = this.shuffleArray([...currentQ.options]);
        
        shuffledOptions.forEach((option) => {
            htmlContent += `
                <label class="option-label">
                    <input type="radio" name="option" value="${option}">
                    <span class="option-text">${option}</span>
                </label>
            `;
        });
        htmlContent += '</div>';
        qContainer.innerHTML = htmlContent;
        
        document.getElementById('submit-btn').classList.remove('hidden');
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('submit-btn').disabled = true;

        // تمكين زر الإرسال عند اختيار خيار
        document.querySelectorAll('input[name="option"]').forEach(input => {
            input.addEventListener('change', () => {
                document.getElementById('submit-btn').disabled = false;
            });
        });

        // حفظ وقت بدء السؤال
        this.questionTimes[this.currentQuestionIndex] = {
            startTime: questionStartTime,
            endTime: null
        };
    }

    toggleExplanation(button) {
        const explanation = button.parentElement.nextElementSibling;
        explanation.classList.toggle('hidden');
        button.innerHTML = explanation.classList.contains('hidden') ? 
            '<i class="fas fa-info-circle"></i> شرح' : 
            '<i class="fas fa-times"></i> إغلاق';
    }

    startTimer() {
        this.clearTimer();
        let timeRemaining = this.settings.timeLimit;
        const timerDisplay = document.getElementById('timer-display');
        const progressBar = document.getElementById('progress-bar-fill');
        const t = this.translate;

        progressBar.style.width = '100%';
        progressBar.style.background = 'linear-gradient(90deg, var(--neon-accent), var(--neon-blue))';
        timerDisplay.textContent = `${timeRemaining}${t('timer_text')}`;

        this.timerInterval = setInterval(() => {
            timeRemaining--;
            timerDisplay.textContent = `${timeRemaining}${t('timer_text')}`;
            
            const progressPercentage = (timeRemaining / this.settings.timeLimit) * 100;
            progressBar.style.width = `${progressPercentage}%`;

            // تغيير لون المؤقت كإنذار
            if (timeRemaining <= 5) {
                timerDisplay.style.color = 'var(--incorrect-color)';
                progressBar.style.background = 'var(--incorrect-color)';
                if (this.settings.soundEffects && timeRemaining === 5) {
                    this.playSound('time-warning');
                }
            } else if (timeRemaining <= 10) {
                timerDisplay.style.color = 'var(--warning-color)';
                progressBar.style.background = 'var(--warning-color)';
            } else {
                timerDisplay.style.color = 'var(--neon-blue)';
                progressBar.style.background = 'linear-gradient(90deg, var(--neon-accent), var(--neon-blue))';
            }

            if (timeRemaining <= 0) {
                this.clearTimer();
                this.handleTimeout();
            }
        }, 1000);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    handleTimeout() {
        const t = this.translate;
        const currentQ = this.currentQuestions[this.currentQuestionIndex];

        this.score += this.settings.pointsWrong;
        
        // تسجيل وقت الانتهاء
        if (this.questionTimes[this.currentQuestionIndex]) {
            this.questionTimes[this.currentQuestionIndex].endTime = Date.now();
        }
        
        this.userAnswers[currentQ.id || this.currentQuestionIndex] = {
            question: currentQ.question,
            userAnswer: `${t('time_up')} (${t('correct_answer')} ${currentQ.answer})`,
            correctAnswer: currentQ.answer,
            isCorrect: false,
        };
        
        document.querySelectorAll('.option-label').forEach(label => {
            label.querySelector('input').disabled = true;
            if (label.querySelector('input').value === currentQ.answer) {
                label.classList.add('correct');
            }
        });

        document.getElementById('submit-btn').classList.add('hidden');
        document.getElementById('next-btn').classList.remove('hidden');
        
        this.updateScoreDisplay();
        
        if (this.settings.soundEffects) {
            this.playSound('incorrect');
        }
    }

    // [10] معالجة الإجابات
    handleAnswerSubmission() {
        this.clearTimer();
        
        const selectedOption = document.querySelector('input[name="option"]:checked');
        if (!selectedOption) return;

        const currentQ = this.currentQuestions[this.currentQuestionIndex];
        const userAnswer = selectedOption.value;
        const isCorrect = (userAnswer === currentQ.answer);
        
        // تسجيل وقت الانتهاء
        if (this.questionTimes[this.currentQuestionIndex]) {
            this.questionTimes[this.currentQuestionIndex].endTime = Date.now();
        }
        
        if (isCorrect) {
            this.score += this.settings.pointsCorrect;
            if (this.settings.soundEffects) {
                this.playSound('correct');
            }
        } else {
            this.score += this.settings.pointsWrong;
            if (this.settings.soundEffects) {
                this.playSound('incorrect');
            }
        }

        this.userAnswers[currentQ.id || this.currentQuestionIndex] = {
            question: currentQ.question,
            userAnswer: userAnswer,
            correctAnswer: currentQ.answer,
            isCorrect: isCorrect,
            explanation: currentQ.explanation
        };

        this.highlightAnswers(currentQ, userAnswer, isCorrect);
        document.getElementById('submit-btn').classList.add('hidden');
        document.getElementById('next-btn').classList.remove('hidden');
        
        this.updateScoreDisplay();
    }

    highlightAnswers(currentQ, userAnswer, isCorrect) {
        document.querySelectorAll('.option-label').forEach(label => {
            const input = label.querySelector('input');
            input.disabled = true;

            if (input.value === currentQ.answer) {
                label.classList.add('correct');
            } else if (input.value === userAnswer && !isCorrect) {
                label.classList.add('incorrect');
            }
        });
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        this.displayQuestion();
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        document.getElementById('score-display').textContent = `النقاط: ${this.score}`;
    }

    // [11] التلميحات
    showHint() {
        const currentQ = this.currentQuestions[this.currentQuestionIndex];
        if (!currentQ || !currentQ.hint) return;

        const hintModal = document.getElementById('hint-modal');
        const hintText = document.getElementById('hint-text');
        
        hintText.textContent = currentQ.hint;
        hintModal.classList.remove('hidden');
    }

    closeHint() {
        document.getElementById('hint-modal').classList.add('hidden');
    }

    // [12] شاشة النتائج
    showResults() {
        this.clearTimer();
        this.quizEndTime = Date.now();
        
        document.getElementById('quiz-screen').classList.add('hidden');
        document.getElementById('results-screen').classList.remove('hidden');

        this.calculateResults();
        this.displayResults();
        this.updateUserStatistics();
        this.createPerformanceChart();
    }

    calculateResults() {
        const totalTime = this.quizEndTime - this.quizStartTime;
        const totalQuestions = this.currentQuestions.length;
        const correctAnswers = Object.values(this.userAnswers).filter(answer => answer.isCorrect).length;
        const incorrectAnswers = totalQuestions - correctAnswers;
        
        const averageTimePerQuestion = this.questionTimes.reduce((sum, time) => {
            if (time && time.endTime) {
                return sum + (time.endTime - time.startTime);
            }
            return sum;
        }, 0) / totalQuestions / 1000;

        this.resultsData = {
            totalTime: Math.round(totalTime / 1000),
            averageTime: Math.round(averageTimePerQuestion),
            correctAnswers,
            incorrectAnswers,
            totalQuestions,
            finalScore: this.score,
            percentage: Math.round((correctAnswers / totalQuestions) * 100)
        };
    }

    displayResults() {
        const t = this.translate;
        const data = this.resultsData;

        document.getElementById('final-score').textContent = data.finalScore;
        document.getElementById('total-questions-count').textContent = data.totalQuestions;
        document.getElementById('percentage-score').textContent = `${data.percentage}%`;

        // تحديث إحصائيات الأداء
        document.getElementById('time-taken').textContent = `${data.totalTime} ${t('timer_text')}`;
        document.getElementById('avg-time').textContent = `${data.averageTime} ${t('timer_text')}`;
        document.getElementById('correct-count').textContent = data.correctAnswers;
        document.getElementById('incorrect-count').textContent = data.incorrectAnswers;

        // رسالة التقدير
        const gradeMessage = document.getElementById('grade-message');
        if (data.percentage >= 90) {
            gradeMessage.innerHTML = t('great_job');
            gradeMessage.style.color = 'var(--correct-color)';
        } else if (data.percentage >= 70) {
            gradeMessage.innerHTML = t('good_job');
            gradeMessage.style.color = 'var(--neon-blue)';
        } else {
            gradeMessage.innerHTML = t('needs_review');
            gradeMessage.style.color = 'var(--incorrect-color)';
        }

        // عرض الأخطاء
        this.displayReviewSection();
    }

    displayReviewSection() {
        const t = this.translate;
        const reviewContent = document.getElementById('review-content');
        reviewContent.innerHTML = '';

        let errorsFound = false;
        
        Object.values(this.userAnswers).forEach((answer, index) => {
            if (!answer.isCorrect) {
                errorsFound = true;
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                reviewItem.innerHTML = `
                    <p class="error-q">${answer.question}</p>
                    <p class="error-a">${t('your_answer')} <span class="wrong">${answer.userAnswer}</span></p>
                    <p class="error-a">${t('correct_answer')} <span class="right">${answer.correctAnswer}</span></p>
                    ${answer.explanation ? `<p class="explanation">${answer.explanation}</p>` : ''}
                `;
                reviewContent.appendChild(reviewItem);
            }
        });
        
        if (!errorsFound) {
            reviewContent.innerHTML = '<p class="all-correct">🎉 ممتاز! لا توجد أخطاء لمراجعتها.</p>';
        }
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performance-chart').getContext('2d');
        const data = this.resultsData;
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['صحيح', 'خاطئ'],
                datasets: [{
                    data: [data.correctAnswers, data.incorrectAnswers],
                    backgroundColor: [
                        'var(--correct-color)',
                        'var(--incorrect-color)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text-main)',
                            font: {
                                family: 'inherit'
                            }
                        }
                    }
                }
            }
        });
    }

    // [13] إدارة الإحصائيات
    updateUserStatistics() {
        this.userStats.totalQuizzes++;
        this.userStats.totalQuestions += this.resultsData.totalQuestions;
        this.userStats.totalCorrect += this.resultsData.correctAnswers;
        this.userStats.averageScore = Math.round(
            (this.userStats.totalCorrect / this.userStats.totalQuestions) * 100
        );
        this.userStats.bestScore = Math.max(this.userStats.bestScore, this.resultsData.percentage);
        
        this.saveUserStats();
        this.updateStatsDisplay();
    }

    saveUserStats() {
        try {
            localStorage.setItem('geoMasterUserStats', JSON.stringify(this.userStats));
        } catch (error) {
            console.warn('تعذر حفظ إحصائيات المستخدم:', error);
        }
    }

    loadUserStats() {
        try {
            const savedStats = localStorage.getItem('geoMasterUserStats');
            if (savedStats) {
                this.userStats = JSON.parse(savedStats);
            }
        } catch (error) {
            console.warn('تعذر تحميل إحصائيات المستخدم:', error);
        }
    }

    updateStatsDisplay() {
        document.getElementById('total-quizzes').textContent = this.userStats.totalQuizzes;
        document.getElementById('avg-score').textContent = `${this.userStats.averageScore}%`;
    }

    updateUserStats() {
        this.loadUserStats();
        this.updateStatsDisplay();
    }

    // [14] إدارة الإعدادات
    openSettings() {
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    closeSettings() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    updateSettingsForm() {
        document.getElementById('time-limit-setting').value = this.settings.timeLimit;
        document.getElementById('points-correct-setting').value = this.settings.pointsCorrect;
        document.getElementById('points-wrong-setting').value = this.settings.pointsWrong;
        document.getElementById('sound-effects').checked = this.settings.soundEffects;
        document.getElementById('animations').checked = this.settings.animations;
    }

    saveSettingsChanges() {
        this.settings.timeLimit = parseInt(document.getElementById('time-limit-setting').value) || 20;
        this.settings.pointsCorrect = parseInt(document.getElementById('points-correct-setting').value) || 5;
        this.settings.pointsWrong = parseInt(document.getElementById('points-wrong-setting').value) || -3;
        this.settings.soundEffects = document.getElementById('sound-effects').checked;
        this.settings.animations = document.getElementById('animations').checked;
        
        this.saveSettings();
        this.closeSettings();
        
        // إعادة تطبيق الإعدادات
        this.applySettings();
    }

    resetSettings() {
        this.settings = {
            timeLimit: 20,
            pointsCorrect: 5,
            pointsWrong: -3,
            soundEffects: true,
            animations: true,
            language: 'ar'
        };
        this.updateSettingsForm();
    }

    applySettings() {
        // تطبيق إعدادات الصوت
        if (!this.settings.soundEffects) {
            // تعطيل الصوت
        }
        
        // تطبيق إعدادات التحريك
        if (!this.settings.animations) {
            document.body.classList.add('no-animations');
        } else {
            document.body.classList.remove('no-animations');
        }
    }

    // [15] الميزات الإضافية
    playSound(type) {
        if (!this.settings.soundEffects) return;
        
        try {
            const sound = document.getElementById(`${type}-sound`);
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log('تعذر تشغيل الصوت:', e));
            }
        } catch (error) {
            console.log('خطأ في تشغيل الصوت:', error);
        }
    }

    shareResults() {
        const data = this.resultsData;
        const shareText = `حصلت على ${data.finalScore} نقطة في اختبار الجيولوجيا! النسبة: ${data.percentage}%`;
        
        if (navigator.share) {
            navigator.share({
                title: 'نتيجة اختبار GEO-MASTER',
                text: shareText,
                url: window.location.href
            }).catch(() => this.fallbackShare(shareText));
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('تم نسخ النتائج إلى الحافظة!');
        }).catch(() => {
            prompt('انسخ النص التالي لمشاركة نتائجك:', text);
        });
    }

    downloadReport() {
        const data = this.resultsData;
        const report = `
نتيجة اختبار GEO-MASTER
=====================

النتيجة النهائية: ${data.finalScore} نقطة
النسبة المئوية: ${data.percentage}%
الوقت المستغرق: ${data.totalTime} ثانية
عدد الأسئلة: ${data.totalQuestions}
الإجابات الصحيحة: ${data.correctAnswers}
الإجابات الخاطئة: ${data.incorrectAnswers}

${new Date().toLocaleString()}
        `.trim();

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `geo-master-report-${new Date().getTime()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    handleKeyPress(e) {
        // اختصارات لوحة المفاتيح
        switch(e.key) {
            case 'Escape':
                this.closeHint();
                this.closeSettings();
                this.toggleSidebar(false);
                break;
            case ' ':
            case 'Enter':
                if (document.getElementById('quiz-screen').classList.contains('hidden')) return;
                e.preventDefault();
                const submitBtn = document.getElementById('submit-btn');
                const nextBtn = document.getElementById('next-btn');
                
                if (!submitBtn.classList.contains('hidden') && !submitBtn.disabled) {
                    this.handleAnswerSubmission();
                } else if (!nextBtn.classList.contains('hidden')) {
                    this.nextQuestion();
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                if (document.getElementById('quiz-screen').classList.contains('hidden')) return;
                const index = parseInt(e.key) - 1;
                const options = document.querySelectorAll('input[name="option"]');
                if (options[index]) {
                    options[index].checked = true;
                    document.getElementById('submit-btn').disabled = false;
                }
                break;
        }
    }

    // [16] إعادة التشغيل
    restartQuiz() {
        this.clearTimer();
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = {};
        
        document.getElementById('results-screen').classList.add('hidden');
        document.getElementById('topic-selection').classList.remove('hidden');
        
        // إعادة تعيين عناصر الواجهة
        document.getElementById('start-quiz-btn').classList.remove('hidden');
        document.getElementById('topics-list-container').classList.add('hidden');
    }
}

// [17] التهيئة العالمية
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new GeoMasterApp();
});

// دالة مساعدة للوصول العالمي
function restartQuiz() {
    if (app) app.restartQuiz();
}