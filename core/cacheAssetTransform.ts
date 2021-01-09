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

export const clearFileAssetCache = (src: string) => {
  fileAssetCache.delete(src);
};
