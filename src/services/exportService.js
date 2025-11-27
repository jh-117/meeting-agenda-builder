import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Packer, Document, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// PDF 导出 - 使用 HTML 转 PDF 方法
export const generatePDF = async (agendaData, language = 'zh') => {
  try {
    // 创建临时容器
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '210mm'; // A4 宽度
    tempDiv.style.padding = '20mm';
    tempDiv.style.fontFamily = 'Arial, "Microsoft YaHei", "PingFang SC", sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.background = 'white';
    tempDiv.style.color = 'black';

    const texts = {
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
      }
    };

    const t = texts[language] || texts.zh;

    // 构建 HTML 内容
    let htmlContent = `
      <div style="font-family: inherit;">
        <!-- 标题 -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px;">
          <h1 style="margin: 0; font-size: 24px; color: #2c3e50;">${agendaData.meetingTitle || t.defaultTitle}</h1>
        </div>
        
        <!-- 基本信息 -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">${t.basicInfo}</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>${t.date}:</strong> ${agendaData.meetingDate || ''}</div>
            <div><strong>${t.time}:</strong> ${agendaData.meetingTime || ''}</div>
            <div><strong>${t.duration}:</strong> ${agendaData.duration || ''} ${t.minutes}</div>
            <div><strong>${t.location}:</strong> ${agendaData.location || ''}</div>
            <div><strong>${t.facilitator}:</strong> ${agendaData.facilitator || ''}</div>
            ${agendaData.noteTaker ? `<div><strong>${t.noteTaker}:</strong> ${agendaData.noteTaker}</div>` : ''}
          </div>
          ${agendaData.attendees ? `<div style="margin-top: 10px;"><strong>${t.attendees}:</strong> ${agendaData.attendees}</div>` : ''}
        </div>
        
        <!-- 会议目的 -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">${t.meetingObjective}</h2>
          <p style="margin: 0; line-height: 1.6;">${agendaData.meetingObjective || ''}</p>
        </div>
    `;

    // 议程项
    htmlContent += `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">${t.agendaItems}</h2>
    `;

    if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
      agendaData.agendaItems.forEach((item, index) => {
        htmlContent += `
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ecf0f1; border-radius: 5px; background: #f8f9fa;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #2c3e50;">
              ${index + 1}. ${item.topic || ''}
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
              ${item.owner ? `<div><strong>${t.speaker}:</strong> ${item.owner}</div>` : ''}
              ${item.timeAllocation ? `<div><strong>${t.duration}:</strong> ${item.timeAllocation} ${t.minutes}</div>` : ''}
            </div>
            ${item.description ? `<div style="margin-top: 8px;"><strong>${t.description}:</strong> ${item.description}</div>` : ''}
            ${item.expectedOutput ? `<div style="margin-top: 8px;"><strong>${t.expectedOutput}:</strong> ${item.expectedOutput}</div>` : ''}
          </div>
        `;
      });
    } else {
      htmlContent += '<p style="color: #7f8c8d; font-style: italic;">-</p>';
    }

    htmlContent += `</div>`;

    // 行动项
    htmlContent += `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">${t.actionItems}</h2>
    `;

    if (agendaData.actionItems && agendaData.actionItems.length > 0) {
      agendaData.actionItems.forEach((item, index) => {
        htmlContent += `
          <div style="margin-bottom: 15px; padding: 12px; border-left: 4px solid #3498db; background: #f8f9fa;">
            <div style="font-weight: bold; margin-bottom: 5px;">${index + 1}. ${item.task || ''}</div>
            <div style="display: flex; gap: 20px; font-size: 13px; color: #555;">
              ${item.owner ? `<div><strong>${t.owner}:</strong> ${item.owner}</div>` : ''}
              ${item.deadline ? `<div><strong>${t.deadline}:</strong> ${item.deadline}</div>` : ''}
            </div>
          </div>
        `;
      });
    } else {
      htmlContent += '<p style="color: #7f8c8d; font-style: italic;">-</p>';
    }

    htmlContent += `</div></div>`;

    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);

    // 转换为 canvas 然后生成 PDF
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // 提高分辨率
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // 第一页
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 如果需要多页
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = language === 'zh' 
      ? `会议议程-${new Date().getTime()}.pdf`
      : `meeting-agenda-${new Date().getTime()}.pdf`;

    pdf.save(fileName);

  } catch (error) {
    console.error('PDF generation error:', error);
    // 如果失败，使用简单的回退方案
    generateSimplePDF(agendaData, language);
  } finally {
    // 清理临时元素
    const tempElement = document.querySelector('div[style*="left: -9999px"]');
    if (tempElement) {
      document.body.removeChild(tempElement);
    }
  }
};

