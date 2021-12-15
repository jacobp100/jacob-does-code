import dev from "../util/dev";
import { File, getFiles } from "../util/projectFiles";
import {
  renderPage,
  clearAssetTransformCache,
  generateCssStats,
  resetCssStats,
} from "./ipc";

const fileDependencies = new Map<File, string[]>();

const files = new Set(getFiles());

// Number here is kind of random
// The expensive asset transforms happen in native code on another thread
// so the larger this number is, the more these transforms happen concurrently
// But there's also overhead from the extra bookkeeping React has to do
const concurrentLimit = dev ? 1 : 6;

export const buildFiles = async (
  files: Set<File>,
  logger: (file: File) => void
) => {
  const start = Date.now();

  const { default: pAll } = await eval(`import("p-all")`);
  await pAll(
    Array.from(files, (file) => async () => {
      logger(file);
      const { dependencies } = await renderPage(file);

      fileDependencies.set(file, dependencies);
    }),
    { concurrency: concurrentLimit }
  );

  const end = Date.now();
  const duration = end - start;

  return { duration };
};

export const buildAllFiles = async (logger: (file: File) => void) => {
  resetCssStats();

  const { duration } = await buildFiles(files, logger);

  const cssStats = await generateCssStats();

  return { duration, cssStats };
};

export const clearCacheForTransforms = (
  filenames: string[]
): { invalidatedFiles: Set<File> } => {
  const invalidatedFiles = new Set<File>();

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

  filenames.forEach((filename) => {
    clearAssetTransformCache(filename);

    invertedFileDependencies.get(filename)?.forEach((file) => {
      invalidatedFiles.add(file);
    });
  });

  return { invalidatedFiles };
};
