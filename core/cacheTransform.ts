import { Content, createContentContext } from "./useContent";

type FileCacheKey = string;

type CacheResult = {
  output: any;
  dependencies: Set<string>;
};

const cache = new Map<FileCacheKey, CacheResult>();
const cacheFileDependencies = new Map<string, Set<FileCacheKey>>();

type Fn<T> = (content: Content, ...args: any[]) => T;

let keyId = 0;
let generateKey = () => {
  let output = keyId.toString(16).padStart(4, "0");
  keyId += 1;
  return output;
};

export const cacheTransform = <T>(fn: Fn<T>) => {
  const baseKey = generateKey();

  return (content: Content, ...args: any[]): T => {
    const key = `${baseKey}/${args.map((x) => JSON.stringify(x)).join(":")}`;

    const cached = cache.get(key);

    const addDependencies = (dependencies: Set<string>) => {
      dependencies.forEach((dependency) => {
        content.dependencies.add(dependency);
      });
    };

    if (cached != null) {
      addDependencies(cached.dependencies);
      return cached.output;
    } else {
      const emptyContent = createContentContext();

      const output = fn(emptyContent, ...args);
      const dependencies = emptyContent.dependencies;

      addDependencies(dependencies);

      dependencies.forEach((dependency) => {
        let cachedDependency = cacheFileDependencies.get(dependency);

        if (cachedDependency == null) {
          cachedDependency = new Set();
          cacheFileDependencies.set(dependency, cachedDependency);
        }

        cachedDependency.add(key);
      });

      cache.set(key, { output, dependencies });

      return output;
    }
  };
};

export const clearFileCache = (src: string) => {
  cacheFileDependencies.get(src)?.forEach((key) => {
    cache.delete(key);
  });

  cacheFileDependencies.delete(src);
};
