
// Geoready/src/js/quiz_logic.js

let quizData = [];
let currentQuestionIndex = 0;
let score = 0;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function fetchQuizData() {
    try {
        const response = await fetch('/assets/data/quiz_data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        document.getElementById('message-area').innerHTML = "<h1>خطأ: تعذر تحميل البيانات.</h1>";
        return [];
    }
}

function loadQuestion() {
    document.getElementById('next-button').style.display = 'none';
    document.getElementById('message-area').innerText = '';

    if (currentQuestionIndex >= quizData.length) {
        finishQuiz();
        return;
    }

    const currentQuestion = quizData[currentQuestionIndex];
    
    document.getElementById('rock-image').src = `/assets/images/rochs/${currentQuestion.image}`;
    document.getElementById('rock-image').style.display = 'block';
    document.getElementById('question-text').innerText = "ما اسم هذه الصخرة؟";
    
    const allOptions = [...currentQuestion.distractors, currentQuestion.correct];
    shuffleArray(allOptions);
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    allOptions.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('option-button');
        button.onclick = () => checkAnswer(option, currentQuestion.correct, button);
        optionsContainer.appendChild(button);
    });
}

function checkAnswer(selectedOption, correctAnswer, clickedButton) {
    const isCorrect = selectedOption === correctAnswer;
    const allButtons = document.querySelectorAll('.option-button');
    const messageArea = document.getElementById('message-area');

    allButtons.forEach(btn => btn.disabled = true);
    document.getElementById('next-button').style.display = 'block';

    if (isCorrect) {
        score++;
        messageArea.innerText = "إجابة صحيحة! ✅";
        clickedButton.classList.add('correct');
        new Audio('/assets/sounds/correct.mp3').play();
    } else {
        messageArea.innerHTML = `إجابة خاطئة. الصحيحة هي: **${correctAnswer}** ❌`;
        clickedButton.classList.add('wrong');
        allButtons.forEach(btn => {
            if (btn.innerText === correctAnswer) {
                btn.classList.add('correct');
            }
        });
        new Audio('/assets/sounds/wrong.mp3').play();
    }
}

function finishQuiz() {
    const totalQuestions = quizData.length;
    document.getElementById('rock-image').style.display = 'none';
    document.getElementById('options-container').innerHTML = '';
    document.getElementById('question-text').innerText = "انتهى الاختبار! 🎉";
    document.getElementById('message-area').innerHTML = `لقد حصلت على **${score}** من **${totalQuestions}** نقطة.`;
    document.getElementById('next-button').style.display = 'none';
    new Audio('/assets/sounds/perfect.mp3').play();
}

document.getElementById('next-button').addEventListener('click', () => {
    currentQuestionIndex++;
    loadQuestion();
});

async function initializeQuiz() {
    quizData = await fetchQuizData();
    if (quizData.length > 0) {
        shuffleArray(quizData);
        loadQuestion();
    } else {
        document.getElementById('question-text').innerText = "جاري تحميل البيانات...";
    }
}

initializeQuiz();
