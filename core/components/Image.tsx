import type { ImgHTMLAttributes } from "react";
import path from "path";
// @ts-ignore
import imagemin from "imagemin";
// @ts-ignore
import imageminJpegtran from "imagemin-jpegtran";
// @ts-ignore
import imageminPngquant from "imagemin-pngquant";
// @ts-ignore
import imageminWebp from "imagemin-webp";
import imageSize from "image-size";
import useContent, { Content } from "../useContent";
import { cache2 } from "../cache";
import syncPromise from "../syncPromise";
import { ClassNames, classNames } from "../css";
import dev from "../dev";

type ImageResult = {
  source: string;
  webp: string | null;
  width: number | undefined;
  height: number | undefined;
};

const process = cache2<Content, string, ImageResult>((content, src) => {
  const buffer = content.assetBuffer(src);
  const extension = path.extname(src);
  const { width, height } = imageSize(buffer);

  if (dev) {
    const source = content.write(buffer, { extension });
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

  const source = content.write(sourceBuffer, { extension });
  const webp =
    webpBuffer != null
      ? content.write(webpBuffer, { extension: ".webp" })
      : null;

  return { source, webp, width, height };
});

type Props = Omit<ImgHTMLAttributes<any>, "className" | "width" | "height"> & {
  src: string;
  className: ClassNames;
  width: number | "compute";
  height: number | "compute";
};

export default ({ src, children: _, ...props }: Props) => {
  const content = useContent();
  const { source, webp, width, height } = process(content, src);

  const imgBase = (
    <img
      src={source}
      {...props}
      className={classNames(props.className)}
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
