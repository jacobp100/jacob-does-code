import { readAsset } from "../core/assets";

type Props = {
  children: any;
};

export default ({ children }: Props) => {
  return <p className="store-links">{children}</p>;
};
