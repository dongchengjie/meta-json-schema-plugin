import * as vscode from "vscode";
import path from "path";
import { register, unregister } from "./schemas";
import { getLogger } from "./message";

// YAML 扩展名
const yamlExtensions = ["yaml", "yml", "txt"];
// Clash 扩展名
const customExtensions = ["clash"];

const schemaURL = `https://fastly.jsdelivr.net/gh/dongchengjie/meta-json-schema@main/schemas/meta-json-schema.json`;

type Result = "match" | "match-pattern" | "mismatch";

const fileMatch = (fileName: string, document: vscode.TextDocument | undefined): Result => {
  if (document) {
    if (customExtensions.filter(extension => fileName.endsWith(`.${extension}`)).length > 0) {
      return "match";
    }
    if (yamlExtensions.filter(extension => fileName.endsWith(`.${extension}`)).length > 0) {
      // 首行为带有 "clash" 字样的注释
      const firstLine = document.lineAt(0)?.text?.trim();
      if (firstLine.startsWith("#") && firstLine.toLowerCase().includes("clash")) {
        return "match";
      } else {
        return "match-pattern";
      }
    }
  }
  return "mismatch";
};

let logger: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  logger = getLogger(context);
  unregister(schemaURL);

  // 发生变化回调
  const onChange = (document: vscode.TextDocument | undefined) => {
    if (document) {
      const fileName = path.basename(document.fileName ?? "unknown.txt");
      const match = fileMatch(fileName, document);
      if (match === "match") {
        vscode.languages.setTextDocumentLanguage(document, "yaml");
        register(schemaURL, [fileName]);
        logger.appendLine(`register: ${fileName}`);
      } else if (match === "match-pattern") {
        unregister(schemaURL, [fileName]);
        logger.appendLine(`unregister: ${fileName}`);
      }
    }
  };

  // 监听标签页激活
  vscode.window.onDidChangeActiveTextEditor(_ => {
    const currentEditor = vscode.window.activeTextEditor;
    onChange(currentEditor?.document);
  });

  // 监听文件变化
  vscode.workspace.onDidChangeTextDocument(event => {
    if (event.contentChanges.length > 0) {
      onChange(event.document);
    }
  });

  // 监听文件关闭
  vscode.workspace.onDidCloseTextDocument(document => {
    onChange(document);
  });
}

export function deactivate() {
  unregister(schemaURL);
}
