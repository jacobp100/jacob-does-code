import type { File } from "../util/projectFiles";
import type { AssetTransformCache } from "../api/assetTransformer";

export enum Status {
  Ready = "Readt",
}

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

export type StatusMessage = { type: Status; payload: null };
export type IpcMessage = { type: keyof Messages; payload: any };
export type AnyMessage = StatusMessage | IpcMessage;
