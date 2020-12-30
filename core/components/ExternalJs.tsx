import type { ScriptHTMLAttributes } from "react";
import useContent from "../useContent";
import cacheAssetTransform from "../cacheAssetTransform";
import transformJs from "../transformJs";

const transform = cacheAssetTransform((content, src) => {
  const input = content.asset(src);
  const output = transformJs(content, input);
  return content.write(output, { extension: ".js" });
});

type Props = Omit<ScriptHTMLAttributes<any>, "src"> & {
  src: string;
};

export default (props: Props) => {
  const content = useContent();
  return <script {...props} src={transform(content, props.src)} />;
};
