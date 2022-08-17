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
   * @param {T} value
   * @returns {Result<T, null>}
   * */
  const resultOfOption = (value) =>
    value != null ? { ok: true, value } : { ok: false, error: null };

  /** @type {HTMLFormElement} */
  const form = container.querySelector("." + className("computation__form"));

  /**
   * @template T
   * @param {HTMLElement | null} element
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
    const formattingOptions = {
      style: formData.get("style"),
      precision: Number(formData.get("precision")),
      digitGrouping: formData.get("digitGrouping") != null,
      base: Number(formData.get("base")),
    };

    const mml = formatter(result.value, formattingOptions);
    element.innerHTML = mml;

    MathJax.typeset();
  };

  const setInput = setComputationRow(
    container.querySelector("." + className("computation__input")),
    Elements.toMml
  );

  const setResult = setComputationRow(
    container.querySelector("." + className("computation__result")),
    Value.toMml
  );

  const search = window.location.search.slice("?".length);
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
  if (parseResult.ok) {
    const work = Work.make(
      { angleMode: "radian" },
      undefined,
      Work.calculate(parseResult.value)
    );
    worker.postMessage(work);
  } else {
    setResult(result);
  }

  /** @param {MessageEvent<any>} e */
  worker.onmessage = (e) => {
    const results = e.data;
    result = resultOfOption(Value.decode(results[0]));
    setResult(result);
  };

  worker.onerror = () => {
    setResult(resultOfOption(undefined));
  };

  form.addEventListener("change", () => {
    setInput(input);
    setResult(result);
  });
};
