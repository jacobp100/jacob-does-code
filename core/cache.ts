export default <I, O>(fn: (input: I) => O) => {
  const cache = new Map<I, O>();

  return (input: I) => {
    const cached = cache.get(input);
    if (cached != null) {
      return cached;
    } else {
      const value = fn(input);
      cache.set(input, value);
      return value;
    }
  };
};

export function cache2<I1, I2, O>(fn: (i1: I1, i2: I2) => O) {
  const cache = new Map<I1, Map<I2, O>>();

  return (i1: I1, i2: I2) => {
    let cached = cache.get(i1)?.get(i2);

    if (cached != null) {
      return cached;
    }

    const value = fn(i1, i2);

    let topCache = cache.get(i1);
    if (topCache == null) {
      topCache = new Map<I2, O>();
      cache.set(i1, topCache);
    }
    topCache.set(i2, value);

    return value;
  };
}
