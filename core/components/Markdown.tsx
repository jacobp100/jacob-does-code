// @ts-ignore
import MDX from "@mdx-js/runtime";
import hljs from "highlight.js";
import useContent, { getComponentNames } from "../useContent";
import { classNames } from "../css";
import htmlTags from "./_htmlTags";
import * as builtInComponents from ".";

const htmlComponents = htmlTags.reduce((accum, TagName) => {
  accum[TagName] = (props: any) => (
    <TagName {...props} className={classNames(props.className)} />
  );

  return accum;
}, {} as Record<string, any>);

htmlComponents.code = (props: any) => {
  if (props.className != null) {
    const language = props.className.match(/language-([^\s]+)/)[1];
    let __html = hljs.highlight(language, props.children).value;
    __html = __html.replace(/class="([^"]+)"/g, (_fullMatch, className) => {
      return `class="${classNames(className)}"`;
    });
    return <code dangerouslySetInnerHTML={{ __html }} />;
  } else {
    return <code>{props.children}</code>;
  }
};

const emptyScope = {};

type Props = {
  markdown: string;
};

export default ({ markdown }: Props) => {
  const content = useContent();

  const userComponents = getComponentNames().reduce((accum, TagName) => {
    accum[TagName] = (props: any) => {
      const Component = content.component(TagName);
      return <Component {...props} />;
    };

    return accum;
  }, {} as Record<string, any>);

  const components = {
    ...htmlComponents,
    ...builtInComponents,
    ...userComponents,
  };

  return (
    <MDX components={components} scope={emptyScope}>
      {markdown}
    </MDX>
  );
};
