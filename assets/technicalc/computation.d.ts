declare const CSS_VARS: Record<string, string>;
declare const CSS_CLASSES: Record<string, string>;

type Result<Value, Error> =
  | { type: "ok"; value: Value }
  | { type: "error"; error: Error };

declare namespace MathJax {
  const typeset: () => void;
}

declare namespace Client {
  type Element = "ClientElement";
  type ValueUnresolved = "ClientValueUnresolved";
  type ValueResolved = "ClientValueResolved";
  type Work = "ClientWork";

  const Elements: {
    decode: (encoded: string) => Element[] | undefined;
    toMml: (elements: Element[]) => string;
    parse: (elements: Element[]) => [null, ValueUnresolved] | [any, null];
  };
  const Value: {
    toMml: (value: ValueResolved) => string;
    decode: (encoded: any) => ValueResolved | undefined;
  };
  const Work: {
    calculate: (value: ValueUnresolved) => Work;
  };
}

declare const TechnicalcWorker: Worker;
