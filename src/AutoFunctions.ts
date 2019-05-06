import * as vscode from "vscode";

interface Property {
  original: string;
  protectionLevel?: string;
  type: string;
  name: string;
  insertPos: vscode.Range;
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

  /**
   * Constructs an AutoFunctions class
   * @param {vscode.TextEditor} editor The current editor
   */
  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
  }

  /**
   * Generates the functions for the current document
   */
  public generateFunctions() {
    const parsedProperties = this.parseDoc();

    this.insertFunctionsSnippet(parsedProperties);
  }

  /**
   * Parses the document and returns the properties
   * @returns {Property[]} A list of the properties
   */
  private parseDoc(): Property[] {
    let properties: Property[] = [];

    for (let i = 0; i < this.editor.document.lineCount; i++) {
      const line = this.editor.document.lineAt(i);
      const insertPos = line.range;
      const lineText = line.text;

      // [protectionLevel] type name [... whatever];
      const results = /(?:([a-zA-Z]+) )?([a-zA-Z\[\]]+) ([a-zA-Z]+).*;/.exec(
        lineText
      );

      if (results) {
        // Check protection level
        if (results[1] && this.accessibilityLevels.indexOf(results[1]) > -1) {
          // Add the property into an array
          properties.push({
            original: lineText,
            protectionLevel: results[1],
            type: results[2],
            name: results[3],
            insertPos
          });
        }
      }
    }

    return properties;
  }

  /**
   * Gets the current class' name
   */
  private getClassName() {
    for (let i = 0; i < this.editor.document.lineCount; i++) {
      const line = this.editor.document.lineAt(i);
      const lineText = line.text;
      const classDeclaration = lineText.match(/\s*[A-Ba-z\t\n]*class ([A-Za-z0-9_]+).*/);

      if (classDeclaration) {
        return classDeclaration[1];
      }
    }

    return null;
  }

  /**
   * Inserts the functions using the parsed properties
   * @param {Property[]} properties The parsed properties
   */
  private insertFunctionsSnippet(properties: Property[]) {
    this.editor.edit(edit => {
      let functions: string[] = [];
      const lastConstructorPos = this.findLastConstructor();

      for (const property of properties) {
        const snippet = `
        public ${property.type} Get${capitalizeFirstLetter(
          property.name
        )}() { return this.${property.name}; }
        public void Set${capitalizeFirstLetter(property.name)}(${
          property.type
        } ${property.name}) { this.${property.name} = ${property.name}; }`;

        functions.push(snippet);
      }

      if (lastConstructorPos) {
        edit.insert(lastConstructorPos, "\n" + functions.join("\n"));
      } else {
        edit.insert(
          properties[properties.length - 1].insertPos.end,
          "\n" + functions.join("\n")
        );
      }
    });
  }

  /**
   * Find the last constructor's position
   * @returns {vscode.Position | null} The last constructor's position or null if there's no constructor
   */
  private findLastConstructor(): vscode.Position | null {
    let blockOpen: string[] = [];
    let lastConstructorPos: vscode.Position | null = null;

    for (let i = 0; i < this.editor.document.lineCount; i++) {
      const line = this.editor.document.lineAt(i);
      const lineText = line.text;

      if (lineText.includes("{")) {
        const checkOnlyBrace = lineText.match(/\s*{/);
        const checkBraceWithText = lineText.match(/\s*[A-Za-z\s\(\)]+ {.*/);
        if (
          (!checkOnlyBrace || checkOnlyBrace[0] !== lineText) &&
          (checkBraceWithText && checkBraceWithText[0] === lineText)
        ) {
          blockOpen.push(lineText);
        } else {
          let currentLine = this.editor.document.lineAt(line.lineNumber - 1);
          while (currentLine.text.trim() === "") {
            currentLine = this.editor.document.lineAt(
              currentLine.lineNumber - 1
            );
          }
          blockOpen.push(currentLine.text);
        }
      }

      if (lineText.includes("}") && blockOpen.length > 0) {
        if (
          blockOpen[blockOpen.length - 1].includes(
            `public ${this.getClassName()}`
          )
        ) {
          lastConstructorPos = line.range.end;
        }
        blockOpen.pop();
      }
    }

    return lastConstructorPos;
  }
}

export default AutoFunctions;
