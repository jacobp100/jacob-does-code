import type { AssetTransformCache } from "../assetTransformer";
import type { Page } from "../usePages";

export enum Status {
  Ready = "Ready",
}

export type Messages = {
  RenderPage: (opts: { page: Page; pages: Page[] }) => Promise<{
    dependencies: string[];
  }>;
  EncodeAssetTransformCache: () => Promise<AssetTransformCache>;
  RestoreAssetTransformCache: (
    assetTransformCache: AssetTransformCache
  ) => Promise<void>;
  ClearAssetTransformCacheForFiles: (
    filenames: string[]
  ) => Promise<{ jsModulesInvalidated: boolean }>;
  GenerateCssStats: () => Promise<{
    unusedClassNames: string[];
    undeclaredClassNames: string[];
  }>;
  ResetCssStats: () => Promise<void>;
};

export type StatusMessage = { type: Status; payload: null };
export type IpcMessage = { type: keyof Messages; payload: any };
export type AnyMessage = StatusMessage | IpcMessage;
