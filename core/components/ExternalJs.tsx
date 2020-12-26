import { readAsset, writeSiteAsset } from "../assets";
import cache from "../cache";
import transformJs from "../transformJs";

const process = cache((src: string) => {
  const content = readAsset(src);
  const code = transformJs(content);
  return writeSiteAsset(code, { extension: ".js" });
});

type Props = {
  src: string;
};

export default ({ src }: Props) => <script src={process(src)} />;
