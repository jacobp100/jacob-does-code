import type { ImgHTMLAttributes } from "react";
import * as path from "path";
// @ts-ignore
import imagemin from "imagemin";
// @ts-ignore
import imageminJpegtran from "imagemin-jpegtran";
// @ts-ignore
import imageminPngquant from "imagemin-pngquant";
// @ts-ignore
import imageminWebp from "imagemin-webp";
import imageSize from "image-size";
import { readAssetBuffer, writeSiteAsset } from "../assets";
import cache from "../cache";
import syncPromise from "../syncPromise";
import dev from "../dev";
import { className } from "../css";

type ImageResult = {
  source: string;
  webp: string | null;
  width: number | undefined;
  height: number | undefined;
};

const process = cache<string, ImageResult>((src) => {
  const buffer = readAssetBuffer(src);
  const { width, height } = imageSize(buffer);

  if (dev) {
    const source = writeSiteAsset(buffer, {
      extension: path.extname(src),
    });
    return { source, webp: null, width, height };
  }

  const result = syncPromise(
    Promise.all([
      imagemin.buffer(buffer, {
        plugins: [
          imageminJpegtran(),
          imageminPngquant({
            quality: [0.6, 0.8],
          }),
        ],
      }),
      imagemin.buffer(buffer, {
        plugins: [imageminWebp({ quality: 50 })],
      }),
    ])
  );

  if (result.type !== "ok") {
    throw result.error ?? new Error("Unknown error");
  }

  let [sourceBuffer, webpBuffer] = result.value;

  // Check we actually making savings
  sourceBuffer = sourceBuffer.length < buffer.length ? sourceBuffer : buffer;
  webpBuffer = webpBuffer.length < sourceBuffer.length ? webpBuffer : null;

  const source = writeSiteAsset(sourceBuffer, {
    extension: path.extname(src),
  });
  const webp =
    webpBuffer != null
      ? writeSiteAsset(webpBuffer, { extension: ".webp" })
      : null;

  return { source, webp, width, height };
});

type Props = ImgHTMLAttributes<any> & {
  src: string;
};

export default ({ src, children: _, ...props }: Props) => {
  const { source, webp, width, height } = process(src);

  const imgBase = (
    <img
      src={source}
      {...props}
      className={
        props.className != null
          ? props.className.split(/\s+/).map(className).join(" ")
          : undefined
      }
      width={props.width === "compute" ? width : props.width}
      height={props.height === "compute" ? height : props.height}
    />
  );

  return webp != null ? (
    <picture>
      <source srcSet={webp} type="image/webp" />
      {imgBase}
    </picture>
  ) : (
    imgBase
  );
};
