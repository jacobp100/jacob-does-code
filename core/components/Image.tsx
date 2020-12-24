import type { ImgHTMLAttributes } from "react";
import * as path from "path";
// @ts-ignore
import deasync from "deasync";
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
import dev from "../dev";

const runImageMin = (input: Buffer, options: any): Buffer => {
  let output: Buffer | null;

  imagemin.buffer(input, options).then((res: any) => {
    output = res;
  });

  deasync.loopWhile(() => output == null);

  return output!;
};

const basePlugins = [
  imageminJpegtran(),
  imageminPngquant({
    quality: [0.6, 0.8],
  }),
];

const webpPlugins = [imageminWebp({ quality: 50 })];

type ImageResult = {
  source: Buffer;
  webp: Buffer | null;
  width: number | undefined;
  height: number | undefined;
};

const compressImages = cache<string, ImageResult>((src) => {
  const buffer = readAssetBuffer(src);
  const { width, height } = imageSize(buffer);

  if (dev) {
    return { source: buffer, webp: null, width, height };
  }

  let source = runImageMin(buffer, { plugins: basePlugins });
  let webp: Buffer | null = runImageMin(buffer, { plugins: webpPlugins });

  // Check we actually making savings
  source = source.length < buffer.length ? source : buffer;
  webp = webp.length < source.length ? webp : null;

  return { source, webp, width, height };
});

type Props = ImgHTMLAttributes<any> & {
  src: string;
};

export default ({ src, children: _, ...props }: Props) => {
  const images = compressImages(src);

  const source = writeSiteAsset(images.source, {
    extension: path.extname(src),
  });
  const webp =
    images.webp != null
      ? writeSiteAsset(images.webp, { extension: ".webp" })
      : null;

  const imgBase = (
    <img
      src={source}
      {...props}
      width={props.width === "compute" ? images.width : props.width}
      height={props.height === "compute" ? images.height : props.height}
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
