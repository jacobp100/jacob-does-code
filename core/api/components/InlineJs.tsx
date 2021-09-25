import type { ScriptHTMLAttributes } from "react";
import useContent from "../useContent";
import { assetTransform } from "../assetTransformer";
import { transformJs } from "../assetTransforms";

const transform = assetTransform(
  (content, src) => {
    const input = content.asset(src);
    return transformJs(content, input);
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
  const output = transform(content, src);
  return <script {...props} dangerouslySetInnerHTML={{ __html: output }} />;
};
