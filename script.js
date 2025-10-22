// =================================================================
// 1. تحديد العناصر الأساسية وحالة اللعبة
// =================================================================
const homeScreen = document.getElementById('home-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');

const categoryBtns = document.querySelectorAll('.category-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');

// الإحصائيات والمؤقت
const timerDisplay = document.getElementById('timer-display');
const currentQIndexDisplay = document.getElementById('current-question-index');
const totalQDisplay = document.getElementById('total-questions');
const progressBarFill = document.getElementById('progress-bar-fill');
const quizTitle = document.getElementById('quiz-title');

// النتائج
const resultCategory = document.getElementById('result-category');
const scoreCorrect = document.getElementById('score-correct');
const scorePercentage = document.getElementById('score-percentage');
const resultMessage = document.getElementById('result-message');
const restartBtn = document.querySelector('.restart-btn');

// ملفات الصوت
const correctSound = document.getElementById('correctSound');
const incorrectSound = document.getElementById('incorrectSound');

let currentQuizData = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let timeElapsed = 0;


// =================================================================
// 2. دوال التحويل بين الشاشات
// =================================================================

/**
 * تبديل الشاشة النشطة
 * @param {string} targetId - معرف الشاشة الهدف
 */
function switchScreen(targetId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(targetId).classList.add('active');
}

// =================================================================
// 3. دالة بدء الاختبار
// =================================================================

/**
 * يبدأ الاختبار بناءً على الفئة المختارة (اسم ملف JSON)
 * @param {string} filename - اسم ملف JSON (مثل 'Basic Geology.json')
 * @param {string} categoryName - اسم الفئة للعرض
 */
async function startQuiz(filename, categoryName) {
    try {
        // تحميل ملف الأسئلة
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        currentQuizData = await response.json();

        // إعداد حالة الاختبار
        currentQuestionIndex = 0;
        score = 0;
        timeElapsed = 0;
        
        quizTitle.textContent = categoryName;
        totalQDisplay.textContent = currentQuizData.length;

        // بدء المؤقت وعرض السؤال الأول
        startTimer();
        switchScreen('quiz-screen');
        displayQuestion();

    } catch (error) {
        console.error('Error starting quiz:', error);
        alert('حدث خطأ في تحميل الأسئلة. تأكد من وجود ملف JSON الصحيح.');
        switchScreen('home-screen');
    }
}

// =================================================================
// 4. دالة عرض السؤال
// =================================================================

function displayQuestion() {
    // التأكد من وجود أسئلة
    if (currentQuestionIndex >= currentQuizData.length) {
        showResults();
        return;
    }

    const question = currentQuizData[currentQuestionIndex];
    questionText.textContent = question.question;
    optionsContainer.innerHTML = '';
    nextBtn.disabled = true; // تعطيل زر التالي حتى تتم الإجابة

    // تحديث شريط التقدم والإحصائيات
    currentQIndexDisplay.textContent = currentQuestionIndex + 1;
    updateProgressBar();
    
    // إنشاء أزرار الخيارات
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option-btn');
        button.onclick = () => handleAnswer(button, option, question.answer);
        optionsContainer.appendChild(button);
    });
}

// =================================================================
// 5. دالة معالجة الإجابة
// =================================================================

/**
 * معالجة الإجابة عند الضغط على زر الخيار
 * @param {HTMLElement} selectedButton - زر الخيار الذي تم الضغط عليه
 * @param {string} selectedOption - نص الخيار الذي تم اختياره
 * @param {string} correctAnswer - الإجابة الصحيحة
 */
function handleAnswer(selectedButton, selectedOption, correctAnswer) {
    const isCorrect = (selectedOption === correctAnswer);

    // تعطيل جميع الأزرار بعد الإجابة لمنع التغيير
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

    if (isCorrect) {
        score++;
        selectedButton.classList.add('correct');
        playAudio(correctSound);
    } else {
        selectedButton.classList.add('incorrect');
        playAudio(incorrectSound);
        // تمييز الإجابة الصحيحة
        Array.from(optionsContainer.children).forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }

    nextBtn.disabled = false; // تفعيل زر التالي
}

// =================================================================
// 6. دالة المضي إلى السؤال التالي
// =================================================================

function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion();
}

// =================================================================
// 7. دالة عرض النتائج
// =================================================================

function showResults() {
    clearInterval(timerInterval); // إيقاف المؤقت

    const totalQuestions = currentQuizData.length;
    const percentage = ((score / totalQuestions) * 100).toFixed(0) + '%';
    
    // عرض النتائج
    resultCategory.textContent = quizTitle.textContent;
    scoreCorrect.textContent = `${score} من ${totalQuestions}`;
    scorePercentage.textContent = percentage;

    // رسالة تحفيزية
    if (score / totalQuestions >= 0.8) {
        resultMessage.textContent = 'مستوى ممتاز! أنت جاهز للانطلاق في المجال الجيولوجي. 🚀';
    } else if (score / totalQuestions >= 0.5) {
        resultMessage.textContent = 'مستوى جيد. تحتاج لمراجعة بعض النقاط لتعزيز معلوماتك. 💪';
    } else {
        resultMessage.textContent = 'تحتاج لمزيد من المراجعة والتدريب. لا تستسلم! 📚';
    }

    switchScreen('results-screen');
}

// =================================================================
// 8. دوال الأدوات الإضافية (المؤقت، التقدم، الصوت)
// =================================================================

function startTimer() {
    timeElapsed = 0;
    // تحديث المؤقت كل ثانية
    timerInterval = setInterval(() => {
        timeElapsed++;
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        
        // تنسيق الوقت (00:00)
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerDisplay.textContent = formattedTime;
    }, 1000);
}

function updateProgressBar() {
    const total = currentQuizData.length;
    const progress = (currentQuestionIndex / total) * 100;
    progressBarFill.style.width = progress + '%';
}

function playAudio(audioElement) {
    audioElement.currentTime = 0; // إعادة الصوت من البداية إذا تم تشغيله بسرعة
    audioElement.play();
}

// =================================================================
// 9. الاستماع للأحداث (EventListeners)
// =================================================================

// 1. اختيار الفئة
categoryBtns.forEach(button => {
    button.addEventListener('click', () => {
        const filename = button.getAttribute('data-category');
        const categoryName = button.textContent.trim().replace(/[\uD800-\uDBFF\uDC00-\uDFFF]/g, '').trim(); // إزالة الإيموجي لتسمية نظيفة
        startQuiz(filename, categoryName);
    });
});

// 2. زر السؤال التالي
nextBtn.addEventListener('click', nextQuestion);

// 3. زر العودة للرئيسية
restartBtn.addEventListener('click', () => {
    switchScreen('home-screen');
});
