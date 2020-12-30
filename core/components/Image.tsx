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

const transform = cacheAssetTransform<ImageResult>(
  (content, inputSrc, size) => {
    const buffer = content.assetBuffer(inputSrc);
    const extension = path.extname(inputSrc);

    let pipeline = sharp(buffer);

    if (size != null) {
      pipeline = pipeline.resize({ ...size, withoutEnlargement: true });
    }

    const basePipeline = !dev
      ? pipeline.png({ force: false }).jpeg({ force: false })
      : pipeline;
    const {
      info: { width, height },
      data: baseBuffer,
    } = syncPromiseValue(basePipeline.toBuffer({ resolveWithObject: true }));

    // Check we actually making savings
    const srcBuffer = baseBuffer.length < buffer.length ? baseBuffer : buffer;
    const src = content.write(srcBuffer, { extension });

    const [webpBuffer, avifBuffer] = syncPromiseValue(
      Promise.all([
        !dev ? pipeline.webp().toBuffer() : null,
        (!dev && avifEnabled
          ? // @ts-ignore
            pipeline.avif().toBuffer()
          : null) as Buffer | null,
      ])
    );

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
  }
);

type Props = Omit<ImgHTMLAttributes<any>, "className" | "width" | "height"> & {
  src: string;
  className: ClassNames;
  width?: number | "compute";
  height?: number | "compute";
  size?: string | { width?: number; height?: number };
};

const parseSize = (size: string) => {
  if (size.includes("x")) {
    const [w, h] = size.split("x");
    return { width: parseInt(w, 10), height: parseInt(h, 10) };
  } else if (size.endsWith("w")) {
    return { width: parseInt(size, 10), height: undefined };
  } else if (size.endsWith("h")) {
    return { width: undefined, height: parseInt(size, 10) };
  }
};

export default ({ src: inputSrc, size, children: _, ...props }: Props) => {
  const content = useContent();

  const sizeObj = typeof size === "string" ? parseSize(size) : size;

  const { src, additionalSources, width, height } = transform(
    content,
    inputSrc,
    sizeObj
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
