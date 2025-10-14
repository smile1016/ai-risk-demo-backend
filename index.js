// backend/index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// 如果要调用 OpenAI，取消注释下面两行并确保安装 openai
const { OpenAIApi, Configuration } = require("openai/index.js");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ======= 配置模式：mock 或 real =======
const MODE = "mock"; // 'mock' or 'real'
// const MODE = process.env.MODE || "mock"; // 'mock' or 'real'

let openai = null;
if (MODE === "real") {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

// 简单提示词封装
function buildPrompt(tasks) {
  return `
请基于下面的任务数据，判断每个任务是否存在潜在问题并分类为：延期/资源不足/质量问题/正常，
并给出风险等级（高/中/低）和简要原因。请以 JSON 数组返回，每个元素包含：
{name, type, level, reason}
任务数据：
${JSON.stringify(tasks)}
  `;
}

// Mock 风险分析（用于没有 API key 的演示）
function mockAnalyze(tasks) {
  return tasks.map((t, idx) => {
    // 简单启发式：如果描述中含有关键字，则给出风险
    const text = (t.description || "") + " " + (t.status || "");
    const lower = text.toLowerCase();

    let type = "正常",
      level = "低",
      reason = "无明显风险",
      probability = 0.2,
      impact = 0.3,
      risk_score = 0.06;

    if (
      lower.includes("block") ||
      lower.includes("阻塞") ||
      lower.includes("无法")
    ) {
      type = "质量风险";
      level = "高";
      reason = "存在阻塞或质量问题，可能影响整体项目进度";
      probability = 0.6 + Math.random() * 0.2; // 0.6-0.8
      impact = 0.7 + Math.random() * 0.2; // 0.7-0.9
      risk_score = probability * impact;
    } else if (
      lower.includes("delay") ||
      lower.includes("延期") ||
      lower.includes("overdue")
    ) {
      type = "延期";
      level = "高";
      reason = "任务预计会延期，可能影响后续任务";
      probability = 0.7 + Math.random() * 0.2; // 0.7-0.9
      impact = 0.6 + Math.random() * 0.2; // 0.6-0.8
      risk_score = probability * impact;
    } else if (
      lower.includes("overload") ||
      lower.includes("加班") ||
      lower.includes("人手不足")
    ) {
      type = "资源不足";
      level = "中";
      reason = "可能存在资源/人手不足，需要关注人员分配";
      probability = 0.4 + Math.random() * 0.2; // 0.4-0.6
      impact = 0.5 + Math.random() * 0.2; // 0.5-0.7
      risk_score = probability * impact;
    } else if (
      lower.includes("依赖") ||
      lower.includes("第三方") ||
      lower.includes("对接")
    ) {
      type = "依赖风险";
      level = "中";
      reason = "存在外部依赖，可能影响开发进度和质量";
      probability = 0.5 + Math.random() * 0.2; // 0.5-0.7
      impact = 0.7 + Math.random() * 0.2; // 0.7-0.9
      risk_score = probability * impact;
    } else if (Math.random() < 0.15) {
      type = "延期";
      level = "中";
      reason = "模型推测存在延迟风险";
      probability = 0.3 + Math.random() * 0.2; // 0.3-0.5
      impact = 0.4 + Math.random() * 0.2; // 0.4-0.6
      risk_score = probability * impact;
    }

    // 根据任务进度信息进行额外判断
    if (t.properties) {
      const {
        estimated_workload = 0,
        remaining_workload = 0,
        reported_workload = 0,
      } = t.properties;

      // 如果剩余工作量很大，且已报工很少，增加进度风险
      if (
        estimated_workload > 0 &&
        remaining_workload / estimated_workload > 0.6 &&
        reported_workload / estimated_workload < 0.4
      ) {
        type = "进度风险";
        level = "高";
        reason = "剩余工作量较大，进度落后，存在延期风险";
        probability = 0.7 + Math.random() * 0.15;
        impact = 0.6 + Math.random() * 0.2;
        risk_score = probability * impact;
      }

      // 如果任务还没开始，但剩余工作量接近预估总量
      if (
        estimated_workload > 0 &&
        remaining_workload / estimated_workload > 0.8 &&
        reported_workload / estimated_workload < 0.2
      ) {
        type = "资源风险";
        level = "中";
        reason = "任务尚未开始，但剩余工作量接近预估总量，可能存在资源分配不足";
        probability = 0.4 + Math.random() * 0.15;
        impact = 0.5 + Math.random() * 0.15;
        risk_score = probability * impact;
      }
    }

    // 保留小数点后两位
    probability = Math.round(probability * 100) / 100;
    impact = Math.round(impact * 100) / 100;
    risk_score = Math.round(risk_score * 100) / 100;

    return {
      name: t.name || `任务_${idx + 1}`,
      type,
      level,
      reason,
      whole_identifier: t.whole_identifier,
      title: t.title,
      probability,
      impact,
      risk_score,
      assignee: t.assignee,
      due: t.due,
      properties: t.properties,
    };
  });
}

app.post("/predict-risk", async (req, res) => {
  const tasks = req.body.tasks || [];

  if (MODE === "mock") {
    const result = mockAnalyze(tasks);
    return res.json(result);
  }

  // real mode: 调用 OpenAI
  try {
    const prompt = buildPrompt(tasks);
    const completion = await openai.createChatCompletion({
      model: "gpt-4o", // 或者你有可用的模型
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
    });
    const txt = completion.data.choices[0].message.content;
    // 让返回为 JSON：若模型已返回 JSON，则 parse，否则包裹处理
    try {
      const parsed = JSON.parse(txt);
      return res.json(parsed);
    } catch (e) {
      // 若解析失败，返回原始文本到前端以便调试
      return res.json({ raw: txt });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "AI 调用失败", detail: err.message || err.toString() });
  }
});

// Mock 导入 pingcode 数据
app.get("/import/pingcode-mock", (req, res) => {
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
app.listen(port, "0.0.0.0", () => {
  console.log(`Backend running on http://localhost:${port}  MODE=${MODE}`);
  console.log(`可从以下地址访问：`);
  console.log(`  - http://localhost:${port}`);
  console.log(`  - http://127.0.0.1:${port}`);
});
