// **=================================================**
// [1] المتغيرات العالمية والتحكم المحسّنة
// **=================================================**
let geologicalData = {};          // سيحتفظ ببيانات الأسئلة من Question.json
let currentQuestions = [];        // الأسئلة للاختبار الحالي
let currentQuestionIndex = 0;   // مؤشر السؤال الحالي
let score = 0;                    // النقاط المحتسبة
let userAnswers = {};             // لتخزين إجابات المستخدم ومقارنتها
let timerInterval;                // للتحكم في مؤقت السؤال
const TIME_LIMIT = 20;            // الوقت لكل سؤال بالثواني (يمكن تعديله)
const POINTS_CORRECT = 10;        // نقاط الإجابة الصحيحة
const POINTS_WRONG = -5;          // نقاط الإجابة الخاطئة أو انتهاء الوقت
const DAILY_CHALLENGE_QUESTIONS = 7; // عدد أسئلة التحدي اليومي
const ONBOARDING_MISSION_QUESTIONS = 3; // عدد أسئلة المهمة الفورية
let currentLanguage = 'ar';       // اللغة الافتراضية
let userCommitted = false;        // هل التزم المستخدم بالتحدي اليومي؟ (مؤقت)
let cohortCountdownInterval;      // للتحكم في عداد الدفعة

// قاموس الترجمة المحسّن (مع نصوص هجومية)
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
        'onboarding_mission_start': 'مهمتك الأولى: تشخيص سريع (3 أسئلة)',
        'start_custom_quiz': 'ابدأ اختباراً مخصصاً',
        'daily_challenge': 'التحدي اليومي',
        'daily_challenge_button': `التحدي اليومي (${DAILY_CHALLENGE_QUESTIONS} أسئلة)`,
        'choose_domain': 'اختر مجال الاختبار المخصص:',
        'quiz_title_prefix': 'مهمة:',
        'question': 'السؤال',
        'submit': 'تأكيد التشخيص', // تغيرت
        'next': 'السؤال التالي',
        'review_errors': 'تحليل الأخطاء الميدانية:', // تغيرت
        'your_answer': 'تشخيصك:', // تغيرت
        'correct_answer': 'التشخيص الصحيح:', // تغيرت
        'result_explanation': 'الشرح التفصيلي:', // جديد للشرح النصي
        'great_job': '🌟 أداء خبير! يمكنك الاعتماد عليك في الميدان.', // تغيرت
        'good_job': '✨ أداء جيد! لديك أساس قوي، استمر في الصقل.', // تغيرت
        'needs_review': '⚠️ تحتاج لمراجعة ميدانية مكثفة. لا تستسلم!', // تغيرت
        'new_quiz': 'ابدأ مهمة جديدة', // تغيرت
        'timer_text': 'ث',
        'loading_data': '... تحميل بيانات المهمة', // تغيرت
        'loading_error': '[خطأ تحميل] تعذر استلام بيانات المهمة. تحقق من الاتصال.', // تغيرت
        'timeout_answer': '(نفذ الوقت)', // تغيرت
        'all_correct_message': '🎉 ممتاز! أكملت المهمة بدون أخطاء.', // تغيرت
        'share_results_cta': 'شارك نتيجتك وتحداهم!', // جديد
        'badge_unlocked': 'شارة جديدة مفتوحة!', // جديد
        'proof_popup_title': 'هل تريد حفظ نتيجتك؟', // جديد
        'proof_popup_text': 'شاركها الآن واحصل على شارة مميزة!', // جديد
    },
    // Add 'en' and 'fr' translations later following the same aggressive/engaging tone
};

// **=================================================**
// [2] تحميل البيانات وتهيئة الواجهة الرئيسية (Hero)
// **=================================================**

