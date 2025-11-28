import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, User, Users, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './FormStep1.css';

function FormStep1({ onSubmit }) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  // Add this state declaration
const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // 基本信息
    meetingTitle: '',
    meetingDate: new Date().toISOString().split('T')[0],
    meetingTime: '14:00',
    duration: 60,
    location: '',
    
    // 人员信息
    meetingType: '',
    customMeetingType: '',
    facilitator: '',
    noteTaker: '',
    attendees: '',
    
    // 会议内容
    meetingObjective: '',
    
    // AI 补充
    needAISupplement: false,
    additionalInfo: '',
    
    // 附件
    attachments: [],
  });

  const [errors, setErrors] = useState({});

  // 会议类型选项 - 添加马来文和泰米尔文
  const meetingTypes = [
    { 
      value: 'project-review', 
      label: { 
        en: 'Project Review', 
        zh: '项目评审',
        ms: 'Semakan Projek',
        ta: 'திட்ட மதிப்பாய்வு'
      } 
    },
    { 
      value: 'team-meeting', 
      label: { 
        en: 'Team Meeting', 
        zh: '团队会议',
        ms: 'Mesyuarat Pasukan',
        ta: 'குழுக் கூட்டம்'
      } 
    },
    { 
      value: 'client-meeting', 
      label: { 
        en: 'Client Meeting', 
        zh: '客户会议',
        ms: 'Mesyuarat Pelanggan',
        ta: 'வாடிக்கையாளர் கூட்டம்'
      } 
    },
    { 
      value: 'planning', 
      label: { 
        en: 'Planning Session', 
        zh: '规划会议',
        ms: 'Sesi Perancangan',
        ta: 'திட்டமிடும் அமர்வு'
      } 
    },
    { 
      value: 'retrospective', 
      label: { 
        en: 'Retrospective', 
        zh: '回顾会议',
        ms: 'Retrospektif',
        ta: 'பின்னோக்கிப் பார்த்தல்'
      } 
    },
    { 
      value: 'brainstorming', 
      label: { 
        en: 'Brainstorming', 
        zh: '头脑风暴',
        ms: 'Sumbang Saran',
        ta: 'மூளைச்சலவை'
      } 
    },
    { 
      value: 'decision-making', 
      label: { 
        en: 'Decision Making', 
        zh: '决策会议',
        ms: 'Membuat Keputusan',
        ta: 'முடிவெடுக்கும் கூட்டம்'
      } 
    },
    { 
      value: 'status-update', 
      label: { 
        en: 'Status Update', 
        zh: '进度更新',
        ms: 'Kemas Kini Status',
        ta: 'நிலை புதுப்பிப்பு'
      } 
    },
    { 
      value: 'other', 
      label: { 
        en: 'Other', 
        zh: '其他',
        ms: 'Lain-lain',
        ta: 'மற்றவை'
      } 
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // 清除该字段的错误
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
    }));

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));

    e.target.value = '';
  };

  const handleRemoveAttachment = (id) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter(attachment => attachment.id !== id),
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.meetingTitle.trim()) {
      newErrors.meetingTitle = t('formStep1.errors.meetingTitle');
    }
    if (!formData.meetingDate) {
      newErrors.meetingDate = t('formStep1.errors.meetingDate');
    }
    if (!formData.meetingTime) {
      newErrors.meetingTime = t('formStep1.errors.meetingTime');
    }
    if (!formData.location.trim()) {
      newErrors.location = t('formStep1.errors.location');
    }
    if (!formData.facilitator.trim()) {
      newErrors.facilitator = t('formStep1.errors.facilitator');
    }
    if (!formData.meetingObjective.trim()) {
      newErrors.meetingObjective = t('formStep1.errors.meetingObjective');
    }
    
    return newErrors;
  };

 // FormStep1.jsx - UPDATED handleSubmit
