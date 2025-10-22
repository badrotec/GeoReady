// متغيرات عامة
let currentSubject = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let timerInterval;

// عناصر DOM
const subjectSelection = document.getElementById('subject-selection');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const questionElement = document.getElementById('question');
const answersElement = document.getElementById('answers');
const nextButton = document.getElementById('next-btn');
const prevButton = document.getElementById('prev-btn');
const submitButton = document.getElementById('submit-btn');
const progressElement = document.getElementById('progress');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-btn');

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    // إضافة مستمعي الأحداث لأزرار المواد
    document.querySelectorAll('.subject-btn').forEach(button => {
        button.addEventListener('click', function() {
            const subject = this.getAttribute('data-subject');
            startQuiz(subject);
        });
    });
    
    // إضافة مستمعي الأحداث لأزرار التنقل
    nextButton.addEventListener('click', showNextQuestion);
    prevButton.addEventListener('click', showPrevQuestion);
    submitButton.addEventListener('click', showResults);
    restartButton.addEventListener('click', restartQuiz);
});

// بدء الاختبار
async function startQuiz(subject) {
    currentSubject = subject;
    currentQuestionIndex = 0;
    userAnswers = {};
    
    try {
        // تحميل الأسئلة من ملف JSON المناسب
        const response = await fetch(`questions/${subject}.json`);
        currentQuestions = await response.json();
        
        // إخفاء اختيار المادة وإظهار الاختبار
        subjectSelection.style.display = 'none';
        quizContainer.style.display = 'block';
        
        // بدء المؤقت
        startTimer(30 * 60); // 30 دقيقة
        
        // عرض السؤال الأول
        showQuestion();
        
    } catch (error) {
        console.error('خطأ في تحميل الأسئلة:', error);
        alert('حدث خطأ في تحميل الأسئلة. يرجى المحاولة مرة أخرى.');
    }
}

// عرض السؤال الحالي
function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    
    // تحديث رقم السؤال والتقدم
    document.getElementById('question-number').textContent = currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = currentQuestions.length;
    progressElement.textContent = `${currentQuestionIndex + 1}/${currentQuestions.length}`;
    
    // عرض نص السؤال
    questionElement.textContent = question.question;
    
    // مسح الإجابات السابقة
    answersElement.innerHTML = '';
    
    // إنشاء خيارات الإجابة
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        
        const input = document.createElement('input');
        input.type = question.type === 'multiple' ? 'checkbox' : 'radio';
        input.name = 'answer';
        input.value = index;
        input.id = `option-${index}`;
        
        // تحديد إذا كانت الإجابة مختارة مسبقاً
        if (userAnswers[currentQuestionIndex]) {
            if (question.type === 'multiple') {
                input.checked = userAnswers[currentQuestionIndex].includes(index);
            } else {
                input.checked = userAnswers[currentQuestionIndex] === index;
            }
        }
        
        const label = document.createElement('label');
        label.htmlFor = `option-${index}`;
        label.textContent = option;
        
        optionElement.appendChild(input);
        optionElement.appendChild(label);
        
        // إضافة مستمع الحدث لتحديد الإجابة
        input.addEventListener('change', () => saveAnswer());
        
        answersElement.appendChild(optionElement);
    });
    
    // تحديث حالة أزرار التنقل
    updateNavigationButtons();
}

// حفظ إجابة المستخدم
function saveAnswer() {
    const selectedOptions = [];
    const inputs = answersElement.querySelectorAll('input');
    
    inputs.forEach(input => {
        if (input.checked) {
            selectedOptions.push(parseInt(input.value));
        }
    });
    
    const question = currentQuestions[currentQuestionIndex];
    
    if (question.type === 'multiple') {
        userAnswers[currentQuestionIndex] = selectedOptions;
    } else {
        userAnswers[currentQuestionIndex] = selectedOptions.length > 0 ? selectedOptions[0] : null;
    }
}

// الانتقال للسؤال التالي
function showNextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

// العودة للسؤال السابق
function showPrevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// تحديث حالة أزرار التنقل
function updateNavigationButtons() {
    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = currentQuestionIndex === currentQuestions.length - 1;
    submitButton.style.display = currentQuestionIndex === currentQuestions.length - 1 ? 'block' : 'none';
}

// بدء المؤقت
function startTimer(duration) {
    let time = duration;
    updateTimerDisplay(time);
    
    timerInterval = setInterval(() => {
        time--;
        updateTimerDisplay(time);
        
        if (time <= 0) {
            clearInterval(timerInterval);
            showResults();
        }
    }, 1000);
}

// تحديث عرض المؤقت
function updateTimerDisplay(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // تغيير اللون عندما يقل الوقت عن 5 دقائق
    if (time < 300) { // 5 دقائق
        timerElement.classList.add('warning');
    }
}

// عرض النتائج
function showResults() {
    clearInterval(timerInterval);
    
    // حساب النتيجة
    let score = 0;
    let totalQuestions = currentQuestions.length;
    
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correctAnswer;
        
        if (question.type === 'multiple') {
            // مقارنة مصفوفات الإجابات للأسئلة متعددة الخيارات
            if (Array.isArray(userAnswer) && 
                userAnswer.length === correctAnswer.length &&
                userAnswer.every(val => correctAnswer.includes(val))) {
                score++;
            }
        } else {
            // مقارنة الإجابات للأسئلة ذات الخيار الواحد
            if (userAnswer === correctAnswer) {
                score++;
            }
        }
    });
    
    // إخفاء الاختبار وإظهار النتائج
    quizContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    // عرض النتيجة
    const percentage = Math.round((score / totalQuestions) * 100);
    scoreElement.textContent = `${score}/${totalQuestions} (${percentage}%)`;
    
    // عرض تقرير بالإجابات الصحيحة والخاطئة
    displayAnswerReport();
}

// عرض تقرير بالإجابات
function displayAnswerReport() {
    const reportElement = document.getElementById('answer-report');
    reportElement.innerHTML = '';
    
    currentQuestions.forEach((question, index) => {
        const questionReport = document.createElement('div');
        questionReport.className = 'question-report';
        
        const userAnswer = userAnswers[index];
        const correctAnswer = question.correctAnswer;
        
        let isCorrect = false;
        
        if (question.type === 'multiple') {
            isCorrect = Array.isArray(userAnswer) && 
                       userAnswer.length === correctAnswer.length &&
                       userAnswer.every(val => correctAnswer.includes(val));
        } else {
            isCorrect = userAnswer === correctAnswer;
        }
        
        questionReport.innerHTML = `
            <h4>سؤال ${index + 1}: ${isCorrect ? '✓ صحيح' : '✗ خاطئ'}</h4>
            <p>${question.question}</p>
            <p><strong>إجابتك:</strong> ${formatAnswer(userAnswer, question.options)}</p>
            <p><strong>الإجابة الصحيحة:</strong> ${formatAnswer(correctAnswer, question.options)}</p>
        `;
        
        reportElement.appendChild(questionReport);
    });
}

// تنسيق الإجابة لعرضها
function formatAnswer(answer, options) {
    if (answer === null || answer === undefined) {
        return 'لم تجب على هذا السؤال';
    }
    
    if (Array.isArray(answer)) {
        if (answer.length === 0) return 'لم تختر أي إجابة';
        return answer.map(idx => options[idx]).join('، ');
    }
    
    return options[answer];
}

// إعادة بدء الاختبار
function restartQuiz() {
    resultsContainer.style.display = 'none';
    subjectSelection.style.display = 'block';
    timerElement.classList.remove('warning');
}