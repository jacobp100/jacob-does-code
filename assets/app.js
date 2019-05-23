let restore = null;

const getModal = () => {
  let modal = document.querySelector(".app__modal");

  if (modal == null) {
    modal = document.createElement("div");
    modal.classList.add("app__modal");
    document.body.appendChild(modal);
  }

  return modal;
};

const showModal = target => {
  const source = target.cloneNode();
  source.removeAttribute("data-modal");

  const modal = getModal();
  if (modal.lastChild != null) {
    modal.replaceChild(source, modal.lastChild);
  } else {
    modal.appendChild(source);
  }

  modal.classList.add("app__modal--active");

  restore = { scrollY: window.scrollY };
  document.documentElement.classList.add("no-scroll");
};

const hideModal = () => {
  const modal = getModal();

  document.documentElement.classList.remove("no-scroll");
  if (restore != null) window.scrollTo(0, restore.scrollY);

  modal.classList.remove("app__modal--active");
};

window.addEventListener("click", e => {
  let current = e.target;

  while (current != null) {
    if (current.hasAttribute("data-modal")) {
      showModal(current);
      return;
    } else if (current.classList.contains("app__modal")) {
      hideModal();
      return;
    }

    current = current.parentNode;
  }
});
