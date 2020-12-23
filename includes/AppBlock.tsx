import classnames from "classnames";
import { Image } from "../components";

export default ({ src, alt, reverse, children }: any) => (
  <div className={classnames("block", reverse != null && "block--reverse")}>
    <Image src={src} className="preview" alt={alt} />
    <div className="block__content">{children}</div>
  </div>
);
