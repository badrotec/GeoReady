// **=================================================**

// [1] المتغيرات العالمية والتحكم
let geologicalData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval;
const TIME_LIMIT = 20; // ثانية لكل سؤال
const POINTS_CORRECT = 5;
const POINTS_WRONG = -3;
const DAILY_CHALLENGE_QUESTIONS = 7; // عدد أسئلة التحدي اليومي
let currentLanguage = 'ar';

// قاموس الترجمة
const translations = {
    'ar': {
        'start_custom_quiz': 'بدء اختبار مخصص',
        'daily_challenge': 'التحدي اليومي',
        'daily_challenge_button': `التحدي اليومي (${DAILY_CHALLENGE_QUESTIONS} أسئلة)`,
        'choose_domain': 'اختر مجال الاختبار المخصص:',
        'quiz_title_prefix': 'اختبار:',
        'question': 'السؤال',
        'submit': 'تأكيد الإجابة',
        'next': 'السؤال التالي',
        'review_errors': 'مراجعة الأخطاء المفاهيمية:',
        'your_answer': 'إجابتك:',
        'correct_answer': 'الصحيح:',
        'great_job': '🌟 أداء استثنائي! معرفة جيولوجية قوية.',
        'good_job': '✨ جيد جداً! أساس متين، لكن هناك مجال للمراجعة.',
        'needs_review': '⚠️ تحتاج إلى مراجعة مكثفة لهذه المفاهيم.',
        'new_quiz': 'إعادة تشغيل النظام',
        'timer_text': 'ث',
        'loading_data': '... جاري تحميل بيانات النظام',
        'loading_error': '[خطأ الاتصال] عذراً، لا يمكن تحميل البيانات. يرجى مراجعة ملف Question.json.',
        'timeout_answer': '(Timeout - لم يتم الإجابة)',
        'all_correct_message': '🎉 ممتاز! لا توجد أخطاء لمراجعتها.',
        'active_users_title': 'المتدربون النشطون الآن'
    },
    'en': {
        'start_custom_quiz': 'Start Custom Quiz',
        'daily_challenge': 'Daily Challenge',
        'daily_challenge_button': `Daily Challenge (${DAILY_CHALLENGE_QUESTIONS} Questions)`,
        'choose_domain': 'Choose Custom Quiz Domain:',
        'quiz_title_prefix': 'Quiz:',
        'question': 'Question',
        'submit': 'Submit Answer',
        'next': 'Next Question',
        'review_errors': 'Review Conceptual Errors:',
        'your_answer': 'Your Answer:',
        'correct_answer': 'Correct:',
        'great_job': '🌟 Exceptional performance! Strong geological knowledge.',
        'good_job': '✨ Very good! Solid foundation, but room for review.',
        'needs_review': '⚠️ Requires intensive review of these concepts.',
        'new_quiz': 'Restart System',
        'timer_text': 's',
        'loading_data': '... Loading system data',
        'loading_error': '[Connection Error] Sorry, data could not be loaded. Please check Question.json file.',
        'timeout_answer': '(Timeout - No answer provided)',
        'all_correct_message': '🎉 Excellent! No errors to review.',
        'active_users_title': 'Active Trainees Now'

    },
    'fr': {
        'start_custom_quiz': 'Commencer Quiz Personnalisé',
        'daily_challenge': 'Défi Quotidien',
        'daily_challenge_button': `Défi Quotidien (${DAILY_CHALLENGE_QUESTIONS} Questions)`,
        'choose_domain': 'Choisissez un domaine de Quiz Personnalisé:',
        'quiz_title_prefix': 'Quiz:',
        'question': 'Question',
        'submit': 'Soumettre la Réponse',
        'next': 'Question Suivante',
        'review_errors': 'Revue des Erreurs Conceptuelles:',
        'your_answer': 'Votre Réponse:',
        'correct_answer': 'La Bonne:',
        'great_job': '🌟 Performance exceptionnelle! Solides connaissances géologiques.',
        'good_job': '✨ Très bien! Base solide, mais il y a place à l\'amélioration.',
        'needs_review': '⚠️ Nécessite une révision intensive de ces concepts.',
        'new_quiz': 'Redémarrer le Système',
        'timer_text': 's',
        'loading_data': '... Chargement des données système',
        'loading_error': '[Erreur de Connexion] Désolé, les données n\'ont pas pu être chargées. Veuillez vérifier le fichier Question.json.',
        'timeout_answer': '(Timeout - Aucune réponse fournie)',
        'all_correct_message': '🎉 Excellent! Aucune erreur à examiner.',
        'active_users_title': 'Apprenants Actifs Maintenant'
    }
};

