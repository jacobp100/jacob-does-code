import type { AssetTransformCache } from "../assetTransformer";
import {
  clearAssetTransformCacheForFile,
  encodeAssetTransformCache,
  restoreAssetTransformCache,
} from "../assetTransformer";
import type { Page, ResolvedConfig } from "../config";
import { generateCssStats, resetCssStats } from "../css";
import renderPage from "../renderPage";

const isUsingJsModule = (filename: string) => {
  try {
    const moduleId = require.resolve(filename);
    return require.cache[moduleId] != null;
  } catch {
    return false;
  }
};

export type API = {
  renderPage: (opts: {
    page: Page;
    pages: ResolvedConfig["pages"];
  }) => Promise<{ dependencies: string[] }>;
  encodeAssetTransformCache: () => Promise<AssetTransformCache>;
  restoreAssetTransformCache: (
    assetTransformCache: AssetTransformCache
  ) => Promise<void>;
  clearAssetTransformCacheForFiles: (
    filenames: string[]
  ) => Promise<{ jsModulesInvalidated: boolean }>;
  generateCssStats: () => Promise<{
    unusedClassNames: string[];
    undeclaredClassNames: string[];
  }>;
  resetCssStats: () => Promise<void>;
};

const api: API = {
  async renderPage({ page, pages }) {
    const data = await renderPage({ page, pages });
    const dependencies = Array.from(data.dependencies);
    return { dependencies };
  },
  async encodeAssetTransformCache() {
    const assetTransformCache = encodeAssetTransformCache();
    return assetTransformCache;
  },
  async restoreAssetTransformCache(assetTransformCache) {
    restoreAssetTransformCache(assetTransformCache);
  },
  async clearAssetTransformCacheForFiles(filenames) {
    filenames.forEach(clearAssetTransformCacheForFile);
    const jsModulesInvalidated = filenames.some(isUsingJsModule);
    return { jsModulesInvalidated };
  },
  async generateCssStats() {
    const stats = generateCssStats();
    const unusedClassNames = Array.from(stats.unusedClassNames);
    const undeclaredClassNames = Array.from(stats.undeclaredClassNames);
    return { unusedClassNames, undeclaredClassNames };
  },
  async resetCssStats() {
    resetCssStats();
  },
};

export default api;
