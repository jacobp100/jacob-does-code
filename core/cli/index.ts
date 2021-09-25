import path from "path";
import fs from "fs";
import chalk from "chalk";
import chokidar from "chokidar";
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
  fs.rmdirSync(sitePath, { recursive: true });
  fs.mkdirSync(sitePath);
};

clearSiteFolder();

const logDuration = (duration: number) => {
  const durationSeconds = (duration / 1000).toFixed(2);
  console.log(chalk.green(`[Build completed in ${durationSeconds}s]`));
};

const runFullBuild = async () => {
  console.log(chalk.dim("[Building site...]"));

  const { duration, cssStats } = await buildAllFiles();

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

  require("http-server")
    .createServer({ root: sitePath })
    .listen(port, "0.0.0.0");

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
        const { duration } = await buildFiles(invalidatedFiles);
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

  const watchDirectories: Array<{ directory: string; needsRestart: boolean }> =
    [
      {
        directory: path.resolve(projectPath, "core"),
        needsRestart: true,
      },
      {
        directory: path.resolve(projectPath, "components"),
        needsRestart: true,
      },
      {
        directory: path.resolve(projectPath, "layouts"),
        needsRestart: true,
      },
      {
        directory: path.resolve(projectPath, "assets"),
        needsRestart: false,
      },
      {
        directory: path.resolve(projectPath, "pages"),
        needsRestart: false,
      },
      {
        directory: path.resolve(projectPath, "posts"),
        needsRestart: false,
      },
    ];

  chokidar.watch(projectPath).on("change", (filename) => {
    const changedDirectory = watchDirectories.find(({ directory }) => {
      const directoryContainsFilename = /^[^./]/.test(
        path.relative(directory, filename)
      );

      return directoryContainsFilename;
    });

    if (changedDirectory != null) {
      queueRebuild(filename, changedDirectory.needsRestart);
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
  queueAsync(() => {
    terminateWorker();
  });
}
