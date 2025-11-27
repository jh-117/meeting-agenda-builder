import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Add this import
import './App.css';
import { useTheme } from './hooks/useTheme';
import { useNotification } from './hooks/useNotification';
import LandingPage from './pages/LandingPage';
import FormStep1 from './pages/FormStep1';
import AgendaEditor from './pages/AgendaEditor';
import AIPreviewPage from './pages/AIPreviewPage'; // Add this import
import NotificationToast from './components/NotificationToast';
import ThemeToggle from './components/ThemeToggle';
import LoadingSpinner from './components/LoadingSpinner';
import { generateAgendaWithAI, regenerateAgendaWithAI } from './services/agendaAIService';

function App() {
  const [currentStep, setCurrentStep] = useState('landing');
  const [agendaData, setAgendaData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { notification, showNotification, hideNotification } = useNotification();
  const { i18n } = useTranslation();

  const handleStartClick = () => {
    setCurrentStep('step1');
  };

  const handleStep1Submit = async (formData) => {
    setIsGenerating(true);
    try {
      console.log("🔤 App.jsx - 当前语言:", i18n.language);
      
      const generatedAgenda = await generateAgendaWithAI(formData, i18n.language);

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

  const handleRegenerateAgenda = async () => {
    setIsGenerating(true);
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

  return (
    <Router>
      <div className={`app ${theme}`}>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        
        <Routes>
          {/* Route for AIPreviewPage */}
          <Route 
            path="/ai-preview" 
            element={
              <AIPreviewPage 
                agendaData={agendaData}
                onEdit={(data) => {
                  setAgendaData(data);
                  setCurrentStep('editor');
                }}
                onBack={() => setCurrentStep('editor')}
              />
            } 
          />
          
          {/* Your existing step-based routes */}
          <Route 
            path="/" 
            element={
              <>
                {currentStep === 'landing' && (
                  <LandingPage onStartClick={handleStartClick} />
                )}
                
                {currentStep === 'step1' && (
                  <FormStep1 onSubmit={handleStep1Submit} />
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
              </>
            } 
          />
        </Routes>

        <NotificationToast
          notification={notification}
          onClose={hideNotification}
        />
      </div>
    </Router>
  );
}

export default App;
  
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
            onRegenerate={handleRegenerateAgenda}
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