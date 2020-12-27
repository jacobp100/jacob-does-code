import * as path from "path";
import type { VideoHTMLAttributes } from "react";
import { readAssetBuffer, writeSiteAsset } from "../assets";
import cache from "../cache";

const process = cache<string, string>((src) => {
  return writeSiteAsset(readAssetBuffer(src), {
    extension: path.extname(src),
  });
});

type Props = VideoHTMLAttributes<any> & {
  src: string;
  type: string;
};

export default ({ src, type, ...props }: Props) => (
  <video {...props}>
    <source src={process(src)} type={type} />
  </video>
);
