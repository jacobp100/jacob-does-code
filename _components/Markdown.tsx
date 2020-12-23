// @ts-ignore
import unified from "unified";
// @ts-ignore
import parse from "remark-parse";
// @ts-ignore
import mdx from "remark-mdx";
// @ts-ignore
import squeezeParagraphs from "remark-squeeze-paragraphs";
// @ts-ignore
import smartypants from "@silvenon/remark-smartypants";
// @ts-ignore
import html from "remark-html";
// @ts-ignore
import posthtml from "posthtml";
// @ts-ignore
import renderStaticReact from "posthtml-static-react";
// @ts-ignore
import minifier from "posthtml-minifier";
import { includePath } from "../core/assets";
import * as components from ".";

const getReactComponentInclude = (name: string) => {
  // @ts-ignore
  const buildInComponent = components[name];
  if (buildInComponent != null) {
    return buildInComponent;
  }

  const modulePath = includePath(name);
  if (modulePath != null) {
    return require(modulePath).default;
  }

  return undefined;
};

const includes = new Proxy(
  {},
  {
    has: (_, component) => getReactComponentInclude(component as any) != null,
    get: (_, component) => getReactComponentInclude(component as any),
  }
);

type Props = {
  tagName?: string;
  className?: string;
  content: string;
};

export default ({ tagName: TagName = "div", className, content }: Props) => {
  let __html = unified()
    .use(parse)
    .use(mdx)
    .use(squeezeParagraphs)
    .use(smartypants)
    .use(html)
    .processSync(content)
    .toString();

  __html = __html
    // Fix self-closing tags (cause bugs in posthtml)
    .replace(/<([A-Z[A-Za-z]+)([^>]+)\/>/g, "<$1$2></$1>")
    // Fix paragraphs embedding React components
    .replace(/<p>(<[A-Z][\S\s]*?)<\/p>/gm, "$1")
    // Fix empty paragraphs
    .replace(/<p><\/p>/g, "");

  const postHtmlResult = posthtml()
    .use(renderStaticReact("", includes))
    .use(minifier({ collapseWhitespace: true }))
    .process(__html, { sync: true });
  // @ts-ignore
  __html = postHtmlResult.html;

  // @ts-ignore
  return <TagName className={className} dangerouslySetInnerHTML={{ __html }} />;
};
