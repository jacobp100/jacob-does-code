import type { ImgHTMLAttributes } from "react";
import path from "path";
import sharp from "sharp";
import useContent from "../useContent";
import cacheAssetTransform from "../cacheAssetTransform";
import syncPromise from "../syncPromise";
import { ClassNames, classNames } from "../css";
import dev from "../dev";

type AdditionalSource = {
  src: string;
  type: string;
};

type ImageResult = {
  src: string;
  additionalSources: AdditionalSource[];
  width: number | undefined;
  height: number | undefined;
};

const process = cacheAssetTransform<ImageResult>((content, inputSrc) => {
  const buffer = content.assetBuffer(inputSrc);
  const extension = path.extname(inputSrc);

  if (dev) {
    const result = syncPromise(sharp(buffer).metadata());
    const metadata = result.type === "ok" ? result.value : undefined;
    const width = metadata?.width;
    const height = metadata?.height;
    const src = content.write(buffer, { extension });
    return { src, additionalSources: [], width, height };
  }

  const result = syncPromise(
    Promise.all([
      sharp(buffer).metadata(),
      sharp(buffer).png({ force: false }).jpeg({ force: false }).toBuffer(),
      sharp(buffer).webp({ lossless: true }).toBuffer(),
      // sharp(buffer).avif({ lossless: true, speed: 3 }).toBuffer(),
    ])
  );

  if (result.type !== "ok") {
    throw result.error ?? new Error("Unknown error");
  }

  let [metadata, srcBuffer, webpBuffer /*, avifBuffer */] = result.value;

  const { width, height } = metadata;

  // Check we actually making savings
  srcBuffer = srcBuffer.length < buffer.length ? srcBuffer : buffer;
  const src = content.write(srcBuffer, { extension });

  const additionalSources: AdditionalSource[] = [];
  let smallestLength = srcBuffer.length;
  const addAdditionalSourceIfNeeded = (
    buffer: Buffer,
    extension: string,
    type: string
  ) => {
    if (buffer.length < smallestLength) {
      const src = content.write(buffer, { extension });
      additionalSources.unshift({ src, type });
      smallestLength = buffer.length;
    }
  };

  addAdditionalSourceIfNeeded(webpBuffer, ".webp", "image/webp");
  // addAdditionalSourceIfNeeded(avifBuffer, ".avif", "image/avif");

  return { src, additionalSources, width, height };
});

type Props = Omit<ImgHTMLAttributes<any>, "className" | "width" | "height"> & {
  src: string;
  className: ClassNames;
  width: number | "compute";
  height: number | "compute";
};

export default ({ src: inputSrc, children: _, ...props }: Props) => {
  const content = useContent();
  const { src, additionalSources, width, height } = process(content, inputSrc);

  const imgBase = (
    <img
      src={src}
      {...props}
      className={classNames(props.className)}
      width={props.width === "compute" ? width : props.width}
      height={props.height === "compute" ? height : props.height}
    />
  );

  return additionalSources.length > 0 ? (
    <picture>
      {additionalSources.map(({ src, type }) => (
        <source key={type} srcSet={src} type={type} />
      ))}
      {imgBase}
    </picture>
  ) : (
    imgBase
  );
};
