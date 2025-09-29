const result = [
  {
    whole_identifier: "PJM-101",
    title: "登录接口",
    type: "质量风险",
    probability: 0.6,
    impact: 0.8,
    risk_score: 0.48,
    reason: "用户认证功能涉及安全敏感信息，实现不当可能导致安全漏洞",
  },
  {
    whole_identifier: "PJM-102",
    title: "支付模块",
    type: "依赖风险",
    probability: 0.7,
    impact: 0.9,
    risk_score: 0.63,
    reason: "对接外部支付网关存在接口兼容性和稳定性依赖风险",
  },
  {
    whole_identifier: "PJM-103",
    title: "订单模块",
    type: "进度风险",
    probability: 0.8,
    impact: 0.7,
    risk_score: 0.56,
    reason: "剩余工作量较大，进度落后，存在延期风险",
  },
  {
    whole_identifier: "PJM-104",
    title: "用户模块",
    type: "资源风险",
    probability: 0.5,
    impact: 0.6,
    risk_score: 0.3,
    reason: "任务尚未开始，但剩余工作量接近预估总量，可能存在资源分配不足",
  },
];

module.exports = result;
