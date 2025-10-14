# 代码格式化配置指南

本项目已配置好代码格式化功能，支持多种使用方式。

## 📦 已安装的工具

- **Prettier** - 代码格式化工具

## 🔧 配置文件说明

### `.prettierrc`

Prettier 的配置文件，定义了代码格式化规则：

- 使用分号
- 使用双引号
- 每行最大 80 字符
- 使用 2 个空格缩进
- 使用 LF 换行符

### `.editorconfig`

编辑器配置文件，确保不同编辑器使用统一的编码风格。

### `.vscode/settings.json`

VS Code 工作区配置，已启用：

- ✅ 保存时自动格式化
- ✅ 粘贴时自动格式化
- ✅ 默认使用 Prettier 作为格式化工具

## 🚀 使用方法

### 方法一：右键菜单格式化（推荐）

1. 在 VS Code 中打开任意代码文件
2. 右键点击编辑区域
3. 选择 **"格式化文档"** 或按快捷键：
   - **macOS**: `Shift + Option + F`
   - **Windows/Linux**: `Shift + Alt + F`

### 方法二：保存时自动格式化

代码会在保存文件时自动格式化（已在 `.vscode/settings.json` 中配置）。

### 方法三：命令行格式化

```bash
# 格式化所有文件
npm run format

# 检查代码格式（不修改文件）
npm run format:check
```

## 📝 注意事项

1. **首次使用需要安装 VS Code 插件**：
   - 在 VS Code 扩展市场搜索并安装 **"Prettier - Code formatter"**（esbenp.prettier-vscode）

2. **被忽略的文件**：
   - `node_modules/`
   - `package-lock.json`
   - `.env` 等配置文件
   - 其他忽略规则见 `.prettierignore`

3. **支持的文件类型**：
   - JavaScript (`.js`)
   - JSON (`.json`)
   - Markdown (`.md`)
   - 其他常见格式

## 🎯 最佳实践

- 提交代码前运行 `npm run format` 确保代码格式统一
- 开启编辑器的"保存时格式化"功能，减少手动操作
- 团队成员使用相同的格式化配置，避免产生不必要的代码差异

## 🔍 常见问题

### Q: 右键菜单没有"格式化文档"选项？

A: 请确保已安装 Prettier 扩展（esbenp.prettier-vscode）

### Q: 格式化没有生效？

A: 检查 VS Code 设置中是否启用了 `editor.formatOnSave`，或手动运行格式化命令

### Q: 如何修改格式化规则？

A: 编辑 `.prettierrc` 文件，修改相应的配置项
