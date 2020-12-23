import { readAsset, writeSiteAsset } from "../core/assets";
import transformCss from "./util/transformCss";

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const input = src.split(",").map(readAsset).join("\n");
  const output = transformCss(input);
  const href = writeSiteAsset(output, { extension: ".css" });
  return <link href={href} rel="stylesheet" />;
};
