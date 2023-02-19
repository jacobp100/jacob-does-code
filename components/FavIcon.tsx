import { assetTransform, useContent, imageTransform } from "jdc";

type Icons = Array<{ href: string; sizes: string }>;

const transform = assetTransform((content, icons: Icons): Icons => {
  return icons.map(({ href, sizes }) => ({
    href: content.write(content.readBuffer(href), { extension: ".png" }),
    sizes,
  }));
});

type Props = {
  href: string;
};

export default (props: Props) => {
  const content = useContent();
  const renderAtSize = (size: number | undefined) =>
    imageTransform(content, props.href, { width: size, height: size }).src;

  return (
    <>
      <link rel="icon" href={renderAtSize(16)} sizes="16x16" type="image/png" />
      <link rel="icon" href={renderAtSize(32)} sizes="32x32" type="image/png" />
      <link rel="apple-touch-icon" href={renderAtSize(undefined)} />
      {[57, 72, 76, 114, 120, 152, 180].map((size) => (
        <link
          rel="apple-touch-icon"
          sizes={`${size}x${size}`}
          href={renderAtSize(size)}
        />
      ))}
    </>
  );
};
