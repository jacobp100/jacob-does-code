// @ts-ignore
import posthtml from "posthtml";
// @ts-ignore
import minifier from "posthtml-minifier";
import { className } from "./css";
import dev from "./dev";

export default (input: string, { minify = true } = {}) => {
  // FIXME: use posthtml or something
  let html = input.replace(/class="([^"]*)"/g, (_, classes) => {
    const transformed = classes.split(/\s+/g).map(className).join(" ");
    return `class="${transformed}"`;
  });

  if (!dev && minify) {
    const postHtmlResult = posthtml()
      .use(minifier({ collapseWhitespace: true, removeComments: true }))
      .process(html, { sync: true });
    // @ts-ignore
    html = postHtmlResult.html;
  }

  return html;
};
