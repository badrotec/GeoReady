// إدارة نظام اللغات في التطبيق
class LanguageManager {
    constructor() {
        this.currentLanguage = 'ar';
        this.translations = {};
        this.init();
    }

    async init() {
        // تحميل اللغة الافتراضية
        await this.loadLanguage('ar');
        this.applyTranslations();
        this.setupEventListeners();
    }

    async loadLanguage(lang) {
        try {
            const response = await fetch(`assets/data/languages/${lang}.json`);
            this.translations[lang] = await response.json();
            
            if (lang === this.currentLanguage) {
                this.applyTranslations();
            }
        } catch (error) {
            console.error(`Failed to load language: ${lang}`, error);
        }
    }

    async setLanguage(lang) {
        if (!this.translations[lang]) {
            await this.loadLanguage(lang);
        }
        
        this.currentLanguage = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        this.applyTranslations();
        this.savePreference();
    }

    applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // تحديث عناصر واجهة المستخدم الإضافية
        this.updateDynamicContent();
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        return value || key;
    }

    setupEventListeners() {
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = this.currentLanguage;
            languageSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }

    savePreference() {
        localStorage.setItem('preferred-language', this.currentLanguage);
    }

    loadPreference() {
        const savedLang = localStorage.getItem('preferred-language');
        if (savedLang && ['ar', 'en', 'fr'].includes(savedLang)) {
            this.setLanguage(savedLang);
        }
    }

    updateDynamicContent() {
        // تحديث النصوص الديناميكية التي لا تستخدم data-i18n
        this.updateQuizCards();
    }

    updateQuizCards() {
        // سيتم تحديث كروت الكويزات ديناميكياً
        console.log('Updating quiz cards with language:', this.currentLanguage);
    }
}

// جعل المدير متاحاً globally
window.languageManager = new LanguageManager();