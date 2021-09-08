/* eslint-disable @typescript-eslint/no-unused-vars */
import * as vscode from 'vscode';
import path = require('path');
import * as os from 'os';
import * as fs from 'fs';
import * as util from "util";
import * as childProcess from "child_process";


// https://code.visualstudio.com/docs/remote/troubleshooting#_cleaning-up-the-vs-code-server-on-the-remote
const scriptsLocationsRemote = [
    '~/.vscode-server',
    '~/.vscode-server-insiders', 
    '~/.vscode-remote', // Previous VS Code Server folder
    '~/.vscode-hook' // Dedicated path
];

const homeDir = os.userInfo().homedir;
const scriptsLocationsLaptop = [
    path.join(homeDir, '/.vscode'),
    path.join(homeDir, '/.vscode-hook') // Dedicated path
];
 

const scriptsLocationsLaptopLinux = [
    '~/.vscode/',
    '~/.vscode-hook' // Dedicated path
];

const scriptName = 'vscode-startup-hook';
// https://nodejs.org/api/child_process.html#child_process_default_windows_shell
const scriptExtensionWindows = ['sh', 'bat', 'exe'];
const scriptExtensionLinux = ['sh', 'bin'];


async function runLinuxScript(filePath: string) {
  const command = `chmod +x ${filePath} && ${filePath}`;
  await runScript(command);
}

async function runWindowsScript(filePath: string) {
  await runScript(filePath);
}

async function runScript(command: string) {
  try {
    await vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: `Executing the script ${command}`,
      cancellable: false
    },
    async () => {
      const exec = util.promisify(childProcess.exec);
      outputChannel.appendLine(`Executing the script \`${command}\``);
      const { stdout, stderr } = await exec(`${command}`);
      if (stdout) {
        outputChannel.appendLine(`stdout: ${stdout}`);
      }
      if (stderr) {
        outputChannel.appendLine(`stderr: ${stderr}`);
      }
    });
  } catch (error: any) {
    outputChannel.appendLine(error.message);
    throw new Error(`Error when running the script ${command}\nError: ${error.message}`);
  }
}

function iterateExtensions(extensions: string[], filePath: string, callback: any) {
  for (const extensionTmp of extensions) {
    const fileFullPath = `${filePath}.${extensionTmp}`;
    if (fs.existsSync(fileFullPath)) {
      callback(fileFullPath);
    }
  }
}

const outputChannel = vscode.window.createOutputChannel("Post startup hook");
export async function activate(_context: vscode.ExtensionContext): Promise<void> {
    outputChannel.clear();
    if (vscode.env.remoteName === undefined) {
      outputChannel.appendLine('Extension running locally');
      if (process.platform === "win32") {
        for (const pathTmp of scriptsLocationsLaptop) {
            const filePath = path.join(pathTmp, scriptName);
            iterateExtensions(scriptExtensionWindows, filePath, runWindowsScript);
        }
      } else {
        for (const pathTmp of scriptsLocationsLaptopLinux) {
          const filePath = path.join(pathTmp, scriptName);
          iterateExtensions(scriptExtensionLinux, filePath, runLinuxScript);
        }
      }

    } else {
        outputChannel.appendLine('Extension running remotely');
        for (const pathTmp of scriptsLocationsRemote) {
          const filePath = path.join(pathTmp, scriptName).replace('~', homeDir);
          iterateExtensions(scriptExtensionLinux, filePath, runLinuxScript);
        }
    }

    const commands:string[]|undefined = vscode.workspace.getConfiguration("").get("hook.postStartup");
    outputChannel.appendLine(`Commands defined in the configuration: \n`+ JSON.stringify (commands, null, " "));
    if (commands && Array.isArray(commands)) {
        for (const command of commands) {
          runScript(command) ;
        }
    } else {
        vscode.window.showErrorMessage(`The commands MUST be an array [].`);
    }

}

// this method is called when your extension is deactivated
export function deactivate(): void {
  // do nothing. 
}
