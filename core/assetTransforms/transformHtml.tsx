import posthtml from "posthtml";
// @ts-expect-error
import minifier from "posthtml-minifier";
import { classNames } from "../css";
import type { Content } from "../useContent";

const transformClassNames = () => (tree: any) =>
  tree.walk((node: any) => {
    if (node.attrs?.class != null) {
      node.attrs.class = classNames(node.attrs.class);
    }

    return node;
  });

export default async (_content: Content, input: string) => {
  const postHtmlResult = await posthtml()
    .use(transformClassNames())
    .use(minifier({ collapseWhitespace: true, removeComments: true }))
    .process(input);

  return postHtmlResult.html;
};
