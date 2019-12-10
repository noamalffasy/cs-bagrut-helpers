import * as fs from "fs";
import * as path from "path";

import * as assert from "assert";
import * as vscode from "vscode";

import AutoFunctions from "../../AutoFunctions";

/**
 * Pause the code for a specified amount of time
 * @param {number} ms The amount of milliseconds to wait
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/**
 * Gets the absolute file path
 * @param {string} relativeFilePath The relative file path to get
 * @returns {string} The absoulte file path
 */
function getFilePath(relativeFilePath: string): string {
  return path.join(__dirname, "/../../../test/", relativeFilePath);
}

/**
 * Reads the file in the specified path
 * @param {string} filePath The path of the file to read
 * @returns {Promise<string>} The file's content
 */
function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(getFilePath(filePath), "utf8", (err, fileContents) => {
      if (err) {
        reject(err);
      }
      resolve(fileContents);
    });
  });
}

let autoFunctions: AutoFunctions;

describe("AutoFunctions", () => {
  describe("Empty", async () => {
    before(async () => {
      const uri = vscode.Uri.file(getFilePath("files/before/Empty.cs"));
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);

      await sleep(500);

      autoFunctions = new AutoFunctions(editor);
    });

    it("shouldn't find and parse properties", () => {
      autoFunctions.parseDoc();
      assert.deepEqual(autoFunctions.properties, []);
    });

    it("should get then class' name", () => {
      assert.equal(autoFunctions.getClassName(), "Empty");
    });

    it("shouldn't find last constructor", () => {
      assert.deepEqual(autoFunctions.findLastConstructor(), null);
    });

    it("shouldn't insert functions", async () => {
      autoFunctions.insertFunctionsSnippet();

      await sleep(500);

      await readFile("files/after/Empty.cs").then(file => {
        assert.equal(
          autoFunctions.editor.document.getText(),
          file.replace("TestingAfter", "TestingBefore")
        );
      });
    });
  });

  describe("NoProperites", async () => {
    before(async () => {
      const uri = vscode.Uri.file(getFilePath("files/before/NoProperties.cs"));
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);

      await sleep(500);

      autoFunctions = new AutoFunctions(editor);
    });

    it("shouldn't find and parse properties", () => {
      autoFunctions.parseDoc();
      assert.deepEqual(autoFunctions.properties, []);
    });

    it("should get then class' name", () => {
      assert.equal(autoFunctions.getClassName(), "NoProperties");
    });

    it("should find last constructor", () => {
      assert.deepEqual(autoFunctions.findLastConstructor(), {
        _line: 6,
        _character: 33
      });
    });

    it("shouldn't insert functions", async () => {
      autoFunctions.insertFunctionsSnippet();

      await sleep(500);

      await readFile("files/after/NoProperties.cs").then(file => {
        assert.equal(
          autoFunctions.editor.document.getText(),
          file.replace("TestingAfter", "TestingBefore")
        );
      });
    });
  });

  describe("NoConstructor", async () => {
    before(async () => {
      const uri = vscode.Uri.file(getFilePath("files/before/NoConstructor.cs"));
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);

      await sleep(500);

      autoFunctions = new AutoFunctions(editor);
    });

    it("should find and parse properties", () => {
      autoFunctions.parseDoc();
      assert.deepEqual(autoFunctions.properties, [
        {
          original: "        private int name;",
          protectionLevel: "private",
          isStatic: false,
          type: "int",
          name: "name",
          insertPos: {
            _start: {
              _character: 0,
              _line: 6
            },
            _end: {
              _character: 25,
              _line: 6
            }
          }
        }
      ]);
    });

    it("should get then class' name", () => {
      assert.equal(autoFunctions.getClassName(), "NoConstructor");
    });

    it("shouldn't find last constructor", () => {
      assert.deepEqual(autoFunctions.findLastConstructor(), null);
    });

    it("should insert functions", async () => {
      autoFunctions.insertFunctionsSnippet();

      await sleep(500);

      await readFile("files/after/NoConstructor.cs").then(file => {
        assert.equal(
          autoFunctions.editor.document.getText(),
          file.replace("TestingAfter", "TestingBefore")
        );
      });
    });
  });

  describe("ConstructorAndProperty", async () => {
    before(async () => {
      const uri = vscode.Uri.file(
        getFilePath("files/before/ConstructorAndProperty.cs")
      );
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);

      await sleep(500);

      autoFunctions = new AutoFunctions(editor);
    });

    it("should find and parse properties", () => {
      autoFunctions.parseDoc();
      assert.deepEqual(autoFunctions.properties, [
        {
          original: "        private int name;",
          protectionLevel: "private",
          isStatic: false,
          type: "int",
          name: "name",
          insertPos: {
            _start: {
              _character: 0,
              _line: 6
            },
            _end: {
              _character: 25,
              _line: 6
            }
          }
        }
      ]);
    });

    it("should get then class' name", () => {
      assert.equal(autoFunctions.getClassName(), "ConstructorAndProperty");
    });

    it("should find last constructor", () => {
      assert.deepEqual(autoFunctions.findLastConstructor(), {
        _line: 8,
        _character: 43
      });
    });

    it("should insert functions", async () => {
      autoFunctions.insertFunctionsSnippet();

      await sleep(500);

      await readFile("files/after/ConstructorAndProperty.cs").then(file => {
        assert.equal(
          autoFunctions.editor.document.getText(),
          file.replace("TestingAfter", "TestingBefore")
        );
      });
    });
  });

  describe("MultiProperties", async () => {
    before(async () => {
      const uri = vscode.Uri.file(
        getFilePath("files/before/MultiProperties.cs")
      );
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);

      await sleep(500);

      autoFunctions = new AutoFunctions(editor);
    });

    it("should find and parse properties", () => {
      autoFunctions.parseDoc();
      assert.deepEqual(autoFunctions.properties, [
        {
          original: "        private int first;",
          protectionLevel: "private",
          isStatic: false,
          type: "int",
          name: "first",
          insertPos: {
            _start: {
              _character: 0,
              _line: 6
            },
            _end: {
              _character: 26,
              _line: 6
            }
          }
        },
        {
          original: "        private int second;",
          protectionLevel: "private",
          isStatic: false,
          type: "int",
          name: "second",
          insertPos: {
            _start: {
              _character: 0,
              _line: 7
            },
            _end: {
              _character: 27,
              _line: 7
            }
          }
        }
      ]);
    });

    it("should get then class' name", () => {
      assert.equal(autoFunctions.getClassName(), "MultiProperties");
    });

    it("shouldn't find last constructor", () => {
      assert.deepEqual(autoFunctions.findLastConstructor(), null);
    });

    it("should insert functions", async () => {
      autoFunctions.insertFunctionsSnippet();

      await sleep(500);

      await readFile("files/after/MultiProperties.cs").then(file => {
        assert.equal(
          autoFunctions.editor.document.getText(),
          file.replace("TestingAfter", "TestingBefore")
        );
      });
    });
  });

  describe("MultiPropertiesAndConstructor", async () => {
    before(async () => {
      const uri = vscode.Uri.file(
        getFilePath("files/before/MultiPropertiesAndConstructor.cs")
      );
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);

      await sleep(500);

      autoFunctions = new AutoFunctions(editor);
    });

    it("should find and parse properties", () => {
      autoFunctions.parseDoc();
      assert.deepEqual(autoFunctions.properties, [
        {
          original: "        private int first;",
          protectionLevel: "private",
          isStatic: false,
          type: "int",
          name: "first",
          insertPos: {
            _start: {
              _character: 0,
              _line: 6
            },
            _end: {
              _character: 26,
              _line: 6
            }
          }
        },
        {
          original: "        private int second;",
          protectionLevel: "private",
          isStatic: false,
          type: "int",
          name: "second",
          insertPos: {
            _start: {
              _character: 0,
              _line: 7
            },
            _end: {
              _character: 27,
              _line: 7
            }
          }
        }
      ]);
    });

    it("should get then class' name", () => {
      assert.equal(
        autoFunctions.getClassName(),
        "MultiPropertiesAndConstructor"
      );
    });

    it("should find last constructor", () => {
      assert.deepEqual(autoFunctions.findLastConstructor(), {
        _line: 9,
        _character: 50
      });
    });

    it("should insert functions", async () => {
      autoFunctions.insertFunctionsSnippet();

      await sleep(500);

      await readFile("files/after/MultiPropertiesAndConstructor.cs").then(
        file => {
          assert.equal(
            autoFunctions.editor.document.getText(),
            file.replace("TestingAfter", "TestingBefore")
          );
        }
      );
    });
  });

  describe("GenericProperty", async () => {
    before(async () => {
      const uri = vscode.Uri.file(
        getFilePath("files/before/GenericProperty.cs")
      );
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);

      await sleep(500);

      autoFunctions = new AutoFunctions(editor);
    });

    it("should find and parse properties", () => {
      autoFunctions.parseDoc();
      assert.deepEqual(autoFunctions.properties, [
        {
          original: "        private List<int> list;",
          protectionLevel: "private",
          isStatic: false,
          type: "List<int>",
          name: "list",
          insertPos: {
            _start: {
              _character: 0,
              _line: 6
            },
            _end: {
              _character: 31,
              _line: 6
            }
          }
        }
      ]);
    });

    it("should get then class' name", () => {
      assert.equal(autoFunctions.getClassName(), "GenericProperty");
    });

    it("shouldn't find last constructor", () => {
      assert.deepEqual(autoFunctions.findLastConstructor(), null);
    });

    it("should insert functions", async () => {
      autoFunctions.insertFunctionsSnippet();

      await sleep(500);

      await readFile("files/after/GenericProperty.cs").then(file => {
        assert.equal(
          autoFunctions.editor.document.getText(),
          file.replace("TestingAfter", "TestingBefore")
        );
      });
    });
  });

  describe("StaticProperty", async () => {
    before(async () => {
      const uri = vscode.Uri.file(
        getFilePath("files/before/StaticProperty.cs")
      );
      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document);

      await sleep(500);

      autoFunctions = new AutoFunctions(editor);
    });

    it("should find and parse properties", () => {
      autoFunctions.parseDoc();
      assert.deepEqual(autoFunctions.properties, [
        {
          original: "        private static int num;",
          protectionLevel: "private",
          isStatic: true,
          type: "int",
          name: "num",
          insertPos: {
            _start: {
              _character: 0,
              _line: 6
            },
            _end: {
              _character: 31,
              _line: 6
            }
          }
        }
      ]);
    });

    it("should get then class' name", () => {
      assert.equal(autoFunctions.getClassName(), "StaticProperty");
    });

    it("shouldn't find last constructor", () => {
      assert.deepEqual(autoFunctions.findLastConstructor(), null);
    });

    it("should insert functions", async () => {
      autoFunctions.insertFunctionsSnippet();

      await sleep(500);

      await readFile("files/after/StaticProperty.cs").then(file => {
        assert.equal(
          autoFunctions.editor.document.getText(),
          file.replace("TestingAfter", "TestingBefore")
        );
      });
    });
  });
});
