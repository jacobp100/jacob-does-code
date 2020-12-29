import useContent from "../core/useContent";

type Props = {
  href?: string;
};

export default ({ href }: Props) => {
  const googlePlaySvg = useContent().asset(
    "/assets/store-badges/google-play.svg"
  );

  return (
    <a
      title="App Store"
      href={href}
      dangerouslySetInnerHTML={{ __html: googlePlaySvg }}
    />
  );
};
