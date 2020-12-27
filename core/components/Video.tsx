import type { VideoHTMLAttributes } from "react";
import transformAsset from "../transformAsset";

type Props = VideoHTMLAttributes<any> & {
  src: string;
  type: string;
};

export default ({ src, type, ...props }: Props) => (
  <video {...props}>
    <source src={transformAsset(src)} type={type} />
  </video>
);
