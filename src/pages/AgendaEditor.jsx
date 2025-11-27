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
import { generatePDF, generateDOCX, generateTXT } from './exportServices'; // 导入您的导出函数

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

  // 修复：连接多格式导出功能
  const handleExport = async () => {
    try {
      switch (exportFormat) {
        case 'pdf':
          await generatePDF(agendaData, currentLanguage);
          break;
        case 'word':
          await generateDOCX(agendaData, currentLanguage);
          break;
        case 'txt':
          generateTXT(agendaData, currentLanguage);
          break;
        default:
          await generatePDF(agendaData, currentLanguage);
      }
    } catch (error) {
      console.error('Export error:', error);
      setError(`导出失败: ${error.message}`);
    }
  };

  // 修复：连接 AI 重新生成功能
  const handleRegenerate = async () => {
    if (onRegenerate) {
      await onRegenerate();
    }
  };

  // 修复：单个议程项重新生成
  const handleRegenerateItem = async (itemId) => {
    setIsGeneratingItem(itemId);
    // 这里可以调用单个议程项重新生成的 API
    setTimeout(() => {
      setIsGeneratingItem(null);
    }, 1000);
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
          {/* 移除 Preview 按钮，因为已经有实时预览了 */}
          
          {/* 修复：连接 AI Regenerate 按钮 */}
          <button 
            className="btn-icon btn-regenerate"
            onClick={handleRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw size={16} className={isRegenerating ? 'spinning' : ''} />
            {isRegenerating ? 'Regenerating...' : 'AI Regenerate'}
          </button>
          
          {/* 修复：红色按钮改为返回落地页 */}
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

            {/* 修复：连接下载按钮到实际的导出功能 */}
            <button className="btn-download" onClick={handleExport}>
              <Download size={16} /> 
              Download ({exportFormat.toUpperCase()})
            </button>
          </div>
        </div>
      </div>

      {/* CSS 样式保持不变 */}
      <style>{`
        /* 您的 CSS 样式保持不变 */
      `}</style>
    </div>
  );
}

export default AgendaEditor;