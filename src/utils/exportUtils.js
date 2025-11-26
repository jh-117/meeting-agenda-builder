import jsPDF from 'jspdf';
import { Packer, Document, Paragraph, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export const generatePDF = (agendaData) => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  const addText = (text, size = 11, isBold = false, isHeading = false) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.setFontSize(size);
    if (isBold) doc.setFont(undefined, 'bold');
    else doc.setFont(undefined, 'normal');
    
    if (isHeading) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 8 + 5;
    } else {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * 5 + 2;
    }
  };

  // 标题
  addText(agendaData.meetingTitle || '会议议程', 20, true, true);
  yPosition += 5;

  // 基本信息
  addText('基本信息', 13, true);
  addText(`日期: ${agendaData.meetingDate}`);
  addText(`时间: ${agendaData.meetingTime} (时长: ${agendaData.duration} 分钟)`);
  addText(`地点: ${agendaData.location}`);
  addText(`主持人: ${agendaData.facilitator}`);
  addText(`记录人: ${agendaData.noteTaker}`);
  addText(`参与者: ${agendaData.attendees}`);
  yPosition += 5;

  // 会议目的
  addText('会议目的', 13, true);
  addText(agendaData.meetingObjective || '');
  yPosition += 5;

  // 议程项
  addText('议程项', 13, true);
  if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
    agendaData.agendaItems.forEach((item, index) => {
      addText(`${index + 1}. ${item.topic}`, 11, true);
      addText(`讲述人: ${item.owner}`);
      addText(`时间: ${item.timeAllocation} 分钟`);
      addText(`描述: ${item.description}`);
      addText(`预期产出: ${item.expectedOutput}`);
      yPosition += 3;
    });
  }

  // 讨论项
  addText('讨论项', 13, true);
  addText(agendaData.discussionItems || '');
  yPosition += 5;

  // 行动项
  addText('行动项', 13, true);
  if (agendaData.actionItems && agendaData.actionItems.length > 0) {
    agendaData.actionItems.forEach((item, index) => {
      addText(`${index + 1}. ${item.task}`);
      addText(`负责人: ${item.owner} | 截止日期: ${item.deadline}`);
      yPosition += 3;
    });
  }

  // 注释
  addText('注释和附加信息', 13, true);
  addText(agendaData.notes || '');

  doc.save(`meeting-agenda-${new Date().getTime()}.pdf`);
};

export const generateDOCX = async (agendaData) => {
  const sections = [];

  // 标题
  sections.push(
    new Paragraph({
      text: agendaData.meetingTitle || '会议议程',
      heading: HeadingLevel.HEADING_1,
    })
  );

  // 基本信息
  sections.push(new Paragraph({ text: '基本信息', heading: HeadingLevel.HEADING_2 }));
  sections.push(new Paragraph(`日期: ${agendaData.meetingDate}`));
  sections.push(new Paragraph(`时间: ${agendaData.meetingTime} (时长: ${agendaData.duration} 分钟)`));
  sections.push(new Paragraph(`地点: ${agendaData.location}`));
  sections.push(new Paragraph(`主持人: ${agendaData.facilitator}`));
  sections.push(new Paragraph(`记录人: ${agendaData.noteTaker}`));
  sections.push(new Paragraph(`参与者: ${agendaData.attendees}`));

  // 会议目的
  sections.push(new Paragraph({ text: '会议目的', heading: HeadingLevel.HEADING_2 }));
  sections.push(new Paragraph(agendaData.meetingObjective || ''));

  // 议程项
  sections.push(new Paragraph({ text: '议程项', heading: HeadingLevel.HEADING_2 }));
  if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
    agendaData.agendaItems.forEach((item, index) => {
      sections.push(new Paragraph({ text: `${index + 1}. ${item.topic}`, heading: HeadingLevel.HEADING_3 }));
      sections.push(new Paragraph(`讲述人: ${item.owner}`));
      sections.push(new Paragraph(`时间: ${item.timeAllocation} 分钟`));
      sections.push(new Paragraph(`描述: ${item.description}`));
      sections.push(new Paragraph(`预期产出: ${item.expectedOutput}`));
    });
  }

  // 讨论项
  sections.push(new Paragraph({ text: '讨论项', heading: HeadingLevel.HEADING_2 }));
  sections.push(new Paragraph(agendaData.discussionItems || ''));

  // 行动项
  sections.push(new Paragraph({ text: '行动项', heading: HeadingLevel.HEADING_2 }));
  if (agendaData.actionItems && agendaData.actionItems.length > 0) {
    agendaData.actionItems.forEach((item, index) => {
      sections.push(new Paragraph(`${index + 1}. ${item.task}`));
      sections.push(new Paragraph(`负责人: ${item.owner} | 截止日期: ${item.deadline}`));
    });
  }

  // 注释
  sections.push(new Paragraph({ text: '注释和附加信息', heading: HeadingLevel.HEADING_2 }));
  sections.push(new Paragraph(agendaData.notes || ''));

  const doc = new Document({
    sections: [{ children: sections }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `meeting-agenda-${new Date().getTime()}.docx`);
};

export const generateTXT = (agendaData) => {
  let content = '';

  content += `=== ${agendaData.meetingTitle || '会议议程'} ===\n\n`;

  content += '【基本信息】\n';
  content += `日期: ${agendaData.meetingDate}\n`;
  content += `时间: ${agendaData.meetingTime} (时长: ${agendaData.duration} 分钟)\n`;
  content += `地点: ${agendaData.location}\n`;
  content += `主持人: ${agendaData.facilitator}\n`;
  content += `记录人: ${agendaData.noteTaker}\n`;
  content += `参与者: ${agendaData.attendees}\n\n`;

  content += '【会议目的】\n';
  content += `${agendaData.meetingObjective || ''}\n\n`;

  content += '【议程项】\n';
  if (agendaData.agendaItems && agendaData.agendaItems.length > 0) {
    agendaData.agendaItems.forEach((item, index) => {
      content += `\n${index + 1}. ${item.topic}\n`;
      content += `   讲述人: ${item.owner}\n`;
      content += `   时间: ${item.timeAllocation} 分钟\n`;
      content += `   描述: ${item.description}\n`;
      content += `   预期产出: ${item.expectedOutput}\n`;
    });
  }

  content += '\n【讨论项】\n';
  content += `${agendaData.discussionItems || ''}\n\n`;

  content += '【行动项】\n';
  if (agendaData.actionItems && agendaData.actionItems.length > 0) {
    agendaData.actionItems.forEach((item, index) => {
      content += `${index + 1}. ${item.task}\n`;
      content += `   负责人: ${item.owner}\n`;
      content += `   截止日期: ${item.deadline}\n\n`;
    });
  }

  content += '【注释和附加信息】\n';
  content += `${agendaData.notes || ''}\n`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `meeting-agenda-${new Date().getTime()}.txt`);
};