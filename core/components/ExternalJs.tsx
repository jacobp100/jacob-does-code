import type { ScriptHTMLAttributes } from "react";
import { readAsset, writeSiteAsset } from "../assets";
import cache from "../cache";
import transformJs from "../transformJs";

const process = cache((src: string) => {
  const content = readAsset(src);
  const code = transformJs(content);
  return writeSiteAsset(code, { extension: ".js" });
});

type Props = Omit<ScriptHTMLAttributes<any>, "src"> & {
  src: string;
};

export default (props: Props) => <script {...props} src={process(props.src)} />;
