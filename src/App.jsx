import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agendaData, setAgendaData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { notification, showNotification, hideNotification } = useNotification();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (location.state?.agendaData) {
      setAgendaData(location.state.agendaData);
    }
  }, [location.state]);

  const handleStartClick = () => {
    navigate('/form');
  };

  const handleStep1Submit = async (formData) => {
    setIsGenerating(true);
    try {
      console.log("🔤 App.jsx - Current language:", i18n.language);

      const generatedAgenda = await generateAgendaWithAI(formData, i18n.language);

      const completeAgendaData = {
        ...formData,
        ...generatedAgenda,
      };

      setAgendaData(completeAgendaData);

      navigate('/preview', { state: { agendaData: completeAgendaData } });

      showNotification('✨ Agenda generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating agenda:', error);
      showNotification(`❌ Failed to generate agenda: ${error.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    navigate('/');
    setAgendaData(null);
  };

  const handleRegenerateAgenda = async () => {
    setIsGenerating(true);
    try {
      console.log("🔤 App.jsx - Regenerating with language:", i18n.language);

      const regeneratedAgenda = await regenerateAgendaWithAI(agendaData, i18n.language);

      const updatedAgendaData = {
        ...agendaData,
        ...regeneratedAgenda,
      };

      setAgendaData(updatedAgendaData);
      showNotification('✨ Agenda regenerated successfully!', 'success');
    } catch (error) {
      console.error('Error regenerating agenda:', error);
      showNotification(`❌ Regeneration failed: ${error.message}`, 'error');
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
        <Routes>
          <Route path="/" element={<LandingPage onStart={handleStartClick} />} />
          <Route
            path="/form"
            element={
              <FormStep1
                onSubmit={handleStep1Submit}
                isLoading={isGenerating}
              />
            }
          />
          <Route path="/preview" element={<AIPreviewPage />} />
          <Route
            path="/editor"
            element={
              <AgendaEditor
                agendaData={agendaData}
                onReset={handleReset}
                onDataChange={setAgendaData}
                onRegenerate={handleRegenerateAgenda}
                isRegenerating={isGenerating}
              />
            }
          />
        </Routes>
      </div>

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

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
