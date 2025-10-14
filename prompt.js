function buildRiskPrompt(tasks) {
  return `
你是一名资深项目管理顾问和AI风险分析专家。
请基于以下多个任务实体数据，进行多维度风险分析（进度、资源、工时、依赖、优先级、质量、成本等），并返回严格的 JSON 数据。

分析逻辑：
- 进度风险：根据 start.date、due.date、child_progress、is_completed、progress_by_remaining 判断。
- 资源风险：根据 assignee、child_count、team、principal_version_count 判断。
- 工时风险：根据 estimated_workload、remaining_workload、reported_workload、workload_ss_emh 判断。
- 依赖风险：根据 child_ids、dependency_count 判断。
- 优先级/调度风险：根据 priority、version、iteration、phase 判断。
- 质量风险：根据 description、story_points 判断。
- 成本/价值风险：根据 business_value、effort 判断。

输出 JSON 格式：
{
  "tasks": [
    {
      "whole_identifier": "${tasks.whole_identifier}",
      "title": "${tasks.title}",
      "assignee": "${tasks.assignee}",
      "type": ["进度风险","资源风险"],
      "probability": 0.7,
      "impact": 0.8,
      "risk_score": 0.56,
      "reason": ["负责人任务量高","截止日期临近"]
    }
  ],
  "summary": {
    "dominant_risk_types": ["进度风险","资源风险"],
    "average_risk_score": 0.56,
    "high_risk_tasks": ["${tasks.whole_identifier}"],
    "owner_load_ranking": [{"owner":"${tasks.assignee}","task_count":1,"avg_risk":0.56}],
    "suggestions": ["合理分配负责人工作量","关注进度紧张任务"]
  }
}

任务实体：
${JSON.stringify(tasks, null, 2)}

请仅返回 JSON 数据。
  `;
}


// function buildRiskPrompt(tasks) {
//     return `
//   你是一名专业的项目风险分析专家。下面提供一组项目任务数据（包含负责人、工时、起止时间、依赖关系等字段），
//   请基于这些字段进行 **多维度风险分析**，识别任务和整体项目的潜在风险。

//   ---

//   【分析逻辑】
//   请根据以下维度综合判断：
//   1. **工时风险**：actual_hours > estimated_hours 时，说明工时超支。
//   2. **资源风险**：如果某个负责人拥有的任务数量较多（超过平均水平），说明其存在资源分配风险。
//   3. **进度风险**：当前时间接近 end_date 但任务状态仍为“进行中”，存在延期风险。
//   4. **依赖风险**：如果依赖的任务未完成，当前任务存在阻塞风险。
//   5. **质量风险**：任务标题或描述中包含“测试”、“验收”等字样但工时偏低时，质量风险较高。
//   6. **优先级冲突**：高优先级任务集中在同一负责人处，容易形成瓶颈。
//   7. **其他风险**：根据任务内容自动识别的非显式风险。

//   ---

//   【输出要求】
//   请严格返回 JSON 格式：

//   {
//     "tasks": [
//       {
//         "whole_identifier": "TASK-001",
//         "title": "前端页面开发",
//         "assignee": "张三",
//         "type": ["进度风险", "资源风险"],
//         "probability": 0.75,
//         "impact": 0.8,
//         "risk_score": 0.6,
//         "reason": [
//           "任务接近截止时间但尚未完成",
//           "负责人张三任务量超出平均值"
//         ]
//       }
//     ],
//     "summary": {
//       "dominant_risk_types": ["进度风险", "资源风险"],
//       "average_risk_score": 0.52,
//       "high_risk_tasks": ["TASK-001", "TASK-004"],
//       "owner_load_ranking": [
//         { "owner": "张三", "task_count": 5, "avg_risk": 0.67 },
//         { "owner": "李四", "task_count": 2, "avg_risk": 0.31 }
//       ],
//       "suggestions": [
//         "重新分配任务，减轻张三的任务负担",
//         "优先推进高优先级任务，控制延期风险"
//       ]
//     }
//   }

//   ---

//   【任务数据】
//   ${JSON.stringify(tasks, null, 2)}

//   请仅返回 JSON 数据，不要包含解释说明。
//     `;
//   }


  module.exports = buildRiskPrompt;
