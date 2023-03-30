import { useContent, imageTransform } from "jdc";

type Props = {
  href: string;
};

export default (props: Props) => {
  const content = useContent();
  const renderAtSize = (size: number | undefined) =>
    imageTransform(content, props.href, { width: size, height: size }).src;

  return (
    <>
      <link rel="apple-touch-icon" href={renderAtSize(undefined)} />
      {[57, 72, 76, 114, 120, 152, 167, 180].map((size) => (
        <link
          key={size}
          rel="apple-touch-icon"
          sizes={`${size}x${size}`}
          href={renderAtSize(size)}
        />
      ))}
    </>
  );
};
