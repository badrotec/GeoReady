// **=================================================**
// [1] المتغيرات العالمية والتحكم المحسّنة
// **=================================================**
let geologicalData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval;
const TIME_LIMIT = 20;
const POINTS_CORRECT = 10;
const POINTS_WRONG = -5;
const DAILY_CHALLENGE_QUESTIONS = 7;
const ONBOARDING_MISSION_QUESTIONS = 3;
let currentLanguage = 'ar';
let userCommitted = false;
let cohortCountdownInterval;

// قاموس الترجمة المحسّن
const translations = { /* ... (نفس قاموس الترجمة السابق) ... */
    'ar': {
        'active_users_title': 'متدربون نشطون الآن',
        'hero_title': 'هل تجرؤ أن تحدد مصدر التلوث قبل أن يجف البئر؟',
        'hero_subtitle': 'تدريب ميداني مصمم مع مهندسي آبار - اختبر مهاراتك في 12 دقيقة.',
        'cta_main': 'ابدأ تحديك الميداني الآن',
        'cta_secondary': 'شاهد موجز المهمة (15 ث)',
        'cohort_countdown_title': 'دفعة النخبة القادمة تفتح بعد:',
        'onboarding_commit_question': 'هل تلتزم بإنجاز التحدي اليومي (5 دقائق) للمحافظة على تقدمك؟',
        'onboarding_commit_yes': 'نعم، ألتزم!',
        'onboarding_commit_no': 'لا، ربما لاحقاً',
        'onboarding_mission_start': 'مهمتك الأولى: تشخيص سريع', // أبسط
        'start_custom_quiz': 'ابدأ اختباراً مخصصاً', // زر قديم، قد لا نحتاجه
        'browse_custom_quizzes': 'تصفح جميع الاختبارات المخصصة', // زر جديد
        'back_button': 'العودة', // زر جديد
        'daily_challenge': 'التحدي اليومي',
        'daily_challenge_button': `التحدي اليومي (${DAILY_CHALLENGE_QUESTIONS} أسئلة)`,
        'choose_domain': 'اختر مجال الاختبار المخصص:',
        'quiz_title_prefix': 'مهمة:',
        'question': 'السؤال',
        'submit': 'تأكيد التشخيص',
        'next': 'السؤال التالي',
        'review_errors': 'تحليل الأخطاء الميدانية:',
        'your_answer': 'تشخيصك:',
        'correct_answer': 'التشخيص الصحيح:',
        'result_explanation': 'الشرح التفصيلي:',
        'great_job': '🌟 أداء خبير! يمكنك الاعتماد عليك في الميدان.',
        'good_job': '✨ أداء جيد! لديك أساس قوي، استمر في الصقل.',
        'needs_review': '⚠️ تحتاج لمراجعة ميدانية مكثفة. لا تستسلم!',
        'new_quiz': 'ابدأ مهمة جديدة',
        'timer_text': 'ث',
        'loading_data': '... تحميل بيانات المهمة',
        'loading_error': '[خطأ تحميل] تعذر استلام بيانات المهمة. تحقق من الاتصال.',
        'timeout_answer': '(نفذ الوقت)',
        'all_correct_message': '🎉 ممتاز! أكملت المهمة بدون أخطاء.',
        'share_results_cta': 'شارك نتيجتك وتحداهم!',
        'badge_unlocked': 'شارة جديدة مفتوحة!',
        'proof_popup_title': 'هل تريد حفظ نتيجتك؟',
        'proof_popup_text': 'شاركها الآن واحصل على شارة مميزة!',
    },
    'en': { /* ... English translations ... */ },
    'fr': { /* ... French translations ... */ }
};


// **=================================================**
// [2] تحميل البيانات وتهيئة الواجهة الرئيسية (Hero)
// **=================================================**

async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    const mainCTA = document.getElementById('start-challenge-btn');
    const secondaryCTA = document.getElementById('view-brief-btn');
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
    const showTopicsBtn = document.getElementById('show-topics-btn'); // زر إظهار المواضيع الجديد

    try {
        setLoadingState(true); // دالة جديدة لتعطيل الأزرار وإظهار التحميل

        const response = await fetch('./Question.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        geologicalData = await response.json();

        initializeUIElements(geologicalData);
        startCohortCountdown();
        setLoadingState(false); // تمكين الأزرار وإخفاء التحميل

    } catch (error) {
        console.error("فشل تحميل بيانات المهمة:", error);
        setLoadingState(false, true); // إبقاء الأزرار معطلة وعرض رسالة خطأ
    }
}

