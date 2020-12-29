import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import chalk from "chalk";
import renderPage from "./core/renderPage";
import { File, pages, posts } from "./core/files";
import dev from "./core/dev";

const sitePath = path.join(__dirname, "site");
fs.rmdirSync(sitePath, { recursive: true });
fs.mkdirSync(sitePath);

const files = new Set([...pages, ...posts]);
const fileDependencies = new Map<string, File>();

const run = (files: Set<File>, message: string) => {
  console.log(chalk.dim(`[${message}...]`));

  files.forEach((file) => {
    console.log(`- Building ${file.title ?? file.url}`);
    const { dependencies } = renderPage(file);

    dependencies.forEach((dependency) => {
      fileDependencies.set(dependency, file);
    });
  });

  console.log(chalk.green("[Build complete]"));

  if (dev) {
    console.log(chalk.cyan("[Watching for changes...]"));
  }
};

if (dev) {
  const core = path.resolve("core", __dirname);

  let timeout: ReturnType<typeof setTimeout> | null = null;
  const pendingFiles = new Set<string>();

  const runChanged = () => {
    let coreChanged = false;
    const changed = new Set<File>();

    pendingFiles.forEach((filename) => {
      // https://stackoverflow.com/a/52466310/2195592
      const isInCore = path.relative(core, filename).startsWith("./");
      coreChanged = coreChanged || isInCore;

      const file = fileDependencies.get(filename);

      if (file != null) {
        changed.add(file);
      }
    });

    pendingFiles.clear();

    if (coreChanged) {
      run(files, "Full rebuild");
    } else if (changed.size !== 0) {
      run(changed, "partial rebuild");
    } else {
      return;
    }
  };

  chokidar.watch(__dirname).on("change", (path) => {
    pendingFiles.add(path);

    if (timeout != null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(runChanged, 50);
  });
}

run(files, "Building site");
