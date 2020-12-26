// @ts-ignore
import unified from "unified";
// @ts-ignore
import parse from "remark-parse";
// @ts-ignore
import highlight from "remark-highlight.js";
// @ts-ignore
import squeezeParagraphs from "remark-squeeze-paragraphs";
// @ts-ignore
import smartypants from "@silvenon/remark-smartypants";
// @ts-ignore
import html from "remark-html";
import transformHtml from "../transformHtml";

type Props = {
  tagName?: string;
  className?: string;
  content: string;
};

export default ({ tagName: TagName = "div", className, content }: Props) => {
  let __html = unified()
    .use(parse)
    .use(highlight)
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

  __html = transformHtml(__html);

  // @ts-ignore
  return <TagName className={className} dangerouslySetInnerHTML={{ __html }} />;
};