async function loadGeologyData() {
    // ... (نفس كود التحميل السابق، فقط تأكد من تحديث النصوص)
    const loadingMessage = document.getElementById('loading-message');
    const heroTitle = document.querySelector('.hero-content h2'); // Assume h2 is the main title
    const heroSubtitle = document.querySelector('.hero-description');
    const mainCTA = document.getElementById('start-challenge-btn'); // **ستحتاج لتغيير ID الزر الرئيسي في HTML**
    const secondaryCTA = document.getElementById('view-brief-btn'); // **ستحتاج لإضافة هذا الزر في HTML**
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn'); // الزر القديم للتحدي

    try {
        if (loadingMessage) {
            // updateTextContent('#loading-message', 'loading_data'); // Use helper
            loadingMessage.classList.remove('hidden');
        }
        // Disable buttons
        if(mainCTA) mainCTA.disabled = true;
        if(secondaryCTA) secondaryCTA.disabled = true;
        if(dailyChallengeBtn) dailyChallengeBtn.disabled = true;


        const response = await fetch('./Question.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        geologicalData = await response.json();

        // Data loaded successfully
        if (loadingMessage) loadingMessage.classList.add('hidden');

        // Initialize UI Elements (Hero, Buttons, Lists etc.)
        initializeUIElements(geologicalData);
        startCohortCountdown(); // ابدأ عداد الدفعة

    } catch (error) {
        console.error("فشل تحميل بيانات المهمة:", error);
        if (loadingMessage) {
            // updateTextContent('#loading-message', 'loading_error');
            loadingMessage.classList.remove('hidden');
        }
        // Keep buttons disabled
         if(mainCTA) mainCTA.disabled = true;
         if(secondaryCTA) secondaryCTA.disabled = true;
         if(dailyChallengeBtn) dailyChallengeBtn.disabled = true;
    }
}

function initializeUIElements(data) {
    const t = translations[currentLanguage];
    // --- تحديث نصوص الهيرو ---
    updateTextContent('.hero-content h2', 'hero_title');
    updateTextContent('.hero-description', 'hero_subtitle');
    updateTextContent('#start-challenge-btn .btn-text', 'cta_main'); // **تأكد من وجود span.btn-text داخل الزر الجديد**
    // updateTextContent('#view-brief-btn', 'cta_secondary'); // **تأكد من ID الزر الثانوي**

    // --- تفعيل الأزرار الرئيسية ---
    const mainCTA = document.getElementById('start-challenge-btn'); // **تأكد من ID الزر الرئيسي**
    const secondaryCTA = document.getElementById('view-brief-btn'); // **تأكد من ID الزر الثانوي**
    const dailyChallengeBtn = document.getElementById('daily-challenge-btn'); // زر التحدي اليومي الأصلي

    if (mainCTA) {
        mainCTA.disabled = false;
        mainCTA.onclick = handleMainCTA; // ربط بالوظيفة الجديدة
    }
    if (secondaryCTA) {
        secondaryCTA.disabled = false;
        secondaryCTA.onclick = showMissionBrief; // ربط بوظيفة عرض الموجز
    }
     // Keep daily challenge button functional for now, maybe hide it later
     if (dailyChallengeBtn) {
         dailyChallengeBtn.disabled = false;
         dailyChallengeBtn.onclick = startDailyChallenge;
         updateTextContent('#daily-challenge-btn .btn-text', 'daily_challenge_button');
     }


    // --- تهيئة قائمة المواضيع (للاختبار المخصص - قد تحتاج لتعديل الواجهة لإظهاره) ---
    const topicsList = document.getElementById('topics-list');
    const sidebarList = document.getElementById('sidebar-topics-list');
    if(topicsList && sidebarList) {
        topicsList.innerHTML = ''; // Clear previous items
        sidebarList.innerHTML = ''; // Clear previous items

        Object.keys(data).forEach(topic => {
            const topicDisplayName = topic.replace(/_/g, ' ');

            // Card for main topic list (maybe shown after clicking a "custom quiz" button)
            const gridCard = document.createElement('div');
            gridCard.className = 'topic-card';
            gridCard.textContent = topicDisplayName;

            // Link for sidebar
            const sidebarLink = document.createElement('a');
            sidebarLink.href = "#";
            sidebarLink.textContent = topicDisplayName;

            // Handler to start a custom topic quiz
            const startTopicQuizHandler = () => {
                startQuiz(topicDisplayName, data[topic]);
                closeSidebar(); // Helper function to close sidebar
            };

            gridCard.addEventListener('click', startTopicQuizHandler);

            const listItem = document.createElement('li');
            sidebarLink.addEventListener('click', startTopicQuizHandler);
            listItem.appendChild(sidebarLink);

            topicsList.appendChild(gridCard);
            sidebarList.appendChild(listItem);
        });
    }

    // --- ربط زر الاختبار المخصص القديم (إذا أردت الإبقاء عليه) ---
     const startCustomBtn = document.getElementById('start-quiz-btn'); // الزر القديم
     if(startCustomBtn) {
         startCustomBtn.onclick = () => {
             // Logic to show the topics list container
             const topicsContainer = document.getElementById('topics-list-container');
             if(topicsContainer) topicsContainer.classList.remove('hidden');
             // Hide hero buttons if needed
              if(mainCTA) mainCTA.classList.add('hidden');
              if(secondaryCTA) secondaryCTA.classList.add('hidden');
              if(dailyChallengeBtn) dailyChallengeBtn.parentElement.classList.add('hidden');
              if(startCustomBtn) startCustomBtn.classList.add('hidden');
         };
         updateTextContent('#start-quiz-btn .btn-text', 'start_custom_quiz');
     }


    // Update all UI text based on the current language
    translateUI(currentLanguage);
}

// **=================================================**
// [3] منطق تجربة الدخول (Onboarding) والتحديات
// **=================================================**

function handleMainCTA() {
    // الخطوة الأولى: سؤال الالتزام
    askForCommitment();
}

function askForCommitment() {
    const t = translations[currentLanguage];
    // **TODO: استبدل confirm بواجهة modal أجمل في HTML/CSS**
    const confirmed = confirm(t.onboarding_commit_question);

    if (confirmed) {
        userCommitted = true; // Store commitment (temporarily)
        console.log("User committed!");
        // الخطوة الثانية: ابدأ المهمة الفورية
        startOnboardingMission();
    } else {
        userCommitted = false;
        console.log("User did not commit yet.");
        // ربما تظهر قائمة المواضيع للاختبار المخصص كخيار بديل؟
        const topicsContainer = document.getElementById('topics-list-container');
        if(topicsContainer) topicsContainer.classList.remove('hidden');
         // Hide hero buttons
         const mainCTA = document.getElementById('start-challenge-btn');
         const secondaryCTA = document.getElementById('view-brief-btn');
         if(mainCTA) mainCTA.classList.add('hidden');
         if(secondaryCTA) secondaryCTA.classList.add('hidden');

    }
}

function startOnboardingMission() {
    const t = translations[currentLanguage];
    let allQuestions = [];
    Object.values(geologicalData).forEach(topicQuestions => {
        allQuestions = allQuestions.concat(topicQuestions);
    });

    // **TODO: يمكن اختيار أسئلة سهلة مخصصة للمهمة الأولى بدلاً من العشوائية**
    const shuffledQuestions = shuffleArray(allQuestions);
    const missionQuestions = shuffledQuestions.slice(0, ONBOARDING_MISSION_QUESTIONS);

    startQuiz(t.onboarding_mission_start, missionQuestions);
}

function showMissionBrief() {
    // **TODO: اعرض modal بسيط (HTML/CSS) يحتوي على نص موجز للمهمة بدلاً من alert**
    alert("موجز المهمة: سيتم عرض سلسلة من الحالات الميدانية. استخدم معرفتك الجيولوجية لتحديد التشخيص الصحيح ضمن الوقت المحدد. كل تشخيص صحيح يقربك من فهم أعمق...");
}

// ------ دالة خلط عشوائي للمصفوفة (Fisher-Yates) ------
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ------ دالة بدء التحدي اليومي ------
function startDailyChallenge() {
    const t = translations[currentLanguage];
    if (!geologicalData || Object.keys(geologicalData).length === 0) {
        console.error("Geological data not loaded yet.");
        showNotification("بيانات التحدي غير جاهزة بعد، حاول لاحقاً.");
        return;
    }

    let allQuestions = [];
    Object.values(geologicalData).forEach(topicQuestions => {
        allQuestions = allQuestions.concat(topicQuestions);
    });

    const shuffledQuestions = shuffleArray(allQuestions);
    const dailyQuestions = shuffledQuestions.slice(0, DAILY_CHALLENGE_QUESTIONS);

    startQuiz(t.daily_challenge, dailyQuestions);
}

// **=================================================**
// [4] منطق الاختبار المحسّن (Start, Display, Submit, Timeout, Results)
// **=================================================**

function startQuiz(quizTitle, questions) {
    clearInterval(timerInterval);
    clearInterval(cohortCountdownInterval); // أوقف عداد الدفعة أثناء الاختبار

    currentQuestions = questions;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};

    // Hide other screens, show quiz screen
    hideElement('#topic-selection');
    hideElement('#topics-list-container');
    hideElement('#results-screen');
    showElement('#quiz-screen'); // Make sure quiz screen element exists and has this ID

    // Update quiz title
    updateTextContent('#quiz-title', `${translations[currentLanguage].quiz_title_prefix} ${quizTitle}`);

    displayQuestion();
}

