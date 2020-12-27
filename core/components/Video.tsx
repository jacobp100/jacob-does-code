import * as path from "path";
import type { VideoHTMLAttributes } from "react";
import { readAssetBuffer, writeSiteAsset } from "../assets";
import cache from "../cache";
import { classNames, ClassNames } from "../css";

const process = cache<string, string>((src) => {
  return writeSiteAsset(readAssetBuffer(src), {
    extension: path.extname(src),
  });
});

type Props = Omit<VideoHTMLAttributes<any>, "className"> & {
  className?: ClassNames;
  src: string;
  type: string;
};

export default ({ className, src, type, ...props }: Props) => (
  <video {...props} className={classNames(className)}>
    <source src={process(src)} type={type} />
  </video>
);
