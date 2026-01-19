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
import PrivacyPolicy from './pages/PrivacyPolicy';

import NotificationToast from './components/NotificationToast';
import ThemeToggle from './components/ThemeToggle';
import LoadingSpinner from './components/LoadingSpinner';
import { generateAgendaWithAI, regenerateAgendaWithAI } from './services/agendaAIService';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agendaData, setAgendaData] = useState(null);
  const [formData, setFormData] = useState(null); // NEW: Store original form data
  const [isGenerating, setIsGenerating] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { notification, showNotification, hideNotification } = useNotification();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (location.state?.agendaData) {
      setAgendaData(location.state.agendaData);
    }
    if (location.state?.formData) {
      setFormData(location.state.formData); // NEW: Store form data from navigation
    }
  }, [location.state]);

  const handleStartClick = () => {
    navigate('/form');
  };

  // UPDATED: handleStep1Submit with attachment data
  const handleStep1Submit = async (submitData) => {
    setIsGenerating(true);
    try {
      console.log("🔤 App.jsx - Current language:", i18n.language);
      console.log("📎 App.jsx - Processing with attachments:", {
        hasAttachmentContent: !!submitData.attachmentContent,
        attachmentType: submitData.attachmentType,
        fileCount: submitData.attachments?.length || 0
      });

      // Store original form data for regeneration
      setFormData(submitData);

      // Generate agenda with AI using attachment content
      const generatedAgenda = await generateAgendaWithAI(
        submitData, 
        i18n.language,
        submitData.attachmentContent,
        submitData.attachmentType
      );

      const completeAgendaData = {
        meetingTitle: submitData.meetingTitle,
        meetingDate: submitData.meetingDate,
        meetingTime: submitData.meetingTime,
        duration: submitData.duration,
        location: submitData.location,
        facilitator: submitData.facilitator,
        noteTaker: submitData.noteTaker,
        meetingObjective: submitData.meetingObjective,
        agendaItems: generatedAgenda.agendaItems || [],
        actionItems: generatedAgenda.actionItems || []
      };

      setAgendaData(completeAgendaData);

      navigate('/preview', { 
        state: { 
          agendaData: completeAgendaData,
          formData: submitData // NEW: Pass form data to preview
        } 
      });

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
    setFormData(null); // NEW: Reset form data
  };

  // UPDATED: handleRegenerateAgenda with attachment data
  const handleRegenerateAgenda = async () => {
    if (!formData) {
      console.error('No form data available for regeneration');
      showNotification('❌ Cannot regenerate: Missing original form data', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      console.log("🔤 App.jsx - Regenerating with language:", i18n.language);
      console.log("📎 App.jsx - Regenerating with stored attachments:", {
        hasAttachmentContent: !!formData.attachmentContent,
        attachmentType: formData.attachmentType
      });

      const regeneratedAgenda = await regenerateAgendaWithAI(
        agendaData, 
        i18n.language,
        formData.attachmentContent, // Use stored attachment content
        formData.attachmentType
      );

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

  // NEW: Handle edit from preview page
  const handleEditAgenda = () => {
    navigate('/editor', { 
      state: { 
        agendaData: agendaData,
        formData: formData // Pass form data to editor
      } 
    });
  };

  return (
    <div className={`app ${theme}`}>
      <div className="app-background"></div>
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      {isGenerating && <LoadingSpinner />}

      <div className="app-content">
        <Routes>
          <Route path="/" element={<LandingPage onStart={handleStartClick} />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route
            path="/form"
            element={
              <FormStep1
                onSubmit={handleStep1Submit}
                isLoading={isGenerating}
              />
            }
          />
          <Route
            path="/preview"
            element={
              <AIPreviewPage
                onEdit={handleEditAgenda} // NEW: Pass edit handler
              />
            }
          />
          <Route
            path="/editor"
            element={
              <AgendaEditor
                agendaData={agendaData}
                initialFormData={formData} // NEW: Pass stored form data with attachments
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