import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Download, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';
import kadoshLogo from '../assets/kadoshAI.png'
import BackgroundMusic from '../components/BackgroundMusic';
import themeMusic from '../assets/agenda-theme.mp3';

function LandingPage({ onStart, onPrivacyPolicyClick }) {
  const { t, i18n } = useTranslation();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  /**
   * 切换语言并保存到 localStorage
   * @param {string} lng - 'en', 'zh', 'ms', 'ta'
   */
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try {
      localStorage.setItem('language', lng);
    } catch (error) {
      console.warn('Unable to save language preference:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // 语言配置
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
  ];

  return (
    <>
      {/* Background Music - Fixed position, independent of page flow */}
      <BackgroundMusic src={themeMusic} />
      
      <motion.div
        className="landing-page"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Language Selector */}
        <motion.div className="language-selector" variants={itemVariants}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={i18n.language === lang.code ? 'active' : ''}
              onClick={() => changeLanguage(lang.code)}
              aria-label={`Switch to ${lang.name}`}
            >
              {lang.nativeName}
            </button>
          ))}
        </motion.div>

        {/* Hero Section */}
        <motion.div className="hero-section" variants={itemVariants}>
          <div className="hero-content">
            <div className="hero-badge">
            
            </div>
            <motion.h1 className="hero-title">{t('landing.heroTitle')}</motion.h1>
            <motion.p className="hero-description">{t('landing.heroDescription')}</motion.p>
            <motion.button
              className="cta-button"
              onClick={onStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('landing.ctaButton')}
            </motion.button>
          </div>

          <div className="hero-visual">
            <div className="floating-card card-1">🚀</div>
            <div className="floating-card card-2">💡</div>
            <div className="floating-card card-3">⚡</div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div className="features-section" variants={itemVariants}>
          <h2>{t('landing.featuresTitle')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Zap className="feature-icon" />
              </div>
              <h3>{t('landing.feature1Title')}</h3>
              <p>{t('landing.feature1Desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Download className="feature-icon" />
              </div>
              <h3>{t('landing.feature2Title')}</h3>
              <p>{t('landing.feature2Desc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Edit className="feature-icon" />
              </div>
              <h3>{t('landing.feature3Title')}</h3>
              <p>{t('landing.feature3Desc')}</p>
            </div>
          </div>
        </motion.div>

        {/* Process / Steps Section */}
        <motion.div className="process-section" variants={itemVariants}>
          <h2>{t('landing.processTitle')}</h2>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h4>{t('landing.step1')}</h4>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h4>{t('landing.step2')}</h4>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h4>{t('landing.step3')}</h4>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h4>{t('landing.step4')}</h4>
            </div>
          </div>
        </motion.div>

        {/* Ready / CTA Section */}
        <motion.div className="cta-section" variants={itemVariants}>
          <div className="cta-content">
            <h2>{t('landing.readyTitle')}</h2>
            <p>{t('landing.readyDesc')}</p>
            <motion.button
              className="cta-button-large"
              onClick={onStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('landing.readyButton')}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer - Updated to match correct example structure */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center space-y-6 mb-6">
            {/* Privacy Policy Link - Matching structure from correct example */}
            <div className="text-center">
              <button
                onClick={onPrivacyPolicyClick || (() => setShowPrivacyModal(true))}
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 rounded px-2 py-1"
              >
                Privacy Policy
              </button>
            </div>
          </div>

          {/* Copyright Footer Row - Matching structure from correct example */}
          <div className="flex items-center justify-center text-gray-400 text-sm gap-3">
            <span>Copyright © {new Date().getFullYear()}</span>
            <img
              src={kadoshLogo}
              alt="Kadosh AI"
              className="h-5 w-auto object-contain"
            />
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default LandingPage;