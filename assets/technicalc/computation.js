// @ts-check
/// <reference path="./computation.d.ts" />
import "https://unpkg.com/mathjax@3.1.0/es5/mml-svg.js";
import "/assets/technicalc/dist/client.min.js";
// @ts-ignore
import { className } from "super-ssg";

/** @param {{container: HTMLElement, worker: Worker}} params */
export default ({ container, worker }) => {
  const { Elements, Value, Work } = Client;

  /**
   * @template T
   * @param {T | undefined} value
   * @returns {Result<T, null>}
   * */
  const resultOfOption = (value) =>
    value != null ? { ok: true, value } : { ok: false, error: null };

  /** @type {HTMLFormElement} */
  // @ts-expect-error
  const form = container.querySelector("." + className("computation__form"));

  /**
   * @template T
   * @param {HTMLElement} element
   * @param {(arg0: T, arg1: any) => any} formatter
   * @returns {function(Result<T, any> | null): void}
   */
  const setComputationRow = (element, formatter) => (result) => {
    if (result == null) {
      return;
    }

    element.classList.remove(className("computation--loading"));

    if (!result.ok) {
      element.innerHTML = "Error";
      return;
    }

    const formData = new FormData(form);
    // @ts-expect-error
    const [decimalSeparator, groupingSeparator] = formData.get("numberFormat");
    const formattingOptions = {
      style: formData.get("style"),
      precision: Number(formData.get("precision")),
      decimalSeparator,
      groupingSeparator,
      base: Number(formData.get("base")),
    };

    const mml = formatter(result.value, formattingOptions);
    element.innerHTML = mml;

    MathJax.typeset();
  };

  const setInput = setComputationRow(
    // @ts-expect-error
    container.querySelector("." + className("computation__input")),
    Elements.toMml
  );

  const setResult = setComputationRow(
    // @ts-expect-error
    container.querySelector("." + className("computation__result")),
    Value.toMml
  );

  const search = window.location.search.slice("?".length);
  // @ts-expect-error
  container
    .querySelector("." + className("computation__open-in-app"))
    .setAttribute("href", `technicalc://editor?${search}`);

  const input = resultOfOption(
    search.length !== 0 ? Elements.decode(search) : undefined
  );

  setInput(input);

  /** @type {Result<Client.Value.T, null> | null} */
  let result = null;

  /** @type {Result<Client.Work.EquationArg, any>} */
  const parseResult = input.ok
    ? Elements.parse(input.value)
    : { ok: false, error: -1 };
  /** @type {Client.Work.T | undefined} */
  let work;
  if (parseResult.ok) {
    work = Work.make(
      { angleMode: "radian" },
      undefined,
      Work.calculate(parseResult.value)
    );
    worker.postMessage(Work.encodeInput(work));
  } else {
    setResult(result);
  }

  /** @param {MessageEvent<string>} e */
  worker.onmessage = (e) => {
    result = resultOfOption(
      work != null ? Work.decodeOutput(work, e.data) : undefined
    );
    setResult(result);
  };

  worker.onerror = () => {
    result = null;
    setResult(result);
  };

  form.addEventListener("change", () => {
    setInput(input);
    setResult(result);
  });
};
