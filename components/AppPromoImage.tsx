import { Image, ImageSource } from "jdc";

export default ({ src, alt = "App Screenshots" }: any) => (
  <Image
    src={src}
    className="promo"
    alt={alt}
    width="auto"
    height="auto"
    resize="2048w"
  >
    <ImageSource
      srcSet={src}
      media="(max-width: 767px)"
      width="auto"
      height="auto"
      resize="1024w"
    />
  </Image>
);
