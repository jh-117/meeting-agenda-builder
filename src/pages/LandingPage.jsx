import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Download, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';
import kadoshLogo from '../assets/kadoshAI.png'
import BackgroundMusic from '../components/BackgroundMusic';
import themeMusic from '../assets/agenda-theme.mp3';

// Import your logo - make sure to add this import
// import kadoshLogo from './path-to-your-logo/kadosh-logo.png';

function LandingPage({ onStart }) {
  const { t, i18n } = useTranslation();

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

      {/* Powered by section at the bottom */}
      <motion.div className="powered-by-section" variants={itemVariants}>
        <div className="powered-by-content">
          <p className="powered-by-text">Powered by</p>
          <img
            src={kadoshLogo}
            alt="Kadosh AI"
            className="powered-by-logo"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}


export default LandingPage;