// **=================================================**
// [2] تحميل البيانات والتهيئة الأولية
// **=================================================**

async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    const startCustomBtn = document.getElementById('start-quiz-btn'); // Renamed for clarity
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn'); // Get daily challenge button

    try {
        if (loadingMessage) {
            loadingMessage.textContent = translations[currentLanguage].loading_data;
            loadingMessage.classList.remove('hidden');
        }
        // Disable buttons while loading
        if (startCustomBtn) startCustomBtn.disabled = true;
        if (dailyChallengeBtn) dailyChallengeBtn.disabled = true;

        const response = await fetch('./Question.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        geologicalData = await response.json();

        initializeUIElements(geologicalData); // Function to setup buttons and lists

    } catch (error) {
        console.error("فشل في تحميل بيانات الجيولوجيا:", error);
        if (loadingMessage) {
            loadingMessage.textContent = translations[currentLanguage].loading_error;
            loadingMessage.classList.remove('hidden');
        }
        // Keep buttons disabled on error
        if (startCustomBtn) startCustomBtn.disabled = true;
        if (dailyChallengeBtn) dailyChallengeBtn.disabled = true;
    }
}

function initializeUIElements(data) {
    const topicsList = document.getElementById('topics-list');
    const sidebarList = document.getElementById('sidebar-topics-list');
    const loadingMessage = document.getElementById('loading-message');
    const startCustomBtn = document.getElementById('start-quiz-btn');
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn'); // Get daily challenge button
    const topicsListContainer = document.getElementById('topics-list-container');


    if (loadingMessage) loadingMessage.classList.add('hidden'); // Hide loading message

    // Enable buttons now that data is loaded
    if (startCustomBtn) {
        startCustomBtn.disabled = false;
        startCustomBtn.classList.remove('hidden'); // Show custom quiz button
        startCustomBtn.addEventListener('click', () => {
             // Hide hero buttons and show topic list
             if (startCustomBtn) startCustomBtn.classList.add('hidden');
             if (dailyChallengeBtn) dailyChallengeBtn.parentElement.classList.add('hidden'); // Hide daily challenge button container too
             if (topicsListContainer) topicsListContainer.classList.remove('hidden');
        });
    }
    if (dailyChallengeBtn) {
         dailyChallengeBtn.disabled = false;
         dailyChallengeBtn.parentElement.classList.remove('hidden'); // Show daily challenge button section
         // Add event listener for daily challenge
         dailyChallengeBtn.addEventListener('click', startDailyChallenge);
    }


    topicsList.innerHTML = ''; // Clear previous items
    sidebarList.innerHTML = ''; // Clear previous items

    Object.keys(data).forEach(topic => {
        const topicDisplayName = topic.replace(/_/g, ' '); // Make topic name readable

        // Create card for main topic list
        const gridCard = document.createElement('div');
        gridCard.className = 'topic-card';
        gridCard.textContent = topicDisplayName;

        // Create link for sidebar
        const sidebarLink = document.createElement('a');
        sidebarLink.href = "#";
        sidebarLink.textContent = topicDisplayName;

        // Handler to start quiz for this topic
        const startTopicQuizHandler = () => {
            startQuiz(topicDisplayName, data[topic]); // Pass display name and questions
            // Close sidebar if open
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('overlay').style.display = 'none';
        };

        gridCard.addEventListener('click', startTopicQuizHandler);

        const listItem = document.createElement('li'); // Create list item for sidebar
        sidebarLink.addEventListener('click', startTopicQuizHandler);
        listItem.appendChild(sidebarLink);

        topicsList.appendChild(gridCard);
        sidebarList.appendChild(listItem);
    });

    translateUI(currentLanguage); // Update UI text based on language
}

