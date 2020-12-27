const modal = document.querySelector("." + CSS_CLASSES["lightbox__modal"]);
const video = document.querySelector("." + CSS_CLASSES["lightbox__video"]);

const toggleModal = (open) => {
  modal.classList.toggle(CSS_CLASSES["lightbox__modal--open"], open);

  document.documentElement.classList.toggle(
    CSS_CLASSES["lightbox-modal-open"],
    open
  );
};

let scrollX = 0;
let scrollY = 0;

document
  .querySelector("." + CSS_CLASSES["lightbox__button"])
  .addEventListener("click", () => {
    scrollX = window.scrollX;
    scrollY = window.scrollY;
    toggleModal(true);
    window.scrollTo(0, 0);
  });

document
  .querySelector("." + CSS_CLASSES["lightbox__close"])
  .addEventListener("click", () => {
    toggleModal(false);
    video.pause();
    window.scrollTo(scrollX, scrollY);
  });
