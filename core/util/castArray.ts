export default <T>(x: T[] | T | null | undefined): T[] => {
  if (Array.isArray(x)) {
    return x;
  } else if (x != null) {
    return [x];
  } else {
    return [];
  }
};