function displayQuestion() {
    // ... (الكود مشابه للنسخة السابقة مع تعديلات طفيفة)
    clearInterval(timerInterval);
    const qContainer = document.getElementById('question-container');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const questionCounter = document.getElementById('question-counter');
    const currentScoreDisplay = document.getElementById('current-score');
    const feedbackContainer = document.getElementById('feedback-container');

    if (currentQuestionIndex >= currentQuestions.length) {
        return showResults();
    }

    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];

    if (!currentQ || !currentQ.options || !currentQ.answer) {
        console.error("بيانات سؤال غير صالحة:", currentQ, "في المؤشر:", currentQuestionIndex);
        // Skip this question or end quiz
         currentQuestionIndex++;
         displayQuestion(); // Try next question
         return;
        // return showResults(); // Or end immediately
    }

    startTimer();

    if (questionCounter) {
        questionCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    }
    if (currentScoreDisplay) {
        currentScoreDisplay.textContent = score;
    }

    // Build question HTML
    let htmlContent = `<p class="question-text">${currentQ.question}</p>`;
    htmlContent += '<div class="options-container">';
    const options = shuffleArray([...currentQ.options]); // Shuffle options display

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
    showElement('#submit-btn');
    hideElement('#next-btn');
    if (submitBtn) submitBtn.disabled = true; // Disable submit until selection

    // Enable submit on selection
    document.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => {
            if (submitBtn) submitBtn.disabled = false;
        });
    });

    // Hide feedback
    if (feedbackContainer) feedbackContainer.classList.add('hidden');
}


