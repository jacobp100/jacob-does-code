import { File, getPages, getPosts } from "../util/projectFiles.js";
import {
  renderPage,
  clearAssetTransformCache,
  generateCssStats,
  resetCssStats,
} from "./ipc.js";

const fileDependencies = new Map<File, string[]>();

const files = new Set([...getPages(), ...getPosts()]);

// Disable if debugging
const enableConcurrentPageBuilding = true;

export const buildFiles = async (files: Set<File>) => {
  const start = Date.now();

  const buildPage = async (file: File) => {
    console.log(`- Building ${file.title ?? file.url}`);
    const { dependencies } = await renderPage(file);

    fileDependencies.set(file, dependencies);
  };

  if (enableConcurrentPageBuilding) {
    await Promise.all(Array.from(files, buildPage));
  } else {
    for (const file of Array.from(files)) {
      await buildPage(file);
    }
  }

  const end = Date.now();
  const duration = end - start;

  return { duration };
};

export const buildAllFiles = async () => {
  resetCssStats();

  const { duration } = await buildFiles(files);

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
