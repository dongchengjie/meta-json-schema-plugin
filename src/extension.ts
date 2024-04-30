import * as vscode from "vscode";
import path from "path";
import { getLogger } from "./util/message";
import { register, unregister } from "./util/schemas";
import { fileMatch, MatchResult } from "./util/file";

const schemaURL = `https://fastly.jsdelivr.net/gh/dongchengjie/meta-json-schema@main/schemas/meta-json-schema.json`;

let logger: vscode.OutputChannel;

// 发生变化回调
type Action = "register" | "unregister" | "none";
const onChange = (document: vscode.TextDocument | undefined, getAction: (match: MatchResult) => Action) => {
  if (document) {
    const fileName = path.basename(document.fileName ?? "unknown.txt");
    const result = fileMatch(fileName, document);
    const action = getAction(result);
    if (action === "register") {
      vscode.languages.setTextDocumentLanguage(document, "yaml");
      register(schemaURL, [fileName]);
      logger.appendLine(`register: ${fileName}`);
    } else if (action === "unregister") {
      unregister(schemaURL, [fileName]);
      logger.appendLine(`unregister: ${fileName}`);
    }
  }
};

export function activate(context: vscode.ExtensionContext) {
  // 初始化输出
  logger = getLogger(context);
  // 清空Schema配置
  unregister(schemaURL);

  // 监听标签页激活
  vscode.window.onDidChangeActiveTextEditor(_ => {
    const currentEditor = vscode.window.activeTextEditor;
    onChange(currentEditor?.document, result => {
      if (result === "match") {
        return "register";
      } else if (result === "match-extension") {
        return "unregister";
      } else {
        return "none";
      }
    });
  });

  // 监听文件变化
  vscode.workspace.onDidChangeTextDocument(event => {
    if (event.contentChanges.length > 0) {
      onChange(event.document, result => {
        if (result === "match") {
          return "register";
        } else if (result === "match-extension") {
          return "unregister";
        } else {
          return "none";
        }
      });
    }
  });

  // 监听文件关闭
  vscode.workspace.onDidCloseTextDocument(document => {
    onChange(document, _ => "unregister");
  });
}

export function deactivate() {
  unregister(schemaURL);
}
