// الملف الرئيسي للتطبيق
class GeoLearnApp {
    constructor() {
        this.currentPage = 'home';
        this.quizzes = [];
        this.init();
    }

    async init() {
        await this.loadQuizzes();
        this.renderQuizzes();
        this.setupEventListeners();
        this.loadUserProgress();
        
        // تحميل تفضيلات المستخدم
        this.loadUserPreferences();
    }

    async loadQuizzes() {
        const quizIds = [
            'basic_geology', 'petrology', 'hydrogeology', 'geophysics', 'field_work',
            'structural_geo', 'historical_geo', 'environmental_geo', 'mining_geology', 'engineering_geo'
        ];

        for (const quizId of quizIds) {
            try {
                const quiz = await quizEngine.loadQuiz(quizId);
                this.quizzes.push(quiz);
            } catch (error) {
                console.error(`Failed to load quiz: ${quizId}`, error);
            }
        }
    }

    renderQuizzes() {
        const container = document.getElementById('quizzes-container');
        
        container.innerHTML = this.quizzes.map(quiz => `
            <div class="quiz-card" onclick="geoLearnApp.startQuiz('${quiz.id}')">
                <div class="quiz-icon">${quiz.icon}</div>
                <h3 class="quiz-title">${quiz.name[languageManager.currentLanguage]}</h3>
                <p class="quiz-description">${quiz.description[languageManager.currentLanguage]}</p>
                <div class="quiz-meta">
                    <span>${quiz.questions.length} أسئلة</span>
                    <span class="quiz-level level-${quiz.level}">${this.getLevelText(quiz.level)}</span>
                </div>
            </div>
        `).join('');
    }

    getLevelText(level) {
        const levels = {
            'beginner': 'مبتدئ',
            'intermediate': 'متوسط', 
            'advanced': 'متقدم'
        };
        return levels[level] || level;
    }

    async startQuiz(quizId) {
        try {
            await quizEngine.startQuiz(quizId);
        } catch (error) {
            alert('فشل تحميل الكويز. يرجى المحاولة مرة أخرى.');
            console.error('Quiz start error:', error);
        }
    }

    setupEventListeners() {
        // التنقل بين الصفحات
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.getAttribute('data-page');
                this.navigateTo(page);
            });
        });

        // تبديل الثيم
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // إدارة اللغة
        languageManager.loadPreference();
    }

    navigateTo(page) {
        // تحديث الأزرار النشطة
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        this.currentPage = page;
        this.showPage(page);
    }

    showPage(page) {
        // إخفاء جميع الأقسام
        const sections = document.querySelectorAll('.main-container > section');
        sections.forEach(section => section.style.display = 'none');

        // إظهار القسم المطلوب
        switch(page) {
            case 'home':
                sections.forEach(section => section.style.display = 'block');
                break;
            case 'quizzes':
                document.querySelector('.quizzes-section').style.display = 'block';
                break;
            case 'progress':
                document.querySelector('.progress-section').style.display = 'block';
                this.showProgressPage();
                break;
            case 'settings':
                this.showSettingsPage();
                break;
        }
    }

    showProgressPage() {
        const progress = JSON.parse(localStorage.getItem('quiz-progress') || '{}');
        const completed = Object.keys(progress).length;
        const totalScore = Object.values(progress).reduce((sum, p) => sum + p.score, 0);
        const successRate = completed > 0 ? (Object.values(progress).filter(p => p.passed).length / completed * 100) : 0;

        document.getElementById('completed-quizzes').textContent = completed;
        document.getElementById('total-score').textContent = totalScore;
        document.getElementById('success-rate').textContent = `${successRate.toFixed(1)}%`;
    }

    showSettingsPage() {
        const mainContainer = document.querySelector('.main-container');
        mainContainer.innerHTML = `
            <section class="settings-section">
                <div class="section-header">
                    <h2>الإعدادات</h2>
                </div>
                
                <div class="settings-grid">
                    <div class="setting-item">
                        <label>اللغة</label>
                        <select id="settings-language">
                            <option value="ar">العربية</option>
                            <option value="en">English</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <label>الثيم</label>
                        <select id="settings-theme">
                            <option value="light">فاتح</option>
                            <option value="dark">داكن</option>
                            <option value="auto">تلقائي</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="settings-sound"> الصوت
                        </label>
                    </div>
                    
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="settings-notifications"> الإشعارات
                        </label>
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button class="btn btn-primary" onclick="geoLearnApp.saveSettings()">حفظ الإعدادات</button>
                    <button class="btn btn-secondary" onclick="geoLearnApp.resetProgress()">إعادة تعيين التقدم</button>
                </div>
            </section>
        `;

        this.loadSettings();
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        
        document.getElementById('settings-language').value = settings.language || 'ar';
        document.getElementById('settings-theme').value = settings.theme || 'light';
        document.getElementById('settings-sound').checked = settings.sound !== false;
        document.getElementById('settings-notifications').checked = settings.notifications !== false;
    }

    saveSettings() {
        const settings = {
            language: document.getElementById('settings-language').value,
            theme: document.getElementById('settings-theme').value,
            sound: document.getElementById('settings-sound').checked,
            notifications: document.getElementById('settings-notifications').checked
        };

        localStorage.setItem('app-settings', JSON.stringify(settings));
        
        // تطبيق الإعدادات
        languageManager.setLanguage(settings.language);
        this.applyTheme(settings.theme);
        
        alert('تم حفظ الإعدادات بنجاح');
        this.navigateTo('home');
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('preferred-theme', newTheme);
    }

    applyTheme(theme) {
        if (theme === 'auto') {
            // استخدام تفضيل النظام
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    loadUserPreferences() {
        // تحميل الثيم
        const savedTheme = localStorage.getItem('preferred-theme') || 'light';
        this.applyTheme(savedTheme);

        // تحميل الإعدادات الأخرى
        const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        if (settings.language) {
            languageManager.setLanguage(settings.language);
        }
    }

    resetProgress() {
        if (confirm('هل أنت متأكد من أنك تريد إعادة تعيين جميع تقدمك؟ لا يمكن التراجع عن هذا الإجراء.')) {
            localStorage.removeItem('quiz-progress');
            alert('تم إعادة تعيين التقدم بنجاح');
            this.showProgressPage();
        }
    }

    loadUserProgress() {
        this.showProgressPage();
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.geoLearnApp = new GeoLearnApp();
});