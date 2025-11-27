import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Packer, Document, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import i18n from '../i18n';

// PDF export function
export const generatePDF = async (agendaData, language = 'en') => {
  try {
    // Set the language for i18n
    await i18n.changeLanguage(language);
    
    // Create temporary container
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

    // Build HTML content using i18n
    let htmlContent = `
      <div style="font-family: inherit;">
        <!-- Title -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px;">
          <h1 style="margin: 0; font-size: 24px; color: #2c3e50;">${agendaData.meetingTitle || i18n.t('export.defaultTitle')}</h1>
        </div>
        
        <!-- Basic Information -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">${i18n.t('export.basicInfo')}</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>${i18n.t('export.date')}:</strong> ${agendaData.meetingDate || ''}</div>
            <div><strong>${i18n.t('export.time')}:</strong> ${agendaData.meetingTime || ''}</div>
            <div><strong>${i18n.t('export.duration')}:</strong> ${agendaData.duration || ''} ${i18n.t('export.minutes')}</div>
            <div><strong>${i18n.t('export.location')}:</strong> ${agendaData.location || ''}</div>
            <div><strong>${i18n.t('export.facilitator')}:</strong> ${agendaData.facilitator || ''}</div>
            ${agendaData.noteTaker ? `<div><strong>${i18n.t('export.noteTaker')}:</strong> ${agendaData.noteTaker}</div>` : ''}
          </div>
          ${agendaData.attendees ? `<div style="margin-top: 10px;"><strong>${i18n.t('export.attendees')}:</strong> ${agendaData.attendees}</div>` : ''}
        </div>
        
        <!-- Meeting Objective -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">${i18n.t('export.meetingObjective')}</h2>
          <p style="margin: 0; line-height: 1.6;">${agendaData.meetingObjective || ''}</p>
        </div>
    `;

    // Agenda Items
    htmlContent += `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">${i18n.t('export.agendaItems')}</h2>
    `;

    if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
      agendaData.agendaItems.forEach((item, index) => {
        htmlContent += `
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ecf0f1; border-radius: 5px; background: #f8f9fa;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #2c3e50;">
              ${index + 1}. ${item.topic || ''}
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
              ${item.owner ? `<div><strong>${i18n.t('export.speaker')}:</strong> ${item.owner}</div>` : ''}
              ${item.timeAllocation ? `<div><strong>${i18n.t('export.duration')}:</strong> ${item.timeAllocation} ${i18n.t('export.minutes')}</div>` : ''}
            </div>
            ${item.description ? `<div style="margin-top: 8px;"><strong>${i18n.t('export.description')}:</strong> ${item.description}</div>` : ''}
            ${item.expectedOutput ? `<div style="margin-top: 8px;"><strong>${i18n.t('export.expectedOutput')}:</strong> ${item.expectedOutput}</div>` : ''}
          </div>
        `;
      });
    } else {
      htmlContent += `<p style="color: #7f8c8d; font-style: italic;">-</p>`;
    }

    htmlContent += `</div>`;

    // Action Items
    htmlContent += `
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; margin-bottom: 15px;">${i18n.t('export.actionItems')}</h2>
    `;

    if (agendaData.actionItems && agendaData.actionItems.length > 0) {
      agendaData.actionItems.forEach((item, index) => {
        htmlContent += `
          <div style="margin-bottom: 15px; padding: 12px; border-left: 4px solid #3498db; background: #f8f9fa;">
            <div style="font-weight: bold; margin-bottom: 5px;">${index + 1}. ${item.task || ''}</div>
            <div style="display: flex; gap: 20px; font-size: 13px; color: #555;">
              ${item.owner ? `<div><strong>${i18n.t('export.owner')}:</strong> ${item.owner}</div>` : ''}
              ${item.deadline ? `<div><strong>${i18n.t('export.deadline')}:</strong> ${item.deadline}</div>` : ''}
            </div>
          </div>
        `;
      });
    } else {
      htmlContent += `<p style="color: #7f8c8d; font-style: italic;">-</p>`;
    }

    htmlContent += `</div></div>`;

    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);

    // Convert to canvas then generate PDF
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

    const fileName = getFileName(agendaData, 'pdf', language); // 修复：传递 agendaData
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

