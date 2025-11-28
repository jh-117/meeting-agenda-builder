import React, { useState } from "react";
import { 
  Download, 
  RotateCcw, 
  GripVertical,
  RefreshCw,
  FileText,
  FileDown,
  FileCode,
  Home,
  Globe,
  BookOpen
} from "lucide-react";
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
import { generatePDF, generateDOCX, generateTXT } from '../services/exportService';
import { useTranslation } from 'react-i18next';
import { 
  regenerateAgendaWithAI, 
  regenerateAgendaItemWithAI 
} from '../services/agendaAIService';
import './AgendaEditor.css';

// ============================================
// SORTABLE AGENDA ITEM COMPONENT
// ============================================
const SortableAgendaItem = ({ 
  item, 
  index, 
  onChange, 
  onRemove, 
  onRegenerateItem, 
  currentLanguage, 
  isGeneratingItem 
}) => {
  const { t } = useTranslation();
  
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
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`sortable-agenda-item ${isDragging ? 'dragging' : ''}`}
    >
      {/* Header with grip handle */}
      <div className="agenda-item-header">
        <div 
          {...attributes}
          {...listeners}
          className="grip-handle"
        >
          <GripVertical size={16} />
        </div>
        <input
          placeholder={t('agenda.topicPlaceholder')}
          value={item.topic}
          onChange={(e) => onChange(index, "topic", e.target.value)}
          className="agenda-item-topic"
        />
        <button 
          onClick={() => onRegenerateItem(item.id, index)}
          disabled={isGeneratingItem === item.id}
          className={`btn-regenerate ${isGeneratingItem === item.id ? 'loading' : ''}`}
          title={t('actions.regenerate')}
        >
          <RefreshCw size={14} />
        </button>
        <button 
          onClick={() => onRemove(index)}
          className="btn-remove-item"
          title={t('actions.remove')}
        >
          ×
        </button>
      </div>

      {/* Owner and Duration row */}
      <div className="agenda-item-row">
        <input
          placeholder={t('agenda.ownerPlaceholder')}
          value={item.owner}
          onChange={(e) => onChange(index, "owner", e.target.value)}
          className="agenda-item-owner"
        />
        <div className="time-allocation-group">
          <input
            type="number"
            placeholder={t('agenda.durationPlaceholder')}
            value={item.timeAllocation}
            onChange={(e) => onChange(index, "timeAllocation", parseInt(e.target.value) || 15)}
            min="5"
            className="agenda-item-time"
          />
          <span className="time-unit">{t('agenda.minutes')}</span>
        </div>
      </div>

      {/* Description textarea */}
      <textarea
        placeholder={t('agenda.descriptionPlaceholder')}
        value={item.description}
        onChange={(e) => onChange(index, "description", e.target.value)}
        rows="2"
        className="agenda-item-textarea"
      />

      {/* Expected Output textarea */}
      <textarea
        placeholder={t('agenda.expectedOutputPlaceholder')}
        value={item.expectedOutput}
        onChange={(e) => onChange(index, "expectedOutput", e.target.value)}
        rows="2"
        className="agenda-item-textarea"
      />
    </div>
  );
};

