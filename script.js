// حالة التطبيق
const appState = {
    currentSubject: null,
    userStats: {
        totalScore: 0,
        totalTests: 0,
        completedSubjects: [],
        subjectScores: {}
    },
    subjects: {
        basic: {
            name: "الجيولوجيا الأساسية",
            icon: "fas fa-mountain",
            description: "أساسيات علم الأرض والصخور والمعادن",
            difficulty: "beginner"
        },
        geochemistry: {
            name: "الجيوكيمياء", 
            icon: "fas fa-flask",
            description: "التركيب الكيميائي للصخور والمعادن",
            difficulty: "intermediate"
        },
        geophysics: {
            name: "الجيوفيزياء",
            icon: "fas fa-satellite-dish", 
            description: "دراسة باطن الأرض بالطرق الفيزيائية",
            difficulty: "advanced"
        },
        hydrogeology: {
            name: "الهيدروجيولوجيا",
            icon: "fas fa-water",
            description: "علم المياه الجوفية وحركتها", 
            difficulty: "intermediate"
        },
        petrology: {
            name: "علم الصخور",
            icon: "fas fa-gem",
            description: "دراسة أنواع الصخور وتكوينها",
            difficulty: "beginner"
        },
        structural: {
            name: "الجيولوجيا التركيبية",
            icon: "fas fa-layer-group",
            description: "الطيات والصدوع والتراكيب الأرضية",
            difficulty: "advanced"
        },
        sedimentary: {
            name: "جيولوجيا الرواسب", 
            icon: "fas fa-hill-rockslide",
            description: "الصخور الرسوبية وعمليات الترسيب",
            difficulty: "intermediate"
        },
        petroleum: {
            name: "الجيولوجيا البترولية",
            icon: "fas fa-oil-well",
            description: "استكشاف وتكوين النفط والغاز",
            difficulty: "advanced"
        },
        applied: {
            name: "الجيولوجيا التطبيقية",
            icon: "fas fa-hammer",
            description: "التطبيقات العملية للجيولوجيا",
            difficulty: "intermediate"
        }
    }
};

// عناصر DOM
const elements = {
    // الشاشات
    loadingScreen: document.getElementById('loading-screen'),
    mainScreen: document.getElementById('main-screen'),
    preQuizScreen: document.getElementById('pre-quiz-screen'),
    quizScreen: document.getElementById('quiz-screen'),
    resultsScreen: document.getElementById('results-screen'),
    
    // الإحصائيات
    totalScore: document.getElementById('total-score'),
    totalTests: document.getElementById('total-tests'),
    
    // شاشة التحضير
    prepSubjectIcon: document.getElementById('prep-subject-icon'),
    prepSubjectName: document.getElementById('prep-subject-name'),
    prepSubjectDesc: document.getElementById('prep-subject-desc'),
    backToMain: document.getElementById('back-to-main'),
    prepCancel: document.getElementById('prep-cancel'),
    prepStart: document.getElementById('prep-start')
};

// الأصوات
const sounds = {
    click: document.getElementById('click-sound'),
    hover: document.getElementById('hover-sound'),
    success: document.getElementById('success-sound')
};

// تهيئة التطبيق
function initApp() {
    // تحميل الإحصائيات من التخزين المحلي
    loadUserStats();
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
    
    // بدء تسلسل التحميل
    startLoadingSequence();
}

// تسلسل التحميل
function startLoadingSequence() {
    setTimeout(() => {
        elements.loadingScreen.classList.remove('active');
        elements.mainScreen.classList.add('active');
        playSound('success');
    }, 3000);
}

// تحميل إحصائيات المستخدم
function loadUserStats() {
    const savedStats = localStorage.getItem('geologyLabStats');
    if (savedStats) {
        appState.userStats = JSON.parse(savedStats);
    }
    updateStatsDisplay();
}

// حفظ إحصائيات المستخدم
function saveUserStats() {
    localStorage.setItem('geologyLabStats', JSON.stringify(appState.userStats));
}

// تحديث عرض الإحصائيات
function updateStatsDisplay() {
    elements.totalScore.textContent = appState.userStats.totalScore;
    elements.totalTests.textContent = appState.userStats.totalTests;
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // بطاقات التخصصات
    document.querySelectorAll('.subject-card').forEach(card => {
        card.addEventListener('click', handleSubjectSelection);
        card.addEventListener('mouseenter', () => playSound('hover'));
    });
    
    // أزرار شاشة التحضير
    elements.backToMain.addEventListener('click', () => showScreen('main-screen'));
    elements.prepCancel.addEventListener('click', () => showScreen('main-screen'));
    elements.prepStart.addEventListener('click', startQuiz);
    
    // تأثيرات الصوت للأزرار
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => playSound('click'));
    });
}

// معالجة اختيار التخصص
function handleSubjectSelection(event) {
    const subject = event.currentTarget.dataset.subject;
    appState.currentSubject = subject;
    
    // تحديث شاشة التحضير
    updatePrepScreen(subject);
    
    // الانتقال لشاشة التحضير
    showScreen('pre-quiz-screen');
    
    playSound('click');
}

// تحديث شاشة التحضير
function updatePrepScreen(subject) {
    const subjectInfo = appState.subjects[subject];
    
    elements.prepSubjectIcon.innerHTML = `<i class="${subjectInfo.icon}"></i>`;
    elements.prepSubjectName.textContent = subjectInfo.name;
    elements.prepSubjectDesc.textContent = subjectInfo.description;
}

// بدء الاختبار
function startQuiz() {
    playSound('success');
    // هنا سيتم الانتقال لشاشة الاختبار الفعلية
    // showScreen('quiz-screen');
    
    // مؤقت مؤقت للعودة للرئيسية
    setTimeout(() => {
        showScreen('main-screen');
        
        // تحديث الإحصائيات (مؤقت)
        appState.userStats.totalTests++;
        appState.userStats.totalScore += Math.floor(Math.random() * 100);
        saveUserStats();
        updateStatsDisplay();
    }, 2000);
}

// تشغيل الصوت
function playSound(type) {
    if (sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].play().catch(() => {
            // تجاهل الأخطاء إذا لم يتمكن المتصفح من تشغيل الصوت
        });
    }
}

// عرض شاشة محددة
function showScreen(screenId) {
    // إخفاء جميع الشاشات
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // عرض الشاشة المطلوبة
    document.getElementById(screenId).classList.add('active');
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);

// تأثيرات إضافية للتفاعل
document.addEventListener('mousemove', (e) => {
    const rocks = document.querySelectorAll('.rock');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    rocks.forEach((rock, index) => {
        const speed = (index + 1) * 0.5;
        const xMove = (x - 0.5) * speed * 10;
        const yMove = (y - 0.5) * speed * 10;
        
        rock.style.transform = `translate(${xMove}px, ${yMove}px)`;
    });
});