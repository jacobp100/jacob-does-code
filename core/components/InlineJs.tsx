import type { ScriptHTMLAttributes } from "react";
import useContent from "../useContent";
import cacheAssetTransform from "../cacheAssetTransform";
import transformJs from "../transformJs";

const transform = cacheAssetTransform((content, src) => {
  const input = content.asset(src);
  return transformJs(content, input);
});

type Props = Omit<ScriptHTMLAttributes<any>, "src"> & {
  src: string;
};

export default ({ src, ...props }: Props) => {
  const content = useContent();
  const output = transform(content, src);
  return <script {...props} dangerouslySetInnerHTML={{ __html: output }} />;
};
