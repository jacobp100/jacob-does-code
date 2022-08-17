// @ts-ignore
import { cssVariable } from "super-ssg";

document.documentElement.style.setProperty(
  cssVariable("--hairline-width"),
  1 / (window.devicePixelRatio || 1) + "px"
);
