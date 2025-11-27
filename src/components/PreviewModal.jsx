import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, File } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generatePDF, generateDOCX, generateTXT } from '../services/exportService';
import { getExportTexts } from '../services/exportLanguage'; // 从 services 目录导入
import './PreviewModal.css';

function PreviewModal({ agendaData, onDownload, onClose }) {
  const { i18n } = useTranslation();
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);
  
  // 使用导出专用的翻译配置
  const texts = getExportTexts(i18n.language);

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
    { id: 'docx', label: i18n.language === 'zh' ? 'Word文档' : 
                        i18n.language === 'ms' ? 'Dokumen Word' : 
                        i18n.language === 'ta' ? 'Word ஆவணம்' : 'Word', 
      icon: <File size={20} /> },
    { id: 'txt', label: 'TXT', icon: <FileText size={20} /> },
  ];

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    const locales = {
      zh: 'zh-CN',
      en: 'en-US',
      ms: 'ms-MY',
      ta: 'ta-IN'
    };
    
    return new Date(dateString).toLocaleDateString(locales[i18n.language] || 'en-US', options);
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
            <h2>{texts.defaultTitle}</h2>
            <button className="modal-close" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-content">
            {/* 基本信息 */}
            <div className="preview-section">
              <h3>{agendaData.meetingTitle}</h3>
              <div className="preview-info">
                <p><strong>{texts.date}:</strong> {formatDate(agendaData.meetingDate)}</p>
                <p><strong>{texts.time}:</strong> {agendaData.meetingTime}</p>
                <p><strong>{texts.duration}:</strong> {agendaData.duration} {texts.minutes}</p>
                <p><strong>{texts.location}:</strong> {agendaData.location}</p>
                <p><strong>{texts.facilitator}:</strong> {agendaData.facilitator}</p>
                {agendaData.noteTaker && (
                  <p><strong>{texts.noteTaker}:</strong> {agendaData.noteTaker}</p>
                )}
              </div>
            </div>

            {/* 会议目的 */}
            {agendaData.meetingObjective && (
              <div className="preview-section">
                <h4>{texts.meetingObjective}</h4>
                <p>{agendaData.meetingObjective}</p>
              </div>
            )}

            {/* 议程项 */}
            <div className="preview-section">
              <h4>{texts.agendaItems}</h4>
              {agendaData.agendaItems && agendaData.agendaItems.length > 0 ? (
                <div className="agenda-list">
                  {agendaData.agendaItems.map((item, index) => (
                    <div key={index} className="agenda-item">
                      <div className="agenda-item-header">
                        <span className="item-number">{index + 1}.</span>
                        <span className="item-topic">{item.topic}</span>
                        <span className="item-duration">({item.timeAllocation} {texts.minutes})</span>
                      </div>
                      {item.owner && (
                        <p className="item-owner">{texts.owner}: {item.owner}</p>
                      )}
                      {item.description && (
                        <p className="item-description">{item.description}</p>
                      )}
                      {item.expectedOutput && (
                        <p className="item-output">
                          <em>{texts.expectedOutput}: </em>
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

            {/* 行动项 */}
            {agendaData.actionItems && agendaData.actionItems.length > 0 && (
              <div className="preview-section">
                <h4>{texts.actionItems}</h4>
                <div className="action-list">
                  {agendaData.actionItems.map((item, index) => (
                    <div key={index} className="action-item">
                      <span className="action-task">{index + 1}. {item.task}</span>
                      <div className="action-details">
                        {item.owner && <span>{texts.owner}: {item.owner}</span>}
                        {item.deadline && <span>{texts.deadline}: {formatDate(item.deadline)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 导出格式选择 */}
            <div className="format-selector">
              <h4>{i18n.language === 'zh' ? '选择导出格式' : 
                   i18n.language === 'ms' ? 'Pilih Format Eksport' : 
                   i18n.language === 'ta' ? 'ஏற்றுமதி வடிவத்தைத் தேர்ந்தெடுக்கவும்' : 
                   'Select Export Format'}</h4>
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
                {i18n.language === 'zh' ? '取消' : 
                 i18n.language === 'ms' ? 'Batal' : 
                 i18n.language === 'ta' ? 'ரத்து செய்' : 
                 'Cancel'}
              </motion.button>
              <motion.button
                className="btn-download"
                onClick={handleExport}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={18} />
                {isLoading ? 
                  (i18n.language === 'zh' ? '导出中...' : 
                   i18n.language === 'ms' ? 'Mengeksport...' : 
                   i18n.language === 'ta' ? 'ஏற்றுமதி செய்கிறது...' : 
                   'Exporting...') : 
                  (i18n.language === 'zh' ? '下载' : 
                   i18n.language === 'ms' ? 'Muat Turun' : 
                   i18n.language === 'ta' ? 'பதிவிறக்க' : 
                   'Download')
                }
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PreviewModal;