// Simple fallback solution
const generateSimplePDF = (agendaData, language = 'en') => {
  const doc = new jsPDF();
  
  // Set language for i18n
  i18n.changeLanguage(language);
  
  let yPosition = 20;
  
  // Title
  doc.setFontSize(20);
  doc.text(agendaData.meetingTitle || i18n.t('export.defaultTitle'), 105, yPosition, { align: 'center' });
  yPosition += 15;

  // Basic Information
  doc.setFontSize(14);
  doc.text(i18n.t('export.basicInfo'), 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.text(`${i18n.t('export.date')}: ${agendaData.meetingDate || ''}`, 20, yPosition);
  doc.text(`${i18n.t('export.time')}: ${agendaData.meetingTime || ''}`, 110, yPosition);
  yPosition += 6;
  
  doc.text(`${i18n.t('export.duration')}: ${agendaData.duration || ''} ${i18n.t('export.minutes')}`, 20, yPosition);
  doc.text(`${i18n.t('export.location')}: ${agendaData.location || ''}`, 110, yPosition);
  yPosition += 6;
  
  doc.text(`${i18n.t('export.facilitator')}: ${agendaData.facilitator || ''}`, 20, yPosition);
  if (agendaData.noteTaker) {
    doc.text(`${i18n.t('export.noteTaker')}: ${agendaData.noteTaker}`, 110, yPosition);
  }
  yPosition += 6;
  
  if (agendaData.attendees) {
    const attendeesLines = doc.splitTextToSize(`${i18n.t('export.attendees')}: ${agendaData.attendees}`, 170);
    doc.text(attendeesLines, 20, yPosition);
    yPosition += attendeesLines.length * 6;
  }
  
  yPosition += 5;

  // Meeting Objective
  doc.setFontSize(14);
  doc.text(i18n.t('export.meetingObjective'), 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  if (agendaData.meetingObjective) {
    const objectiveLines = doc.splitTextToSize(agendaData.meetingObjective, 170);
    doc.text(objectiveLines, 20, yPosition);
    yPosition += objectiveLines.length * 6 + 5;
  }

  // Agenda Items
  doc.setFontSize(14);
  doc.text(i18n.t('export.agendaItems'), 20, yPosition);
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
        doc.text(`${i18n.t('export.speaker')}: ${item.owner}`, 30, yPosition);
        yPosition += 5;
      }
      if (item.timeAllocation) {
        doc.text(`${i18n.t('export.duration')}: ${item.timeAllocation} ${i18n.t('export.minutes')}`, 30, yPosition);
        yPosition += 5;
      }
      if (item.description) {
        const descLines = doc.splitTextToSize(`${i18n.t('export.description')}: ${item.description}`, 160);
        doc.text(descLines, 30, yPosition);
        yPosition += descLines.length * 5;
      }
      if (item.expectedOutput) {
        const outputLines = doc.splitTextToSize(`${i18n.t('export.expectedOutput')}: ${item.expectedOutput}`, 160);
        doc.text(outputLines, 30, yPosition);
        yPosition += outputLines.length * 5;
      }
      yPosition += 3;
    });
  } else {
    doc.text('-', 25, yPosition);
    yPosition += 10;
  }

  // Action Items
  doc.setFontSize(14);
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  doc.text(i18n.t('export.actionItems'), 20, yPosition);
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
        doc.text(`${i18n.t('export.owner')}: ${item.owner}`, 30, yPosition);
      }
      if (item.deadline) {
        doc.text(`${i18n.t('export.deadline')}: ${item.deadline}`, 30, yPosition + 5);
      }
      yPosition += 10;
    });
  } else {
    doc.text('-', 25, yPosition);
  }

  const fileName = getFileName(agendaData, 'pdf', language); // 修复：传递 agendaData
  doc.save(fileName);
};

