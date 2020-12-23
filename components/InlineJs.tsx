import { readAsset } from "../core/assets";
import transformJs from "./util/transformJs";

type Props = {
  src: string;
};

export default ({ src }: Props) => {
  const content = readAsset(src);
  const output = transformJs(content);
  return <script dangerouslySetInnerHTML={{ __html: output }} />;
};
