import * as React from "react";
import type { ScriptHTMLAttributes } from "react";
import useContent from "../useContent";
import { assetTransform } from "../assetTransformer";
import { transformJs } from "../assetTransforms/assetTransforms";

const transform = assetTransform<string, [string, { module: boolean }]>(
  (content, src, options) => {
    const input = content.read(src);
    return transformJs(content, input, options);
  },
  {
    cacheKey: "core/InlineJs",
    encodable: true,
  }
);

type Props = Omit<ScriptHTMLAttributes<any>, "src"> & {
  src: string;
};

export default ({ src, ...props }: Props) => {
  const content = useContent();
  const module = props.type === "module";
  const output = transform(content, src, { module });
  return <script {...props} dangerouslySetInnerHTML={{ __html: output }} />;
};
