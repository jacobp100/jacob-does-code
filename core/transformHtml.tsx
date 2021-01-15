// @ts-ignore
import posthtml from "posthtml";
// @ts-ignore
import minifier from "posthtml-minifier";
// @ts-ignore
import { Content } from "./useContent";
import { classNames } from "./css";
// import { isReactComponent } from "./htmlUtil";

const transformClassNames = () => (tree: any) =>
  tree.walk((node: any) => {
    if (node.attrs?.class != null) {
      node.attrs.class = classNames(node.attrs.class);
    }

    return node;
  });

export default (_content: Content, input: string) => {
  const postHtmlResult = posthtml()
    .use(transformClassNames())
    .use(minifier({ collapseWhitespace: true, removeComments: true }))
    .process(input, { sync: true });

  // @ts-ignore
  return postHtmlResult.html as string;
};
