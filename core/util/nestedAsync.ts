export default async <T>(
  fn: (asyncTransform: (transform: () => Promise<void>) => void) => T
): Promise<T> => {
  const promises: Promise<void>[] = [];

  const asyncTransform = (transform: () => Promise<void>) => {
    promises.push(transform());
  };

  const out = fn(asyncTransform);

  await Promise.all(promises);

  return out;
};