// --- معالجة الإجابة (Submit) ---
const submitBtn = document.getElementById('submit-btn');
if (submitBtn) {
    submitBtn.onclick = () => { // Changed to onclick for simplicity, ensure no double binding
        clearInterval(timerInterval);

        const selectedOptionInput = document.querySelector('input[name="option"]:checked');
        if (!selectedOptionInput) return;

        const userAnswer = selectedOptionInput.value;
        const currentQ = currentQuestions[currentQuestionIndex];
        const correctAnswer = currentQ.answer;
        const isCorrect = (userAnswer === correctAnswer);

        score += isCorrect ? POINTS_CORRECT : POINTS_WRONG;

        userAnswers[currentQ.id || currentQuestionIndex] = {
            question: currentQ.question,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect,
            explanation: currentQ.explanation || "لا يوجد شرح متوفر لهذا السؤال." // **مهم: أضف explanation لـ Question.json**
        };

        // Visual feedback
        document.querySelectorAll('.option-label').forEach(label => {
            const input = label.querySelector('input');
            input.disabled = true;
            if (input.value === correctAnswer) label.classList.add('correct');
            else if (input.checked && !isCorrect) label.classList.add('incorrect');
        });

        // Show textual explanation instead of feedback message
         const feedbackContainer = document.getElementById('feedback-container');
         if (feedbackContainer) {
              if(!isCorrect) { // Show explanation only for wrong answers immediately
                    feedbackContainer.innerHTML = `<strong>${translations[currentLanguage].correct_answer}</strong> ${correctAnswer}<br><strong>${translations[currentLanguage].result_explanation}</strong> ${userAnswers[currentQ.id || currentQuestionIndex].explanation}`;
                    feedbackContainer.className = 'feedback-message incorrect-feedback expanded-feedback'; // Add class for styling
                    feedbackContainer.classList.remove('hidden');
              } else {
                   feedbackContainer.classList.add('hidden'); // Hide if correct
              }
         }


        // Update score display
        updateTextContent('#current-score', score);

        // Toggle buttons
        hideElement('#submit-btn');
        showElement('#next-btn');
    };
}


