import glob from "glob";
import path from "path";
import { Page } from "../api/usePages";
import { Config } from "../core";
import dev from "../util/dev";
import projectPath from "../util/projectPath";
import {
  clearAssetTransformCacheForFiles,
  encodeAssetTransformCache,
  generateCssStats,
  renderPage,
  resetCssStats,
  restartWorker,
  restoreAssetTransformCache,
  terminateWorker,
} from "./ipc";

export { restartWorker, terminateWorker };

const castArray = (x: string[] | string | undefined): string[] => {
  if (Array.isArray(x)) {
    return x;
  } else if (x != null) {
    return [x];
  } else {
    return [];
  }
};

let config: Config;
try {
  config = require(path.join(projectPath, "site.config.ts")).default;
} catch {
  config = {};
}

const pageFilenames = new Set(
  castArray(config.pages ?? "**/*.mdx").flatMap((fileGlob) => {
    return glob.sync(fileGlob, { cwd: projectPath });
  })
);
const pages = new Set(
  Array.from(pageFilenames, (absolutePath): Page => {
    const filename = "/" + path.relative(projectPath, absolutePath);
    const url =
      config.urlForPage?.(filename) ?? path.basename(filename, ".mdx");
    return { filename, url };
  })
);

const pageDependencies = new Map<Page, string[]>();

// Number here is kind of random
// The expensive asset transforms happen in native code on another thread
// so the larger this number is, the more these transforms happen concurrently
// But there's also overhead from the extra bookkeeping React has to do
const concurrentLimit = dev ? 1 : 6;

export const buildPages = async (
  pages: Set<Page>,
  logger: (page: Page) => void
) => {
  const start = Date.now();

  // Preserve imports to work with node imports
  const { default: pAll } = await eval(`import("p-all")`);
  const pagesArray = Array.from(pages);

  await pAll(
    Array.from(pages, (page) => async () => {
      logger(page);

      const { dependencies } = await renderPage({ page, pages: pagesArray });

      pageDependencies.set(page, dependencies);
    }),
    { concurrency: concurrentLimit }
  );

  const end = Date.now();
  const duration = end - start;

  return { duration };
};

export const buildAllPages = async (logger: (page: Page) => void) => {
  resetCssStats();

  const { duration } = await buildPages(pages, logger);

  const cssStats = await generateCssStats();

  return { duration, cssStats };
};

export const clearCachesForFiles = async (
  filenames: string[]
): Promise<{ invalidatedPages: Set<Page> }> => {
  const invertedPageDependencies = new Map<string, Set<Page>>();
  pageDependencies.forEach((dependencies, page) => {
    dependencies.forEach((dependency) => {
      let pages = invertedPageDependencies.get(dependency);
      if (pages == null) {
        pages = new Set<Page>();
        invertedPageDependencies.set(dependency, pages);
      }
      pages.add(page);
    });
  });

  const invalidatedPages = new Set<Page>();
  filenames.forEach((filename) => {
    invertedPageDependencies.get(filename)?.forEach((page) => {
      invalidatedPages.add(page);
    });
  });

  const { jsModulesInvalidated } = await clearAssetTransformCacheForFiles(
    filenames
  );

  if (jsModulesInvalidated) {
    const assetTransformCache = await encodeAssetTransformCache();
    restartWorker();
    await restoreAssetTransformCache(assetTransformCache);
  }

  return { invalidatedPages };
};
