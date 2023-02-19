import * as path from "path";
import type { ImgHTMLAttributes, SourceHTMLAttributes } from "react";
import sharp, { ResizeOptions } from "sharp";
import { assetTransform } from "../assetTransformer";
import { ClassNames, classNames } from "../css";
import useContent from "../useContent";

type AdditionalSource = {
  src: string;
  type: string;
};

type ImageResult = {
  src: string;
  additionalSources: AdditionalSource[];
  size: { width: number; height: number };
};

const avifEnabled = false;

export const transform = assetTransform<
  ImageResult,
  [string, ResizeOptions | undefined]
>(
  async (content, input, size) => {
    const buffer = content.readBuffer(input);
    const extension = path.extname(input);

    let pipeline = sharp(buffer);

    if (size != null) {
      pipeline = pipeline.resize({ ...size, withoutEnlargement: true });
    }

    const dev = process.env.NODE_ENV === "development";

    const defaultSrcPipeline = !dev
      ? pipeline.clone().png({ force: false }).jpeg({ force: false })
      : pipeline;

    const [
      {
        info: { width, height },
        data: baseBuffer,
      },
      webpBuffer,
      avifBuffer,
    ] = await Promise.all([
      defaultSrcPipeline.toBuffer({ resolveWithObject: true }),
      !dev ? pipeline.clone().webp().toBuffer() : null,
      !dev && avifEnabled ? pipeline.clone().avif().toBuffer() : null,
    ]);

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

    return {
      src,
      additionalSources,
      size: { width, height },
    };
  },
  { cacheKey: "core/Image" }
);

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

type AutoSizeProps = {
  width?: number | "auto";
  height?: number | "auto";
};

const populateAutoSize = <T extends AutoSizeProps>(
  props: T,
  size: { width: number; height: number }
) => ({
  width: props.width === "auto" ? size.width : props.width,
  height: props.height === "auto" ? size.height : props.height,
});

type Props = Omit<ImgHTMLAttributes<any>, "className" | "width" | "height"> &
  AutoSizeProps & {
    src: string;
    className: ClassNames;
    resize?: Resize | string;
  };

export default ({ src: inputSrc, resize, children, ...props }: Props) => {
  const content = useContent();
  const resizeObj = typeof resize === "string" ? parseResize(resize) : resize;
  const { src, additionalSources, size } = transform(
    content,
    inputSrc,
    resizeObj
  );
  const { width, height } = populateAutoSize(props, size);

  const imgBase = (
    <img
      {...props}
      src={src}
      className={classNames(props.className)}
      width={width}
      height={height}
    />
  );

  return additionalSources.length > 0 || children != null ? (
    <picture>
      {children}
      {additionalSources.map(({ src, type }) => (
        <source
          key={type}
          srcSet={src}
          type={type}
          width={width}
          height={height}
        />
      ))}
      {imgBase}
    </picture>
  ) : (
    imgBase
  );
};

type ImageSourceProps = Omit<SourceHTMLAttributes<any>, "width" | "height"> &
  AutoSizeProps & {
    // srcSet: string;
    media: string;
    resize: Resize | string;
  };

export const Source = ({
  srcSet: inputSrcSet,
  resize,
  media,
  ...props
}: ImageSourceProps) => {
  const content = useContent();
  const resizeObj = typeof resize === "string" ? parseResize(resize) : resize;
  const {
    src: srcSet,
    additionalSources,
    size,
  } = transform(content, inputSrcSet!, resizeObj);
  const { width, height } = populateAutoSize(props, size);

  return (
    <>
      {additionalSources.map(({ src: srcSet, type }) => (
        <source
          key={type}
          {...props}
          srcSet={srcSet}
          type={type}
          media={media}
          width={width}
          height={height}
        />
      ))}
      <source
        {...props}
        srcSet={srcSet}
        media={media}
        width={width}
        height={height}
      />
    </>
  );
};
