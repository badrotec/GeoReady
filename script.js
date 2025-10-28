// **=================================================**
// [1] المتغيرات العالمية والتحكم (مُدمجة)
// **=================================================**
let geologicalData = {};
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval;
const TIME_LIMIT = 20; // الوقت لكل سؤال
const POINTS_CORRECT = 10; // نقاط مُعدلة
const POINTS_WRONG = -5;  // نقاط مُعدلة
const DAILY_CHALLENGE_QUESTIONS = 7; // عدد أسئلة التحدي اليومي
const ONBOARDING_MISSION_QUESTIONS = 3; // عدد أسئلة المهمة الفورية
let currentLanguage = 'ar';
let userCommitted = false; // لتتبع التزام المستخدم
let cohortCountdownInterval; // لعداد الدفعة

// قاموس الترجمة المُوسع
const translations = {
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
        'onboarding_mission_start': 'مهمتك الأولى: تشخيص سريع',
        'browse_custom_quizzes': 'تصفح جميع الاختبارات المخصصة',
        'back_button': 'العودة',
        'daily_challenge': 'التحدي اليومي',
        'daily_challenge_button': `التحدي اليومي (${DAILY_CHALLENGE_QUESTIONS} أسئلة)`,
        'choose_domain': 'اختر مجال الاختبار المخصص:', // تم تعديل النص
        'quiz_title_prefix': 'مهمة:', // تم تعديل النص
        'question': 'السؤال',
        'submit': 'تأكيد التشخيص', // تم تعديل النص
        'next': 'السؤال التالي',
        'review_errors': 'تحليل الأخطاء الميدانية:', // تم تعديل النص
        'your_answer': 'تشخيصك:', // تم تعديل النص
        'correct_answer': 'التشخيص الصحيح:', // تم تعديل النص
        'result_explanation': 'الشرح التفصيلي:', // جديد
        'great_job': '🌟 أداء خبير! يمكنك الاعتماد عليك في الميدان.', // تم تعديل النص
        'good_job': '✨ أداء جيد! لديك أساس قوي، استمر في الصقل.', // تم تعديل النص
        'needs_review': '⚠️ تحتاج لمراجعة ميدانية مكثفة. لا تستسلم!', // تم تعديل النص
        'new_quiz': 'ابدأ مهمة جديدة', // تم تعديل النص
        'timer_text': 'ث',
        'loading_data': '... تحميل بيانات المهمة', // تم تعديل النص
        'loading_error': '[خطأ تحميل] تعذر استلام بيانات المهمة. تحقق من الاتصال.', // تم تعديل النص
        'timeout_answer': '(نفذ الوقت)', // تم تعديل النص
        'all_correct_message': '🎉 ممتاز! أكملت المهمة بدون أخطاء.', // تم تعديل النص
        'share_results_cta': 'شارك نتيجتك وتحداهم!', // جديد
        'badge_unlocked': 'شارة جديدة مفتوحة!', // جديد
        'proof_popup_title': 'هل تريد حفظ نتيجتك؟', // جديد
        'proof_popup_text': 'شاركها الآن واحصل على شارة مميزة!', // جديد
        // --- نصوص قديمة قد لا تزال مستخدمة في CSS أو كاحتياط ---
        'start_quiz': 'ابدأ الاختبار', // النص القديم لزر البداية الأصلي
    },
    'en': { /* ... English translations ... */ },
    'fr': { /* ... French translations ... */ }
};


// **=================================================**
// [2] تحميل البيانات وتهيئة الواجهة (مُدمج ومُحسّن)
// **=================================================**

