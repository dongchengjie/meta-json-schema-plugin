import * as vscode from "vscode";

export const getLogger = (context: vscode.ExtensionContext) => {
  return vscode.window.createOutputChannel(context.extension.packageJSON.displayName);
};
