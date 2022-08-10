// @ts-expect-error
import cssClassGenerator from "css-class-generator";
import dev from "../util/dev";

const variablesStore = new Map<string, string>();
const classNamesStore = new Map<string, string>();

const getGeneratedName = (store: Map<string, string>, input: string) => {
  if (dev) {
    /* Make sure stuff breaks if you don't follow proper protocols when using
     * CSS class names
     *
     * But also make sure the user can actually read the class names in
     * development
     */
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

export const cssVariable = (input: string) => {
  if (!input.startsWith("--")) {
    throw new Error(`Expected variable "${input}" to start with --`);
  }

  const output = `--${getGeneratedName(
    variablesStore,
    input.slice("--".length)
  )}`;
  return output;
};

export enum Origin {
  CSS,
  Asset,
}

const classNamesInAssets = new Set<string>();
const classNamesInCss = new Set<string>();

export const classNameForOrigin = (input: string, origin = Origin.Asset) => {
  if (origin === Origin.CSS) {
    classNamesInCss.add(input);
  } else {
    classNamesInAssets.add(input);
  }

  return getGeneratedName(classNamesStore, input);
};

export const className = (input: string) => classNameForOrigin(input);

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

const subtract = (a: Set<string>, b: Set<String>) => {
  const out: string[] = [];
  a.forEach((className) => {
    if (!b.has(className)) {
      out.push(className);
    }
  });
  return out;
};

export const generateCssStats = () => {
  const unusedClassNames = subtract(classNamesInCss, classNamesInAssets);
  const undeclaredClassNames = subtract(classNamesInAssets, classNamesInCss);

  return { unusedClassNames, undeclaredClassNames };
};

export const resetCssStats = () => {
  classNamesInCss.clear();
  classNamesInAssets.clear();
};
