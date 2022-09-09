import type { ScriptHTMLAttributes } from "react";
import { assetTransform } from "../assetTransformer";
import { transformJs } from "../assetTransforms";
import useContent from "../useContent";

const transform = assetTransform<string, [string, { module: boolean }]>(
  async (content, src, options) => {
    const output = await transformJs(content, content.read(src), options);
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
