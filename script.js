// **=================================================**
// ** ملف: script.js (المنطق النهائي) - يحتاج Question.json **
// **=================================================**

// [1] المتغيرات العالمية والتحكم
let geologicalData = {}; 
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let timerInterval;
const TIME_LIMIT = 20;
const POINTS_CORRECT = 5;
const POINTS_WRONG = -3;
let currentLanguage = 'ar';

const translations = {
    'ar': {
        'start_quiz': 'ابدأ الاختبار',
        'choose_domain': 'اختر مجال الاختبار:',
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
        'timer_text': 'ث'
    },
    'en': {
        'start_quiz': 'Start Quiz',
        'choose_domain': 'Choose Quiz Domain:',
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
        'timer_text': 's'
    },
    'fr': {
        'start_quiz': 'Commencer le Quiz',
        'choose_domain': 'Choisissez un domaine de Quiz:',
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
        'timer_text': 's'
    }
};

// ---------------------- 2. دالة تحميل البيانات (الجديدة) ----------------------

async function loadGeologyData() {
    const loadingMessage = document.getElementById('loading-message');
    try {
        loadingMessage.textContent = '... جاري تحميل بيانات النظام';
        
        const response = await fetch('./Question.json'); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        geologicalData = await response.json();
        
        initializeTopicSelection(geologicalData); 

    } catch (error) {
        console.error("فشل في تحميل بيانات الجيولوجيا:", error);
        loadingMessage.textContent = `[خطأ الاتصال] عذراً، لا يمكن تحميل البيانات.`;
        document.getElementById('start-quiz-btn').disabled = true;
    }
}

// ---------------------- 3. منطق المؤقت والتحكم ----------------------

function startTimer() {
    clearInterval(timerInterval);
    let timeRemaining = TIME_LIMIT;
    const timerDisplay = document.getElementById('timer-display');
    const progressBar = document.getElementById('progress-bar-fill');
    const t = translations[currentLanguage];

    progressBar.style.width = '100%';
    timerDisplay.textContent = `${timeRemaining}${t.timer_text}`;

    timerInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = `${timeRemaining}${t.timer_text}`;
        
        const progressPercentage = (timeRemaining / TIME_LIMIT) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // تغيير لون المؤقت كإنذار
        if (timeRemaining <= 5) {
            timerDisplay.style.color = 'var(--incorrect-color)';
        } else {
            timerDisplay.style.color = 'var(--neon-blue)';
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            handleTimeout();
        }
    }, 1000);
}

function handleTimeout() {
    const t = translations[currentLanguage];
    const currentQ = currentQuestions[currentQuestionIndex];

    score += POINTS_WRONG; 
    
    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: `(Timeout - ${t.correct_answer}: ${currentQ.answer})`,
        correctAnswer: currentQ.answer,
        isCorrect: false,
    };
    
    document.querySelectorAll('.option-label').forEach(label => {
        label.querySelector('input').disabled = true;
        if (label.querySelector('input').value === currentQ.answer) {
            label.classList.add('correct'); 
        }
    });

    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 1000);
}

