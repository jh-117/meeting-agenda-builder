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
import { generatePDF, generateDOCX, generateTXT } from './services/exportService';
import { exportTexts } from './services/exportLanguages';

// 可排序的议程项组件
const SortableAgendaItem = ({ item, index, onChange, onRemove, onRegenerateItem, currentLanguage, isGeneratingItem }) => {
  return (
    <div className="edit-item">
      <div className="item-header">
        <div className="drag-handle">
          <GripVertical size={16} />
        </div>
        <input
          placeholder={currentLanguage === 'zh' ? '议题标题' : 'Topic title'}
          value={item.topic}
          onChange={(e) => onChange(index, "topic", e.target.value)}
          className="item-topic"
        />
        <div className="item-actions">
          <button 
            className="btn-regenerate-item"
            onClick={() => onRegenerateItem(item.id)}
            disabled={isGeneratingItem === item.id}
          >
            <RefreshCw size={14} className={isGeneratingItem === item.id ? 'spinning' : ''} />
          </button>
          <button 
            className="btn-remove"
            onClick={() => onRemove(index)}
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="item-details">
        <input
          placeholder={currentLanguage === 'zh' ? '负责人' : 'Owner'}
          value={item.owner}
          onChange={(e) => onChange(index, "owner", e.target.value)}
          className="item-owner"
        />
        <div className="input-with-suffix">
          <input
            type="number"
            placeholder={currentLanguage === 'zh' ? '时长' : 'Duration'}
            value={item.timeAllocation}
            onChange={(e) => onChange(index, "timeAllocation", parseInt(e.target.value) || 15)}
            min="5"
            className="item-duration"
          />
          <span className="input-suffix">{currentLanguage === 'zh' ? '分钟' : 'min'}</span>
        </div>
      </div>

      <textarea
        placeholder={currentLanguage === 'zh' ? '描述...' : 'Description...'}
        value={item.description}
        onChange={(e) => onChange(index, "description", e.target.value)}
        rows="2"
        className="item-description"
      />

      <textarea
        placeholder={currentLanguage === 'zh' ? '预期产出...' : 'Expected output...'}
        value={item.expectedOutput}
        onChange={(e) => onChange(index, "expectedOutput", e.target.value)}
        rows="2"
        className="item-output"
      />
    </div>
  );
};

