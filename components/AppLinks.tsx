import { className } from "../core/css";

type Props = {
  children: any;
};

export default ({ children }: Props) => {
  return <p className={className("store-links")}>{children}</p>;
};
