import { Content, assetPath } from "./useContent";

const fileAssetCache = new Map<string, Map<string, any>>();

type Fn<T> = (content: Content, src: string, ...unsafeRest: any[]) => T;

let keyId = 0;
let generateKey = () => {
  let output = keyId.toString(16).padStart(4, "0");
  keyId += 1;
  return output;
};

export default function cacheAssetTransform<T>(fn: Fn<T>) {
  const baseKey = generateKey();

  return (content: Content, src: string, ...unsafeRest: any[]): T => {
    const assetFilename = assetPath(src);

    content.dependencies.add(assetFilename);

    let assetCache = fileAssetCache.get(assetFilename);

    const restKey = unsafeRest.map((x) => JSON.stringify(x)).join(":");
    const key = restKey.length > 0 ? `${baseKey}/${restKey}` : baseKey;

    const cached = assetCache?.get(key);

    if (cached != null) {
      return cached;
    } else if (assetCache == null) {
      assetCache = new Map<string, any>();
      fileAssetCache.set(assetFilename, assetCache);
    }

    const value = fn(content, src, ...unsafeRest);
    assetCache.set(key, value);

    return value;
  };
}

type TransformState<T> =
  | { status: "pending"; promise: Promise<T> }
  | { status: "complete"; value: T }
  | { status: "error" };

export function assetTransform<T>(fn: Fn<Promise<T>>) {
  const baseKey = generateKey();

  return (content: Content, src: string, ...unsafeRest: any[]): T => {
    const assetFilename = assetPath(src);

    content.dependencies.add(assetFilename);

    let assetCache = fileAssetCache.get(assetFilename);

    const restKey = unsafeRest.map((x) => JSON.stringify(x)).join(":");
    const key = restKey.length > 0 ? `${baseKey}/${restKey}` : baseKey;

    const cached = (assetCache?.get(key) as any) as TransformState<T>;

    if (cached?.status === "complete") {
      return cached.value;
    } else if (cached?.status === "pending") {
      throw cached.promise;
    } else if (cached?.status === "error") {
      throw new Error("Transform failed");
    }

    if (assetCache == null) {
      assetCache = new Map<string, any>();
      fileAssetCache.set(assetFilename, assetCache);
    }

    const promise = fn(content, src, ...unsafeRest);
    const value: TransformState<T> = { status: "pending", promise };
    assetCache.set(key, value);

    throw promise;
  };
}

export const clearFileAssetCache = (src: string) => {
  fileAssetCache.delete(src);
};
