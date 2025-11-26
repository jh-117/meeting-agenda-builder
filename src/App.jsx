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

function App() {
  const [currentStep, setCurrentStep] = useState('landing'); // landing, step1, step2, editor, preview
  const [agendaData, setAgendaData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { notification, showNotification, hideNotification } = useNotification();

  const handleStartClick = () => {
    setCurrentStep('step1');
  };

  const handleStep1Submit = (data) => {
    setAgendaData(data);
    setCurrentStep('step2');
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

  return (
    <div className={`app ${theme}`}>
      <div className="app-background"></div>

      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      <div className="app-content">
        {currentStep === 'landing' && (
          <LandingPage onStart={handleStartClick} />
        )}

        {currentStep === 'step1' && (
          <FormStep1 onSubmit={handleStep1Submit} />
        )}

        

        {currentStep === 'editor' && (
          <AgendaEditor
            initialData={agendaData}
            onPreview={handlePreviewClick}
            onReset={handleReset}
            onDataChange={setAgendaData}
          />
        )}
      </div>

      {showPreview && (
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