function AgendaEditor({ agendaData, onReset, onDataChange, onRegenerate, isRegenerating }) {
  const currentLanguage = 'en';
  const [isGeneratingItem, setIsGeneratingItem] = useState(null);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [error, setError] = useState(null);

  // Fix: Use agendaData from props and ensure proper state management
  const agendaItemsWithId = (agendaData?.agendaItems || []).map((item, index) => ({
    ...item,
    id: item.id || `agenda-${index}-${Date.now()}`
  }));

  // Fix: Properly handle data changes through the prop callback
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

  // Fix: Handle export function properly
  const handleExport = async () => {
    try {
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
    }
  };

  // Fix: Handle regenerate function
  const handleRegenerate = async () => {
    if (onRegenerate) {
      await onRegenerate();
    }
  };

  // Fix: Handle item regeneration
  const handleRegenerateItem = async (itemId) => {
    setIsGeneratingItem(itemId);
    // TODO: Implement actual item regeneration logic
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

  // Fix: Provide default data if agendaData is undefined
  const data = agendaData || {
    meetingTitle: 'Meeting Agenda',
    meetingDate: '',
    meetingTime: '',
    duration: 60,
    location: '',
    facilitator: '',
    noteTaker: '',
    meetingObjective: '',
    agendaItems: []
  };

  return (
    <div className="agenda-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="header-title">
          <h1>{data.meetingTitle}</h1>
          <p>{data.meetingDate} • {data.meetingTime} • {data.duration} minutes</p>
        </div>

        <div className="editor-actions">
          <button 
            className="btn-icon btn-regenerate"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw size={16} className={isRegenerating ? 'spinning' : ''} />
            {isRegenerating ? 'Regenerating...' : 'AI Regenerate'}
          </button>
          
          <button 
            className="btn-icon btn-reset"
            onClick={onReset}
          >
            <Home size={16} /> Back to Home
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Main Content - Left/Right Layout */}
      <div className="editor-content">
        {/* Left Panel - Editor */}
        <div className="editor-panel">
          {/* Basic Info */}
          <section className="edit-section">
            <h2>📋 Basic Information</h2>

            <div className="edit-group">
              <label>Meeting Title</label>
              <input
                value={data.meetingTitle}
                onChange={(e) => handleChange("meetingTitle", e.target.value)}
              />
            </div>

            <div className="edit-group">
              <label>Meeting Objective</label>
              <textarea
                value={data.meetingObjective}
                onChange={(e) => handleChange("meetingObjective", e.target.value)}
                rows="4"
              />
            </div>

            <div className="edit-group">
              <label>Date</label>
              <input
                type="date"
                value={data.meetingDate}
                onChange={(e) => handleChange("meetingDate", e.target.value)}
              />
            </div>

            <div className="edit-group">
              <label>Time</label>
              <input
                type="time"
                value={data.meetingTime}
                onChange={(e) => handleChange("meetingTime", e.target.value)}
              />
            </div>

            <div className="edit-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={data.duration}
                onChange={(e) => handleChange("duration", parseInt(e.target.value) || 60)}
              />
            </div>

            <div className="edit-group">
              <label>Location</label>
              <input
                value={data.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            <div className="edit-group">
              <label>Facilitator</label>
              <input
                value={data.facilitator}
                onChange={(e) => handleChange("facilitator", e.target.value)}
              />
            </div>
          </section>

          {/* Agenda Items */}
          <section className="edit-section">
            <div className="section-header">
              <h2>🗓️ Agenda Items ({agendaItemsWithId.length})</h2>
              <button className="btn-add" onClick={addAgendaItem}>
                + Add
              </button>
            </div>

            <div className="drag-container">
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
              <div className="empty-state">
                <p>No agenda items yet</p>
                <button className="btn-primary" onClick={addAgendaItem}>
                  + Add First Item
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Panel - Preview */}
        <div className="preview-panel">
          <div className="preview-header">
            <h2>👁️ Live Preview</h2>
            
            <div className="export-options">
              <label>Export as:</label>
              <div className="format-buttons">
                <button 
                  className={`format-btn ${exportFormat === 'pdf' ? 'active' : ''}`}
                  onClick={() => setExportFormat('pdf')}
                >
                  <FileText size={16} />
                </button>
                <button 
                  className={`format-btn ${exportFormat === 'word' ? 'active' : ''}`}
                  onClick={() => setExportFormat('word')}
                >
                  <FileDown size={16} />
                </button>
                <button 
                  className={`format-btn ${exportFormat === 'txt' ? 'active' : ''}`}
                  onClick={() => setExportFormat('txt')}
                >
                  <FileCode size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="preview-content">
            <div className="preview-section">
              <h3>{data.meetingTitle}</h3>
              
              <div className="preview-info">
                <p><strong>Date:</strong> {formatDate(data.meetingDate)}</p>
                <p><strong>Time:</strong> {data.meetingTime}</p>
                <p><strong>Duration:</strong> {data.duration} minutes</p>
                <p><strong>Location:</strong> {data.location}</p>
                <p><strong>Facilitator:</strong> {data.facilitator}</p>
                {data.noteTaker && (
                  <p><strong>Note Taker:</strong> {data.noteTaker}</p>
                )}
              </div>
            </div>

            <div className="preview-section">
              <h4>Meeting Objective</h4>
              <p>{data.meetingObjective || 'No objective specified'}</p>
            </div>

            <div className="preview-section">
              <h4>Agenda</h4>
              <div className="agenda-timeline">
                {agendaItemsWithId.length > 0 ? (
                  agendaItemsWithId.map((item) => (
                    <div key={item.id} className="timeline-item">
                      <div className="time-slot">{item.timeAllocation || 15}min</div>
                      <div className="topic-content">
                        <strong>{item.topic || 'Untitled Topic'}</strong>
                        {item.owner && <span className="owner"> • {item.owner}</span>}
                        {item.description && <p className="description">{item.description}</p>}
                        {item.expectedOutput && (
                          <p className="expected-output">
                            <em>Expected: </em>
                            {item.expectedOutput}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No agenda items added yet</p>
                )}
              </div>
            </div>

            <button className="btn-download" onClick={handleExport}>
              <Download size={16} /> 
              Download ({exportFormat.toUpperCase()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgendaEditor;