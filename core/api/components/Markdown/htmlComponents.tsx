import * as React from "react";
import hljs from "highlight.js";
import { classNames } from "../../css.js";
import htmlTags from "./_htmlTags.js";

const htmlComponents = htmlTags.reduce((accum, TagName) => {
  accum[TagName] = (props: any) => (
    <TagName {...props} className={classNames(props.className)} />
  );

  return accum;
}, {} as Record<string, any>);

htmlComponents.code = (props: any) => {
  if (props.className != null) {
    const language = props.className.match(/language-([^\s]+)/)[1];
    let __html = hljs.highlight(props.children, { language }).value;
    __html = __html.replace(/class="([^"]+)"/g, (_fullMatch, className) => {
      return `class="${classNames(className)}"`;
    });
    return <code dangerouslySetInnerHTML={{ __html }} />;
  } else {
    return <code>{props.children}</code>;
  }
};

export default htmlComponents;
