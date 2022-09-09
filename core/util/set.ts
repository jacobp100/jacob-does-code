export const subtract = <T>(a: Set<T>, b: Set<T>) => {
  const out = new Set<T>();
  a.forEach((x) => {
    if (!b.has(x)) {
      out.add(x);
    }
  });
  return out;
};