// 简单的回退方案
const generateSimplePDF = (agendaData, language = 'zh') => {
  const doc = new jsPDF();
  
  const texts = {
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
    }
  };

  const t = texts[language] || texts.zh;
  
  let yPosition = 20;
  
  // 标题
  doc.setFontSize(20);
  doc.text(agendaData.meetingTitle || t.defaultTitle, 105, yPosition, { align: 'center' });
  yPosition += 15;

  // 基本信息
  doc.setFontSize(14);
  doc.text(t.basicInfo, 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.text(`${t.date}: ${agendaData.meetingDate || ''}`, 20, yPosition);
  doc.text(`${t.time}: ${agendaData.meetingTime || ''}`, 110, yPosition);
  yPosition += 6;
  
  doc.text(`${t.duration}: ${agendaData.duration || ''} ${t.minutes}`, 20, yPosition);
  doc.text(`${t.location}: ${agendaData.location || ''}`, 110, yPosition);
  yPosition += 6;
  
  doc.text(`${t.facilitator}: ${agendaData.facilitator || ''}`, 20, yPosition);
  if (agendaData.noteTaker) {
    doc.text(`${t.noteTaker}: ${agendaData.noteTaker}`, 110, yPosition);
  }
  yPosition += 6;
  
  if (agendaData.attendees) {
    const attendeesLines = doc.splitTextToSize(`${t.attendees}: ${agendaData.attendees}`, 170);
    doc.text(attendeesLines, 20, yPosition);
    yPosition += attendeesLines.length * 6;
  }
  
  yPosition += 5;

  // 会议目的
  doc.setFontSize(14);
  doc.text(t.meetingObjective, 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  if (agendaData.meetingObjective) {
    const objectiveLines = doc.splitTextToSize(agendaData.meetingObjective, 170);
    doc.text(objectiveLines, 20, yPosition);
    yPosition += objectiveLines.length * 6 + 5;
  }

  // 议程项
  doc.setFontSize(14);
  doc.text(t.agendaItems, 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
    agendaData.agendaItems.forEach((item, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${item.topic || ''}`, 25, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += 6;
      
      if (item.owner) {
        doc.text(`${t.speaker}: ${item.owner}`, 30, yPosition);
        yPosition += 5;
      }
      if (item.timeAllocation) {
        doc.text(`${t.duration}: ${item.timeAllocation} ${t.minutes}`, 30, yPosition);
        yPosition += 5;
      }
      if (item.description) {
        const descLines = doc.splitTextToSize(`${t.description}: ${item.description}`, 160);
        doc.text(descLines, 30, yPosition);
        yPosition += descLines.length * 5;
      }
      if (item.expectedOutput) {
        const outputLines = doc.splitTextToSize(`${t.expectedOutput}: ${item.expectedOutput}`, 160);
        doc.text(outputLines, 30, yPosition);
        yPosition += outputLines.length * 5;
      }
      yPosition += 3;
    });
  } else {
    doc.text('-', 25, yPosition);
    yPosition += 10;
  }

  // 行动项
  doc.setFontSize(14);
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  doc.text(t.actionItems, 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  if (agendaData.actionItems && agendaData.actionItems.length > 0) {
    agendaData.actionItems.forEach((item, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(`${index + 1}. ${item.task || ''}`, 25, yPosition);
      yPosition += 5;
      
      if (item.owner) {
        doc.text(`${t.owner}: ${item.owner}`, 30, yPosition);
      }
      if (item.deadline) {
        doc.text(`${t.deadline}: ${item.deadline}`, 30, yPosition + 5);
      }
      yPosition += 10;
    });
  } else {
    doc.text('-', 25, yPosition);
  }

  const fileName = language === 'zh' 
    ? `会议议程-${new Date().getTime()}.pdf`
    : `meeting-agenda-${new Date().getTime()}.pdf`;

  doc.save(fileName);
};

// DOCX 和 TXT 导出保持不变
export const generateDOCX = async (agendaData, language = 'zh') => {
  // ... 保持你原来的 DOCX 代码
};

export const generateTXT = (agendaData, language = 'zh') => {
  // ... 保持你原来的 TXT 代码
};