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
      <link rel="icon" href={renderAtSize(16)} sizes="16x16" type="image/png" />
      <link rel="icon" href={renderAtSize(32)} sizes="32x32" type="image/png" />
    </>
  );
};