// دالة الترجمة وتحديث الواجهة
function translateUI(langCode) {
    currentLanguage = langCode;
    const t = translations[langCode] || translations['ar'];

    document.getElementById('start-quiz-btn').innerHTML = `${t.start_quiz} <i class="fas fa-satellite-dish"></i>`;
    document.getElementById('submit-btn').innerHTML = `${t.submit} <i class="fas fa-terminal"></i>`;
    document.getElementById('next-btn').innerHTML = `<i class="fas fa-arrow-right"></i> ${t.next}`;
    document.querySelector('#topics-list-container h3').textContent = t.choose_domain;
    document.querySelector('#results-screen .large-btn').innerHTML = `${t.new_quiz} <i class="fas fa-redo-alt"></i>`;
    
    if (!document.getElementById('quiz-screen').classList.contains('hidden')) {
        document.getElementById('timer-display').textContent = `${TIME_LIMIT}${t.timer_text}`;
        document.getElementById('question-counter').textContent = `${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        document.querySelector('.review-log h3').textContent = t.review_errors;
    }
}

function changeLanguage(langCode) {
    translateUI(langCode);
}

// ---------------------- 4. التهيئة ومنطق بدء التشغيل ----------------------

// التحكم في القائمة الجانبية
document.getElementById('open-sidebar-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('overlay').style.display = 'block';
});
document.getElementById('close-sidebar-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display = 'none';
});

// إضافة حدث زر "ابدأ"
document.getElementById('start-quiz-btn').addEventListener('click', () => {
    document.getElementById('start-quiz-btn').classList.add('hidden');
    document.getElementById('topics-list-container').classList.remove('hidden');
});


function initializeTopicSelection(data) {
    const topicsList = document.getElementById('topics-list'); 
    const sidebarList = document.getElementById('sidebar-topics-list');
    const loadingMessage = document.getElementById('loading-message');

    if (loadingMessage) loadingMessage.classList.add('hidden');
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
        
        const startQuizHandler = () => {
            startQuiz(topicDisplayName, data[topic]);
            document.getElementById('sidebar').classList.remove('open'); 
            document.getElementById('overlay').style.display = 'none';
        };
        
        gridCard.addEventListener('click', startQuizHandler);
        sidebarLink.addEventListener('click', startQuizHandler);
        
        topicsList.appendChild(gridCard);
        sidebarList.appendChild(sidebarLink); 
    });
    
    translateUI(currentLanguage);
}

// ---------------------- 5. منطق الاختبار ----------------------

function startQuiz(topicTitle, questions) {
    clearInterval(timerInterval);
    
    currentQuestions = questions;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};

    document.getElementById('topic-selection').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('quiz-title').textContent = `اختبار: ${topicTitle}`;

    displayQuestion();
}

function displayQuestion() {
    clearInterval(timerInterval); 
    const qContainer = document.getElementById('question-container');
    const currentQ = currentQuestions[currentQuestionIndex];
    const t = translations[currentLanguage];

    if (!currentQ) {
        return showResults();
    }
    
    startTimer();
    
    document.getElementById('question-counter').textContent = 
        `${t.question} ${currentQuestionIndex + 1} / ${currentQuestions.length}`;

    let htmlContent = `<p class="question-text">${currentQ.question}</p>`;
    htmlContent += '<div class="options-container">';

    currentQ.options.forEach((option) => {
        htmlContent += `
            <label class="option-label">
                <input type="radio" name="option" value="${option}">
                <span class="option-text">${option}</span>
            </label>
        `;
    });
    htmlContent += '</div>';
    qContainer.innerHTML = htmlContent;
    
    document.getElementById('submit-btn').classList.remove('hidden');
    document.getElementById('next-btn').classList.add('hidden');
    document.getElementById('submit-btn').disabled = true;

    // تمكين زر الإرسال عند اختيار خيار
    document.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => {
            document.getElementById('submit-btn').disabled = false;
        });
    });
}

// ---------------------- 6. معالجة الإجابة ----------------------

document.getElementById('submit-btn').addEventListener('click', () => {
    clearInterval(timerInterval); 
    
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) return;

    const currentQ = currentQuestions[currentQuestionIndex];
    const userAnswer = selectedOption.value;
    const isCorrect = (userAnswer === currentQ.answer);
    
    if (isCorrect) {
        score += POINTS_CORRECT;
    } else {
        score += POINTS_WRONG;
    }

    userAnswers[currentQ.id || currentQuestionIndex] = {
        question: currentQ.question,
        userAnswer: userAnswer,
        correctAnswer: currentQ.answer,
        isCorrect: isCorrect,
    };

    document.querySelectorAll('.option-label').forEach(label => {
        const input = label.querySelector('input');
        input.disabled = true; 

        if (input.value === currentQ.answer) {
            label.classList.add('correct'); 
        } else if (input.value === userAnswer && !isCorrect) {
            label.classList.add('incorrect'); 
        }
    });

    document.getElementById('submit-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
});

// ---------------------- 7. عرض النتائج ----------------------

function showResults() {
    clearInterval(timerInterval); 
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');

    document.getElementById('final-score').textContent = score;
    document.getElementById('total-questions-count').textContent = currentQuestions.length;

    const percentage = (score / currentQuestions.length) * 100;
    const gradeMessage = document.getElementById('grade-message');
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

    const reviewArea = document.getElementById('review-area');
    reviewArea.innerHTML = `<h3>${t.review_errors}</h3>`;
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
        reviewArea.innerHTML += '<p class="all-correct">🎉 ممتاز! لا توجد أخطاء لمراجعتها.</p>';
    }
}

// تشغيل التهيئة: يبدأ بتحميل البيانات من Question.json
loadGeologyData();
