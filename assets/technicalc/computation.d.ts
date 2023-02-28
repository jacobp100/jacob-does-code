declare const CSS_VARS: Record<string, string>;
declare const CSS_CLASSES: Record<string, string>;

type Result<Value, Error> =
  | { ok: true; value: Value }
  | { ok: false; error: Error };

declare namespace MathJax {
  const typeset: () => void;
}

declare namespace Client {
  module Elements {
    type T = { _: "Elements.T" };
    const decode: (encoded: string) => T[] | undefined;
    const toMml: (elements: T[]) => string;
    const parse: (elements: T[]) => Result<Work.EquationArg, number>;
  }
  module Value {
    type T = { _: "Value.T" };
    const toMml: (value: T) => string;
    const decode: (encoded: any) => T | undefined;
  }
  module Work {
    type T = { _: "Work.T" };
    type EquationArg = { _: "Work.EquationArg" };
    type Equation = { _: "Work.Equation" };

    const calculate: (input: EquationArg) => Equation;
    const make: (
      config: { angleMode: "radian" },
      context: undefined,
      work: Equation
    ) => T;
    const encodeInput: (input: T) => string;
    const decodeOutput: (work: T, encoded: string) => Value.T | undefined;
  }
}

declare const TechnicalcWorker: Worker;