// --- الانتقال للسؤال التالي (Next) ---
const nextBtn = document.getElementById('next-btn');
if (nextBtn) {
    nextBtn.onclick = () => { // Changed to onclick
        currentQuestionIndex++;
        displayQuestion();
    };
}

// --- التعامل مع انتهاء الوقت ---
function handleTimeout() {
    clearInterval(timerInterval);
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];

    score += POINTS_WRONG;

    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: t.timeout_answer,
        correctAnswer: currentQ.answer,
        isCorrect: false,
        explanation: currentQ.explanation || "لا يوجد شرح متوفر لهذا السؤال." // **أضف explanation لـ Question.json**
    };

    // Visual feedback (disable all, show correct)
    document.querySelectorAll('.option-label').forEach(label => {
        label.querySelector('input').disabled = true;
        label.classList.add('incorrect'); // Mark all incorrect first
         if (label.querySelector('input').value === currentQ.answer) {
             label.classList.remove('incorrect');
             label.classList.add('correct');
         }
    });

    // Show explanation for timeout
     const feedbackContainer = document.getElementById('feedback-container');
     if (feedbackContainer) {
         feedbackContainer.innerHTML = `<strong>${t.timeout_answer}</strong><br><strong>${translations[currentLanguage].correct_answer}</strong> ${currentQ.answer}<br><strong>${translations[currentLanguage].result_explanation}</strong> ${userAnswers[currentQ.id || currentQuestionIndex].explanation}`;
         feedbackContainer.className = 'feedback-message incorrect-feedback expanded-feedback';
         feedbackContainer.classList.remove('hidden');
     }


    updateTextContent('#current-score', score);

    // Toggle buttons
    hideElement('#submit-btn');
    showElement('#next-btn');
}


// --- عرض النتائج المحسّن ---
function showResults() {
    clearInterval(timerInterval);
    hideElement('#quiz-screen');
    showElement('#results-screen');
    startCohortCountdown(); // أعد تشغيل عداد الدفعة

    let correctCount = 0;
    Object.values(userAnswers).forEach(answer => {
        if (answer.isCorrect) correctCount++;
    });

    const totalQuestions = currentQuestions.length;
    const wrongCount = totalQuestions - correctCount;
    const divisor = totalQuestions || 1;
    const percentage = Math.round((correctCount / divisor) * 100);
    const t = translations[currentLanguage];

    // Update summary card
    updateTextContent('#final-score', score);
    updateTextContent('#total-questions-count', totalQuestions);
    updateTextContent('#correct-count', correctCount);
    updateTextContent('#wrong-count', wrongCount);
    // updateTextContent('#total-time', calculatedTime); // **TODO: Implement timer tracking**

    // Update grade message
    const gradeMessage = document.getElementById('grade-message');
    if (gradeMessage) {
        if (percentage >= 90) { gradeMessage.innerHTML = t.great_job; gradeMessage.style.color = 'var(--correct-color)'; }
        else if (percentage >= 70) { gradeMessage.innerHTML = t.good_job; gradeMessage.style.color = 'var(--neon-blue)'; }
        else { gradeMessage.innerHTML = t.needs_review; gradeMessage.style.color = 'var(--incorrect-color)'; }
    }

    // Update progress ring
    const progressRingFill = document.querySelector('.progress-ring-fill');
    if (progressRingFill) {
        const radius = progressRingFill.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        progressRingFill.style.strokeDashoffset = offset;
    }

    // Display detailed error review with explanations
    const reviewArea = document.getElementById('review-area');
    if (reviewArea) {
        reviewArea.innerHTML = `<h3><i class="fas fa-bug"></i> ${t.review_errors}</h3>`;
        let errorsFound = false;
        Object.values(userAnswers).forEach(answer => {
            if (!answer.isCorrect) {
                errorsFound = true;
                // **مهم: عرض الشرح النصي هنا**
                reviewArea.innerHTML += `
                    <div class="review-item">
                        <p class="error-q">${answer.question}</p>
                        <p class="error-a">${t.your_answer} <span class="wrong">${answer.userAnswer}</span></p>
                        <p class="error-a">${t.correct_answer} <span class="right">${answer.correctAnswer}</span></p>
                        <p class="explanation">${t.result_explanation} ${answer.explanation}</p> 
                    </div>`;
            }
        });
        if (!errorsFound) {
            reviewArea.innerHTML += `<p class="all-correct">${t.all_correct_message}</p>`;
        }
    }

    // **TODO: إضافة أزرار المشاركة الفعلية هنا في HTML/CSS**
    // const shareBtnContainer = document.getElementById('share-buttons-container');
    // if(shareBtnContainer) {
    //      shareBtnContainer.innerHTML = `<button onclick="shareResult('whatsapp')">WhatsApp</button> ...`;
    // }

    // Check if a badge should be unlocked (Example logic)
     if(percentage >= 80 && totalQuestions >= DAILY_CHALLENGE_QUESTIONS) {
          unlockBadge("Expert Diagnostician"); // Example badge name
     } else if (correctCount === totalQuestions && totalQuestions > 0) {
          unlockBadge("Flawless Mission");
     }

}

