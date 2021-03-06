import type { ImgHTMLAttributes } from "react";
import path from "path";
import sharp, { ResizeOptions } from "sharp";
import useContent from "../useContent";
import { cacheTransform } from "../cacheTransform";
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

const transform = cacheTransform<ImageResult>((content, input, size) => {
  const buffer = content.assetBuffer(input);
  const extension = path.extname(input);

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
});

export type Resize = ResizeOptions;

const parseResize = (resize: string): Resize | undefined => {
  if (resize.includes("x")) {
    const [w, h] = resize.split("x");
    return { width: parseInt(w, 10), height: parseInt(h, 10) };
  } else if (resize.endsWith("w")) {
    return { width: parseInt(resize, 10) };
  } else if (resize.endsWith("h")) {
    return { height: parseInt(resize, 10) };
  }
};

type Props = Omit<ImgHTMLAttributes<any>, "className" | "width" | "height"> & {
  src: string;
  className: ClassNames;
  width?: number | "compute";
  height?: number | "compute";
  resize?: Resize | string;
};

export default ({ src: inputSrc, resize, children, ...props }: Props) => {
  const content = useContent();
  const resizeObj = typeof resize === "string" ? parseResize(resize) : resize;
  const { src, additionalSources, width, height } = transform(
    content,
    inputSrc,
    resizeObj
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

  return additionalSources.length > 0 || children != null ? (
    <picture>
      {children}
      {additionalSources.map(({ src, type }) => (
        <source key={type} srcSet={src} type={type} />
      ))}
      {imgBase}
    </picture>
  ) : (
    imgBase
  );
};

type ImageSourceProps = {
  src: string;
  resize: Resize | string;
  media: string;
};

export const Source = ({ src: inputSrc, resize, media }: ImageSourceProps) => {
  const content = useContent();
  const resizeObj = typeof resize === "string" ? parseResize(resize) : resize;
  const { src, additionalSources } = transform(content, inputSrc, resizeObj);

  return (
    <>
      {additionalSources.map(({ src, type }) => (
        <source key={type} srcSet={src} type={type} media={media} />
      ))}
      <source srcSet={src} media={media} />
    </>
  );
};
