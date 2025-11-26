import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import './NotificationToast.css';

function NotificationToast({ message, type = 'success', onClose }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className={`notification-toast ${type}`}
        initial={{ opacity: 0, y: 20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 20, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="toast-content">
          {type === 'success' && <CheckCircle size={20} />}
          {type === 'error' && <AlertCircle size={20} />}
          <span>{message}</span>
        </div>
        <button className="toast-close" onClick={onClose}>
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

export default NotificationToast;