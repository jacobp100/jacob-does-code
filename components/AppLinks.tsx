import { className } from "../core/css";

type Props = {
  children: any;
};

export default ({ children }: Props) => (
  <p className={className("store-links")}>{children}</p>
);
