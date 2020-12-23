import { readAsset } from "../core/assets";
import js from "./util/js";

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const content = readAsset(src);
  const output = js(content);
  return <script dangerouslySetInnerHTML={{ __html: output }} />;
};
