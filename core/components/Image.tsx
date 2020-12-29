import type { ImgHTMLAttributes } from "react";
import path from "path";
import sharp from "sharp";
import useContent from "../useContent";
import cacheAssetTransform from "../cacheAssetTransform";
import { syncPromiseValue } from "../syncPromise";
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

const avifEnabled = false;

const transform = cacheAssetTransform<ImageResult>((content, inputSrc) => {
  const buffer = content.assetBuffer(inputSrc);
  const extension = path.extname(inputSrc);

  if (dev) {
    const { width, height } = syncPromiseValue(sharp(buffer).metadata());
    const src = content.write(buffer, { extension });
    return { src, additionalSources: [], width, height };
  }

  const [
    { width, height },
    baseBuffer,
    webpBuffer,
    avifBuffer,
  ] = syncPromiseValue(
    Promise.all([
      sharp(buffer).metadata(),
      sharp(buffer).png({ force: false }).jpeg({ force: false }).toBuffer(),
      sharp(buffer).webp().toBuffer(),
      // @ts-ignore
      (avifEnabled ? sharp(buffer).avif().toBuffer() : null) as Buffer | null,
    ])
  );

  // Check we actually making savings
  const srcBuffer = baseBuffer.length < buffer.length ? baseBuffer : buffer;
  const src = content.write(srcBuffer, { extension });

  const additionalSources: AdditionalSource[] = [];
  let smallestLength = srcBuffer.length;
  const addAdditionalSourceIfNeeded = (
    buffer: Buffer | null,
    extension: string,
    type: string
  ) => {
    if (buffer != null && buffer.length < smallestLength) {
      const src = content.write(buffer, { extension });
      additionalSources.unshift({ src, type });
      smallestLength = buffer.length;
    }
  };

  addAdditionalSourceIfNeeded(webpBuffer, ".webp", "image/webp");
  addAdditionalSourceIfNeeded(avifBuffer, ".avif", "image/avif");

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
  const { src, additionalSources, width, height } = transform(
    content,
    inputSrc
  );

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
