export type Config = {
  pages?: string[] | string;
  urlForPage?: (filename: string) => string;
};
