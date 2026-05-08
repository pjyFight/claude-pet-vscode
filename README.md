# Claude Pet for VS Code

> A cute desktop pet that lives in your VS Code sidebar and reacts to **Claude Code's execution state** in real time.

![VS Code Version](https://img.shields.io/badge/VS%20Code-%5E1.74.0-blue)
![States](https://img.shields.io/badge/States-9-purple)
![License](https://img.shields.io/badge/License-MIT-green)

[English](#english) | [中文](#中文)

---

## English

### Preview

The pet sits in your **Explorer sidebar** and changes its expression/animation based on what Claude is doing:

| State | Color | Animation | Trigger |
|-------|-------|-----------|---------|
| `idle` | Beige | Gentle breathing | Idle / conversation ended |
| `thinking` | Orange | Floating up/down, squinted eyes | You sent a message |
| `coding` | Purple | Fast typing, floating `{/}` symbols | Claude writes/edits code |
| `reading` | Sky blue | Leaning forward, enlarged eyes | Claude reads files |
| `running` | Brown | Running legs, swinging arms | Claude executes Bash commands |
| `searching` | Green | Head turning, magnifier eyes | Claude searches (Grep/Glob) |
| `tool_use` | Lime | Shaking body, waving arms | Other tool usage |
| `responding` | Blue | Talking mouth, open arms | Claude generates response |
| `error` | Red | Shivering, X eyes | Error occurred |

### Quick Start

#### 1. Install the Extension

**Option A: Direct copy (Recommended)**

```bash
# Clone to your VS Code extensions folder
git clone https://github.com/pjyFight/claude-pet-vscode.git \
  ~/.vscode/extensions/claude-pet-vscode

# Or on Windows:
# git clone https://github.com/pjyFight/claude-pet-vscode.git \
#   %USERPROFILE%\.vscode\extensions\claude-pet-vscode
```

Then **restart VS Code**.

**Option B: Development mode**

```bash
git clone https://github.com/pjyFight/claude-pet-vscode.git
cd claude-pet-vscode
npm install
npm run compile
# Press F5 in VS Code to launch Extension Development Host
```

#### 2. Configure Claude Code Hooks

Add this to your Claude Code settings file:

- **Global**: `~/.claude/settings.json`
- **Project**: `.claude/settings.json` (in your project root)

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -X POST http://localhost:9876/state -H \"Content-Type: application/json\" -d '{\"state\":\"thinking\"}' > /dev/null 2>&1 || true",
            "shell": "bash",
            "async": true
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -X POST http://localhost:9876/state -H \"Content-Type: application/json\" -d '{\"state\":\"coding\"}' > /dev/null 2>&1 || true",
            "shell": "bash",
            "async": true
          }
        ]
      },
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -X POST http://localhost:9876/state -H \"Content-Type: application/json\" -d '{\"state\":\"reading\"}' > /dev/null 2>&1 || true",
            "shell": "bash",
            "async": true
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -X POST http://localhost:9876/state -H \"Content-Type: application/json\" -d '{\"state\":\"running\"}' > /dev/null 2>&1 || true",
            "shell": "bash",
            "async": true
          }
        ]
      },
      {
        "matcher": "Grep|Glob",
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -X POST http://localhost:9876/state -H \"Content-Type: application/json\" -d '{\"state\":\"searching\"}' > /dev/null 2>&1 || true",
            "shell": "bash",
            "async": true
          }
        ]
      },
      {
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -X POST http://localhost:9876/state -H \"Content-Type: application/json\" -d '{\"state\":\"tool_use\"}' > /dev/null 2>&1 || true",
            "shell": "bash",
            "async": true
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -X POST http://localhost:9876/state -H \"Content-Type: application/json\" -d '{\"state\":\"responding\"}' > /dev/null 2>&1 || true",
            "shell": "bash",
            "async": true
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -X POST http://localhost:9876/state -H \"Content-Type: application/json\" -d '{\"state\":\"idle\"}' > /dev/null 2>&1 || true",
            "shell": "bash",
            "async": true
          }
        ]
      }
    ]
  }
}
```

#### 3. Open the Pet Panel

After installing and restarting VS Code:

1. Open any folder as workspace
2. Look at the bottom of the **Explorer sidebar**
3. You will see the **Claude Pet** panel with the pet breathing

#### 4. Manual State Testing

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS), type:

```
Claude Pet: Set State
```

A dropdown will appear with all 9 states. Select one to see the animation instantly.

### State Flow

```
You send message
    |
    v
