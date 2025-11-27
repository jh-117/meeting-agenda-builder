import React, { useState } from "react";
import { 
  Eye, 
  Download, 
  RotateCcw, 
  GripVertical,
  RefreshCw,
  FileText,
  FileDown,
  FileCode
} from "lucide-react";

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

function AgendaEditor() {
  const currentLanguage = 'en';
  const [isGeneratingItem, setIsGeneratingItem] = useState(null);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [error, setError] = useState(null);

  const [agendaData, setAgendaData] = useState({
    meetingTitle: "Q4 Project Planning Meeting",
    meetingDate: "2025-11-27",
    meetingTime: "14:00",
    duration: 60,
    location: "Conference Room A",
    facilitator: "JH",
    noteTaker: "Li Si",
    meetingObjective: "To discuss and align on Q4 project goals, finalize key deliverables, and determine resource allocation to ensure a successful project launch.",
    agendaItems: [
      {
        id: "1",
        topic: "Introduction and Meeting Objectives",
        owner: "JH",
        timeAllocation: 5,
        description: "Overview of the meeting objectives and...",
        expectedOutput: "Clear understanding of the meeting purpose"
      },
      {
        id: "2",
        topic: "Review of Q4 Project Goals",
        owner: "Project Manager",
        timeAllocation: 10,
        description: "Discussion of the primary goals for Q4...",
        expectedOutput: "Agreement on the key goals for the upcoming..."
      }
    ],
    actionItems: [
      {
        task: "Draft detailed project plan",
        owner: "Project Manager",
        deadline: "2025-04-12"
      }
    ]
  });

  const agendaItemsWithId = agendaData.agendaItems.map((item, index) => ({
    ...item,
    id: item.id || `agenda-${index}-${Date.now()}`
  }));

  const handleChange = (field, value) => {
    setAgendaData(prev => ({ ...prev, [field]: value }));
  };

  const handleAgendaItemChange = (index, field, value) => {
    const updated = [...agendaItemsWithId];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("agendaItems", updated);
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
    handleChange("agendaItems", [...agendaItemsWithId, newItem]);
  };

  const removeAgendaItem = (index) => {
    const updated = agendaItemsWithId.filter((_, i) => i !== index);
    handleChange("agendaItems", updated);
  };

  const handleExport = () => {
    alert(`Export as ${exportFormat.toUpperCase()}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  return (
    <div className="agenda-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="header-title">
          <h1>{agendaData.meetingTitle}</h1>
          <p>{agendaData.meetingDate} • {agendaData.meetingTime} • {agendaData.duration} minutes</p>
        </div>

        <div className="editor-actions">
          <button className="btn-icon">
            <Eye size={16} /> Preview
          </button>
          <button className="btn-icon btn-regenerate">
            <RefreshCw size={16} />
            AI Regenerate
          </button>
          <button className="btn-icon btn-reset">
            <RotateCcw size={16} /> Reset
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
                value={agendaData.meetingTitle}
                onChange={(e) => handleChange("meetingTitle", e.target.value)}
              />
            </div>

            <div className="edit-group">
              <label>Meeting Objective</label>
              <textarea
                value={agendaData.meetingObjective}
                onChange={(e) => handleChange("meetingObjective", e.target.value)}
                rows="4"
              />
            </div>

            <div className="edit-group">
              <label>Date</label>
              <input
                type="date"
                value={agendaData.meetingDate}
                onChange={(e) => handleChange("meetingDate", e.target.value)}
              />
            </div>

            <div className="edit-group">
              <label>Time</label>
              <input
                type="time"
                value={agendaData.meetingTime}
                onChange={(e) => handleChange("meetingTime", e.target.value)}
              />
            </div>

            <div className="edit-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={agendaData.duration}
                onChange={(e) => handleChange("duration", parseInt(e.target.value))}
              />
            </div>

            <div className="edit-group">
              <label>Location</label>
              <input
                value={agendaData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            <div className="edit-group">
              <label>Facilitator</label>
              <input
                value={agendaData.facilitator}
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
                  onRegenerateItem={() => setIsGeneratingItem(item.id)}
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
              <h3>{agendaData.meetingTitle}</h3>
              
              <div className="preview-info">
                <p><strong>Date:</strong> {formatDate(agendaData.meetingDate)}</p>
                <p><strong>Time:</strong> {agendaData.meetingTime}</p>
                <p><strong>Duration:</strong> {agendaData.duration} minutes</p>
                <p><strong>Location:</strong> {agendaData.location}</p>
                <p><strong>Facilitator:</strong> {agendaData.facilitator}</p>
                {agendaData.noteTaker && (
                  <p><strong>Note Taker:</strong> {agendaData.noteTaker}</p>
                )}
              </div>
            </div>

            <div className="preview-section">
              <h4>Meeting Objective</h4>
              <p>{agendaData.meetingObjective}</p>
            </div>

            <div className="preview-section">
              <h4>Agenda</h4>
              <div className="agenda-timeline">
                {agendaItemsWithId.map((item) => (
                  <div key={item.id} className="timeline-item">
                    <div className="time-slot">{item.timeAllocation}min</div>
                    <div className="topic-content">
                      <strong>{item.topic}</strong>
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
                ))}
              </div>
            </div>

            <button className="btn-download" onClick={handleExport}>
              <Download size={16} /> 
              Download ({exportFormat.toUpperCase()})
            </button>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        
        .agenda-editor {
          min-height: 100vh;
          padding: 30px 20px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          gap: 20px;
          max-width: 1600px;
          margin-left: auto;
          margin-right: auto;
        }

        .header-title h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-title p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .editor-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-icon {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: white;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .btn-icon:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .btn-regenerate {
          background: linear-gradient(135deg, #10b981, #059669) !important;
          color: white !important;
          border: none !important;
        }

        .btn-reset {
          background: linear-gradient(135deg, #ef4444, #dc2626) !important;
          color: white !important;
          border: none !important;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .editor-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          max-width: 1600px;
          margin: 0 auto;
        }

        @media (max-width: 1200px) {
          .editor-content {
            grid-template-columns: 1fr;
          }
        }

        .editor-panel {
          background: white;
          border-radius: 16px;
          padding: 30px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
          max-height: 80vh;
          overflow-y: auto;
        }

        .preview-panel {
          background: white;
          border-radius: 16px;
          padding: 30px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
          max-height: 80vh;
          overflow-y: auto;
          position: sticky;
          top: 30px;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
          gap: 16px;
        }

        .preview-header h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
        }

        .export-options {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .export-options label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          white-space: nowrap;
        }

        .format-buttons {
          display: flex;
          gap: 4px;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 8px;
        }

        .format-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .format-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .format-btn.active {
          background: #6366f1;
          color: white;
        }

        .edit-section {
          margin-bottom: 32px;
          padding: 24px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .edit-section:last-child {
          margin-bottom: 0;
        }

        .edit-section h2 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #0f172a;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h2 {
          margin-bottom: 0;
          border-bottom: none;
          padding-bottom: 0;
        }

        .btn-add {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
        }

        .edit-group {
          background: white;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
        }

        .edit-group:last-child {
          margin-bottom: 0;
        }

        .edit-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #64748b;
        }

        .edit-group input,
        .edit-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          background: white;
          color: #0f172a;
          resize: vertical;
          font-family: inherit;
        }

        .edit-group input:focus,
        .edit-group textarea:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .drag-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .edit-item {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }

        .edit-item:hover {
          border-color: #6366f1;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .item-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .drag-handle {
          display: flex;
          align-items: center;
          cursor: grab;
          color: #cbd5e1;
          padding: 4px;
          border-radius: 4px;
        }

        .drag-handle:hover {
          background: #f1f5f9;
        }

        .item-topic {
          flex: 1;
          font-weight: 600;
          font-size: 14px;
          color: #0f172a;
          border: none;
          background: transparent;
          padding: 0;
        }

        .item-topic:focus {
          outline: none;
        }

        .item-actions {
          display: flex;
          gap: 8px;
        }

        .btn-regenerate-item,
        .btn-remove {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 6px;
          color: #64748b;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }

        .btn-regenerate-item:hover {
          color: #10b981;
        }

        .btn-remove:hover {
          color: #ef4444;
        }

        .item-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }

        .item-owner,
        .item-duration {
          font-size: 13px;
        }

        .item-owner,
        .item-duration,
        .item-description,
        .item-output {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          background: white;
          color: #0f172a;
          font-family: inherit;
        }

        .item-description,
        .item-output {
          grid-column: 1 / -1;
          resize: vertical;
          margin-bottom: 0;
        }

        .input-with-suffix {
          position: relative;
        }

        .input-suffix {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 11px;
          pointer-events: none;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }

        .btn-primary {
          background: #6366f1;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 12px;
        }

        .preview-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .preview-section {
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .preview-section h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #0f172a;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .preview-section h4 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #0f172a;
        }

        .preview-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 13px;
        }

        .preview-info p {
          margin: 0;
          color: #0f172a;
        }

        .preview-info strong {
          color: #0f172a;
        }

        .agenda-timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .timeline-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .time-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          padding: 4px 8px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        .topic-content {
          flex: 1;
        }

        .topic-content strong {
          color: #0f172a;
          font-size: 14px;
          display: block;
          margin-bottom: 4px;
        }

        .owner {
          font-size: 12px;
          color: #64748b;
        }

        .description {
          font-size: 12px;
          color: #0f172a;
          margin: 4px 0 0 0;
          line-height: 1.4;
        }

        .expected-output {
          font-size: 11px;
          color: #64748b;
          margin: 4px 0 0 0;
          line-height: 1.4;
        }

        .btn-download {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
          transition: all 0.3s ease;
        }

        .btn-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }

        .error-message {
          max-width: 1600px;
          margin: 0 auto 20px;
          padding: 16px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        @media (max-width: 768px) {
          .editor-content {
            grid-template-columns: 1fr;
          }

          .editor-panel,
          .preview-panel {
            position: static;
          }

          .item-details {
            grid-template-columns: 1fr;
          }

          .editor-header {
            flex-direction: column;
          }

          .editor-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

export default AgendaEditor;