async function loadGeologyData() {
    console.log("التحميل: بدء تحميل البيانات...");
    setLoadingState(true);
    try {
        const response = await fetch('./Question.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        geologicalData = await response.json();
        console.log("التحميل: البيانات تم تحميلها بنجاح.");
        if (Object.keys(geologicalData).length === 0) {
            throw new Error("JSON data is empty or invalid.");
        }
        initializeUIElements(geologicalData); // تهيئة النصوص والقوائم
        setupEventListeners(); // **ربط الأزرار بعد التهيئة**
        startCohortCountdown(); // بدء عداد الدفعة
        setLoadingState(false); // تمكين الأزرار
        console.log("التحميل: تهيئة الواجهة اكتملت.");
    } catch (error) {
        console.error("فشل تحميل أو تهيئة بيانات المهمة:", error);
        setLoadingState(false, true); // إظهار حالة الخطأ والإبقاء على الأزرار معطلة
        // عرض رسالة خطأ للمستخدم في مكان واضح إن أمكن
        const heroDesc = document.querySelector('.hero-description');
        if(heroDesc) heroDesc.textContent = translations[currentLanguage].loading_error;
    }
}

// دالة التحكم بحالة التحميل
function setLoadingState(isLoading, isError = false) {
    const mainCTA = document.getElementById('start-challenge-btn');
    const secondaryCTA = document.getElementById('view-brief-btn');
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
    const showTopicsBtn = document.getElementById('show-topics-btn');
    // أضف أي أزرار أخرى يجب تعطيلها أثناء التحميل
    const buttons = [mainCTA, secondaryCTA, dailyChallengeBtn, showTopicsBtn];

    buttons.forEach(btn => { if (btn) btn.disabled = isLoading || isError; });

    // لا نظهر رسالة التحميل من قائمة المواضيع مبدئياً
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) loadingMessage.classList.add('hidden');

    if (isError) {
        // استخدام إشعار toast للخطأ أفضل من تغيير نص الهيرو
        showNotification(translations[currentLanguage].loading_error, 5000);
    }
}

// تهيئة عناصر الواجهة (نصوص وقوائم)
function initializeUIElements(data) {
    console.log("التهيئة: تحديث النصوص وإنشاء قوائم المواضيع...");
    const t = translations[currentLanguage];
    // --- تحديث نصوص الهيرو والعناصر الثابتة ---
    updateTextContent('.hero-content h2', 'hero_title');
    updateTextContent('.hero-description', 'hero_subtitle');
    // الأزرار سيتم تحديثها في translateUI لاحقاً لضمان وجودها

    // --- تهيئة قائمة المواضيع ---
    const topicsList = document.getElementById('topics-list');
    const sidebarList = document.getElementById('sidebar-topics-list');
    if (!topicsList || !sidebarList) {
        console.error("التهيئة الخطيرة: لم يتم العثور على عنصر قائمة المواضيع (topics-list أو sidebar-topics-list). لا يمكن إنشاء القوائم.");
        return; // توقف إذا كانت العناصر الأساسية مفقودة
    }

    topicsList.innerHTML = '';
    sidebarList.innerHTML = '';
    console.log("التهيئة: مسح القوائم القديمة.");

    if (Object.keys(data).length === 0) {
        console.warn("التهيئة: لا توجد مواضيع في البيانات!");
        topicsList.innerHTML = `<p>${t.loading_error || 'لا توجد اختبارات متاحة حالياً.'}</p>`; // Show error/empty message
    } else {
        Object.keys(data).forEach(topicKey => {
            const topicDisplayName = topicKey.replace(/_/g, ' ');
            const questions = data[topicKey];

            if (!Array.isArray(questions)) {
                console.warn(`التهيئة: البيانات للموضوع '${topicDisplayName}' ليست مصفوفة صالحة.`);
                return;
            }
            console.log(`التهيئة: إضافة الموضوع '${topicDisplayName}'`);

            // البطاقة والقائمة الجانبية (نفس الكود السابق لإنشاء العناصر وربط startQuiz)
            const gridCard = document.createElement('div');
            gridCard.className = 'topic-card';
            gridCard.textContent = topicDisplayName;
            gridCard.onclick = () => { startQuiz(topicDisplayName, questions); };
            topicsList.appendChild(gridCard);

            const sidebarLink = document.createElement('a');
            sidebarLink.href = "#";
            sidebarLink.textContent = topicDisplayName;
            sidebarLink.onclick = (e) => { e.preventDefault(); startQuiz(topicDisplayName, questions); closeSidebar(); };
            const listItem = document.createElement('li');
            listItem.appendChild(sidebarLink);
            sidebarList.appendChild(listItem);
        });
        console.log("التهيئة: تم ملء قوائم المواضيع.");
    }

    translateUI(currentLanguage); // تحديث كل النصوص بعد إنشاء القوائم
}

// **=================================================**
// [3] ربط الأحداث (Event Listeners) - **يُستدعى بعد تحميل البيانات**
// **=================================================**

function setupEventListeners() {
    console.log("الربط: بدء ربط مستمعي الأحداث...");

    // --- أزرار الهيرو وقائمة المواضيع ---
    const mainCTA = document.getElementById('start-challenge-btn');
    const secondaryCTA = document.getElementById('view-brief-btn');
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn');
    const showTopicsBtn = document.getElementById('show-topics-btn');
    const backToHeroBtn = document.getElementById('back-to-hero-btn');

    if (mainCTA) mainCTA.onclick = handleMainCTA; else console.error("خطأ الربط: لم يتم العثور على #start-challenge-btn");
    if (secondaryCTA) secondaryCTA.onclick = showMissionBrief; else console.warn("تحذير الربط: لم يتم العثور على #view-brief-btn");
    if (dailyChallengeBtn) dailyChallengeBtn.onclick = startDailyChallenge; else console.error("خطأ الربط: لم يتم العثور على #daily-challenge-btn");
    if (showTopicsBtn) showTopicsBtn.onclick = showTopicsListScreen; else console.error("خطأ الربط: لم يتم العثور على #show-topics-btn");
    if (backToHeroBtn) backToHeroBtn.onclick = showHeroScreen; else console.error("خطأ الربط: لم يتم العثور على #back-to-hero-btn");


    // --- أزرار الاختبار ---
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    if (submitBtn) submitBtn.onclick = handleSubmitAnswer; else console.error("خطأ الربط: لم يتم العثور على #submit-btn");
    if (nextBtn) nextBtn.onclick = handleNextQuestion; else console.error("خطأ الربط: لم يتم العثور على #next-btn");


    // --- الشريط الجانبي ---
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const overlay = document.getElementById('overlay');
    if (openSidebarBtn) openSidebarBtn.onclick = openSidebar;
    if (closeSidebarBtn) closeSidebarBtn.onclick = closeSidebar;
    if (overlay) overlay.onclick = closeSidebar;

    // --- اللغة والسمة ---
    const langSelect = document.getElementById('lang-select');
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (langSelect) langSelect.onchange = (e) => changeLanguage(e.target.value);
    if (themeToggleBtn) themeToggleBtn.onclick = toggleTheme;

    // --- أزرار النتائج ---
     const restartBtn = document.querySelector('#results-screen button[onclick*="reload"]'); // Found via onclick
     const shareBtn = document.getElementById('share-results-btn');
     if(shareBtn) shareBtn.onclick = generateSharableSummary; else console.warn("تحذير الربط: لم يتم العثور على #share-results-btn");

    console.log("الربط: انتهاء ربط مستمعي الأحداث.");
}


// **=================================================**
// [4] منطق Onboarding والتحديات
// **=================================================**
function handleMainCTA() { askForCommitment(); }
function askForCommitment() { /* ... (نفس الكود مع showModal) ... */ const t = translations[currentLanguage]; showModal(t.onboarding_commit_question, [ { text: t.onboarding_commit_yes, class: 'primary', action: () => { userCommitted = true; console.log("User committed!"); startOnboardingMission(); }}, { text: t.onboarding_commit_no, class: 'tertiary', action: () => { userCommitted = false; console.log("User did not commit. Showing custom options."); showTopicsListScreen(); }} ]); }
function showTopicsListScreen() { console.log("الواجهة: إظهار شاشة قائمة المواضيع."); hideElement('#topic-selection'); showElement('#topics-list-container'); }
function showHeroScreen() { // دالة جديدة للعودة للهيرو
    console.log("الواجهة: العودة إلى شاشة الهيرو.");
    hideElement('#topics-list-container');
    showElement('#topic-selection');
}
function startOnboardingMission() { /* ... (نفس الكود السابق) ... */ const t = translations[currentLanguage]; let allQuestions = []; Object.values(geologicalData).forEach(topicQuestions => { allQuestions = allQuestions.concat(topicQuestions); }); const shuffledQuestions = shuffleArray(allQuestions); const missionQuestions = shuffledQuestions.slice(0, ONBOARDING_MISSION_QUESTIONS); startQuiz(t.onboarding_mission_start, missionQuestions); }
function showMissionBrief() { showModal("موجز المهمة", [{text:"حسناً", action: ()=>{}}], "<p>سيتم عرض سلسلة من الحالات الميدانية...</p>"); }
function shuffleArray(array) { /* ... (نفس الكود السابق) ... */ for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; }
function startDailyChallenge() { /* ... (نفس الكود السابق) ... */ console.log("الحدث: بدء التحدي اليومي..."); const t = translations[currentLanguage]; if (!geologicalData || Object.keys(geologicalData).length === 0) { console.error("Geological data not loaded yet."); showNotification("بيانات التحدي غير جاهزة بعد، حاول لاحقاً."); return; } let allQuestions = []; Object.values(geologicalData).forEach(topicQuestions => { allQuestions = allQuestions.concat(topicQuestions); }); const shuffledQuestions = shuffleArray(allQuestions); const dailyQuestions = shuffledQuestions.slice(0, DAILY_CHALLENGE_QUESTIONS); startQuiz(t.daily_challenge, dailyQuestions); }


// **=================================================**
// [5] منطق الاختبار الأساسي
// **=================================================**
// ... (startQuiz, displayQuestion, handleSubmitAnswer, handleNextQuestion, handleTimeout, showResults, unlockBadge, generateSharableSummary - same as previous correct versions) ...
function startQuiz(quizTitle, questions) { if (!questions || questions.length === 0) { console.error(`محاولة بدء اختبار '${quizTitle}' بدون أسئلة.`); showNotification("خطأ: لا توجد أسئلة لهذا الموضوع."); return; } console.log(`الاختبار: بدء اختبار '${quizTitle}' بـ ${questions.length} سؤال.`); clearInterval(timerInterval); clearInterval(cohortCountdownInterval); currentQuestions = questions; currentQuestionIndex = 0; score = 0; userAnswers = {}; hideElement('#topic-selection'); hideElement('#topics-list-container'); hideElement('#results-screen'); showElement('#quiz-screen'); updateTextContent('#quiz-title', `${translations[currentLanguage].quiz_title_prefix} ${quizTitle}`); displayQuestion(); }
function displayQuestion() { console.log(`الاختبار: عرض السؤال ${currentQuestionIndex + 1}/${currentQuestions.length}`); clearInterval(timerInterval); const qContainer = document.getElementById('question-container'); const submitBtn = document.getElementById('submit-btn'); const nextBtn = document.getElementById('next-btn'); const questionCounter = document.getElementById('question-counter'); const currentScoreDisplay = document.getElementById('current-score'); const feedbackContainer = document.getElementById('feedback-container'); if (currentQuestionIndex >= currentQuestions.length) { return showResults(); } const currentQ = currentQuestions[currentQuestionIndex]; const t = translations[currentLanguage]; if (!currentQ || !currentQ.options || !currentQ.answer) { console.error("بيانات سؤال غير صالحة:", currentQ, "في المؤشر:", currentQuestionIndex); currentQuestionIndex++; setTimeout(displayQuestion, 10); return; } startTimer(); if (questionCounter) { questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`; } if (currentScoreDisplay) { currentScoreDisplay.textContent = score; } let htmlContent = `<p class="question-text">${currentQ.question}</p><div class="options-container">`; const options = shuffleArray([...currentQ.options]); options.forEach((option, index) => { const optionId = `q${currentQuestionIndex}-opt${index}`; htmlContent += `<label class="option-label" for="${optionId}"><input type="radio" name="option" id="${optionId}" value="${option}"><span class="option-text">${option}</span></label>`; }); htmlContent += '</div>'; qContainer.innerHTML = htmlContent; showElement('#submit-btn'); hideElement('#next-btn'); if (submitBtn) submitBtn.disabled = true; document.querySelectorAll('input[name="option"]').forEach(input => { input.addEventListener('change', () => { if (submitBtn) submitBtn.disabled = false; }); }); if (feedbackContainer) feedbackContainer.classList.add('hidden'); }
function handleSubmitAnswer() { console.log("الحدث: تأكيد الإجابة"); clearInterval(timerInterval); const selectedOptionInput = document.querySelector('input[name="option"]:checked'); if (!selectedOptionInput) { console.warn("Submit clicked with no option selected."); return; } const userAnswer = selectedOptionInput.value; const currentQ = currentQuestions[currentQuestionIndex]; const correctAnswer = currentQ.answer; const isCorrect = (userAnswer === correctAnswer); score += isCorrect ? POINTS_CORRECT : POINTS_WRONG; userAnswers[currentQ.id || currentQuestionIndex] = { question: currentQ.question, userAnswer: userAnswer, correctAnswer: correctAnswer, isCorrect: isCorrect, explanation: currentQ.explanation || "لا يوجد شرح متوفر لهذا السؤال." }; document.querySelectorAll('.option-label').forEach(label => { const input = label.querySelector('input'); input.disabled = true; if (input.value === correctAnswer) label.classList.add('correct'); else if (input.checked && !isCorrect) label.classList.add('incorrect'); }); const feedbackContainer = document.getElementById('feedback-container'); if (feedbackContainer) { if(!isCorrect) { feedbackContainer.innerHTML = `<strong>${translations[currentLanguage].correct_answer}</strong> ${correctAnswer}<br><strong>${translations[currentLanguage].result_explanation}</strong> ${userAnswers[currentQ.id || currentQuestionIndex].explanation}`; feedbackContainer.className = 'feedback-message incorrect-feedback expanded-feedback'; feedbackContainer.classList.remove('hidden'); } else { feedbackContainer.classList.add('hidden'); } } updateTextContent('#current-score', score); hideElement('#submit-btn'); showElement('#next-btn'); }
function handleNextQuestion() { console.log("الحدث: السؤال التالي"); currentQuestionIndex++; displayQuestion(); }
function handleTimeout() { console.log(`الاختبار: انتهى الوقت للسؤال ${currentQuestionIndex + 1}`); clearInterval(timerInterval); const currentQ = currentQuestions[currentQuestionIndex]; const t = translations[currentLanguage]; score += POINTS_WRONG; userAnswers[currentQ.id || currentQuestionIndex] = { question: currentQ.question, userAnswer: t.timeout_answer, correctAnswer: currentQ.answer, isCorrect: false, explanation: currentQ.explanation || "لا يوجد شرح متوفر لهذا السؤال." }; document.querySelectorAll('.option-label').forEach(label => { label.querySelector('input').disabled = true; label.classList.add('incorrect'); if (label.querySelector('input').value === currentQ.answer) { label.classList.remove('incorrect'); label.classList.add('correct'); } }); const feedbackContainer = document.getElementById('feedback-container'); if (feedbackContainer) { feedbackContainer.innerHTML = `<strong>${t.timeout_answer}</strong><br><strong>${translations[currentLanguage].correct_answer}</strong> ${currentQ.answer}<br><strong>${translations[currentLanguage].result_explanation}</strong> ${userAnswers[currentQ.id || currentQuestionIndex].explanation}`; feedbackContainer.className = 'feedback-message incorrect-feedback expanded-feedback'; feedbackContainer.classList.remove('hidden'); } updateTextContent('#current-score', score); hideElement('#submit-btn'); showElement('#next-btn'); }
function showResults() { console.log("الاختبار: عرض شاشة النتائج."); clearInterval(timerInterval); hideElement('#quiz-screen'); showElement('#results-screen'); startCohortCountdown(); let correctCount = 0; Object.values(userAnswers).forEach(answer => { if (answer.isCorrect) correctCount++; }); const totalQuestions = currentQuestions.length; const wrongCount = totalQuestions - correctCount; const divisor = totalQuestions || 1; const percentage = Math.round((correctCount / divisor) * 100); const t = translations[currentLanguage]; updateTextContent('#final-score', score); updateTextContent('#total-questions-count', totalQuestions); updateTextContent('#correct-count', correctCount); updateTextContent('#wrong-count', wrongCount); const gradeMessage = document.getElementById('grade-message'); if (gradeMessage) { if (percentage >= 90) { gradeMessage.innerHTML = t.great_job; gradeMessage.style.color = 'var(--correct-color)'; } else if (percentage >= 70) { gradeMessage.innerHTML = t.good_job; gradeMessage.style.color = 'var(--neon-blue)'; } else { gradeMessage.innerHTML = t.needs_review; gradeMessage.style.color = 'var(--incorrect-color)'; } } const progressRingFill = document.querySelector('.progress-ring-fill'); if (progressRingFill) { const radius = progressRingFill.r.baseVal.value; const circumference = 2 * Math.PI * radius; const offset = circumference - (percentage / 100) * circumference; progressRingFill.style.strokeDashoffset = offset; } const reviewArea = document.getElementById('review-area'); if (reviewArea) { reviewArea.innerHTML = `<h3><i class="fas fa-bug"></i> ${t.review_errors}</h3>`; let errorsFound = false; Object.values(userAnswers).forEach(answer => { if (!answer.isCorrect) { errorsFound = true; reviewArea.innerHTML += `<div class="review-item"><p class="error-q">${answer.question}</p><p class="error-a">${t.your_answer} <span class="wrong">${answer.userAnswer}</span></p><p class="error-a">${t.correct_answer} <span class="right">${answer.correctAnswer}</span></p><p class="explanation"><strong>${t.result_explanation}</strong> ${answer.explanation}</p></div>`; } }); if (!errorsFound) { reviewArea.innerHTML += `<p class="all-correct">${t.all_correct_message}</p>`; } } /* Badge logic */ if(percentage >= 80 && totalQuestions >= DAILY_CHALLENGE_QUESTIONS) { unlockBadge("Expert Diagnostician"); } else if (correctCount === totalQuestions && totalQuestions > 0) { unlockBadge("Flawless Mission"); } }
function unlockBadge(badgeName) { console.log(`شارة مفتوحة: ${badgeName}`); showNotification(`${translations[currentLanguage].badge_unlocked} ${badgeName}`); }
function generateSharableSummary() { let correctCount = 0; Object.values(userAnswers).forEach(ans => { if(ans.isCorrect) correctCount++; }); const total = currentQuestions.length; const percentage = Math.round((correctCount / total) * 100); const summary = `أكملت مهمة ${document.getElementById('quiz-title')?.textContent || 'GEO-MASTER'} بنتيجة ${score} (${percentage}%)! هل يمكنك التفوق؟ #GeoMasterChallenge`; console.log("Share Summary:", summary); /* TODO: Implement actual sharing (Web Share API?) */ alert(`شارك هذا النص:\n${summary}`); return summary; }


// **=================================================**
// [6] وظائف مساعدة إضافية
// **=================================================**
// ... (startCohortCountdown, showModal, closeModal - same as before) ...
function startCohortCountdown() { const countdownElement = document.getElementById('cohort-timer'); if (!countdownElement) return; let endTime = new Date().getTime() + 3 * 24 * 60 * 60 * 1000; clearInterval(cohortCountdownInterval); cohortCountdownInterval = setInterval(() => { /* ... (countdown logic) ... */ let now = new Date().getTime(); let distance = endTime - now; let days = Math.floor(distance / (1000 * 60 * 60 * 24)); let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)); let seconds = Math.floor((distance % (1000 * 60)) / 1000); countdownElement.innerHTML = `${translations[currentLanguage].cohort_countdown_title} ${days}ي ${hours}س ${minutes}د ${seconds}ث`; if (distance < 0) { clearInterval(cohortCountdownInterval); countdownElement.innerHTML = "دفعة النخبة مفتوحة الآن!"; } }, 1000); }
function showModal(title, buttons = [], bodyHTML = '') { /* ... (simple modal/confirm/alert fallback) ... */ const modalOverlay = document.getElementById('modal-overlay'); const modalTitle = document.getElementById('modal-title'); const modalBody = document.getElementById('modal-body'); const modalButtons = document.getElementById('modal-buttons'); if (!modalOverlay || !modalTitle || !modalBody || !modalButtons) { console.warn("Modal elements not found. Using basic confirm/alert."); if (buttons.length === 2 && bodyHTML === '') { const confirmed = confirm(title); if (confirmed && buttons[0].action) buttons[0].action(); else if (!confirmed && buttons[1].action) buttons[1].action(); } else { alert(title + (bodyHTML ? `\n${bodyHTML.replace(/<[^>]*>/g, '')}` : '')); if (buttons[0] && buttons[0].action) buttons[0].action(); } return; } modalTitle.textContent = title; modalBody.innerHTML = bodyHTML; modalButtons.innerHTML = ''; buttons.forEach(btnInfo => { const button = document.createElement('button'); button.textContent = btnInfo.text; button.classList.add('control-btn'); button.classList.add(btnInfo.class || 'tertiary'); button.onclick = () => { if (btnInfo.action) btnInfo.action(); closeModal(); }; modalButtons.appendChild(button); }); modalOverlay.classList.remove('hidden'); }
function closeModal() { const modalOverlay = document.getElementById('modal-overlay'); if (modalOverlay) modalOverlay.classList.add('hidden'); }


