import { readAsset } from "../core/assets";
import transformCss from "./util/transformCss";

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const input = src.split(",").map(readAsset).join("\n");
  const output = transformCss(input);
  return <style dangerouslySetInnerHTML={{ __html: output }} />;
};
