// @ts-ignore
import { className } from "super-ssg";

const modal = document.querySelector("." + className("lightbox__modal"));
const video = document.querySelector("." + className("lightbox__video"));

const toggleModal = (open) => {
  if (open) {
    video.setAttribute("preload", "auto");
    modal.removeAttribute("hidden");
  } else {
    modal.setAttribute("hidden", "");
  }

  document.documentElement.classList.toggle(
    className("lightbox-modal-open"),
    open
  );
};

let scrollX = 0;
let scrollY = 0;

document
  .querySelector("." + className("lightbox__button"))
  .addEventListener("click", () => {
    scrollX = window.scrollX;
    scrollY = window.scrollY;
    toggleModal(true);
    window.scrollTo(0, 0);
  });

document
  .querySelector("." + className("lightbox__close"))
  .addEventListener("click", () => {
    toggleModal(false);
    video.pause();
    window.scrollTo(scrollX, scrollY);
  });