// **=================================================**
// [3] منطق الاختبار (بدء، عرض، إجابة، نتائج)
// **=================================================**

// ------ دالة خلط عشوائي للمصفوفة (Fisher-Yates) - جديدة ------
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

// ------ دالة بدء التحدي اليومي - جديدة ------
function startDailyChallenge() {
    const t = translations[currentLanguage];
    if (!geologicalData || Object.keys(geologicalData).length === 0) {
        console.error("Geological data not loaded yet.");
        // Maybe show a notification toast here
        showNotification("Data not ready, please wait."); // Example notification
        return;
    }

    let allQuestions = [];
    // Combine questions from all topics
    Object.values(geologicalData).forEach(topicQuestions => {
        allQuestions = allQuestions.concat(topicQuestions);
    });

    // Shuffle and select the required number of questions
    const shuffledQuestions = shuffleArray(allQuestions);
    const dailyQuestions = shuffledQuestions.slice(0, DAILY_CHALLENGE_QUESTIONS);

    if (dailyQuestions.length < DAILY_CHALLENGE_QUESTIONS) {
        console.warn(`Not enough questions for daily challenge. Found ${dailyQuestions.length}`);
        // Optionally show a message or proceed with fewer questions
    }

    // Start the quiz with the selected questions and specific title
    startQuiz(t.daily_challenge, dailyQuestions);
}


function startQuiz(quizTitle, questions) { // Modified to accept title
    clearInterval(timerInterval);

    currentQuestions = questions;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};

    // Hide previous screens
    const topicSelection = document.getElementById('topic-selection');
    const topicsListContainer = document.getElementById('topics-list-container');
    const resultsScreen = document.getElementById('results-screen');
    const quizScreen = document.getElementById('quiz-screen');

    if (topicSelection) topicSelection.classList.add('hidden');
    if (topicsListContainer) topicsListContainer.classList.add('hidden'); // Hide topic list if visible
    if (resultsScreen) resultsScreen.classList.add('hidden');

    // Show quiz screen
    if (quizScreen) quizScreen.classList.remove('hidden');

    // Set the quiz title (using the passed title)
    const quizTitleElement = document.getElementById('quiz-title');
    if (quizTitleElement) {
        quizTitleElement.textContent = `${translations[currentLanguage].quiz_title_prefix} ${quizTitle}`;
    }


    displayQuestion();
}

function displayQuestion() {
    clearInterval(timerInterval); // Clear previous timer
    const qContainer = document.getElementById('question-container');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const questionCounter = document.getElementById('question-counter');
    const currentScoreDisplay = document.getElementById('current-score'); // Added for score update

    if (currentQuestionIndex >= currentQuestions.length) {
        return showResults(); // End quiz if no more questions
    }

    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];

    if (!currentQ) {
        console.error("Invalid question data at index:", currentQuestionIndex);
        return showResults(); // Or handle error appropriately
    }

    startTimer(); // Start timer for the new question

    // Update question counter
    if (questionCounter) {
        questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    }
     // Update current score display - NEW
     if (currentScoreDisplay) {
         currentScoreDisplay.textContent = score;
     }

    // Build question HTML
    let htmlContent = `<p class="question-text">${currentQ.question}</p>`;
    htmlContent += '<div class="options-container">';

    // Ensure options exist and shuffle them if needed (optional)
    const options = currentQ.options ? [...currentQ.options] : []; // Copy options
    // shuffleArray(options); // Uncomment to shuffle options display order

    options.forEach((option, index) => {
        const optionId = `q${currentQuestionIndex}-opt${index}`;
        htmlContent += `
            <label class="option-label" for="${optionId}">
                <input type="radio" name="option" id="${optionId}" value="${option}">
                <span class="option-text">${option}</span>
            </label>
        `;
    });
    htmlContent += '</div>';
    qContainer.innerHTML = htmlContent;

    // Reset button states
    if (submitBtn) {
        submitBtn.classList.remove('hidden');
        submitBtn.disabled = true; // Disable submit until an option is selected
    }
    if (nextBtn) {
        nextBtn.classList.add('hidden');
    }


    // Enable submit button when an option is selected
    document.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => {
            if (submitBtn) submitBtn.disabled = false;
        });
    });

    // Hide feedback from previous question
     const feedbackContainer = document.getElementById('feedback-container');
     if (feedbackContainer) feedbackContainer.classList.add('hidden');
}