// ============================================
// MAIN AGENDA EDITOR COMPONENT
// ============================================
function AgendaEditor({ 
  agendaData = {
    meetingTitle: 'Q4 Project Planning Meeting',
    meetingDate: '2025-11-27',
    meetingTime: '14:00',
    duration: 60,
    location: 'Conference Room A',
    facilitator: 'JH',
    noteTaker: 'Li Si',
    meetingObjective: 'To discuss and align on Q4 project goals, finalize key deliverables, and determine resource allocation.',
    agendaItems: [
      {
        id: 'agenda-1',
        topic: 'Introduction and Meeting Objectives',
        owner: 'JH',
        timeAllocation: 5,
        description: 'Overview of the meeting objectives...',
        expectedOutput: 'Clear understanding of the meeting purpose'
      },
      {
        id: 'agenda-2',
        topic: 'Review of Q4 Project Goals',
        owner: 'Project Manager',
        timeAllocation: 10,
        description: 'Discussion of the primary goals...',
        expectedOutput: 'Agreement on the key goals...'
      }
    ]
  }, 
  initialFormData = null, // NEW: Receives original form data with attachments
  onReset, 
  onDataChange, 
  isRegenerating: externalIsRegenerating,
  onRegenerationComplete 
}) {
  const { t, i18n } = useTranslation();
  const [isGeneratingItem, setIsGeneratingItem] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Get action items from agendaData or initialize empty
  const [actionItems, setActionItems] = useState(
    agendaData.actionItems || []
  );

  const currentLanguage = i18n.language;

  // Extract attachment content from initial form data
  const attachmentContent = initialFormData?.attachmentContent || '';
  const attachmentType = initialFormData?.attachmentType || null;

  const agendaItemsWithId = (agendaData?.agendaItems || []).map((item, index) => ({
    ...item,
    id: item.id || `agenda-${index}-${Date.now()}`
  }));

  // Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = agendaItemsWithId.findIndex((item) => item.id === active.id);
      const newIndex = agendaItemsWithId.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(agendaItemsWithId, oldIndex, newIndex);
      handleChange("agendaItems", newItems);
    }
  };

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setShowLanguageDropdown(false);
  };

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

  // ============================================
  // AI REGENERATION HANDLERS (UPDATED)
  // ============================================

  const handleRegenerate = async () => {
    if (!agendaData.meetingTitle || !agendaData.meetingObjective) {
      setError(t('actions.regenerateRequiredFields'));
      return;
    }

    setIsRegenerating(true);
    setError(null);

    try {
      console.log('🔄 重新生成完整议程（使用原始附件）...', { 
        currentLanguage,
        hasAttachment: !!attachmentContent,
      });
      
      const regeneratedData = await regenerateAgendaWithAI(
        agendaData, 
        currentLanguage,
        attachmentContent, // Use stored attachment content
        attachmentType
      );
      
      console.log('✅ 重新生成的议程数据:', regeneratedData);

      if (regeneratedData && onDataChange) {
        const updatedData = {
          ...agendaData,
          agendaItems: regeneratedData.agendaItems || agendaData.agendaItems,
          actionItems: regeneratedData.actionItems || agendaData.actionItems
        };
        
        onDataChange(updatedData);
        
        // Update local action items state
        if (regeneratedData.actionItems) {
          setActionItems(regeneratedData.actionItems);
        }
      }

      if (onRegenerationComplete) {
        onRegenerationComplete(regeneratedData);
      }
    } catch (error) {
      console.error('❌ 重新生成议程错误:', error);
      setError(error.message || t('actions.regenerateFailed'));
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerateItem = async (itemId, index) => {
    const currentItem = agendaItemsWithId[index];
    
    if (!currentItem.topic && !agendaData.meetingObjective) {
      setError(t('actions.regenerateItemRequiredFields'));
      return;
    }

    setIsGeneratingItem(itemId);
    setError(null);

    try {
      console.log('🔄 重新生成议程项（使用原始附件）...');
      
      const context = {
        meetingTitle: agendaData.meetingTitle,
        meetingObjective: agendaData.meetingObjective,
        existingItems: agendaItemsWithId.filter(item => item.id !== itemId)
      };

      const regeneratedItem = await regenerateAgendaItemWithAI(
        currentItem, 
        context, 
        currentLanguage,
        attachmentContent, // Use stored attachment content
        attachmentType
      );
      
      console.log('✅ 重新生成的项目数据:', regeneratedItem);

      if (regeneratedItem) {
        const updatedItems = [...agendaItemsWithId];
        updatedItems[index] = { 
          ...updatedItems[index], 
          ...regeneratedItem 
        };
        handleChange("agendaItems", updatedItems);
      }
    } catch (error) {
      console.error('❌ 重新生成议程项错误:', error);
      setError(error.message || t('actions.regenerateItemFailed'));
    } finally {
      setIsGeneratingItem(null);
    }
  };

  // ============================================
  // EXPORT HANDLERS
  // ============================================

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setError(null);
      
      const exportData = {
        ...agendaData,
        agendaItems: agendaItemsWithId,
        actionItems: actionItems
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

  // ============================================
  // ACTION ITEMS HANDLERS
  // ============================================

  const handleActionItemChange = (index, field, value) => {
    const updatedItems = [...actionItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setActionItems(updatedItems);
  };

  const addActionItem = () => {
    const newItem = {
      id: `action-${Date.now()}`,
      task: '',
      owner: '',
      deadline: ''
    };
    setActionItems([...actionItems, newItem]);
  };

  const removeActionItem = (index) => {
    const updatedItems = actionItems.filter((_, i) => i !== index);
    setActionItems(updatedItems);
  };

  const data = agendaData || {};
  const showRegenerateLoading = isRegenerating || externalIsRegenerating;

  const languageOptions = [
    { code: 'zh', name: '中文', nativeName: '中文' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notSet');
    try {
      return new Date(dateString).toLocaleDateString(currentLanguage);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="agenda-editor">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className="editor-header">
        <div className="header-title">
          <h1>{data.meetingTitle}</h1>
          <p>{data.meetingDate} • {data.meetingTime} • {data.duration} {t('agenda.minutes')}</p>
        </div>

        <div className="header-actions">
          {/* Language Switcher */}
          <div className="language-switcher">
            <button 
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="btn-language"
            >
              <Globe size={16} />
              {languageOptions.find(lang => lang.code === currentLanguage)?.nativeName}
            </button>
            
            {showLanguageDropdown && (
              <div className="language-dropdown">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleChangeLanguage(lang.code)}
                    className={`language-option ${currentLanguage === lang.code ? 'active' : ''}`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleRegenerate}
            disabled={showRegenerateLoading}
            className={`btn-primary btn-regenerate-full ${showRegenerateLoading ? 'loading' : ''}`}
          >
            <RefreshCw size={16} className={showRegenerateLoading ? 'spin' : ''} />
            {showRegenerateLoading ? t('actions.regenerating') : t('actions.aiRegenerate')}
          </button>
          
          <button 
            onClick={onReset}
            className="btn-danger"
          >
            <Home size={16} /> {t('actions.backToHome')}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="btn-close-error"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="editor-grid">
        {/* Left Panel - Editor */}
        <div className="editor-left-panel">
          {/* Basic Info */}
          <div className="editor-card">
            <h2>📋 {t('editor.basicInfo')}</h2>
            
            <div className="form-group">
              <label>{t('editor.meetingTitle')}</label>
              <input
                value={data.meetingTitle}
                onChange={(e) => handleChange("meetingTitle", e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>{t('editor.meetingObjective')}</label>
              <textarea
                value={data.meetingObjective}
                onChange={(e) => handleChange("meetingObjective", e.target.value)}
                rows="4"
                className="form-textarea"
              />
            </div>

            {/* REMOVED: File Upload Section */}
            {/* ADDED: Attachment Info Display */}
            {initialFormData?.attachmentMetadata && initialFormData.attachmentMetadata.length > 0 && (
              <div className="form-group">
                <label>📎 {t('editor.attachmentsUsed') || '已使用的附件'}</label>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#0369a1'
                }}>
                  <div style={{ marginBottom: '8px', fontWeight: '500' }}>
                    ✅ {initialFormData.attachmentMetadata.length} 个文件已用于AI生成
                  </div>
                  {initialFormData.attachmentMetadata.map((file, idx) => (
                    <div key={idx} style={{ marginLeft: '12px', color: '#0c4a6e' }}>
                      • {file.name} {file.isProcessable ? '(已处理)' : '(参考)'}
                    </div>
                  ))}
                  {attachmentContent && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #bae6fd' }}>
                      <BookOpen size={12} />
                      📝 AI已使用附件内容 ({attachmentContent.length} 字符)
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>{t('editor.date')}</label>
                <input
                  type="date"
                  value={data.meetingDate}
                  onChange={(e) => handleChange("meetingDate", e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>{t('editor.time')}</label>
                <input
                  type="time"
                  value={data.meetingTime}
                  onChange={(e) => handleChange("meetingTime", e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>{t('editor.duration')}</label>
                <input
                  type="number"
                  value={data.duration}
                  onChange={(e) => handleChange("duration", parseInt(e.target.value) || 60)}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('editor.location')}</label>
              <input
                value={data.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>{t('editor.facilitator')}</label>
              <input
                value={data.facilitator}
                onChange={(e) => handleChange("facilitator", e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Agenda Items */}
          <div className="editor-card">
            <div className="card-header">
              <h2>🗓️ {t('editor.agendaItems')} ({agendaItemsWithId.length})</h2>
              <button 
                onClick={addAgendaItem}
                className="btn-add"
              >
                + {t('actions.add')}
              </button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={agendaItemsWithId.map(item => item.id)} 
                strategy={verticalListSortingStrategy}
              >
                {agendaItemsWithId.length > 0 ? (
                  <div className="agenda-items-list">
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
                ) : (
                  <div className="empty-state">
                    <p>{t('editor.noAgendaItems')}</p>
                    <button 
                      onClick={addAgendaItem}
                      className="btn-add"
                    >
                      + {t('actions.addFirstItem')}
                    </button>
                  </div>
                )}
              </SortableContext>
            </DndContext>
          </div>

          {/* Action Items */}
          <div className="editor-card">
            <div className="card-header">
              <h2>✅ {t('editor.actionItems')} ({actionItems.length})</h2>
              <button 
                onClick={addActionItem}
                className="btn-add"
              >
                + {t('actions.add')}
              </button>
            </div>

            {actionItems.length > 0 ? (
              <div className="action-items-list">
                {actionItems.map((item, index) => (
                  <div key={item.id} className="action-item">
                    <div className="agenda-item-header">
                      <input
                        placeholder={t('agenda.taskPlaceholder')}
                        value={item.task}
                        onChange={(e) => handleActionItemChange(index, "task", e.target.value)}
                        className="action-item-task"
                      />
                      <button 
                        onClick={() => removeActionItem(index)}
                        className="btn-remove-item"
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="action-item-row">
                      <input
                        placeholder={t('agenda.ownerPlaceholder')}
                        value={item.owner}
                        onChange={(e) => handleActionItemChange(index, "owner", e.target.value)}
                        className="action-item-owner"
                      />
                      <input
                        type="date"
                        placeholder={t('agenda.deadlinePlaceholder')}
                        value={item.deadline}
                        onChange={(e) => handleActionItemChange(index, "deadline", e.target.value)}
                        className="action-item-deadline"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{t('editor.noActionItems')}</p>
                <button 
                  onClick={addActionItem}
                  className="btn-add"
                >
                  + {t('actions.addFirstActionItem')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="editor-right-panel">
          <div className="preview-section">
            <div className="card-header" style={{ marginBottom: '20px' }}>
              <h2>👁️ {t('editor.livePreview')}</h2>
              
              <div className="export-controls">
                <label className="export-label">{t('export.exportAs')}:</label>
                <div className="export-buttons">
                  <button 
                    onClick={() => setExportFormat('pdf')}
                    className={`btn-export-format ${exportFormat === 'pdf' ? 'active' : ''}`}
                    title="PDF"
                  >
                    <FileText size={16} />
                  </button>
                  <button 
                    onClick={() => setExportFormat('word')}
                    className={`btn-export-format ${exportFormat === 'word' ? 'active' : ''}`}
                    title="Word"
                  >
                    <FileDown size={16} />
                  </button>
                  <button 
                    onClick={() => setExportFormat('txt')}
                    className={`btn-export-format ${exportFormat === 'txt' ? 'active' : ''}`}
                    title="Text"
                  >
                    <FileCode size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="preview-content">
              {/* Meeting Title */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#1f2937' }}>
                  {data.meetingTitle}
                </h3>
                
                <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                  <p style={{ margin: '4px 0' }}>
                    <strong>{t('preview.date')}:</strong> {formatDate(data.meetingDate)}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>{t('preview.time')}:</strong> {data.meetingTime}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>{t('preview.duration')}:</strong> {data.duration} {t('agenda.minutes')}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>{t('preview.location')}:</strong> {data.location}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>{t('preview.facilitator')}:</strong> {data.facilitator}
                  </p>
                  {data.noteTaker && (
                    <p style={{ margin: '4px 0' }}>
                      <strong>{t('preview.noteTaker')}:</strong> {data.noteTaker}
                    </p>
                  )}
                </div>
              </div>

              {/* Meeting Objective */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '8px', color: '#374151' }}>
                  {t('preview.meetingObjective')}
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                  {data.meetingObjective || t('preview.noObjective')}
                </p>
              </div>

              {/* Agenda Items */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>
                  {t('preview.agenda')}
                </h4>
                <div>
                  {agendaItemsWithId.length > 0 ? (
                    agendaItemsWithId.map((item) => (
                      <div 
                        key={item.id} 
                        className="preview-item"
                      >
                        <div className="preview-time">
                          {item.timeAllocation || 15}{t('agenda.minutesShort')}
                        </div>
                        <div className="preview-details">
                          <div className="preview-topic">
                            {item.topic || t('preview.untitledTopic')}
                          </div>
                          {item.owner && (
                            <span className="preview-owner">
                              • {item.owner}
                            </span>
                          )}
                          {item.description && (
                            <p className="preview-description">
                              {item.description}
                            </p>
                          )}
                          {item.expectedOutput && (
                            <p className="preview-output">
                              <em>{t('preview.expected')}:</em> {item.expectedOutput}
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

              {/* Action Items */}
              {actionItems.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>
                    {t('preview.actionItems')}
                  </h4>
                  <div>
                    {actionItems.map((item) => (
                      <div key={item.id} className="preview-item">
                        <div className="preview-details">
                          <div className="preview-topic">
                            {item.task || t('preview.untitledTask')}
                          </div>
                          {item.owner && (
                            <span className="preview-owner">
                              • {item.owner}
                            </span>
                          )}
                          {item.deadline && (
                            <p style={{ margin: '4px 0', fontSize: '13px', color: '#6b7280' }}>
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

            {/* Export Button */}
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className={`btn-download ${isExporting ? 'loading' : ''}`}
            >
              <Download size={16} className={isExporting ? 'spin' : ''} />
              {isExporting ? t('export.exporting') : `${t('actions.download')} (${exportFormat.toUpperCase()})`}
            </button>

            {/* Tip Box */}
            <div className="tip-box">
              <h4 className="tip-title">💡 {t('aiPreview.tip')}</h4>
              <p className="tip-content">
                {t('aiPreview.tipContent')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgendaEditor;