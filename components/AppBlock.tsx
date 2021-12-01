import * as React from "react";
import { Image, ImageSource, classNames } from "../core/core.js";
import type { ImageResize } from "../core/core.js";

const imagePositions: Record<string, ImageResize> = {
  bottom: { fit: "cover", position: "bottom" },
  "center-contain": { fit: "contain", background: "transparent" },
  DEFAULT: { fit: "cover", position: "top" },
};

export default ({ src, alt, layout, imagePosition, children }: any) => (
  <div
    className={classNames("block", layout === "reverse" && "block--reverse")}
  >
    <Image src={src} className="preview" alt={alt} resize={{ width: 1000 }}>
      <ImageSource
        src={src}
        resize={{
          width: 800,
          height: 600,
          ...(imagePositions[imagePosition] ?? imagePositions.DEFAULT),
        }}
        media="(max-width: 767px)"
      />
    </Image>
    <div className={classNames("block__content")}>{children}</div>
  </div>
);