// ------ معالجة الإجابة (Submit) ------
const submitBtn = document.getElementById('submit-btn');
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        clearInterval(timerInterval); // Stop timer immediately

        const selectedOptionInput = document.querySelector('input[name="option"]:checked');
        if (!selectedOptionInput) return; // Should not happen if button is enabled correctly

        const userAnswer = selectedOptionInput.value;
        const currentQ = currentQuestions[currentQuestionIndex];
        const correctAnswer = currentQ.answer;
        const isCorrect = (userAnswer === correctAnswer);

        // Update score
        if (isCorrect) {
            score += POINTS_CORRECT;
        } else {
            score += POINTS_WRONG;
        }

        // Store user answer details
        userAnswers[currentQ.id || currentQuestionIndex] = {
            question: currentQ.question,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect,
        };

        // Provide visual feedback on options
        document.querySelectorAll('.option-label').forEach(label => {
            const input = label.querySelector('input');
            input.disabled = true; // Disable all options

            if (input.value === correctAnswer) {
                label.classList.add('correct'); // Highlight correct answer
            } else if (input.checked && !isCorrect) {
                label.classList.add('incorrect'); // Highlight wrong selected answer
            }
        });

         // Show feedback message (optional, can be styled)
         const feedbackContainer = document.getElementById('feedback-container');
         if (feedbackContainer) {
             feedbackContainer.textContent = isCorrect ? "إجابة صحيحة!" : `إجابة خاطئة. الصحيح: ${correctAnswer}`;
             feedbackContainer.className = `feedback-message ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`; // Use classes for styling
             feedbackContainer.classList.remove('hidden');
         }

        // Update score display immediately after answering
         const currentScoreDisplay = document.getElementById('current-score');
         if (currentScoreDisplay) {
             currentScoreDisplay.textContent = score;
         }


        // Toggle buttons
        if (submitBtn) submitBtn.classList.add('hidden');
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.classList.remove('hidden');
    });
}

// ------ الانتقال للسؤال التالي (Next) ------
const nextBtn = document.getElementById('next-btn');
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        displayQuestion();
    });
}

// ------ التعامل مع انتهاء الوقت ------
function handleTimeout() {
    clearInterval(timerInterval);
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];

    // Penalize score for timeout
    score += POINTS_WRONG;

    // Store timeout answer
    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: t.timeout_answer, // Use translated timeout message
        correctAnswer: currentQ.answer,
        isCorrect: false,
    };

    // Disable options and show correct answer
    document.querySelectorAll('.option-label').forEach(label => {
        label.querySelector('input').disabled = true;
        // Mark all as incorrect initially
        label.classList.add('incorrect');
        // Then mark the correct one
        if (label.querySelector('input').value === currentQ.answer) {
            label.classList.remove('incorrect');
            label.classList.add('correct');
        }
    });

     // Show feedback for timeout
     const feedbackContainer = document.getElementById('feedback-container');
     if (feedbackContainer) {
         feedbackContainer.textContent = `انتهى الوقت! الإجابة الصحيحة: ${currentQ.answer}`;
         feedbackContainer.className = 'feedback-message incorrect-feedback'; // Style as incorrect
         feedbackContainer.classList.remove('hidden');
     }

    // Update score display after timeout penalty
     const currentScoreDisplay = document.getElementById('current-score');
     if (currentScoreDisplay) {
         currentScoreDisplay.textContent = score;
     }

    // Toggle buttons
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) submitBtn.classList.add('hidden');
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.classList.remove('hidden');

    // Optional: Auto-advance after a short delay
    // setTimeout(() => {
    //     currentQuestionIndex++;
    //     displayQuestion();
    // }, 2000); // Wait 2 seconds before moving on
}


