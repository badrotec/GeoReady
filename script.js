// A helpful AI assistant built by Google.
// Project: GeoReady - Professional Static Web Quiz

document.addEventListener('DOMContentLoaded', () => {
    // --- Global State ---
    const FILE_NAMES = [
        'BasicGeology.json',
        'Geochemistry.json',
        'Geophysics.json',
        'Hydrogeology.json',
        'Petrology.json',
        'Structuralgeology.json',
        'sedimentarygeology.json'
    ];
    const NUM_REQUIRED_QUESTIONS = 25;
    
    let allQuestions = []; // All loaded questions from selected bank(s)
    let sessionQuestions = []; // Questions for the current session (after shuffle/limit)
    let currentQuestionIndex = 0;
    let score = { correctCount: 0, totalAnswered: 0 };
    let quizState = 'menu'; // 'menu', 'quiz', 'results', 'scores', 'review'
    let selectedCategory = null;
    let selectedQuestionLimit = 'all';

    let timerInterval = null;
    const TIME_PER_QUESTION = 20; // Seconds
    let timeLeft = TIME_PER_QUESTION;
    const REVIEW_DELAY = 2000; // 2 seconds

    let isSoundEnabled = true;
    let isTimerRunning = true;
    let isAwaitingReview = false; // Flag to prevent multiple clicks during review
    let audioContextInitialized = false;
    let soundElements = {};
    let sessionErrors = []; // Store question objects of wrong answers

    // --- DOM Elements ---
    const appContainer = document.getElementById('app-container');
    const screens = {
        menu: document.getElementById('main-menu'),
        quiz: document.getElementById('quiz-screen'),
        results: document.getElementById('results-screen'),
        scores: document.getElementById('scores-screen'),
        review: document.getElementById('error-review-screen')
    };

    const categoryList = document.getElementById('category-list');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const numQuestionsSelect = document.getElementById('num-questions-select');

    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionCountDisplay = document.getElementById('question-count');
    const progressBar = document.getElementById('progress-fill');
    const timeLeftDisplay = document.getElementById('time-left');

    const prevQuestionBtn = document.getElementById('prev-question-btn');
    const skipQuestionBtn = document.getElementById('skip-question-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    
    // Header controls
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const toggleSoundBtn = document.getElementById('toggle-sound-btn');
    const toggleTimerBtn = document.getElementById('toggle-timer-btn');
    
    // Modals
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const confirmActionBtn = document.getElementById('confirm-action-btn');
    const cancelActionBtn = document.getElementById('cancel-action-btn');

    // --- Utility Functions ---

    /**
     * Shuffles an array in place using the Fisher-Yates algorithm.
     * @param {Array} array 
     */
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Switches the active screen.
     * @param {string} nextScreenName - The name of the screen to activate ('menu', 'quiz', 'results', etc.)
     */
    function navigateTo(nextScreenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[nextScreenName].classList.add('active');
        quizState = nextScreenName;
        
        const isQuizActive = nextScreenName === 'quiz';
        mainMenuBtn.style.display = isQuizActive || nextScreenName === 'results' || nextScreenName === 'scores' || nextScreenName === 'review' ? 'inline-block' : 'none';
        toggleTimerBtn.style.display = isQuizActive ? 'inline-block' : 'none';

        if (isQuizActive) {
            startTimer();
        } else {
            stopTimer();
            if (nextScreenName === 'menu') {
                resetQuizState();
            }
        }
    }

    /**
     * Initializes sound elements after the first user interaction.
     * Uses Web Audio API as fallback if MP3 files are missing.
     */
    function initializeSounds() {
        if (audioContextInitialized) return;
        audioContextInitialized = true;
        
        try {
            // Attempt to load files first
            soundElements = {
                correct: new Audio('sounds/correct.mp3'),
                wrong: new Audio('sounds/wrong.mp3'),
                timeout: new Audio('sounds/timeout.mp3')
            };

            // Basic check to see if files exist/can be played (might be delayed)
            // If they fail, we'll rely on the Web Audio API fallback via a utility function.

        } catch (e) {
            console.warn("Audio file loading failed or blocked. Using Web Audio API fallback.");
            // Web Audio API Fallback function
            const playWebAudio = (frequency, duration, type = 'sine') => {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                oscillator.type = type;
                oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Volume
                
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                oscillator.start();
                setTimeout(() => {
                    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
                    oscillator.stop(audioCtx.currentTime + 0.5);
                }, duration);
            };

            soundElements.correct = { play: () => playWebAudio(500, 200, 'sine') }; // High pitch for correct
            soundElements.wrong = { play: () => playWebAudio(200, 300, 'square') }; // Low pitch for wrong
            soundElements.timeout = { play: () => playWebAudio(150, 500, 'sawtooth') }; // Very low, long tone for timeout
        }
    }

    /**
     * Plays a specific sound if sound is enabled.
     * @param {string} type - 'correct', 'wrong', or 'timeout'
     */
    function playSound(type) {
        if (isSoundEnabled && soundElements[type] && soundElements[type].play) {
            soundElements[type].currentTime = 0; // Reset for quick replay
            soundElements[type].play().catch(e => console.error(`Error playing sound ${type}:`, e));
        }
    }
    
    // --- Data Loading and Validation ---

    /**
     * Validates a single question object.
     * @param {Object} q - The question object.
     * @returns {boolean} True if valid, false otherwise.
     */
    function validateQuestion(q) {
        if (!q.id || !q.question || !q.options || !q.answer) {
            return false;
        }
        const optionKeys = Object.keys(q.options);
        if (optionKeys.length !== 4 || !['أ', 'ب', 'ج', 'د'].every(key => optionKeys.includes(key))) {
            return false;
        }
        if (!['أ', 'ب', 'ج', 'د'].includes(q.answer)) {
            return false;
        }
        return true;
    }

    /**
     * Loads and validates questions from a JSON file.
     * @param {string} fileName - The name of the JSON file.
     * @returns {Promise<Array<Object>|null>} Array of questions or null on failure.
     */
    async function loadQuestions(fileName) {
        const fileBaseName = fileName.replace('.json', '');
        console.log(`Attempting to load: ${fileName}`);
        try {
            const response = await fetch(fileName);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (!Array.isArray(data)) {
                showValidationModal(`خطأ في تنسيق الملف: ${fileName}`, `المتوقع: مصفوفة. الوارد: غير مصفوفة.`);
                return null;
            }

            if (data.length !== NUM_REQUIRED_QUESTIONS) {
                showValidationModal(`ملف JSON غير مكتمل: ${fileBaseName}`, `مطلوب ${NUM_REQUIRED_QUESTIONS} سؤال في الملف، وُجد: ${data.length}.`);
                return null;
            }

            for (let i = 0; i < data.length; i++) {
                if (!validateQuestion(data[i])) {
                    showValidationModal(`خطأ في صلاحية السؤال: ${fileBaseName}`, `السؤال رقم ${i + 1} (ID: ${data[i].id}) لا يمتلك المفاتيح المطلوبة (id, question, options{'أ','ب','ج','د'}, answer).`);
                    return null;
                }
                // Add source bank information to the question
                data[i].bank = fileBaseName;
            }

            console.log(`Successfully loaded ${data.length} questions from ${fileName}.`);
            return data;

        } catch (error) {
            console.error(`Failed to load ${fileName}:`, error);
            showValidationModal(`فشل التحميل: ${fileBaseName}`, `تعذر تحميل الملف بسبب خطأ في الشبكة أو المسار. رسالة الخطأ: ${error.message}`);
            return null;
        }
    }

    /**
     * Dynamically creates category buttons for the main menu.
     */
    async function setupCategoryMenu() {
        categoryList.innerHTML = '';
        let allQuestionsCount = 0;
        let allLoadedSuccessfully = true;
        
        // Add "All Categories" button
        const allBtn = document.createElement('button');
        allBtn.textContent = 'كل الفئات (سيتم الدمج)';
        allBtn.classList.add('category-btn');
        allBtn.setAttribute('data-category', 'all');
        categoryList.appendChild(allBtn);

        for (const fileName of FILE_NAMES) {
            const baseName = fileName.replace('.json', '');
            const questions = await loadQuestions(fileName);
            
            if (questions) {
                allQuestionsCount += questions.length;
                const btn = document.createElement('button');
                btn.textContent = baseName.replace(/([A-Z])/g, ' $1').trim(); // Add space before capital letters
                btn.classList.add('category-btn');
                btn.setAttribute('data-category', baseName);
                btn.questions = questions; // Store questions directly on the button for easy access
                categoryList.appendChild(btn);
            } else {
                allLoadedSuccessfully = false;
                // Since the loadQuestions function displays a modal, we just log and continue/stop.
                // In a production app, we'd handle the 'ignore' or 'retry' action from the modal here.
                break;
            }
        }
        
        if (allLoadedSuccessfully) {
            startQuizBtn.disabled = false;
            // Update the "All Categories" question count for clarity
            allBtn.textContent = `كل الفئات (${allQuestionsCount} سؤال)`;
        } else {
            startQuizBtn.disabled = true; // Disable if any file failed validation
        }
    }

    /**
     * Shows a full-screen validation/error modal.
     * @param {string} title 
     * @param {string} message 
     * @param {Array<Object>} actions - e.g. [{ text: 'إعادة المحاولة', onClick: () => ... }]
     */
    function showValidationModal(title, message, actions = [{ text: 'حسناً', onClick: () => hideModal('validation-modal-backdrop') }]) {
        const modal = document.getElementById('validation-modal-backdrop');
        const titleEl = document.getElementById('validation-modal-title');
        const messageEl = document.getElementById('validation-modal-message');
        const actionsEl = document.getElementById('validation-modal-actions');

        titleEl.textContent = title;
        messageEl.textContent = message;
        actionsEl.innerHTML = '';
        
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.textContent = action.text;
            btn.classList.add('big-btn', 'confirm-btn'); // Use confirm-btn class for visibility
            btn.addEventListener('click', action.onClick, { once: true });
            actionsEl.appendChild(btn);
        });

        modal.style.display = 'flex';
    }

    /**
     * Shows a generic confirmation modal.
     * @param {string} title 
     * @param {string} message 
     * @param {Function} onConfirm 
     */
    function showConfirmationModal(title, message, onConfirm) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        confirmActionBtn.onclick = () => {
            hideModal(modalBackdrop);
            onConfirm();
        };
        cancelActionBtn.onclick = () => hideModal(modalBackdrop);
        modalBackdrop.style.display = 'flex';
    }

    /**
     * Hides a modal backdrop.
     * @param {HTMLElement} backdropElement 
     */
    function hideModal(backdropElement) {
        backdropElement.style.display = 'none';
    }


    // --- Quiz Logic ---

    /**
     * Starts the quiz session.
     */
    async function startQuizSession() {
        initializeSounds();
        const selectedBtn = categoryList.querySelector('.category-btn.selected');
        if (!selectedBtn) return;

        selectedCategory = selectedBtn.getAttribute('data-category');
        selectedQuestionLimit = numQuestionsSelect.value;
        currentQuestionIndex = 0;
        score = { correctCount: 0, totalAnswered: 0 };
        sessionErrors = [];

        // Collect all questions
        if (selectedCategory === 'all') {
            const allBtns = categoryList.querySelectorAll('.category-btn:not([data-category="all"])');
            allQuestions = [];
            allBtns.forEach(btn => {
                if (btn.questions) {
                    allQuestions.push(...btn.questions);
                }
            });
        } else {
            allQuestions = selectedBtn.questions;
        }

        // Shuffle all collected questions
        shuffle(allQuestions);

        // Limit the session questions based on user selection
        const limit = selectedQuestionLimit === 'all' ? allQuestions.length : parseInt(selectedQuestionLimit, 10);
        sessionQuestions = allQuestions.slice(0, limit);
        
        if (sessionQuestions.length === 0) {
            alert('لم يتم تحميل أي أسئلة. يرجى مراجعة ملفات JSON.');
            return;
        }

        navigateTo('quiz');
        renderQuestion(currentQuestionIndex);
        updateProgress();
    }

    /**
     * Renders the current question and options.
     * @param {number} index - Index of the question in sessionQuestions.
     */
    function renderQuestion(index) {
        if (index < 0 || index >= sessionQuestions.length) {
            showResults();
            return;
        }
        
        currentQuestionIndex = index;
        isAwaitingReview = false; // Allow interaction
        
        const question = sessionQuestions[currentQuestionIndex];
        
        questionText.textContent = question.question;
        optionsContainer.innerHTML = '';
        optionsContainer.classList.remove('disabled');

        // 1. Convert options object to array with original key
        let optionsArray = Object.entries(question.options).map(([key, text]) => ({ key, text }));
        
        // 2. Shuffle the options array (keeping key/text pair)
        shuffle(optionsArray);

        // 3. Render options
        optionsArray.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.classList.add('option-btn');
            btn.setAttribute('data-key', opt.key); // CRITICAL: Store the original key
            btn.setAttribute('data-index', idx + 1); // For keyboard navigation (1-4)
            btn.textContent = opt.text;
            btn.setAttribute('aria-label', `الخيار ${opt.key}: ${opt.text}`);
            
            const iconSpan = document.createElement('span');
            iconSpan.classList.add('option-icon');
            btn.prepend(iconSpan); // Add empty span for icon

            btn.addEventListener('click', () => handleOptionSelection(btn, question));
            optionsContainer.appendChild(btn);
        });

        // Update progress and navigation controls
        updateProgress();
        updateNavigationButtons();
        resetTimer();
        if (isTimerRunning) startTimer();
    }
    
    /**
     * Handles the user's selection of an option.
     * @param {HTMLButtonElement} selectedButton 
     * @param {Object} question - The current question object.
     */
    function handleOptionSelection(selectedButton, question) {
        if (isAwaitingReview) return;
        isAwaitingReview = true;
        stopTimer();
        
        const selectedKey = selectedButton.getAttribute('data-key');
        const isCorrect = selectedKey === question.answer;
        
        question.userAnswer = selectedKey; // Record user answer
        score.totalAnswered++;

        // 1. TLOONING - Remove all conflicting classes and disable all options
        optionsContainer.classList.add('disabled'); // Disable the container
        const allOptions = optionsContainer.querySelectorAll('.option-btn');
        allOptions.forEach(btn => {
            btn.classList.remove('correct', 'wrong', 'selected');
            btn.disabled = true;
        });

        // 2. TLOONING - Apply colors based on data-key against currentQuestion.answer
        allOptions.forEach(btn => {
            const optionKey = btn.getAttribute('data-key');
            const iconSpan = btn.querySelector('.option-icon');
            
            if (optionKey === question.answer) {
                // Correct answer
                btn.classList.add('correct');
                btn.setAttribute('aria-label', btn.getAttribute('aria-label') + " - صحيح");
                iconSpan.innerHTML = '<i class="fas fa-check"></i>';
            } else if (optionKey === selectedKey) {
                // User's wrong answer
                btn.classList.add('wrong');
                btn.setAttribute('aria-label', btn.getAttribute('aria-label') + " - إجابتك الخاطئة");
                iconSpan.innerHTML = '<i class="fas fa-times"></i>';
            }
        });
        
        if (isCorrect) {
            score.correctCount++;
            playSound('correct');
        } else {
            sessionErrors.push(question);
            playSound('wrong');
        }

        // 3. Move to next question after review delay
        setTimeout(() => {
            currentQuestionIndex++;
            renderQuestion(currentQuestionIndex);
        }, REVIEW_DELAY);
    }
    
    /**
     * Skips the current question.
     */
    function skipQuestion() {
        if (isAwaitingReview) return;
        stopTimer();
        playSound('timeout');
        
        const question = sessionQuestions[currentQuestionIndex];
        question.userAnswer = 'skipped'; // Mark as skipped
        score.totalAnswered++;
        
        // Disable options during "skip review"
        optionsContainer.classList.add('disabled');
        const allOptions = optionsContainer.querySelectorAll('.option-btn');
        allOptions.forEach(btn => btn.disabled = true);

        // Show the correct answer after skipping
        allOptions.forEach(btn => {
            if (btn.getAttribute('data-key') === question.answer) {
                btn.classList.add('correct');
                const iconSpan = btn.querySelector('.option-icon');
                iconSpan.innerHTML = '<i class="fas fa-check"></i>';
            }
        });

        isAwaitingReview = true;
        
        // Move to next question after review delay
        setTimeout(() => {
            currentQuestionIndex++;
            renderQuestion(currentQuestionIndex);
        }, REVIEW_DELAY);
    }

    /**
     * Updates the progress bar and question count display.
     */
    function updateProgress() {
        const total = sessionQuestions.length;
        const current = currentQuestionIndex + 1;
        
        // CRITICAL: Display correct question count
        questionCountDisplay.textContent = `السؤال ${Math.min(current, total)} من ${total}`;
        progressBar.style.width = `${(currentQuestionIndex / total) * 100}%`;
    }

    /**
     * Updates the Previous/Next/Skip buttons state.
     */
    function updateNavigationButtons() {
        const total = sessionQuestions.length;
        // Navigation buttons (Prev/Next) are primarily for review *after* answering,
        // but can be used for simple navigation if desired.
        // For simplicity during *quiz*, we only allow 'Skip'.
        
        prevQuestionBtn.style.display = 'none'; // Hide in quiz mode for now
        nextQuestionBtn.style.display = 'none'; // Hide in quiz mode for now
        skipQuestionBtn.style.display = 'block'; // Show skip button
        skipQuestionBtn.disabled = isAwaitingReview;
        
        // If we implement the review mode, we'll un-hide these buttons and change their logic.
        // For current logic: Prev/Next are disabled until results screen.
    }

    // --- Timer Management ---

    /**
     * Starts the question timer.
     */
    function startTimer() {
        if (!isTimerRunning || timerInterval) return;
        
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
            const seconds = String(timeLeft % 60).padStart(2, '0');
            timeLeftDisplay.textContent = `${minutes}:${seconds}`;

            if (timeLeft <= 0) {
                stopTimer();
                handleTimeout();
            }
        }, 1000);
        
        toggleTimerBtn.innerHTML = '<i class="fas fa-pause"></i> المؤقت';
    }

    /**
     * Stops the question timer.
     */
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        toggleTimerBtn.innerHTML = '<i class="fas fa-play"></i> المؤقت';
    }

    /**
     * Resets the timer for the next question.
     */
    function resetTimer() {
        stopTimer();
        timeLeft = TIME_PER_QUESTION;
        const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const seconds = String(timeLeft % 60).padStart(2, '0');
        timeLeftDisplay.textContent = `${minutes}:${seconds}`;
    }

    /**
     * Handles the event when the timer runs out.
     */
    function handleTimeout() {
        if (isAwaitingReview) return;
        isAwaitingReview = true;
        
        const question = sessionQuestions[currentQuestionIndex];
        question.userAnswer = 'timeout'; // Record timeout
        score.totalAnswered++;
        
        playSound('timeout');

        // Disable options and show correct answer
        optionsContainer.classList.add('disabled');
        const allOptions = optionsContainer.querySelectorAll('.option-btn');
        allOptions.forEach(btn => btn.disabled = true);
        
        allOptions.forEach(btn => {
            if (btn.getAttribute('data-key') === question.answer) {
                btn.classList.add('correct');
                const iconSpan = btn.querySelector('.option-icon');
                iconSpan.innerHTML = '<i class="fas fa-check"></i>';
            }
        });

        // Move to next question after review delay
        setTimeout(() => {
            currentQuestionIndex++;
            renderQuestion(currentQuestionIndex);
        }, REVIEW_DELAY);
    }
    
    // --- Results and Scores Management ---
    
    /**
     * Displays the final results screen.
     */
    function showResults() {
        navigateTo('results');
        const totalQuestions = sessionQuestions.length;
        const percent = totalQuestions > 0 ? ((score.correctCount / totalQuestions) * 100).toFixed(1) : 0;
        
        document.getElementById('result-category').textContent = selectedCategory === 'all' ? 'فئات متعددة' : selectedCategory;
        document.getElementById('result-total').textContent = totalQuestions;
        document.getElementById('result-correct').textContent = score.correctCount;
        document.getElementById('result-percent').textContent = `${percent}%`;

        document.getElementById('review-errors-btn').disabled = sessionErrors.length === 0;
        
        // Save score
        saveScore({
            date: new Date().toISOString(),
            bank: selectedCategory === 'all' ? 'All Banks' : selectedCategory,
            totalQuestions: totalQuestions,
            correctCount: score.correctCount,
            percent: parseFloat(percent),
            errors: sessionErrors.map(err => ({
                id: err.id, 
                bank: err.bank, 
                question: err.question, 
                options: err.options, 
                answer: err.answer, 
                userAnswer: err.userAnswer
            }))
        });
    }

    /**
     * Saves the current session score to localStorage.
     * @param {Object} sessionData 
     */
    function saveScore(sessionData) {
        let scores = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        scores.push(sessionData);
        // Sort by percent descending, then correctCount descending
        scores.sort((a, b) => b.percent - a.percent || b.correctCount - a.correctCount);
        localStorage.setItem('GeoReady_scores', JSON.stringify(scores));
    }
    
    /**
     * Loads and displays high scores.
     */
    function showScores() {
        navigateTo('scores');
        const scores = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        const scoresList = document.getElementById('high-scores-list');
        scoresList.innerHTML = '';
        
        if (scores.length === 0) {
            scoresList.innerHTML = '<li>لا توجد نتائج سابقة.</li>';
            return;
        }

        // Display top 5
        scores.slice(0, 5).forEach((s, index) => {
            const date = new Date(s.date).toLocaleDateString('ar-EG', { dateStyle: 'short' });
            const li = document.createElement('li');
            li.innerHTML = `
                <span>#${index + 1} (${date})</span>
                <span>${s.bank}</span>
                <span>${s.correctCount} / ${s.totalQuestions}</span>
                <strong>${s.percent}%</strong>
            `;
            scoresList.appendChild(li);
        });
    }

    /**
     * Displays the errors review screen.
     */
    function showErrorsReview() {
        navigateTo('review');
        const container = document.getElementById('error-questions-container');
        container.innerHTML = '';
        
        if (sessionErrors.length === 0) {
            container.innerHTML = '<p>لم يتم ارتكاب أية أخطاء في هذه الجلسة! عمل جيد. 🥳</p>';
            return;
        }

        sessionErrors.forEach((err, index) => {
            const card = document.createElement('div');
            card.classList.add('error-question-card');
            card.innerHTML = `<h4>السؤال رقم ${index + 1} (من فئة ${err.bank})</h4><p>${err.question}</p>`;
            
            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('options-grid', 'error-options');
            
            // Convert options object to array with original key and shuffle
            let optionsArray = Object.entries(err.options).map(([key, text]) => ({ key, text }));
            shuffle(optionsArray);

            optionsArray.forEach(opt => {
                const btn = document.createElement('button');
                btn.classList.add('option-btn');
                btn.textContent = opt.text;
                
                const iconSpan = document.createElement('span');
                iconSpan.classList.add('option-icon');
                btn.prepend(iconSpan);

                // Apply coloring based on original key
                if (opt.key === err.answer) {
                    btn.classList.add('correct');
                    iconSpan.innerHTML = '<i class="fas fa-check"></i>';
                } else if (opt.key === err.userAnswer) {
                    btn.classList.add('wrong');
                    iconSpan.innerHTML = '<i class="fas fa-times"></i>';
                }
                
                optionsDiv.appendChild(btn);
            });

            card.appendChild(optionsDiv);
            container.appendChild(card);
        });
    }
    
    /**
     * Exports the latest session data to a JSON file.
     */
    function exportLatestSession() {
        const scores = JSON.parse(localStorage.getItem('GeoReady_scores') || '[]');
        if (scores.length === 0) {
            alert('لا توجد جلسات لتصديرها.');
            return;
        }
        
        const latestSession = scores[scores.length - 1]; // Assuming latest is last
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(latestSession, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `GeoReady_Session_${new Date().toLocaleDateString()}_${latestSession.percent}%.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        alert('تم تصدير ملف نتائج الجلسة بنجاح.');
    }
    
    /**
     * Resets the entire quiz state (session data, not scores).
     */
    function resetQuizState() {
        allQuestions = [];
        sessionQuestions = [];
        currentQuestionIndex = 0;
        score = { correctCount: 0, totalAnswered: 0 };
        sessionErrors = [];
        selectedCategory = null;
        selectedQuestionLimit = 'all';
        isAwaitingReview = false;
        
        // Deselect category button
        categoryList.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
        startQuizBtn.disabled = true;
        
        // Re-setup the menu to ensure question counts are fresh
        setupCategoryMenu();
    }

    // --- Event Listeners ---

    // Menu Selection
    categoryList.addEventListener('click', (e) => {
        const btn = e.target.closest('.category-btn');
        if (btn) {
            categoryList.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            startQuizBtn.disabled = false;
        }
    });

    // Start Quiz
    startQuizBtn.addEventListener('click', startQuizSession);

    // Navigation Buttons
    document.getElementById('view-scores-btn').addEventListener('click', showScores);
    document.getElementById('back-to-menu-from-scores-btn').addEventListener('click', () => navigateTo('menu'));
    document.getElementById('back-to-menu-from-results-btn').addEventListener('click', () => navigateTo('menu'));
    document.getElementById('review-errors-btn').addEventListener('click', showErrorsReview);
    document.getElementById('back-to-results-btn').addEventListener('click', () => navigateTo('results'));
    document.getElementById('export-session-btn').addEventListener('click', exportLatestSession);
    
    // Main Menu Button (during quiz/results)
    mainMenuBtn.addEventListener('click', () => {
        if (quizState === 'quiz' || isAwaitingReview) {
            showConfirmationModal(
                "تأكيد الخروج", 
                "هل أنت متأكد أنك تريد إنهاء الاختبار الحالي والعودة إلى القائمة الرئيسية؟ سيتم فقدان تقدمك.", 
                () => navigateTo('menu')
            );
        } else {
            navigateTo('menu');
        }
    });

    // Timer Toggle
    toggleTimerBtn.addEventListener('click', () => {
        isTimerRunning = !isTimerRunning;
        if (isTimerRunning) {
            startTimer();
            toggleTimerBtn.innerHTML = '<i class="fas fa-pause"></i> المؤقت';
        } else {
            stopTimer();
            toggleTimerBtn.innerHTML = '<i class="fas fa-play"></i> المؤقت';
        }
    });
    
    // Sound Toggle
    toggleSoundBtn.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        toggleSoundBtn.innerHTML = isSoundEnabled 
            ? '<i class="fas fa-volume-up"></i> الصوت' 
            : '<i class="fas fa-volume-mute"></i> الصوت';
    });

    // Skip Question
    skipQuestionBtn.addEventListener('click', skipQuestion);

    // Keyboard Navigation (1-4 for options, Enter for selection, S for Start)
    document.addEventListener('keydown', (e) => {
        if (quizState === 'menu' && e.key === 's' && !startQuizBtn.disabled) {
            startQuizBtn.click();
            e.preventDefault();
        } else if (quizState === 'quiz' && !isAwaitingReview) {
            const optionNumber = parseInt(e.key, 10);
            if (optionNumber >= 1 && optionNumber <= 4) {
                const selectedBtn = optionsContainer.querySelector(`[data-index="${optionNumber}"]`);
                if (selectedBtn) {
                    selectedBtn.click();
                    e.preventDefault();
                }
            }
        } else if (e.key === 'Escape') {
            if (modalBackdrop.style.display === 'flex') {
                cancelActionBtn.click();
            } else if (quizState === 'quiz') {
                mainMenuBtn.click(); // Trigger exit confirmation
            }
        }
    });

    // Initial setup
    setupCategoryMenu();
    navigateTo('menu');

    // DEV MODE: Simple JSON Validation Test (as required)
    (async () => {
        for (const fileName of FILE_NAMES) {
            const data = await loadQuestions(fileName);
            if (!data) {
                console.warn(`JSON validation failed: ${fileName}`);
            }
        }
        // No need for dev-mode sound toggle as the fallback is implemented
    })();
});