// دالة جديدة للتحكم بحالة التحميل
function setLoadingState(isLoading, isError = false) {
     const loadingMessage = document.getElementById('loading-message'); // Note: Loading is inside topics list now
     const mainCTA = document.getElementById('start-challenge-btn');
     const secondaryCTA = document.getElementById('view-brief-btn');
     const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
     const showTopicsBtn = document.getElementById('show-topics-btn');
     const buttons = [mainCTA, secondaryCTA, dailyChallengeBtn, showTopicsBtn];

     buttons.forEach(btn => { if(btn) btn.disabled = isLoading || isError; });

     if (loadingMessage) {
        if (isLoading) {
            updateTextContent('#loading-message p', 'loading_data'); // Target the <p> tag inside
            // If loading message is inside topics list, we don't show it initially
            // loadingMessage.classList.remove('hidden');
        } else if (isError) {
             updateTextContent('#loading-message p', 'loading_error');
             // Decide where to show the error if the list container is hidden
             // Maybe show it in the hero section temporarily? Or use a toast?
             showNotification(translations[currentLanguage].loading_error, 5000); // Use toast for error
             loadingMessage.classList.add('hidden'); // Hide the spinner itself
        } else {
             loadingMessage.classList.add('hidden');
        }
     }
}


function initializeUIElements(data) {
    const t = translations[currentLanguage];
    // --- تحديث نصوص الهيرو ---
    updateTextContent('.hero-content h2', 'hero_title');
    updateTextContent('.hero-description', 'hero_subtitle');
    updateButtonText('#start-challenge-btn', 'cta_main');
    updateButtonText('#view-brief-btn', 'cta_secondary');
    updateButtonText('#daily-challenge-btn', 'daily_challenge_button');
    updateButtonText('#show-topics-btn', 'browse_custom_quizzes'); // زر جديد
    updateButtonText('#back-to-hero-btn', 'back_button'); // زر جديد


    // --- ربط وظائف الأزرار ---
    const mainCTA = document.getElementById('start-challenge-btn');
    const secondaryCTA = document.getElementById('view-brief-btn');
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
    const showTopicsBtn = document.getElementById('show-topics-btn'); // زر إظهار المواضيع
    const backToHeroBtn = document.getElementById('back-to-hero-btn'); // زر العودة

    if (mainCTA) mainCTA.onclick = handleMainCTA;
    if (secondaryCTA) secondaryCTA.onclick = showMissionBrief;
    if (dailyChallengeBtn) dailyChallengeBtn.onclick = startDailyChallenge;

    // زر إظهار قائمة المواضيع
    if (showTopicsBtn) {
        showTopicsBtn.onclick = () => {
            hideElement('.hero-section'); // إخفاء قسم الهيرو بالكامل
            showElement('#topics-list-container'); // إظهار قائمة المواضيع
        };
    }
    // زر العودة من قائمة المواضيع
    if (backToHeroBtn) {
         backToHeroBtn.onclick = () => {
            hideElement('#topics-list-container'); // إخفاء قائمة المواضيع
            showElement('.hero-section'); // إظهار قسم الهيرو
         };
    }


    // --- تهيئة قائمة المواضيع (للاختبار المخصص) ---
    const topicsList = document.getElementById('topics-list');
    const sidebarList = document.getElementById('sidebar-topics-list');
    if(topicsList && sidebarList) {
        topicsList.innerHTML = '';
        sidebarList.innerHTML = '';

        Object.keys(data).forEach(topic => {
            const topicDisplayName = topic.replace(/_/g, ' ');

            const gridCard = document.createElement('div');
            gridCard.className = 'topic-card';
            gridCard.textContent = topicDisplayName;

            const sidebarLink = document.createElement('a');
            sidebarLink.href = "#";
            sidebarLink.textContent = topicDisplayName;

            const startTopicQuizHandler = () => {
                startQuiz(topicDisplayName, data[topic]);
                closeSidebar();
            };

            gridCard.addEventListener('click', startTopicQuizHandler);

            const listItem = document.createElement('li');
            sidebarLink.addEventListener('click', startTopicQuizHandler);
            listItem.appendChild(sidebarLink);

            topicsList.appendChild(gridCard);
            sidebarList.appendChild(listItem);
        });
    }

    // Update all UI text
    translateUI(currentLanguage);
}

// **=================================================**
// [3] منطق تجربة الدخول (Onboarding) والتحديات
// **=================================================**

function handleMainCTA() {
    askForCommitment();
}

