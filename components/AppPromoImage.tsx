import * as React from "react";
import { Image, ImageSource } from "../core/core.js";

export default ({ src, alt = "App Screenshots" }: any) => (
  <Image
    src={src}
    className="promo"
    alt={alt}
    width="compute"
    height="compute"
    resize="2048w"
  >
    <ImageSource src={src} media="(max-width: 767px)" resize="1024w" />
  </Image>
);
