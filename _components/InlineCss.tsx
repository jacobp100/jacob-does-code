import { readAsset } from "../core/assets";
import css from "./css";

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const input = src.split(",").map(readAsset).join("\n");
  const output = css(input);
  return <style dangerouslySetInnerHTML={{ __html: output }} />;
};
