import classnames from "classnames";
import { Image } from "../core/components";
import { className } from "../core/css";

export default ({ src, alt, reverse, children }: any) => (
  <div
    className={classnames(
      className("block"),
      reverse != null && className("block--reverse")
    )}
  >
    <Image src={src} className={className("preview")} alt={alt} />
    <div className={className("block__content")}>{children}</div>
  </div>
);