const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validate();
  
  if (Object.keys(newErrors).length === 0) {
    setIsSubmitting(true);
    
    try {
      // Combine all extracted text from attachments
      const attachmentContent = formData.attachments
        .filter(att => att.isProcessable && att.extractedText)
        .map(att => `--- ${att.name} ---\n${att.extractedText}`)
        .join('\n\n');

      // Prepare submit data with attachment info
      const submitData = {
        ...formData,
        meetingType: formData.meetingType === 'other' ? formData.customMeetingType : formData.meetingType,
        attachmentContent: attachmentContent || null,
        attachmentType: formData.attachments.length > 0 ? 'processed_files' : null,
        // Keep attachment metadata for reference
        attachmentMetadata: formData.attachments.map(att => ({
          name: att.name,
          isProcessable: att.isProcessable,
          url: att.url
        }))
      };
      
      console.log('提交数据包含附件:', {
        hasAttachmentContent: !!attachmentContent,
        attachmentType: submitData.attachmentType,
        fileCount: formData.attachments.length
      });
      
      onSubmit(submitData);
    } catch (error) {
      console.error('提交错误:', error);
      setErrors({ submit: '提交失败，请重试' });
    } finally {
      setIsSubmitting(false);
    }
  } else {
    setErrors(newErrors);
  }
};
  const getPlaceholder = (field) => {
    const placeholders = {
      meetingTitle: {
        en: "Q4 Project Planning Meeting",
        zh: "第四季度项目规划会议",
        ms: "Mesyuarat Perancangan Projek Suku Keempat",
        ta: "நான்காம் காலாண்டு திட்டமிடல் கூட்டம்"
      },
      location: {
        en: "Conference Room A or meeting link",
        zh: "会议室A或会议链接",
        ms: "Bilik Mesyuarat A atau pautan mesyuarat",
        ta: "கூட்ட அறை A அல்லது கூட்ட இணைப்பு"
      },
      facilitator: {
        en: "Zhang San",
        zh: "张三",
        ms: "Ahmad",
        ta: "ராமன்"
      },
      noteTaker: {
        en: "Li Si", 
        zh: "李四",
        ms: "Siti",
        ta: "பிரியா"
      },
      attendees: {
        en: "Zhang San, Li Si, Wang Wu, Zhao Liu",
        zh: "张三、李四、王五、赵六",
        ms: "Ahmad, Siti, Ali, Muthu",
        ta: "ராமன், பிரியா, குமார், மாலா"
      },
      meetingObjective: {
        en: "Discuss Q4 project goals and resource allocation...",
        zh: "讨论第四季度项目目标和资源分配...",
        ms: "Bincang matlamat projek suku keempat dan peruntukan sumber...",
        ta: "நான்காம் காலாண்டு திட்ட இலக்குகள் மற்றும் வள ஒதுக்கீடு பற்றி விவாதிக்கவும்..."
      },
      additionalInfo: {
        en: "Example: Need to discuss budget overrun, technical team should present project status, marketing needs to share Q4 campaign results...",
        zh: "例如：需要重点讨论预算超支问题，技术团队需要汇报项目进度，市场部需要分享第四季度活动成果...",
        ms: "Contoh: Perlu bincang lebihan bajet, pasukan teknikal perlu bentang status projek, pemasaran perlu kongsikan keputusan kempen Q4...",
        ta: "எடுத்துக்காட்டு: வரவு செலவுத் திட்டத்தை மீறியதைப் பற்றி விவாதிக்க வேண்டும், தொழில்நுட்பக் குழு திட்ட நிலையை வழங்க வேண்டும், சந்தைப்படுத்தல் குழு Q4 பிரச்சார முடிவுகளைப் பகிர்ந்து கொள்ள வேண்டும்..."
      }
    };
    return placeholders[field]?.[currentLanguage] || '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = {
      en: ['Bytes', 'KB', 'MB', 'GB'],
      zh: ['字节', 'KB', 'MB', 'GB'],
      ms: ['Bait', 'KB', 'MB', 'GB'],
      ta: ['பைட்டுகள்', 'KB', 'MB', 'GB']
    };
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + (sizes[currentLanguage]?.[i] || sizes.en[i]);
  };

  // 获取动态标题
  const getSectionTitle = (section) => {
    const titles = {
      basicInfo: {
        en: "Basic Information",
        zh: "基本信息",
        ms: "Maklumat Asas",
        ta: "அடிப்படை தகவல்"
      },
      participants: {
        en: "Participants",
        zh: "人员信息",
        ms: "Peserta",
        ta: "பங்காளிகள்"
      },
      meetingContent: {
        en: "Meeting Content",
        zh: "会议内容",
        ms: "Kandungan Mesyuarat",
        ta: "கூட்ட உள்ளடக்கம்"
      },
      attachments: {
        en: "Attachments",
        zh: "附件",
        ms: "Lampiran",
        ta: "இணைப்புகள்"
      },
      selectMeetingType: {
        en: "Select meeting type",
        zh: "选择会议类型",
        ms: "Pilih jenis mesyuarat",
        ta: "கூட்ட வகையைத் தேர்ந்தெடுக்கவும்"
      },
      customType: {
        en: "Custom Type",
        zh: "自定义类型",
        ms: "Jenis Tersuai",
        ta: "தனிப்பயன் வகை"
      },
      specifyMeetingType: {
        en: "Please specify meeting type",
        zh: "请输入会议类型",
        ms: "Sila nyatakan jenis mesyuarat",
        ta: "கூட்ட வகையைக் குறிப்பிடவும்"
      },
      aiSupplement: {
        en: "Add more details for better AI results",
        zh: "提供更多信息让AI生成更精准的议程",
        ms: "Berikan lebih banyak maklumat untuk hasil AI yang lebih tepat",
        ta: "மேம்பட்ட AI முடிவுகளுக்கு கூடுதல் விவரங்களைச் சேர்க்கவும்"
      },
      clickToUpload: {
        en: "Click to upload files",
        zh: "点击上传文件",
        ms: "Klik untuk muat naik fail",
        ta: "கோப்புகளைப் பதிவேற்ற கிளிக் செய்க"
      },
      uploadHint: {
        en: "Supports PDF, Word, Excel, PowerPoint, images, etc.",
        zh: "支持 PDF, Word, Excel, PowerPoint, 图片等格式",
        ms: "Menyokong PDF, Word, Excel, PowerPoint, imej, dll.",
        ta: "PDF, Word, Excel, PowerPoint, படங்கள் போன்றவைகளை ஆதரிக்கிறது"
      },
      uploadedFiles: {
        en: "Uploaded Files",
        zh: "已上传文件",
        ms: "Fail Dimuat Naik",
        ta: "பதிவேற்றப்பட்ட கோப்புகள்"
      },
      generateAgenda: {
        en: "AI Generate Agenda",
        zh: "AI 生成议程",
        ms: "AI Hasilkan Agenda",
        ta: "AI அட்டவணையை உருவாக்குக"
      },
      minutes: {
        en: "minutes",
        zh: "分钟",
        ms: "minit",
        ta: "நிமிடங்கள்"
      }
    };
    return titles[section]?.[currentLanguage] || titles[section]?.en || '';
  };

  const containerVariants = { 
    hidden: { opacity: 0 }, 
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } } 
  };
  
  const itemVariants = { 
    hidden: { opacity: 0, y: 20 }, 
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } 
  };

  return (
    <div className="form-step1">
      <motion.div className="form-container" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="form-header" variants={itemVariants}>
          <h1>{t('formStep1.header')}</h1>
          <p>{t('formStep1.subHeader')}</p>
        </motion.div>

        <motion.div className="progress-bar" variants={itemVariants}>
          <div className="progress-fill" style={{ width: '50%' }}></div>
        </motion.div>

        <form onSubmit={handleSubmit} className="form-content">
          {/* 基本信息 */}
          <motion.div className="form-section" variants={itemVariants}>
            <h3>📋 {getSectionTitle('basicInfo')}</h3>
            
            <div className="form-group">
              <label htmlFor="meetingTitle">
                <FileText size={16} /> {t('formStep1.meetingTitle')} *
              </label>
              <input
                id="meetingTitle"
                type="text"
                name="meetingTitle"
                value={formData.meetingTitle}
                onChange={handleChange}
                placeholder={getPlaceholder('meetingTitle')}
                className={errors.meetingTitle ? 'error' : ''}
              />
              {errors.meetingTitle && <span className="error-message">{errors.meetingTitle}</span>}
            </div>

            <div className="form-row">
              <motion.div className="form-group" variants={itemVariants}>
                <label htmlFor="meetingDate">
                  <Calendar size={16} /> {t('formStep1.meetingDate')} *
                </label>
                <input 
                  id="meetingDate"
                  type="date" 
                  name="meetingDate" 
                  value={formData.meetingDate} 
                  onChange={handleChange} 
                  className={errors.meetingDate ? 'error' : ''}
                />
                {errors.meetingDate && <span className="error-message">{errors.meetingDate}</span>}
              </motion.div>

              <motion.div className="form-group" variants={itemVariants}>
                <label htmlFor="meetingTime">
                  <Clock size={16} /> {t('formStep1.meetingTime')} *
                </label>
                <input 
                  id="meetingTime"
                  type="time" 
                  name="meetingTime" 
                  value={formData.meetingTime} 
                  onChange={handleChange} 
                  className={errors.meetingTime ? 'error' : ''}
                />
                {errors.meetingTime && <span className="error-message">{errors.meetingTime}</span>}
              </motion.div>

              <motion.div className="form-group" variants={itemVariants}>
                <label htmlFor="duration">{t('formStep1.duration')}</label>
                <div className="input-with-suffix">
                  <input 
                    id="duration"
                    type="number" 
                    name="duration" 
                    value={formData.duration} 
                    onChange={handleChange} 
                    min="15" 
                    max="480" 
                    step="15"
                  />
                  <span className="input-suffix">{getSectionTitle('minutes')}</span>
                </div>
              </motion.div>
            </div>

            <div className="form-group">
              <label htmlFor="location">
                <MapPin size={16} /> {t('formStep1.location')} *
              </label>
              <input 
                id="location"
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder={getPlaceholder('location')}
                className={errors.location ? 'error' : ''}
              />
              {errors.location && <span className="error-message">{errors.location}</span>}
            </div>

            <div className="form-row">
              <motion.div className="form-group" variants={itemVariants}>
                <label htmlFor="meetingType">
                  {t('formStep1.meetingType')}
                </label>
                <select 
                  id="meetingType"
                  name="meetingType" 
                  value={formData.meetingType} 
                  onChange={handleChange}
                >
                  <option value="">{getSectionTitle('selectMeetingType')}</option>
                  {meetingTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label[currentLanguage] || type.label.en}
                    </option>
                  ))}
                </select>
              </motion.div>

              {formData.meetingType === 'other' && (
                <motion.div className="form-group" variants={itemVariants}>
                  <label htmlFor="customMeetingType">
                    {getSectionTitle('customType')}
                  </label>
                  <input 
                    id="customMeetingType"
                    type="text" 
                    name="customMeetingType" 
                    value={formData.customMeetingType} 
                    onChange={handleChange} 
                    placeholder={getSectionTitle('specifyMeetingType')}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* 人员信息 */}
          <motion.div className="form-section" variants={itemVariants}>
            <h3>👥 {getSectionTitle('participants')}</h3>
            
            <div className="form-row">
              <motion.div className="form-group" variants={itemVariants}>
                <label htmlFor="facilitator">
                  <User size={16} /> {t('formStep1.facilitator')} *
                </label>
                <input 
                  id="facilitator"
                  type="text" 
                  name="facilitator" 
                  value={formData.facilitator} 
                  onChange={handleChange} 
                  placeholder={getPlaceholder('facilitator')}
                  className={errors.facilitator ? 'error' : ''}
                />
                {errors.facilitator && <span className="error-message">{errors.facilitator}</span>}
              </motion.div>

              <motion.div className="form-group" variants={itemVariants}>
                <label htmlFor="noteTaker">
                  <User size={16} /> {t('formStep1.noteTaker')}
                </label>
                <input 
                  id="noteTaker"
                  type="text" 
                  name="noteTaker" 
                  value={formData.noteTaker} 
                  onChange={handleChange} 
                  placeholder={getPlaceholder('noteTaker')}
                />
              </motion.div>
            </div>

            <div className="form-group">
              <label htmlFor="attendees">
                <Users size={16} /> {t('formStep1.attendees')}
              </label>
              <textarea 
                id="attendees"
                name="attendees" 
                value={formData.attendees} 
                onChange={handleChange} 
                placeholder={getPlaceholder('attendees')}
                rows="3"
              />
            </div>
          </motion.div>

          {/* 会议内容 */}
          <motion.div className="form-section" variants={itemVariants}>
            <h3>🎯 {getSectionTitle('meetingContent')}</h3>
            
            <div className="form-group">
              <label htmlFor="meetingObjective">
                {t('formStep1.meetingObjective')} *
              </label>
              <textarea
                id="meetingObjective"
                name="meetingObjective"
                value={formData.meetingObjective}
                onChange={handleChange}
                placeholder={getPlaceholder('meetingObjective')}
                rows="4"
                className={errors.meetingObjective ? 'error' : ''}
              />
              {errors.meetingObjective && <span className="error-message">{errors.meetingObjective}</span>}
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="needAISupplement"
                  name="needAISupplement"
                  checked={formData.needAISupplement}
                  onChange={handleChange}
                />
                <label htmlFor="needAISupplement">
                  {getSectionTitle('aiSupplement')}
                </label>
              </div>
              
              {formData.needAISupplement && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="form-group" style={{ marginTop: '12px' }}>
                    <textarea
                      name="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={handleChange}
                      placeholder={getPlaceholder('additionalInfo')}
                      rows="4"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* 文件上传 */}
          <motion.div className="form-section" variants={itemVariants}>
            <h3>📎 {getSectionTitle('attachments')}</h3>
            
            <div className="file-upload-section">
              <div className="upload-area">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  className="file-input"
                />
                <label htmlFor="file-upload" className="upload-label">
                  <Upload size={24} />
                  <span>{getSectionTitle('clickToUpload')}</span>
                  <span className="upload-hint">
                    {getSectionTitle('uploadHint')}
                  </span>
                </label>
              </div>
              
              {formData.attachments.length > 0 && (
                <div className="attachments-list">
                  <h4>{getSectionTitle('uploadedFiles')} ({formData.attachments.length})</h4>
                  {formData.attachments.map((attachment) => (
                    <div key={attachment.id} className="attachment-item">
                      <FileText size={16} />
                      <div className="file-info">
                        <span className="file-name">{attachment.name}</span>
                        <span className="file-size">{formatFileSize(attachment.size)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="btn-remove-attachment"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* 表单操作 */}
          <motion.div className="form-actions" variants={itemVariants}>
            <motion.button 
              type="submit" 
              className="btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {getSectionTitle('generateAgenda')}
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}

export default FormStep1;