// **=================================================**
// [1] المتغيرات العالمية والتحكم
// **=================================================**
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
        'daily_challenge_button': 'التحدي اليومي',
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
        'active_users_title': 'المتدربون النشطون الآن',
        // *** إضافة ترجمات GIS ***
        'gis_quiz_title': 'نظم المعلومات الجغرافية (GIS)',
        'loading_gis_quiz': 'جاري تحميل اختبار GIS...',
        'gis_quiz_load_error': 'خطأ في تحميل اختبار GIS. تحقق من الملف gis_questions.json.',
        'gis_quiz_empty_error': 'خطأ: ملف أسئلة GIS فارغ أو غير صحيح.'
    },
    'en': {
        'start_custom_quiz': 'Start Custom Quiz',
        'daily_challenge': 'Daily Challenge',
        'daily_challenge_button': 'Daily Challenge',
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
        'active_users_title': 'Active Trainees Now',
        // *** إضافة ترجمات GIS ***
        'gis_quiz_title': 'Geographic Information Systems (GIS)',
        'loading_gis_quiz': 'Loading GIS quiz...',
        'gis_quiz_load_error': 'Error loading GIS quiz. Check gis_questions.json file.',
        'gis_quiz_empty_error': 'Error: GIS questions file is empty or invalid.'
    },
    'fr': {
        'start_custom_quiz': 'Commencer Quiz Personnalisé',
        'daily_challenge': 'Défi Quotidien',
        'daily_challenge_button': 'Défi Quotidien',
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
        'active_users_title': 'Apprenants Actifs Maintenant',
         // *** إضافة ترجمات GIS ***
        'gis_quiz_title': 'Systèmes d\'Information Géographique (SIG)',
        'loading_gis_quiz': 'Chargement du quiz SIG...',
        'gis_quiz_load_error': 'Erreur lors du chargement du quiz SIG. Vérifiez le fichier gis_questions.json.',
        'gis_quiz_empty_error': 'Erreur : Le fichier de questions SIG est vide ou invalide.'
    }
};

// **=================================================**
// [2] تحميل البيانات والتهيئة الأولية
// **=================================================**

async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    const startCustomBtn = document.getElementById('start-quiz-btn');
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn');

    try {
        if (loadingMessage) {
            loadingMessage.textContent = translations[currentLanguage].loading_data;
            loadingMessage.classList.remove('hidden');
        }
        if (startCustomBtn) startCustomBtn.disabled = true;
        if (dailyChallengeBtn) dailyChallengeBtn.disabled = true;

        const response = await fetch('./Question.json');
        if (!response.ok) {
            // Don't throw immediately, maybe Question.json is optional
            console.warn(`Could not load Question.json: ${response.status}`);
             geologicalData = {}; // Set to empty object if fails
             // Proceed to initialize UI, which will add GIS button anyway
             initializeUIElements(geologicalData);
             if (loadingMessage) {
                 // Optionally show a less severe warning or just hide loading
                 // loadingMessage.textContent = "Warning: Could not load main questions.";
                 loadingMessage.classList.add('hidden'); // Hide loading message
             }
        } else {
            geologicalData = await response.json();
            initializeUIElements(geologicalData);
        }

    } catch (error) {
        console.error("فشل في تحميل بيانات الجيولوجيا (Question.json):", error);
        geologicalData = {}; // Ensure it's an empty object on error
        initializeUIElements(geologicalData); // Initialize UI even if Question.json fails
        if (loadingMessage) {
            // loadingMessage.textContent = translations[currentLanguage].loading_error;
            // loadingMessage.classList.remove('hidden');
            loadingMessage.classList.add('hidden'); // Hide loading message to avoid blocking GIS
        }
        // Keep main buttons potentially disabled if Question.json failed critically
        if (startCustomBtn) startCustomBtn.disabled = true; // Keep disabled if Question.json fails
        if (dailyChallengeBtn) dailyChallengeBtn.disabled = true; // Keep disabled if Question.json fails
    }
}

