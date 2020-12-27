import classnames from "classnames";
import { Image } from "../core/components";
import { className } from "../core/css";

export default ({ src, alt, layout, imagePosition, children }: any) => (
  <div
    className={classnames(
      className("block"),
      layout === "reverse" && className("block--reverse")
    )}
  >
    <Image
      src={src}
      className={classnames(
        "preview",
        imagePosition === "bottom" && "preview--bottom"
      )}
      alt={alt}
    />
    <div className={className("block__content")}>{children}</div>
  </div>
);
