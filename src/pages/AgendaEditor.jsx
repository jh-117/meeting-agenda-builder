import React, { useState } from "react";
import { 
  Download, 
  RotateCcw, 
  GripVertical,
  RefreshCw,
  FileText,
  FileDown,
  FileCode,
  Home
} from "lucide-react";
import { generatePDF, generateDOCX, generateTXT } from '../services/exportService';

// Sortable Agenda Item Component
const SortableAgendaItem = ({ item, index, onChange, onRemove, onRegenerateItem, currentLanguage, isGeneratingItem }) => {
  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: 'white'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <div style={{ cursor: 'grab', color: '#9ca3af' }}>
          <GripVertical size={16} />
        </div>
        <input
          placeholder={currentLanguage === 'zh' ? '议题标题' : 'Topic title'}
          value={item.topic}
          onChange={(e) => onChange(index, "topic", e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        <button 
          onClick={() => onRegenerateItem(item.id)}
          disabled={isGeneratingItem === item.id}
          style={{
            padding: '8px',
            border: 'none',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} style={{
            animation: isGeneratingItem === item.id ? 'spin 1s linear infinite' : 'none'
          }} />
        </button>
        <button 
          onClick={() => onRemove(index)}
          style={{
            padding: '4px 12px',
            border: 'none',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          placeholder={currentLanguage === 'zh' ? '负责人' : 'Owner'}
          value={item.owner}
          onChange={(e) => onChange(index, "owner", e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input
            type="number"
            placeholder={currentLanguage === 'zh' ? '时长' : 'Duration'}
            value={item.timeAllocation}
            onChange={(e) => onChange(index, "timeAllocation", parseInt(e.target.value) || 15)}
            min="5"
            style={{
              width: '80px',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {currentLanguage === 'zh' ? '分钟' : 'min'}
          </span>
        </div>
      </div>

      <textarea
        placeholder={currentLanguage === 'zh' ? '描述...' : 'Description...'}
        value={item.description}
        onChange={(e) => onChange(index, "description", e.target.value)}
        rows="2"
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          fontSize: '14px',
          marginBottom: '8px',
          fontFamily: 'inherit',
          resize: 'vertical'
        }}
      />

      <textarea
        placeholder={currentLanguage === 'zh' ? '预期产出...' : 'Expected output...'}
        value={item.expectedOutput}
        onChange={(e) => onChange(index, "expectedOutput", e.target.value)}
        rows="2"
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'inherit',
          resize: 'vertical'
        }}
      />
    </div>
  );
};

function AgendaEditor({ 
  agendaData = {
    meetingTitle: 'Q4 Project Planning Meeting',
    meetingDate: '2025-11-27',
    meetingTime: '14:00',
    duration: 60,
    location: 'Conference Room A',
    facilitator: 'JH',
    noteTaker: 'Li Si',
    meetingObjective: 'To discuss and align on Q4 project goals, finalize key deliverables, and determine resource allocation to ensure a successful project launch.',
    agendaItems: [
      {
        id: 'agenda-1',
        topic: 'Introduction and Meeting Objectives',
        owner: 'JH',
        timeAllocation: 5,
        description: 'Overview of the meeting objectives and...',
        expectedOutput: 'Clear understanding of the meeting purpose'
      },
      {
        id: 'agenda-2',
        topic: 'Review of Q4 Project Goals',
        owner: 'Project Manager',
        timeAllocation: 10,
        description: 'Discussion of the primary goals for Q4...',
        expectedOutput: 'Agreement on the key goals for the upcoming...'
      }
    ]
  }, 
  onReset, 
  onDataChange, 
  onRegenerate, 
  isRegenerating 
}) {
  const currentLanguage = 'en';
  const [isGeneratingItem, setIsGeneratingItem] = useState(null);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const agendaItemsWithId = (agendaData?.agendaItems || []).map((item, index) => ({
    ...item,
    id: item.id || `agenda-${index}-${Date.now()}`
  }));

  const handleChange = (field, value) => {
    if (onDataChange) {
      onDataChange({
        ...agendaData,
        [field]: value
      });
    }
  };

  const handleAgendaItemChange = (index, field, value) => {
    const updatedItems = [...agendaItemsWithId];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleChange("agendaItems", updatedItems);
  };

  const addAgendaItem = () => {
    const newItem = {
      id: `agenda-${Date.now()}`,
      topic: '',
      owner: '',
      timeAllocation: 15,
      description: '',
      expectedOutput: ''
    };
    const updatedItems = [...agendaItemsWithId, newItem];
    handleChange("agendaItems", updatedItems);
  };

  const removeAgendaItem = (index) => {
    const updatedItems = agendaItemsWithId.filter((_, i) => i !== index);
    handleChange("agendaItems", updatedItems);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      
      const exportData = {
        ...agendaData,
        agendaItems: agendaItemsWithId
      };

      switch (exportFormat) {
        case 'pdf':
          await generatePDF(exportData, currentLanguage);
          break;
        case 'word':
          await generateDOCX(exportData, currentLanguage);
          break;
        case 'txt':
          await generateTXT(exportData, currentLanguage);
          break;
        default:
          await generatePDF(exportData, currentLanguage);
      }
    } catch (error) {
      console.error('Export error:', error);
      setError(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRegenerate = async () => {
    if (onRegenerate) {
      await onRegenerate();
    }
  };

  const handleRegenerateItem = async (itemId) => {
    setIsGeneratingItem(itemId);
    setTimeout(() => {
      setIsGeneratingItem(null);
    }, 1000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US');
    } catch {
      return dateString;
    }
  };

  const data = agendaData || {};

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

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
        <div>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '28px',
            color: '#6366f1',
            fontWeight: 'bold'
          }}>
            {data.meetingTitle}
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            {data.meetingDate} • {data.meetingTime} • {data.duration} minutes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginRight: '60px' }}>
          <button 
            onClick={handleRegenerate}
            disabled={isRegenerating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isRegenerating ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: isRegenerating ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} style={{
              animation: isRegenerating ? 'spin 1s linear infinite' : 'none'
            }} />
            {isRegenerating ? 'Regenerating...' : 'AI Regenerate'}
          </button>
          
          <button 
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <Home size={16} /> Back to Home
          </button>
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

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left Panel - Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Basic Info */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#1f2937' }}>
              📋 Basic Information
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Meeting Title
              </label>
              <input
                value={data.meetingTitle}
                onChange={(e) => handleChange("meetingTitle", e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Meeting Objective
              </label>
              <textarea
                value={data.meetingObjective}
                onChange={(e) => handleChange("meetingObjective", e.target.value)}
                rows="4"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Date
              </label>
              <input
                type="date"
                value={data.meetingDate}
                onChange={(e) => handleChange("meetingDate", e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Time
              </label>
              <input
                type="time"
                value={data.meetingTime}
                onChange={(e) => handleChange("meetingTime", e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                value={data.duration}
                onChange={(e) => handleChange("duration", parseInt(e.target.value) || 60)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Location
              </label>
              <input
                value={data.location}
                onChange={(e) => handleChange("location", e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Facilitator
              </label>
              <input
                value={data.facilitator}
                onChange={(e) => handleChange("facilitator", e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Agenda Items */}
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ fontSize: '18px', margin: 0, color: '#1f2937' }}>
                🗓️ Agenda Items ({agendaItemsWithId.length})
              </h2>
              <button 
                onClick={addAgendaItem}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                + Add
              </button>
            </div>

            <div>
              {agendaItemsWithId.map((item, index) => (
                <SortableAgendaItem
                  key={item.id}
                  item={item}
                  index={index}
                  onChange={handleAgendaItemChange}
                  onRemove={removeAgendaItem}
                  onRegenerateItem={handleRegenerateItem}
                  currentLanguage={currentLanguage}
                  isGeneratingItem={isGeneratingItem}
                />
              ))}
            </div>

            {agendaItemsWithId.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#9ca3af'
              }}>
                <p>No agenda items yet</p>
                <button 
                  onClick={addAgendaItem}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginTop: '12px'
                  }}
                >
                  + Add First Item
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: '20px',
          height: 'fit-content',
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#1f2937' }}>
              👁️ Live Preview
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: '#6b7280' }}>Export as:</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  onClick={() => setExportFormat('pdf')}
                  style={{
                    padding: '8px',
                    backgroundColor: exportFormat === 'pdf' ? '#6366f1' : '#f3f4f6',
                    color: exportFormat === 'pdf' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <FileText size={16} />
                </button>
                <button 
                  onClick={() => setExportFormat('word')}
                  style={{
                    padding: '8px',
                    backgroundColor: exportFormat === 'word' ? '#6366f1' : '#f3f4f6',
                    color: exportFormat === 'word' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <FileDown size={16} />
                </button>
                <button 
                  onClick={() => setExportFormat('txt')}
                  style={{
                    padding: '8px',
                    backgroundColor: exportFormat === 'txt' ? '#6366f1' : '#f3f4f6',
                    color: exportFormat === 'txt' ? 'white' : '#6b7280',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <FileCode size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#1f2937' }}>
                {data.meetingTitle}
              </h3>
              
              <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                <p style={{ margin: '4px 0' }}><strong>Date:</strong> {formatDate(data.meetingDate)}</p>
                <p style={{ margin: '4px 0' }}><strong>Time:</strong> {data.meetingTime}</p>
                <p style={{ margin: '4px 0' }}><strong>Duration:</strong> {data.duration} minutes</p>
                <p style={{ margin: '4px 0' }}><strong>Location:</strong> {data.location}</p>
                <p style={{ margin: '4px 0' }}><strong>Facilitator:</strong> {data.facilitator}</p>
                {data.noteTaker && (
                  <p style={{ margin: '4px 0' }}><strong>Note Taker:</strong> {data.noteTaker}</p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '8px', color: '#374151' }}>
                Meeting Objective
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                {data.meetingObjective || 'No objective specified'}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>
                Agenda
              </h4>
              <div>
                {agendaItemsWithId.length > 0 ? (
                  agendaItemsWithId.map((item) => (
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
                        {item.timeAllocation || 15}min
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '14px', color: '#1f2937' }}>
                          {item.topic || 'Untitled Topic'}
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
                            <em>Expected: </em>
                            {item.expectedOutput}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>
                    No agenda items added yet
                  </p>
                )}
              </div>
            </div>

            <button 
              onClick={handleExport}
              disabled={isExporting}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                backgroundColor: isExporting ? '#9ca3af' : '#6366f1',
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
              {isExporting ? 'Exporting...' : `Download (${exportFormat.toUpperCase()})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgendaEditor;