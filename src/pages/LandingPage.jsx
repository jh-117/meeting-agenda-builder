import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Download, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';

function LandingPage({ onStart }) {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="landing-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Language Selector */}
      <motion.div className="language-selector" variants={itemVariants}>
        <button
          className={i18n.language === 'en' ? 'active' : ''}
          onClick={() => changeLanguage('en')}
        >
          English
        </button>
        <button
          className={i18n.language === 'zh' ? 'active' : ''}
          onClick={() => changeLanguage('zh')}
        >
          中文
        </button>
      </motion.div>

      {/* Hero Section */}
      <motion.div className="hero-section" variants={itemVariants}>
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={16} />
            <span>{t('landing.heroBadge')}</span>
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
  );
}

export default LandingPage;