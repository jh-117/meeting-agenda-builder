import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Download,
  Edit3,
  ArrowLeft,
  FileText,
  CheckCircle
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { generatePDF, generateDOCX, generateTXT } from "../services/exportService";
import "./AIPreviewPage.css";

function AIPreviewPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const agendaData = location.state?.agendaData || null;
  const formData = location.state?.formData || null;

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      setError(null);

      const exportData = {
        ...agendaData,
        agendaItems: agendaData.agendaItems || []
      };

      switch (exportFormat) {
        case 'pdf':
          await generatePDF(exportData, i18n.language);
          break;
        case 'word':
          await generateDOCX(exportData, i18n.language);
          break;
        case 'txt':
          await generateTXT(exportData, i18n.language);
          break;
        default:
          await generatePDF(exportData, i18n.language);
      }
    } catch (error) {
      console.error('Export error:', error);
      setError(`Download failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleEdit = () => {
    navigate('/editor', { state: { agendaData, formData } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notSet');
    try {
      return new Date(dateString).toLocaleDateString(i18n.language);
    } catch {
      return dateString;
    }
  };

  if (!agendaData) {
    return (
      <div className="no-data-container">
        <div className="no-data-card">
          <FileText size={48} className="no-data-icon" />
          <h2>{t('aiPreview.noAgendaData')}</h2>
          <p>{t('aiPreview.pleaseGenerate')}</p>
          <button onClick={handleBack} className="btn-action secondary">
            {t('actions.goBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-preview-page">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div className="preview-header">
        <div className="preview-header-left">
          <button onClick={handleBack} className="btn-back">
            <ArrowLeft size={20} />
          </button>
          <div className="preview-header-title">
            <h1>{t('aiPreview.title')}</h1>
            <p>{t('aiPreview.subtitle')}</p>
          </div>
        </div>

        <div className="preview-header-right">
          <div className="header-format-selector">
            {['pdf', 'word', 'txt'].map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
                className={`btn-format-header ${exportFormat === format ? 'active' : ''}`}
                title={format.toUpperCase()}
              >
                {format === 'pdf' ? 'PDF' : format === 'word' ? 'DOC' : 'TXT'}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="btn-header-action primary"
            title={t('aiPreview.downloadAs')}
          >
            <Download size={18} style={{
              animation: isExporting ? 'spin 1s linear infinite' : 'none'
            }} />
            <span className="btn-text">{t('actions.download')}</span>
          </button>

          <button
            onClick={handleEdit}
            className="btn-header-action secondary"
            title={t('actions.editAgenda')}
          >
            <Edit3 size={18} />
            <span className="btn-text">{t('actions.edit')}</span>
          </button>

          <div className="preview-badge">
            <CheckCircle size={18} />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="btn-close-error">
            ×
          </button>
        </div>
      )}

      <div className="preview-grid">
        {/* Preview Panel */}
        <div className="preview-panel">
          <h2>📋 {t('aiPreview.agendaPreview')}</h2>

          <div style={{ marginBottom: '24px' }}>
            <h3 className="preview-meeting-title">
              {agendaData.meetingTitle}
            </h3>

            <div className="preview-meeting-info">
              <p><strong>{t('preview.date')}:</strong> {formatDate(agendaData.meetingDate)}</p>
              <p><strong>{t('preview.time')}:</strong> {agendaData.meetingTime}</p>
              <p><strong>{t('preview.duration')}:</strong> {agendaData.duration} {t('agenda.minutes')}</p>
              <p><strong>{t('preview.location')}:</strong> {agendaData.location}</p>
              <p><strong>{t('preview.facilitator')}:</strong> {agendaData.facilitator}</p>
              {agendaData.noteTaker && (
                <p><strong>{t('preview.noteTaker')}:</strong> {agendaData.noteTaker}</p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 className="preview-section-title">
              {t('preview.meetingObjective')}
            </h4>
            <p className="preview-objective-text">
              {agendaData.meetingObjective || t('preview.noObjective')}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 className="preview-section-title">
              {t('preview.agenda')} ({agendaData.agendaItems?.length || 0})
            </h4>
            <div>
              {agendaData.agendaItems && agendaData.agendaItems.length > 0 ? (
                agendaData.agendaItems.map((item) => (
                  <div key={item.id} className="preview-agenda-item">
                    <div className="preview-agenda-time">
                      {item.timeAllocation || 15}{t('agenda.minutesShort')}
                    </div>
                    <div className="preview-agenda-details">
                      <strong className="preview-agenda-topic">
                        {item.topic || t('preview.untitledTopic')}
                      </strong>
                      {item.owner && (
                        <span className="preview-agenda-owner">
                          {' • '}{item.owner}
                        </span>
                      )}
                      {item.description && (
                        <p className="preview-agenda-description">
                          {item.description}
                        </p>
                      )}
                      {item.expectedOutput && (
                        <p className="preview-agenda-output">
                          <em>{t('preview.expected')}: </em>
                          {item.expectedOutput}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-state-text">
                  {t('preview.noAgendaItems')}
                </p>
              )}
            </div>
          </div>

          {/* Action Items Section */}
          {agendaData.actionItems && agendaData.actionItems.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 className="preview-section-title">
                {t('preview.actionItems')} ({agendaData.actionItems.length})
              </h4>
              <div>
                {agendaData.actionItems.map((item) => (
                  <div key={item.id} className="preview-agenda-item">
                    <div className="preview-agenda-details">
                      <strong className="preview-agenda-topic">
                        {item.task || t('preview.untitledTask')}
                      </strong>
                      {item.owner && (
                        <span className="preview-agenda-owner">
                          {' • '}{item.owner}
                        </span>
                      )}
                      {item.deadline && (
                        <p className="preview-agenda-description">
                          {t('preview.deadline')}: {formatDate(item.deadline)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel - Empty or for future use */}
        <div className="side-panel">
          <div className="tip-box">
            <h4>💡 {t('aiPreview.tip')}</h4>
            <p>{t('aiPreview.tipContent')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIPreviewPage;
