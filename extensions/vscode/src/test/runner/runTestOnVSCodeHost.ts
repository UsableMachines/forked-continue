/* eslint-disable @typescript-eslint/naming-convention */
import { runTests } from "@vscode/test-electron";
import { defaultConfig } from "core/config/default";
import fs from "node:fs";
import * as path from "node:path";
import os from "node:os";

export const testWorkspacePath = path.resolve(
  __dirname,
  "..",
  "src",
  "test",
  "fixtures",
  "test-workspace",
);

const continueGlobalDir = path.resolve(
  __dirname,
  "..",
  "src",
  "test",
  "fixtures",
  ".continue",
);

function setupTestWorkspace() {
  const manualTestingSandboxPath = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "manual-testing-sandbox",
  );

  cleanupTestWorkspace();

  fs.mkdirSync(testWorkspacePath, { recursive: true });

  fs.cpSync(manualTestingSandboxPath, testWorkspacePath, { recursive: true });
}
function setupContinueGlobalDir() {
  if (fs.existsSync(continueGlobalDir)) {
    fs.rmSync(continueGlobalDir, { recursive: true });
  }

  fs.mkdirSync(continueGlobalDir, {
    recursive: true,
  });

  fs.writeFileSync(
    path.join(continueGlobalDir, "config.json"),
    JSON.stringify({
      ...defaultConfig,
      models: [
        {
          title: "Test Model",
          provider: "openai",
          model: "gpt-3.5-turbo",
          apiKey: "API_KEY",
        },
      ],
    }),
  );
}

function cleanupTestWorkspace() {
  if (fs.existsSync(testWorkspacePath)) {
    fs.rmSync(testWorkspacePath, { recursive: true });
  }
}

function cleanupContinueGlobalDir() {
  if (fs.existsSync(continueGlobalDir)) {
    fs.rmSync(continueGlobalDir, { recursive: true });
  }
}

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../");

    const extensionTestsPath = path.resolve(
      extensionDevelopmentPath,
      "out/mochaRunner",
    );

    const extensionTestsEnv = {
      NODE_ENV: "test",
      CONTINUE_GLOBAL_DIR: continueGlobalDir,
    };

    setupTestWorkspace();
    setupContinueGlobalDir();

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      extensionTestsEnv,
      launchArgs: [
        testWorkspacePath,
        "--user-data-dir", // https://stackoverflow.com/questions/71664226/cannot-run-vscode-extension-starter-project-tests-twice-in-a-row-on-macos
        `${os.tmpdir()}`,
      ],
    });
  } catch (err) {
    console.error("Failed to run tests", err);
    process.exit(1);
  } finally {
    cleanupTestWorkspace();
    cleanupContinueGlobalDir();
  }
}

main();