function initializeUIElements(data) {
    const topicsList = document.getElementById('topics-list');
    const sidebarList = document.getElementById('sidebar-topics-list');
    const loadingMessage = document.getElementById('loading-message');
    const startCustomBtn = document.getElementById('start-quiz-btn');
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
    const topicsListContainer = document.getElementById('topics-list-container');
    const t = translations[currentLanguage]; // Get translations

    if (loadingMessage) loadingMessage.classList.add('hidden');

    // Only enable startCustomBtn if data from Question.json is available
    if (startCustomBtn && Object.keys(data).length > 0) {
        startCustomBtn.disabled = false;
        startCustomBtn.classList.remove('hidden');
        startCustomBtn.addEventListener('click', () => {
             if (startCustomBtn) startCustomBtn.classList.add('hidden');
             if (dailyChallengeBtn) dailyChallengeBtn.parentElement.classList.add('hidden');
             if (topicsListContainer) topicsListContainer.classList.remove('hidden');
        });
    } else if (startCustomBtn) {
        startCustomBtn.disabled = true; // Keep disabled if no data
        // startCustomBtn.classList.add('hidden'); // Optionally hide if no data
    }

    // Only enable dailyChallengeBtn if data from Question.json is available
    if (dailyChallengeBtn && Object.keys(data).length > 0) {
         dailyChallengeBtn.disabled = false;
         dailyChallengeBtn.parentElement.classList.remove('hidden');
         dailyChallengeBtn.addEventListener('click', startDailyChallenge);
    } else if (dailyChallengeBtn) {
        dailyChallengeBtn.disabled = true; // Keep disabled if no data
        // dailyChallengeBtn.parentElement.classList.add('hidden'); // Optionally hide if no data
    }


    topicsList.innerHTML = '';
    sidebarList.innerHTML = '';

    // Load topics from Question.json (if available)
    Object.keys(data).forEach(topic => {
        const topicDisplayName = topic.replace(/_/g, ' ');
        // Main list card
        const gridCard = document.createElement('div');
        gridCard.className = 'topic-card';
        gridCard.textContent = topicDisplayName;
        gridCard.addEventListener('click', () => startTopicQuizHandler(topicDisplayName, data[topic]));
        topicsList.appendChild(gridCard);

        // Sidebar link
        const sidebarLink = document.createElement('a');
        sidebarLink.href = "#";
        sidebarLink.textContent = topicDisplayName;
        sidebarLink.addEventListener('click', (e) => {
             e.preventDefault();
             startTopicQuizHandler(topicDisplayName, data[topic]);
        });
        const listItem = document.createElement('li');
        listItem.appendChild(sidebarLink);
        sidebarList.appendChild(listItem);
    });

     // Handler function to simplify calling startQuiz and closing sidebar
     const startTopicQuizHandler = (title, questions) => {
         startQuiz(title, questions);
         document.getElementById('sidebar').classList.remove('open');
         document.getElementById('overlay').style.display = 'none';
     };


    // --- *** إضافة زر/رابط GIS يدوياً (دائماً) *** ---
    const gisTopicName = t.gis_quiz_title; // Use translated title

    // زر في القائمة الرئيسية
    const gisGridCard = document.createElement('div');
    gisGridCard.className = 'topic-card gis-topic-card'; // Add specific class if needed
    gisGridCard.textContent = gisTopicName;
    gisGridCard.addEventListener('click', startGisQuiz); // Call the new function
    if (topicsList) topicsList.appendChild(gisGridCard); // Add even if Question.json failed

    // رابط في القائمة الجانبية
    const gisSidebarLink = document.createElement('a');
    gisSidebarLink.href = "#";
    gisSidebarLink.textContent = gisTopicName;
    gisSidebarLink.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        startGisQuiz();
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').style.display = 'none';
    });
    const gisListItem = document.createElement('li');
    gisListItem.appendChild(gisSidebarLink);
    if (sidebarList) sidebarList.appendChild(gisListItem); // Add even if Question.json failed
    // --- *** نهاية الإضافة *** ---


    translateUI(currentLanguage); // Call translateUI *after* adding all elements
}

