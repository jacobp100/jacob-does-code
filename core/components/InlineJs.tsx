import type { ScriptHTMLAttributes } from "react";
import { readAsset } from "../assets";
import transformJs from "../transformJs";

type Props = Omit<ScriptHTMLAttributes<any>, "src"> & {
  src: string;
};

export default ({ src, ...props }: Props) => {
  const content = readAsset(src);
  const output = transformJs(content);
  return <script {...props} dangerouslySetInnerHTML={{ __html: output }} />;
};
