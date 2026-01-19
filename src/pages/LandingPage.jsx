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

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
  ];

  return (
    <div className="landing-wrapper">
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
            >
              {lang.nativeName}
            </button>
          ))}
        </motion.div>

        {/* Hero Section */}
        <motion.div className="hero-section" variants={itemVariants}>
          <div className="hero-content">
            <motion.h1 className="hero-title">{t('landing.heroTitle')}</motion.h1>
            <motion.p className="hero-description">{t('landing.heroDescription')}</motion.p>
            <motion.button
              className="cta-button-large"
              onClick={onStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('landing.ctaButton')}
            </motion.button>
          </div>
        </motion.div>

        {/* Footer - Now inside the landing page container */}
        <motion.footer className="custom-footer" variants={itemVariants}>
          <div className="footer-top">
            <button
              onClick={onPrivacyPolicyClick || (() => setShowPrivacyModal(true))}
              className="privacy-link"
            >
              Privacy Policy
            </button>
          </div>
          
          <div className="footer-bottom">
            <span>Copyright © {new Date().getFullYear()}</span>
            <img src={kadoshLogo} alt="Kadosh AI" className="footer-logo" />
            <span>All rights reserved</span>
          </div>
        </motion.footer>
      </motion.div>
    </div>
  );
}

export default LandingPage;