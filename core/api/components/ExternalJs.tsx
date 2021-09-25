import type { ScriptHTMLAttributes } from "react";
import useContent from "../useContent";
import { assetTransform } from "../assetTransformer";
import { transformJs } from "../assetTransforms";

const transform = assetTransform(
  async (content, src) => {
    const input = content.asset(src);
    const output = await transformJs(content, input);
    return content.write(output, { extension: ".js" });
  },
  {
    cacheKey: "core/ExternalJs",
    encodable: true,
  }
);

type Props = Omit<ScriptHTMLAttributes<any>, "src"> & {
  src: string;
};

export default (props: Props) => {
  const content = useContent();
  return <script {...props} src={transform(content, props.src)} />;
};
