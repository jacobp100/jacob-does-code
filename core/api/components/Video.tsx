import * as React from "react";
import * as path from "path";
import type { VideoHTMLAttributes } from "react";
import useContent from "../useContent.js";
import { assetTransform } from "../assetTransformer.js";
import { classNames, ClassNames } from "../css.js";

const transform = assetTransform<string, string[]>(
  (content, src) => {
    const buffer = content.assetBuffer(src);
    return content.write(buffer, { extension: path.extname(src) });
  },
  {
    cacheKey: "core/Video",
    encodable: true,
  }
);

type Props = Omit<VideoHTMLAttributes<any>, "className"> & {
  className?: ClassNames;
  src: string;
  type: string;
};

export default ({ className, src, type, ...props }: Props) => {
  const content = useContent();

  return (
    <video {...props} className={classNames(className)}>
      <source src={transform(content, src)} type={type} />
    </video>
  );
};
