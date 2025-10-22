:root {
    --primary-color: #00bcd4; /* أزرق سماوي/تركوازي جذاب */
    --secondary-color: #ff9800; /* برتقالي ذهبي للتأكيد */
    --background-dark: #1e1e2d; /* خلفية داشبورد داكنة */
    --card-bg: #2b2b3b; /* خلفية البطاقة الداكنة */
    --text-light: #f0f8ff;
    --success: #8bc34a;
    --danger: #ff5252;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Cairo', sans-serif;
    background-color: var(--background-dark);
    color: var(--text-light);
    direction: rtl;
    text-align: right;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    /* خلفية شبكية خفيفة لتحسين شكل الواجهة الداكنة */
    background-image: linear-gradient(0deg, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
    background-size: 80px 80px;
    background-color: var(--background-dark);
}

/* الهيكل العام */
.container {
    width: 100%;
    max-width: 1100px;
    background-color: var(--card-bg);
    border-radius: 15px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    padding: 30px 40px;
    border: 3px solid var(--primary-color);
}

header {
    text-align: center;
    margin-bottom: 30px;
}

.logo {
    font-family: 'Orbitron', sans-serif;
    font-size: 2.8em;
    color: var(--primary-color);
    text-shadow: 0 0 15px var(--primary-color);
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 10px;
    display: inline-block;
}

h2 {
    color: var(--secondary-color);
    text-align: center;
    margin-bottom: 30px;
    font-weight: 900;
}

/* إدارة الشاشات والحركات */
.screen {
    display: none;
    animation: fadeIn 0.5s ease-out;
}
.screen.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* رسالة التحميل */
.loading-msg {
    text-align: center;
    font-size: 1.2em;
    color: #95a5a6;
    margin-top: 50px;
}

/* شاشة اختيار المستويات */
.grid-levels {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
}

.level-card {
    background-color: #3b3b54;
    padding: 25px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s;
    border-left: 5px solid var(--secondary-color);
    text-align: center;
    font-weight: 700;
    font-size: 1.1em;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.level-card:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
    border-left-color: var(--primary-color);
}

.tagline {
    text-align: center;
    margin-top: 40px;
    font-size: 1.1em;
    color: #95a5a6;
}

/* شاشة الاختبار */
.quiz-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    margin-bottom: 20px;
}

.level-badge {
    background-color: var(--secondary-color);
    padding: 8px 15px;
    border-radius: 50px;
    font-weight: 700;
    color: var(--background-dark);
}

/* المؤقت بتأثير نيون */
.timer {
    font-family: 'Orbitron', sans-serif;
    font-size: 2em;
    color: var(--primary-color);
    text-shadow: 0 0 10px var(--primary-color), 0 0 20px rgba(0, 188, 212, 0.5);
    padding: 5px 10px;
    border: 2px solid var(--primary-color);
    border-radius: 5px;
    transition: color 0.3s;
}
.timer.danger {
    color: var(--danger) !important;
    text-shadow: 0 0 10px var(--danger), 0 0 20px rgba(255, 82, 82, 0.5);
    animation: flash 1s infinite;
}
@keyframes flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* شريط التقدم */
#progress-bar-container {
    height: 8px;
    background-color: #3b3b54;
    border-radius: 4px;
    margin-bottom: 30px;
    overflow: hidden;
}

#progress-bar {
    height: 100%;
    width: 0%;
    background-color: var(--success);
    transition: width 0.4s ease-in-out;
}

/* بطاقة السؤال */
.question-card {
    background-color: #3b3b54;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    border: 1px solid #444;
}

.question-text {
    font-size: 1.4em;
    margin-bottom: 25px;
    font-weight: 700;
    color: var(--primary-color);
}

/* خيارات الإجابة */
.option-label {
    display: block;
    padding: 15px;
    margin: 12px 0;
    border: 2px solid #555;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    background-color: #313142;
    position: relative;
}

.option-label:hover {
    background-color: #3b3b54;
    border-color: var(--secondary-color);
}

.option-label input[type="radio"] {
    display: none;
}

/* تصحيح الإجابات */
.correct-answer {
    background-color: var(--success) !important;
    border-color: var(--success) !important;
    color: var(--background-dark);
    font-weight: 700;
    animation: pulseCorrect 0.5s;
}

.wrong-answer {
    background-color: var(--danger) !important;
    border-color: var(--danger) !important;
    color: var(--background-dark);
    font-weight: 700;
    animation: shake 0.5s;
}

/* الأزرار التفاعلية */
.action-btn {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 10px;
    font-size: 1.2em;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 20px;
    background-color: var(--primary-color);
    color: var(--background-dark);
}

.action-btn:hover:not(:disabled) {
    background-color: #00a4b8;
    box-shadow: 0 0 20px var(--primary-color);
}

.action-btn:disabled {
    background-color: #555;
    cursor: not-allowed;
    color: #ccc;
    box-shadow: none;
}

.next-btn {
    background-color: var(--secondary-color);
    color: var(--background-dark);
}
.next-btn:hover:not(:disabled) {
    background-color: #e68a00;
    box-shadow: 0 0 20px var(--secondary-color);
}

.feedback-msg {
    text-align: center;
    margin-top: 15px;
    padding: 10px;
    border-radius: 5px;
    font-size: 1.1em;
    font-weight: 700;
    display: none;
}
.feedback-msg[style*="success"] { background-color: rgba(139, 195, 74, 0.2); }
.feedback-msg[style*="danger"] { background-color: rgba(255, 82, 82, 0.2); }

/* شاشة النتائج */
.results-box {
    background-color: #3b3b54;
    padding: 40px;
    border-radius: 10px;
    text-align: center;
    border: 2px solid var(--secondary-color);
}

.results-title {
    font-family: 'Orbitron', sans-serif;
    color: var(--success);
    font-size: 2.5em;
    margin-bottom: 25px;
    text-shadow: 0 0 10px var(--success);
}

.score-summary p {
    font-size: 1.2em;
    color: #ccc;
}

.final-score-display {
    font-family: 'Orbitron', sans-serif;
    font-size: 4em;
    color: var(--secondary-color);
    display: block;
    margin: 15px 0 25px;
    text-shadow: 0 0 15px var(--secondary-color);
}

#restart-btn {
    width: 50%;
    margin-top: 30px;
    background-color: var(--primary-color);
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-5px); }
    40%, 80% { transform: translateX(5px); }
}
@keyframes pulseCorrect {
    0% { box-shadow: 0 0 0 0 rgba(139, 195, 74, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(139, 195, 74, 0); }
    100% { box-shadow: 0 0 0 0 rgba(139, 195, 74, 0); }
}
