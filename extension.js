// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const readline = require('readline');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "auth-code" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.promptAuthCode', function () {
        // The code you place here will be executed every time your command is executed

        const currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
        // const fileText = fs.readFileSync(currentlyOpenTabfilePath, 'utf8');

        let nums = [];
        let prefix;
        
        const rl = readline.createInterface({
            input: fs.createReadStream(currentlyOpenTabfilePath),
            crlfDelay: Infinity
        });
          
        rl.on('line', (line) => {
              if (!line.includes('//')) {
                const arr = line.split(':');
                if (arr.length > 1) {
                    const result = /\'(\w{2})(\w+)\'/.exec(arr[1]);
                    if (prefix === undefined) {
                        prefix = result[1];
                    }
                    nums.push(result[2]);
                }
            }
        });

        rl.on('close', function(){
            const max = nums.reduce(function(p, v) {
                const int1 = parseInt(p, 36); 
                const int2 = parseInt(v, 36); 
                return new Number(int1 > int2 ? int1 : int2).toString(36)
            }, 0);

            const maxFromLength = new Number(nums.length).toString(36);

            if (max == maxFromLength) {
                // Display a message box to the user
                vscode.window.showInformationMessage(`Next Code: ${prefix}${new Number(parseInt(max, 36) + 1).toString(36)}`);
            } else {
                vscode.window.showInformationMessage('现有的编号有误，请核查');
            }
            
        })
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;