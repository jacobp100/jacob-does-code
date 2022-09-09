import { Image, ImageSource, classNames } from "jdc";
import type { ImageResize } from "jdc";

const imagePositions: Record<string, ImageResize> = {
  bottom: { fit: "cover", position: "bottom" },
  "center-contain": { fit: "contain", background: "transparent" },
  DEFAULT: { fit: "cover", position: "top" },
};

export default ({ src, alt, layout, imagePositionMobile, children }: any) => (
  <div
    className={classNames("block", layout === "reverse" && "block--reverse")}
  >
    <Image
      src={src}
      className="preview"
      alt={alt}
      resize={{ width: 1000 }}
      width="auto"
      height="auto"
    >
      <ImageSource
        srcSet={src}
        resize={{
          width: 800,
          height: 600,
          ...(imagePositions[imagePositionMobile] ?? imagePositions.DEFAULT),
        }}
        media="(max-width: 767px)"
        width="auto"
        height="auto"
      />
    </Image>
    <div className={classNames("block__content")}>{children}</div>
  </div>
);
