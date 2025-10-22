// المتغير الذي سيخزن جميع الأسئلة بعد تحميلها
let allQuestions = [];

// دالة لتحميل الأسئلة من ملف questions.json
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        
        // تجميع جميع الأسئلة من جميع الأقسام في مصفوفة واحدة، لسهولة الوصول
        data.forEach(section => {
            section.questions.forEach(question => {
                // إضافة اسم القسم إلى السؤال لتسهيل عرضه
                question.sectionTitle = section.section;
                allQuestions.push(question);
            });
        });

        displayQuestions();
    } catch (error) {
        console.error('خطأ في تحميل ملف الأسئلة:', error);
        document.getElementById('quiz-container').innerHTML = '<p style="color:red; text-align:center;">تعذر تحميل الأسئلة. تأكد من وجود ملف questions.json</p>';
    }
}

// دالة لعرض الأسئلة في صفحة HTML
function displayQuestions() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    let currentSection = '';

    allQuestions.forEach((q, questionIndex) => {
        // عرض عنوان القسم إذا كان مختلفًا عن القسم السابق
        if (q.sectionTitle !== currentSection) {
            container.innerHTML += `<h2 class="section-title">${q.sectionTitle}</h2>`;
            currentSection = q.sectionTitle;
        }

        let questionHTML = `
            <div class="question-card" data-question-index="${questionIndex}">
                <p class="question-text">${questionIndex + 1}. ${q.question}</p>
                <div class="options-container">
        `;

        // عرض خيارات الإجابة
        q.options.forEach((option, optionIndex) => {
            // استخدام اسم فريد لكل مجموعة من أزرار الراديو بناءً على فهرس السؤال
            const radioName = `q${questionIndex}`;
            const inputId = `q${questionIndex}o${optionIndex}`;
            
            questionHTML += `
                <label for="${inputId}" class="option-label">
                    <input type="radio" id="${inputId}" name="${radioName}" value="${optionIndex}">
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

// دالة لمعالجة إرسال الاختبار وعرض النتيجة
window.submitQuiz = function() {
    let score = 0;
    const totalQuestions = allQuestions.length;
    const resultsDiv = document.getElementById('results');
    const questionCards = document.querySelectorAll('.question-card');
    
    questionCards.forEach((card, questionIndex) => {
        const questionData = allQuestions[questionIndex];
        const selectedOption = card.querySelector(`input[name="q${questionIndex}"]:checked`);
        const optionsLabels = card.querySelectorAll('.option-label');
        
        // إزالة أي تصنيفات سابقة (لإعادة الاختبار إذا أردنا)
        optionsLabels.forEach(label => label.classList.remove('correct-answer', 'wrong-answer', 'user-selected'));
        
        // تحديد الإجابة الصحيحة ووضع علامة عليها
        const correctAnswerLabel = optionsLabels[questionData.correct];
        correctAnswerLabel.classList.add('correct-answer');

        if (selectedOption) {
            const selectedValue = parseInt(selectedOption.value);
            const userSelectedLabel = selectedOption.closest('.option-label');

            // وضع علامة على إجابة المستخدم
            userSelectedLabel.classList.add('user-selected');

            if (selectedValue === questionData.correct) {
                // الإجابة صحيحة
                score++;
                userSelectedLabel.classList.remove('wrong-answer');
            } else {
                // الإجابة خاطئة
                userSelectedLabel.classList.add('wrong-answer');
            }
        }
        
        // تعطيل جميع الخيارات لمنع التغيير بعد الإرسال
        card.querySelectorAll('input[type="radio"]').forEach(input => input.disabled = true);
    });

    // عرض النتيجة
    resultsDiv.style.display = 'block';
    const percentage = ((score / totalQuestions) * 100).toFixed(2);
    resultsDiv.innerHTML = `
        <p>✅ النتيجة النهائية: ${score} من أصل ${totalQuestions} سؤال.</p>
        <p>📊 نسبة النجاح: ${percentage}%</p>
        <p>تم تمييز الإجابات الصحيحة باللون الأخضر.</p>
    `;
    
    // التمرير إلى قسم النتائج
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// تشغيل دالة تحميل الأسئلة عند تحميل الصفحة
loadQuestions();
