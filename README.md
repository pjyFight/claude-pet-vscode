# Claude Pet for VS Code

A cute desktop pet that lives in your VS Code sidebar and reacts to Claude Code's execution state in real time.

![state-overview](https://img.shields.io/badge/states-9-purple)

## Features

- **Real-time state sync** via Claude Code hooks
- **9 unique states** with distinct animations:
  - `idle` - breathing standby
  - `thinking` - pondering with closed eyes
  - `coding` - typing with floating `{/}` symbols
  - `reading` - focused with enlarged eyes
  - `running` - running legs while executing commands
  - `searching` - looking around with magnifier eyes
  - `tool_use` - shaking with waving arms
  - `responding` - talking with moving mouth
  - `error` - red shivering with X eyes
- **Manual state switching** via command palette
- **Speech bubbles** for every state
- **Easy to customize** - replace CSS shapes with your own images

## Installation

### From Source

1. Clone this repo
2. Run `npm install`
3. Run `npm run compile`
4. Copy the folder to your VS Code extensions directory:
   - Windows: `%USERPROFILE%\.vscode\extensions\`
   - macOS/Linux: `~/.vscode/extensions/`
5. Restart VS Code

### Development

1. Open this folder in VS Code
2. Press `F5` to open Extension Development Host

## Claude Code Hooks Setup

Add the following to your `~/.claude/settings.json` (global) or `.claude/settings.json` (project):

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

## Manual State Switching

Open the Command Palette (`Ctrl+Shift+P`) and run **"Claude Pet: Set State"** to manually switch states for testing.

## Customization

### Replace with Your Own Character

The pet is built with pure CSS shapes. To replace with images:

1. Add your image assets to the `media/` folder
2. In `media/pet.css`, replace `.pet-body`, `.eye`, `.mouth`, `.arm`, `.leg` backgrounds with `background-image: url('your-image.png')`
3. Update animations to transform/translate your images instead of CSS shapes

### Add New States

1. Add CSS class in `media/pet.css` (e.g., `.pet.newstate`)
2. Add state to the `states` array in `media/pet.js`
3. Add labels and bubbles in `pet.js`
4. Add matching Claude Code hooks in `settings.json`

## Architecture

```
claude-pet-vscode/
├── src/
│   └── extension.ts          # VS Code extension entry + HTTP server
├── media/
│   ├── pet.css               # Animations & character styles
│   └── pet.js                # State machine & VS Code messaging
├── package.json              # Extension manifest
└── tsconfig.json             # TypeScript config
```

## License

MIT
