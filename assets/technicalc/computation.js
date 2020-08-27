// @ts-check
/// <reference path="./computation.d.ts" />
import "https://unpkg.com/mathjax@3.1.0/es5/mml-svg.js";
import "https://unpkg.com/qs@6.9.4/dist/qs.js";
import "/assets/technicalc/dist/client.js";

const { Editor, Value, Work } = Client;

const container = document.getElementById("computation");
/** @type {HTMLFormElement} */
const form = container.querySelector(".computation__form");

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

  element.classList.remove("computation--loading");

  if (result.type === "error") {
    element.innerHTML = "Error";
    return;
  }

  const formData = new FormData(form);
  const formattingOptions = {
    style: formData.get("style"),
    precision: Number(formData.get("precision")),
    digitGrouping: formData.get("digitGrouping") != null,
  };

  const mml = formatter(result.value, formattingOptions);
  element.innerHTML = mml;

  const MathJax = window.MathJax;
  if (MathJax != null && MathJax.typeset != null) {
    MathJax.typeset();
  }
};

const setInput = setComputationRow(
  container.querySelector(".computation__input"),
  Editor.toMml
);

const setResult = setComputationRow(
  container.querySelector(".computation__result"),
  Value.toMml
);

const search = window.location.search.slice("?".length);
container
  .querySelector(".computation__open-in-app")
  .setAttribute("href", `technicalc://editor?${search}`);

const { elements, unitConversions, customAtoms, variables } = Qs.parse(search);

/** @param {string} array */
const decodeArray = (array) => (array != null ? JSON.parse(array) : []);

/** @type {Client.Elements | undefined} */
const inputValue =
  typeof elements === "string" && elements.length !== 0
    ? Editor.decode({
        elements,
        unitConversions: decodeArray(unitConversions),
        customAtoms: decodeArray(customAtoms),
        variables: decodeArray(variables),
      })
    : undefined;

/** @type {Result<Client.Elements, null>} */
const input =
  inputValue != null
    ? { type: "ok", value: inputValue }
    : { type: "error", error: null };

setInput(input);

const [parsingError, parsedValue] =
  input.type === "ok" ? Editor.parse(input.value) : [null, null];
if (parsingError == null && parsedValue != null) {
  const work = Work.calculate(parsedValue);
  TechnicalcWorker.postMessage(work);
}

/** @type {Result<Client.ValueResolved, null> | null} */
let result = null;

/** @param {ServiceWorkerMessageEvent} e */
TechnicalcWorker.onmessage = (e) => {
  const data = e.data;
  result =
    data.error !== true
      ? { type: "ok", value: Value.decode(data.results[0]) }
      : { type: "error", error: null };
  setResult(result);
};

form.addEventListener("change", () => {
  setInput(input);
  setResult(result);
});
