let modal;
let scrollY = 0;

const ensureModal = () => {
  if (modal == null) {
    modal = new Image();
    modal.classList.add("app__modal");
    document.body.appendChild(modal);
  }
};

window.addEventListener("click", e => {
  if (e.target.classList.contains("app__slide")) {
    ensureModal();
    modal.setAttribute("src", e.target.getAttribute("src"));
  } else if (e.target.classList.contains("app__modal")) {
    ensureModal();
  } else {
    return;
  }

  if (!modal.classList.contains("app__modal--active")) {
    scrollY = window.scrollY;
    document.documentElement.classList.add("no-scroll");
    modal.classList.add("app__modal--active");
  } else {
    document.documentElement.classList.remove("no-scroll");
    window.scrollTo(0, scrollY);
    modal.classList.remove("app__modal--active");
  }
});
