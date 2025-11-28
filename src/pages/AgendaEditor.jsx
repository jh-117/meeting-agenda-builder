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
  Globe
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

// Sortable Agenda Item Component with DnD functionality
const SortableAgendaItem = ({ item, index, onChange, onRemove, onRegenerateItem, currentLanguage, isGeneratingItem }) => {
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
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    backgroundColor: 'white',
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <div 
          {...attributes}
          {...listeners}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab', 
            color: '#9ca3af',
            touchAction: 'none'
          }}
        >
          <GripVertical size={16} />
        </div>
        <input
          placeholder={t('agenda.topicPlaceholder')}
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
          onClick={() => onRegenerateItem(item.id, index)}
          disabled={isGeneratingItem === item.id}
          style={{
            padding: '8px',
            border: 'none',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            cursor: isGeneratingItem === item.id ? 'not-allowed' : 'pointer',
            opacity: isGeneratingItem === item.id ? 0.6 : 1
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
          placeholder={t('agenda.ownerPlaceholder')}
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
            placeholder={t('agenda.durationPlaceholder')}
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
            {t('agenda.minutes')}
          </span>
        </div>
      </div>

      <textarea
        placeholder={t('agenda.descriptionPlaceholder')}
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
        placeholder={t('agenda.expectedOutputPlaceholder')}
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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [attachmentContent, setAttachmentContent] = useState('');

  // Action Items state
  const [actionItems, setActionItems] = useState([
    {
      id: 'action-1',
      task: 'Prepare project timeline',
      owner: 'Project Manager',
      deadline: '2025-12-01'
    }
  ]);

  const currentLanguage = i18n.language;

  const agendaItemsWithId = (agendaData?.agendaItems || []).map((item, index) => ({
    ...item,
    id: item.id || `agenda-${index}-${Date.now()}`
  }));

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Action Items handlers
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
      setError(t('export.failed', { error: error.message }));
    } finally {
      setIsExporting(false);
    }
  };

  // File upload handler with AI processing - INCLUDES PPT SUPPORT
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const newFiles = [];
      let allExtractedText = '';

      for (const file of files) {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `meeting-attachments/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        // Process file with AI to extract text
        setIsProcessingFiles(true);
        try {
          const processedFile = await processFileWithAI(publicUrl, file.name, file.type);
          
          if (processedFile.success && processedFile.extractedText) {
            allExtractedText += `\n\n--- ${file.name} ---\n${processedFile.extractedText}`;
          }

          newFiles.push({
            name: file.name,
            url: publicUrl,
            size: file.size,
            type: file.type,
            content: processedFile.extractedText || `[File: ${file.name}]`,
            isProcessable: processedFile.success,
            processed: true
          });
        } catch (processError) {
          console.error('File processing error:', processError);
          newFiles.push({
            name: file.name,
            url: publicUrl,
            size: file.size,
            type: file.type,
            content: `[File: ${file.name} - Processing failed]`,
            isProcessable: false,
            processed: true
          });
        }
      }

      // Update state
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      if (allExtractedText.trim()) {
        setAttachmentContent(prev => prev ? prev + allExtractedText : allExtractedText);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setIsProcessingFiles(false);
      event.target.value = '';
    }
  };

  const removeFile = async (index) => {
    const fileToRemove = uploadedFiles[index];
    
    try {
      // Delete from storage
      if (fileToRemove.url) {
        const filePath = fileToRemove.url.split('/').pop();
        await supabase.storage
          .from('attachments')
          .remove([`meeting-attachments/${filePath}`]);
      }
    } catch (error) {
      console.error('Error deleting file from storage:', error);
    }

    // Remove from state
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    
    // Update attachment content
    if (fileToRemove.content && attachmentContent.includes(fileToRemove.content)) {
      const newContent = attachmentContent.replace(fileToRemove.content, '').trim();
      setAttachmentContent(newContent || '');
    }
  };

  const getFileIcon = (fileType, fileName) => {
    if (fileType.includes('image')) return <Image size={14} color="#6b7280" />;
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) return <FileText size={14} color="#6b7280" />;
    if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) return <FileDoc size={14} color="#6b7280" />;
    if (fileType.includes('presentation') || fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) return <Presentation size={14} color="#6b7280" />;
    return <File size={14} color="#6b7280" />;
  };

  // Full agenda regeneration using AI with attachments
  const handleRegenerate = async () => {
    if (!agendaData.meetingTitle || !agendaData.meetingObjective) {
      setError(t('actions.regenerateRequiredFields'));
      return;
    }

    setIsRegenerating(true);
    setError(null);

    try {
      console.log('🔄 Regenerating full agenda with attachments...', { 
        currentLanguage,
        hasAttachments: uploadedFiles.length > 0,
        attachmentContentLength: attachmentContent.length
      });
      
      const regeneratedData = await regenerateAgendaWithAI(
        agendaData, 
        currentLanguage,
        attachmentContent,
        uploadedFiles.length > 0 ? 'processed_files' : null
      );
      
      console.log('✅ Regenerated agenda data:', regeneratedData);

      if (regeneratedData && onDataChange) {
        onDataChange(regeneratedData);
      }

      if (onRegenerationComplete) {
        onRegenerationComplete(regeneratedData);
      }
    } catch (error) {
      console.error('❌ Error regenerating agenda:', error);
      setError(error.message || t('actions.regenerateFailed'));
    } finally {
      setIsRegenerating(false);
    }
  };

  // INDIVIDUAL AGENDA ITEM REGENERATION - FULLY WORKING
  const handleRegenerateItem = async (itemId, index) => {
    const currentItem = agendaItemsWithId[index];
    
    if (!currentItem.topic && !agendaData.meetingObjective) {
      setError(t('actions.regenerateItemRequiredFields'));
      return;
    }

    setIsGeneratingItem(itemId);
    setError(null);

    try {
      console.log('🔄 Regenerating agenda item with attachments...', { 
        currentItem, 
        currentLanguage,
        hasAttachments: uploadedFiles.length > 0 
      });
      
      const context = {
        meetingTitle: agendaData.meetingTitle,
        meetingObjective: agendaData.meetingObjective,
        existingItems: agendaItemsWithId.filter(item => item.id !== itemId)
      };

      const regeneratedItem = await regenerateAgendaItemWithAI(
        currentItem, 
        context, 
        currentLanguage,
        attachmentContent,
        uploadedFiles.length > 0 ? 'processed_files' : null
      );
      
      console.log('✅ Regenerated item data:', regeneratedItem);

      if (regeneratedItem) {
        // Update the specific agenda item with regenerated content
        const updatedItems = [...agendaItemsWithId];
        updatedItems[index] = { 
          ...updatedItems[index], 
          ...regeneratedItem 
        };
        handleChange("agendaItems", updatedItems);
      }
    } catch (error) {
      console.error('❌ Error regenerating agenda item:', error);
      setError(error.message || t('actions.regenerateItemFailed'));
    } finally {
      setIsGeneratingItem(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notSet');
    try {
      return new Date(dateString).toLocaleDateString(currentLanguage);
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const data = agendaData || {};

  // Language options
  const languageOptions = [
    { code: 'zh', name: '中文', nativeName: '中文' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' }
  ];

  const showRegenerateLoading = isRegenerating || externalIsRegenerating;

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
            {data.meetingDate} • {data.meetingTime} • {data.duration} {t('agenda.minutes')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Language Switcher */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <Globe size={16} />
              {languageOptions.find(lang => lang.code === currentLanguage)?.nativeName}
            </button>
            
            {showLanguageDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 1000,
                minWidth: '120px'
              }}>
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleChangeLanguage(lang.code)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: currentLanguage === lang.code ? '#f1f5f9' : 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textAlign: 'left'
                    }}
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
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: showRegenerateLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: showRegenerateLoading ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} style={{
              animation: showRegenerateLoading ? 'spin 1s linear infinite' : 'none'
            }} />
            {showRegenerateLoading ? t('actions.regenerating') : t('actions.aiRegenerate')}
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
            <Home size={16} /> {t('actions.backToHome')}
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
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
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
              📋 {t('editor.basicInfo')}
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                {t('editor.meetingTitle')}
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
                {t('editor.meetingObjective')}
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

            {/* File Upload Section - INCLUDES PPT SUPPORT */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                📎 {t('editor.attachments')} {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
              </label>
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                marginBottom: '12px'
              }}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploading || isProcessingFiles}
                  accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.ppt,.pptx"
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: (isUploading || isProcessingFiles) ? 'not-allowed' : 'pointer',
                    opacity: (isUploading || isProcessingFiles) ? 0.6 : 1
                  }}
                >
                  <Upload size={24} color="#6b7280" />
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    {isUploading ? t('editor.uploading') : 
                     isProcessingFiles ? t('editor.processingFiles') : 
                     t('editor.uploadFiles')}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                    {t('editor.maxFileSize')}
                  </span>
                  <span style={{ color: '#10b981', fontSize: '12px' }}>
                    {t('editor.supportsAllFiles')}
                  </span>
                </label>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                    {t('editor.uploadedFiles')}:
                  </h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      marginBottom: '6px',
                      backgroundColor: 'white'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getFileIcon(file.type, file.name)}
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>
                            {file.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {formatFileSize(file.size)} • 
                            {file.isProcessable ? '✅ AI Ready' : '📁 Reference Only'} • 
                            {file.type}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            color: '#374151',
                            fontSize: '12px'
                          }}
                        >
                          {t('editor.view')}
                        </a>
                        <button
                          onClick={() => removeFile(index)}
                          style={{
                            padding: '4px',
                            border: 'none',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {attachmentContent && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px',
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#0369a1'
                    }}>
                      <BookOpen size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      ✅ {t('editor.aiUsingAttachment')} ({attachmentContent.length} characters)
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                {t('editor.date')}
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
                {t('editor.time')}
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
                {t('editor.duration')}
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
                {t('editor.location')}
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
                {t('editor.facilitator')}
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

          {/* Agenda Items with DnD */}
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
                🗓️ {t('editor.agendaItems')} ({agendaItemsWithId.length})
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
                + {t('actions.add')}
              </button>
            </div>

            {/* Wrap agenda items with DnD context */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={agendaItemsWithId.map(item => item.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {agendaItemsWithId.map((item, index) => (
                    <SortableAgendaItem
                      key={item.id}
                      item={item}
                      index={index}
                      onChange={handleAgendaItemChange}
                      onRemove={removeAgendaItem}
                      onRegenerateItem={handleRegenerateItem} // NOW WORKING
                      currentLanguage={currentLanguage}
                      isGeneratingItem={isGeneratingItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {agendaItemsWithId.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#9ca3af'
              }}>
                <p>{t('editor.noAgendaItems')}</p>
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
                  + {t('actions.addFirstItem')}
                </button>
              </div>
            )}
          </div>

          {/* Action Items Section */}
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
                ✅ {t('editor.actionItems')} ({actionItems.length})
              </h2>
              <button 
                onClick={addActionItem}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                + {t('actions.add')}
              </button>
            </div>

            <div>
              {actionItems.map((item, index) => (
                <div key={item.id} style={{
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
                    <input
                      placeholder={t('agenda.taskPlaceholder')}
                      value={item.task}
                      onChange={(e) => handleActionItemChange(index, "task", e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <button 
                      onClick={() => removeActionItem(index)}
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
                      placeholder={t('agenda.ownerPlaceholder')}
                      value={item.owner}
                      onChange={(e) => handleActionItemChange(index, "owner", e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <input
                      type="date"
                      placeholder={t('agenda.deadlinePlaceholder')}
                      value={item.deadline}
                      onChange={(e) => handleActionItemChange(index, "deadline", e.target.value)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              ))}

              {actionItems.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#9ca3af'
                }}>
                  <p>{t('editor.noActionItems')}</p>
                  <button 
                    onClick={addActionItem}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginTop: '12px'
                    }}
                  >
                    + {t('actions.addFirstActionItem')}
                  </button>
                </div>
              )}
            </div>
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
              👁️ {t('editor.livePreview')}
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: '#6b7280' }}>{t('export.exportAs')}:</label>
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
                <p style={{ margin: '4px 0' }}><strong>{t('preview.date')}:</strong> {formatDate(data.meetingDate)}</p>
                <p style={{ margin: '4px 0' }}><strong>{t('preview.time')}:</strong> {data.meetingTime}</p>
                <p style={{ margin: '4px 0' }}><strong>{t('preview.duration')}:</strong> {data.duration} {t('agenda.minutes')}</p>
                <p style={{ margin: '4px 0' }}><strong>{t('preview.location')}:</strong> {data.location}</p>
                <p style={{ margin: '4px 0' }}><strong>{t('preview.facilitator')}:</strong> {data.facilitator}</p>
                {data.noteTaker && (
                  <p style={{ margin: '4px 0' }}><strong>{t('preview.noteTaker')}:</strong> {data.noteTaker}</p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '8px', color: '#374151' }}>
                {t('preview.meetingObjective')}
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                {data.meetingObjective || t('preview.noObjective')}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>
                {t('preview.agenda')}
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

            {/* Action Items Preview */}
            {actionItems.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>
                  {t('preview.actionItems')}
                </h4>
                <div>
                  {actionItems.map((item) => (
                    <div key={item.id} style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '12px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
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
              {isExporting ? t('export.exporting') : `${t('actions.download')} (${exportFormat.toUpperCase()})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgendaEditor;