/* global MathJax, Qs, Client */
import "/assets/technicalc/dist/client.js";
import "https://unpkg.com/qs@6.9.4/dist/qs.js";

const { Editor, Value, Work } = Client;

const computationContainer = document.getElementById("computation");
const inputContainer = computationContainer.querySelector(
  ".computation__input"
);
const resultContainer = computationContainer.querySelector(
  ".computation__result"
);
const form = computationContainer.querySelector(".computation__form");

/* Load styles */
const technicalcStyles = document.createElement("link");
technicalcStyles.setAttribute("rel", "stylesheet");
technicalcStyles.setAttribute("href", "/assets/technicalc/computation.css");
technicalcStyles.addEventListener("load", () => {
  computationContainer.removeAttribute("hidden");
});
document.head.append(technicalcStyles);

/* Load MathJax */
const mathJaxScript = document.createElement("script");
mathJaxScript.setAttribute("id", "MathJax-script");
mathJaxScript.setAttribute("async", "");
mathJaxScript.setAttribute(
  "src",
  "https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-svg.js"
);
document.body.append(mathJaxScript);

const getFormattingOptions = () => {
  const formData = new FormData(form);
  const style = {
    style: formData.get("style"),
    precision: Number(formData.get("precision")),
    digitGrouping: formData.get("digitGrouping") != null,
  };
  return style;
};

const setContainerMml = (element, mml) => {
  element.classList.remove("computation--loading");
  element.innerHTML = mml;

  if (window.MathJax != null) {
    MathJax.typeset();
  }
};

const setContainerError = (element) => {
  element.classList.remove("computation--loading");
  element.innerHTML = "Error";
};

const setInput = (input) => {
  const inputMml = Editor.toMml(input, getFormattingOptions());
  setContainerMml(inputContainer, inputMml);
};

const setResult = (result) => {
  const resultMml = Value.toMml(result, getFormattingOptions());
  setContainerMml(resultContainer, resultMml);
};

const search = window.location.search.slice("?".length);
computationContainer
  .querySelector(".computation__open-in-app")
  .setAttribute("href", `technicalc://editor?${search}`);

const { elements = "", unitConversions, customAtoms, variables } = Qs.parse(
  search
);

const worker = new Worker("/assets/technicalc/worker.js");

const decodeArray = (array) => (array != null ? JSON.parse(array) : []);

const decodeCustomAtoms = (customAtoms) =>
  customAtoms.map(({ mml, value }) => ({ mml, value: Value.decode(value) }));

const input =
  elements.length !== 0
    ? Editor.decode({
        elements,
        unitConversions: decodeArray(unitConversions),
        customAtoms: decodeCustomAtoms(decodeArray(customAtoms)),
        variables: decodeArray(variables),
      })
    : null;

if (input != null) {
  setInput(input);
} else {
  setContainerError(inputContainer);
}

const [parsingError, parsedValue] =
  input != null ? Editor.parse(input) : [null, null];
if (parsingError == null && parsedValue != null) {
  const work = Work.calculate(parsedValue);
  worker.postMessage(work);
} else {
  setContainerError(resultContainer);
}

let result;
worker.onmessage = (e) => {
  const data = e.data;
  if (data.error === true) {
    setContainerError(resultContainer);
  } else {
    result = Value.decode(data.results[0]);
    setResult(result);
  }
};

form.addEventListener("change", () => {
  setInput(input);

  if (result != null) {
    setResult(result);
  }
});

document.addEventListener("click", (e) => {
  const { target } = e;
  if (target.classList.contains("computation__close")) {
    computationContainer.setAttribute("hidden", "");
  } else if (target.classList.contains("computation__toggle-display-mode")) {
    computationContainer.classList.toggle("computation--form-hidden");
  }
});
