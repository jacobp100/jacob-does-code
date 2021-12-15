import * as path from "path";
import * as fs from "fs";
// @ts-ignore
import chalk from "chalk";
// @ts-ignore
import chokidar from "chokidar";
import type { File } from "../util/projectFiles";
import projectPath from "../util/projectPath";
import { buildAllFiles, buildFiles, clearCacheForTransforms } from "./builder";
import {
  restartWorker,
  terminateWorker,
  encodeAssetTransformCache,
  restoreAssetTransformCache,
} from "./ipc";

const sitePath = path.join(projectPath, "site");
const clearSiteFolder = () => {
  try {
    fs.rmdirSync(sitePath, { recursive: true });
  } catch {}

  fs.mkdirSync(sitePath);
};

clearSiteFolder();

const logBuildFile = (file: File) => {
  console.log(`- Building ${file.filename}`);
};

const logDuration = (duration: number) => {
  const durationSeconds = (duration / 1000).toFixed(2);
  console.log(chalk.green(`[Build completed in ${durationSeconds}s]`));
};

const runFullBuild = async () => {
  console.log(chalk.dim("[Building site...]"));

  const { duration, cssStats } = await buildAllFiles(logBuildFile);

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

if (process.argv.includes("--dev")) {
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
  httpServer.createServer({ root: sitePath }).listen(port, "0.0.0.0");

  /* Watch for file changes */
  let needsRestart = false;
  let invalidatedFiles: string[] = [];
  const runRebuild = async () => {
    const filesToRebuild = invalidatedFiles;
    invalidatedFiles = [];

    const buildInvalidatedPages = async () => {
      const { invalidatedFiles } = clearCacheForTransforms(filesToRebuild);

      if (invalidatedFiles.size > 0) {
        console.log(chalk.dim(`[Partial rebuild...]`));
        const { duration } = await buildFiles(invalidatedFiles, logBuildFile);
        logDuration(duration);
      }
    };

    if (needsRestart) {
      queueAsync(async () => {
        const assetTransformCache = await encodeAssetTransformCache();
        restartWorker();
        await restoreAssetTransformCache(assetTransformCache);

        await buildInvalidatedPages();
      });
    } else {
      queueAsync(buildInvalidatedPages);
    }

    needsRestart = false;
  };

  let queueRebuildTimeout: NodeJS.Timeout | undefined;
  const queueRebuild = (filename: string, rebuildNeedsRestart: boolean) => {
    needsRestart = needsRestart || rebuildNeedsRestart;
    invalidatedFiles.push(filename);

    clearTimeout(queueRebuildTimeout!);
    queueRebuildTimeout = setTimeout(runRebuild, 50);
  };

  chokidar.watch(projectPath).on("change", (filename: string) => {
    if (!filename.startsWith(sitePath)) {
      // FIXME: Some assets will be JS
      // But changing these doesn't need a restart
      const needsRestart = /\.[tj]sx?$/.test(filename);
      queueRebuild(filename, needsRestart);
    }
  });

  /* Watch for `r` input to trigger rebuild */
  const stdin = process.stdin;
  stdin.setRawMode(true);
  stdin.setEncoding("utf8");
  stdin.on("data", (key: string) => {
    if (key === "\u0003") {
      terminateWorker();
      process.exit();
    } else if (key == "r") {
      queueAsync(async () => {
        console.log(chalk.whiteBright.bgGray("[Cache cleared...]"));
        restartWorker();
        await runFullBuild();
      });
    }
  });
} else {
  queueAsync(terminateWorker);
}