function askForCommitment() {
    const t = translations[currentLanguage];
    // **TODO: استبدل confirm بواجهة modal أجمل في HTML/CSS**
    showModal(t.onboarding_commit_question, [
        { text: t.onboarding_commit_yes, action: () => { userCommitted = true; console.log("User committed!"); startOnboardingMission(); }},
        { text: t.onboarding_commit_no, action: () => { userCommitted = false; console.log("User did not commit. Showing custom options."); showTopicsListScreen(); }} // Show topics list if no commit
    ]);
    // const confirmed = confirm(t.onboarding_commit_question); // Old confirm
    // if (confirmed) { /* ... */ } else { /* ... */ }
}

// Function to show the topics list screen (replaces old logic)
function showTopicsListScreen() {
    hideElement('.hero-section');
    showElement('#topics-list-container');
}

function startOnboardingMission() {
    const t = translations[currentLanguage];
    let allQuestions = [];
    Object.values(geologicalData).forEach(topicQuestions => {
        allQuestions = allQuestions.concat(topicQuestions);
    });

    const shuffledQuestions = shuffleArray(allQuestions);
    const missionQuestions = shuffledQuestions.slice(0, ONBOARDING_MISSION_QUESTIONS);

    startQuiz(t.onboarding_mission_start, missionQuestions);
}

function showMissionBrief() {
    // **TODO: اعرض modal بسيط (HTML/CSS) يحتوي على نص موجز للمهمة بدلاً من alert**
     showModal("موجز المهمة", [{text:"حسناً", action: ()=>{}}], // Simple modal
          "<p>سيتم عرض سلسلة من الحالات الميدانية. استخدم معرفتك الجيولوجية لتحديد التشخيص الصحيح ضمن الوقت المحدد. كل تشخيص صحيح يقربك من فهم أعمق...</p>");
    // alert("موجز المهمة: ..."); // Old alert
}

function shuffleArray(array) { /* ... (نفس الكود السابق) ... */
    for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array;
 }
function startDailyChallenge() { /* ... (نفس الكود السابق) ... */
    const t = translations[currentLanguage]; if (!geologicalData || Object.keys(geologicalData).length === 0) { console.error("Geological data not loaded yet."); showNotification("بيانات التحدي غير جاهزة بعد، حاول لاحقاً."); return; } let allQuestions = []; Object.values(geologicalData).forEach(topicQuestions => { allQuestions = allQuestions.concat(topicQuestions); }); const shuffledQuestions = shuffleArray(allQuestions); const dailyQuestions = shuffledQuestions.slice(0, DAILY_CHALLENGE_QUESTIONS); startQuiz(t.daily_challenge, dailyQuestions);
 }

// **=================================================**
// [4] منطق الاختبار المحسّن (Start, Display, Submit, Timeout, Results)
// **=================================================**
// ... (الكود الخاص بـ startQuiz, displayQuestion, submitBtn.onclick, nextBtn.onclick, handleTimeout, showResults يبقى كما هو في النسخة السابقة التي أرسلتها لك، مع التأكد من إضافة حقل explanation للأسئلة في JSON) ...

function startQuiz(quizTitle, questions) { /* ... (نفس الكود السابق) ... */
    clearInterval(timerInterval); clearInterval(cohortCountdownInterval); currentQuestions = questions; currentQuestionIndex = 0; score = 0; userAnswers = {}; hideElement('#topic-selection'); hideElement('#topics-list-container'); hideElement('#results-screen'); showElement('#quiz-screen'); updateTextContent('#quiz-title', `${translations[currentLanguage].quiz_title_prefix} ${quizTitle}`); displayQuestion();
 }