// --- *** دالة جديدة لتحميل وبدء اختبار GIS *** ---
async function startGisQuiz() {
    const t = translations[currentLanguage];
    try {
        showNotification(t.loading_gis_quiz); // Show loading notification
        const response = await fetch('./gis_questions.json'); // Fetch from the new file
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const gisQuestions = await response.json();

        // Check if data is an array and has questions
        if (Array.isArray(gisQuestions) && gisQuestions.length > 0) {
            startQuiz(t.gis_quiz_title, gisQuestions); // Start quiz with fetched questions
        } else {
             console.error("GIS questions data is not a valid array or is empty:", gisQuestions);
             showNotification(t.gis_quiz_empty_error);
        }
    } catch (error) {
        console.error("فشل في تحميل أسئلة GIS:", error);
        showNotification(t.gis_quiz_load_error);
    }
}
// --- *** نهاية الدالة الجديدة *** ---


// **=================================================**
// [3] منطق الاختبار (بدء، عرض، إجابة، نتائج)
// **=================================================**

// ------ دالة خلط عشوائي للمصفوفة (Fisher-Yates) ------
function shuffleArray(array) {
    // Ensure input is an array
    if (!Array.isArray(array)) {
        console.error("shuffleArray received non-array:", array);
        return []; // Return empty array or handle error appropriately
    }
    const shuffled = [...array]; // Create a copy to shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
}


// ------ دالة بدء التحدي اليومي ------
function startDailyChallenge() {
    const t = translations[currentLanguage];
    // Check if geologicalData is loaded and has keys
    if (!geologicalData || Object.keys(geologicalData).length === 0) {
        console.error("Geological data (Question.json) not loaded or empty for daily challenge.");
        showNotification(t.loading_error); // Show general loading error
        return;
    }

    let allQuestions = [];
    Object.values(geologicalData).forEach(topicQuestions => {
         // Ensure topicQuestions is an array before concatenating
         if (Array.isArray(topicQuestions)) {
             allQuestions = allQuestions.concat(topicQuestions);
         } else {
             console.warn("Skipping non-array questions for topic:", topicQuestions);
         }
    });

    if (allQuestions.length < DAILY_CHALLENGE_QUESTIONS) {
         console.warn(`Not enough unique questions for daily challenge. Found ${allQuestions.length}, needed ${DAILY_CHALLENGE_QUESTIONS}. Questions might repeat if source has fewer.`);
         // If you want to strictly prevent starting with too few questions:
         // if (allQuestions.length < 1) { // Or a higher threshold
         //     showNotification("لا توجد أسئلة كافية للتحدي اليومي.");
         //     return;
         // }
    }
     if (allQuestions.length === 0) {
         showNotification("لا توجد أسئلة متاحة للتحدي اليومي.");
         return;
    }


    const shuffledQuestions = shuffleArray(allQuestions); // Shuffle the combined list
    const dailyQuestions = shuffledQuestions.slice(0, DAILY_CHALLENGE_QUESTIONS);

    startQuiz(t.daily_challenge, dailyQuestions);
}


