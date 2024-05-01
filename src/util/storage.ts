import * as vscode from "vscode";
import axios from "axios";
import { logger } from "../extension";

const schemaFileName = "meta-json-schema.yaml";

let _context: vscode.ExtensionContext;

export const initStorage = (context: vscode.ExtensionContext) => {
  _context = context;
};

export const schemaLocation = (): vscode.Uri => {
  return vscode.Uri.file(`${_context.globalStorageUri.fsPath}/${schemaFileName}`);
};

export const schemaURI = (): string => {
  return schemaLocation().fsPath;
};

export const fetchSchema = async (schemaURL: string) => {
  await axios.get(schemaURL).then(response => {
    try {
      vscode.workspace.fs.writeFile(schemaLocation(), Buffer.from(JSON.stringify(response.data), "utf8"));
    } catch (error) {
      logger.appendLine(`Error fetching schema: ${error}`);
    }
  });
};
