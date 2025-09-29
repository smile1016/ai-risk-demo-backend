const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const result = require("./mock");

const modeEnv = process.env.MODE || "ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.deepseek.com",
});

// API 路由：风险预测
app.post("/predict-risk", async (req, res) => {
  const { tasks, mode } = req.body;
  const actualMode = mode || modeEnv;

  if (actualMode === "mock") {
    return res.json(result);
  } else {
    try {
      const tasks = req.body.tasks || [];

      // 将任务转为文本，交给 OpenAI
      const prompt = `
  你是一个项目风险分析助手。现在给你一组项目任务，请你识别每个任务的潜在风险，并以 JSON 数组的形式输出。
  分类范围请从以下选项中选择：
  - 进度风险
  - 质量风险
  - 资源风险
  - 依赖风险
  - 合规风险
  - 其他
  
  输出 JSON 格式数组，包含字段：
  - whole_identifier (任务ID)
  - title (任务名)
  - type (风险类型：延期/质量/资源/其他)
  - probability (风险概率：0-1之间的浮点数)
  - impact (风险影响程度：0-1之间的浮点数)
  - risk_score (风险得分：0-1之间的浮点数，计算方式：probability * impact)
  - reason (简要说明原因)
  
  任务数据：${JSON.stringify(tasks, null, 2)}
      `;

      const completion = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const text = completion.choices[0].message.content;
      console.log("AI 返回原文:", text);

      const jsonMatch = text.match(/\[([\s\S]*?)\]/);
      if (jsonMatch) {
        risks = JSON.parse(jsonMatch[0]); // 提取到的就是纯 JSON 数组
      } else {
        risks = [
          {
            name: "解析失败",
            type: "其他",
            level: "低",
            reason: "未找到 JSON 数组",
          },
        ];
      }

      res.json(risks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "风险预测失败" });
    }
  }
});

// Mock 导入 pingcode 数据
app.post("/import/pingcode-mock", (req, res) => {
  const tasks = [
    {
      whole_identifier: "PJM-101",
      title: "登录接口",
      description: "实现用户认证",
      status: "In Progress",
      assignee: "Alice",
      due: {
        date: 1759593600,
        with_time: 0,
      },
      properties: {
        estimated_workload: 12,
        remaining_workload: 0,
        reported_workload: 12,
      },
    },
    {
      whole_identifier: "PJM-102",
      title: "支付模块",
      description: "对接支付网关",
      status: "To Do",
      assignee: "Bob",
      due: {
        date: 1760025600,
        with_time: 0,
      },
      properties: {
        estimated_workload: 24,
        remaining_workload: 4,
        reported_workload: 20,
      },
    },
    {
      whole_identifier: "PJM-103",
      title: "订单模块",
      description: "处理订单创建和查询",
      status: "In Progress",
      assignee: "Charlie",
      due: {
        date: 1760457600,
        with_time: 0,
      },
      properties: {
        estimated_workload: 18,
        remaining_workload: 10,
        reported_workload: 8,
      },
    },
    {
      whole_identifier: "PJM-104",
      title: "用户模块",
      description: "处理用户注册和登录",
      status: "To Do",
      assignee: "David",
      due: {
        date: 1760889600,
        with_time: 0,
      },
      properties: {
        estimated_workload: 12,
        remaining_workload: 10,
        reported_workload: 2,
      },
    },
  ];
  res.json({ source: "pingcode-mock", count: tasks.length, tasks });
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`✅ Risk server running at http://localhost:${port}`)
);