function startQuiz(quizTitle, questions) {
    clearInterval(timerInterval);

    // Ensure questions is a non-empty array before proceeding
    if (!Array.isArray(questions) || questions.length === 0) {
        console.error("Invalid or empty questions data provided to startQuiz:", questions);
        showNotification("خطأ: لا يمكن بدء الاختبار ببيانات أسئلة غير صالحة.");
        // Go back to topic selection or show a more specific error
        document.getElementById('quiz-screen')?.classList.add('hidden');
        document.getElementById('topic-selection')?.classList.remove('hidden');
        // Make sure buttons are potentially visible again
         const startCustomBtn = document.getElementById('start-quiz-btn');
         const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
         if (startCustomBtn && Object.keys(geologicalData).length > 0) startCustomBtn.classList.remove('hidden');
         if (dailyChallengeBtn && Object.keys(geologicalData).length > 0) dailyChallengeBtn.parentElement?.classList.remove('hidden');

        return;
    }

    currentQuestions = shuffleArray(questions); // Shuffle the provided questions for this quiz
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};

    const topicSelection = document.getElementById('topic-selection');
    const topicsListContainer = document.getElementById('topics-list-container');
    const resultsScreen = document.getElementById('results-screen');
    const quizScreen = document.getElementById('quiz-screen');

    if (topicSelection) topicSelection.classList.add('hidden');
     if (topicsListContainer) topicsListContainer.classList.add('hidden'); // Also hide the list container
    if (resultsScreen) resultsScreen.classList.add('hidden');
    if (quizScreen) quizScreen.classList.remove('hidden');

    const quizTitleElement = document.getElementById('quiz-title');
    if (quizTitleElement) {
        // Use the provided quizTitle directly (it's already translated or specific like "Daily Challenge")
        quizTitleElement.textContent = quizTitle;
    }

    displayQuestion();
}


function displayQuestion() {
    clearInterval(timerInterval);
    const qContainer = document.getElementById('question-container');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const skipBtn = document.getElementById('skip-btn'); // Get skip button
    const questionCounter = document.getElementById('question-counter');
    const currentScoreDisplay = document.getElementById('current-score');

    if (!qContainer || !submitBtn || !nextBtn || !skipBtn || !questionCounter || !currentScoreDisplay) {
        console.error("One or more essential quiz UI elements are missing.");
        return; // Stop if core elements aren't found
    }


    if (currentQuestionIndex >= currentQuestions.length) {
        return showResults();
    }

    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];

    // More robust check for valid question object structure
    if (!currentQ || typeof currentQ.question !== 'string' || !Array.isArray(currentQ.options) || currentQ.options.length === 0 || typeof currentQ.answer === 'undefined') {
        console.error("Invalid question data structure at index:", currentQuestionIndex, currentQ);
        showNotification("خطأ في بيانات السؤال الحالي، سيتم تخطيه.");
        currentQuestionIndex++;
        // Use setTimeout to allow the notification to show before potentially ending the quiz
        setTimeout(displayQuestion, 50);
        return;
    }


    startTimer();

    questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    currentScoreDisplay.textContent = score;

    // Basic HTML sanitization helper
    const sanitizeHTML = (str) => {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

    let htmlContent = `<p class="question-text">${sanitizeHTML(currentQ.question)}</p>`;
    htmlContent += '<div class="options-container">';

    const options = shuffleArray([...currentQ.options]); // Shuffle options for display

    options.forEach((option, index) => {
        const optionId = `q${currentQuestionIndex}-opt${index}`;
        // Sanitize option text as well
        const sanitizedOption = sanitizeHTML(String(option)); // Ensure option is string
        htmlContent += `
            <label class="option-label" for="${optionId}">
                <input type="radio" name="option" id="${optionId}" value="${sanitizedOption}">
                <span class="option-text">${sanitizedOption}</span>
            </label>
        `;
    });
    htmlContent += '</div>';
    qContainer.innerHTML = htmlContent;

    submitBtn.classList.remove('hidden');
    submitBtn.disabled = true;
    nextBtn.classList.add('hidden');
    skipBtn.classList.remove('hidden'); // Ensure skip button is visible

    // Remove previous listener before adding new one
    const newSkipBtn = skipBtn.cloneNode(true); // Clone to remove listeners
    skipBtn.parentNode.replaceChild(newSkipBtn, skipBtn);
    newSkipBtn.addEventListener('click', skipQuestion); // Add listener to new button


    qContainer.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => {
            submitBtn.disabled = false;
        });
    });

    // Feedback container is hidden via CSS
}

