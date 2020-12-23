import { readAsset, writeSiteAsset } from "../core/assets";
import js from "./util/js";

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const content = readAsset(src);
  const code = js(content);
  const outputSrc = writeSiteAsset(code, { extension: "js" });
  return <script src={outputSrc} />;
};
