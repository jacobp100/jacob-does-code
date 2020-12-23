import { readAsset, writeSiteAsset } from "../core/assets";
import transformJs from "./util/transformJs";

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const content = readAsset(src);
  const code = transformJs(content);
  const outputSrc = writeSiteAsset(code, { extension: ".js" });
  return <script src={outputSrc} />;
};