// ------ عرض النتائج النهائية ------
function showResults() {
    clearInterval(timerInterval);
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const finalScoreElement = document.getElementById('final-score');
    const totalQuestionsCountElement = document.getElementById('total-questions-count');
    const gradeMessage = document.getElementById('grade-message');
    const reviewArea = document.getElementById('review-area');
    const correctCountElement = document.getElementById('correct-count');
    const wrongCountElement = document.getElementById('wrong-count');
    // const totalTimeElement = document.getElementById('total-time'); // Need to track time if required

    if (quizScreen) quizScreen.classList.add('hidden');
    if (resultsScreen) resultsScreen.classList.remove('hidden');

    let correctCount = 0;
    Object.values(userAnswers).forEach(answer => {
        if (answer.isCorrect) {
            correctCount++;
        }
    });

    const totalQuestions = currentQuestions.length;
    const wrongCount = totalQuestions - correctCount;

    // Update summary numbers
    if (finalScoreElement) finalScoreElement.textContent = score;
    if (totalQuestionsCountElement) totalQuestionsCountElement.textContent = totalQuestions;
    if (correctCountElement) correctCountElement.textContent = correctCount;
    if (wrongCountElement) wrongCountElement.textContent = wrongCount;
    // Update total time if tracked

    // Calculate percentage and display grade message
    const divisor = totalQuestions || 1; // Avoid division by zero
    const percentage = Math.round((correctCount / divisor) * 100);
    const t = translations[currentLanguage];

    if (gradeMessage) {
        if (percentage >= 90) {
            gradeMessage.innerHTML = t.great_job;
            gradeMessage.style.color = 'var(--correct-color)';
        } else if (percentage >= 70) {
            gradeMessage.innerHTML = t.good_job;
            gradeMessage.style.color = 'var(--neon-blue)';
        } else {
            gradeMessage.innerHTML = t.needs_review;
            gradeMessage.style.color = 'var(--incorrect-color)';
        }
    }

    // Update progress ring animation
    const progressRingFill = document.querySelector('.progress-ring-fill');
    if (progressRingFill) {
        const radius = progressRingFill.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        progressRingFill.style.strokeDashoffset = offset;
    }


    // Display review of errors
    if (reviewArea) {
        reviewArea.innerHTML = `<h3><i class="fas fa-bug"></i> ${t.review_errors}</h3>`; // Add icon back
        let errorsFound = false;

        Object.values(userAnswers).forEach(answer => {
            if (!answer.isCorrect) {
                errorsFound = true;
                reviewArea.innerHTML += `
                    <div class="review-item">
                        <p class="error-q">${answer.question}</p>
                        <p class="error-a">${t.your_answer} <span class="wrong">${answer.userAnswer}</span></p>
                        <p class="error-a">${t.correct_answer} <span class="right">${answer.correctAnswer}</span></p>
                    </div>
                `;
            }
        });

        if (!errorsFound) {
            reviewArea.innerHTML += `<p class="all-correct">${t.all_correct_message}</p>`;
        }
    }
}


// **=================================================**
// [4] وظائف مساعدة (مؤقت، ترجمة، تبديل السمة، إلخ)
// **=================================================**

