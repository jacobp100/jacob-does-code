if (location.search.length > 1) {
  const container = document.getElementById("computation");
  container.removeAttribute("hidden");

  const loadHtml = fetch(
    require.resolve("/assets/technicalc/computation.html")
  ).then((res) => res.text());

  const loadStyles = new Promise((res) => {
    const styles = document.createElement("link");
    styles.setAttribute("rel", "stylesheet");
    styles.setAttribute(
      "href",
      require.resolve("/assets/technicalc/computation.css")
    );
    styles.addEventListener("load", () => res());
    document.head.append(styles);
  });

  const loadFullJs = import("/assets/technicalc/computation.js");

  const worker = new Worker(require.resolve("/assets/technicalc/worker.js"));

  document.addEventListener("click", (e) => {
    const { target } = e;
    if (target.classList.contains(CSS_CLASSES["computation__close"])) {
      container.setAttribute("hidden", "");
    } else if (
      target.classList.contains(CSS_CLASSES["computation__toggle-display-mode"])
    ) {
      container.classList.toggle(CSS_CLASSES["computation--form-hidden"]);
    }
  });

  const loadContent = Promise.all([loadHtml, loadStyles]).then(([markup]) => {
    container.innerHTML = markup;
  });

  Promise.all([loadFullJs, loadContent]).then(([computationModule]) => {
    computationModule.default({ container, worker });
  });
}
