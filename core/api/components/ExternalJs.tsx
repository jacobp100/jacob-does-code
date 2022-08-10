import * as React from "react";
import type { ScriptHTMLAttributes } from "react";
import useContent from "../useContent";
import { assetTransform } from "../assetTransformer";
import { transformJs } from "../assetTransforms/assetTransforms";

const transform = assetTransform<string, [string, { module: boolean }]>(
  async (content, src, options) => {
    const input = content.read(src);
    const output = await transformJs(content, input, options);
    return content.write(output, { extension: ".js" });
  },
  { cacheKey: "core/ExternalJs" }
);

type Props = Omit<ScriptHTMLAttributes<any>, "src"> & {
  src: string;
};

export default (props: Props) => {
  const content = useContent();
  const module = props.type === "module";
  return <script {...props} src={transform(content, props.src, { module })} />;
};
