import type { ScriptHTMLAttributes } from "react";
import useContent from "../useContent";
import { cacheTransform } from "../cacheTransform";
import transformJs from "../transformJs";

const transform = cacheTransform((content, src) => {
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
