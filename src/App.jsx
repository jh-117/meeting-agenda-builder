import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import { useTheme } from './hooks/useTheme';
import { useNotification } from './hooks/useNotification';
import LandingPage from './pages/LandingPage';
import FormStep1 from './pages/FormStep1';
import AgendaEditor from './pages/AgendaEditor';
import AIPreviewPage from './pages/AIPreviewPage';
import NotificationToast from './components/NotificationToast';
import ThemeToggle from './components/ThemeToggle';
import LoadingSpinner from './components/LoadingSpinner';
import { generateAgendaWithAI, regenerateAgendaWithAI } from './services/agendaAIService';

function App() {
  const [currentStep, setCurrentStep] = useState('landing');
  const [agendaData, setAgendaData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const { notification, showNotification, hideNotification } = useNotification();
  const { i18n } = useTranslation();

  // Test if notification system works
  React.useEffect(() => {
    console.log('🔔 Current notification:', notification);
  }, [notification]);

  const handleStartClick = () => {
    console.log('🎯 Start button clicked, moving to step1');
    setCurrentStep('step1');
    showNotification('请填写会议基本信息', 'info');
  };

  const handleStep1Submit = async (formData) => {
    console.log('📝 Form submitted:', formData);
    setIsGenerating(true);
    showNotification('AI正在生成议程，请稍候...', 'info');
    
    try {
      console.log("🔤 App.jsx - 当前语言:", i18n.language);
      
      const generatedAgenda = await generateAgendaWithAI(formData, i18n.language);
      console.log('🤖 AI Generated agenda:', generatedAgenda);

      const completeAgendaData = {
        ...formData,
        ...generatedAgenda,
      };

      setAgendaData(completeAgendaData);
      setCurrentStep('ai-preview');
      
      showNotification('✨ AI议程已生成！请查看预览', 'success');
    } catch (error) {
      console.error('Error generating agenda:', error);
      showNotification(`❌ 生成议程失败: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setCurrentStep('landing');
    setAgendaData(null);
    showNotification('已重置到首页', 'info');
  };

  const handleRegenerateAgenda = async () => {
    setIsGenerating(true);
    showNotification('AI正在重新生成议程...', 'info');
    
    try {
      console.log("🔤 App.jsx - 重新生成时语言:", i18n.language);
      
      const regeneratedAgenda = await regenerateAgendaWithAI(agendaData, i18n.language);
      
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

  // Debug current step
  React.useEffect(() => {
    console.log('🔄 Current step:', currentStep);
    console.log('📊 Agenda data:', agendaData);
  }, [currentStep, agendaData]);

  return (
    <div className={`app ${theme}`}>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      
      {/* Debug info - remove in production */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        Step: {currentStep}
      </div>
      
      {/* Step-based navigation */}
      {currentStep === 'landing' && (
        <LandingPage onStartClick={handleStartClick} />
      )}
      
      {currentStep === 'step1' && (
        <FormStep1 onSubmit={handleStep1Submit} />
      )}
      
      {currentStep === 'ai-preview' && agendaData && (
        <AIPreviewPage 
          agendaData={agendaData}
          onEdit={() => {
            console.log('✏️ Editing agenda');
            setCurrentStep('editor');
          }}
          onBack={() => {
            console.log('🔙 Back to editor');
            setCurrentStep('editor');
          }}
          onDownloadComplete={() => {
            showNotification('议程下载完成！', 'success');
          }}
        />
      )}
      
      {currentStep === 'editor' && agendaData && (
        <AgendaEditor
          agendaData={agendaData}
          onReset={handleReset}
          onDataChange={setAgendaData}
          onRegenerate={handleRegenerateAgenda}
          isRegenerating={isGenerating}
        />
      )}
      
      {isGenerating && <LoadingSpinner />}

      {/* Notification Toast - make sure it's properly configured */}
      {notification && (
        <NotificationToast
          notification={notification}
          onClose={hideNotification}
        />
      )}
    </div>
  );
}

export default App;