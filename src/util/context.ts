import * as vscode from "vscode";

let _context: vscode.ExtensionContext;

export const initContext = (context: vscode.ExtensionContext) => {
  _context = context;
};

export const getContext = () => _context;
