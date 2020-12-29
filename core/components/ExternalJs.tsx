import type { ScriptHTMLAttributes } from "react";
import useContent from "../useContent";
import cacheAssetTransform from "../cacheAssetTransform";
import useTransformJs from "../useTransformJs";

const transform = cacheAssetTransform((content, src) => {
  const js = content.asset(src);
  const code = useTransformJs(js);
  return content.write(code, { extension: ".js" });
});

type Props = Omit<ScriptHTMLAttributes<any>, "src"> & {
  src: string;
};

export default (props: Props) => {
  const content = useContent();
  return <script {...props} src={transform(content, props.src)} />;
};
