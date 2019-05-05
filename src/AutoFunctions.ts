import * as vscode from "vscode";

interface Property {
  original: string;
  protectionLevel?: string;
  type: string;
  name: string;
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

class AutoFunctions {
  private editor: vscode.TextEditor;

  private accessibilityLevels = [
    "public",
    "protected",
    "internal",
    "private",
    "protected internal",
    "private protected"
  ];

  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
  }

  public generateFunctions() {
    const doc = this.editor.document.getText();
    const position = this.editor.selection.active;
    const linePosition = position.line;

    const range = this.editor.document.getWordRangeAtPosition(position, /\n/);
    const text = this.editor.document.getText(range);

    const parsedProperty = this.parseDoc(text);
    const functionsSnippet = this.generateFunctionsSnippet(parsedProperty[0]);

    this.editor.insertSnippet(
      new vscode.SnippetString(functionsSnippet),
      position
    );
  }

  private parseDoc(doc: string) {
    let properties: Property[] = [];

    doc.split("\n").forEach(line => {
      // [protectionLevel] type name [... whatever];
      const results = /(?:([a-zA-Z]+) )?([a-zA-Z\[\]]+) ([a-zA-Z]+).*;/.exec(
        line
      );

      if (results) {
        // Check protection level
        if (results[1] && this.accessibilityLevels.indexOf(results[1]) > -1) {
          properties.push({
            original: results[0],
            protectionLevel: results[1],
            type: results[2],
            name: results[3]
          });
        }
      }
    });

    return properties;
  }

  private generateFunctionsSnippet(property: Property) {
    return `
public ${property.type} Get${capitalizeFirstLetter(property.name)}() { return this.${property.name}; }
public void Set${capitalizeFirstLetter(property.name)}(${property.type} ${property.name}) { this.${property.name} = ${property.name} }`;
  }
}

export default AutoFunctions;
