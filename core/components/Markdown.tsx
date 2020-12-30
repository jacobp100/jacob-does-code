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
import useTransformHtml from "../transformHtml";
import useContent from "../useContent";

type Props = {
  markdown: string;
};

export default ({ markdown }: Props) => {
  const content = useContent();

  let __html = unified()
    .use(parse)
    .use(highlight)
    .use(squeezeParagraphs)
    .use(smartypants)
    .use(html)
    .processSync(markdown)
    .toString();

  __html = __html
    // Fix self-closing tags (cause bugs in posthtml)
    .replace(/<([A-Z[A-Za-z]+)([^>]+)\/>/g, "<$1$2></$1>")
    // Fix paragraphs embedding React components
    .replace(/<p>(<[A-Z][\S\s]*?)<\/p>/gm, "$1")
    // Fix empty paragraphs
    .replace(/<p><\/p>/g, "");

  __html = useTransformHtml(content, __html);

  const ElementName = "ignored-tag";
  // @ts-ignore
  return <ElementName dangerouslySetInnerHTML={{ __html }} />;
};
