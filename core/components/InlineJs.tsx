import type { ScriptHTMLAttributes } from "react";
import { assetTransform } from "../assetTransformer";
import { transformJs } from "../assetTransforms";
import useContent from "../useContent";

const transform = assetTransform<string, [string, { module: boolean }]>(
  (content, src, { module }) =>
    transformJs(content, content.read(src), { module }),
  { cacheKey: "core/InlineJs" }
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
