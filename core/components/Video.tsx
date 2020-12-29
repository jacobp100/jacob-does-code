import path from "path";
import type { VideoHTMLAttributes } from "react";
import useContent, { writeSiteAsset } from "../useContent";
import { cache2 } from "../cache";
import { classNames, ClassNames } from "../css";

const process = cache2<Buffer, string, string>((buffer, src) => {
  return writeSiteAsset(buffer, { extension: path.extname(src) });
});

type Props = Omit<VideoHTMLAttributes<any>, "className"> & {
  className?: ClassNames;
  src: string;
  type: string;
};

export default ({ className, src, type, ...props }: Props) => {
  const content = useContent();
  const buffer = content.assetBuffer(src);

  return (
    <video {...props} className={classNames(className)}>
      <source src={process(buffer, src)} type={type} />
    </video>
  );
};
