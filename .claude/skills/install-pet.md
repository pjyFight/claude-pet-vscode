---
name: install-pet
description: |
  Automatically install the Claude Pet VS Code extension from the current project directory.
  Handles copying files to the VS Code extensions folder, compiling TypeScript,
  and prompting the user to reload VS Code. Works on Windows, macOS, and Linux.
---

# Install Claude Pet Skill

## When to use

This skill is triggered when the user wants to install the Claude Pet VS Code extension,
either after cloning the repo or during development.

Trigger phrases:
- "install the pet extension"
- "install claude pet"
- "setup the vs code extension"
- "怎么安装桌宠"
- "安装扩展"

## Installation Steps

1. **Verify project location**
   - Confirm the current working directory contains `package.json`, `src/extension.ts`, and `media/`
   - If not, abort and ask the user to `cd` into the project folder

2. **Run the installer script**
   - Execute: `node scripts/install.js`
   - This script will:
     - Detect the OS and find the VS Code extensions directory
     - Copy the project files (excluding `node_modules`, `.git`, `out`)
     - Run `npm install` and `npm run compile`
     - Print instructions to reload VS Code

3. **Handle errors**
   - If `node` is not found, prompt the user to install Node.js first
   - If `npm install` fails, check network and suggest `npm install --registry https://registry.npmmirror.com`
   - If the copy fails due to permissions, suggest running with elevated permissions

4. **Post-installation**
   - Prompt the user to reload VS Code:
     - Command Palette → `Developer: Reload Window`
     - Or CLI: `code --reload-window` (where available)
   - Verify the pet panel appears at the bottom of the Explorer sidebar
   - Offer to configure Claude Code hooks automatically by editing `~/.claude/settings.json`

## Manual fallback

If the script fails, perform manual installation:

```bash
# 1. Copy to VS Code extensions folder
# Windows:
cp -r . %USERPROFILE%\.vscode\extensions\claude-pet-vscode
# macOS/Linux:
cp -r . ~/.vscode/extensions/claude-pet-vscode

# 2. Install & compile
cd ~/.vscode/extensions/claude-pet-vscode
npm install
npm run compile
```

Then reload VS Code.

## Claude Code Hooks Configuration

After installation, the user needs to configure hooks for real-time state sync.
Offer to read and edit their Claude Code settings file:

- Global: `~/.claude/settings.json`
- Project: `.claude/settings.json`

Append the `hooks` section from the project's README.md if not already present.
