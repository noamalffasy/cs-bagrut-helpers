import * as vscode from "vscode";

interface Property {
  original: string;
  protectionLevel?: string;
  isStatic: boolean;
  type: string;
  name: string;
  insertPos: vscode.Range;
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

class AutoFunctions implements vscode.CodeActionProvider {
  public editor: vscode.TextEditor;
  public properties: Property[] = [];

  public accessibilityLevels = [
    "public",
    "protected",
    "internal",
    "private",
    "protected internal",
    "private protected"
  ];

  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ];

  /**
   * Constructs an AutoFunctions class
   * @param {vscode.TextEditor} editor The current editor
   */
  constructor(editor: vscode.TextEditor) {
    this.editor = editor;
  }

  /**
   * Provides the code actions (a required function by the VS Code API)
   * @param {vscode.TextDocument} document The current document
   * @param {vscode.Range | vscode.Selection} range The current range
   * @param {vscode.CodeActionContext} _context The context of the code action
   * @param {vscode.CancellationToken} _token The cancellation token
   * @returns {vscode.ProviderResult<vscode.CodeAction[]>}
   */
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    _context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const parsedProperty = this.getPropertyFromLine(
      document.lineAt(range.start.line)
    );
    const fix = new vscode.CodeAction(
      "Generate a getter and setter for the property",
      vscode.CodeActionKind.QuickFix
    );

    if (!parsedProperty) {
      return;
    }

    this.parseDoc();

    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.insert(
      document.uri,
      this.findInsertionPoint(),
      this.generateFunctionsSnippet(parsedProperty)
    );

    return [fix];
  }

  /**
   * Generates the functions for the current document and inserts them
   */
  public generateFunctions() {
    this.parseDoc();
    this.insertFunctionsSnippet();
  }

  /**
   * Parses a wanted line and returns property info if it contains any
   * @param {vscode.TextLine} line The line to parse
   * @returns {Property | null} The property info or null if it doesn't contain a property
   */
  public getPropertyFromLine(line: vscode.TextLine): Property | null {
    const insertPos = line.range;
    const lineText = line.text;

    // Regex: '([Protection Level]?) (static?) ([Type]) ([Name]) [Anything];'
    const results = /(?:([a-zA-Z]+) )?(static )?([a-zA-Z\[\]<>]+) ([a-zA-Z0-9]+).*;/.exec(
      lineText
    );

    if (results) {
      // Checks protection level
      if (results[1] && this.accessibilityLevels.indexOf(results[1]) > -1) {
        return {
          original: lineText,
          protectionLevel: results[1],
          isStatic: results[2] !== undefined,
          type: results[3],
          name: results[4],
          insertPos
        };
      }
    }
    return null;
  }

  /**
   * Parses the document and sets the properties
   */
  public parseDoc() {
    this.properties = [];

    for (let i = 0; i < this.editor.document.lineCount; i++) {
      const line = this.editor.document.lineAt(i);
      const property = this.getPropertyFromLine(line);

      if (property) {
        this.properties.push(property);
      }
    }
  }

  /**
   * Gets the current class' name
   */
  public getClassName() {
    for (let i = 0; i < this.editor.document.lineCount; i++) {
      const line = this.editor.document.lineAt(i);
      const lineText = line.text;
      // Regex: '[Whitespace]? [Anything]? class ([Name]) [Anything]'
      const classDeclaration = lineText.match(
        /\s*[A-Ba-z\t\n]*class ([A-Za-z0-9_]+).*/
      );

      if (classDeclaration) {
        return classDeclaration[1];
      }
    }

    return null;
  }

  /**
   * Generates the functions for the wanted parsed property
   * @param {Property} property The property to generate from
   * @returns {string} The functions generated
   */
  public generateFunctionsSnippet(property: Property): string {
    return (
      "\n" +
      `
        public ${property.type} Get${capitalizeFirstLetter(
        property.name
      )}() { return ${!property.isStatic ? "this." : ""}${property.name}; }
        public void Set${capitalizeFirstLetter(property.name)}(${
        property.type
      } ${property.name}) { ${!property.isStatic ? "this." : ""}${property.name} = ${property.name}; }`
    );
  }

  /**
   * Inserts the functions using the parsed properties
   */
  public insertFunctionsSnippet() {
    this.editor.edit(edit => {
      let functions: string[] = [];

      for (const property of this.properties) {
        const snippet = this.generateFunctionsSnippet(property);
        functions.push(snippet);
      }

      if (this.properties.length > 0) {
        edit.insert(this.findInsertionPoint(), functions.join(""));
      }
    });
  }

  /**
   * Finds the insertion point
   */
  public findInsertionPoint() {
    return (
      this.findLastGetterOrSetter() ||
      this.findLastConstructor() ||
      this.properties[this.properties.length - 1].insertPos.end
    );
  }

  /**
   * Finds the last block with a specified title
   * @param blockTitle The title of the block to look for
   * @returns {vscode.Position | null} The last position of the wanted block or 'null' if no matching block were found
   */
  public findLastBlock(blockTitle: string): vscode.Position | null {
    let blockOpen: string[] = [];
    let lastBlockPos: vscode.Position | null = null;

    for (let i = 0; i < this.editor.document.lineCount; i++) {
      const line = this.editor.document.lineAt(i);
      const lineText = line.text;

      // Looks for the block title and adds it to the 'blockOpen' array
      if (lineText.includes("{")) {
        // Regex: '[Whitespace]? {'
        const checkOnlyBrace = lineText.match(/\s*{/);
        // Regex: '[Whitespace]? [Anything] {'
        const checkBraceWithText = lineText.match(/\s*[A-Za-z\s\(\)]+ {.*/);

        // Checks if the current line contains the block's title
        if (
          (!checkOnlyBrace || checkOnlyBrace[0] !== lineText) &&
          (checkBraceWithText && checkBraceWithText[0] === lineText)
        ) {
          blockOpen.push(lineText);
        } else {
          let currentLine = this.editor.document.lineAt(line.lineNumber - 1);
          // Passes on the lines backwards until it finds the line with the current block's title
          while (currentLine.text.trim() === "") {
            currentLine = this.editor.document.lineAt(
              currentLine.lineNumber - 1
            );
          }
          blockOpen.push(currentLine.text);
        }
      }

      // Looks for the end position of the last block's title
      if (lineText.includes("}") && blockOpen.length > 0) {
        if (blockOpen[blockOpen.length - 1].includes(blockTitle)) {
          lastBlockPos = line.range.end;
        }
        // Removes the last block's title if the wanted block wasn't found
        blockOpen.pop();
      }
    }

    return lastBlockPos;
  }

  /**
   * Finds the last getter's or setter's position (depending on which one is the last)
   * @returns {vscode.Position | null} The last getter's or setter's position or null if none exists
   */
  public findLastGetterOrSetter(): vscode.Position | null {
    const lastGetPos = this.findLastBlock(`Get`);
    const lastSetPos = this.findLastBlock(`Set`);

    if (lastGetPos && lastSetPos) {
      return lastSetPos.isAfter(lastGetPos) ? lastSetPos : lastGetPos;
    } else if (lastSetPos) {
      return lastSetPos;
    } else if (lastGetPos) {
      return lastGetPos;
    }
    return null;
  }

  /**
   * Find the last constructor's position
   * @returns {vscode.Position | null} The last constructor's position or null if there's no constructor
   */
  public findLastConstructor(): vscode.Position | null {
    return this.findLastBlock(`public ${this.getClassName()}`);
  }
}

export default AutoFunctions;
