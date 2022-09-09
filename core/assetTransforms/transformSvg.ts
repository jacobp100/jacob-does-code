import svgo from "svgo";
import { Response } from "@miniflare/core";
import { HTMLRewriter } from "@miniflare/html-rewriter";
import { Content } from "../useContent";
import transformAsset from "./transformAsset";

export const metadata = (input: string) => {
  const { 1: attributesString, 2: __html } = input.match(
    /<svg([^>]*)>([\W\w]*)<\/svg>/m
  )!;
  const attribteEnitries = Array.from(
    attributesString.matchAll(/(\w+)="([^"]*)"/g),
    (match) => [match[1], match[2]]
  );
  const attributes: Record<string, string> =
    Object.fromEntries(attribteEnitries);

  return { attributes, __html };
};

export default async (content: Content, input: string) => {
  const rewriter = new HTMLRewriter().on("use, image", {
    async element(element) {
      const href = element.getAttribute("href");
      if (href?.startsWith("/") === true) {
        const protocol = "file://";
        const url = new URL(href, protocol);
        url.pathname = await transformAsset(content, url.pathname);
        element.setAttribute("href", String(url).slice(protocol.length));
      }
    },
  });

  let svg = await rewriter.transform(new Response(input)).text();

  if (process.env.NODE_ENV === "development") {
    return svg;
  }

  const output = svgo.optimize(svg);

  if (output.error != null) {
    throw new Error(output.error);
  }

  svg = output.data;

  return svg;
};
