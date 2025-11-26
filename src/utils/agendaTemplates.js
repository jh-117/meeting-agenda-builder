export const generateAgendaTemplate = (basicInfo) => {
  return {
    ...basicInfo,
    meetingObjective: '本次会议的目标是讨论并规划下一季度的工作重点。',
    agendaItems: [
      {
        topic: '上季度总结',
        owner: '项目经理',
        timeAllocation: 15,
        description: '回顾上季度的关键成就和指标完成情况',
        expectedOutput: '确认关键指标的达成情况',
      },
      {
        topic: '本季度目标设定',
        owner: '产品负责人',
        timeAllocation: 20,
        description: '讨论本季度的OKR和关键项目',
        expectedOutput: '确定本季度的优先级和资源分配',
      },
      {
        topic: '风险评估和应对',
        owner: '风险经理',
        timeAllocation: 15,
        description: '识别潜在的风险因素和应对方案',
        expectedOutput: '制定风险应对计划',
      },
      {
        topic: '资源规划',
        owner: '运营经理',
        timeAllocation: 15,
        description: '讨论人力、技术和预算资源的分配',
        expectedOutput: '确认资源分配方案',
      },
    ],
    discussionItems: `• 是否需要调整现有的工作流程？
• 有哪些新技术需要采用？
• 团队是否需要额外的培训？`,
    actionItems: [
      {
        task: '完成详细的季度计划文档',
        owner: '项目经理',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        task: '发送会议记录给所有参与者',
        owner: '记录人',
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
    ],
    notes: `相关文件：上季度总结报告、本季度预算表、团队绩效评估数据\n需要的支持：IT基础设施确认、新工具许可证采购`,
  };
};