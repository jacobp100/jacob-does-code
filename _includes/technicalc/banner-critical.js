if (location.search.length > 1) {
  const computationContainer = document.getElementById("computation");
  computationContainer.removeAttribute("hidden");

  const loadHtml = fetch("/technicalc-banner").then((res) => res.text());

  const loadStyles = new Promise((res) => {
    const styles = document.createElement("link");
    styles.setAttribute("rel", "stylesheet");
    styles.setAttribute("href", "/assets/technicalc/computation.css");
    styles.addEventListener("load", () => res());
    document.head.append(styles);
  });

  const loadFullJs = import("/assets/technicalc/computation.js");

  const worker = new Worker("/assets/technicalc/worker.js");

  document.addEventListener("click", (e) => {
    const { target } = e;
    if (target.classList.contains("computation__close")) {
      computationContainer.setAttribute("hidden", "");
    } else if (target.classList.contains("computation__toggle-display-mode")) {
      computationContainer.classList.toggle("computation--form-hidden");
    }
  });

  const loadBanner = Promise.all([loadHtml, loadStyles]).then(([markup]) => {
    computationContainer.innerHTML = markup;
  });

  Promise.all([loadFullJs, loadBanner]).then(([computationModule]) => {
    computationModule.default({ container: computationContainer, worker });
  });
}
