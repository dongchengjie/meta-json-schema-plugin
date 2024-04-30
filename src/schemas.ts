import * as vscode from "vscode";

export const register = (schema: string, patterns: string[]) => {
  const schemas = querySchemas();
  schemas[schema] = schemas[schema] ?? [];
  schemas[schema] = [...new Set([...schemas[schema], ...patterns])];
  updateSchemas(schemas);
};

export const unregister = (schema: string, patterns?: string[]) => {
  const schemas = querySchemas();
  schemas[schema] = schemas[schema] ?? [];
  schemas[schema] = [...schemas[schema]].filter(match => patterns && !patterns.includes(match));
  updateSchemas(schemas);
};

const querySchemas = () => {
  const schemas = vscode.workspace.getConfiguration("yaml").get("schemas") as { [key: string]: string | string[] };
  for (let key in schemas) {
    schemas[key] = Array.isArray(schemas[key]) ? schemas[key] : [schemas[key]].filter(Boolean);
  }
  return schemas;
};

const updateSchemas = (schemas: { [key: string]: string | string[] }) => {
  const runtimeSchemas = querySchemas();
  if (JSON.stringify(runtimeSchemas) !== JSON.stringify(schemas)) {
    vscode.workspace.getConfiguration("yaml").update("schemas", schemas, vscode.ConfigurationTarget.Global);
  }
};
