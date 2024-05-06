import * as vscode from "vscode";
import path from "path";
import { register, unregister } from "./util/schemas";
import { fileMatch, MatchResult } from "./util/file";
import { fetchSchema } from "./util/storage";
import { initStorage, schemaURI } from "./util/storage";

export let logger: vscode.OutputChannel;
type Action = "register" | "unregister" | "none";

// 发生变化回调
const onChange = (document: vscode.TextDocument | undefined, getAction: (match: MatchResult) => Action) => {
  if (document) {
    const fileName = path.basename(document.fileName ?? "unknown.txt");
    const result = fileMatch(fileName, document);
    const action = getAction(result);
    if (action === "register") {
      vscode.languages.setTextDocumentLanguage(document, "yaml");
      register(schemaURI(), [fileName]);
      logger.appendLine(`register: ${fileName}`);
    } else if (action === "unregister") {
      unregister(schemaURI(), [fileName]);
      logger.appendLine(`unregister: ${fileName}`);
    }
  }
};

export async function activate(context: vscode.ExtensionContext) {
  // 扩展配置
  const configuration = vscode.workspace.getConfiguration(context.extension.packageJSON.name);
  const schemaURL = configuration.schemaURL as string;

  // 初始化
  logger = vscode.window.createOutputChannel(context.extension.packageJSON.displayName);
  initStorage(context);
  unregister(schemaURI()); // 清空Schema配置
  await fetchSchema(schemaURL); // 下载schema文件

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
  unregister(schemaURI());
}