// **=================================================**
// [7] وظائف الواجهة المساعدة
// **=================================================**
// ... (startTimer, translateUI, changeLanguage, toggleTheme, showNotification, showElement, hideElement, openSidebar, closeSidebar - same as before) ...
function startTimer() { /* ... (نفس الكود السابق) ... */ clearInterval(timerInterval); let timeRemaining = TIME_LIMIT; const timerValueElement = document.querySelector('#timer-display .timer-value'); const timerUnitElement = document.querySelector('#timer-display .timer-unit'); const progressBar = document.getElementById('progress-bar-fill'); const t = translations[currentLanguage]; if (timerValueElement) { timerValueElement.parentElement.style.color = 'var(--neon-blue)'; timerValueElement.textContent = timeRemaining; } if (timerUnitElement) timerUnitElement.textContent = t.timer_text; if (progressBar) progressBar.style.width = '100%'; timerInterval = setInterval(() => { timeRemaining--; if (timerValueElement) timerValueElement.textContent = timeRemaining; const progressPercentage = (timeRemaining / TIME_LIMIT) * 100; if (progressBar) progressBar.style.width = `${progressPercentage}%`; if (timeRemaining <= 5) { if (timerValueElement) timerValueElement.parentElement.style.color = 'var(--incorrect-color)'; } else { if (timerValueElement) timerValueElement.parentElement.style.color = 'var(--neon-blue)'; } if (timeRemaining <= 0) { clearInterval(timerInterval); handleTimeout(); } }, 1000); }
function translateUI(langCode) { /* ... (نفس الكود السابق، مع التأكد من وجود كل المفاتيح) ... */ currentLanguage = langCode; const t = translations[langCode] || translations['ar']; document.documentElement.lang = langCode; document.documentElement.dir = (langCode === 'ar') ? 'rtl' : 'ltr'; const updateTextContent = (selector, key) => { const element = document.querySelector(selector); if (element) element.textContent = t[key] || `[[${key}]]`; }; const updateHTMLContent = (selector, key, defaultHTML = '') => { const element = document.querySelector(selector); if (element) element.innerHTML = t[key] || defaultHTML; }; const updateTitle = (selector, key) => { const element = document.querySelector(selector); if (element) element.title = t[key] || ''; }; const updateButtonText = (selector, key) => { const btnText = document.querySelector(selector + ' .btn-text'); if (btnText) btnText.textContent = t[key] || `[[${key}]]`; }; updateTextContent('.hero-content h2', 'hero_title'); updateTextContent('.hero-description', 'hero_subtitle'); updateButtonText('#start-challenge-btn', 'cta_main'); updateButtonText('#view-brief-btn', 'cta_secondary'); updateTextContent('#cohort-timer', 'cohort_countdown_title'); updateButtonText('#daily-challenge-btn', 'daily_challenge_button'); updateButtonText('#show-topics-btn', 'browse_custom_quizzes'); updateButtonText('#back-to-hero-btn', 'back_button'); updateTextContent('#topics-list-container h3', 'choose_domain'); updateTitle('.active-users-indicator', 'active_users_title'); if (!document.getElementById('quiz-screen')?.classList.contains('hidden')) { updateButtonText('#submit-btn', 'submit'); updateButtonText('#next-btn', 'next'); const timerUnit = document.querySelector('#timer-display .timer-unit'); if(timerUnit) timerUnit.textContent = t.timer_text; const qCounter = document.getElementById('question-counter'); if(qCounter && currentQuestions && currentQuestions.length > 0) qCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`; } if (!document.getElementById('results-screen')?.classList.contains('hidden')) { updateButtonText('#results-screen button[onclick*="reload"]', 'new_quiz'); updateButtonText('#share-results-btn', 'share_results_cta'); const reviewTitle = document.querySelector('#review-area h3'); if(reviewTitle) reviewTitle.innerHTML = `<i class="fas fa-bug"></i> ${t.review_errors}`; const gradeMessage = document.getElementById('grade-message'); if (gradeMessage && Object.keys(userAnswers).length > 0) { const correctCount = parseInt(document.getElementById('correct-count')?.textContent || '0'); const totalQuestions = parseInt(document.getElementById('total-questions-count')?.textContent || '1'); const divisor = totalQuestions || 1; const percentage = Math.round((correctCount / divisor) * 100); if (percentage >= 90) gradeMessage.innerHTML = t.great_job; else if (percentage >= 70) gradeMessage.innerHTML = t.good_job; else gradeMessage.innerHTML = t.needs_review; } document.querySelectorAll('.review-item').forEach(item => { const q = item.querySelector('.error-q')?.textContent || ''; const uaSpan = item.querySelector('.wrong'); const caSpan = item.querySelector('.right'); const explanationP = item.querySelector('.explanation'); const ua = uaSpan?.textContent || ''; const ca = caSpan?.textContent || ''; let explanation = ''; Object.values(userAnswers).find(ans => { if(ans.question === q && ans.userAnswer === ua && ans.correctAnswer === ca) { explanation = ans.explanation; return true; } return false; }); const yourAnswerP = item.querySelector('p:nth-of-type(2)'); const correctAnswerP = item.querySelector('p:nth-of-type(3)'); if(yourAnswerP) yourAnswerP.innerHTML = `${t.your_answer} <span class="wrong">${ua}</span>`; if(correctAnswerP) correctAnswerP.innerHTML = `${t.correct_answer} <span class="right">${ca}</span>`; if(explanationP) explanationP.innerHTML = `<strong>${t.result_explanation}</strong> ${explanation}`; }); const allCorrect = document.querySelector('.all-correct'); if(allCorrect) allCorrect.textContent = t.all_correct_message; } const langSelect = document.getElementById('lang-select'); if (langSelect) langSelect.value = langCode; }
function changeLanguage(langCode) { console.log(`اللغة: تغيير اللغة إلى ${langCode}`); translateUI(langCode); }
function toggleTheme() { const body = document.body; let currentTheme = body.getAttribute('data-theme'); const newTheme = (currentTheme === 'dark') ? 'light' : 'dark'; body.setAttribute('data-theme', newTheme); localStorage.setItem('theme', newTheme); const themeBtn = document.getElementById('theme-toggle'); if(themeBtn) themeBtn.innerHTML = (newTheme === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; console.log(`السمة: تم التغيير إلى ${newTheme}`);}
function showNotification(message, duration = 3000) { const toast = document.getElementById('notification-toast'); const messageElement = document.getElementById('notification-message'); if (!toast || !messageElement) return; messageElement.textContent = message; toast.classList.remove('hidden'); toast.classList.add('show'); setTimeout(() => { toast.classList.remove('show'); setTimeout(() => { toast.classList.add('hidden'); }, 500); }, duration); }
function showElement(selector) { const element = document.querySelector(selector); if (element) element.classList.remove('hidden'); else console.warn(`ShowElement: لم يتم العثور على العنصر "${selector}"`);}
function hideElement(selector) { const element = document.querySelector(selector); if (element) element.classList.add('hidden'); else console.warn(`HideElement: لم يتم العثور على العنصر "${selector}"`);}
function openSidebar() { const sidebar = document.getElementById('sidebar'); const overlay = document.getElementById('overlay'); if(sidebar) sidebar.classList.add('open'); if(overlay) overlay.style.display = 'block'; console.log("الواجهة: فتح الشريط الجانبي"); }
function closeSidebar() { const sidebar = document.getElementById('sidebar'); const overlay = document.getElementById('overlay'); if(sidebar) sidebar.classList.remove('open'); if(overlay) overlay.style.display = 'none'; console.log("الواجهة: إغلاق الشريط الجانبي"); }


// **=================================================**
// [8] تشغيل الكود عند تحميل الصفحة
// **=================================================**

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM تحميله بالكامل وجاهز.");

    // --- تحديث عدد المستخدمين النشطين (يعمل بشكل مستقل) ---
     const activeUsersCountElement = document.getElementById('active-users-count');
     function updateActiveUsers() {
         const randomCount = Math.floor(Math.random() * (35 - 7 + 1)) + 7;
         if (activeUsersCountElement) activeUsersCountElement.textContent = randomCount;
     }
     setInterval(updateActiveUsers, 30000); // تحديث كل 30 ثانية
     updateActiveUsers(); // تحديث فوري

    // --- تحميل بيانات الاختبار (الأهم، سيقوم بتشغيل الباقي عند النجاح) ---
    loadGeologyData();

    // --- تحميل اللغة والسمة المحفوظة ---
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.innerHTML = (savedTheme === 'dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    // لا نستدعي translateUI هنا، ستُستدعى بعد تحميل البيانات بنجاح
});

