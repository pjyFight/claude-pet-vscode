import * as vscode from 'vscode';
import * as http from 'http';

let petPanel: vscode.WebviewView | undefined;
let server: http.Server | undefined;

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('claudePet');
    const port = config.get<number>('port') || 9876;

    // Register the webview view provider
    const provider = new ClaudePetViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('claudePetView', provider)
    );

    // Start HTTP server to receive state updates from Claude Code hooks
    server = http.createServer((req, res) => {
        if (req.method === 'POST' && req.url === '/state') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (data.state && petPanel) {
                        petPanel.webview.postMessage({
                            type: 'stateChange',
                            state: data.state,
                            detail: data.detail || ''
                        });
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true }));
                } catch {
                    res.writeHead(400);
                    res.end('Bad Request');
                }
            });
        } else {
            res.writeHead(404);
            res.end('Not Found');
        }
    });

    server.listen(port, () => {
        console.log(`Claude Pet server listening on port ${port}`);
    });

    // Register command for manual state setting (useful for testing)
    context.subscriptions.push(
        vscode.commands.registerCommand('claudePet.setState', async () => {
            const states = [
                { label: 'Idle', description: '待机呼吸', value: 'idle' },
                { label: 'Thinking', description: '思考中', value: 'thinking' },
                { label: 'Coding', description: '写代码', value: 'coding' },
                { label: 'Reading', description: '读文件', value: 'reading' },
                { label: 'Running', description: '执行命令', value: 'running' },
                { label: 'Searching', description: '搜索中', value: 'searching' },
                { label: 'Using Tool', description: '通用工具', value: 'tool_use' },
                { label: 'Responding', description: '回复中', value: 'responding' },
                { label: 'Error', description: '报错', value: 'error' }
            ];
            const picked = await vscode.window.showQuickPick(states, {
                placeHolder: '选择要切换的桌宠状态'
            });
            if (picked && petPanel) {
                petPanel.webview.postMessage({
                    type: 'stateChange',
                    state: picked.value
                });
            }
        })
    );

    context.subscriptions.push({
        dispose: () => {
            server?.close();
        }
    });
}

class ClaudePetViewProvider implements vscode.WebviewViewProvider {
    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        petPanel = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'pet.css')
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'pet.js')
        );

        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Pet</title>
    <link rel="stylesheet" href="${styleUri}">
</head>
<body>
    <div class="pet-container">
        <div class="pet" id="pet">
            <div class="pet-body">
                <div class="pet-face">
                    <div class="eye left"></div>
                    <div class="eye right"></div>
                    <div class="mouth"></div>
                </div>
                <div class="cheeks">
                    <div class="cheek left"></div>
                    <div class="cheek right"></div>
                </div>
                <div class="arms">
                    <div class="arm left"></div>
                    <div class="arm right"></div>
                </div>
                <div class="legs">
                    <div class="leg left"></div>
                    <div class="leg right"></div>
                </div>
            </div>
            <div class="shadow"></div>
            <div class="status-indicator" id="status">Idle</div>
        </div>
        <div class="bubble" id="bubble"></div>
    </div>
    <script src="${scriptUri}"></script>
</body>
</html>`;
    }
}

export function deactivate() {
    server?.close();
}