function unlockBadge(badgeName) {
     // **TODO: أظهر واجهة أجمل للشارة (modal أو toast)**
     showNotification(`${translations[currentLanguage].badge_unlocked} ${badgeName}`);
     // **TODO: أضف الشارة لملف المستخدم (يحتاج backend)**
}

function generateSharableSummary() {
    // **TODO: هذه الدالة يجب أن تُستدعى بواسطة زر المشاركة**
    // **TODO: توليد الصورة يتطلب backend/serverless function**
    // For now, generate text summary:
     let correctCount = 0;
     Object.values(userAnswers).forEach(ans => { if(ans.isCorrect) correctCount++; });
     const total = currentQuestions.length;
     const percentage = Math.round((correctCount / total) * 100);
     const summary = `أكملت مهمة ${document.getElementById('quiz-title')?.textContent || 'GEO-MASTER'} بنتيجة ${score} (${percentage}%)! هل يمكنك التفوق؟ #GeoMasterChallenge`;
     console.log("Share Summary:", summary);
     // **TODO: استخدم Web Share API أو روابط مباشرة للمشاركة**
     // navigator.share({ title: 'GeoMaster Result', text: summary, url: window.location.href });
     return summary;
}


// **=================================================**
// [5] وظائف مساعدة إضافية (عداد الدفعة، Pop-up، ...)
// **=================================================**

