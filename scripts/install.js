#!/usr/bin/env node
/**
 * Cross-platform installer for Claude Pet VS Code extension
 * Usage: node scripts/install.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OS = process.platform;
const HOME = OS === 'win32' ? process.env.USERPROFILE : process.env.HOME;

function getVSCodeExtensionsDir() {
    if (OS === 'win32') {
        return path.join(HOME, '.vscode', 'extensions');
    } else if (OS === 'darwin') {
        return path.join(HOME, '.vscode', 'extensions');
    } else {
        return path.join(HOME, '.vscode', 'extensions');
    }
}

function getVSCodeCLI() {
    if (OS === 'win32') {
        const candidates = [
            path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd'),
            path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft VS Code', 'bin', 'code'),
            'code.cmd',
            'code'
        ];
        for (const c of candidates) {
            try {
                execSync(`"${c}" --version`, { stdio: 'ignore' });
                return c;
            } catch { /* ignore */ }
        }
        return 'code';
    } else if (OS === 'darwin') {
        return '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code';
    } else {
        return 'code';
    }
}

function main() {
    const projectRoot = path.resolve(__dirname, '..');
    const extDir = getVSCodeExtensionsDir();
    const targetDir = path.join(extDir, 'claude-pet-vscode');
    const codeCLI = getVSCodeCLI();

    console.log('\u{1F431} Claude Pet Installer\n');
    console.log(`OS        : ${OS}`);
    console.log(`Project   : ${projectRoot}`);
    console.log(`Target    : ${targetDir}`);
    console.log(`VS Code   : ${codeCLI}\n`);

    // Ensure extensions directory exists
    if (!fs.existsSync(extDir)) {
        console.log('✅ Creating VS Code extensions directory...');
        fs.mkdirSync(extDir, { recursive: true });
    }

    // Remove old installation if exists
    if (fs.existsSync(targetDir)) {
        console.log('✅ Removing old installation...');
        fs.rmSync(targetDir, { recursive: true, force: true });
    }

    // Copy project
    console.log('✅ Copying extension files...');
    copyDir(projectRoot, targetDir, ['node_modules', 'out', '.git', '.vscode-test', '*.vsix']);

    // Install dependencies and compile
    console.log('✅ Installing dependencies...');
    try {
        execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
    } catch (e) {
        console.error('❌ npm install failed:', e.message);
        process.exit(1);
    }

    console.log('✅ Compiling TypeScript...');
    try {
        execSync('npm run compile', { cwd: targetDir, stdio: 'inherit' });
    } catch (e) {
        console.error('❌ Compilation failed:', e.message);
        process.exit(1);
    }

    console.log('\n✅ Installation complete!');
    console.log('\n⚠️  Please reload VS Code window:');
    console.log(`   ${codeCLI} --reload-window`);
    console.log('\nOr press Ctrl+Shift+P → "Developer: Reload Window"\n');
}

function copyDir(src, dest, ignorePatterns) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (ignorePatterns.some(p => {
            if (p.includes('*')) {
                const regex = new RegExp('^' + p.replace(/\*/g, '.*') + '$');
                return regex.test(entry.name);
            }
            return entry.name === p;
        })) {
            continue;
        }

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath, ignorePatterns);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

main();
