// @ts-ignore
import { minify } from "uglify-js";
import dev from "../../core/dev";

export default (input: string): string => {
  if (dev) {
    return input;
  }

  const { code, error } = minify(input);

  if (error) {
    throw new Error(error);
  }

  return code;
};