function displayQuestion() { /* ... (نفس الكود السابق) ... */
    clearInterval(timerInterval); const qContainer = document.getElementById('question-container'); const submitBtn = document.getElementById('submit-btn'); const nextBtn = document.getElementById('next-btn'); const questionCounter = document.getElementById('question-counter'); const currentScoreDisplay = document.getElementById('current-score'); const feedbackContainer = document.getElementById('feedback-container'); if (currentQuestionIndex >= currentQuestions.length) { return showResults(); } const currentQ = currentQuestions[currentQuestionIndex]; const t = translations[currentLanguage]; if (!currentQ || !currentQ.options || !currentQ.answer) { console.error("بيانات سؤال غير صالحة:", currentQ, "في المؤشر:", currentQuestionIndex); currentQuestionIndex++; displayQuestion(); return; } startTimer(); if (questionCounter) { questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`; } if (currentScoreDisplay) { currentScoreDisplay.textContent = score; } let htmlContent = `<p class="question-text">${currentQ.question}</p><div class="options-container">`; const options = shuffleArray([...currentQ.options]); options.forEach((option, index) => { const optionId = `q${currentQuestionIndex}-opt${index}`; htmlContent += `<label class="option-label" for="${optionId}"><input type="radio" name="option" id="${optionId}" value="${option}"><span class="option-text">${option}</span></label>`; }); htmlContent += '</div>'; qContainer.innerHTML = htmlContent; showElement('#submit-btn'); hideElement('#next-btn'); if (submitBtn) submitBtn.disabled = true; document.querySelectorAll('input[name="option"]').forEach(input => { input.addEventListener('change', () => { if (submitBtn) submitBtn.disabled = false; }); }); if (feedbackContainer) feedbackContainer.classList.add('hidden');
 }
// submitBtn.onclick = () => { /* ... (نفس الكود السابق) ... */
//     clearInterval(timerInterval); const selectedOptionInput = document.querySelector('input[name="option"]:checked'); if (!selectedOptionInput) return; const userAnswer = selectedOptionInput.value; const currentQ = currentQuestions[currentQuestionIndex]; const correctAnswer = currentQ.answer; const isCorrect = (userAnswer === correctAnswer); score += isCorrect ? POINTS_CORRECT : POINTS_WRONG; userAnswers[currentQ.id || currentQuestionIndex] = { question: currentQ.question, userAnswer: userAnswer, correctAnswer: correctAnswer, isCorrect: isCorrect, explanation: currentQ.explanation || "لا يوجد شرح متوفر لهذا السؤال." }; document.querySelectorAll('.option-label').forEach(label => { const input = label.querySelector('input'); input.disabled = true; if (input.value === correctAnswer) label.classList.add('correct'); else if (input.checked && !isCorrect) label.classList.add('incorrect'); }); const feedbackContainer = document.getElementById('feedback-container'); if (feedbackContainer) { if(!isCorrect) { feedbackContainer.innerHTML = `<strong>${translations[currentLanguage].correct_answer}</strong> ${correctAnswer}<br><strong>${translations[currentLanguage].result_explanation}</strong> ${userAnswers[currentQ.id || currentQuestionIndex].explanation}`; feedbackContainer.className = 'feedback-message incorrect-feedback expanded-feedback'; feedbackContainer.classList.remove('hidden'); } else { feedbackContainer.classList.add('hidden'); } } updateTextContent('#current-score', score); hideElement('#submit-btn'); showElement('#next-btn');
// }; // Ensure this onclick is assigned correctly, preferably inside DOMContentLoaded or initializeUIElements
document.addEventListener('DOMContentLoaded', () => { // Assign inside DOMContentLoaded
     const submitBtn = document.getElementById('submit-btn');
     if (submitBtn) {
          submitBtn.onclick = () => { /* ... (paste the submit logic here) ... */
               clearInterval(timerInterval); const selectedOptionInput = document.querySelector('input[name="option"]:checked'); if (!selectedOptionInput) return; const userAnswer = selectedOptionInput.value; const currentQ = currentQuestions[currentQuestionIndex]; const correctAnswer = currentQ.answer; const isCorrect = (userAnswer === correctAnswer); score += isCorrect ? POINTS_CORRECT : POINTS_WRONG; userAnswers[currentQ.id || currentQuestionIndex] = { question: currentQ.question, userAnswer: userAnswer, correctAnswer: correctAnswer, isCorrect: isCorrect, explanation: currentQ.explanation || "لا يوجد شرح متوفر لهذا السؤال." }; document.querySelectorAll('.option-label').forEach(label => { const input = label.querySelector('input'); input.disabled = true; if (input.value === correctAnswer) label.classList.add('correct'); else if (input.checked && !isCorrect) label.classList.add('incorrect'); }); const feedbackContainer = document.getElementById('feedback-container'); if (feedbackContainer) { if(!isCorrect) { feedbackContainer.innerHTML = `<strong>${translations[currentLanguage].correct_answer}</strong> ${correctAnswer}<br><strong>${translations[currentLanguage].result_explanation}</strong> ${userAnswers[currentQ.id || currentQuestionIndex].explanation}`; feedbackContainer.className = 'feedback-message incorrect-feedback expanded-feedback'; feedbackContainer.classList.remove('hidden'); } else { feedbackContainer.classList.add('hidden'); } } updateTextContent('#current-score', score); hideElement('#submit-btn'); showElement('#next-btn');
          };
     }
      const nextBtn = document.getElementById('next-btn');
      if (nextBtn) {
            nextBtn.onclick = () => { currentQuestionIndex++; displayQuestion(); };
      }
});
function handleTimeout() { /* ... (نفس الكود السابق) ... */
    clearInterval(timerInterval); const currentQ = currentQuestions[currentQuestionIndex]; const t = translations[currentLanguage]; score += POINTS_WRONG; userAnswers[currentQ.id || currentQuestionIndex] = { question: currentQ.question, userAnswer: t.timeout_answer, correctAnswer: currentQ.answer, isCorrect: false, explanation: currentQ.explanation || "لا يوجد شرح متوفر لهذا السؤال." }; document.querySelectorAll('.option-label').forEach(label => { label.querySelector('input').disabled = true; label.classList.add('incorrect'); if (label.querySelector('input').value === currentQ.answer) { label.classList.remove('incorrect'); label.classList.add('correct'); } }); const feedbackContainer = document.getElementById('feedback-container'); if (feedbackContainer) { feedbackContainer.innerHTML = `<strong>${t.timeout_answer}</strong><br><strong>${translations[currentLanguage].correct_answer}</strong> ${currentQ.answer}<br><strong>${translations[currentLanguage].result_explanation}</strong> ${userAnswers[currentQ.id || currentQuestionIndex].explanation}`; feedbackContainer.className = 'feedback-message incorrect-feedback expanded-feedback'; feedbackContainer.classList.remove('hidden'); } updateTextContent('#current-score', score); hideElement('#submit-btn'); showElement('#next-btn');
 }
function showResults() { /* ... (نفس الكود السابق مع الشرح) ... */
    clearInterval(timerInterval); hideElement('#quiz-screen'); showElement('#results-screen'); startCohortCountdown(); let correctCount = 0; Object.values(userAnswers).forEach(answer => { if (answer.isCorrect) correctCount++; }); const totalQuestions = currentQuestions.length; const wrongCount = totalQuestions - correctCount; const divisor = totalQuestions || 1; const percentage = Math.round((correctCount / divisor) * 100); const t = translations[currentLanguage]; updateTextContent('#final-score', score); updateTextContent('#total-questions-count', totalQuestions); updateTextContent('#correct-count', correctCount); updateTextContent('#wrong-count', wrongCount); const gradeMessage = document.getElementById('grade-message'); if (gradeMessage) { if (percentage >= 90) { gradeMessage.innerHTML = t.great_job; gradeMessage.style.color = 'var(--correct-color)'; } else if (percentage >= 70) { gradeMessage.innerHTML = t.good_job; gradeMessage.style.color = 'var(--neon-blue)'; } else { gradeMessage.innerHTML = t.needs_review; gradeMessage.style.color = 'var(--incorrect-color)'; } } const progressRingFill = document.querySelector('.progress-ring-fill'); if (progressRingFill) { const radius = progressRingFill.r.baseVal.value; const circumference = 2 * Math.PI * radius; const offset = circumference - (percentage / 100) * circumference; progressRingFill.style.strokeDashoffset = offset; } const reviewArea = document.getElementById('review-area'); if (reviewArea) { reviewArea.innerHTML = `<h3><i class="fas fa-bug"></i> ${t.review_errors}</h3>`; let errorsFound = false; Object.values(userAnswers).forEach(answer => { if (!answer.isCorrect) { errorsFound = true; reviewArea.innerHTML += `<div class="review-item"><p class="error-q">${answer.question}</p><p class="error-a">${t.your_answer} <span class="wrong">${answer.userAnswer}</span></p><p class="error-a">${t.correct_answer} <span class="right">${answer.correctAnswer}</span></p><p class="explanation"><strong>${t.result_explanation}</strong> ${answer.explanation}</p></div>`; } }); if (!errorsFound) { reviewArea.innerHTML += `<p class="all-correct">${t.all_correct_message}</p>`; } } if(percentage >= 80 && totalQuestions >= DAILY_CHALLENGE_QUESTIONS) { unlockBadge("Expert Diagnostician"); } else if (correctCount === totalQuestions && totalQuestions > 0) { unlockBadge("Flawless Mission"); }
 }
function unlockBadge(badgeName) { /* ... (نفس الكود السابق) ... */ showNotification(`${translations[currentLanguage].badge_unlocked} ${badgeName}`); }
function generateSharableSummary() { /* ... (نفس الكود السابق) ... */ let correctCount = 0; Object.values(userAnswers).forEach(ans => { if(ans.isCorrect) correctCount++; }); const total = currentQuestions.length; const percentage = Math.round((correctCount / total) * 100); const summary = `أكملت مهمة ${document.getElementById('quiz-title')?.textContent || 'GEO-MASTER'} بنتيجة ${score} (${percentage}%)! هل يمكنك التفوق؟ #GeoMasterChallenge`; console.log("Share Summary:", summary); return summary; }

// **=================================================**
// [5] وظائف مساعدة إضافية (عداد الدفعة، Modal, ...)
// **=================================================**

function startCohortCountdown() { /* ... (نفس الكود السابق) ... */
    const countdownElement = document.getElementById('cohort-timer'); if (!countdownElement) return; let endTime = new Date().getTime() + 3 * 24 * 60 * 60 * 1000; clearInterval(cohortCountdownInterval); cohortCountdownInterval = setInterval(() => { let now = new Date().getTime(); let distance = endTime - now; let days = Math.floor(distance / (1000 * 60 * 60 * 24)); let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)); let seconds = Math.floor((distance % (1000 * 60)) / 1000); countdownElement.innerHTML = `${translations[currentLanguage].cohort_countdown_title} ${days}ي ${hours}س ${minutes}د ${seconds}ث`; if (distance < 0) { clearInterval(cohortCountdownInterval); countdownElement.innerHTML = "دفعة النخبة مفتوحة الآن!"; } }, 1000);
 }

