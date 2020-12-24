import { readAsset } from "../core/assets";

type Props = {
  href?: string;
  reuseSvg?: boolean;
};

export default ({ reuseSvg, href }: Props) => {
  const appStoreSvg = reuseSvg
    ? readAsset("store-badges/app-store-reused.svg")
    : readAsset("store-badges/app-store.svg");

  return (
    <a
      title="App Store"
      href={href}
      dangerouslySetInnerHTML={{ __html: appStoreSvg }}
    />
  );
};
