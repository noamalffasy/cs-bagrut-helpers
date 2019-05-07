import * as fs from "fs";
import * as path from "path";

import * as assert from "assert";
import * as vscode from "vscode";

import AutoFunctions from "../AutoFunctions";

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

    it("should find and parse properties", () => {
      autoFunctions.parseDoc();
      assert.deepEqual(autoFunctions.properties, []);
    });

    it("should get then class' name", () => {
      assert.equal(autoFunctions.getClassName(), "Empty");
    });

    it("should find last constructor", () => {
      assert.equal(autoFunctions.findLastConstructor(), null);
    });

    it("shouldn't insert functions", async () => {
      autoFunctions.insertFunctionsSnippet();

      await readFile("files/after/Empty.cs").then(file => {
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