// --- Function to handle skipping a question ---
function skipQuestion() {
     clearInterval(timerInterval); // Stop timer
     // Optionally apply a penalty or just move on
     // score += POINTS_WRONG; // Example penalty

     // Mark as incorrect for review purposes (optional)
     const currentQ = currentQuestions[currentQuestionIndex];
      userAnswers[currentQ.id || currentQuestionIndex] = {
           question: currentQ.question,
           userAnswer: "(Skipped)", // Indicate skipped
           correctAnswer: currentQ.answer,
           isCorrect: false, // Treat skips as incorrect
       };

      // Update score display if penalty applied
     // const currentScoreDisplay = document.getElementById('current-score');
     // if (currentScoreDisplay) currentScoreDisplay.textContent = score;


     // Move to the next question
     currentQuestionIndex++;
     displayQuestion();
     showNotification("تم تخطي السؤال."); // Notify user
}


// ------ معالجة الإجابة (Submit) ------
const submitBtn = document.getElementById('submit-btn');
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        clearInterval(timerInterval);

        const selectedOptionInput = document.querySelector('input[name="option"]:checked');
        if (!selectedOptionInput) return;

        // Note: selectedOptionInput.value might be sanitized HTML. Compare carefully.
        const userAnswer = selectedOptionInput.value;
        const currentQ = currentQuestions[currentQuestionIndex];
        // Sanitize the correct answer before comparison if options were sanitized
        const correctAnswer = sanitizeHTML(String(currentQ.answer));
        const isCorrect = (userAnswer === correctAnswer);

        if (isCorrect) {
            score += POINTS_CORRECT;
        } else {
            score += POINTS_WRONG;
        }

        // Store the *original* unsanitized answer for review
        userAnswers[currentQ.id || currentQuestionIndex] = {
            question: currentQ.question,
             // Find the original option text corresponding to the selected value
             userAnswer: currentQ.options.find(opt => sanitizeHTML(String(opt)) === userAnswer) || userAnswer, // Fallback
            correctAnswer: currentQ.answer, // Store original correct answer
            isCorrect: isCorrect,
        };

        document.querySelectorAll('.option-label').forEach(label => {
            const input = label.querySelector('input');
            input.disabled = true;
            if (input.value === correctAnswer) {
                label.classList.add('correct');
            } else if (input.checked && !isCorrect) {
                label.classList.add('incorrect');
            }
        });

        const currentScoreDisplay = document.getElementById('current-score');
        if (currentScoreDisplay) currentScoreDisplay.textContent = score;

        submitBtn.classList.add('hidden');
         document.getElementById('skip-btn')?.classList.add('hidden'); // Hide skip button after submit
        document.getElementById('next-btn')?.classList.remove('hidden');
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
    if (!currentQ) {
         console.error("Timeout occurred but current question is invalid.");
         // Maybe try to advance or end quiz gracefully
         currentQuestionIndex++;
         displayQuestion(); // Try next
         return;
     };
    const t = translations[currentLanguage];

    score += POINTS_WRONG;

    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: t.timeout_answer,
        correctAnswer: currentQ.answer,
        isCorrect: false,
    };

     const correctAnswer = sanitizeHTML(String(currentQ.answer)); // Sanitize for comparison

    document.querySelectorAll('.option-label').forEach(label => {
         const input = label.querySelector('input');
         if(input) { // Check if input exists
             input.disabled = true;
             // Only highlight the correct answer on timeout
             if (input.value === correctAnswer) {
                 label.classList.add('correct');
             }
         }
    });

    const currentScoreDisplay = document.getElementById('current-score');
    if (currentScoreDisplay) currentScoreDisplay.textContent = score;

     document.getElementById('submit-btn')?.classList.add('hidden');
     document.getElementById('skip-btn')?.classList.add('hidden'); // Hide skip on timeout
     document.getElementById('next-btn')?.classList.remove('hidden');
}


