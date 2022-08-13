import { Content, createContentContext } from "./useContent";

type FileCacheKey = string;

type CacheResult = {
  output: any;
  dependencies: Set<string>;
  encodable: boolean;
};

type PromiseResolution<T> =
  | { resolved: false; promise: Promise<void> }
  | { resolved: true; value: T };

const cache = new Map<FileCacheKey, PromiseResolution<CacheResult>>();

let keyId = 0;
let generateKey = () => {
  let output = keyId.toString(16).padStart(4, "0");
  keyId += 1;
  return output;
};

type Options = { cacheKey?: string };

export const assetTransform = <T, Args extends any[] = any[]>(
  fn: (content: Content, ...args: Args) => T | Promise<T>,
  options: Options = {}
) => {
  const baseKey = options.cacheKey ?? generateKey();
  const encodable = options.cacheKey != null;

  return (content: Content, ...args: Args): T => {
    const key = `${baseKey}/${args.map((x) => JSON.stringify(x)).join(":")}`;

    const cached = cache.get(key);

    const addDependencies = (dependencies: Set<string>) => {
      dependencies.forEach((dependency) => {
        content.dependencies.add(dependency);
      });
    };

    if (cached?.resolved === true) {
      const { output, dependencies } = cached.value;
      addDependencies(dependencies);
      return output;
    } else if (cached?.resolved === false) {
      throw cached.promise;
    }

    const emptyContent = createContentContext();

    const promiseOrValue = fn(emptyContent, ...args);

    const resolveAndCacheOutput = (output: T) => {
      const dependencies = emptyContent.dependencies;

      addDependencies(dependencies);

      cache.set(key, {
        resolved: true,
        value: { output, dependencies, encodable },
      });

      return output;
    };

    if (!(promiseOrValue instanceof Promise)) {
      return resolveAndCacheOutput(promiseOrValue);
    }

    const promise = promiseOrValue.then(
      (output) => {
        if (cache.get(key) === pendingPromiseResolution) {
          resolveAndCacheOutput(output);
        } else {
          throw new Error("Aborted");
        }
      },
      (e) => {
        console.error("Error in assetTransformer transform");
        console.error(e);
        throw e;
      }
    );

    const pendingPromiseResolution: PromiseResolution<CacheResult> = {
      resolved: false,
      promise,
    };

    cache.set(key, pendingPromiseResolution);

    throw promise;
  };
};

export const clearAssetTransformCacheForFile = (filename: string) => {
  const cacheKeys = new Set<string>();

  cache.forEach((promiseResult, cacheKey) => {
    const value = promiseResult.resolved ? promiseResult.value : undefined;
    if (value?.dependencies.has(filename) === true) {
      cacheKeys.add(cacheKey);
    }
  });

  cacheKeys.forEach((cacheKey) => cache.delete(cacheKey));
};

export type AssetTransformCacheEntry = {
  output: any;
  dependencies: string[];
};

export type AssetTransformCache = Record<string, AssetTransformCacheEntry>;

export const encodeAssetTransformCache = (): AssetTransformCache => {
  const output: AssetTransformCache = {};

  cache.forEach((promiseResult, cacheKey) => {
    const value = promiseResult.resolved ? promiseResult.value : undefined;
    if (value != null && value.encodable) {
      output[cacheKey] = {
        output: value.output,
        dependencies: Array.from(value.dependencies),
      };
    }
  });

  return output;
};

export const restoreAssetTransformCache = (
  assetTransformCache: AssetTransformCache
) => {
  Object.entries(assetTransformCache).forEach(([cacheKey, cacheEntry]) => {
    const { output } = cacheEntry;
    const dependencies = new Set(cacheEntry.dependencies);

    cache.set(cacheKey, {
      resolved: true,
      value: { output, dependencies, encodable: true },
    });
  });
};
