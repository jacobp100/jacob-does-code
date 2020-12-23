import { readAsset, writeSiteAsset } from "../core/assets";
import css from "./css";

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const input = src.split(",").map(readAsset).join("\n");
  const output = css(input);
  const href = writeSiteAsset(output, { extension: "css" });
  return <link href={href} />;
};