function startCohortCountdown() {
    // **TODO: أضف عنصر HTML لعرض العداد، مثلاً <div id="cohort-timer"></div>**
    const countdownElement = document.getElementById('cohort-timer');
    if (!countdownElement) return;

    // مثال: العد التنازلي لمدة 3 أيام
    let endTime = new Date().getTime() + 3 * 24 * 60 * 60 * 1000;

    clearInterval(cohortCountdownInterval); // Clear previous if any
    cohortCountdownInterval = setInterval(() => {
        let now = new Date().getTime();
        let distance = endTime - now;

        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${translations[currentLanguage].cohort_countdown_title} ${days}ي ${hours}س ${minutes}د ${seconds}ث`;

        if (distance < 0) {
            clearInterval(cohortCountdownInterval);
            countdownElement.innerHTML = "دفعة النخبة مفتوحة الآن!";
            // **TODO: تغيير حالة الزر أو الواجهة**
        }
    }, 1000);
}

// --- Proof Pop-up (مثال بسيط باستخدام beforeunload) ---
// Note: beforeunload is often blocked or restricted by browsers
// window.addEventListener('beforeunload', function (e) {
//     // Check if user has results (e.g., score is not 0)
//     if (score !== 0 && !document.getElementById('results-screen').classList.contains('hidden')) {
//         const t = translations[currentLanguage];
//         const confirmationMessage = `${t.proof_popup_title} ${t.proof_popup_text}`;
//         e.returnValue = confirmationMessage; // Standard for most browsers
//         return confirmationMessage; // For older browsers
//     }
// });


// **=================================================**
// [6] وظائف الواجهة (Timers, Translate, Theme, Sidebar, Helpers)
// **=================================================**

// --- المؤقت (Timer) ---
function startTimer() {
    // ... (نفس الكود السابق للمؤقت، تأكد من تحديث النصوص فقط)
    clearInterval(timerInterval);
    let timeRemaining = TIME_LIMIT;
    const timerValueElement = document.querySelector('#timer-display .timer-value');
    const timerUnitElement = document.querySelector('#timer-display .timer-unit');
    const progressBar = document.getElementById('progress-bar-fill');
    const t = translations[currentLanguage];

    if (timerValueElement) {
        timerValueElement.parentElement.style.color = 'var(--neon-blue)';
        timerValueElement.textContent = timeRemaining;
    }
     if (timerUnitElement) timerUnitElement.textContent = t.timer_text;
    if (progressBar) progressBar.style.width = '100%';

    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timerValueElement) timerValueElement.textContent = timeRemaining;
        const progressPercentage = (timeRemaining / TIME_LIMIT) * 100;
        if (progressBar) progressBar.style.width = `${progressPercentage}%`;

        if (timeRemaining <= 5) {
            if (timerValueElement) timerValueElement.parentElement.style.color = 'var(--incorrect-color)';
        } else {
             if (timerValueElement) timerValueElement.parentElement.style.color = 'var(--neon-blue)';
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

// --- الترجمة (Translate) ---
function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar'];

    document.documentElement.lang = langCode;
    document.documentElement.dir = (langCode === 'ar') ? 'rtl' : 'ltr';

    // Helper functions (use querySelector for safety)
    const updateTextContent = (selector, key) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = t[key] || `[[${key}]]`; // Show key if missing
    };
     const updateHTMLContent = (selector, key, defaultHTML = '') => {
          const element = document.querySelector(selector);
          if (element) element.innerHTML = t[key] || defaultHTML;
     };
      const updateTitle = (selector, key) => {
           const element = document.querySelector(selector);
           if (element) element.title = t[key] || '';
      };
       const updateButtonText = (selector, key) => {
            const element = document.querySelector(selector + ' .btn-text'); // Target inner span
            if (element) element.textContent = t[key] || `[[${key}]]`;
       };


    // --- Update Hero Section ---
    updateTextContent('.hero-content h2', 'hero_title'); // Assuming h2 is hero title
    updateTextContent('.hero-description', 'hero_subtitle');
    updateButtonText('#start-challenge-btn', 'cta_main'); // **Update ID if changed**
    updateTextContent('#view-brief-btn', 'cta_secondary'); // **Update ID if changed**
    updateTextContent('#cohort-timer', 'cohort_countdown_title'); // Update countdown prefix

    // --- Update Other Buttons ---
    updateButtonText('#start-quiz-btn', 'start_custom_quiz'); // Old custom button
    updateButtonText('#daily-challenge-btn', 'daily_challenge_button');

    // --- Update General UI ---
    updateTextContent('#topics-list-container h3', 'choose_domain');
    updateTitle('.active-users-indicator', 'active_users_title');

    // --- Update Quiz Screen (if visible) ---
    if (!document.getElementById('quiz-screen')?.classList.contains('hidden')) {
        // Quiz title is set dynamically in startQuiz
        updateButtonText('#submit-btn', 'submit');
        updateButtonText('#next-btn', 'next');
        const timerUnit = document.querySelector('#timer-display .timer-unit');
        if(timerUnit) timerUnit.textContent = t.timer_text;
        const qCounter = document.getElementById('question-counter');
         if(qCounter) qCounter.innerHTML = `<i class="fas fa-list-ol"></i> ${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    }

    // --- Update Results Screen (if visible) ---
    if (!document.getElementById('results-screen')?.classList.contains('hidden')) {
        updateButtonText('#results-screen button[onclick*="reload"]', 'new_quiz');
        const reviewTitle = document.querySelector('#review-area h3');
        if(reviewTitle) reviewTitle.innerHTML = `<i class="fas fa-bug"></i> ${t.review_errors}`;

        // Re-translate grade message (important!)
         const gradeMessage = document.getElementById('grade-message');
         if (gradeMessage && Object.keys(userAnswers).length > 0) {
             const correctCount = parseInt(document.getElementById('correct-count')?.textContent || '0');
             const totalQuestions = parseInt(document.getElementById('total-questions-count')?.textContent || '1');
             const divisor = totalQuestions || 1;
             const percentage = Math.round((correctCount / divisor) * 100);
             if (percentage >= 90) gradeMessage.innerHTML = t.great_job;
             else if (percentage >= 70) gradeMessage.innerHTML = t.good_job;
             else gradeMessage.innerHTML = t.needs_review;
         }

        // Re-translate review items
        document.querySelectorAll('.review-item').forEach(item => {
            const q = item.querySelector('.error-q')?.textContent || '';
            const uaSpan = item.querySelector('.wrong');
            const caSpan = item.querySelector('.right');
            const explanationP = item.querySelector('.explanation');

            const ua = uaSpan?.textContent || '';
            const ca = caSpan?.textContent || '';
             // Find original explanation from userAnswers if needed, or assume it's static
             let explanation = '';
             Object.values(userAnswers).find(ans => {
                  if(ans.question === q && ans.userAnswer === ua && ans.correctAnswer === ca) {
                       explanation = ans.explanation;
                       return true;
                  }
                  return false;
             });


            const yourAnswerP = item.querySelector('p:nth-of-type(2)');
            const correctAnswerP = item.querySelector('p:nth-of-type(3)');

            if(yourAnswerP) yourAnswerP.innerHTML = `${t.your_answer} <span class="wrong">${ua}</span>`;
            if(correctAnswerP) correctAnswerP.innerHTML = `${t.correct_answer} <span class="right">${ca}</span>`;
            if(explanationP) explanationP.innerHTML = `${t.result_explanation} ${explanation}`;

        });

        const allCorrect = document.querySelector('.all-correct');
        if(allCorrect) allCorrect.textContent = t.all_correct_message;

         // Translate share button text if exists
         // updateTextContent('#share-results-btn .btn-text', 'share_results_cta');
    }

    // Update language dropdown
    const langSelect = document.getElementById('lang-select');
    if (langSelect) langSelect.value = langCode;
}


function changeLanguage(langCode) {
    translateUI(langCode);
}

// --- تبديل السمة (Theme Toggle) ---
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    // ... (نفس الكود السابق لتبديل السمة)
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

// --- إظهار إشعار (Notification Toast) ---
function showNotification(message, duration = 3000) {
    // ... (نفس الكود السابق للإشعارات)
     const toast = document.getElementById('notification-toast');
    const messageElement = document.getElementById('notification-message');
    if (!toast || !messageElement) return;

    messageElement.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
             toast.classList.add('hidden');
        }, 500);
    }, duration);
}

