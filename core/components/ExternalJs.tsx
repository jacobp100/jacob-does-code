import type { ScriptHTMLAttributes } from "react";
import useContent, { Content } from "../useContent";
import { cache2 } from "../cache";
import useTransformJs from "../useTransformJs";

const process = cache2<Content, string, string>((content, src) => {
  const js = content.asset(src);
  const code = useTransformJs(js);
  return content.write(code, { extension: ".js" });
});

type Props = Omit<ScriptHTMLAttributes<any>, "src"> & {
  src: string;
};

export default (props: Props) => {
  const content = useContent();
  return <script {...props} src={process(content, props.src)} />;
};
