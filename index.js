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
      reason = "无明显风险";
    if (
      lower.includes("block") ||
      lower.includes("阻塞") ||
      lower.includes("无法")
    ) {
      type = "质量问题";
      level = "高";
      reason = "存在阻塞或质量问题";
    } else if (
      lower.includes("delay") ||
      lower.includes("延期") ||
      lower.includes("overdue")
    ) {
      type = "延期";
      level = "高";
      reason = "任务预计会延期";
    } else if (
      lower.includes("overload") ||
      lower.includes("加班") ||
      lower.includes("人手不足")
    ) {
      type = "资源不足";
      level = "中";
      reason = "可能存在资源/人手不足";
    } else if (Math.random() < 0.15) {
      type = "延期";
      level = "中";
      reason = "模型推测存在延迟风险";
    }

    return {
      name: t.name || `任务_${idx + 1}`,
      type,
      level,
      reason,
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

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Backend running on http://localhost:${port}  MODE=${MODE}`)
);