+-----------+     +-----------+     +-----------+
| thinking  | --> |   coding  | --> | responding|
+-----------+     |  reading  |     +-----------+
    |             |  running  |           |
    |             | searching |           v
    |             |  tool_use |      +-----------+
    |             +-----------+      |   idle    |
    |                      |         +-----------+
    |                      v              ^
    |             +-----------+           |
    +------------>|  error    |-----------+
                  +-----------+
```

### Customization

#### Replace with Your Own Character

The pet is built with pure CSS geometric shapes. To replace with images:

1. Add your image assets (PNG/SVG) to the `media/` folder
2. In `media/pet.css`, replace CSS shapes with `background-image`:
   ```css
   .pet-body {
       background: url('body-idle.png') no-repeat center/contain;
   }
   ```
3. Update the `@keyframes` animations to use `transform` (translate/rotate/scale) instead of shape morphing

#### Add New States

1. **CSS**: Add `.pet.newstate` class in `media/pet.css`
2. **JS**: Add state to the `states` array in `media/pet.js`
3. **Labels**: Add display name and speech bubbles in `pet.js`
4. **Hooks**: Add matching Claude Code hooks in your `settings.json`

### Project Structure

```
claude-pet-vscode/
├── src/
│   └── extension.ts          # VS Code extension + HTTP state server
├── media/
│   ├── pet.css               # Character & animation styles
│   └── pet.js                # State machine & bubble logic
├── package.json              # Extension manifest & activation events
├── tsconfig.json             # TypeScript compilation config
└── README.md                 # This file
```

---

## 中文

### 简介

Claude Pet 是一个住在 VS Code 侧边栏的桌面宠物，能**实时感知 Claude Code 的执行状态**并切换对应的表情和动作。

### 快速开始

#### 1. 安装扩展

**方式一：直接复制（推荐）**

```bash
git clone https://github.com/pjyFight/claude-pet-vscode.git \
  ~/.vscode/extensions/claude-pet-vscode
```

Windows 用户：
```bash
git clone https://github.com/pjyFight/claude-pet-vscode.git \
  %USERPROFILE%\.vscode\extensions\claude-pet-vscode
```

然后**重启 VS Code**。

**方式二：开发模式**

```bash
git clone https://github.com/pjyFight/claude-pet-vscode.git
cd claude-pet-vscode
npm install
npm run compile
# 在 VS Code 中按 F5 启动扩展开发宿主
```

#### 2. 配置 Claude Code Hooks

将上方英文部分的 JSON 配置添加到你的 Claude Code 设置文件中：
- **全局配置**：`~/.claude/settings.json`
- **项目配置**：项目根目录下的 `.claude/settings.json`

#### 3. 打开宠物面板

安装并重启 VS Code 后：
1. 打开任意文件夹作为工作区
2. 查看左侧**资源管理器（Explorer）**面板底部
3. 找到 **Claude Pet** 视图，就能看到小宠物在呼吸待机

#### 4. 手动切换状态测试

按 `Ctrl+ShiftP`，输入 `Claude Pet: Set State`，会弹出 9 种状态的下拉列表，点击即可切换动画。

### 状态说明

| 状态 | 颜色 | 动画 | 触发时机 |
|------|------|------|----------|
| `idle` | 米色 | 呼吸浮动 | 空闲/对话结束 |
| `thinking` | 橙色 | 眯眼思考 | 你发送消息后 |
| `coding` | 紫色 | 快速敲键盘、飘 `{/}` | Claude 写/改代码 |
| `reading` | 天蓝 | 眼睛放大、身体前倾 | Claude 读文件 |
| `running` | 土黄 | 跑步姿势、四肢摆动 | Claude 执行命令 |
| `searching` | 草绿 | 左右转头、放大镜眼睛 | Claude 搜索 |
| `tool_use` | 浅绿 | 身体抖动、手臂挥舞 | 其他工具调用 |
| `responding` | 蓝色 | 嘴巴开合、手臂张开 | Claude 生成回复 |
| `error` | 红色 | 颤抖、叉眼 | 出错时 |

### 自定义形象

当前使用纯 CSS 几何图形绘制，后期替换图片素材的方式：

1. 将图片素材放入 `media/` 文件夹
2. 在 `pet.css` 中把 `background` 改为 `background-image: url('your-image.png')`
3. 保留 `@keyframes` 动画，用 `transform` 控制位移/旋转/缩放

### 添加新状态

1. 在 `media/pet.css` 中添加 `.pet.newstate` 样式
2. 在 `media/pet.js` 的 `states` 数组中添加新状态名
3. 在 `stateLabels` 和 `stateBubbles` 中添加文案
4. 在 Claude Code 的 `settings.json` hooks 中添加触发规则

---

## License

MIT License - feel free to use, modify, and share!
