import chalk from "chalk";
import renderPage from "../renderPage";
import { File, getPages, getPosts } from "../files";
import { clearFileAssetCache } from "../cacheAssetTransform";
import { resetCssStats, validateCss } from "../css";

const files = new Set([...getPages(), ...getPosts()]);
const fileDependencies = new Map<File, Set<string>>();

const run = (files: Set<File>, message: string) => {
  const start = Date.now();
  console.log(chalk.dim(`[${message}...]`));

  files.forEach((file) => {
    console.log(`- Building ${file.title ?? file.url}`);
    const { dependencies } = renderPage(file);

    fileDependencies.set(file, dependencies);
  });

  const end = Date.now();
  const duration = ((end - start) / 1000).toFixed(2);
  console.log(chalk.green(`[Build completed in ${duration}s]`));
};

const fullBuild = (message: string) => {
  resetCssStats();

  run(files, message);

  const cssStats = validateCss();

  const logIfNotEmpty = (array: string[], message: string) => {
    if (array.length > 0) {
      console.warn(chalk.yellow(message));
      console.warn(array.join(", "));
    }
  };

  logIfNotEmpty(
    cssStats.unusedClassNames,
    "The following classes were defined in css, but never used"
  );
  logIfNotEmpty(
    cssStats.undeclaredClassNames,
    "The following classes used, but never defined in css"
  );
};

let pendingFiles = new Set<string>();
let rebuildPendingFilesTimeout: ReturnType<typeof setTimeout> | null;

const rebuildPendingFiles = () => {
  const changed = new Set<File>();

  const invertedFileDependencies = new Map<string, Set<File>>();
  fileDependencies.forEach((dependencies, file) => {
    dependencies.forEach((dependency) => {
      let files = invertedFileDependencies.get(dependency);
      if (files == null) {
        files = new Set<File>();
        invertedFileDependencies.set(dependency, files);
      }
      files.add(file);
    });
  });

  pendingFiles.forEach((filename) => {
    clearFileAssetCache(filename);

    invertedFileDependencies.get(filename)?.forEach((file) => {
      changed.add(file);
    });
  });

  pendingFiles.clear();

  if (changed.size > 0) {
    run(changed, "Partial rebuild");
  }
};

process.on("message", (message) => {
  switch (message.type) {
    case "rebuild": {
      pendingFiles.add(message.filename);

      if (rebuildPendingFilesTimeout != null) {
        clearTimeout(rebuildPendingFilesTimeout);
      }
      rebuildPendingFilesTimeout = setTimeout(rebuildPendingFiles, 50);
    }
  }
});

fullBuild("Building site");
