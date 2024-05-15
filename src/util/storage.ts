import * as vscode from "vscode";
import axios from "axios";
import { logger } from "../extension";
import { getContext } from "./context";

export const schemaFileName = "meta-json-schema";

export const schemaLocation = (): vscode.Uri => {
  return vscode.Uri.file(`${getContext().globalStorageUri.fsPath}/${schemaFileName}.json`);
};

export const schemaURI = (): string => {
  return schemaLocation().fsPath;
};

export const fetchSchema = async (schemaURL: string) => {
  // 每小时的时间戳
  const t = Math.floor(Date.now() / (1000 * 60 * 60)) * (1000 * 60 * 60);
  await axios
    .get(`${schemaURL}?t=${t}`)
    .then(response => {
      try {
        vscode.workspace.fs.writeFile(schemaLocation(), Buffer.from(JSON.stringify(response.data, null, 2), "utf8"));
      } catch (error) {
        vscode.window.showErrorMessage(`Error wrting schema file: ${error}`);
        logger.appendLine(`Error wrting schema file: ${error}`);
      }
    })
    .catch(error => {
      vscode.window.showErrorMessage(`Error fetching schema from: ${schemaURL}, ${error}`);
      logger.appendLine(`Error fetching schema: ${error}`);
    });
};