// DOCX export
export const generateDOCX = async (agendaData, language = 'en') => {
  // Set language for i18n
  await i18n.changeLanguage(language);
  
  const sections = [];

  // Title
  sections.push(
    new Paragraph({
      text: agendaData.meetingTitle || i18n.t('export.defaultTitle'),
      heading: HeadingLevel.HEADING_1,
    })
  );

  // Basic Information
  sections.push(new Paragraph({ text: i18n.t('export.basicInfo'), heading: HeadingLevel.HEADING_2 }));
  sections.push(new Paragraph(`${i18n.t('export.date')}: ${agendaData.meetingDate || ''}`));
  sections.push(new Paragraph(`${i18n.t('export.time')}: ${agendaData.meetingTime || ''} (${i18n.t('export.duration')}: ${agendaData.duration || ''} ${i18n.t('export.minutes')})`));
  sections.push(new Paragraph(`${i18n.t('export.location')}: ${agendaData.location || ''}`));
  sections.push(new Paragraph(`${i18n.t('export.facilitator')}: ${agendaData.facilitator || ''}`));
  if (agendaData.noteTaker) {
    sections.push(new Paragraph(`${i18n.t('export.noteTaker')}: ${agendaData.noteTaker}`));
  }
  if (agendaData.attendees) {
    sections.push(new Paragraph(`${i18n.t('export.attendees')}: ${agendaData.attendees}`));
  }

  // Meeting Objective
  sections.push(new Paragraph({ text: i18n.t('export.meetingObjective'), heading: HeadingLevel.HEADING_2 }));
  if (agendaData.meetingObjective) {
    sections.push(new Paragraph(agendaData.meetingObjective));
  }

  // Agenda Items
  sections.push(new Paragraph({ text: i18n.t('export.agendaItems'), heading: HeadingLevel.HEADING_2 }));
  if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
    agendaData.agendaItems.forEach((item, index) => {
      sections.push(new Paragraph({ text: `${index + 1}. ${item.topic || ''}`, heading: HeadingLevel.HEADING_3 }));
      if (item.owner) sections.push(new Paragraph(`${i18n.t('export.speaker')}: ${item.owner}`));
      if (item.timeAllocation) sections.push(new Paragraph(`${i18n.t('export.duration')}: ${item.timeAllocation} ${i18n.t('export.minutes')}`));
      if (item.description) sections.push(new Paragraph(`${i18n.t('export.description')}: ${item.description}`));
      if (item.expectedOutput) sections.push(new Paragraph(`${i18n.t('export.expectedOutput')}: ${item.expectedOutput}`));
    });
  } else {
    sections.push(new Paragraph('-'));
  }

  // Action Items
  sections.push(new Paragraph({ text: i18n.t('export.actionItems'), heading: HeadingLevel.HEADING_2 }));
  if (agendaData.actionItems && agendaData.actionItems.length > 0) {
    agendaData.actionItems.forEach((item, index) => {
      sections.push(new Paragraph(`${index + 1}. ${item.task || ''}`));
      if (item.owner) sections.push(new Paragraph(`${i18n.t('export.owner')}: ${item.owner}`));
      if (item.deadline) sections.push(new Paragraph(`${i18n.t('export.deadline')}: ${item.deadline}`));
    });
  } else {
    sections.push(new Paragraph('-'));
  }

  const doc = new Document({
    sections: [{ children: sections }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = getFileName(agendaData, 'docx', language); // 修复：传递 agendaData
  saveAs(blob, fileName);
};

// TXT export
export const generateTXT = (agendaData, language = 'en') => {
  // Set language for i18n
  i18n.changeLanguage(language);
  
  let content = '';

  content += `=== ${agendaData.meetingTitle || i18n.t('export.defaultTitle')} ===\n\n`;

  content += `${i18n.t('export.basicInfo')}\n`;
  content += `${i18n.t('export.date')}: ${agendaData.meetingDate || ''}\n`;
  content += `${i18n.t('export.time')}: ${agendaData.meetingTime || ''} (${i18n.t('export.duration')}: ${agendaData.duration || ''} ${i18n.t('export.minutes')})\n`;
  content += `${i18n.t('export.location')}: ${agendaData.location || ''}\n`;
  content += `${i18n.t('export.facilitator')}: ${agendaData.facilitator || ''}\n`;
  if (agendaData.noteTaker) {
    content += `${i18n.t('export.noteTaker')}: ${agendaData.noteTaker}\n`;
  }
  if (agendaData.attendees) {
    content += `${i18n.t('export.attendees')}: ${agendaData.attendees}\n`;
  }
  content += '\n';

  content += `${i18n.t('export.meetingObjective')}\n`;
  if (agendaData.meetingObjective) {
    content += `${agendaData.meetingObjective}\n`;
  }
  content += '\n';

  content += `${i18n.t('export.agendaItems')}\n`;
  if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
    agendaData.agendaItems.forEach((item, index) => {
      content += `\n${index + 1}. ${item.topic || ''}\n`;
      if (item.owner) content += `   ${i18n.t('export.speaker')}: ${item.owner}\n`;
      if (item.timeAllocation) content += `   ${i18n.t('export.duration')}: ${item.timeAllocation} ${i18n.t('export.minutes')}\n`;
      if (item.description) content += `   ${i18n.t('export.description')}: ${item.description}\n`;
      if (item.expectedOutput) content += `   ${i18n.t('export.expectedOutput')}: ${item.expectedOutput}\n`;
    });
  } else {
    content += '-\n';
  }

  content += `\n${i18n.t('export.actionItems')}\n`;
  if (agendaData.actionItems && agendaData.actionItems.length > 0) {
    agendaData.actionItems.forEach((item, index) => {
      content += `${index + 1}. ${item.task || ''}\n`;
      if (item.owner) content += `   ${i18n.t('export.owner')}: ${item.owner}\n`;
      if (item.deadline) content += `   ${i18n.t('export.deadline')}: ${item.deadline}\n\n`;
    });
  } else {
    content += '-\n';
  }

  const fileName = getFileName(agendaData, 'txt', language); // 修复：传递 agendaData
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
};

// Get filename - 修复：添加 agendaData 参数
const getFileName = (agendaData, format, language) => {
  // Use meeting date from agendaData or fallback to current date
  const meetingDate = agendaData.meetingDate || new Date().toISOString().split('T')[0];
  
  const names = {
    zh: `会议议程-${meetingDate}`,
    en: `meeting-agenda-${meetingDate}`,
    ms: `agenda-mesyuarat-${meetingDate}`,
    ta: `கூட்ட-agenda-${meetingDate}`
  };
  
  const baseName = names[language] || names.en;
  return `${baseName}.${format}`;
};