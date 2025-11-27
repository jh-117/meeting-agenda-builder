// 多语言配置
export const exportTexts = {
  zh: {
    basicInfo: '基本信息',
    date: '日期',
    time: '时间',
    duration: '时长',
    location: '地点',
    facilitator: '主持人',
    noteTaker: '记录人',
    attendees: '参与者',
    meetingObjective: '会议目的',
    agendaItems: '议程项',
    speaker: '负责人',
    minutes: '分钟',
    description: '描述',
    expectedOutput: '预期产出',
    actionItems: '行动项',
    owner: '负责人',
    deadline: '截止日期',
    defaultTitle: '会议议程'
  },
  en: {
    basicInfo: 'Basic Information',
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    location: 'Location',
    facilitator: 'Facilitator',
    noteTaker: 'Note Taker',
    attendees: 'Attendees',
    meetingObjective: 'Meeting Objective',
    agendaItems: 'Agenda Items',
    speaker: 'Owner',
    minutes: 'minutes',
    description: 'Description',
    expectedOutput: 'Expected Output',
    actionItems: 'Action Items',
    owner: 'Owner',
    deadline: 'Deadline',
    defaultTitle: 'Meeting Agenda'
  },
  ms: {
    basicInfo: 'Maklumat Asas',
    date: 'Tarikh',
    time: 'Masa',
    duration: 'Tempoh',
    location: 'Lokasi',
    facilitator: 'Fasilitator',
    noteTaker: 'Pencatat Minit',
    attendees: 'Peserta',
    meetingObjective: 'Objektif Mesyuarat',
    agendaItems: 'Item Agenda',
    speaker: 'Pemilik',
    minutes: 'minit',
    description: 'Penerangan',
    expectedOutput: 'Output Dijangka',
    actionItems: 'Item Tindakan',
    owner: 'Pemilik',
    deadline: 'Tarikh Akhir',
    defaultTitle: 'Agenda Mesyuarat'
  },
  ta: {
    basicInfo: 'அடிப்படை தகவல்',
    date: 'தேதி',
    time: 'நேரம்',
    duration: 'கால அளவு',
    location: 'இடம்',
    facilitator: 'தொகுப்பாளர்',
    noteTaker: 'குறிப்பெடுப்பவர்',
    attendees: 'பங்கேற்பாளர்கள்',
    meetingObjective: 'கூட்ட நோக்கம்',
    agendaItems: 'வ agenda பட்டி உருப்படிகள்',
    speaker: 'உரிமையாளர்',
    minutes: 'நிமிடங்கள்',
    description: 'விளக்கம்',
    expectedOutput: 'எதிர்பார்க்கப்படும் வெளியீடு',
    actionItems: 'செயல் உருப்படிகள்',
    owner: 'உரிமையாளர்',
    deadline: 'கடைசி தேதி',
    defaultTitle: 'கூட்ட agenda'
  }
};

// 获取对应语言的文本
export const getExportTexts = (language = 'zh') => {
  return exportTexts[language] || exportTexts.en;
};