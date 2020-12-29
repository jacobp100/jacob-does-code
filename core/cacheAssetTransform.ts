import { Content, assetPath } from "./useContent";

const fileAssetCache = new Map<string, Map<symbol, any>>();

type Fn<T> = (content: Content, src: string) => T;

export default function cacheAssetTransform<T>(fn: Fn<T>) {
  const symbol = Symbol("cache");

  return (content: Content, src: string): T => {
    const assetFilename = assetPath(src);

    content.dependencies.add(assetFilename);

    let assetCache = fileAssetCache.get(assetFilename);
    const cached = assetCache?.get(symbol);

    if (cached != null) {
      return cached;
    } else if (assetCache == null) {
      assetCache = new Map<symbol, any>();
      fileAssetCache.set(src, assetCache);
    }

    const value = fn(content, src);
    assetCache.set(symbol, value);

    return value;
  };
}

export const clearFileAssetCache = (src: string) => {
  fileAssetCache.delete(src);
};
