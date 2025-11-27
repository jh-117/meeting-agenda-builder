import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, File } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generatePDF, generateDOCX, generateTXT } from '../services/exportService';
import './PreviewModal.css';

function PreviewModal({ agendaData, onDownload, onClose }) {
  const { t, i18n } = useTranslation();
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);

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

  // 修复翻译键
  const exportFormats = [
    { id: 'pdf', label: 'PDF', icon: <FileText size={20} /> },
    { id: 'docx', label: 'Word', icon: <File size={20} /> }, // 直接使用固定文本
    { id: 'txt', label: 'TXT', icon: <FileText size={20} /> },
  ];

  // 格式化日期显示
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
          {/* Header */}
          <div className="modal-header">
            <h2>{t('previewModal.title', 'Agenda Preview')}</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-content">
            {/* 基本信息预览 */}
            <div className="preview-section">
              <h3>{agendaData.meetingTitle}</h3>
              <div className="preview-info">
                <p><strong>{t('previewModal.date', 'Date')}:</strong> {formatDate(agendaData.meetingDate)}</p>
                <p><strong>{t('previewModal.time', 'Time')}:</strong> {agendaData.meetingTime}</p>
                <p><strong>{t('previewModal.duration', 'Duration')}:</strong> {agendaData.duration} {t('previewModal.minutes', 'minutes')}</p>
                <p><strong>{t('previewModal.location', 'Location')}:</strong> {agendaData.location}</p>
                <p><strong>{t('previewModal.facilitator', 'Facilitator')}:</strong> {agendaData.facilitator}</p>
                {agendaData.noteTaker && (
                  <p><strong>{t('previewModal.noteTaker', 'Note Taker')}:</strong> {agendaData.noteTaker}</p>
                )}
              </div>
            </div>

            {/* 会议目的 */}
            {agendaData.meetingObjective && (
              <div className="preview-section">
                <h4>{t('previewModal.meetingObjective', 'Meeting Objective')}</h4>
                <p>{agendaData.meetingObjective}</p>
              </div>
            )}

            {/* 议程项 */}
            <div className="preview-section">
              <h4>{t('previewModal.agendaItems', 'Agenda Items')}</h4>
              {agendaData.agendaItems && agendaData.agendaItems.length > 0 ? (
                <div className="agenda-list">
                  {agendaData.agendaItems.map((item, index) => (
                    <div key={index} className="agenda-item">
                      <div className="agenda-item-header">
                        <span className="item-number">{index + 1}.</span>
                        <span className="item-topic">{item.topic}</span>
                        <span className="item-duration">({item.timeAllocation} {t('previewModal.minutes', 'minutes')})</span>
                      </div>
                      {item.owner && (
                        <p className="item-owner">{t('previewModal.owner', 'Owner')}: {item.owner}</p>
                      )}
                      {item.description && (
                        <p className="item-description">{item.description}</p>
                      )}
                      {item.expectedOutput && (
                        <p className="item-output">
                          <em>{t('previewModal.expectedOutput', 'Expected Output')}: </em>
                          {item.expectedOutput}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-items">{t('previewModal.noAgendaItems', 'No agenda items')}</p>
              )}
            </div>

            {/* 行动项 */}
            {agendaData.actionItems && agendaData.actionItems.length > 0 && (
              <div className="preview-section">
                <h4>{t('previewModal.actionItems', 'Action Items')}</h4>
                <div className="action-list">
                  {agendaData.actionItems.map((item, index) => (
                    <div key={index} className="action-item">
                      <span className="action-task">{index + 1}. {item.task}</span>
                      <div className="action-details">
                        {item.owner && <span>{t('previewModal.owner', 'Owner')}: {item.owner}</span>}
                        {item.deadline && <span>{t('previewModal.deadline', 'Deadline')}: {formatDate(item.deadline)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 导出格式选择 */}
            <div className="format-selector">
              <h4>{t('previewModal.selectFormat', 'Select Export Format')}</h4>
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

            {/* 操作按钮 */}
            <div className="modal-actions">
              <motion.button
                className="btn-cancel"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('previewModal.cancel', 'Cancel')}
              </motion.button>
              <motion.button
                className="btn-download"
                onClick={handleExport}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={18} />
                {isLoading ? t('previewModal.exporting', 'Exporting...') : t('previewModal.download', 'Download')}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PreviewModal;