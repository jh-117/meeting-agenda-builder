import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Packer, Document, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { getExportTexts } from './exportLanguages';

// PDF 导出 - 使用 HTML 转 PDF 方法
export const generatePDF = async (agendaData, language = 'zh') => {
  try {
    // 创建临时容器
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '210mm';
    tempDiv.style.padding = '20mm';
    tempDiv.style.fontFamily = 'Arial, "Microsoft YaHei", "PingFang SC", sans-serif';
    tempDiv.style.fontSize = '14px';
    tempDiv.style.lineHeight = '1.6';
    tempDiv.style.background = 'white';
    tempDiv.style.color = 'black';

    const t = getExportTexts(language);

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
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = getFileName('pdf', language);
    pdf.save(fileName);

  } catch (error) {
    console.error('PDF generation error:', error);
    generateSimplePDF(agendaData, language);
  } finally {
    const tempElement = document.querySelector('div[style*="left: -9999px"]');
    if (tempElement) {
      document.body.removeChild(tempElement);
    }
  }
};

// 简单的回退方案
const generateSimplePDF = (agendaData, language = 'zh') => {
  const doc = new jsPDF();
  const t = getExportTexts(language);
  
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

  const fileName = getFileName('pdf', language);
  doc.save(fileName);
};

// DOCX 导出
export const generateDOCX = async (agendaData, language = 'zh') => {
  const t = getExportTexts(language);
  const sections = [];

  // 标题
  sections.push(
    new Paragraph({
      text: agendaData.meetingTitle || t.defaultTitle,
      heading: HeadingLevel.HEADING_1,
    })
  );

  // 基本信息
  sections.push(new Paragraph({ text: t.basicInfo, heading: HeadingLevel.HEADING_2 }));
  sections.push(new Paragraph(`${t.date}: ${agendaData.meetingDate || ''}`));
  sections.push(new Paragraph(`${t.time}: ${agendaData.meetingTime || ''} (${t.duration}: ${agendaData.duration || ''} ${t.minutes})`));
  sections.push(new Paragraph(`${t.location}: ${agendaData.location || ''}`));
  sections.push(new Paragraph(`${t.facilitator}: ${agendaData.facilitator || ''}`));
  if (agendaData.noteTaker) {
    sections.push(new Paragraph(`${t.noteTaker}: ${agendaData.noteTaker}`));
  }
  if (agendaData.attendees) {
    sections.push(new Paragraph(`${t.attendees}: ${agendaData.attendees}`));
  }

  // 会议目的
  sections.push(new Paragraph({ text: t.meetingObjective, heading: HeadingLevel.HEADING_2 }));
  if (agendaData.meetingObjective) {
    sections.push(new Paragraph(agendaData.meetingObjective));
  }

  // 议程项
  sections.push(new Paragraph({ text: t.agendaItems, heading: HeadingLevel.HEADING_2 }));
  if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
    agendaData.agendaItems.forEach((item, index) => {
      sections.push(new Paragraph({ text: `${index + 1}. ${item.topic || ''}`, heading: HeadingLevel.HEADING_3 }));
      if (item.owner) sections.push(new Paragraph(`${t.speaker}: ${item.owner}`));
      if (item.timeAllocation) sections.push(new Paragraph(`${t.duration}: ${item.timeAllocation} ${t.minutes}`));
      if (item.description) sections.push(new Paragraph(`${t.description}: ${item.description}`));
      if (item.expectedOutput) sections.push(new Paragraph(`${t.expectedOutput}: ${item.expectedOutput}`));
    });
  } else {
    sections.push(new Paragraph('-'));
  }

  // 行动项
  sections.push(new Paragraph({ text: t.actionItems, heading: HeadingLevel.HEADING_2 }));
  if (agendaData.actionItems && agendaData.actionItems.length > 0) {
    agendaData.actionItems.forEach((item, index) => {
      sections.push(new Paragraph(`${index + 1}. ${item.task || ''}`));
      if (item.owner) sections.push(new Paragraph(`${t.owner}: ${item.owner}`));
      if (item.deadline) sections.push(new Paragraph(`${t.deadline}: ${item.deadline}`));
    });
  } else {
    sections.push(new Paragraph('-'));
  }

  const doc = new Document({
    sections: [{ children: sections }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = getFileName('docx', language);
  saveAs(blob, fileName);
};

// TXT 导出
export const generateTXT = (agendaData, language = 'zh') => {
  const t = getExportTexts(language);
  let content = '';

  content += `=== ${agendaData.meetingTitle || t.defaultTitle} ===\n\n`;

  content += `${t.basicInfo}\n`;
  content += `${t.date}: ${agendaData.meetingDate || ''}\n`;
  content += `${t.time}: ${agendaData.meetingTime || ''} (${t.duration}: ${agendaData.duration || ''} ${t.minutes})\n`;
  content += `${t.location}: ${agendaData.location || ''}\n`;
  content += `${t.facilitator}: ${agendaData.facilitator || ''}\n`;
  if (agendaData.noteTaker) {
    content += `${t.noteTaker}: ${agendaData.noteTaker}\n`;
  }
  if (agendaData.attendees) {
    content += `${t.attendees}: ${agendaData.attendees}\n`;
  }
  content += '\n';

  content += `${t.meetingObjective}\n`;
  if (agendaData.meetingObjective) {
    content += `${agendaData.meetingObjective}\n`;
  }
  content += '\n';

  content += `${t.agendaItems}\n`;
  if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
    agendaData.agendaItems.forEach((item, index) => {
      content += `\n${index + 1}. ${item.topic || ''}\n`;
      if (item.owner) content += `   ${t.speaker}: ${item.owner}\n`;
      if (item.timeAllocation) content += `   ${t.duration}: ${item.timeAllocation} ${t.minutes}\n`;
      if (item.description) content += `   ${t.description}: ${item.description}\n`;
      if (item.expectedOutput) content += `   ${t.expectedOutput}: ${item.expectedOutput}\n`;
    });
  } else {
    content += '-\n';
  }

  content += `\n${t.actionItems}\n`;
  if (agendaData.actionItems && agendaData.actionItems.length > 0) {
    agendaData.actionItems.forEach((item, index) => {
      content += `${index + 1}. ${item.task || ''}\n`;
      if (item.owner) content += `   ${t.owner}: ${item.owner}\n`;
      if (item.deadline) content += `   ${t.deadline}: ${item.deadline}\n\n`;
    });
  } else {
    content += '-\n';
  }

  const fileName = getFileName('txt', language);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
};

// 获取文件名
const getFileName = (format, language) => {
  const timestamp = new Date().getTime();
  const names = {
    zh: `会议议程-${timestamp}`,
    en: `meeting-agenda-${timestamp}`,
    ms: `agenda-mesyuarat-${timestamp}`,
    ta: `கூட்ட-agenda-${timestamp}`
  };
  
  const baseName = names[language] || names.en;
  return `${baseName}.${format}`;
};