import React from 'react';
import { motion } from 'framer-motion';
import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <motion.div
          className="spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="spinner-circle"></div>
        </motion.div>
        
        <motion.p
          className="loading-text"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ✨ AI 正在为你生成议程...
        </motion.p>
      </div>
    </div>
  );
}

export default LoadingSpinner;