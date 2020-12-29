import { useContext } from "react";
// @ts-ignore
import posthtml from "posthtml";
// @ts-ignore
import minifier from "posthtml-minifier";
// @ts-ignore
import renderStaticReact from "./posthtml-static-react";
import useContent, { ContentContext } from "./useContent";
import * as components from "./components";
import { classNames } from "./css";
import { isReactComponent } from "./htmlUtil";

const transformClassNames = () => (tree: any) =>
  tree.walk((node: any) => {
    if (!isReactComponent(node.tag) && node.attrs?.class != null) {
      node.attrs.class = classNames(node.attrs.class);
    }

    return node;
  });

export default (input: string) => {
  const contentContext = useContext(ContentContext);
  const content = useContent();

  const includes = new Proxy(
    {},
    {
      has: () => true,
      // @ts-ignore
      get: (_, name) => components[name] ?? content.component(name),
    }
  );

  const Wrapper = ({ children }: any) => (
    <ContentContext.Provider value={contentContext}>
      {children}
    </ContentContext.Provider>
  );

  const postHtmlResult = posthtml()
    .use(transformClassNames())
    .use(renderStaticReact("", includes, { Wrapper }))
    .use(minifier({ collapseWhitespace: true, removeComments: true }))
    .process(input, { sync: true });
  // @ts-ignore
  return postHtmlResult.html as string;
};
