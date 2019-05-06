import * as vscode from "vscode";

import AutoFunctions from "./AutoFunctions";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.generatePropertyFunctions", () =>
      activateOnCommand()
    )
  );

  // context.subscriptions.push(
  //   vscode.workspace.onDidChangeTextDocument(e => activateOnEnter(e))
  // );
}

function activateOnCommand() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const autoFunctions = new AutoFunctions(editor);
    autoFunctions.generateFunctions();
  }
}

function activateOnEnter(e: vscode.TextDocumentChangeEvent) {}

export function deactivate() {}
