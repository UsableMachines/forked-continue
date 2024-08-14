import { describe, test, before } from "mocha";
import assert from "node:assert";
import * as vscode from "vscode";
import { VsCodeExtension } from "../../extension/VsCodeExtension";

describe("Extension Test Suite", () => {
  let extension: VsCodeExtension;

  before(async () => {
    const continueExtensionApi =
      vscode.extensions.getExtension("continue.continue");

    await new Promise((resolve) => setTimeout(resolve, 400));

    extension = continueExtensionApi?.exports.extension;
  });

  test.skip("Get the default model from webview", async () => {
    await vscode.commands.executeCommand("continue.focusContinueInput");
    await new Promise((resolve) => setTimeout(resolve, 400));

    const title = await (
      await extension.webviewProtocolPromise
    ).request("getDefaultModelTitle", undefined);

    assert.strictEqual(typeof title, "string");
    assert.strictEqual(title, "Test Model");
  });

  test.skip("Indexing smoke test", async () => {
    await vscode.commands.executeCommand("continue.codebaseForceReIndex");

    const { status: indexingStatus } = extension.core.indexingState;

    let startTime = Date.now();
    const timeoutMs = 10_000;

    while (indexingStatus !== "done") {
      if (Date.now() - startTime > timeoutMs) {
        assert.fail(
          `Indexing did not complete in time. Current state: ${indexingStatus}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    assert.equal(indexingStatus, "done", "Indexing should be completed");
  });
});
