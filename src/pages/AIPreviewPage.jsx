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

function AIPreviewPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const agendaData = location.state?.agendaData || null;

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
    navigate('/editor', { state: { agendaData } });
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
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <FileText size={48} color="#6b7280" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 16px 0', color: '#374151' }}>{t('aiPreview.noAgendaData')}</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            {t('aiPreview.pleaseGenerate')}
          </p>
          <button
            onClick={handleBack}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {t('actions.goBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleBack}
            style={{
              padding: '8px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{
              margin: '0 0 4px 0',
              fontSize: '24px',
              color: '#6366f1',
              fontWeight: 'bold'
            }}>
              {t('aiPreview.title')}
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              {t('aiPreview.subtitle')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} color="#10b981" />
          <span style={{ color: '#10b981', fontWeight: '500' }}>{t('aiPreview.aiGenerated')}</span>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >×</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Preview Panel */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#1f2937' }}>
            📋 {t('aiPreview.agendaPreview')}
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#1f2937' }}>
              {agendaData.meetingTitle}
            </h3>

            <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
              <p style={{ margin: '4px 0' }}><strong>{t('preview.date')}:</strong> {formatDate(agendaData.meetingDate)}</p>
              <p style={{ margin: '4px 0' }}><strong>{t('preview.time')}:</strong> {agendaData.meetingTime}</p>
              <p style={{ margin: '4px 0' }}><strong>{t('preview.duration')}:</strong> {agendaData.duration} {t('agenda.minutes')}</p>
              <p style={{ margin: '4px 0' }}><strong>{t('preview.location')}:</strong> {agendaData.location}</p>
              <p style={{ margin: '4px 0' }}><strong>{t('preview.facilitator')}:</strong> {agendaData.facilitator}</p>
              {agendaData.noteTaker && (
                <p style={{ margin: '4px 0' }}><strong>{t('preview.noteTaker')}:</strong> {agendaData.noteTaker}</p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '16px', marginBottom: '8px', color: '#374151' }}>
              {t('preview.meetingObjective')}
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
              {agendaData.meetingObjective || t('preview.noObjective')}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>
              {t('preview.agenda')} ({agendaData.agendaItems?.length || 0})
            </h4>
            <div>
              {agendaData.agendaItems && agendaData.agendaItems.length > 0 ? (
                agendaData.agendaItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '16px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #f3f4f6'
                    }}
                  >
                    <div style={{
                      backgroundColor: '#6366f1',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      height: 'fit-content'
                    }}>
                      {item.timeAllocation || 15}{t('agenda.minutesShort')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '14px', color: '#1f2937' }}>
                        {item.topic || t('preview.untitledTopic')}
                      </strong>
                      {item.owner && (
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {' • '}{item.owner}
                        </span>
                      )}
                      {item.description && (
                        <p style={{
                          margin: '4px 0',
                          fontSize: '13px',
                          color: '#6b7280',
                          lineHeight: '1.5'
                        }}>
                          {item.description}
                        </p>
                      )}
                      {item.expectedOutput && (
                        <p style={{
                          margin: '4px 0',
                          fontSize: '13px',
                          color: '#9ca3af',
                          fontStyle: 'italic'
                        }}>
                          <em>{t('preview.expected')}: </em>
                          {item.expectedOutput}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>
                  {t('preview.noAgendaItems')}
                </p>
              )}
            </div>
          </div>

          {/* Action Items Section */}
          {agendaData.actionItems && agendaData.actionItems.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>
                {t('preview.actionItems')} ({agendaData.actionItems.length})
              </h4>
              <div>
                {agendaData.actionItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '12px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #f3f4f6'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '14px', color: '#1f2937' }}>
                        {item.task || t('preview.untitledTask')}
                      </strong>
                      {item.owner && (
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          {' • '}{item.owner}
                        </span>
                      )}
                      {item.deadline && (
                        <p style={{
                          margin: '4px 0',
                          fontSize: '13px',
                          color: '#6b7280'
                        }}>
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

        {/* Action Panel */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: '20px',
          height: 'fit-content'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#1f2937' }}>
            🎯 {t('aiPreview.nextSteps')}
          </h2>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              {t('aiPreview.downloadFormat')}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setExportFormat('pdf')}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: exportFormat === 'pdf' ? '#6366f1' : '#f3f4f6',
                  color: exportFormat === 'pdf' ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                PDF
              </button>
              <button
                onClick={() => setExportFormat('word')}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: exportFormat === 'word' ? '#6366f1' : '#f3f4f6',
                  color: exportFormat === 'word' ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Word
              </button>
              <button
                onClick={() => setExportFormat('txt')}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: exportFormat === 'txt' ? '#6366f1' : '#f3f4f6',
                  color: exportFormat === 'txt' ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Text
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: isExporting ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <Download size={16} style={{
                animation: isExporting ? 'spin 1s linear infinite' : 'none'
              }} />
              {isExporting ? t('aiPreview.downloadingAs') : `${t('aiPreview.downloadAs')} ${exportFormat.toUpperCase()}`}
            </button>

            <button
              onClick={handleEdit}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <Edit3 size={16} />
              {t('actions.editAgenda')}
            </button>
          </div>

          <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '14px', margin: '0 0 8px 0', color: '#0369a1' }}>
              💡 {t('aiPreview.tip')}
            </h4>
            <p style={{ fontSize: '13px', margin: 0, color: '#0c4a6e', lineHeight: '1.4' }}>
              {t('aiPreview.tipContent')}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AIPreviewPage;
