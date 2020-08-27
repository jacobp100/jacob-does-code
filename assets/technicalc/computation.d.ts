type Result<Value, Error> =
  | { type: "ok"; value: Value }
  | { type: "error"; error: Error };

interface Window {
  MathJax: {typeset: (() => void) | undefined} | undefined;
}

declare namespace Qs {
  const parse: (input: string) => any;
}

declare namespace Client {
  type Elements = "ClientElements";
  type ValueUnresolved = "ClientValueUnresolved";
  type ValueResolved = "ClientValueResolved";
  type Work = "ClientWork";

  const Editor: {
    toMml: (elements: Elements) => string;
    parse: (elements: Elements) => [null, ValueUnresolved] | [any, null];
    decode: (encoded: {
      elements: string;
      unitConversions: any[];
      customAtoms: any[];
      variables: any[];
    }) => Elements | undefined;
  };
  const Value: {
    toMml: (value: ValueResolved) => string;
    decode: (encoded: any) => ValueResolved;
  };
  const Work: {
    calculate: (value: ValueUnresolved) => Work;
  };
}

declare const TechnicalcWorker: Worker;
