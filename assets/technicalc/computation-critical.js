// @ts-ignore
import { className } from "super-ssg";

if (location.search.length > 1) {
  const container = document.getElementById("computation");
  container.removeAttribute("hidden");

  const loadHtml = fetch("/computation").then((res) => res.text());

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

  const worker = new Worker(
    require.resolve("/assets/technicalc/dist/worker.min.js")
  );

  document.addEventListener("click", (e) => {
    const { target } = e;
    if (target.classList.contains(className("computation__close"))) {
      container.setAttribute("hidden", "");
    } else if (
      target.classList.contains(className("computation__toggle-display-mode"))
    ) {
      container.classList.toggle(className("computation--form-hidden"));
    }
  });

  const loadContent = Promise.all([loadHtml, loadStyles]).then(([markup]) => {
    container.innerHTML = markup;
  });

  Promise.all([loadFullJs, loadContent]).then(([computationModule]) => {
    computationModule.default({ container, worker });
  });
}
