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
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  generateAgendaWithAI, 
  regenerateAgendaWithAI, 
  regenerateAgendaItemWithAI 
} from "../services/agendaAIService";
import "./AgendaEditor.css";

// 可排序的议程项组件
const SortableAgendaItem = ({ item, index, onChange, onRemove, onRegenerateItem, currentLanguage, isGeneratingItem }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRegenerate = () => {
    onRegenerateItem(item.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`edit-item ${isDragging ? 'dragging' : ''}`}
    >
      <div className="item-header">
        <div {...attributes} {...listeners} className="drag-handle">
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
            onClick={handleRegenerate}
            disabled={isGeneratingItem === item.id}
            title={currentLanguage === 'zh' ? 'AI重新生成此项' : 'AI Regenerate This Item'}
          >
            <RefreshCw size={14} className={isGeneratingItem === item.id ? 'spinning' : ''} />
          </button>
          <button 
            className="btn-remove"
            onClick={() => onRemove(index)}
            title={currentLanguage === 'zh' ? '删除' : 'Remove'}
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

function AgendaEditor({ agendaData, onPreview, onReset, onDataChange }) {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingItem, setIsGeneratingItem] = useState(null);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [error, setError] = useState(null);

  // 为议程项添加唯一ID（如果还没有的话）
  const agendaItemsWithId = agendaData.agendaItems.map((item, index) => ({
    ...item,
    id: item.id || `agenda-${index}-${Date.now()}`
  }));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleChange = (field, value) => {
    const updated = { ...agendaData, [field]: value };
    onDataChange(updated);
  };

  const handleAgendaItemChange = (index, field, value) => {
    const updated = [...agendaItemsWithId];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("agendaItems", updated);
  };

  const handleActionItemChange = (index, field, value) => {
    const updated = [...agendaData.actionItems];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("actionItems", updated);
  };

  // 拖拽排序
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = agendaItemsWithId.findIndex((item) => item.id === active.id);
      const newIndex = agendaItemsWithId.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(agendaItemsWithId, oldIndex, newIndex);
      handleChange("agendaItems", newItems);
    }
  };

  // 添加新议程项
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

  // 删除议程项
  const removeAgendaItem = (index) => {
    const updated = agendaItemsWithId.filter((_, i) => i !== index);
    handleChange("agendaItems", updated);
  };

  // 添加新行动项
  const addActionItem = () => {
    const newItem = {
      task: '',
      owner: '',
      deadline: new Date().toISOString().split('T')[0]
    };
    handleChange("actionItems", [...agendaData.actionItems, newItem]);
  };

  // 删除行动项
  const removeActionItem = (index) => {
    const updated = agendaData.actionItems.filter((_, i) => i !== index);
    handleChange("actionItems", updated);
  };

  // AI 重新生成整个议程
  const handleRegenerateAll = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const agendaDataForAI = {
        agendaItems: agendaItemsWithId,
        meetingTitle: agendaData.meetingTitle,
        duration: agendaData.duration,
        meetingObjective: agendaData.meetingObjective
      };
      
      const result = await regenerateAgendaWithAI(agendaDataForAI, currentLanguage);
      
      // 更新议程项和行动项
      handleChange("agendaItems", result.agendaItems || []);
      handleChange("actionItems", result.actionItems || []);
      
    } catch (err) {
      console.error('重新生成失败:', err);
      setError(err.message || (currentLanguage === 'zh' ? '重新生成失败，请重试' : 'Regeneration failed, please try again'));
    } finally {
      setIsGenerating(false);
    }
  };

  // AI 重新生成单个议程项
  const handleRegenerateItem = async (itemId) => {
    setIsGeneratingItem(itemId);
    setError(null);
    try {
      const item = agendaItemsWithId.find(item => item.id === itemId);
      const context = {
        meetingTitle: agendaData.meetingTitle,
        meetingObjective: agendaData.meetingObjective
      };
      
      const result = await regenerateAgendaItemWithAI(item, context, currentLanguage);
      
      // 更新单个议程项
      const updatedItems = agendaItemsWithId.map(item => 
        item.id === itemId ? { ...item, ...result } : item
      );
      handleChange("agendaItems", updatedItems);
      
    } catch (err) {
      console.error('重新生成议程项失败:', err);
      setError(err.message || (currentLanguage === 'zh' ? '重新生成此项失败' : 'Failed to regenerate this item'));
    } finally {
      setIsGeneratingItem(null);
    }
  };

  // 导出议程
  const handleExport = () => {
    console.log(`Exporting as ${exportFormat}`, agendaData);
    alert(`${currentLanguage === 'zh' ? '导出功能即将实现' : 'Export feature coming soon'}`);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US');
  };

  return (
    <div className="agenda-editor">
      {/* Header */}
      <div className="editor-header">
        <div className="header-title">
          <h1>{agendaData.meetingTitle}</h1>
          <p>{agendaData.meetingDate} • {agendaData.meetingTime} • {agendaData.duration} {currentLanguage === 'zh' ? '分钟' : 'minutes'}</p>
        </div>

        <div className="editor-actions">
          <button className="btn-icon" onClick={onPreview}>
            <Eye size={16} /> {currentLanguage === 'zh' ? '预览' : 'Preview'}
          </button>

          <button 
            className="btn-icon btn-regenerate" 
            onClick={handleRegenerateAll}
            disabled={isGenerating}
          >
            <RefreshCw size={16} className={isGenerating ? 'spinning' : ''} />
            {isGenerating 
              ? (currentLanguage === 'zh' ? 'AI生成中...' : 'AI Generating...') 
              : (currentLanguage === 'zh' ? 'AI重新生成' : 'AI Regenerate')
            }
          </button>

          <button className="btn-icon btn-reset" onClick={onReset}>
            <RotateCcw size={16} /> {currentLanguage === 'zh' ? '重新开始' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Editor Content */}
      <div className="editor-content">
        {/* 左侧编辑面板 */}
        <div className="editor-panel">
          {/* Basic Info */}
          <section className="edit-section">
            <h2>📋 {currentLanguage === 'zh' ? '基本信息' : 'Basic Information'}</h2>

            <div className="edit-group">
              <label>{currentLanguage === 'zh' ? '会议标题' : 'Meeting Title'}</label>
              <input
                value={agendaData.meetingTitle}
                onChange={(e) => handleChange("meetingTitle", e.target.value)}
                placeholder={currentLanguage === 'zh' ? '输入会议标题...' : 'Enter meeting title...'}
              />
            </div>

            <div className="edit-group">
              <label>{currentLanguage === 'zh' ? '会议目的' : 'Meeting Objective'}</label>
              <textarea
                value={agendaData.meetingObjective}
                onChange={(e) => handleChange("meetingObjective", e.target.value)}
                placeholder={currentLanguage === 'zh' ? '描述会议目的...' : 'Describe meeting objective...'}
                rows="4"
              />
            </div>
          </section>

          {/* Agenda Items with Drag & Drop */}
          <section className="edit-section">
            <div className="section-header">
              <h2>🗓️ {currentLanguage === 'zh' ? '议程项' : 'Agenda Items'} ({agendaItemsWithId.length})</h2>
              <button className="btn-add" onClick={addAgendaItem}>
                + {currentLanguage === 'zh' ? '添加议程项' : 'Add Item'}
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={agendaItemsWithId.map(item => item.id)} strategy={verticalListSortingStrategy}>
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
              </SortableContext>
            </DndContext>

            {agendaItemsWithId.length === 0 && (
              <div className="empty-state">
                <p>{currentLanguage === 'zh' ? '暂无议程项' : 'No agenda items yet'}</p>
                <button className="btn-primary" onClick={addAgendaItem}>
                  + {currentLanguage === 'zh' ? '添加第一个议程项' : 'Add First Agenda Item'}
                </button>
              </div>
            )}
          </section>

          {/* Action Items */}
          <section className="edit-section">
            <div className="section-header">
              <h2>✅ {currentLanguage === 'zh' ? '行动项' : 'Action Items'} ({agendaData.actionItems.length})</h2>
              <button className="btn-add" onClick={addActionItem}>
                + {currentLanguage === 'zh' ? '添加行动项' : 'Add Action'}
              </button>
            </div>

            {agendaData.actionItems.map((item, index) => (
              <div className="edit-item action-item" key={index}>
                <div className="item-header">
                  <input
                    placeholder={currentLanguage === 'zh' ? '任务描述' : 'Task description'}
                    value={item.task}
                    onChange={(e) => handleActionItemChange(index, "task", e.target.value)}
                    className="item-task"
                  />
                  <button 
                    className="btn-remove"
                    onClick={() => removeActionItem(index)}
                    title={currentLanguage === 'zh' ? '删除' : 'Remove'}
                  >
                    ×
                  </button>
                </div>
                
                <div className="item-details">
                  <input
                    placeholder={currentLanguage === 'zh' ? '负责人' : 'Owner'}
                    value={item.owner}
                    onChange={(e) => handleActionItemChange(index, "owner", e.target.value)}
                    className="item-owner"
                  />
                  <input
                    type="date"
                    value={item.deadline}
                    onChange={(e) => handleActionItemChange(index, "deadline", e.target.value)}
                    className="item-deadline"
                  />
                </div>
              </div>
            ))}

            {agendaData.actionItems.length === 0 && (
              <div className="empty-state">
                <p>{currentLanguage === 'zh' ? '暂无行动项' : 'No action items yet'}</p>
              </div>
            )}
          </section>
        </div>

        {/* 右侧预览和导出面板 */}
        <div className="preview-panel">
          <div className="preview-header">
            <h2>👁️ {currentLanguage === 'zh' ? '预览' : 'Preview'}</h2>
            
            {/* 导出选项 */}
            <div className="export-options">
              <label>{currentLanguage === 'zh' ? '导出格式:' : 'Export as:'}</label>
              <div className="format-buttons">
                <button 
                  className={`format-btn ${exportFormat === 'pdf' ? 'active' : ''}`}
                  onClick={() => setExportFormat('pdf')}
                  title="PDF"
                >
                  <FileText size={16} />
                </button>
                <button 
                  className={`format-btn ${exportFormat === 'word' ? 'active' : ''}`}
                  onClick={() => setExportFormat('word')}
                  title="Word"
                >
                  <FileDown size={16} />
                </button>
                <button 
                  className={`format-btn ${exportFormat === 'txt' ? 'active' : ''}`}
                  onClick={() => setExportFormat('txt')}
                  title="Text"
                >
                  <FileCode size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="preview-content">
            {/* 预览内容 */}
            <div className="preview-section">
              <h3>{agendaData.meetingTitle}</h3>
              
              <div className="preview-info">
                <p><strong>{currentLanguage === 'zh' ? '日期:' : 'Date:'}</strong> {formatDate(agendaData.meetingDate)}</p>
                <p><strong>{currentLanguage === 'zh' ? '时间:' : 'Time:'}</strong> {agendaData.meetingTime}</p>
                <p><strong>{currentLanguage === 'zh' ? '时长:' : 'Duration:'}</strong> {agendaData.duration} {currentLanguage === 'zh' ? '分钟' : 'minutes'}</p>
                <p><strong>{currentLanguage === 'zh' ? '地点:' : 'Location:'}</strong> {agendaData.location}</p>
                <p><strong>{currentLanguage === 'zh' ? '主持人:' : 'Facilitator:'}</strong> {agendaData.facilitator}</p>
                {agendaData.noteTaker && (
                  <p><strong>{currentLanguage === 'zh' ? '记录人:' : 'Note Taker:'}</strong> {agendaData.noteTaker}</p>
                )}
              </div>
            </div>

            <div className="preview-section">
              <h4>{currentLanguage === 'zh' ? '会议目的' : 'Meeting Objective'}</h4>
              <p>{agendaData.meetingObjective}</p>
            </div>

            <div className="preview-section">
              <h4>{currentLanguage === 'zh' ? '议程安排' : 'Agenda'}</h4>
              <div className="agenda-timeline">
                {agendaItemsWithId.map((item, index) => (
                  <div key={item.id} className="timeline-item">
                    <div className="time-slot">{item.timeAllocation}{currentLanguage === 'zh' ? '分钟' : 'min'}</div>
                    <div className="topic-content">
                      <strong>{item.topic}</strong>
                      {item.owner && <span className="owner"> • {item.owner}</span>}
                      {item.description && <p className="description">{item.description}</p>}
                      {item.expectedOutput && (
                        <p className="expected-output">
                          <em>{currentLanguage === 'zh' ? '预期产出: ' : 'Expected: '}</em>
                          {item.expectedOutput}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {agendaData.actionItems.length > 0 && (
              <div className="preview-section">
                <h4>{currentLanguage === 'zh' ? '行动项' : 'Action Items'}</h4>
                <div className="action-items">
                  {agendaData.actionItems.map((item, index) => (
                    <div key={index} className="action-item">
                      <div className="task">{item.task}</div>
                      <div className="action-details">
                        {item.owner && <span>{item.owner}</span>}
                        {item.deadline && <span>{formatDate(item.deadline)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 导出按钮 */}
            <button className="btn-download" onClick={handleExport}>
              <Download size={16} /> 
              {currentLanguage === 'zh' ? '下载议程' : 'Download Agenda'} 
              ({exportFormat.toUpperCase()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgendaEditor;