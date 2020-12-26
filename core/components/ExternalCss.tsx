import { readAsset, writeSiteAsset } from "../assets";
import cache from "../cache";
import transformCss from "../transformCss";

const process = cache((src: string) => {
  const input = src.split(",").map(readAsset).join("\n");
  const output = transformCss(input);
  const href = writeSiteAsset(output, { extension: ".css" });
  return href;
});

type Props = {
  src: string;
};

export default ({ src }: Props) => (
  <link href={process(src)} rel="stylesheet" />
);
