#!/usr/bin/env node

import chalk from "chalk";
import chokidar from "chokidar";
import * as fs from "fs";
import * as path from "path";
import { cwd } from "process";
import type { Page } from "../config";
import { API } from "./api-direct";
import {
  buildAllPages,
  buildPages,
  clearCachesForFiles,
  refetchAndBuildPages,
} from "./pageBuilder";

const mode = process.argv[2] === "watch" ? "watch" : "build";

/**
 * API-Direct.ts just calls into the API, then transforms the return value into
 * something JSON serializable
 *
 * API-Bridge runs a worker thread (API-Worker), which does the actual work
 *
 * These two files have a default export with the same type
 *
 * Running on a worker is not so much for performance - but rather to be able
 * to restart the instance at any point should some JS change
 *
 * In the single build mode, we use API directly and avoid the worker thread.
 * In watch mode, we use the worker thread. The reason we don't run the worker
 * thread all the time is because we use the worker as an opportunity to set
 * NODE_ENV=development
 */
const api: API =
  mode === "build"
    ? require("./api-direct").default
    : require("./api-bridge").default;

// Number here is kind of random
// The expensive asset transforms happen in native code on another thread
// so the larger this number is, the more these transforms happen concurrently
// But there's also overhead from the extra bookkeeping React has to do
const concurrentLimit = mode === "build" ? 6 : 1;

const projectPath = cwd();

const sitePath = path.join(projectPath, "site");
const clearSiteFolder = () => {
  fs.rmSync(sitePath, { recursive: true, force: true });
  fs.mkdirSync(sitePath);
};

clearSiteFolder();

const logBuildPage = (page: Page) => {
  console.log(`- Building ${page.filename}`);
};

const logDuration = (duration: number) => {
  const durationSeconds = (duration / 1000).toFixed(2);
  console.log(chalk.green(`[Build completed in ${durationSeconds}s]`));
};

const runFullBuild = async () => {
  console.log(chalk.dim("[Building site...]"));

  const { duration, cssStats } = await buildAllPages(
    api,
    concurrentLimit,
    logBuildPage
  );

  logDuration(duration);

  const logIfNotEmpty = (array: string[], message: string) => {
    if (array.length > 0) {
      console.warn(chalk.yellow(message));
      console.warn(array.join(", "));
    }
  };

  logIfNotEmpty(
    cssStats.unusedClassNames,
    "The following classes were defined in CSS, but never used in any non-CSS files:"
  );
  logIfNotEmpty(
    cssStats.undeclaredClassNames,
    "The following classes used one more non-CSS files, but never defined in CSS:"
  );
};

let queue = Promise.resolve();

const queueAsync = (fn: () => Promise<void> | void) => {
  queue = queue.then(fn);
};

queueAsync(runFullBuild);

if (mode !== "build") {
  const { restartWorker, terminateWorker } = require("./api-bridge");

  queueAsync(() => {
    console.log(chalk.dim("[Watching for changes site...]"));
  });

  /* Start server */
  const portArgIndex = process.argv.indexOf("--port");
  const port =
    portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : 8080;

  console.log(
    chalk.whiteBright.bgYellow(`[Dev mode - listening on port ${port}]`)
  );
  const httpServer = require("http-server");
  httpServer
    .createServer({
      root: sitePath,
      cache: -1,
    })
    .listen(port, "0.0.0.0");

  /* Watch for file changes */
  const runRebuild = async (filesToRebuild: string[]) => {
    const { invalidatedPages, jsModulesInvalidated } =
      await clearCachesForFiles(api, filesToRebuild);

    if (jsModulesInvalidated) {
      const assetTransformCache = await api.encodeAssetTransformCache();
      restartWorker();
      await api.restoreAssetTransformCache(assetTransformCache);
    }

    if (invalidatedPages.size > 0) {
      console.log(chalk.dim(`[Partial rebuild...]`));
      const { duration } = await buildPages(
        api,
        invalidatedPages,
        concurrentLimit,
        logBuildPage
      );
      logDuration(duration);
    }
  };

  const runRefetchAndRebuildPagesIfNeeded = (filename: string) => {
    if (filename.endsWith(".mdx")) {
      queueAsync(async () => {
        await refetchAndBuildPages(api, concurrentLimit, logBuildPage);
      });
    }
  };

  let changedFiles: string[] = [];
  let queueRebuildTimeout: NodeJS.Timeout | undefined;
  chokidar
    .watch(projectPath, {
      ignored: [path.join(projectPath, "node_modules"), sitePath],
    })
    .on("add", runRefetchAndRebuildPagesIfNeeded)
    .on("unlink", runRefetchAndRebuildPagesIfNeeded)
    .on("change", (filename: string) => {
      changedFiles.push(filename);

      clearTimeout(queueRebuildTimeout!);
      queueRebuildTimeout = setTimeout(() => {
        const filesToRebuild = changedFiles;
        changedFiles = [];

        queueAsync(() => runRebuild(filesToRebuild));
      }, 50);
    });

  /* Watch for `r` input to trigger rebuild */
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.setEncoding("utf8");
  stdin.on("data", (key: string) => {
    if (key === "\u0003") {
      terminateWorker();
      process.exit();
    } else if (key.trim() == "r") {
      queueAsync(async () => {
        console.log(chalk.whiteBright.bgGray("[Cache cleared...]"));
        restartWorker();
        await runFullBuild();
      });
    }
  });
}
