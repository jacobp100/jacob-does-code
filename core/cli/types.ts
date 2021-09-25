import type { File } from "../util/projectFiles";
import type { AssetTransformCache } from "../api/assetTransformer";

export type Messages = {
  RenderPage: (file: File) => Promise<{
    dependencies: string[];
  }>;
  EncodeAssetTransformCache: () => Promise<AssetTransformCache>;
  RestoreAssetTransformCache: (
    assetTransformCache: AssetTransformCache
  ) => Promise<void>;
  ClearAssetTransformCache: (filename: string) => Promise<void>;
  GenerateCssStats: () => Promise<{
    unusedClassNames: string[];
    undeclaredClassNames: string[];
  }>;
  ResetCssStats: () => Promise<void>;
};

export type IpcMessage = { type: keyof Messages; payload: any };
