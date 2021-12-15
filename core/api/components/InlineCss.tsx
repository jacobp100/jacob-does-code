import * as React from "react";
import useContent from "../useContent";
import { assetTransform } from "../assetTransformer";
import { transformCss } from "../assetTransforms/assetTransforms";

const transform = assetTransform(
  (content, src) => {
    const input = Array.isArray(src)
      ? src.map(content.read).join("\n")
      : content.read(src);
    return transformCss(content, input);
  },
  {
    cacheKey: "core/InlineCss",
    encodable: true,
  }
);

type Props = {
  src: string | string[];
};

export default ({ src }: Props) => {
  const content = useContent();
  const __html = transform(content, src);
  return <style dangerouslySetInnerHTML={{ __html }} />;
};
