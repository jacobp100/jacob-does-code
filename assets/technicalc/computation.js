// @ts-check
/// <reference path="./computation.d.ts" />
import "https://unpkg.com/mathjax@3.1.0/es5/mml-svg.js";
import "/assets/technicalc/dist/client.min.js";

/** @param {{container: HTMLElement, worker: Worker}} params */
export default ({ container, worker }) => {
  const { Elements, Value, Work } = Client;

  /**
   * @template T
   * @param {T} value
   * @returns {Result<T, null>}
   * */
  const resultOfOption = (value) =>
    value != null ? { type: "ok", value } : { type: "error", error: null };

  /** @type {HTMLFormElement} */
  const form = container.querySelector("." + CSS_CLASSES["computation__form"]);

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

    element.classList.remove(CSS_CLASSES["computation--loading"]);

    if (result.type === "error") {
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
    container.querySelector("." + CSS_CLASSES["computation__input"]),
    Elements.toMml
  );

  const setResult = setComputationRow(
    container.querySelector("." + CSS_CLASSES["computation__result"]),
    Value.toMml
  );

  const search = window.location.search.slice("?".length);
  container
    .querySelector("." + CSS_CLASSES["computation__open-in-app"])
    .setAttribute("href", `technicalc://editor?${search}`);

  const input = resultOfOption(
    search.length !== 0 ? Elements.decode(search) : undefined
  );

  setInput(input);

  /** @type {Result<Client.ValueResolved, null> | null} */
  let result = null;

  const [parsingError, parsedValue] =
    input.type === "ok" ? Elements.parse(input.value) : [null, null];
  if (parsingError == null && parsedValue != null) {
    const work = Work.calculate(parsedValue);
    worker.postMessage(work);
  } else {
    result = resultOfOption(undefined);
    setResult(result);
  }

  /** @param {MessageEvent<any>} e */
  worker.onmessage = (e) => {
    const data = e.data;
    result = resultOfOption(
      data.didError !== true ? Value.decode(data.results[0]) : undefined
    );
    setResult(result);
  };

  form.addEventListener("change", () => {
    setInput(input);
    setResult(result);
  });
};
