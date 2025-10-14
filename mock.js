const result = [
  {
    "whole_identifier": "ZYK-1",
    "title": "用户注册接口开发",
    "assignee": "c85906b92dd44a329068d61188d74110",
    "type": [
      "进度风险",
      "资源风险",
      "工时风险"
    ],
    "probability": 0.7,
    "impact": 0.7,
    "risk_score": 0.49,
    "reason": [
      "子任务进度滞后(50%)",
      "负责人同时承担多个高优先级任务",
      "工时估算偏差较大(35 vs 40)"
    ]
  },
  {
    "whole_identifier": "ZYK-2",
    "title": "前端登录页面开发",
    "assignee": "b123456789abcdef12345678",
    "type": [
      "工时风险"
    ],
    "probability": 0.4,
    "impact": 0.5,
    "risk_score": 0.2,
    "reason": [
      "工时估算与实际执行存在偏差(25 vs 30)"
    ]
  },
  {
    "whole_identifier": "ZYK-3",
    "title": "支付接口开发",
    "assignee": "c85906b92dd44a329068d61188d74110",
    "type": [
      "进度风险",
      "资源风险",
      "工时风险",
      "质量风险"
    ],
    "probability": 0.8,
    "impact": 0.9,
    "risk_score": 0.72,
    "reason": [
      "子任务进度严重滞后(20%)",
      "负责人任务过载",
      "剩余工时较多(30/50)",
      "故事点较高(8)复杂度大"
    ]
  },
  {
    "whole_identifier": "ZYK-4",
    "title": "订单导出功能",
    "assignee": "d987654321abcdef98765432",
    "type": [
      "优先级风险"
    ],
    "probability": 0.3,
    "impact": 0.4,
    "risk_score": 0.12,
    "reason": [
      "优先级较低可能被高优先级任务挤占资源"
    ]
  },
  {
    "whole_identifier": "ZYK-5",
    "title": "系统测试与验收",
    "assignee": "e112233445566778899aabbcc",
    "type": [
      "进度风险",
      "质量风险"
    ],
    "probability": 0.6,
    "impact": 0.8,
    "risk_score": 0.48,
    "reason": [
      "剩余工时较多(20/35)",
      "测试任务质量风险较高"
    ]
  }
]
module.exports = result;
