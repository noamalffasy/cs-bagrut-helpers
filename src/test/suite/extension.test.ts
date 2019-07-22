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
 * Reads the file in the specified path
 * @param {string} filePath The path of the file to read
 * @returns {Promise<string>} The file's content
 */
function readFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname + "/../../test/" + filePath),
      "utf8",
      (err, fileContents) => {
        if (err) {
          reject(err);
        }
        resolve(fileContents);
      }
    );
  });
}

let autoFunctions: AutoFunctions;

describe("AutoFunctions", () => {
  describe("Empty", async () => {
    before(async () => {
      const uri = vscode.Uri.file(
        path.join(__dirname + "/../../test/files/before/Empty.cs")
      );
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
      const uri = vscode.Uri.file(
        path.join(__dirname + "/../../test/files/before/NoProperties.cs")
      );
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
      const uri = vscode.Uri.file(
        path.join(__dirname + "/../../test/files/before/NoConstructor.cs")
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
});

// suite("AutoFunctions", () => {
//     test("Empty", async () => {
//       autoFunctions.generateFunctions();
//       await readFile("files/after/Empty.cs").then(result => {
//         assert.equal(editor.document.getText(), result.replace("TestingAfter", "TestingBefore"));
//       });
//     });
// });
