// @ts-ignore
import cssClassGenerator from "css-class-generator";
import dev from "./dev";

const variables = new Map<string, string>();
const classNames = new Map<string, string>();

const getGeneratedName = (store: Map<string, string>, input: string) => {
  if (dev) {
    return input + "_";
  }

  if (store.has(input)) {
    return store.get(input);
  } else {
    const index = store.size;
    const output = cssClassGenerator(index);
    store.set(input, output);
    return output;
  }
};

export const variable = (input: string) => {
  if (!input.startsWith("--")) {
    throw new Error(`Expected variable "${input}" to start with --`);
  }

  const output = `--${getGeneratedName(variables, input.slice("--".length))}`;
  return output;
};

export const className = (input: string) => getGeneratedName(classNames, input);
