import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import chalk from "chalk";
import renderPage from "./renderPage";
import { File, getPages, getPosts } from "./files";
import { clearFileAssetCache } from "./cacheAssetTransform";
import dev from "./dev";

const projectDir = path.join(__dirname, "..");

const sitePath = path.join(projectDir, "site");
fs.rmdirSync(sitePath, { recursive: true });
fs.mkdirSync(sitePath);

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

  if (dev) {
    console.log(chalk.cyan("[Watching for changes...]"));
  }
};

if (dev) {
  const core = path.resolve(projectDir, "core");

  let timeout: ReturnType<typeof setTimeout> | null = null;
  const pendingFiles = new Set<string>();

  const runChanged = () => {
    let coreChanged = false;
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

      const isInCore = /^[^./]/.test(path.relative(core, filename));
      coreChanged = coreChanged || isInCore;

      invertedFileDependencies.get(filename)?.forEach((file) => {
        changed.add(file);
      });
    });

    pendingFiles.clear();

    if (coreChanged) {
      run(files, "Full rebuild");
    } else if (changed.size !== 0) {
      run(changed, "Partial rebuild");
    }
  };

  chokidar.watch(projectDir).on("change", (path) => {
    pendingFiles.add(path);

    if (timeout != null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(runChanged, 50);
  });
}

run(files, "Building site");
