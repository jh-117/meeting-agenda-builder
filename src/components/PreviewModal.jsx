import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, File } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generatePDF, generateDOCX, generateTXT } from '../services/exportService';
import { getExportTexts } from '../utils/exportTexts'; // 导入你的翻译配置
import './PreviewModal.css';

function PreviewModal({ agendaData, onDownload, onClose }) {
  const { i18n } = useTranslation();
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);
  
  // 使用你的翻译配置
  const t = getExportTexts(i18n.language);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      switch (selectedFormat) {
        case 'pdf':
          generatePDF(agendaData, i18n.language);
          break;
        case 'docx':
          await generateDOCX(agendaData, i18n.language);
          break;
        case 'txt':
          generateTXT(agendaData, i18n.language);
          break;
        default:
          generatePDF(agendaData, i18n.language);
      }
      onDownload(selectedFormat.toUpperCase());
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportFormats = [
    { id: 'pdf', label: 'PDF', icon: <FileText size={20} /> },
    { id: 'docx', label: 'Word', icon: <File size={20} /> },
    { id: 'txt', label: 'TXT', icon: <FileText size={20} /> },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US');
  };

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
          <div className="modal-header">
            <h2>{t.defaultTitle || 'Agenda Preview'}</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-content">
            <div className="preview-section">
              <h3>{agendaData.meetingTitle}</h3>
              <div className="preview-info">
                <p><strong>{t.date}:</strong> {formatDate(agendaData.meetingDate)}</p>
                <p><strong>{t.time}:</strong> {agendaData.meetingTime}</p>
                <p><strong>{t.duration}:</strong> {agendaData.duration} {t.minutes}</p>
                <p><strong>{t.location}:</strong> {agendaData.location}</p>
                <p><strong>{t.facilitator}:</strong> {agendaData.facilitator}</p>
                {agendaData.noteTaker && (
                  <p><strong>{t.noteTaker}:</strong> {agendaData.noteTaker}</p>
                )}
              </div>
            </div>

            {agendaData.meetingObjective && (
              <div className="preview-section">
                <h4>{t.meetingObjective}</h4>
                <p>{agendaData.meetingObjective}</p>
              </div>
            )}

            <div className="preview-section">
              <h4>{t.agendaItems}</h4>
              {agendaData.agendaItems && agendaData.agendaItems.length > 0 ? (
                <div className="agenda-list">
                  {agendaData.agendaItems.map((item, index) => (
                    <div key={index} className="agenda-item">
                      <div className="agenda-item-header">
                        <span className="item-number">{index + 1}.</span>
                        <span className="item-topic">{item.topic}</span>
                        <span className="item-duration">({item.timeAllocation} {t.minutes})</span>
                      </div>
                      {item.owner && (
                        <p className="item-owner">{t.owner}: {item.owner}</p>
                      )}
                      {item.description && (
                        <p className="item-description">{item.description}</p>
                      )}
                      {item.expectedOutput && (
                        <p className="item-output">
                          <em>{t.expectedOutput}: </em>
                          {item.expectedOutput}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-items">No agenda items</p>
              )}
            </div>

            {agendaData.actionItems && agendaData.actionItems.length > 0 && (
              <div className="preview-section">
                <h4>{t.actionItems}</h4>
                <div className="action-list">
                  {agendaData.actionItems.map((item, index) => (
                    <div key={index} className="action-item">
                      <span className="action-task">{index + 1}. {item.task}</span>
                      <div className="action-details">
                        {item.owner && <span>{t.owner}: {item.owner}</span>}
                        {item.deadline && <span>{t.deadline}: {formatDate(item.deadline)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="format-selector">
              <h4>Select Export Format</h4>
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
                Cancel
              </motion.button>
              <motion.button
                className="btn-download"
                onClick={handleExport}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={18} />
                {isLoading ? 'Exporting...' : 'Download'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PreviewModal;