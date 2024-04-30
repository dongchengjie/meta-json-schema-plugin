import * as vscode from "vscode";

// YAML 扩展名
const yamlExtensions = ["yaml", "yml", "txt"];
// Clash 扩展名
const customExtensions = ["clash", "clash.meta"];

// 匹配结果
export type MatchResult = "match" | "match-extension" | "mismatch";

export const fileMatch = (fileName: string, document: vscode.TextDocument | undefined): MatchResult => {
  if (document) {
    // Clash 文件
    if (customExtensions.filter(extension => fileName.endsWith(`.${extension}`)).length > 0) {
      return "match";
    }
    // YAML 文件
    if (yamlExtensions.filter(extension => fileName.endsWith(`.${extension}`)).length > 0) {
      // 首行带有 "clash" 字样的注释
      const firstLine = document.lineAt(0)?.text?.trim();
      return firstLine.startsWith("#") && firstLine.toLowerCase().includes("clash") ? "match" : "match-extension";
    }
  }
  return "mismatch";
};
