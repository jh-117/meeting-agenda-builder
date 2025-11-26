import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './FormStep1.css';

interface FormStep1Props {
  onGenerated: (agenda: any) => void; // callback with generated agenda JSON
}

const FormStep1: React.FC<FormStep1Props> = ({ onGenerated }) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const [formData, setFormData] = useState({
    title: '',
    objectivesText: '',   // user types objectives as newline-separated string
    attendeesText: '',    // user types attendees as comma or newline
    duration_minutes: 45,
    constraintsText: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrors({ title: t('formStep1.errors.meetingTitle') });
      return;
    }
    if (!formData.objectivesText.trim()) {
      setErrors({ objectivesText: t('formStep1.errors.meetingObjective') });
      return;
    }

    // Convert text fields into arrays for API
    const objectives = formData.objectivesText
      .split('\n')
      .map((o) => o.trim())
      .filter(Boolean);

    const attendees = formData.attendeesText
      .split(/[\n,]/)
      .map((a) => a.trim())
      .filter(Boolean);

    const constraints = formData.constraintsText
      .split(/[\n,]/)
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      objectives,
      attendees,
      duration_minutes: Number(formData.duration_minutes),
      constraints,
      notes: formData.notes.trim(),
    };

    try {
      setLoading(true);
      const res = await fetch('https://<your-bolt-function-url>/generate-agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to generate agenda');
      const data = await res.json();
      onGenerated(data);
    } catch (err) {
      console.error(err);
      alert('Error generating agenda. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="form-step1" onSubmit={handleSubmit}>
      <h2>{t('formStep1.header')}</h2>

      <div className="form-group">
        <label>{t('formStep1.meetingTitle')} *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label>{t('formStep1.meetingObjective')} *</label>
        <textarea
          name="objectivesText"
          value={formData.objectivesText}
          onChange={handleChange}
          rows={4}
          placeholder="Enter objectives, one per line"
          className={errors.objectivesText ? 'error' : ''}
        />
        {errors.objectivesText && <span className="error-message">{errors.objectivesText}</span>}
      </div>

      <div className="form-group">
        <label>{t('formStep1.attendees')}</label>
        <textarea
          name="attendeesText"
          value={formData.attendeesText}
          onChange={handleChange}
          rows={3}
          placeholder="Enter attendees, separated by comma or new line"
        />
      </div>

      <div className="form-group">
        <label>{t('formStep1.duration')}</label>
        <input
          type="number"
          name="duration_minutes"
          min={15}
          max={240}
          step={5}
          value={formData.duration_minutes}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label>{t('formStep1.constraints')}</label>
        <textarea
          name="constraintsText"
          value={formData.constraintsText}
          onChange={handleChange}
          rows={2}
          placeholder="Any special constraints?"
        />
      </div>

      <div className="form-group">
        <label>{t('formStep1.notes')}</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Additional notes"
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? 'Generating...' : 'AI Generate Agenda'} <ArrowRight />
      </button>
    </form>
  );
};

export default FormStep1;
