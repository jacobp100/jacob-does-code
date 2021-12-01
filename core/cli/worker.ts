import renderPage from "../renderPage/renderPage.js";
import { generateCssStats, resetCssStats } from "../api/css.js";
import {
  clearAssetTransformCache,
  encodeAssetTransformCache,
  restoreAssetTransformCache,
} from "../api/assetTransformer.js";
import { Status } from "./types.js";
import { Messages, IpcMessage } from "./types.js";

const handlers: Messages = {
  async RenderPage(file) {
    const data = await renderPage(file);
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
  async ClearAssetTransformCache(filename) {
    clearAssetTransformCache(filename);
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
