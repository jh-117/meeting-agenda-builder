import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, File } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generatePDF, generateDOCX, generateTXT } from '../utils/exportUtils';
import './PreviewModal.css';

function PreviewModal({ agendaData, onDownload, onClose }) {
  const { t } = useTranslation();
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      if (selectedFormat === 'pdf') {
        generatePDF(agendaData);
      } else if (selectedFormat === 'docx') {
        await generateDOCX(agendaData);
      } else if (selectedFormat === 'txt') {
        generateTXT(agendaData);
      }
      onDownload(selectedFormat.toUpperCase());
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportFormats = [
    { id: 'pdf', label: t('PDF'), icon: <FileText size={20} /> },
    { id: 'docx', label: t('Word (DOCX)'), icon: <File size={20} /> },
    { id: 'txt', label: t('TXT'), icon: <FileText size={20} /> },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="preview-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="preview-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>

          <div className="modal-content">
            <h2>{t('Preview Agenda')}</h2>

            <div className="preview-section">
              <h3>{agendaData.meetingTitle}</h3>
              <div className="preview-info">
                <p><strong>{t('Date')}:</strong> {agendaData.meetingDate}</p>
                <p><strong>{t('Time')}:</strong> {agendaData.meetingTime}</p>
                <p><strong>{t('Duration')}:</strong> {agendaData.duration} {t('minutes')}</p>
                <p><strong>{t('Location')}:</strong> {agendaData.location}</p>
                <p><strong>{t('Facilitator')}:</strong> {agendaData.facilitator}</p>
              </div>
            </div>

            <div className="preview-agenda">
              <h4>{t('Agenda Items')}</h4>
              {agendaData.agendaItems && agendaData.agendaItems.length > 0 && (
                <ul>
                  {agendaData.agendaItems.map((item, index) => (
                    <li key={index}>
                      {index + 1}. {item.topic} ({item.timeAllocation} {t('minutes')})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="format-selector">
              <h4>{t('Select Export Format')}</h4>
              <div className="format-options">
                {exportFormats.map((format) => (
                  <motion.button
                    key={format.id}
                    className={`format-option ${selectedFormat === format.id ? 'active' : ''}`}
                    onClick={() => setSelectedFormat(format.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {format.icon}
                    <span>{format.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <motion.button
                className="btn-cancel"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('Cancel')}
              </motion.button>
              <motion.button
                className="btn-download"
                onClick={handleExport}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={18} />
                {isLoading ? t('Exporting...') : t('Download')}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PreviewModal;