// ------ عرض النتائج النهائية ------
function showResults() {
    clearInterval(timerInterval);
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const finalScoreElement = document.getElementById('final-score');
    const totalQuestionsCountElement = document.getElementById('total-questions-count');
    const gradeMessage = document.getElementById('grade-message');
    const reviewArea = document.getElementById('review-area'); // Outer container
    const reviewContent = document.getElementById('review-content'); // Inner container for items
    const correctCountElement = document.getElementById('correct-count');
    const wrongCountElement = document.getElementById('wrong-count');

    if (!resultsScreen || !finalScoreElement || !totalQuestionsCountElement || !gradeMessage || !reviewArea || !reviewContent || !correctCountElement || !wrongCountElement) {
        console.error("One or more results screen elements are missing.");
        return; // Stop if elements are missing
    }


    if (quizScreen) quizScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');

    let correctCount = 0;
    Object.values(userAnswers).forEach(answer => {
        if (answer.isCorrect) {
            correctCount++;
        }
    });

    const totalQuestions = currentQuestions.length;
    // Ensure totalQuestions is a valid number > 0 for percentage calculation
    if (totalQuestions <= 0) {
        console.error("Cannot calculate results with zero questions.");
        // Display an error message or handle appropriately
         gradeMessage.textContent = "خطأ: لم يتم العثور على أسئلة.";
         finalScoreElement.textContent = '-';
         totalQuestionsCountElement.textContent = '0';
         correctCountElement.textContent = '0';
         wrongCountElement.textContent = '0';
         reviewContent.innerHTML = '<p>لا يمكن عرض المراجعة.</p>';
        return;
    }

    const wrongCount = totalQuestions - correctCount;

    finalScoreElement.textContent = score;
    totalQuestionsCountElement.textContent = totalQuestions;
    correctCountElement.textContent = correctCount;
    wrongCountElement.textContent = wrongCount;

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const t = translations[currentLanguage];

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

    const progressRingFill = document.querySelector('.progress-ring-fill');
    if (progressRingFill) {
        const radius = progressRingFill.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const validPercentage = Math.max(0, Math.min(100, percentage));
        const offset = circumference - (validPercentage / 100) * circumference;

        // Force reflow to ensure animation restarts correctly
        progressRingFill.style.transition = 'none';
        progressRingFill.style.strokeDashoffset = circumference; // Reset to start
        progressRingFill.offsetHeight; // Trigger reflow
        progressRingFill.style.transition = 'stroke-dashoffset 2s ease-out';
        progressRingFill.style.strokeDashoffset = offset;
    }


    // Display review of errors
    const reviewTitle = reviewArea.querySelector('h3');
    if(reviewTitle) reviewTitle.innerHTML = `<i class="fas fa-bug"></i> ${t.review_errors}`;

    reviewContent.innerHTML = ''; // Clear previous review items
    let errorsFound = false;
     const sanitizeHTML = (str) => { // Re-use sanitizer
         const temp = document.createElement('div');
         temp.textContent = str;
         return temp.innerHTML;
     };

    Object.values(userAnswers).forEach(answer => {
        if (!answer.isCorrect) {
            errorsFound = true;
             // Sanitize for display
             const questionDisplay = sanitizeHTML(String(answer.question));
             const userAnswerDisplay = sanitizeHTML(String(answer.userAnswer));
             const correctAnswerDisplay = sanitizeHTML(String(answer.correctAnswer));

            reviewContent.innerHTML += `
                <div class="review-item">
                    <p class="error-q">${questionDisplay}</p>
                    <p class="error-a">${t.your_answer} <span class="wrong">${userAnswerDisplay}</span></p>
                    <p class="error-a">${t.correct_answer} <span class="right">${correctAnswerDisplay}</span></p>
                </div>
            `;
        }
    });

    if (!errorsFound) {
        reviewContent.innerHTML = `<p class="all-correct">${t.all_correct_message}</p>`;
    }
}


// **=================================================**
// [4] وظائف مساعدة (مؤقت، ترجمة، تبديل السمة، إلخ)
// **=================================================**

