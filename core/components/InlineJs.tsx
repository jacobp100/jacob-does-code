import type { ScriptHTMLAttributes } from "react";
import useContent from "../useContent";
import transformJs from "../useTransformJs";

type Props = Omit<ScriptHTMLAttributes<any>, "src"> & {
  src: string;
};

export default ({ src, ...props }: Props) => {
  const js = useContent().asset(src);
  const output = transformJs(js);
  return <script {...props} dangerouslySetInnerHTML={{ __html: output }} />;
};
