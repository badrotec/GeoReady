
let currentSubject = '';
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};
let timerInterval;

// عناصر واجهة المستخدم (DOM)
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const finalResultsScreen = document.getElementById('final-results-screen');

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const progressText = document.getElementById('progress-text');
const timerElement = document.getElementById('timer');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreDisplay = document.getElementById('final-score-display');
const answersReviewContainer = document.getElementById('answers-review');

// ⏱️ بدء المؤقت
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

    if (time < 300) {
        timerElement.classList.add('warning');
    }
}

// 🎯 بدء الاختبار عند اختيار المادة
document.querySelectorAll('.subject-btn').forEach(button => {
    button.addEventListener('click', async () => {
        const subject = button.getAttribute('data-subject');
        await startQuiz(subject);
    });
});

async function startQuiz(subject) {
    currentSubject = subject;
    currentQuestionIndex = 0;
    userAnswers = {};

    try {
        // ✅ تم تصحيح المسار — تحميل الملف مباشرة من نفس المستوى
        const response = await fetch(`${subject}.json`);
        currentQuestions = await response.json();

        // عرض شاشة الاختبار
        welcomeScreen.classList.remove('active');
        quizScreen.classList.add('active');

        // بدء المؤقت (30 دقيقة)
        startTimer(30 * 60);

        // عرض أول سؤال
        showQuestion();

    } catch (error) {
        console.error('❌ خطأ في تحميل الأسئلة:', error);
        alert('حدث خطأ أثناء تحميل الأسئلة. تأكد أن ملف JSON موجود.');
    }
}

// 🧠 عرض السؤال الحالي
function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;

        // تمييز الإجابة المختارة
        if (userAnswers[currentQuestionIndex] === index) {
            button.classList.add('selected');
        }

        button.addEventListener('click', () => {
            userAnswers[currentQuestionIndex] = index;
            showQuestion(); // لإعادة تحديث التحديد
        });

        optionsContainer.appendChild(button);
    });

    // تحديث النص السفلي للتقدم
    progressText.textContent = `السؤال ${currentQuestionIndex + 1} من ${currentQuestions.length}`;

    // التحكم في الأزرار
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === currentQuestions.length - 1;
    submitBtn.style.display = currentQuestionIndex === currentQuestions.length - 1 ? 'block' : 'none';
}

// ➡️ التالي
nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
});

// ⬅️ السابق
prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
});

// ✅ عرض النتائج النهائية
submitBtn.addEventListener('click', showResults);

function showResults() {
    clearInterval(timerInterval);

    let score = 0;
    currentQuestions.forEach((q, i) => {
        if (userAnswers[i] === q.correctAnswer) {
            score++;
        }
    });

    const percentage = Math.round((score / currentQuestions.length) * 100);
    finalScoreDisplay.textContent = `${score}/${currentQuestions.length} (${percentage}%)`;

    // عرض مراجعة الإجابات
    answersReviewContainer.innerHTML = '';
    currentQuestions.forEach((q, i) => {
        const div = document.createElement('div');
        div.className = 'review-item';
        const userAnswer = userAnswers[i] !== undefined ? q.options[userAnswers[i]] : 'لم تُجب';
        const correctAnswer = q.options[q.correctAnswer];
        div.innerHTML = `
            <p><strong>س${i + 1}:</strong> ${q.question}</p>
            <p>إجابتك: <span class="${userAnswer === correctAnswer ? 'correct' : 'wrong'}">${userAnswer}</span></p>
            <p>الإجابة الصحيحة: <span class="correct">${correctAnswer}</span></p>
        `;
        answersReviewContainer.appendChild(div);
    });

    quizScreen.classList.remove('active');
    finalResultsScreen.classList.add('active');
}

// 🔄 إعادة الاختبار
restartBtn.addEventListener('click', () => {
    finalResultsScreen.classList.remove('active');
    welcomeScreen.classList.add('active');
    timerElement.classList.remove('warning');
});