// --- Modal Function (Simple Example) ---
// **TODO: Create actual modal elements in HTML/CSS (e.g., #modal-overlay, #modal-box, #modal-title, #modal-body, #modal-buttons)**
function showModal(title, buttons = [], bodyHTML = '') {
    const modalOverlay = document.getElementById('modal-overlay'); // Assume you create these IDs
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalButtons = document.getElementById('modal-buttons');

    if (!modalOverlay || !modalTitle || !modalBody || !modalButtons) {
        console.warn("Modal elements not found. Using basic confirm/alert.");
        // Fallback to basic confirm/alert if modal doesn't exist
        if (buttons.length === 2 && bodyHTML === '') { // Simple confirm case
             const confirmed = confirm(title);
             if (confirmed && buttons[0].action) buttons[0].action();
             else if (!confirmed && buttons[1].action) buttons[1].action();
        } else { // Simple alert case
             alert(title + (bodyHTML ? `\n${bodyHTML.replace(/<p>|<\/p>/g, '')}` : '')); // Basic alert, remove tags
             if (buttons[0] && buttons[0].action) buttons[0].action(); // Assume first button is "OK"
        }
        return;
    }

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML; // Use innerHTML for optional paragraph tags etc.
    modalButtons.innerHTML = ''; // Clear previous buttons

    buttons.forEach(btnInfo => {
        const button = document.createElement('button');
        button.textContent = btnInfo.text;
        button.classList.add('control-btn'); // Add base button class
        button.classList.add(btnInfo.class || 'tertiary'); // Default to tertiary style
        button.onclick = () => {
            if (btnInfo.action) btnInfo.action();
            closeModal(); // Close modal after action
        };
        modalButtons.appendChild(button);
    });

    modalOverlay.classList.remove('hidden'); // Show the modal
}

function closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) modalOverlay.classList.add('hidden');
}


// **=================================================**
// [6] وظائف الواجهة (Timers, Translate, Theme, Sidebar, Helpers)
// **=================================================**
// ... (startTimer, translateUI, changeLanguage, Theme Toggle, showNotification, showElement, hideElement, closeSidebar - all remain the same as previous version) ...

function startTimer() { /* ... (نفس الكود السابق) ... */
     clearInterval(timerInterval); let timeRemaining = TIME_LIMIT; const timerValueElement = document.querySelector('#timer-display .timer-value'); const timerUnitElement = document.querySelector('#timer-display .timer-unit'); const progressBar = document.getElementById('progress-bar-fill'); const t = translations[currentLanguage]; if (timerValueElement) { timerValueElement.parentElement.style.color = 'var(--neon-blue)'; timerValueElement.textContent = timeRemaining; } if (timerUnitElement) timerUnitElement.textContent = t.timer_text; if (progressBar) progressBar.style.width = '100%'; timerInterval = setInterval(() => { timeRemaining--; if (timerValueElement) timerValueElement.textContent = timeRemaining; const progressPercentage = (timeRemaining / TIME_LIMIT) * 100; if (progressBar) progressBar.style.width = `${progressPercentage}%`; if (timeRemaining <= 5) { if (timerValueElement) timerValueElement.parentElement.style.color = 'var(--incorrect-color)'; } else { if (timerValueElement) timerValueElement.parentElement.style.color = 'var(--neon-blue)'; } if (timeRemaining <= 0) { clearInterval(timerInterval); handleTimeout(); } }, 1000);
 }