function startTimer() {
    clearInterval(timerInterval); // Clear any existing timer
    let timeRemaining = TIME_LIMIT;
    const timerValueElement = document.querySelector('#timer-display .timer-value'); // Target only the number span
    const timerUnitElement = document.querySelector('#timer-display .timer-unit'); // Target unit span if needed for language
    const progressBar = document.getElementById('progress-bar-fill');
    const t = translations[currentLanguage];

    // Reset styles and text
    if (timerValueElement) {
        timerValueElement.parentElement.style.color = 'var(--neon-blue)'; // Reset color on the parent span
        timerValueElement.textContent = timeRemaining;
    }
     if (timerUnitElement) {
        timerUnitElement.textContent = t.timer_text; // Update unit text
    }
    if (progressBar) progressBar.style.width = '100%';


    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timerValueElement) timerValueElement.textContent = timeRemaining;

        const progressPercentage = (timeRemaining / TIME_LIMIT) * 100;
        if (progressBar) progressBar.style.width = `${progressPercentage}%`;

        // Change timer color as warning
        if (timeRemaining <= 5) {
            if (timerValueElement) timerValueElement.parentElement.style.color = 'var(--incorrect-color)';
        } else {
             if (timerValueElement) timerValueElement.parentElement.style.color = 'var(--neon-blue)';
        }

        // Handle timeout
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}


function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar']; // Fallback to Arabic

    document.documentElement.lang = langCode; // Set page language
    document.documentElement.dir = (langCode === 'ar') ? 'rtl' : 'ltr'; // Set page direction

    // Helper function to update text content if element exists
    const updateText = (selector, key) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = t[key];
    };
    // Helper function to update innerHTML if element exists
     const updateHTML = (selector, key, iconClass = '') => {
        const element = document.querySelector(selector);
        if (element) {
             const iconHTML = iconClass ? `<span class="btn-icon"><i class="${iconClass}"></i></span>` : '';
             // Check if it needs icon structure
             if (element.classList.contains('control-btn')) {
                  element.innerHTML = `${iconHTML}<span class="btn-text">${t[key]}</span>${element.querySelector('.btn-glow') ? '<span class="btn-glow"></span>' : ''}`;
             } else {
                  element.innerHTML = t[key] + (iconHTML ? ` ${iconHTML}` : ''); // Simpler update for non-buttons
             }
        }
    };

    // Update various elements using helpers
    updateHTML('#start-quiz-btn .btn-text', 'start_custom_quiz'); // Update only text part
    updateHTML('#daily-challenge-btn .btn-text', 'daily_challenge_button'); // Update only text part
    updateText('#topics-list-container h3', 'choose_domain');

    // Update elements within the quiz screen only if it's active
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        updateText('#quiz-title', 'quiz_title_prefix'); // Update prefix, actual title set in startQuiz
        updateHTML('#submit-btn .btn-text', 'submit');
        updateHTML('#next-btn .btn-text', 'next');
        const timerUnitElement = document.querySelector('#timer-display .timer-unit');
         if (timerUnitElement) timerUnitElement.textContent = t.timer_text;
          const questionCounterElement = document.getElementById('question-counter');
        if (questionCounterElement) {
            // Reconstruct the counter text
            questionCounterElement.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        }
    }

     // Update elements within the results screen only if it's active
     if (!document.getElementById('results-screen').classList.contains('hidden')) {
        updateHTML('#results-screen button[onclick*="reload"] .btn-text', 'new_quiz');
        // Re-evaluate grade message based on current percentage/score if needed
         const gradeMessageElement = document.getElementById('grade-message');
         if (gradeMessageElement) {
             // Re-apply logic based on score or recalculate percentage if necessary
             // This might require storing the percentage or score globally accessible here
             // For now, just re-fetching based on existing content might be tricky.
             // It's better to update it fully when showResults is called after language change.
         }
         const reviewTitle = document.querySelector('#review-area h3');
         if (reviewTitle) reviewTitle.innerHTML = `<i class="fas fa-bug"></i> ${t.review_errors}`;

          // Translate review items if they exist
          document.querySelectorAll('.review-item').forEach(item => {
              const yourAnswerP = item.querySelector('.error-a:first-of-type');
              const correctAnswerP = item.querySelector('.error-a:last-of-type');
              const wrongSpan = item.querySelector('.wrong');
              const rightSpan = item.querySelector('.right');

              if (yourAnswerP && wrongSpan) {
                  yourAnswerP.innerHTML = `${t.your_answer} <span class="wrong">${wrongSpan.textContent}</span>`;
              }
              if (correctAnswerP && rightSpan) {
                  correctAnswerP.innerHTML = `${t.correct_answer} <span class="right">${rightSpan.textContent}</span>`;
              }
          });
         const allCorrectMsg = document.querySelector('.all-correct');
         if(allCorrectMsg) allCorrectMsg.textContent = t.all_correct_message;
    }


    // Update sidebar topic links if needed (textContent usually sufficient)
    // Update active user title attribute
     const activeUsersIndicator = document.querySelector('.active-users-indicator');
     if (activeUsersIndicator) activeUsersIndicator.title = t.active_users_title;

    // Update language selector visually (optional)
    const langSelect = document.getElementById('lang-select');
    if (langSelect) langSelect.value = langCode;
}


