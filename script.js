// المتغير الذي سيخزن جميع الأسئلة بعد تحميلها
let allQuestions = [];
let userAnswers = {}; // لتخزين إجابات المستخدمين: {questionIndex: selectedOptionIndex}
let currentScore = 0;
let totalQuestions = 0;
let answeredCount = 0;

// العناصر الرئيسية في DOM
const container = document.getElementById('quiz-container');
const scoreDisplay = document.getElementById('score-display');
const progressBar = document.getElementById('progress-bar');
const progressDisplay = document.getElementById('progress-display');
const submitButton = document.getElementById('submit-btn');
const finalResultsDiv = document.getElementById('final-results');


// دالة لتحميل الأسئلة من ملف questions.json
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        
        allQuestions = []; // مسح الأسئلة القديمة
        
        // تجميع جميع الأسئلة من جميع الأقسام
        data.forEach(section => {
            section.questions.forEach(question => {
                question.sectionTitle = section.section;
                allQuestions.push(question);
            });
        });

        totalQuestions = allQuestions.length;
        displayQuestions();
        updateStatus();
    } catch (error) {
        console.error('خطأ في تحميل ملف الأسئلة:', error);
        container.innerHTML = '<p style="color:var(--danger-color); text-align:center;">تعذر تحميل الأسئلة. تأكد من وجود ملف questions.json</p>';
        submitButton.disabled = true;
    }
}

// دالة لعرض الأسئلة في صفحة HTML
function displayQuestions() {
    container.innerHTML = '';
    let currentSection = '';

    allQuestions.forEach((q, questionIndex) => {
        // عرض عنوان القسم
        if (q.sectionTitle !== currentSection) {
            container.innerHTML += `<h2 class="section-title">${q.sectionTitle}</h2>`;
            currentSection = q.sectionTitle;
        }

        let questionHTML = `
            <div class="question-card" data-question-index="${questionIndex}">
                <p class="question-text">سؤال ${questionIndex + 1}: ${q.question}</p>
                <div class="options-container">
        `;

        // عرض خيارات الإجابة
        q.options.forEach((option, optionIndex) => {
            const radioName = `q${questionIndex}`;
            const inputId = `q${questionIndex}o${optionIndex}`;
            
            questionHTML += `
                <label for="${inputId}" class="option-label">
                    <input type="radio" id="${inputId}" name="${radioName}" value="${optionIndex}" onclick="handleAnswer(${questionIndex}, ${optionIndex})">
                    ${option}
                </label>
            `;
        });

        questionHTML += `
                </div>
            </div>
        `;
        container.innerHTML += questionHTML;
    });
}

// دالة لتحديث شريط التقدم والنتيجة الفورية
function updateStatus() {
    scoreDisplay.textContent = `النقاط: ${currentScore} / ${answeredCount}`;
    
    // تحديث التقدم العام (كم سؤال تم الإجابة عليه)
    const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    progressDisplay.textContent = `التقدم: ${answeredCount} من ${totalQuestions}`;
}

// دالة لمعالجة اختيار الإجابة (تفاعلي)
window.handleAnswer = function(questionIndex, selectedOptionIndex) {
    const questionData = allQuestions[questionIndex];
    const card = document.querySelector(`.question-card[data-question-index="${questionIndex}"]`);
    const isAlreadyAnswered = userAnswers.hasOwnProperty(questionIndex);
    
    // تحديث الإجابة في سجل المستخدم
    userAnswers[questionIndex] = selectedOptionIndex;

    // تحديث عداد الإجابات المنجزة فقط إذا كان هذا أول اختيار لهذا السؤال
    if (!isAlreadyAnswered) {
        answeredCount++;
        card.classList.add('answered');
    }
    
    // تحديث النقاط الفورية: إعادة احتساب النقاط
    currentScore = 0;
    Object.keys(userAnswers).forEach(idx => {
        const q = allQuestions[idx];
        if (userAnswers[idx] === q.correct) {
            currentScore++;
        }
    });

    updateStatus();
};

// دالة لمعالجة إرسال الاختبار وعرض النتيجة النهائية
window.submitQuiz = function() {
    let finalScore = 0;
    
    // التأكد من أن جميع الأسئلة قد تم عرضها وحسابها
    allQuestions.forEach((q, questionIndex) => {
        const card = document.querySelector(`.question-card[data-question-index="${questionIndex}"]`);
        const userSelected = userAnswers[questionIndex];
        const optionsLabels = card.querySelectorAll('.option-label');
        
        // تعطيل الزر لمنع إعادة الإرسال
        submitButton.disabled = true;

        // إزالة الفئات القديمة قبل التصحيح
        optionsLabels.forEach(label => label.classList.remove('correct-answer', 'wrong-answer', 'user-selected-wrong', 'user-selected-correct'));
        
        // تحديد الإجابة الصحيحة ووضع علامة عليها
        const correctAnswerLabel = optionsLabels[q.correct];
        correctAnswerLabel.classList.add('correct-answer');

        if (userSelected !== undefined) {
            const userSelectedLabel = optionsLabels[userSelected];
            
            if (userSelected === q.correct) {
                // الإجابة صحيحة
                finalScore++;
                userSelectedLabel.classList.add('user-selected-correct');
            } else {
                // الإجابة خاطئة
                userSelectedLabel.classList.add('wrong-answer', 'user-selected-wrong');
            }
        }
        
        // تعطيل جميع الخيارات لمنع التغيير بعد الإرسال
        card.querySelectorAll('input[type="radio"]').forEach(input => input.disabled = true);
    });

    // عرض النتيجة النهائية
    finalResultsDiv.style.display = 'block';
    const percentage = ((finalScore / totalQuestions) * 100).toFixed(2);
    
    let message = '';
    if (percentage >= 80) {
        message = 'ممتاز! مستوى معرفة جيولوجية عالي. 💎';
    } else if (percentage >= 60) {
        message = 'جيد جداً! لديك أساس متين في الجيولوجيا. ⛰️';
    } else {
        message = 'تحتاج إلى مراجعة بعض المفاهيم الجيولوجية. 📚';
    }
    
    finalResultsDiv.innerHTML = `
        <h3>🎉 نتيجة الاختبار النهائية 🎉</h3>
        <p>النقاط المحتسبة: <span style="color: var(--success-color);">${finalScore}</span> من أصل ${totalQuestions} سؤال.</p>
        <p>نسبة النجاح: <span style="color: var(--primary-color);">${percentage}%</span></p>
        <p style="margin-top: 20px;">${message}</p>
        <p>تم تظليل الإجابة الصحيحة باللون الأخضر.</p>
    `;
    
    // التمرير إلى قسم النتائج
    finalResultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// تشغيل دالة تحميل الأسئلة عند تحميل الصفحة
window.onload = loadQuestions;
