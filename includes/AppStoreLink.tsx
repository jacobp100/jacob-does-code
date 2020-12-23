import { readAsset } from "../core/assets";

type Props = {
  href?: string;
  reuseSvg?: boolean;
};

export default ({ reuseSvg, href }: Props) => {
  const appStoreSvg = readAsset("store-badges/app-store.svg");

  return reuseSvg ? (
    <a title="App Store" href={href}>
      <svg
        width="161"
        height="54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <use xlinkHref="#app-store" />
      </svg>
    </a>
  ) : (
    <a
      title="App Store"
      href={href}
      dangerouslySetInnerHTML={{ __html: appStoreSvg }}
    />
  );
};