function translateUI(langCode) { /* ... (نفس الكود السابق، تأكد من تحديث النصوص الجديدة مثل browse_custom_quizzes و back_button) ... */
    currentLanguage = langCode; const t = translations[langCode] || translations['ar']; document.documentElement.lang = langCode; document.documentElement.dir = (langCode === 'ar') ? 'rtl' : 'ltr'; const updateTextContent = (selector, key) => { const element = document.querySelector(selector); if (element) element.textContent = t[key] || `[[${key}]]`; }; const updateHTMLContent = (selector, key, defaultHTML = '') => { const element = document.querySelector(selector); if (element) element.innerHTML = t[key] || defaultHTML; }; const updateTitle = (selector, key) => { const element = document.querySelector(selector); if (element) element.title = t[key] || ''; }; const updateButtonText = (selector, key) => { const element = document.querySelector(selector + ' .btn-text'); if (element) element.textContent = t[key] || `[[${key}]]`; }; updateTextContent('.hero-content h2', 'hero_title'); updateTextContent('.hero-description', 'hero_subtitle'); updateButtonText('#start-challenge-btn', 'cta_main'); updateButtonText('#view-brief-btn', 'cta_secondary'); updateTextContent('#cohort-timer', 'cohort_countdown_title'); updateButtonText('#daily-challenge-btn', 'daily_challenge_button'); updateButtonText('#show-topics-btn', 'browse_custom_quizzes'); updateButtonText('#back-to-hero-btn', 'back_button'); updateTextContent('#topics-list-container h3', 'choose_domain'); updateTitle('.active-users-indicator', 'active_users_title'); if (!document.getElementById('quiz-screen')?.classList.contains('hidden')) { updateButtonText('#submit-btn', 'submit'); updateButtonText('#next-btn', 'next'); const timerUnit = document.querySelector('#timer-display .timer-unit'); if(timerUnit) timerUnit.textContent = t.timer_text; const qCounter = document.getElementById('question-counter'); if(qCounter) qCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`; } if (!document.getElementById('results-screen')?.classList.contains('hidden')) { updateButtonText('#results-screen button[onclick*="reload"]', 'new_quiz'); updateButtonText('#share-results-btn', 'share_results_cta'); const reviewTitle = document.querySelector('#review-area h3'); if(reviewTitle) reviewTitle.innerHTML = `<i class="fas fa-bug"></i> ${t.review_errors}`; const gradeMessage = document.getElementById('grade-message'); if (gradeMessage && Object.keys(userAnswers).length > 0) { const correctCount = parseInt(document.getElementById('correct-count')?.textContent || '0'); const totalQuestions = parseInt(document.getElementById('total-questions-count')?.textContent || '1'); const divisor = totalQuestions || 1; const percentage = Math.round((correctCount / divisor) * 100); if (percentage >= 90) gradeMessage.innerHTML = t.great_job; else if (percentage >= 70) gradeMessage.innerHTML = t.good_job; else gradeMessage.innerHTML = t.needs_review; } document.querySelectorAll('.review-item').forEach(item => { const q = item.querySelector('.error-q')?.textContent || ''; const uaSpan = item.querySelector('.wrong'); const caSpan = item.querySelector('.right'); const explanationP = item.querySelector('.explanation'); const ua = uaSpan?.textContent || ''; const ca = caSpan?.textContent || ''; let explanation = ''; Object.values(userAnswers).find(ans => { if(ans.question === q && ans.userAnswer === ua && ans.correctAnswer === ca) { explanation = ans.explanation; return true; } return false; }); const yourAnswerP = item.querySelector('p:nth-of-type(2)'); const correctAnswerP = item.querySelector('p:nth-of-type(3)'); if(yourAnswerP) yourAnswerP.innerHTML = `${t.your_answer} <span class="wrong">${ua}</span>`; if(correctAnswerP) correctAnswerP.innerHTML = `${t.correct_answer} <span class="right">${ca}</span>`; if(explanationP) explanationP.innerHTML = `<strong>${t.result_explanation}</strong> ${explanation}`; }); const allCorrect = document.querySelector('.all-correct'); if(allCorrect) allCorrect.textContent = t.all_correct_message; } const langSelect = document.getElementById('lang-select'); if (langSelect) langSelect.value = langCode;
 }
function changeLanguage(langCode) { translateUI(langCode); }
// Theme Toggle: const themeToggleBtn = document.getElementById('theme-toggle'); if (themeToggleBtn) { ... (same code) ... }
if (themeToggleBtn) { themeToggleBtn.addEventListener('click', () => { const body = document.body; let currentTheme = body.getAttribute('data-theme'); const newTheme = (currentTheme === 'dark') ? 'light' : 'dark'; body.setAttribute('data-theme', newTheme); localStorage.setItem('theme', newTheme); themeToggleBtn.innerHTML = (newTheme === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; }); const savedTheme = localStorage.getItem('theme') || 'dark'; document.body.setAttribute('data-theme', savedTheme); themeToggleBtn.innerHTML = (savedTheme === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; }
function showNotification(message, duration = 3000) { /* ... (same code) ... */ const toast = document.getElementById('notification-toast'); const messageElement = document.getElementById('notification-message'); if (!toast || !messageElement) return; messageElement.textContent = message; toast.classList.remove('hidden'); toast.classList.add('show'); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => { toast.classList.add('hidden'); }, 500); }, duration); }
function showElement(selector) { const element = document.querySelector(selector); if (element) element.classList.remove('hidden'); }
function hideElement(selector) { const element = document.querySelector(selector); if (element) element.classList.add('hidden'); }
function closeSidebar() { const sidebar = document.getElementById('sidebar'); const overlay = document.getElementById('overlay'); if(sidebar) sidebar.classList.remove('open'); if(overlay) overlay.style.display = 'none'; }


// **=================================================**
// [7] تشغيل الكود عند تحميل الصفحة
// **=================================================**

document.addEventListener('DOMContentLoaded', () => {
    // --- التحكم في القائمة الجانبية ---
    // ... (نفس الكود السابق لفتح/إغلاق القائمة) ...
     const sidebar = document.getElementById('sidebar'); const overlay = document.getElementById('overlay'); const openSidebarBtn = document.getElementById('open-sidebar-btn'); const closeSidebarBtn = document.getElementById('close-sidebar-btn'); if (openSidebarBtn) openSidebarBtn.onclick = () => { if(sidebar) sidebar.classList.add('open'); if(overlay) overlay.style.display = 'block'; }; if (closeSidebarBtn) closeSidebarBtn.onclick = closeSidebar; if (overlay) overlay.onclick = closeSidebar;

     // --- Active users count update ---
     // ... (نفس الكود السابق لتحديث العدد كل 30 ثانية) ...
      const activeUsersCountElement = document.getElementById('active-users-count'); function updateActiveUsers() { const randomCount = Math.floor(Math.random() * (35 - 7 + 1)) + 7; if (activeUsersCountElement) activeUsersCountElement.textContent = randomCount; } setInterval(updateActiveUsers, 30000); updateActiveUsers();

     // --- Assign submit/next button listeners here ---
     const submitBtn = document.getElementById('submit-btn');
     if (submitBtn) {
          submitBtn.onclick = () => { /* ... (paste the submit logic here again for safety) ... */
               clearInterval(timerInterval); const selectedOptionInput = document.querySelector('input[name="option"]:checked'); if (!selectedOptionInput) return; const userAnswer = selectedOptionInput.value; const currentQ = currentQuestions[currentQuestionIndex]; const correctAnswer = currentQ.answer; const isCorrect = (userAnswer === correctAnswer); score += isCorrect ? POINTS_CORRECT : POINTS_WRONG; userAnswers[currentQ.id || currentQuestionIndex] = { question: currentQ.question, userAnswer: userAnswer, correctAnswer: correctAnswer, isCorrect: isCorrect, explanation: currentQ.explanation || "لا يوجد شرح متوفر لهذا السؤال." }; document.querySelectorAll('.option-label').forEach(label => { const input = label.querySelector('input'); input.disabled = true; if (input.value === correctAnswer) label.classList.add('correct'); else if (input.checked && !isCorrect) label.classList.add('incorrect'); }); const feedbackContainer = document.getElementById('feedback-container'); if (feedbackContainer) { if(!isCorrect) { feedbackContainer.innerHTML = `<strong>${translations[currentLanguage].correct_answer}</strong> ${correctAnswer}<br><strong>${translations[currentLanguage].result_explanation}</strong> ${userAnswers[currentQ.id || currentQuestionIndex].explanation}`; feedbackContainer.className = 'feedback-message incorrect-feedback expanded-feedback'; feedbackContainer.classList.remove('hidden'); } else { feedbackContainer.classList.add('hidden'); } } updateTextContent('#current-score', score); hideElement('#submit-btn'); showElement('#next-btn');
          };
     }
      const nextBtn = document.getElementById('next-btn');
      if (nextBtn) {
            nextBtn.onclick = () => { currentQuestionIndex++; displayQuestion(); };
      }

    // --- تحميل بيانات الاختبار ---
    loadGeologyData(); // Load data after DOM is ready
});

// Load initial language
translateUI(currentLanguage);