// --- وظائف مساعدة لإظهار/إخفاء العناصر ---
function showElement(selector) {
    const element = document.querySelector(selector);
    if (element) element.classList.remove('hidden');
}

function hideElement(selector) {
    const element = document.querySelector(selector);
    if (element) element.classList.add('hidden');
}

// --- التحكم في القائمة الجانبية (Sidebar) ---
function closeSidebar() {
     const sidebar = document.getElementById('sidebar');
     const overlay = document.getElementById('overlay');
     if(sidebar) sidebar.classList.remove('open');
     if(overlay) overlay.style.display = 'none';
}


// **=================================================**
// [7] تشغيل الكود عند تحميل الصفحة
// **=================================================**

document.addEventListener('DOMContentLoaded', () => {
    // --- التحكم في القائمة الجانبية ---
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');

    if (openSidebarBtn) openSidebarBtn.onclick = () => {
        if(sidebar) sidebar.classList.add('open');
        if(overlay) overlay.style.display = 'block';
    };
    if (closeSidebarBtn) closeSidebarBtn.onclick = closeSidebar;
    if (overlay) overlay.onclick = closeSidebar;


    // --- زر إعادة تشغيل النظام ---
    const restartBtn = document.querySelector('#results-screen button[onclick*="reload"]');
    // Onclick attribute handles it.

     // --- تحديث عدد المستخدمين النشطين ---
     const activeUsersCountElement = document.getElementById('active-users-count');
     function updateActiveUsers() {
         const randomCount = Math.floor(Math.random() * (35 - 7 + 1)) + 7;
         if (activeUsersCountElement) activeUsersCountElement.textContent = randomCount;
     }
     setInterval(updateActiveUsers, 30000); // تحديث كل 30 ثانية
     updateActiveUsers(); // تحديث فوري


    // --- تحميل بيانات الاختبار ---
    loadGeologyData(); // Load data after DOM is ready
});

// Load initial language
translateUI(currentLanguage);