function startTimer() {
    clearInterval(timerInterval);
    let timeRemaining = TIME_LIMIT;
    const timerValueElement = document.querySelector('#timer-display .timer-value');
    const timerUnitElement = document.querySelector('#timer-display .timer-unit');
    const t = translations[currentLanguage];

    if (timerValueElement && timerValueElement.parentElement) { // Check parentElement too
        timerValueElement.parentElement.style.color = 'var(--neon-blue)';
        timerValueElement.textContent = timeRemaining;
    }
     if (timerUnitElement) {
        timerUnitElement.textContent = t.timer_text;
    }

    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timerValueElement) timerValueElement.textContent = timeRemaining;

        if (timeRemaining <= 5) {
            if (timerValueElement && timerValueElement.parentElement) timerValueElement.parentElement.style.color = 'var(--incorrect-color)';
        } else {
             if (timerValueElement && timerValueElement.parentElement) timerValueElement.parentElement.style.color = 'var(--neon-blue)';
        }

        if (timeRemaining <= 0) {
            // clearInterval(timerInterval); // handleTimeout clears it
            handleTimeout();
        }
    }, 1000);
}


function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar'];

    document.documentElement.lang = langCode;
    document.documentElement.dir = (langCode === 'ar') ? 'rtl' : 'ltr';

    const updateText = (selector, key) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = t[key];
    };
     const updateHTML = (selector, key, useIcon = true) => { // Added flag
        const element = document.querySelector(selector);
        if (element) {
             const existingIconHTML = element.querySelector('.btn-icon')?.outerHTML || '';
             const textSpan = `<span class="btn-text">${t[key]}</span>`;
             const glowSpan = element.querySelector('.btn-glow') ? '<span class="btn-glow"></span>' : '';

             if (element.classList.contains('control-btn')) {
                 element.innerHTML = `${useIcon ? existingIconHTML : ''}${textSpan}${glowSpan}`;
             } else {
                 element.textContent = t[key]; // Keep it simple for non-buttons
             }
        }
    };
     const updateTitleAttr = (selector, key) => { // Renamed for clarity
         const element = document.querySelector(selector);
         if(element) element.title = t[key];
     }


    updateHTML('#start-quiz-btn', 'start_custom_quiz');
    updateHTML('#daily-challenge-btn', 'daily_challenge_button');
    updateText('#topics-list-container h3', 'choose_domain');

    // --- Update newly added GIS button/link text ---
    const gisCard = document.querySelector('.gis-topic-card');
    if (gisCard) gisCard.textContent = t.gis_quiz_title;

    const gisSidebarLink = Array.from(document.querySelectorAll('#sidebar-topics-list a'))
                               .find(a => a.onclick && a.onclick.toString().includes('startGisQuiz'));
     if (gisSidebarLink) gisSidebarLink.textContent = t.gis_quiz_title;
     // --- End GIS update ---


    if (!document.getElementById('quiz-screen')?.classList.contains('hidden')) {
        updateHTML('#submit-btn', 'submit');
        updateHTML('#next-btn', 'next');
         updateHTML('#skip-btn', 'تخطي'); // Translate skip button
        const timerUnitElement = document.querySelector('#timer-display .timer-unit');
         if (timerUnitElement) timerUnitElement.textContent = t.timer_text;
          const questionCounterElement = document.getElementById('question-counter');
        // Check if currentQuestions is defined and has length
        if (questionCounterElement && typeof currentQuestions !== 'undefined' && currentQuestions.length > 0) {
            questionCounterElement.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        } else if (questionCounterElement) {
             // Handle case where quiz hasn't fully started or failed
              questionCounterElement.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} - / -`;
        }
    }


     if (!document.getElementById('results-screen')?.classList.contains('hidden')) {
        updateHTML('#results-screen button[onclick*="reload"]', 'new_quiz');
        const reviewTitle = document.querySelector('#review-area h3');
        if (reviewTitle) reviewTitle.innerHTML = `<i class="fas fa-bug"></i> ${t.review_errors}`;

        // Re-translate review items based on stored original text
        const reviewContent = document.getElementById('review-content');
        if (reviewContent) {
            reviewContent.querySelectorAll('.review-item').forEach(item => {
                const yourAnswerP = item.querySelector('.error-a:first-of-type');
                const correctAnswerP = item.querySelector('.error-a:last-of-type');
                // Spans contain the actual answers, which shouldn't be translated
                if (yourAnswerP) {
                    yourAnswerP.firstChild.textContent = t.your_answer + ' '; // Update text node
                }
                if (correctAnswerP) {
                    correctAnswerP.firstChild.textContent = t.correct_answer + ' '; // Update text node
                }
            });
            const allCorrectMsg = reviewContent.querySelector('.all-correct');
            if(allCorrectMsg) allCorrectMsg.textContent = t.all_correct_message;
        }
        // Grade message update requires re-running showResults or storing percentage
    }

    updateTitleAttr('.active-users-indicator', 'active_users_title');

    const langSelect = document.getElementById('lang-select');
    if (langSelect) langSelect.value = langCode;
}


function changeLanguage(langCode) {
    // translateUI(langCode); // Call translateUI *after* re-initializing
    currentLanguage = langCode; // Set language first
    // Re-initialize to update topic names and GIS button/link correctly
    const dataToUse = geologicalData || {};
    initializeUIElements(dataToUse);
    // translateUI is called at the end of initializeUIElements
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

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggleBtn.innerHTML = (savedTheme === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

// ------ إظهار إشعار مؤقت (Toast) ------
// Store timer ID on the toast element itself to manage multiple calls
let notificationTimeoutId = null;
function showNotification(message, duration = 3000) {
    const toast = document.getElementById('notification-toast');
    const messageElement = document.getElementById('notification-message');
    if (!toast || !messageElement) return;

    messageElement.textContent = message;

    // Clear existing timer if any, directly using the variable
    if (notificationTimeoutId) {
        clearTimeout(notificationTimeoutId);
    }

    // Make visible and add 'show' class
    toast.classList.remove('hidden');
    // Use a tiny timeout to allow CSS transition after removing 'hidden'
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });


    // Set new timer
    notificationTimeoutId = setTimeout(() => {
        toast.classList.remove('show');
        // Optional: Add hidden class after transition ends
         toast.addEventListener('transitionend', () => {
             // Check if the opacity transition ended (or another property)
              if (!toast.classList.contains('show')) {
                 toast.classList.add('hidden');
              }
         }, { once: true }); // Important: listener runs only once

        notificationTimeoutId = null; // Clear timer id
    }, duration);
}


// **=================================================**
// [5] تشغيل الكود عند تحميل الصفحة
// **=================================================**

document.addEventListener('DOMContentLoaded', () => {
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
     if (overlay && sidebar) {
          overlay.addEventListener('click', () => {
               sidebar.classList.remove('open');
               overlay.style.display = 'none';
          });
     }

     const activeUsersCountElement = document.getElementById('active-users-count');
     let currentActiveUsers = Math.floor(Math.random() * (8 - 3 + 1)) + 3;
     if (activeUsersCountElement) activeUsersCountElement.textContent = currentActiveUsers; // Initial value

     function updateActiveUsers() {
         const change = Math.floor(Math.random() * 3) - 1;
         let newCount = currentActiveUsers + change;
         if (newCount < 3) newCount = 4;
         if (newCount > 8) newCount = 7;
         currentActiveUsers = newCount;
         if (activeUsersCountElement) {
             activeUsersCountElement.textContent = currentActiveUsers;
         }
     }
     // Only set interval if the element exists
     if (activeUsersCountElement) {
        setInterval(updateActiveUsers, 5000);
     }


    loadGeologyData(); // Load data after DOM is ready

    // Initial language setting can be tricky with async loading.
    // Setting default lang attribute on <html> tag is good practice.
    // translateUI is called within initializeUIElements after data is ready.
    // translateUI(currentLanguage); // Might run too early or duplicate calls
});