function changeLanguage(langCode) {
    translateUI(langCode);
    // Optionally: re-render dynamic content like topic list names if they need translation
    // initializeTopicSelection(geologicalData); // This might re-add listeners, be careful
}

// ------ تبديل السمة ------
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const body = document.body;
        let currentTheme = body.getAttribute('data-theme');
        const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggleBtn.innerHTML = (newTheme === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // Load saved theme on startup
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    document.body.setAttribute('data-theme', savedTheme);
    themeToggleBtn.innerHTML = (savedTheme === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// ------ إظهار إشعار مؤقت (Toast) ------
function showNotification(message, duration = 3000) {
    const toast = document.getElementById('notification-toast');
    const messageElement = document.getElementById('notification-message');
    if (!toast || !messageElement) return;

    messageElement.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        // Add a delay before hiding completely for fade-out effect if desired
        setTimeout(() => {
             toast.classList.add('hidden');
        }, 500); // Match this duration to CSS transition if any
    }, duration);
}


// **=================================================**
// [5] تشغيل الكود عند تحميل الصفحة
// **=================================================**

document.addEventListener('DOMContentLoaded', () => {
    // --- التحكم في القائمة الجانبية ---
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');

    if (openSidebarBtn && sidebar && overlay) {
        openSidebarBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.style.display = 'block';
        });
    }

    if (closeSidebarBtn && sidebar && overlay) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
        });
    }
     // Close sidebar if clicking overlay
     if (overlay && sidebar) {
          overlay.addEventListener('click', () => {
               sidebar.classList.remove('open');
               overlay.style.display = 'none';
          });
     }


    // --- زر إعادة تشغيل النظام ---
    // Moved event listener addition inside DOMContentLoaded for safety
    const restartBtn = document.querySelector('#results-screen button[onclick*="reload"]');
    if (restartBtn) {
         // The onclick attribute handles the reload, but we could add more complex logic here if needed.
         // Example: restartBtn.addEventListener('click', () => { /* custom logic */ window.location.reload(); });
    }

     // --- Active users count update ---
     const activeUsersCountElement = document.getElementById('active-users-count');
     function updateActiveUsers() {
         const randomCount = Math.floor(Math.random() * (35 - 7 + 1)) + 7; // Random between 7 and 35
         if (activeUsersCountElement) {
             activeUsersCountElement.textContent = randomCount;
         }
     }
     setInterval(updateActiveUsers, 50000); // Update every 50 seconds
     updateActiveUsers(); // Initial update


    // --- تحميل بيانات الاختبار ---
    loadGeologyData(); // Load data after DOM is ready
});

// Load initial language (could be from storage or default)
translateUI(currentLanguage);
