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
