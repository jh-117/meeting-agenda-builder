// src/services/agendaAIService.js

// Mock service for testing - remove this when Supabase is working
export const generateAgendaWithAI = async (formData) => {
  console.log('Mock: Generating agenda with data:', formData);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return realistic mock data
  return {
    agendaItems: [
      {
        id: '1',
        topic: '项目介绍与目标',
        owner: formData.facilitator || '主持人',
        timeAllocation: 15,
        description: '介绍会议目的和预期成果',
        expectedOutput: '所有参会者明确会议目标'
      },
      {
        id: '2',
        topic: '主要议题讨论',
        owner: formData.facilitator || '主持人', 
        timeAllocation: 30,
        description: '深入讨论会议核心议题',
        expectedOutput: '达成共识或做出决策'
      },
      {
        id: '3',
        topic: '行动计划制定',
        owner: formData.facilitator || '主持人',
        timeAllocation: 10,
        description: '明确下一步行动和责任人',
        expectedOutput: '制定具体的行动项和时间表'
      },
      {
        id: '4', 
        topic: '总结与反馈',
        owner: formData.facilitator || '主持人',
        timeAllocation: 5,
        description: '总结会议成果和收集反馈',
        expectedOutput: '确认会议成果和改进建议'
      }
    ],
    actionItems: [
      {
        task: '整理会议纪要',
        owner: formData.facilitator || '主持人',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]
  };
}

export const regenerateAgendaWithAI = async (agendaData) => {
  console.log('Mock: Regenerating agenda with data:', agendaData);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    agendaItems: [
      {
        id: '1',
        topic: '开场与议程确认',
        owner: agendaData.facilitator || '主持人',
        timeAllocation: 10,
        description: '确认会议议程和时间安排',
        expectedOutput: '参会者对议程达成一致'
      },
      {
        id: '2',
        topic: '重点问题分析',
        owner: agendaData.facilitator || '主持人',
        timeAllocation: 25,
        description: '分析当前面临的主要问题和挑战',
        expectedOutput: '明确问题根源和影响'
      },
      {
        id: '3',
        topic: '解决方案探讨',
        owner: agendaData.facilitator || '主持人',
        timeAllocation: 20,
        description: '讨论可能的解决方案和实施路径',
        expectedOutput: '确定优选解决方案'
      },
      {
        id: '4',
        topic: '资源分配与时间表',
        owner: agendaData.facilitator || '主持人', 
        timeAllocation: 10,
        description: '明确资源需求和实施时间表',
        expectedOutput: '制定详细的实施计划'
      }
    ],
    actionItems: [
      {
        task: '准备解决方案详细方案',
        owner: agendaData.facilitator || '主持人',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ]
  };
}