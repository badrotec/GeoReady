document.addEventListener('DOMContentLoaded', () => {
    // --- Global State & Config ---
    const JSON_DATA = (/* The provided JSON data is huge, we treat it as already available here */);
    const ALL_QUESTIONS = JSON.parse(JSON.stringify(JSON_DATA)); // Deep copy the data
    const DAILY_QUESTION_COUNT = 7;
    const TIME_PER_DAILY_QUESTION = 20; // Seconds

    let dailyQuiz = {
        questions: [],
        current: 0,
        score: 0,
        timerInterval: null,
        timeLeft: TIME_PER_DAILY_QUESTION,
        isAnswered: false
    };
    
    // Total question count for the main counter
    const TOTAL_Q_COUNT = Object.values(ALL_QUESTIONS).reduce((sum, bank) => {
        return sum + (Array.isArray(bank) ? bank.length : Object.values(bank).flat().length);
    }, 0);
    
    // --- DOM Elements ---
    const screens = {
        home: document.getElementById('home-screen'),
        daily: document.getElementById('daily-quiz-screen'),
        center: document.getElementById('quiz-center-screen')
    };

    const sidebar = document.getElementById('sidebar-menu');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const mainMenu = document.getElementById('main-menu-list');
    const startDailyChallengeBtn = document.getElementById('start-daily-challenge');
    
    const totalQuestionsDisplay = document.getElementById('total-questions-display');
    const dailyTimer = document.getElementById('daily-timer');
    const dailyScore = document.getElementById('daily-score');
    const dailyProgressCount = document.getElementById('daily-progress-count');
    const dailyProgressFill = document.getElementById('daily-progress-fill');
    const dailyQuestionText = document.getElementById('daily-question-text');
    const dailyOptionsContainer = document.getElementById('daily-options-container');

    const correctSound = document.getElementById('correct-sound');
    const wrongSound = document.getElementById('wrong-sound');
    const timeoutSound = document.getElementById('timeout-sound');
    
    // --- Utility Functions ---

    /** Plays a sound from the DOM audio elements. */
    function playSound(type) {
        let sound = document.getElementById(`${type}-sound`);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn(`Sound playback blocked: ${e.message}`));
        }
    }

    /** Shuffles an array in place. */
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /** Navigates between main screens. */
    function navigateTo(targetScreen) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[targetScreen].classList.add('active');
        if (targetScreen !== 'daily') stopDailyTimer();
    }

    // --- Sidebar & Nested Menu Logic ---

    function buildSidebarMenu() {
        mainMenu.innerHTML = '';
        
        // 1. Get all category names (Main level)
        const categories = Object.keys(ALL_QUESTIONS);

        categories.forEach(mainCategory => {
            const mainItem = document.createElement('li');
            const mainBtn = document.createElement('button');
            mainBtn.textContent = mainCategory.replace(/_/g, ' '); // Replace underscore with space
            mainItem.appendChild(mainBtn);

            const subMenu = document.createElement('ul');
            subMenu.classList.add('sub-menu');
            
            let subCategories = [];
            // Check if it's a simple array (like Geochemistry) or a nested object (like GIS)
            if (Array.isArray(ALL_QUESTIONS[mainCategory])) {
                subCategories.push(`اختبار عام (${ALL_QUESTIONS[mainCategory].length} سؤال)`);
                // Placeholder for other sub-categories if needed later (e.g., 'اختبار الصور')
            } else {
                subCategories = Object.keys(ALL_QUESTIONS[mainCategory]).map(subKey => 
                    `${subKey.replace(/_/g, ' ')} (${ALL_QUESTIONS[mainCategory][subKey].length} سؤال)`);
            }

            subCategories.forEach(subItemText => {
                const subItem = document.createElement('li');
                const subBtn = document.createElement('button');
                subBtn.textContent = subItemText;
                // Add click listener to start specific quiz from here
                subBtn.onclick = () => { /* Logic to start specific quiz */; closeSidebar(); };
                subItem.appendChild(subBtn);
                subMenu.appendChild(subItem);
            });
            
            mainItem.appendChild(subMenu);
            mainMenu.appendChild(mainItem);

            // Toggle Nested Menu
            mainBtn.onclick = () => {
                subMenu.classList.toggle('open');
                mainBtn.classList.toggle('active');
            };
        });
    }

    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
    }

    toggleSidebarBtn.addEventListener('click', toggleSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);


    // --- Daily Challenge Logic ---

    function prepareDailyQuiz() {
        let allQs = [];
        // Flatten all questions from all banks
        Object.values(ALL_QUESTIONS).forEach(bank => {
            if (Array.isArray(bank)) {
                allQs.push(...bank);
            } else {
                Object.values(bank).forEach(subBank => {
                    allQs.push(...subBank);
                });
            }
        });

        shuffle(allQs);
        dailyQuiz.questions = allQs.slice(0, DAILY_QUESTION_COUNT);
        dailyQuiz.current = 0;
        dailyQuiz.score = 0;
        dailyQuiz.isAnswered = false;
    }

    function startDailyQuiz() {
        prepareDailyQuiz();
        navigateTo('daily');
        renderDailyQuestion();
    }

    function renderDailyQuestion() {
        if (dailyQuiz.current >= dailyQuiz.questions.length) {
            showDailyResults();
            return;
        }

        const qData = dailyQuiz.questions[dailyQuiz.current];
        dailyQuestionText.textContent = qData.question;
        dailyOptionsContainer.innerHTML = '';
        dailyQuiz.isAnswered = false;
        
        // 1. Prepare options (key/text pairs)
        let optionsArray = Object.entries(qData.options).map(([key, text]) => ({ key, text }));
        
        // 2. Shuffle the options array
        shuffle(optionsArray);

        // 3. Render 2x2 grid buttons
        optionsArray.forEach(opt => {
            const btn = document.createElement('button');
            btn.classList.add('option-btn-2x2');
            btn.setAttribute('data-key', opt.key); // CRITICAL: Store the original key
            btn.textContent = opt.text;
            btn.onclick = () => handleDailySelection(btn, qData);
            dailyOptionsContainer.appendChild(btn);
        });

        resetDailyTimer();
        startDailyTimer();
        updateDailyStatus();
    }

    function handleDailySelection(selectedButton, question) {
        if (dailyQuiz.isAnswered) return;
        dailyQuiz.isAnswered = true;
        stopDailyTimer();
        
        const selectedKey = selectedButton.getAttribute('data-key');
        const isCorrect = selectedKey === question.answer;
        
        const allOptions = dailyOptionsContainer.querySelectorAll('.option-btn-2x2');
        allOptions.forEach(btn => btn.disabled = true); // Disable further clicks

        // TLOONING: Apply colors based on data-key
        allOptions.forEach(btn => {
            const optionKey = btn.getAttribute('data-key');
            if (optionKey === question.answer) {
                btn.classList.add('correct');
            } else if (optionKey === selectedKey) {
                btn.classList.add('wrong');
            }
        });
        
        if (isCorrect) {
            dailyQuiz.score += 1;
            playSound('correct');
        } else {
            playSound('wrong');
        }

        // Move to next question after delay
        setTimeout(() => {
            dailyQuiz.current++;
            renderDailyQuestion();
        }, 1500);
    }
    
    function updateDailyStatus() {
        dailyScore.textContent = `🏆 ${dailyQuiz.score}`;
        dailyProgressCount.textContent = `${dailyQuiz.current} / ${DAILY_QUESTION_COUNT}`;
        dailyProgressFill.style.width = `${(dailyQuiz.current / DAILY_QUESTION_COUNT) * 100}%`;
    }

    function startDailyTimer() {
        dailyQuiz.timerInterval = setInterval(() => {
            dailyQuiz.timeLeft--;
            const seconds = String(dailyQuiz.timeLeft).padStart(2, '0');
            dailyTimer.textContent = `⏱️ 00:${seconds}`;

            if (dailyQuiz.timeLeft <= 5) {
                dailyTimer.style.color = 'var(--neon-red)';
            } else {
                dailyTimer.style.color = 'var(--neon-green)';
            }

            if (dailyQuiz.timeLeft <= 0) {
                stopDailyTimer();
                // Treat as wrong answer / skip (but reveal answer)
                handleDailySelection(null, dailyQuiz.questions[dailyQuiz.current]);
            }
        }, 1000);
    }

    function stopDailyTimer() {
        if (dailyQuiz.timerInterval) {
            clearInterval(dailyQuiz.timerInterval);
            dailyQuiz.timerInterval = null;
        }
    }

    function resetDailyTimer() {
        dailyQuiz.timeLeft = TIME_PER_DAILY_QUESTION;
        dailyTimer.textContent = `⏱️ 00:${String(dailyQuiz.timeLeft).padStart(2, '0')}`;
    }

    function showDailyResults() {
        // Here you would navigate to a dedicated results screen or back to home
        alert(`انتهى التحدي اليومي! نتيجتك: ${dailyQuiz.score} / ${DAILY_QUESTION_COUNT}`);
        navigateTo('home');
        // Reset state for next day
        dailyQuiz.current = DAILY_QUESTION_COUNT;
    }


    // --- Initialization ---

    startDailyChallengeBtn.addEventListener('click', startDailyQuiz);

    // Initial setup
    buildSidebarMenu();
    totalQuestionsDisplay.textContent = TOTAL_Q_COUNT;
});
