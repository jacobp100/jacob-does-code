import { readAsset } from "../core/assets";

type Props = {
  href?: string;
};

export default ({ href }: Props) => {
  const googlePlaySvg = readAsset("/assets/store-badges/google-play.svg");

  return (
    <a
      title="App Store"
      href={href}
      dangerouslySetInnerHTML={{ __html: googlePlaySvg }}
    />
  );
};