// {
//   "_id": "68d4f1cbc9c2c7998fee8866",
//   "identifier": 4,
//   "whole_identifier": "DDFB-4",
//   "type": 5,
//   "type_id": "62a31031a4426cd04da6dcb4",
//   "project_id": "68d4f106f946930c7f68cad5",
//   "created_by": "18ca07872f354c03b111bc8e0a08aadc",
//   "created_at": 1758785995,
//   "source": {
//     "type": 1
//   },
//   "participants": [
//     {
//       "id": "18ca07872f354c03b111bc8e0a08aadc",
//       "type": 1,
//       "subscription": 40
//     }
//   ],
//   "title": "迭代内的缺陷",
//   "parent_id": "68d4f18dc9c2c7998fee882e",
//   "parent_ids": [
//     "68d4f18dc9c2c7998fee882e"
//   ],
//   "due": {
//     "date": null,
//     "with_time": 0
//   },
//   "phase": {
//     "ref_id": null
//   },
//   "state_id": "62a31031a4426cd04da6dcb6",
//   "state_type": 1,
//   "state_updated_at": 1758785995,
//   "is_completed": 0,
//   "completed_at": null,
//   "completed_by": null,
//   "properties": {
//     "estimated_workload": null,
//     "remaining_workload": null,
//     "reported_workload": null,
//     "board_id": null,
//     "swimlane_id": null,
//     "entry_id": null,
//     "entry_status": null,
//     "entry_position": null,
//     "operation_time": 1758785995,
//     "iteration": "68d4f127f946930c7f68cb36",
//     "version": [
//       "68d4f152f946930c7f68cb59"
//     ],
//     "severity": null,
//     "story_points": null,
//     "replay_version": null,
//     "reappear_probability": null,
//     "bug_type": null,
//     "reason": null,
//     "solution": null,
//     "replay_step": null,
//     "zhichixuanzefu": null,
//     "pingfen0621": null,
//     "lianjie0621": null,
//     "jindu0621_1": null,
//     "xialaduoxuan": []
//   },
//   "position": 131072,
//   "short_id": "wlrrg8uB",
//   "updated_at": 1758786270,
//   "updated_by": "18ca07872f354c03b111bc8e0a08aadc",
//   "is_deleted": 0,
//   "is_archived": 0,
//   "team": "62a31031fbadbd0d9adc51cf",
//   "assignee": null,
//   "start": {
//     "date": null,
//     "with_time": 0
//   },
//   "priority": null,
//   "tags": [],
//   "description": null,
//   "attachment_count": 0,
//   "user_group_participants": [],
//   "comment_count": 0,
//   "likes": [],
//   "like_count": 0,
//   "imported_at": null,
//   "imported_by": null,
//   "enter_iteration_at": 1758786019,
//   "resources": [],
//   "review_result_state": 0,
//   "_updated_at": 1758786270368,
//   "version_id": "68d4f1cbc9c2c7998fee8867",
//   "version_identifier": 1,
//   "permissions": "1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
//   "scope": {
//     "project_template_type": "hybrid",
//     "work_item_type": "62a31031a4426cd04da6dcb4"
//   },
//   "extend_property_keys": [
//     "remaining_workload",
//     "estimated_workload",
//     "reported_workload",
//     "progress_by_remaining",
//     "board_id",
//     "priority",
//     "severity",
//     "story_points",
//     "iteration",
//     "replay_version",
//     "reappear_probability",
//     "bug_type",
//     "reason",
//     "version",
//     "solution",
//     "tags",
//     "description",
//     "replay_step",
//     "phase",
//     "zhichixuanzefu",
//     "pingfen0621",
//     "lianjie0621",
//     "jindu0621_1",
//     "state_dwell_time",
//     "xialaduoxuan"
//   ],
//   "sorted_property_keys": [
//     "board_id",
//     "priority",
//     "severity",
//     "story_points",
//     "iteration",
//     "replay_version",
//     "reappear_probability",
//     "bug_type",
//     "reason",
//     "version",
//     "solution",
//     "tags",
//     "description",
//     "replay_step",
//     "phase",
//     "zhichixuanzefu",
//     "pingfen0621",
//     "lianjie0621",
//     "jindu0621_1",
//     "state_dwell_time",
//     "xialaduoxuan"
//   ],
//   "state_dwell_time": null,
//   "real_type_group": "bug",
//   "type_group": 3,
//   "relation_total": {
//     "work_item": 0,
//     "objective": 0,
//     "idea": 0,
//     "ticket": 0,
//     "test_case": 0,
//     "test_run": 0,
//     "page": 0
//   },
//   "link_count": 0,
//   "quick_operation_actions": {
//     "parent": 1,
//     "state": 1,
//     "assignee": 1,
//     "start": 1,
//     "due": 1,
//     "priority": 1,
//     "tag": 1,
//     "copy": 1,
//     "move": 1,
//     "archive": 1,
//     "active": 0,
//     "delete": 1,
//     "sprint": 0,
//     "version": 1,
//     "relate": 1,
//     "board": 0
//   },
//   "version_name": "v1",
//   "version_description": "Initialization & creation",
//   "principal_version": "v1",
//   "is_latest_version": 1,
//   "property_permissions": {
//     "title": 1,
//     "identifier": 1,
//     "type": 1,
//     "state_id": 1,
//     "assignee": 1,
//     "parent_id": 1,
//     "start": 1,
//     "due": 1,
//     "participants": 1,
//     "created_at": 1,
//     "created_by": 1,
//     "updated_at": 1,
//     "updated_by": 1,
//     "completed_at": 1,
//     "completed_by": 1,
//     "archived_at": 1,
//     "archived_by": 1,
//     "deleted_at": 1,
//     "deleted_by": 1,
//     "state_dwell_time": 0,
//     "state_type": 1,
//     "attachments": 1,
//     "review_result_state": 1,
//     "project_id": 1,
//     "reported_workload": 1,
//     "remaining_workload": 1,
//     "estimated_workload": 1,
//     "progress_by_remaining": 1,
//     "board_id": 1,
//     "priority": 1,
//     "phase": 1,
//     "version": 1,
//     "backlog_type": 1,
//     "backlog_from": 1,
//     "tags": 1,
//     "description": 1,
//     "idea_count": 1,
//     "work_item_count": 1,
//     "ticket_count": 1,
//     "test_case_count": 1,
//     "objective_count": 1,
//     "iteration": 1,
//     "schedule_mode": 1,
//     "severity": 1,
//     "story_points": 1,
//     "replay_version": 1,
//     "reappear_probability": 1,
//     "bug_type": 1,
//     "reason": 1,
//     "solution": 1,
//     "replay_step": 1,
//     "zhichixuanzefu": 1,
//     "pingfen0621": 1,
//     "lianjie0621": 1,
//     "jindu0621_1": 1,
//     "xialaduoxuan": 1,
//     "job_type": 1,
//     "jindushuxing": 1,
//     "child_progress": 1,
//     "dependency_work_item": 1,
//     "principal_version": 1,
//     "deliverables": 1
//   },
//   "deliverables": {
//     "total": 0,
//     "submitted": 0
//   },
//   "child_ids": [],
//   "child_progress": 0,
//   "child_completed_count": 0,
//   "child_count": 0
// }
