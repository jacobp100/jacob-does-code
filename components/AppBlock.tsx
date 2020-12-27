import { Image } from "../core/components";
import { classNames } from "../core/css";

export default ({ src, alt, layout, imagePosition, children }: any) => (
  <div
    className={classNames("block", layout === "reverse" && "block--reverse")}
  >
    <Image
      src={src}
      className={["preview", imagePosition === "bottom" && "preview--bottom"]}
      alt={alt}
    />
    <div className={classNames("block__content")}>{children}</div>
  </div>
);
