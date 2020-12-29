import useContent from "../core/useContent";

type Props = {
  href?: string;
  reuseSvg?: boolean;
};

export default ({ reuseSvg, href }: Props) => {
  const assetPath = reuseSvg
    ? "/assets/store-badges/app-store-reused.svg"
    : "/assets/store-badges/app-store.svg";
  const appStoreSvg = useContent().asset(assetPath);

  return (
    <a
      title="App Store"
      href={href}
      dangerouslySetInnerHTML={{ __html: appStoreSvg }}
    />
  );
};
