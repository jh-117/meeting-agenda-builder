import React, { useState, useEffect } from 'react';
import './App.css';
import { useTheme } from './hooks/useTheme';
import { useNotification } from './hooks/useNotification';
import LandingPage from './pages/LandingPage';
import FormStep1 from './pages/FormStep1';
import AgendaEditor from './pages/AgendaEditor';
import PreviewModal from './components/PreviewModal';
import NotificationToast from './components/NotificationToast';
import ThemeToggle from './components/ThemeToggle';
import LoadingSpinner from './components/LoadingSpinner'; // 需要创建这个组件
import { generateAgendaWithAI, regenerateAgendaWithAI } from './services/agendaAIService';

function App() {
  const [currentStep, setCurrentStep] = useState('landing'); // landing, step1, editor, preview
  const [agendaData, setAgendaData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { notification, showNotification, hideNotification } = useNotification();

  const handleStartClick = () => {
    setCurrentStep('step1');
  };

  const handleStep1Submit = async (formData) => {
    setIsGenerating(true);
    try {
      // 调用 AI 生成议程
      const generatedAgenda = await generateAgendaWithAI(formData);

      // 合并表单数据和生成的议程数据
      const completeAgendaData = {
        ...formData,
        ...generatedAgenda,
      };

      setAgendaData(completeAgendaData);
      setCurrentStep('editor');
      
      showNotification('✨ 议程已生成！现在可以编辑了', 'success');
    } catch (error) {
      console.error('Error generating agenda:', error);
      showNotification(`❌ 生成议程失败: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewClick = () => {
    setShowPreview(true);
  };

  const handleDownload = (format) => {
    setShowPreview(false);
    // 延迟以显示通知
    setTimeout(() => {
      showNotification(`议程已成功导出为 ${format} 格式！`, 'success');
    }, 300);
  };

  const handleBackToEditor = () => {
    setShowPreview(false);
  };

  const handleReset = () => {
    setCurrentStep('landing');
    setAgendaData(null);
    setShowPreview(false);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const regeneratedAgenda = await regenerateAgendaWithAI(agendaData);
      
      const updatedAgendaData = {
        ...agendaData,
        ...regeneratedAgenda,
      };
      
      setAgendaData(updatedAgendaData);
      showNotification('✨ 议程已重新生成！', 'success');
    } catch (error) {
      console.error('Error regenerating agenda:', error);
      showNotification(`❌ 重新生成失败: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`app ${theme}`}>
      <div className="app-background"></div>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      
      {isGenerating && <LoadingSpinner />}
      
      <div className="app-content">
        {currentStep === 'landing' && (
          <LandingPage onStart={handleStartClick} />
        )}
        
        {currentStep === 'step1' && (
          <FormStep1 
            onSubmit={handleStep1Submit}
            isLoading={isGenerating}
          />
        )}
        
        {currentStep === 'editor' && agendaData && (
          <AgendaEditor
            agendaData={agendaData}
            onPreview={handlePreviewClick}
            onReset={handleReset}
            onDataChange={setAgendaData}
            onRegenerate={handleRegenerate}
            isRegenerating={isGenerating}
          />
        )}
      </div>

      {showPreview && agendaData && (
        <PreviewModal
          agendaData={agendaData}
          onDownload={handleDownload}
          onClose={handleBackToEditor}
        />
      )}

      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </div>
  );
}

export default App;