import type { ScriptHTMLAttributes } from "react";
import useContent, { writeSiteAsset } from "../useContent";
import cache from "../cache";
import useTransformJs from "../useTransformJs";

const process = cache((src: string) => {
  const js = useContent().asset(src);
  const code = useTransformJs(js);
  return writeSiteAsset(code, { extension: ".js" });
});

type Props = Omit<ScriptHTMLAttributes<any>, "src"> & {
  src: string;
};

export default (props: Props) => <script {...props} src={process(props.src)} />;
