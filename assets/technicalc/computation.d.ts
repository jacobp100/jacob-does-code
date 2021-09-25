declare const CSS_VARS: Record<string, string>;
declare const CSS_CLASSES: Record<string, string>;

type Result<Value, Error> =
  | { ok: true; value: Value }
  | { ok: false; error: Error };

declare namespace MathJax {
  const typeset: () => void;
}

declare namespace Client {
  type Element = "ClientElement";
  type ValueUnresolved = "ClientValueUnresolved";
  type ValueResolved = "ClientValueResolved";
  type WorkType = "ClientWorkType";
  type Work = "ClientWork";

  const Elements: {
    decode: (encoded: string) => Element[] | undefined;
    toMml: (elements: Element[]) => string;
    parse: (elements: Element[]) => Result<ValueUnresolved, number>;
  };
  const Value: {
    toMml: (value: ValueResolved) => string;
    decode: (encoded: any) => ValueResolved | undefined;
  };
  const Work: {
    calculate: (input: ValueUnresolved) => WorkType;
    make: (
      config: { angleMode: "radian" },
      context: undefined,
      work: WorkType
    ) => Work;
  };
}

declare const TechnicalcWorker: Worker;
