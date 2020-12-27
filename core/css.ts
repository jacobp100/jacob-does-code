// @ts-ignore
import cssClassGenerator from "css-class-generator";
import dev from "./dev";

const variablesStore = new Map<string, string>();
const classNamesStore = new Map<string, string>();

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

  const output = `--${getGeneratedName(
    variablesStore,
    input.slice("--".length)
  )}`;
  return output;
};

export const className = (input: string) =>
  getGeneratedName(classNamesStore, input);

export type ClassNames = string | boolean | null | undefined | ClassNames[];

const flatten = (input: ClassNames): string[] => {
  if (Array.isArray(input)) {
    return input.flatMap(flatten);
  } else if (typeof input === "string" && input.length > 0) {
    return input.split(/\s+/);
  } else {
    return [];
  }
};

export const classNames = (...input: ClassNames[]) => {
  const out = input.flatMap(flatten).map(className).join(" ");
  return out.length > 0 ? out : undefined;
};
