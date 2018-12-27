// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const readline = require('readline');

const moduleMapping = require('./module_code_mapping');
const typeMapping = {
    module: 'm',
    component: 'c',
    url: 'u'
}

function generateAuthCode() {
    const currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
    
    const pathArray = currentlyOpenTabfilePath.split('/');
    const pathLength = pathArray.length;
    const module = pathArray[pathLength - 1];
    const type = pathArray[pathLength - 3];
    const typeCode = typeMapping[type];
    const moduleCode = moduleMapping[module];
 
    if (!typeCode || !moduleCode) {
        vscode.window.showInformationMessage('文件路径有误，此功能仅限于权限模块'); 
        return;
    }

    const options = {
        prompt: "Please input the code prefix: ",
        placeHolder: "Component Name",
        value: typeCode + moduleCode
    }

    vscode.window.showInputBox(options).then( prefix => {
        let nums = [];

        const rl = readline.createInterface({
            input: fs.createReadStream(currentlyOpenTabfilePath),
            crlfDelay: Infinity
        });
          
        rl.on('line', (line) => {
            if (line.trim().substr(0, 2) != '//') {
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
            let num = nums.length > 0 ? nums.reduce(function(p, v) {
                const int1 = parseInt(p, 36); 
                const int2 = parseInt(v, 36); 
                return new Number(int1 > int2 ? int1 : int2).toString(36);
            }, 0) : 0;
    
            const maxFromLength = nums.length == 0 ? 0 : nums.length - 1;
            num = parseInt(num, 36);
    
            if (num == maxFromLength) {
                num++;
                const fileContentArr = fs.readFileSync(currentlyOpenTabfilePath, 'utf8').split(/\r?\n/);
                const contentLength = fileContentArr.length;

                fs.truncateSync(currentlyOpenTabfilePath);

                fileContentArr.forEach( (line, index) => {
                    let content = line;
                    if (line.slice(-1) == '#') {
                        const length = content.length;
                        content = content.substr(0, length -1) + `: '${prefix + new Number(num).toString(36)}',`;
                        num++;
                    } 

                    fs.appendFileSync(currentlyOpenTabfilePath, content + ((index == contentLength - 1) ? '' : '\n'));
                })

                vscode.window.showInformationMessage('Code is successfully generated!'); 
            } else {
                vscode.window.showInformationMessage('现有的编号有误，请核查');
            }
            
        }); 
    });
}

function promptAuthCode() {
    const currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;

    let nums = [];
    let prefix;
    
    const rl = readline.createInterface({
        input: fs.createReadStream(currentlyOpenTabfilePath),
        crlfDelay: Infinity
    });
      
    rl.on('line', (line) => {
          if (line.trim().substr(0, 2) != '//') {
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

        const maxFromLength = new Number(nums.length - 1).toString(36);

        if (max == maxFromLength) {
            // Display a message box to the user
            vscode.window.showInformationMessage(`Next Code: ${prefix}${new Number(parseInt(max, 36) + 1).toString(36)}`);
        } else {
            vscode.window.showInformationMessage('现有的编号有误，请核查');
        }
        
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "auth-code" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    const cmdPromptAuthCode = vscode.commands.registerCommand('extension.promptAuthCode', promptAuthCode);
    const cmdGenerateAuthCode = vscode.commands.registerCommand('extension.generateAuthCode', generateAuthCode);

    context.subscriptions.push(cmdPromptAuthCode);
    context.subscriptions.push(cmdGenerateAuthCode);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;