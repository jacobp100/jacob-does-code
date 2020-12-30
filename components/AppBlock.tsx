import { Image } from "../core/components";
import { classNames } from "../core/css";

const imagePositions: Record<string, string | undefined> = {
  bottom: "preview--bottom",
  "center-contain": "preview--center-contain",
};

export default ({ src, alt, layout, imagePosition, children }: any) => (
  <div
    className={classNames("block", layout === "reverse" && "block--reverse")}
  >
    <Image
      src={src}
      className={[
        "preview",
        imagePosition != null ? imagePositions[imagePosition] : undefined,
      ]}
      alt={alt}
      width="compute"
      height="compute"
      resize={{ width: 1000 }}
    />
    <div className={classNames("block__content")}>{children}</div>
  </div>
);
