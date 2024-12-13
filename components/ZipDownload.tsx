import JSZip from "jszip";
import { assetTransform, classNames, useContent } from "../core";
import path from "path";

const transform = assetTransform<string, [string[]]>(
  async (content, files) => {
    const zip = new JSZip();
    for (const file of files) {
      zip.file(path.basename(file), content.readBuffer(file));
    }
    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    return content.write(buffer, { extension: ".zip" });
  },
  { cacheKey: "PressKit" }
);

type Props = {
  files: string[];
  className?: string | string[];
  download?: string;
  children?: any;
};

export default ({ files, className, download, children }: Props) => {
  const content = useContent();
  const zip = transform(content, files);

  return (
    <a href={zip} download={download} className={classNames(className)}>
      {children}
    </a>
  );
};
