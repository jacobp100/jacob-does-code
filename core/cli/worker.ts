import {
  clearAssetTransformCacheForFile,
  encodeAssetTransformCache,
  restoreAssetTransformCache,
} from "../assetTransformer";
import { generateCssStats, resetCssStats } from "../css";
import renderPage from "../renderPage";
import { IpcMessage, Messages, Status } from "./types";

const isUsingJsModule = (filename: string) => {
  try {
    const moduleId = require.resolve(filename);
    return require.cache[moduleId] != null;
  } catch {
    return false;
  }
};

const handlers: Messages = {
  async RenderPage({ page, pages }) {
    const data = await renderPage({ page, pages });
    const dependencies = Array.from(data.dependencies);
    return { dependencies };
  },
  async EncodeAssetTransformCache() {
    const assetTransformCache = encodeAssetTransformCache();
    return assetTransformCache;
  },
  async RestoreAssetTransformCache(assetTransformCache) {
    restoreAssetTransformCache(assetTransformCache);
  },
  async ClearAssetTransformCacheForFiles(filenames) {
    filenames.forEach(clearAssetTransformCacheForFile);
    const jsModulesInvalidated = filenames.some(isUsingJsModule);
    return { jsModulesInvalidated };
  },
  async GenerateCssStats() {
    const stats = generateCssStats();
    const unusedClassNames = Array.from(stats.unusedClassNames);
    const undeclaredClassNames = Array.from(stats.undeclaredClassNames);
    return { unusedClassNames, undeclaredClassNames };
  },
  async ResetCssStats() {
    resetCssStats();
  },
};

let queue = Promise.resolve();

process.send!({ type: Status.Ready, payload: null });

process.on("message", (message: IpcMessage) => {
  queue = queue.then(async () => {
    try {
      const { type } = message;
      const payload: any = (await handlers[type](message.payload)) ?? null;
      process.send!({ type, payload });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
});
